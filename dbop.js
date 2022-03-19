/*

 _______ _______ _______ _     _  _____  _______  _____  _______ _______
    |    |_____| |______ |_____| |     | |______ |     | |______    |   
    |    |     | |______ |     | |_____| ______| |_____| |          | 

  ** 2022 - 태호소프트 제작
  ** Github repository : https://github.com/GTaeho/upbit_assistbot
*/

import sqlite3 from "sqlite3";

// db 생성 - 신기하다. 여기서만 생성하면 db.xxx 이름으로 시작되는 모든 작업이 사용가능
const db = new sqlite3.Database("./db/users.db");
const coindb = new sqlite3.Database("./db/coin.db");

// db 개수 빨리 세서 리턴
export const fastIDCount = () => {
  return new Promise((resolve, reject) => {
    const fastCountQuery = `SELECT COUNT(id) from users`;
    db.get(fastCountQuery, (err, row) => {
      if (err) reject(err);
      const result = row["COUNT(id)"];
      console.log("");
      resolve(result);
    });
  });
};

// username 으로 db 조회 있으면 그 줄 리턴
export const findByID = (username) => {
  return new Promise((resolve, reject) => {
    const query = `SELECT username FROM users WHERE username = '${username}'`;
    db.get(query, (err, row) => {
      if (err) {
        reject(err);
        // // db에 매치되는 사람 없을 때 - 신규회원
        // if (err.message === `SQLITE_ERROR: no such column: ${username}`) {
        //   resolve("nomatch");
        // }
      } else {
        // 찾은 유저네임을 리턴 - 없으면 undefined 리턴
        // 여기서 username 이 찾은 내용이 없을때 row['username'] 이라고 접근만해도 오류로 뻗는다.
        if (row == undefined) {
          resolve("nomatch");
        } else {
          const result = row["username"];
          resolve(result);
        }
      }
    });
  });
};

// // db의 chatid, coin, timeframe 컬럼 조회
// // CMT = 'C'hatid, 'C'oin, 'T'imeframe
// export const lookupCCT = () => {
//   return new Promise((resolve, reject) => {
//     const query = `SELECT chatid, coin, timeframe FROM users`;
//     db.all(query, [], (err, rows) => {
//       if (err) reject(err);
//       resolve(rows);
//     });
//   });
// };

// 개별 db ucct 를 timeframe에 따라 조회
export const lookupUCCTByTF = (timeframe) => {
  return new Promise((resolve, reject) => {
    const query = `SELECT username, chatid, coin, ta FROM users WHERE timeframe = ${timeframe}`;
    db.all(query, [], (err, rows) => {
      if (err) reject(err);
      resolve(rows);
    });
  });
};

// db에 사용자 신규추가
export const insertUser = (
  username,
  userfullname,
  chatid,
  msgtext,
  lastcmd
) => {
  return new Promise((resolve, reject) => {
    const query = `INSERT INTO users(username, userfullname, chatid, msgtext, lastcmd)
      VALUES(?,?,?,?,?)`;
    db.run(query, [username, userfullname, chatid, msgtext, lastcmd], (err) => {
      if (err) reject(err);
      console.log("insertUser() done successfully");
      resolve("ok");
    });
  });
};

// db에서 사용자가 마지막으로 언제 사용한건지 조사후 Thu Mar 17 2022 14:49:46 GMT+0900 (대한민국 표준시)
// 반환. 정기적으로 돌려서 일정기간 넘도록 사용한적 없는 유저는 삭제
export const readLastCmd = (username) => {
  return new Promise((resolve, reject) => {
    const query = `SELECT lastcmd FROM users WHERE username = ${username}`;
    db.get(query, (err, row) => {
      if (err) reject(err);
      resolve(row["lastcmd"]);
    });
  });
};

// const deleteUser = (username) => {
//   return new Promise((resolve, reject) => {

//   })
// }

// 업비트에서 받아오는 자료구조로 테이블 만들기
export const createCoinMarketTable = (market) => {
  return new Promise((resolve, reject) => {
    const query = `CREATE TABLE IF NOT EXISTS '${market}' (
      "id"	INTEGER,
      "market"	TEXT NOT NULL,
      "candle_date_time_utc"	TEXT NOT NULL,
      "candle_date_time_kst"	TEXT NOT NULL,
      "opening_price"	INTEGER NOT NULL,
      "high_price"	INTEGER NOT NULL,
      "low_price"	INTEGER NOT NULL,
      "trade_price"	INTEGER NOT NULL,
      "timestamp"	INTEGER NOT NULL,
      "candle_acc_trade_price"	INTEGER NOT NULL,
      "candle_acc_trade_volume"	TEXT NOT NULL,
      "unit"	INTEGER NOT NULL,
      PRIMARY KEY("id" AUTOINCREMENT))`;
    coindb.run(query, (err) => {
      if (err) reject(err);
      resolve("ok");
    });
  });
};

export const insertCoinData = (market, data) => {
  coindb.serialize(() => {
    const query = `INSERT INTO '${market}' (
      market, candle_date_time_utc, candle_date_time_kst, opening_price, high_price, 
      low_price, trade_price, timestamp, candle_acc_trade_price, candle_acc_trade_volume, unit) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

    let statement = coindb.prepare(query);
    for (let i = 0, datalen = data.length; i < datalen; i++) {
      const itemArr = [
        data[i]["market"],
        data[i]["candle_date_time_utc"],
        data[i]["candle_date_time_kst"],
        data[i]["opening_price"],
        data[i]["high_price"],
        data[i]["low_price"],
        data[i]["trade_price"],
        data[i]["timestamp"],
        data[i]["candle_acc_trade_price"],
        data[i]["candle_acc_trade_volume"],
        data[i]["unit"],
      ];
      statement.run(itemArr);
    }
    statement.finalize();
    
    console.log("dbop.js > insertCoinData() -> INSERT op. successfully done!");
  });
  // close는 꼭 serialize() 다 끝난 뒤에. 안에 넣으면 error
  // db는 닫지 말자. 한 번 닫으면 또 쓸때 또 열어야 한다.
  // coindb.close();
};
