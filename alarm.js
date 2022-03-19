/*

 _______ _______ _______ _     _  _____  _______  _____  _______ _______
    |    |_____| |______ |_____| |     | |______ |     | |______    |   
    |    |     | |______ |     | |_____| ______| |_____| |          | 

  ** 2022 - 태호소프트 제작
  ** Github repository : https://github.com/GTaeho/upbit_assistbot
*/

import ta from "technicalindicators";
import { sendPhoto } from "./server.js";
import { createCoinMarketTable, insertCoinData, lookupUCCTByTF } from "./dbop.js";
import { fetchRawUpbitCoinData, raw_sample_data } from "./upbit.js";

export const startAlarm = () => {
  let prev_minute = 99;
  setInterval(async () => {
    const date = new Date();
    const minute_now = date.getMinutes();

    // 매 분마다 실행
    if (minute_now !== prev_minute) {
      prev_minute = minute_now;

      // 업비트에서 KRW-BTC 가격가져오기
      const data = await raw_sample_data();
      const macdInput = {
        values: data,
        fastPeriod: 12,
        slowPeriod: 26,
        signalPeriod: 9,
        SimpleMAOscillator: false,
        SimpleMASignal: false,
      };
      let result = ta.macd(macdInput);
      // console.log(result[result.length - 5]);
      // console.log(result[result.length - 4]);
      // console.log(result[result.length - 3]);
      console.log(result[result.length - 2]); // 방금 종료된 이전 봉
      console.log(result[result.length - 1]); // 지금 막 시작된 움직이는 봉
      console.log("-------------------------");

      /**
       * for loop 을 돌 때는 성능을 위해서는 클래식 for loop 에 사이즈가 정해진것이 가장 빠르다.
       * https://medium.com/tech-tajawal/loops-performances-in-node-js-9fbccf2d6aa6 을 참고
       */

      // username, chatid, coin, timeframe 받아와서 정리하기
      // [ { username: prid77, chatid: 447679971, coin: 'KRW-BTC', timeframe: '5' } ] 이런 형식
      const rows = await lookupUCCTByTF("1");
      if (rows !== undefined) {
        let marketArray = [];
        // for loop 성능을 위해서는 아래 형식이 가장 낫다.
        for (let i = 0, rowsLen = rows.length; i < rowsLen; i++) {
          const username = rows[i]["username"];
          const chatid = rows[i]["chatid"];
          const coin = rows[i]["coin"];
          if (marketArray.length != 0) {
            for (let j = 0, arrlen = marketArray.length; j < arrlen; j++) {
              if (marketArray[j] == coin) {
                console.log(marketArray[j]);
                break;
              }
            }
          }
          const ta = rows[i]["ta"];
          sendPhoto(chatid, ta);
        }
      }

      // 매 3분마다 실행
      if (minute_now % 3 === 0) {
        const rows = await lookupUCCTByTF("3");
        if (rows !== undefined) {
        }
      }

      // 매 5분마다 실행
      if (minute_now % 5 === 0) {
        // username, chatid, coin, ta 리턴
        const rows = await lookupUCCTByTF("5");
        if (rows !== undefined) {
          console.log(rows);
          // for loop 성능을 위해서는 아래 형식이 가장 낫다.
          for (let i = 0, arrlen = rows.length; i < arrlen; i++) {
            const username = rows[i]["username"];
            const chatid = rows[i]["chatid"];
            const coin = rows[i]["coin"];
            const ta = rows[i]["ta"];
            await createCoinMarketTable(coin);
            const coindata = await fetchRawUpbitCoinData(coin, "5");
            insertCoinData(coin, coindata);
          }
        }
        console.log("create and insert done");
      }

      // 매 10분마다 실행
      if (minute_now % 10 === 0) {
        const rows = await lookupUCCTByTF("10");
        if (rows !== undefined) {
          for (let i = 0, rowsLen = rows.length; i < rowsLen; i++) {
            const username = rows[i]["username"];
            const chatid = rows[i]["chatid"];
            const coin = rows[i]["coin"];
            if (marketArray.length != 0) {
              let found = undefined;
              for (let j = 0, arrlen = marketArray.length; j < arrlen; j++) {
                if (marketArray[j] == coin) {
                  console.log(marketArray[j]);
                  found = marketArray[j];
                  break;
                }
              }
              if (found != undefined) {
                console.log(found);
              }
            } else {
              marketArray.push(coin);
            }
            const ta = rows[i]["ta"];
            sendPhoto(chatid, ta);
          }
        }
      }

      // 매 30분마다 실행
      if (minute_now % 30 === 0) {
        const rows = await lookupUCCTByTF("30");
        if (rows !== undefined) {
        }
      }

      // 매 60분마다 실행
      if (minute_now % 60 === 0) {
        const rows = await lookupUCCTByTF("60");
        if (rows !== undefined) {
        }
      }
    }
  }, 7000);
};

startAlarm();
