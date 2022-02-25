import React from "react";

function UserReviewView({segmentdata}) {

  let timeSinceUpdate = "";
  let userTime = null;
  let userSnowType = null;
  let userReview = null;

  function GetUserRecords(){
    if (segmentdata.update != null){
      userTime = segmentdata.update.Käyttäjä_Aika;
      userReview = segmentdata.update.Käyttäjä_Arviointi;
      userSnowType = segmentdata.update.Käyttäjä_lumilaatu;

    }
  }

  function getRelativeTimestamp(current, previous) {
    const msPerMinute = 60 * 1000;
    const msPerHour = msPerMinute * 60;
    const msPerDay = msPerHour * 24;
    const msPerMonth = msPerDay * 30;
    const msPerYear = msPerDay * 365;

    const elapsed = current - previous;

    if (elapsed < msPerMinute) {
      if (Math.round(elapsed / 1000) == 1) {
        return "1 sekunti sitten";
      }
      return `${Math.round(elapsed / 1000)} sekuntia sitten`;
    } else if (elapsed < msPerHour) {
      if (Math.round(elapsed / msPerMinute) == 1) {
        return "1 minuutti sitten";
      }
      return `${Math.round(elapsed / msPerMinute)} minuuttia sitten`;
    } else if (elapsed < msPerDay) {
      if (Math.round(elapsed / msPerHour) == 1) {
        return "1 tunti sitten";
      }
      return `${Math.round(elapsed / msPerHour)} tuntia sitten`;
    } else if (elapsed < msPerMonth) {
      if (Math.round(elapsed / msPerDay) == 1) {
        return "1 päivä sitten";
      }
      return `noin ${Math.round(elapsed / msPerDay)} päivää sitten`;
    } else if (elapsed < msPerYear) {
      if (Math.round(elapsed / msPerMonth) == 1) {
        return "1 kuukausi sitten";
      }
      return `noin ${Math.round(elapsed / msPerMonth)} kuukautta sitten`;
    } else {
      if (Math.round(elapsed / msPerYear) == 1) {
        return "1 vuosi sitten";
      }
      return `noin ${Math.round(elapsed / msPerYear)} vuotta sitten`;
    }
  }

  //"Main" Functions
  GetUserRecords();
  let latestUpdateTime = new Date(userTime);
  let currentTime = new Date();
  if (userTime != null){
    timeSinceUpdate = `Viimeksi päivitetty: ${getRelativeTimestamp(currentTime, latestUpdateTime)}`;
  }




  return (
    <div>
      Käyttäjien arvio
      <p>Käyttäjä Lumilaatu: {userSnowType === null ? "Ei saatavilla" : userSnowType}</p>
      {console.log(userSnowType)}
      <p>Käyttäjä Arvio Prosentti: {userReview === null ? "Ei saatavilla" : 100 * userReview + "%"} </p>
      <p>{userTime === null ? " Aikaa ei saatavilla" : timeSinceUpdate}</p>

      {console.log(segmentdata)}
    </div>

  );
}

export default UserReviewView;