/*

 _______ _______ _______ _     _  _____  _______  _____  _______ _______
    |    |_____| |______ |_____| |     | |______ |     | |______    |   
    |    |     | |______ |     | |_____| ______| |_____| |          | 

  ** 2022 - 태호소프트 제작
  ** Github repository : https://github.com/GTaeho/upbit_assistbot
*/

import ta from "technicalindicators";
import { lookupCCByTF } from "./dbop.js";
import { raw_sample_data } from "./upbit.js";

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
      console.log(result[result.length - 5]);
      console.log(result[result.length - 4]);
      console.log(result[result.length - 3]);
      console.log(result[result.length - 2]); // 방금 종료된 이전 봉
      console.log(result[result.length - 1]); // 지금 막 시작된 움직이는 봉
      console.log("-------------------------");

      // chatid, coin, timeframe 받아와서 정리하기
      // [ { chatid: 447679971, coin: 'KRW-BTC', timeframe: '5' } ] 이런 형식
      const rows = await lookupCCByTF("1");
      if (rows !== undefined) {
        console.log("매 분 마크 : ", rows);
      }

      // 매 3분마다 실행
      if (minute_now % 3 === 0) {
        const rows = await lookupCCByTF("3");
        if (rows !== undefined) {
          console.log("매 3분 마크 : ", rows);
        }
      }

      // 매 5분마다 실행
      if (minute_now % 5 === 0) {
        const rows = await lookupCCByTF("5");
        if (rows !== undefined) {
          console.log("매 5분 마크 : ", rows);
        }
      }

      // 매 10분마다 실행
      if (minute_now % 10 === 0) {
        const rows = await lookupCCByTF("10");
        if (rows !== undefined) {
          console.log("매 10분 마크 : ", rows);
        }
      }

      // 매 30분마다 실행
      if (minute_now % 30 === 0) {
        const rows = await lookupCCByTF("30");
        if (rows !== undefined) {
          console.log("매 30분 마크 : ", rows);
        }
      }

      // 매 60분마다 실행
      if (minute_now % 60 === 0) {
        const rows = await lookupCCByTF("60");
        if (rows !== undefined) {
          console.log("매 60분 마크 : ", rows);
        }
      }
    }
  }, 7000);
};

startAlarm();
