const dateAndTimeString = () => {
  const date = new Date();

  let today = "";

  // 윈도우와 리눅스 서버는 new Date()로 나오는 출력이 다르다.
  // 각각 맞춰서 출력할 필요가 있다.
  const os = process.platform;
  // 윈도우에서 리액트와 결합해서 개발하는 서버
  if (os == "win32") {
    // 월월.일일 맞추는거 귀찮으니 그냥 넣자. 어차피 윈도우에서는 개발서버니까.
    today = date.toLocaleDateString(); // 윈도우에서는 년년년년. 월. 일일 로 들어온다.
    // 1월 ~ 9월
    if (today.length == 12) {
      today = today.slice(2, 4) + "0" + today.slice(6, 7) + today.slice(9, 11);
      console.log(today);

      // 10월 ~ 12월
    } else if (today.length == 13) {
      today = today.slice(2, 4) + today.slice(6, 8) + today.slice(10, 12);
    }
  } else if (os == "linux") {
    // 리눅스에서 상시 돌아가는 서버
    today = date.toLocaleDateString(); // 리눅스에서는 날짜/월월/년년년년 식으로 들어온다
    // 1월 ~ 9월
    if (today.length == 9) {
      today = today.slice(7, 9) + "0" + today.slice(0, 1) + today.slice(2, 4);

      // 10월 ~ 12월
    } else if (today.length == 10) {
      today = today.slice(8, 10) + today.slice(0, 2) + today.slice(3, 5);
    }
  }

  // 시간은 윈도우나 리눅스나 똑같이 들어온다.
  let time = date.toTimeString();
  time = time.slice(0, 8);
  time = time.replace(/[:]/g, ""); // 정규표현식으로 모든 ':' 를 제거하기

  // 제일 마지막 빈 공백은 여기서 채우는 걸로
  return today + "_" + time;
};

const time_now = () => {
  const date = new Date();

  let today = "";

  // 윈도우와 리눅스 서버는 new Date()로 나오는 출력이 다르다.
  // 각각 맞춰서 출력할 필요가 있다.
  const os = process.platform;
  // 윈도우에서 리액트와 결합해서 개발하는 서버
  if (os == "win32") {
    // 월월.일일 맞추는거 귀찮으니 그냥 넣자. 어차피 윈도우에서는 개발서버니까.
    today = date.toLocaleDateString(); // 윈도우에서는 년년년년. 월. 일일 로 들어온다.
    // 1월 ~ 9월
    if (today.length == 12) {
      today = today.slice(2, 4) + "0" + today.slice(6, 7) + today.slice(9, 11);

      // 10월 ~ 12월
    } else if (today.length == 13) {
      today = today.slice(2, 4) + today.slice(6, 8) + today.slice(10, 12);
    }
  } else if (os == "linux") {
    // 리눅스에서 상시 돌아가는 서버
    today = date.toLocaleDateString(); // 리눅스에서는 날짜/월월/년년년년 식으로 들어온다
    // 1월 ~ 9월
    if (today.length == 9) {
      today = today.slice(7, 9) + "0" + today.slice(0, 1) + today.slice(2, 4);

      // 10월 ~ 12월
    } else if (today.length == 10) {
      today = today.slice(8, 10) + today.slice(0, 2) + today.slice(3, 5);
    }
  }

  // 시간은 윈도우나 리눅스나 똑같이 들어온다.
  let time = date.toTimeString();
  time = time.slice(0, 8);
  time = time.replace(/[:]/g, ""); // 정규표현식으로 모든 ':' 를 제거하기

  // 제일 마지막 빈 공백은 여기서 채우는 걸로
  return today + "_" + time + " : ";
};

export const print = (message) => {
  console.log(time_now() + message);
};

export const printerr = (error_message) => {
  console.error(time_now() + "<ERROR> " + error_message);
};
