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
import {
  findByUsername,
  fastUserCount,
  insertUser,
  readUserCoin,
} from "./dbop.js";
import { sample_chart, renderChart } from "./renderchart.js";
import TelegramBot from "node-telegram-bot-api";
import { print } from "./misc/print.js";
import { fetchAllMarket, getTicker } from "./upbit.js";
import { startAlarm } from "./alarm.js";

// .env 사용하기
dotenv.config();
// 텔레그램 토큰
const token = process.env.TELEGRAM_BOT_TOKEN;
// 텔레그램 봇 인스턴스
const bot = new TelegramBot(token, { polling: true });
// 최대 사용자 인원
const max_user_quota = 4;

// 봇체크
bot.getMe().then((info) => {
  print(`${info.first_name} is ready, the botname is @${info.username}`);
});

// 봇 체크 완료되면 지표알람 무한루틴 바로 시작
startAlarm();

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
  const startOptions = {
    reply_markup: JSON.stringify({
      keyboard: [
        ["📈 현재가조회", "➕ 코인선택"],
        ["⚙ 메뉴7번", "❔ 메뉴8번"],
        ["📋 공지사항"],
        ["💰 따뜻한 후원"],
      ],
    }),
    parse_mode: "html",
    disable_web_page_preview: true,
  };
  bot.sendMessage(chatId, welcome_message, startOptions);
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

// 키보드 팝업 메뉴 처리
bot.on("message", async (msg) => {
  // ["📈 현재가조회", "➕ 코인선택"],
  //       ["⚙ 메뉴7번", "❔ 메뉴8번"],
  //       ["📋 공지사항"],
  //       ["💰 따뜻한 후원"],

  switch (msg.text) {
    case "📈 현재가조회": {
      const data = await readUserCoin(msg.chat.id);
      const coinArr = data.coin.split(",");
      const coinCallback = [];
      for (let key in coinArr) {
        const coinSymbol = coinArr[key];
        coinCallback.push({
          text: coinSymbol,
          callback_data: `getTicker,${coinSymbol}`,
        });
      }
      const opts = {
        reply_to_message_id: msg.message_id,
        reply_markup: JSON.stringify({
          inline_keyboard: [coinCallback],
        }),
      };
      bot.sendMessage(msg.chat.id, "조회할 코인을 선택하세요", opts);
      break;
    }
    case "➕ 코인선택": {
    //   const opts = {
    //     reply_to_message_id: msg.message_id,
    //     reply_markup: JSON.stringify({
    //       inline_keyboard: [coinCallback],
    //     }),
    //   };
    //   const data = await readUserCoin(msg.chat.id);
    //   const coinArr = data.coin.split(",");
    //   break;
    // }
    // case "📋 공지사항":
    //   print("공지사항");
    //   break;
    }
    case "💰 따뜻한 후원": {
      const userFirstName = msg.chat.first_name;
      const userLastName = msg.chat.last_name;
      const userFullName =
        userLastName === undefined
          ? userFirstName
          : userLastName + " " + userFirstName;
      const donationMessage = `${userFullName}님 후원해 주시려는 마음 감사합니다. 넉넉치 못한 환경에서 봇을 제작하게 되어 서비스가 안정적이지 못한 것이 사실입니다. 소중한 후원은 서버유지비용에 보태어 더 안정적인 서비스를 제공하도록 노력하겠습니다. 아래 몇가지 코인으로 후원이 가능합니다. 감사합니다. 🧑🏻`;
      const opts = {
        reply_to_message_id: msg.message_id,
        reply_markup: JSON.stringify({
          inline_keyboard: [
            [
              {
                text: "스텔라루멘으로 후원",
                callback_data: "donation_xlm",
              },
            ],
            [
              {
                text: "리플로 후원",
                callback_data: "donation_xrp",
              },
            ],
            [
              {
                text: "이오스로 후원",
                callback_data: "donation_eos",
              },
            ],
          ],
        }),
      };
      bot.sendMessage(msg.chat.id, donationMessage, opts);
      break;
    }
    default:
      break;
  }
});

// 인라인 키보드 콜백처리
bot.on("callback_query", async (query) => {
  const callbackData = query.data;
  const chatid = query.message.chat.id;
  const messageid = query.message.message_id;
  switch (callbackData) {
    case "userChooseCoin": {
      break;
    }
    case "donation_xlm": {
      const message = `스텔라루멘 후원 주소는\n${process.env.DONATION_XLM_ADDRESS}\n\n메모는\n${process.env.DONATION_XLM_MEMO}\n입니다. 감사합니다. `;
      await updateDonateMessage(query, message);
      break;
    }
    case "donation_xrp": {
      const message = `리플 후원 주소는\n${process.env.DONATION_XRP_ADDRESS}\n\n태그는\n${process.env.DONATION_XRP_TAG}\n입니다. 감사합니다. `;
      await updateDonateMessage(query, message);
      break;
    }
    case "donation_eos": {
      const message = `이오스 후원 주소는\n${process.env.DONATION_EOS_ADDRESS}\n\n메모는\n${process.env.DONATION_EOS_MEMO}\n입니다. 감사합니다. `;
      await updateDonateMessage(query, message);
      break;
    }
    default: {
      // 현재가 조회는 콤마 뒤에 마켓이름 딸려옴
      if (callbackData.includes("getTicker")) {
        const coinSymbol = callbackData.split(",")[1];
        const tickerData = await getTicker(coinSymbol);
        const tickerMessage = `${tickerData[0].market} 현재가격 : ${tickerData[0].trade_price} 원입니다.\n`;
        // await bot.sendMessage(chatid, tickerMessage);
        const keyboard = {
          inline_keyboard: [
            [
              { text: "text 1", callback_data: "1" },
              { text: "text 2", callback_data: "2" },
              { text: "text 3", callback_data: "3" },
            ],
          ],
        };
        const opts = {
          chat_id: chatid,
          message_id: messageid,
          reply_markup: keyboard,
        };
        await bot.editMessageText(tickerMessage, opts);
      }
      break;
    }
  }
  // const opts = {
  //   reply_to_message_id: query.message_id,
  //   reply_markup: JSON.stringify({
  //     inline_keyboard: [
  //       [
  //         { text: "Click ME2!", callback_data: "click2" },
  //         {
  //           text: "Click ME1!",
  //           callback_data: "click1",
  //         },
  //       ],
  //     ],
  //   }),
  // };
  // bot.answerCallbackQuery(query.id, "OK, here you go!", opts);
});

// 후원 공통되는 부분 - 메세지 업데이트하면서 인라인 키보드 유지
const updateDonateMessage = async (query, messageString) => {
  const chatid = query.message.chat.id;
  const messageid = query.message.message_id;
  const opts = {
    // 콜백쿼리에서 editMessageText 할때는 chat_id와 message_id가 필수
    chat_id: chatid,
    message_id: messageid,
    reply_markup: JSON.stringify({
      inline_keyboard: [
        [
          {
            text: "스텔라루멘으로 후원",
            callback_data: "donation_xlm",
          },
        ],
        [
          {
            text: "리플로 후원",
            callback_data: "donation_xrp",
          },
        ],
        [
          {
            text: "이오스로 후원",
            callback_data: "donation_eos",
          },
        ],
      ],
    }),
  };
  await bot.editMessageText(messageString, opts);
  await bot.answerCallbackQuery(query.id, { text: "감사합니다" });
};

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
              label: "MACD 선",
              data: macdArray,
              borderColor: "rgb(68, 166, 245)",
            },
            {
              label: "SIGNAL 선",
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
              text: `${signalData.coin} / ${signalData.timeframe} 분봉`,
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
