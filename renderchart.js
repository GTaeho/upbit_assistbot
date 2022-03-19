/*

 _______ _______ _______ _     _  _____  _______  _____  _______ _______
    |    |_____| |______ |_____| |     | |______ |     | |______    |   
    |    |     | |______ |     | |_____| ______| |_____| |          | 

  ** 2022 - 태호소프트 제작
  ** Github repository : https://github.com/GTaeho/upbit_assistbot
*/

import { rendrerChartSet640360 } from "./memorymgnt.js";
import { krwbtc_sample_data } from "./upbit.js";

export const sample_chart = async () => {
  const upbitData = await krwbtc_sample_data();
  const config = {
    type: "line",
    data: {
      // labels: ["Red", "Blue", "Yellow", "Green", "Purple", "Orange"],
      datasets: [
        {
          label: "KRW-BTC",
          data: upbitData,
          // borderWidth: 1,
          borderColor: "rgb(75, 192, 192)",
        },
      ],
    },
    options: {
      // scales: {
      //   y: {
      //     beginAtZero: true,
      //   },
      // },
    },
  };

  // 메모리 관리를 위해서 같은 객체를 재사용, 렌더 메서드만 사용
  return await rendrerChartSet640360(config);
};

export const renderMACDCO = async (coindata) => {
  const config = {
    type: "line",
    data: {
      // labels: ["Red", "Blue", "Yellow", "Green", "Purple", "Orange"],
      datasets: [
        {
          label: "KRW-BTC",
          data: coindata,
          // borderWidth: 1,
          borderColor: "rgb(75, 192, 192)",
        },
      ],
    },
    options: {
      // scales: {
      //   y: {
      //     beginAtZero: true,
      //   },
      // },
    },
  };

  // 메모리 관리를 위해서 같은 객체를 재사용, 렌더 메서드만 사용
  return await rendrerChartSet640360(config);
};
