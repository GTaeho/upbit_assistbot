import sqlite3 from "sqlite3";

/**
 * users db 테이블 설명
 * id : 자동생성 인덱스
 * username : 텔레그램 사용자 id
 * userfullname : 성 + 이름 합친 이름
 * chatid : 채팅 id (메세지 보낼때 사용)
 * lastcmd : 마지막 명령어를 보낸 date. Thu Mar 17 2022 14:49:46 GMT+0900 (대한민국 표준시) 이렇게 들어옴
 */
const db = new sqlite3.Database("./db/users.db");

// db 개수 빨리 세서 리턴
export const fastIDCount = () => {
  return new Promise((resolve, reject) => {
    const fastCountQuery = `SELECT COUNT(id) from users`;
    db.get(fastCountQuery, (err, row) => {
      if (err) reject(err);
      const result = row["COUNT(id)"];
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
