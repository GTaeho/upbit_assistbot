/*

 _______ _______ _______ _     _  _____  _______  _____  _______ _______
    |    |_____| |______ |_____| |     | |______ |     | |______    |   
    |    |     | |______ |     | |_____| ______| |_____| |          | 

  ** 2022 - 태호소프트 제작
  ** Github repository : https://github.com/GTaeho/upbit_assistbot
*/

import { renderSmallChart } from "./memorymgnt.js";
import { krwbtc_sample_data } from "./upbit.js";

export const sample_chart = async () => {
  const upbitData = await krwbtc_sample_data();
  const config = {
    type: 'line',
    data: data,
    options: {
      responsive: true,
      plugins: {
        tooltip: {
          mode: 'index',
          intersect: false
        },
        title: {
          display: true,
          text: 'Chart.js Line Chart'
        }
      },
      hover: {
        mode: 'index',
        intersec: false
      },
      scales: {
        x: {
          title: {
            display: true,
            text: 'Month'
          }
        },
        y: {
          title: {
            display: true,
            text: 'Value'
          },
          min: 0,
          max: 100,
          ticks: {
            // forces step size to be 50 units
            stepSize: 50
          }
        }
      }
    },
  };

  // 메모리 관리를 위해서 같은 객체를 재사용, 렌더 메서드만 사용
  return await renderSmallChart(config);
};
