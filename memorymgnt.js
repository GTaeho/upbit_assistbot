import { ChartJSNodeCanvas } from "chartjs-node-canvas";

// Re-use one service, or as many as you need for different canvas size requirements
const smallChartJSNodeCanvas = new ChartJSNodeCanvas({
  // 16:9 비율은 https://en.wikipedia.org/wiki/16:9_aspect_ratio 참고
  width: 426, //px : 늘어날 수록 램사용량 높아짐. 램 살 돈 없음.
  height: 240, //px : 늘어날 수록 램사용량 높아짐. 램 살 돈 없음.
  backgroundColour: "white",
});

const bigCChartJSNodeCanvas = new ChartJSNodeCanvas({
  width: 1920,
  height: 1080,
  backgroundColour: "white",
});

export const renderSmallChart = async (configuration) => {
  // .renderToBuffer 가 Promise를 반환한다. await 쓰기.
  return await smallChartJSNodeCanvas.renderToBuffer(configuration);
};

// // Expose just the 'render' methods to downstream code
// // so they don't have to worry about life-cycle management.
// module.exports = {
//   renderSmallChart: (configuration) =>
//     smallChartJSNodeCanvas.renderToBuffer(configuration),
//   renderBigChart: (configuration) =>
//     bigCChartJSNodeCanvas.renderToBuffer(configuration),
// };
