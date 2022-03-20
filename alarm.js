/*

 _______ _______ _______ _     _  _____  _______  _____  _______ _______
    |    |_____| |______ |_____| |     | |______ |     | |______    |   
    |    |     | |______ |     | |_____| ______| |_____| |          | 

  ** 2022 - 태호소프트 제작
  ** Github repository : https://github.com/GTaeho/upbit_assistbot
*/

import ta from "technicalindicators";
import { sendPhoto } from "./server.js";
import {
  createCoinMarketTable,
  insertCoinData,
  lookupUCCTByTF,
  checkTableExists,
  readExistingCoinData,
  dropTableIfExists,
} from "./dbop.js";
import { fetchRawUpbitCoinData, raw_sample_data } from "./upbit.js";
import { print } from "./misc/print.js";

export const startAlarm = () => {
  let prev_minute = 99;
  setInterval(async () => {
    const date = new Date();
    const minute_now = date.getMinutes();
    
    // 매 분마다 실행
    if (minute_now !== prev_minute) {
      prev_minute = minute_now;

      // 업비트에서 KRW-BTC 가격가져오기
      // const data = await raw_sample_data();
      // const macdInput = {
      //   values: data,
      //   fastPeriod: 12,
      //   slowPeriod: 26,
      //   signalPeriod: 9,
      //   SimpleMAOscillator: false,
      //   SimpleMASignal: false,
      // };
      // let result = ta.macd(macdInput);
      // print(result[result.length - 5]);
      // print(result[result.length - 4]);
      // print(result[result.length - 3]);
      // print(result[result.length - 2]); // 방금 종료된 이전 봉
      // print(result[result.length - 1]); // 지금 막 시작된 움직이는 봉
      // print("-------------------------");

      /**
       * for loop 을 돌 때는 성능을 위해서는 클래식 for loop 에 사이즈가 정해진것이 가장 빠르다.
       * https://medium.com/tech-tajawal/loops-performances-in-node-js-9fbccf2d6aa6 을 참고
       */

      // username, chatid, coin, timeframe 받아와서 정리하기
      // [ { username: prid77, chatid: 447679971, coin: 'KRW-BTC', timeframe: '5' } ] 이런 형식
      const rows = await lookupUCCTByTF("1");
      if (rows !== undefined) {
        print("매 분 실행");
      }

      // 매 3분마다 실행
      if (minute_now % 3 === 0) {
        const rows = await lookupUCCTByTF("3");
        if (rows !== undefined) {
        }
      }

      // 매 5분마다 실행
      if (minute_now % 5 === 0) {
      // 1분마다로 빠르게 테스트 할 때는 아래 줄 쓰기
      // if (rows !== undefined) {
        // username, chatid, coin, ta 리턴
        const timeframe = "5";
        const rows = await lookupUCCTByTF(timeframe);
        if (rows !== undefined) {
          // print(rows);
          // 모든 분석이 끝나면 추가된 테이블을 삭제할 테이블 이름 보관소
          let coinTablePlaceholder = [];
          // for loop 성능을 위해서는 아래 형식이 가장 낫다.
          for (let i = 0, arrlen = rows.length; i < arrlen; i++) {
            // rows 에서 필요한 정보 추출
            const username = rows[i]["username"];
            const chatid = rows[i]["chatid"];
            const coin = rows[i]["coin"];
            const ta = rows[i]["ta"];

            // coin 테이블이 있는지 확인
            const isTableExists = await checkTableExists(coin, timeframe);
            print(
              `${username} : ${coin} -> isTableExists : `,
              isTableExists,
              ", ta : ",
              ta
            );

            // 있으면 db 에서 데이터 읽어와서 TA
            if (isTableExists) {
              const rows = await readExistingCoinData(coin, timeframe);
              // print(rows);
              const taResult = runTA(coin, rows, ta);
              if (taResult.signal === "MACDCO_SIGNAL") {
                print(`${coin} : 5분봉 ${taResult.signal} 신호발생`);
              } else if (taResult.signal === "NO_SIGNAL") {
              }

              // 없으면 테이블만들고, 업비트에서 데이터 받아오고 테이블에 자료 넣기
            } else if (!isTableExists) {
              print("테이블을 찾지 못함, 새로만들어서 데이터 넣기");
              coinTablePlaceholder.push(coin);
              await createCoinMarketTable(coin, timeframe);
              const coindata = await fetchRawUpbitCoinData(coin, timeframe);
              const insertResult = await insertCoinData(
                coin,
                coindata,
                timeframe
              );
              // 자료입력 다 했으면 기술분석 시작
              if (insertResult == "ok") {
                const rows = await readExistingCoinData(coin, timeframe);
                const taResult = runTA(coin, rows, ta);
                print("TA 결과 : ", taResult);
              }
            }
          }
          // 5분봉의 모든 작업이 끝나면 이제 5분봉의 모든 테이블 삭제 시간
          print("테이블 삭제 시작");
          const dropResult = await dropTableIfExists(
            coinTablePlaceholder,
            timeframe
          );
          if (dropResult == "ok") print("테이블 삭제 완료");
        }
      }

      // 매 10분마다 실행
      if (minute_now % 10 === 0) {
        const rows = await lookupUCCTByTF("10");
        if (rows !== undefined) {
          print("매 10분 마크");
        }
      }

      // 매 15분마다 실행
      if (minute_now % 15 === 0) {
        const rows = await lookupUCCTByTF("15");
        if (rows !== undefined) {
          print("매 15분 마크");
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

// 기술적지표 분석 -> 신호발생 여부 판단하기
const runTA = (coin_symbol, data, ta_symbol) => {
  print(`${coin_symbol} 기술분석(${ta_symbol}) 시작`);

  // 스위치 안에서 쓰일 것들
  let arrdata = [];
  const macdInput = {
    values: arrdata,
    fastPeriod: 12,
    slowPeriod: 26,
    signalPeriod: 9,
    SimpleMAOscillator: false,
    SimpleMASignal: false,
  };
  let macdOutput = undefined;
  let obp_macdhist = undefined;
  let last_macdhist = undefined;

  switch (ta_symbol) {
    case "macdco":
      // data = [{trade_price: 얼마얼마}] 이런 식
      for (let i = 0, datalen = data.length; i < datalen; i++) {
        arrdata.push(data[i]["trade_price"]);
      }
      // print("arrdata.length = ", arrdata.length);
      macdOutput = ta.macd(macdInput);
      // print(macdOutput[macdOutput.length - 3]);
      // print(macdOutput[macdOutput.length - 2]);
      // print(macdOutput[macdOutput.length - 1]);
      obp_macdhist = macdOutput[macdOutput.length - 3]["histogram"];
      last_macdhist = macdOutput[macdOutput.length - 2]["histogram"];
      if (obp_macdhist < 0 && last_macdhist > 0) {
        return {
          coin: coin_symbol,
          ta: ta_symbol,
          signal: "MACDCO_SIGNAL",
        };
      } else {
        return {
          coin: coin_symbol,
          ta: ta_symbol,
          signal: "NO_SIGNAL",
        };
      }
    case "macdcu":
      // data = [{trade_price: 얼마얼마}] 이런 식
      for (let i = 0, datalen = data.length; i < datalen; i++) {
        arrdata.push(data[i]["trade_price"]);
      }
      // print("arrdata.length = ", arrdata.length);
      macdOutput = ta.macd(macdInput);
      // print(macdOutput[macdOutput.length - 3]);
      // print(macdOutput[macdOutput.length - 2]);
      // print(macdOutput[macdOutput.length - 1]);
      obp_macdhist = macdOutput[macdOutput.length - 3]["histogram"];
      last_macdhist = macdOutput[macdOutput.length - 2]["histogram"];
      if (obp_macdhist > 0 && last_macdhist < 0) {
        return {
          coin: coin_symbol,
          ta: ta_symbol,
          signal: "MACDCO_SIGNAL",
        };
      } else {
        return {
          coin: coin_symbol,
          ta: ta_symbol,
          signal: "NO_SIGNAL",
        };
      }
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
};
