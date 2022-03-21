/*

 _______ _______ _______ _     _  _____  _______  _____  _______ _______
    |    |_____| |______ |_____| |     | |______ |     | |______    |   
    |    |     | |______ |     | |_____| ______| |_____| |          | 

  ** 2022 - 태호소프트 제작
  ** Github repository : https://github.com/GTaeho/upbit_assistbot
*/

import ta from "technicalindicators";
import { sendChart } from "./server.js";
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

      /**
       * for loop 을 돌 때는 성능을 위해서는 클래식 for loop 에 사이즈가 정해진것이 가장 빠르다.
       * https://medium.com/tech-tajawal/loops-performances-in-node-js-9fbccf2d6aa6 을 참고
       */

      // username, chatid, coin, timeframe 받아와서 정리하기
      // [ { username: prid77, chatid: 447679971, coin: 'KRW-BTC', timeframe: '5' } ] 이런 형식
      const rows = await lookupUCCTByTF("1");
      const timeframe = "1";
      if (rows !== undefined) {
        print("매 1분 실행");
        print(
          "----------------------------------------------------------------"
        );
      }

      // 매 3분마다 실행
      if (minute_now % 3 === 0) {
        const timeframe = "3";
        const rows = await lookupUCCTByTF("3");
        if (rows !== undefined) {
          print("매 3분 실행");
          print(
            "----------------------------------------------------------------"
          );
        }
      }

      // 매 5분마다 실행
      // if (minute_now % 5 === 0) {
      // 1분마다로 빠르게 테스트 할 때는 아래 줄 쓰기
      if (rows !== undefined) {
        print("매 5분 실행");
        const timeframe = "5";
        // username, chatid, coin, ta 리턴
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
              `${username} : ${coin} -> isTableExists : ` +
                isTableExists +
                ", ta : " +
                ta
            );

            // 있으면 db 에서 데이터 읽어와서 TA
            if (isTableExists) {
              const rows = await readExistingCoinData(coin, timeframe);
              // print(rows);
              const taResult = runTA(coin, rows, ta);
              print("TA 결과 : " + JSON.stringify(taResult));
              if (taResult.signal == "SIGNAL") {
                const signalData = {
                  chatid: chatid,
                  coin: coin,
                  timeframe: timeframe,
                  taSymbol: taResult.signalType,
                  labels: taResult.xdata,
                  data: taResult.data,
                };
                sendChart(signalData);
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
                print("TA 결과 : " + JSON.stringify(taResult));
                if (taResult.signal == "SIGNAL") {
                  const signalData = {
                    chatid: chatid,
                    coin: coin,
                    timeframe: timeframe,
                    taSymbol: taResult.signalType,
                    labels: taResult.xdata,
                    data: taResult.data,
                  };
                  sendChart(signalData);
                }
              }
            }
          }
          // 5분봉의 모든 작업이 끝나면 이제 5분봉의 모든 테이블 삭제 시간
          print("테이블 삭제 시작");
          const dropResult = await dropTableIfExists(
            coinTablePlaceholder,
            timeframe
          );
          if (dropResult == "ok") {
            print("테이블 삭제 완료");
            print(
              "----------------------------------------------------------------"
            );
          }
        }

        // 매 10분마다 실행
        if (minute_now % 10 === 0) {
          const timeframe = "10";
          const rows = await lookupUCCTByTF("10");
          if (rows !== undefined) {
            print("매 10분 마크");
            print(
              "----------------------------------------------------------------"
            );
          }
        }

        // 매 15분마다 실행
        if (minute_now % 15 === 0) {
          const timeframe = "15";
          const rows = await lookupUCCTByTF("15");
          if (rows !== undefined) {
            print("매 15분 마크");
            print(
              "----------------------------------------------------------------"
            );
          }
        }

        // 매 30분마다 실행
        if (minute_now % 30 === 0) {
          const timeframe = "30";
          const rows = await lookupUCCTByTF("30");
          if (rows !== undefined) {
            print("매 30분 마크");
            print(
              "----------------------------------------------------------------"
            );
          }
        }

        // 매 60분마다 실행
        if (minute_now % 60 === 0) {
          const timeframe = "60";
          const rows = await lookupUCCTByTF("60");
          if (rows !== undefined) {
            print("매 60분 마크");
            print(
              "----------------------------------------------------------------"
            );
          }
        }
      }
    }
  }, 7000);
};

// startAlarm();

// 기술적지표 분석 -> 신호발생 여부 판단하기
const runTA = (coin_symbol, data, ta_symbol) => {
  print(`${coin_symbol} 기술분석(${ta_symbol}) 시작`);
  switch (ta_symbol) {
    case "macdco": {
      let arrdata = [];
      let xdata = []; // xdata는 x축 데이터 : 년월일시분
      // data = [{trade_price: 얼마얼마}] 이런 식
      for (let i = 0, datalen = data.length; i < datalen; i++) {
        arrdata.push(data[i]["trade_price"]);
        xdata.push(data[i]["candle_date_time_kst"]);
      }
      // print("arrdata.length = ", arrdata.length);
      const macdInput = {
        values: arrdata,
        fastPeriod: 12,
        slowPeriod: 26,
        signalPeriod: 9,
        SimpleMAOscillator: false,
        SimpleMASignal: false,
      };

      // macd 계산을하면 slowPeriod - 1 만큼 데이터 갯수가 줄어든다.
      // 200개를 받아왔을때 slowPeriod가 26이면 25개 줄어들어서 총 데이터는 175개가 리턴된다.
      // 계산값은 정확하다. xdata 시간도 slowPeriod-1 개 만큼 줄여서 sendChart에 보내야한다.
      let macdOutput = ta.macd(macdInput); // macdOutput은 arrdata - slowPeriod-1 한 값이 나온다.
      macdOutput = macdOutput.slice(155); // 이렇게 해서 macdOutuput은 최근 20개만 남기고 삭제
      xdata = xdata.slice(180); // xdata도 마찬가지로 최근 20개만 남기고 삭제

      // print(macdOutput[macdOutput.length - 3]);
      // print(macdOutput[macdOutput.length - 2]);
      // print(macdOutput[macdOutput.length - 1]);
      const obp_macdhist = macdOutput[macdOutput.length - 3]["histogram"];
      const last_macdhist = macdOutput[macdOutput.length - 2]["histogram"];
      // 신호검증용 디버그 - 필요여부에 따라 주석처리
      print(
        "runTA macdco, obp_macdhist : " +
          obp_macdhist +
          ", last_macdhist : " +
          last_macdhist
      );

      // hist만 비교해도 macd와 macd signal 선 크로스오버 검출 가능
      if (obp_macdhist < 0 && last_macdhist > 0) {
        return {
          coin: coin_symbol,
          signal: "SIGNAL",
          signalType: ta_symbol,
          data: macdOutput,
          xdata: xdata,
        };

        // 신호 없을때는 data 넣을 필요 없음
      } else {
        return {
          coin: coin_symbol,
          signal: "NO_SIGNAL",
          signalType: ta_symbol,
        };
      }
    }

    case "macdcu": {
      let arrdata = [];
      let xdata = []; // xdata는 x축 데이터 : 년월일시분
      // data = [{trade_price: 얼마얼마}] 이런 식
      for (let i = 0, datalen = data.length; i < datalen; i++) {
        arrdata.push(data[i]["trade_price"]);
        xdata.push(data[i]["candle_date_time_kst"]);
      }

      const macdInput = {
        values: arrdata,
        fastPeriod: 12,
        slowPeriod: 26,
        signalPeriod: 9,
        SimpleMAOscillator: false,
        SimpleMASignal: false,
      };

      // print("arrdata.length = ", arrdata.length);
      // macd 계산을하면 slowPeriod - 1 만큼 데이터 갯수가 줄어든다.
      // 200개를 받아왔을때 slowPeriod가 26이면 25개 줄어들어서 총 데이터는 175개가 리턴된다.
      // 계산값은 정확하다. xdata 시간도 slowPeriod-1 개 만큼 줄여서 sendChart에 보내야한다.
      let macdOutput = ta.macd(macdInput); // macdOutput은 arrdata - slowPeriod-1 한 값이 나온다.
      macdOutput = macdOutput.slice(155); // 이렇게 해서 macdOutuput은 최근 20개만 남기고 삭제
      xdata = xdata.slice(180); // xdata도 마찬가지로 최근 20개만 남기고 삭제

      // print(macdOutput[macdOutput.length - 3]);
      // print(macdOutput[macdOutput.length - 2]);
      // print(macdOutput[macdOutput.length - 1]);
      const obp_macdhist = macdOutput[macdOutput.length - 3]["histogram"];
      const last_macdhist = macdOutput[macdOutput.length - 2]["histogram"];
      // 신호검증용 디버그 - 필요여부에 따라 주석처리
      print(
        "runTA macdcu, obp_macdhist : " +
          obp_macdhist +
          ", last_macdhist : " +
          last_macdhist
      );

      // obp hist는 양수이다가 last hist가 음수이면 하락돌파
      if (obp_macdhist > 0 && last_macdhist < 0) {
        return {
          coin: coin_symbol,
          signal: "SIGNAL",
          signalType: ta_symbol,
          data: macdOutput,
          xdata: xdata,
        };

        // 신호 없을때는 data 넣을 필요 없음
      } else {
        return {
          coin: coin_symbol,
          signal: "NO_SIGNAL",
          signalType: ta_symbol,
        };
      }
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
