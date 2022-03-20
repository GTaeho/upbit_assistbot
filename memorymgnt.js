/*

 _______ _______ _______ _     _  _____  _______  _____  _______ _______
    |    |_____| |______ |_____| |     | |______ |     | |______    |   
    |    |     | |______ |     | |_____| ______| |_____| |          | 

  ** 2022 - 태호소프트 제작
  ** Github repository : https://github.com/GTaeho/upbit_assistbot
*/

import { ChartJSNodeCanvas } from "chartjs-node-canvas";

// Re-use one service, or as many as you need for different canvas size requirements
const smallChartJSNodeCanvas = new ChartJSNodeCanvas({
  // 16:9 비율은 https://en.wikipedia.org/wiki/16:9_aspect_ratio 참고
  width: 426, //px : 늘어날 수록 램사용량 높아짐. 램 살 돈 없음.
  height: 240, //px : 늘어날 수록 램사용량 높아짐. 램 살 돈 없음.
  backgroundColour: "white",
});

const chartSet640360 = new ChartJSNodeCanvas({
  // 16:9 비율은 https://en.wikipedia.org/wiki/16:9_aspect_ratio 참고
  width: 640, //px : 늘어날 수록 램사용량 높아짐. 램 살 돈 없음.
  height: 360, //px : 늘어날 수록 램사용량 높아짐. 램 살 돈 없음.
  backgroundColour: "white",
});

const chartSet960540 = new ChartJSNodeCanvas({
  // 16:9 비율은 https://en.wikipedia.org/wiki/16:9_aspect_ratio 참고
  width: 960, //px : 늘어날 수록 램사용량 높아짐. 램 살 돈 없음.
  height: 540, //px : 늘어날 수록 램사용량 높아짐. 램 살 돈 없음.
  backgroundColour: "white",
});

const bigCChartJSNodeCanvas = new ChartJSNodeCanvas({
  width: 1920,
  height: 1080,
  backgroundColour: "white",
});

// // Expose just the 'render' methods to downstream code
// // so they don't have to worry about life-cycle management.
// 정서적으로 눈으로 보기에 줄일 수 있는 가장 최소크기
export const renderSmallChart = async (configuration) => {
  // .renderToBuffer 가 Promise를 반환한다. await 쓰기.
  return await smallChartJSNodeCanvas.renderToBuffer(configuration);
};

// // Expose just the 'render' methods to downstream code
// // so they don't have to worry about life-cycle management.
// 640*360 세트 실험
export const rendrerChartSet640360 = async (configuration) => {
  // .renderToBuffer 가 Promise를 반환한다. await 쓰기.
  return await chartSet640360.renderToBuffer(configuration);
};

// // Expose just the 'render' methods to downstream code
// // so they don't have to worry about life-cycle management.
// 960*540 세트 실험
export const rendrerChartSet960540 = async (configuration) => {
  // .renderToBuffer 가 Promise를 반환한다. await 쓰기.
  return await chartSet960540.renderToBuffer(configuration);
};
