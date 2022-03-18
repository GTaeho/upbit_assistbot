/*

 _______ _______ _______ _     _  _____  _______  _____  _______ _______
    |    |_____| |______ |_____| |     | |______ |     | |______    |   
    |    |     | |______ |     | |_____| ______| |_____| |          | 

  ** 2022 - 태호소프트 제작
  ** Github repository : https://github.com/GTaeho/upbit_assistbot
*/

import ta from "technicalindicators";
import { krwbtc_raw_sample_data } from "./upbit.js";

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
      console.log(result[result.length - 2]);
      console.log(result[result.length - 1]);
      console.log("-------------------------");

      // 매 3분마다 실행
      if (minute_now % 3 === 0) {
        console.log("매 3분 마크 : " + minute_now);
      }

      // 매 5분마다 실행
      if (minute_now % 5 === 0) {
        console.log("매 5분 마크 : " + minute_now);
      }

      // 매 10분마다 실행
      if (minute_now % 10 === 0) {
        console.log("매 10분 마크 : " + minute_now);
      }

      // 매 30분마다 실행
      if (minute_now % 30 === 0) {
        console.log("매 30분 마크 : " + minute_now);
      }

      // 매 60분마다 실행
      if (minute_now % 60 === 0) {
        console.log("매 60분 마크 : " + minute_now);
      }
    }
  }, 7000);
};

startAlarm();
