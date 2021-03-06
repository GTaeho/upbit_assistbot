/*

 _______ _______ _______ _     _  _____  _______  _____  _______ _______
    |    |_____| |______ |_____| |     | |______ |     | |______    |   
    |    |     | |______ |     | |_____| ______| |_____| |          | 

  ** 2022 - 태호소프트 제작
  ** Github repository : https://github.com/GTaeho/upbit_assistbot
*/

import fetch from "node-fetch";

// 현재가 조회
export const getTicker = async (symbol) => {
  const res = await fetch(`https://api.upbit.com/v1/ticker?markets=${symbol}`);
  const data = await res.json();
  return data;
};

export const raw_sample_data = async () => {
  /**
   * 주의할 점은, 한 번에 200개 까지의 캔들을 요청할 수 있으며 이를 초과하는 경우
   * 페이지네이션 기술을 이용해 순차적으로 요청하는 것을 권장합니다.
   * 뭘 계산하던지 200개면 보통 실시간 최신값을 받는데는 크게 문제없다.
   * DB에 저장하고 할 필요는 아직 없음.
   */
  const res = await fetch(
    "https://api.upbit.com/v1/candles/minutes/5?market=KRW-BTC&count=200"
  );
  const data = await res.json();
  const sampleDataArray = [];
  for (let key in data) {
    sampleDataArray.push(data[key]["trade_price"]);
  }
  // return sampleDataArray
  return sampleDataArray.reverse();
};

export const krwbtc_sample_data = async () => {
  /**
   * 주의할 점은, 한 번에 200개 까지의 캔들을 요청할 수 있으며 이를 초과하는 경우
   * 페이지네이션 기술을 이용해 순차적으로 요청하는 것을 권장합니다.
   */
  const res = await fetch(
    "https://api.upbit.com/v1/candles/minutes/5?market=KRW-BTC&count=30"
  );
  const data = await res.json();
  const sampleDataArray = [];
  for (let key in data) {
    sampleDataArray.push({
      x: data[key]["candle_date_time_kst"],
      y: data[key]["trade_price"],
    });
  }
  // console.log(sampleDataArray);
  return sampleDataArray.reverse();
};

export const fetchUpbitDataXYLineForm = async (marketSymbol, timeframe) => {
  /**
   * 주의할 점은, 한 번에 200개 까지의 캔들을 요청할 수 있으며 이를 초과하는 경우
   * 페이지네이션 기술을 이용해 순차적으로 요청하는 것을 권장합니다.
   */
  const url = `https://api.upbit.com/v1/candles/minutes/${timeframe}?market=${marketSymbol}&count=1`;
  const res = await fetch(url);
  console.log(url);
  const data = await res.json();
  const sampleDataArray = [];
  for (let key in data) {
    sampleDataArray.push({
      x: data[key]["candle_date_time_kst"],
      y: data[key]["trade_price"],
    });
  }
  // console.log(sampleDataArray);
  return sampleDataArray.reverse();
};

export const fetchRawUpbitCoinData = async (marketSymbol, timeframe) => {
  /**
   * 주의할 점은, 한 번에 200개 까지의 캔들을 요청할 수 있으며 이를 초과하는 경우
   * 페이지네이션 기술을 이용해 순차적으로 요청하는 것을 권장합니다.
   */
  const url = `https://api.upbit.com/v1/candles/minutes/${timeframe}?market=${marketSymbol}&count=200`;
  const res = await fetch(url);
  const data = await res.json();
  return data.reverse();
};

// 업비트에서 거래 가능한 마켓 목록
export const fetchAllMarket = async () => {
  const res = await fetch("https://api.upbit.com/v1/market/all");
  return await res.json();
};
