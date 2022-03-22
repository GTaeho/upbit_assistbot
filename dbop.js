/*

 _______ _______ _______ _     _  _____  _______  _____  _______ _______
    |    |_____| |______ |_____| |     | |______ |     | |______    |   
    |    |     | |______ |     | |_____| ______| |_____| |          | 

  ** 2022 - 태호소프트 제작
  ** Github repository : https://github.com/GTaeho/upbit_assistbot
*/

import sqlite3 from "sqlite3";
import { print } from "./misc/print.js";

// db 생성 - 신기하다. 여기서만 생성하면 db.xxx 이름으로 시작되는 모든 작업이 사용가능
const userdb = new sqlite3.Database("./db/users.db");
const coindb1min = new sqlite3.Database("./db/coin1min.db");
const coindb3min = new sqlite3.Database("./db/coin3min.db");
const coindb5min = new sqlite3.Database("./db/coin5min.db");
const coindb10min = new sqlite3.Database("./db/coin10min.db");
const coindb15min = new sqlite3.Database("./db/coin15min.db");
const coindb30min = new sqlite3.Database("./db/coin30min.db");
const coindb60min = new sqlite3.Database("./db/coin60min.db");

// userdb 개수 빨리 세서 리턴
export const fastUserCount = () => {
  return new Promise((resolve, reject) => {
    const fastCountQuery = `SELECT COUNT(id) from users`;
    userdb.get(fastCountQuery, (err, row) => {
      if (err) reject(err);
      const result = row["COUNT(id)"];
      resolve(result);
    });
  });
};

// username 으로 userdb 조회 있으면 그 줄 리턴
export const findByUsername = (username) => {
  return new Promise((resolve, reject) => {
    const query = `SELECT username FROM users WHERE username = '${username}'`;
    userdb.get(query, (err, row) => {
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

//
export const findLastcmdByChatID = (chatid) => {
  return new Promise((resolve, reject) => {
    const query = `SELECT username FROM users WHERE username = '${username}'`;
    userdb.get(query, (err, row) => {
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

// 개별 userdb ucct 를 timeframe에 따라 조회
export const lookupUCCTByTF = (timeframe) => {
  return new Promise((resolve, reject) => {
    const query = `SELECT username, chatid, coin, ta FROM users WHERE timeframe = ${timeframe}`;
    userdb.all(query, [], (err, rows) => {
      if (err) reject(err);
      resolve(rows);
    });
  });
};

// userdb에 사용자 신규추가
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
    userdb.run(
      query,
      [username, userfullname, chatid, msgtext, lastcmd],
      (err) => {
        if (err) reject(err);
        resolve("ok");
      }
    );
  });
};

// db에서 사용자가 마지막으로 언제 사용한건지 조사후 Thu Mar 17 2022 14:49:46 GMT+0900 (대한민국 표준시)
// 반환. 정기적으로 돌려서 일정기간 넘도록 사용한적 없는 유저는 삭제
export const readLastCmd = (username) => {
  return new Promise((resolve, reject) => {
    const query = `SELECT lastcmd FROM users WHERE username = ${username}`;
    userdb.get(query, (err, row) => {
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
export const createCoinMarketTable = (market, timeframe) => {
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
    // timeframe에 맞는 db가져오기
    const db = getDBByTimeframe(timeframe);
    db.run(query, (err) => {
      if (err) reject(err);
      resolve("ok");
    });
  });
};

// 받은 코인캔들 자료를 DB에 입력하기
export const insertCoinData = (market, data, timeframe) => {
  return new Promise((resolve) => {
    // timeframe에 맞는 db가져오기
    const db = getDBByTimeframe(timeframe);
    db.serialize(() => {
      const query = `INSERT INTO '${market}' (
    market, candle_date_time_utc, candle_date_time_kst, opening_price, high_price, 
    low_price, trade_price, timestamp, candle_acc_trade_price, candle_acc_trade_volume, unit) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

      let statement = db.prepare(query);
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
      /** 노드에서 for 문 break에 대해서...
       * 여기서 생각을 한것이... 어떤짓을 해도 for문 밖에 console를 넣던지 해도
       * statement.finalize()를 마무리 하지 않고 for문 밖에 실행만하고 이 함수 자체를
       * 끝내버린다. 이것때문에 골머리를 얼마나 썩었는지 많이 늙은것 같다.
       * 아무리 검색을 해도 promise 로 감싸서 await를 해라 정도가 끝인데
       * 아무리 이 함수를 await로 감싸도 이 함수 밖에서는 또 for문이 돌아가고 있는데
       * 이 안에 함수가 끝나지 않은 시점에서 바깥 for문은 또 루프를 돌고 다음 루프에서
       * statement.finalize() 가 완료 되지 않은 시점에서 read 작업을 하니 실제 데이터는 4개밖에
       * 입력되지 않은 상태에서 기술분석을 하려고 해서 그렇게도 오류가 났었다.
       * 어떤 식으로 해도 이 함수의 for문을 다 돌지 않고 마쳐버리길래 스트레스받다가
       * https://stackoverflow.com/a/36389917 이 글을 보고 힌트를 얻었다. (저 글이 해결은 아니다)
       * 원래는 db.serialize() 밖에다 콘솔로그도 놓고 리졸브도 놓고 했었는데
       * 저 힌트글에서 보통 노드에서 for 루프를 확실하게 마치는 걸 확인하는 작업은
       * for 문 끝에서 전체 for문이 돌아야할 루프수를 비교해서 맞으면 넘기는 것이었다.
       * 나도 이 점에 착안해서 이 statement에서 마지막인 finalize() 에서 꼭 마무리가 되어야 하기에
       * finalize() 함수 안에다가 익명 함수를 하나 넣어서 finalize가 실행될때 같이 실행되게 해봤다.
       * 그 익명함수 안에 리졸브 넣고 콘솔로그 넣으니 다행히 완벽하게 정상 작동한다.
       * 하지만 이 경우의 해결책은 모든 for loop의 해결책은 아니고 각각의 시나리오에 맞게 해결방법이
       * 달라야 할 것 같다.
       */
      statement.finalize(() => {
        // statement.finalize() 까지 완성되는것이 꼭, 반드시 중요하다.
        print("DB에 데이터 자료 입력 완료");
        // close는 꼭 serialize() 다 끝난 뒤에. 안에 넣으면 error
        // db는 닫지 말자. 한 번 닫으면 또 쓸때 또 열어야 한다.
        // coindb.close();
        resolve("ok");
      });
    });
  });
};

// 'market' 컬럼에서 종가(close-업비트에서는 trade_price), 한국시간 읽어오기
export const readExistingCoinData = (market, timeframe) => {
  print("DB에서 자료 읽어오기 시작");
  return new Promise((resolve, reject) => {
    const query = `SELECT trade_price, candle_date_time_kst FROM '${market}'`;
    // timeframe에 맞는 db가져오기
    const db = getDBByTimeframe(timeframe);
    db.all(query, (err, rows) => {
      if (err) reject(err);
      resolve(rows);
    });
  });
};

// coin.db -> 'market' 테이블에 데이터를 하나씩만 리턴. 테이블 데이터 존재하는지 확인여부
// 리턴값 rows.length 가 0 이면 테이블 없음 -> false리턴,  1 이상이면 테이블 있음 -> true 리턴
export const checkTableExists = (market, timeframe) => {
  return new Promise((resolve, reject) => {
    const query = `PRAGMA table_info('${market}')`;
    // timeframe에 맞는 db가져오기
    const db = getDBByTimeframe(timeframe);
    db.all(query, (err, rows) => {
      if (err) reject(err);
      // row.length 가 0이면 테이블이 없고 1 이상(컬럼수)이면 테이블이 있다.
      // print("rows.length : ", rows.length);
      if (rows.length == 0) resolve(false);
      else resolve(true);
    });
  });
};

// 사용이 끝난 db는 테이블 삭제
export const dropTableIfExists = (coinTablePlaceholder, timeframe) => {
  return new Promise((resolve, reject) => {
    // timeframe에 맞는 db가져오기
    const db = getDBByTimeframe(timeframe);
    for (let i = 0, phlen = coinTablePlaceholder.length; i < phlen; i++) {
      const tablename = coinTablePlaceholder[i];
      const query = `DROP TABLE IF EXISTS '${tablename}'`;
      db.run(query, (err) => {
        if (err) reject(err);
        resolve("ok");
      });
    }
  });
};

// timeframe에 따라 맞는 db 리턴
const getDBByTimeframe = (timeframe) => {
  switch (timeframe) {
    case "1":
      return coindb1min;
    case "3":
      return coindb3min;
    case "5":
      return coindb5min;
    case "10":
      return coindb10min;
    case "15":
      return coindb15min;
    case "30":
      return coindb30min;
    case "60":
      return coindb60min;
  }
};
