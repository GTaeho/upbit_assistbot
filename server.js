/*
 _______ _______ _______ _     _  _____  _______  _____  _______ _______
    |    |_____| |______ |_____| |     | |______ |     | |______    |   
    |    |     | |______ |     | |_____| ______| |_____| |          | 

  ** 2022 - 태호소프트 제작
  ** Github repository : https://github.com/GTaeho/upbit_assistbot
*/

/* 
node-telegram-bot-api deprecated Automatic enabling of cancellation of promises is deprecated.
In the future, you will have to enable it yourself.
See https://github.com/yagop/node-telegram-bot-api/issues/319. node:internal\modules\cjs\loader:1101:14
메세지 끄기 -> 켜면 오류뜨고 2번씩 실행이 됨. 주석처리하면 오류메시지는 뜨고 실행은 한번만 됨.
*/
// process.env.NTBA_FIX_319 = 1;

import dotenv from "dotenv";
import { findByID, fastIDCount, insertUser } from "./dbop.js";
import { renderChart } from "./renderchart.js";
import TelegramBot from "node-telegram-bot-api";

// .env 사용하기
dotenv.config();
// 텔레그램 토큰
const token = process.env.TELEGRAM_BOT_TOKEN;
// 텔레그램 봇 인스턴스
const bot = new TelegramBot(token, { polling: true });
// 최대 사용자 인원
const max_user_quota = 10;

// 봇체크
bot.getMe().then((info) => {
  console.log(`${info.first_name} is ready, the botname is @${info.username}`);
});

// /start 입력 받을 때
bot.onText(/\/start/, async (msg) => {
  const usercount = await fastIDCount();
  // console.log("usercount : " + usercount);

  const chatId = msg.chat.id;
  // const newUser = msg.new_chat_members;
  const userFirstName = msg.chat.first_name;
  const userLastName = msg.chat.last_name;
  const userFullName =
    userLastName === undefined
      ? userFirstName
      : userLastName + " " + userFirstName;
  const userName = msg.chat.username;
  const messageText = msg.text || "no text";
  const lastDateOfCommand = msg.date;

  /**
   * new Date(msg.date * 1000) = 현재 날짜 시간 출력. new Date() 붙이려면 1000을 꼭 곱해야 한다.
   * msg.data * 1000 일때 1000이 1초. 계산에 1000이 꼭 필요한건 아니니 1000은 제거.
   * 그러면 msg.data 자체 일때는 1초가 1. 이 때 하루는 86400초. 일주일은 604800이다.
   * db에서 lastcmd가 604800 이상 차이나면 일주일간 접속 기록이 없는것이다.
   */
  const lastCommand = msg.date;

  // 정원이 다 찼을 때
  if (usercount >= max_user_quota) {
    const sorrymsg = `${userFullName} 님 죄송합니다. 최대인원정원이 다 찼습니다.
      원활한 서비스를 위해 어쩔수 없이 정원을 두게 되어 죄송합니다.
      경제적 여건이 허락한다면 서버를 더 늘려 더 많은 분들을 모시면 하는 바람입니다.
      봇에 대한 문의나 기타 코인관련 이야기는 https://t.me/talkaboutcoins`;
    bot.sendMessage(chatId, sorrymsg, commandOptions);
    return; // 정원이 다 차면 여기서 리턴하고 함수 종료

    // 정원이 다 차지 않았을 때
  } else {
    let result = await findByID(userName);
    if (result === "nomatch") {
      // db에 없는 경우, 신규추가 대상
      result = await insertUser(
        userName,
        userFullName,
        chatId,
        messageText,
        lastDateOfCommand
      );
      if (result == "ok") {
        console.log(userName, "become a member");
      }
    }

    // 신규가입이든 기존회원이든 환영메세지는 출력
    const welcome_message = `안녕하세요 ${userFullName}님. 오늘도 성공투자하세요!`;
    const commandOptions = {
      reply_markup: JSON.stringify({
        keyboard: [
          ["📋 메뉴1번"],
          ["📈 메뉴2번", "➕ 메뉴3번"],
          ["▶️ 메뉴4번", "⏸ 메뉴5번", "❌ 메뉴6번"],
          ["⚙ 메뉴7번", "❔ 메뉴8번"],
        ],
      }),
      parse_mode: "html",
      disable_web_page_preview: true,
    };

    bot.sendMessage(chatId, welcome_message, commandOptions);
  }
});

bot.onText(/\/coin/, async (msg) => {});

bot.onText(/\/timeframe/, async (msg) => {});

bot.onText(/\/ta/, async (msg) => {});

bot.onText(/\/lab/, async (msg) => {});

bot.onText(/\/image/, async (msg) => {
  const opts = {
    reply_to_message_id: msg.message_id,
    // reply_markup: JSON.stringify({
    //   keyboard: [
    //     ["Yes, you are the bot of my life ❤"],
    //     ["No, sorry there is another one..."],
    //   ],
    // }),
  };
  const chatId = msg.chat.id;
  const buffer = await sample_chart();
  bot.sendPhoto(chatId, buffer, {}, opts);
});

// // 모든 메세지를 받아서 DB에 업데이트
// bot.on("message", function (msg) {
//   const lastDateOfCommand = new Date(msg.date * 1000);
//   const userName = msg.chat.username || "no username provided";
//   const chatId = msg.chat.id;
//   const userFirstName = msg.chat.first_name;
//   const userLastName = msg.chat.last_name;
//   const userFullname =
//     userLastName === undefined
//       ? userFirstName
//       : userLastName + " " + userFirstName;
//   const messageId = msg.message_id;
//   const messageText = msg.text || "no text";
// });

export const sendPhoto = async (chatid, ta) => {
  const buffer = undefined;
  switch (ta) {
    case "macdco":
      buffer = await renderChart();
      break;
    case "macdcu":
      break;
    case "macdcozero":
      break;
    case "macdcuzero":
      break;
    case "rsicu":
      break;
    case "rsieos":
      break;
    case "rsibrov50":
      break;
    case "rsibrdn50":
      break;
    case "rsiobco":
      break;
    case "rsiobcu":
      break;
    default:
      break;
  }
  if (buffer != undefined) {
    bot.sendPhoto(chatid, buffer, {});
  }
};
