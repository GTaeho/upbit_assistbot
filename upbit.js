/*

 _______ _______ _______ _     _  _____  _______  _____  _______ _______
    |    |_____| |______ |_____| |     | |______ |     | |______    |   
    |    |     | |______ |     | |_____| ______| |_____| |          | 

  ** 2022 - 태호소프트 제작
  ** Github repository : https://github.com/GTaeho/upbit_assistbot
*/

import fetch from "node-fetch";

export const krwbtc_sample_data = async () => {
  /**
   * 주의할 점은, 한 번에 200개 까지의 캔들을 요청할 수 있으며 이를 초과하는 경우
   * 페이지네이션 기술을 이용해 순차적으로 요청하는 것을 권장합니다.
   */
  const res = await fetch(
    "https://api.upbit.com/v1/candles/minutes/5?market=KRW-BTC&count=20"
  );
  const data = await res.json();

  const closeArrary = [];
  for (let key in data) {
    closeArrary.push(data[key]["trade_price"]);
  }

  return closeArrary;
};
