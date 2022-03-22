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
import { findByUsername, fastUserCount, insertUser } from "./dbop.js";
import { sample_chart, renderChart } from "./renderchart.js";
import TelegramBot from "node-telegram-bot-api";
import { print } from "./misc/print.js";
import { fetchAllMarket } from "./upbit.js";

// .env 사용하기
dotenv.config();
// 텔레그램 토큰
const token = process.env.GOLDENGATE_BOT_TOKEN;
// 텔레그램 봇 인스턴스
const bot = new TelegramBot(token, { polling: true });
// 최대 사용자 인원
const max_user_quota = 4;

// 봇체크
bot.getMe().then((info) => {
  print(`${info.first_name} is ready, the botname is @${info.username}`);
});

// /start 입력 받을 때
bot.onText(/\/start/, async (msg) => {
  const usercount = await fastUserCount();
  // print("usercount : " + usercount);

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
  /**
   * new Date(msg.date * 1000) = 현재 날짜 시간 출력. new Date() 붙이려면 1000을 꼭 곱해야 한다.
   * msg.data * 1000 일때 1000이 1초. 계산에 1000이 꼭 필요한건 아니니 1000은 제거.
   * 그러면 msg.data 자체 일때는 1초가 1. 이 때 하루는 86400초. 일주일은 604800이다.
   * db에서 lastcmd가 604800 이상 차이나면 일주일간 접속 기록이 없는것이다.
   */
  const lastCommandTimestamp = msg.date;

  // DB에서 유저네임으로 사용자 찾기
  let result = await findByUsername(userName);
  if (result === "nomatch") {
    // 정원이 다 찼을 때
    if (usercount >= max_user_quota) {
      const sorrymsg = `${userFullName} 님 죄송합니다. 최대인원정원이 다 찼습니다.
        원활한 서비스를 위해 어쩔수 없이 정원을 두게 되었습니다.
        경제적 여건이 허락한다면 서버를 더 늘려 더 많은 분들을 모시면 하는 바람입니다.
        봇에 대한 문의나 기타 코인관련 이야기는 https://t.me/talkaboutcoins`;
      bot.sendMessage(chatId, sorrymsg);
      return; // 정원이 다 차면 여기서 리턴하고 함수 종료

      // 정원이 다 차지 않았을 때
    } else {
      // db에 없는 경우, 신규추가 대상
      result = await insertUser(
        userName,
        userFullName,
        chatId,
        messageText,
        lastCommandTimestamp
      );

      if (result == "ok") {
        print(`신규유저 ${userFullName} 추가 완료`);
      }
    }
  }

  // 정원이 다 안찼거나 다 찼어도 기존 유저는 환영메세지
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
});

bot.onText(/\/coin/, async (msg) => {
  const allMarketSymbols = await fetchAllMarket();
  // print(JSON.stringify(allMarketSymbols));
  let krwMarketArr = [];
  let marketArr = [];
  for (let i = 0, mlen = allMarketSymbols.length; i < mlen; i++) {
    if (allMarketSymbols[i].market.includes("KRW")) {
      krwMarketArr.push(allMarketSymbols[i]);
    }
  }
  print(krwMarketArr.length);
  for (let i = 0, klen = krwMarketArr.length; i + 4 < klen; i += 4) {
    marketArr.push([
      {
        text: krwMarketArr[i].korean_name,
        callback_data: krwMarketArr[i].market,
      },
      {
        text: krwMarketArr[i + 1].korean_name,
        callback_data: krwMarketArr[i + 1].market,
      },
      {
        text: krwMarketArr[i + 2].korean_name,
        callback_data: krwMarketArr[i + 2].market,
      },
      {
        text: krwMarketArr[i + 3].korean_name,
        callback_data: krwMarketArr[i + 3].market,
      },
    ]);
  }
  const opts = {
    reply_to_message_id: msg.message_id,
    reply_markup: JSON.stringify({
      inline_keyboard: marketArr,
    }),
  };
  bot.sendMessage(msg.chat.id, "Select One", opts);
});

bot.onText(/\/timeframe/, async (msg) => {});

bot.onText(/\/ta/, async (msg) => {});

bot.onText(/\/lab/, async (msg) => {
  const opts = {
    reply_to_message_id: msg.message_id,
    reply_markup: JSON.stringify({
      inline_keyboard: [
        [
          { text: "Click ME1!", callback_data: "click1" },
          {
            text: "Click ME2!",
            callback_data: "click2",
          },
        ],
      ],
    }),
  };
  bot.sendMessage(msg.chat.id, "Select One", opts);
});

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

bot.on("callback_query", (msg) => {
  const callbackData = msg.data;
  switch (callbackData) {
    case "click1":
      print("click1");
      break;
    case "click2":
      print("click2");
      break;
  }
  const opts = {
    reply_to_message_id: msg.message_id,
    reply_markup: JSON.stringify({
      inline_keyboard: [
        [
          { text: "Click ME2!", callback_data: "click2" },
          {
            text: "Click ME1!",
            callback_data: "click1",
          },
        ],
      ],
    }),
  };
  bot.answerCallbackQuery(msg.id, "OK, here you go!", opts);
});

// 사용자에게 차트 보내기
// const signalData = {
//   chatid: chatid,
//   coin: coin,
//   timeframe: timeframe,
//   taSymbol: taResult.signalType,
//   labels: taResult.xdata,
//   data: taResult.data,
// };
export const sendChart = async (signalData) => {
  switch (signalData.taSymbol) {
    case "macdco": {
      // print(signalData.data.length);
      let macdArray = [];
      let macdSignalArray = [];
      for (let i = 0, siglen = signalData.data.length; i < siglen; i++) {
        // 소수점 아래로 2자리까지만 고정
        macdArray.push(signalData.data[i].MACD.toFixed(2));
        macdSignalArray.push(signalData.data[i].signal.toFixed(2));
      }

      const chartConfigurations = {
        type: "line",
        data: {
          labels: signalData.labels,
          datasets: [
            {
              label: "MACD Line",
              data: macdArray,
              borderColor: "rgb(68, 166, 245)",
            },
            {
              label: "SIGNAL Line",
              data: macdSignalArray,
              borderColor: "rgb(255, 124, 26)",
            },
          ],
        },
        options: {
          plugins: {
            title: {
              color: "black",
              display: true,
              text: `${signalData.coin} / ${signalData.timeframe} Minute`,
            },
          },
        },
      };
      const Opts = {
        reply_to_message_id: signalData.chatid,
        // reply_markup: JSON.stringify({
        //   keyboard: [
        //     ["Yes, you are the bot of my life ❤"],
        //     ["No, sorry there is another one..."],
        //   ],
        // }),
      };
      const buffer = await renderChart(chartConfigurations);
      await bot.sendPhoto(signalData.chatid, buffer, {}, Opts);
      break;
    }

    case "macdcu": {
      // print(signalData.data.length);
      let macdArray = [];
      let macdSignalArray = [];
      for (let i = 0, siglen = signalData.data.length; i < siglen; i++) {
        // 소수점 아래로 2자리까지만 고정
        macdArray.push(signalData.data[i].MACD.toFixed(2));
        macdSignalArray.push(signalData.data[i].signal.toFixed(2));
      }

      const chartConfigurations = {
        type: "line",
        data: {
          labels: signalData.labels,
          datasets: [
            {
              label: "MACD Line",
              data: macdArray,
              borderColor: "rgb(68, 166, 245)",
            },
            {
              label: "SIGNAL Line",
              data: macdSignalArray,
              borderColor: "rgb(255, 124, 26)",
            },
          ],
        },
        options: {
          plugins: {
            title: {
              color: "black",
              display: true,
              text: `${signalData.coin} / ${signalData.timeframe} Minute`,
            },
          },
          // layout: { padding: { left: 50 } },
        },
      };

      const Opts = {
        reply_to_message_id: signalData.chatid,
        // reply_markup: JSON.stringify({
        //   keyboard: [
        //     ["Yes, you are the bot of my life ❤"],
        //     ["No, sorry there is another one..."],
        //   ],
        // }),
      };
      const buffer = await renderChart(chartConfigurations);
      await bot.sendPhoto(signalData.chatid, buffer, {}, Opts);
      break;
    }
    case "macdcozero": {
      break;
    }

    case "macdcuzero": {
      break;
    }

    case "rsicu": {
      break;
    }

    case "rsieos": {
      break;
    }

    case "rsibrov50": {
      break;
    }

    case "rsibrdn50": {
      break;
    }

    case "rsiobco": {
      break;
    }

    case "rsiobcu": {
      break;
    }

    default:
      break;
  }
};

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
