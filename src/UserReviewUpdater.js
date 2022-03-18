const cron = require("node-cron");
const date = require("date-and-time");
const database = require("./routers/objectRouters/database");

//SQL Functions to read and modify database
const sqlQuery = (query) => {
  return new Promise (function (resolve, reject){
    database.query(query, function (err, results){
      if (err) {reject(err);}
      resolve(results);
    });
  });
};

const sqlInsert = (userTime, userSnowType, userInformation, segment) => {
  return new Promise (function (resolve, reject) {
    database.query("UPDATE Paivitykset SET Käyttäjä_Aika=?, Käyttäjä_lumilaatu=?, Käyttäjä_lisätiedot=? WHERE Segmentti=? order by Aika desc limit 1;",
      [
        userTime,
        userSnowType,
        userInformation,
        segment
      ],
      function (err,results){
        if (err) {reject(err);}
        resolve(results);
      });
  });
};

const sqlUpdate = (userTime, userSnowType, userInformation, segment) => {
  return new Promise (function (resolve, reject){
    database.query("INSERT INTO Paivitykset (Aika, Käyttäjä_Aika, Käyttäjä_lumilaatu, Käyttäjä_lisätiedot, Segmentti)  VALUES (?, ?, ?, ?, ? );",
      [
        userTime,
        userTime,
        userSnowType,
        userInformation,
        segment
      ],
      function (err,results){
        if (err) {reject(err);}
        resolve(results);
      });
  });
};


function isObjectEmpty(obj) {
  return Object.keys(obj).length;
}


//
const userReviewUpdater = cron.schedule("*/5 * * * * *", async () => {
  console.log("Updating user reviews...");

  const segmentCount = await sqlQuery("SELECT ID FROM Segmentit order by ID desc limit 1;").then(function (results) {
    results = JSON.parse(JSON.stringify(results));
    return results[0].ID;
  });

  for (let i=0; i<segmentCount; i++){
    const userReviewQuery = "SELECT Segmentti, Lumilaatu, Lisätiedot, Aika FROM KayttajaArviot WHERE Segmentti = " + (i + 1) + " order by Aika desc limit 1;";
    const segmentQuery = "SELECT Segmentti FROM Paivitykset WHERE Segmentti = " + (i + 1) + " ORDER BY Aika DESC LIMIT 1;";

    const userReview = await sqlQuery(userReviewQuery).then(function (results){
      results=JSON.parse(JSON.stringify(results));
      return results;
    });

    const segment = await sqlQuery(segmentQuery).then(function (results){
      results=JSON.parse(JSON.stringify(results));
      return results;
    });

    if (isObjectEmpty(userReview) !== 0){
      console.log(isObjectEmpty(segment));
      console.log("Updating segment " + (i+1) + "...");
      const timeString = date.format(new Date(userReview[0].Aika), "YYYY-MM-DD HH:mm:ss", true);

      if(isObjectEmpty(segment) !==0){
        await sqlInsert(timeString, userReview[0].Lumilaatu, userReview[0].Lisätiedot, userReview[0].Segmentti).then(function (){
          console.log("Segment updated");
        });
      }

      else {
        await sqlUpdate(timeString, userReview[0].Lumilaatu, userReview[0].Lisätiedot, userReview[0].Segmentti).then(function (){
          console.log("Segment added");
        });
      }
    }
  }

  console.log("All segments updated");
});


module.exports = userReviewUpdater;

