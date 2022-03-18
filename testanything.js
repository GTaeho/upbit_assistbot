const date = new Date();

console.log(date.toLocaleTimeString());
console.log(date.getMinutes());
console.log(date.getHours());
console.log(date.getDate());

let prev_minute = 99;
setInterval(() => {
  const date = new Date();
  const minute_now = date.getMinutes();

  // 매 분마다 실행
  if (minute_now !== prev_minute) {
    prev_minute = minute_now;
    console.log("매 1분 마크 : " + minute_now);
  }
}, 7000);
