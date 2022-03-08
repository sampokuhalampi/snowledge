import React from "react";
import Grid from "@material-ui/core/Grid";
import CardMedia from "@material-ui/core/CardMedia";
import Typography from "@material-ui/core/Typography";
import {makeStyles} from "@material-ui/core/styles";
import {useMediaQuery} from "react-responsive";
import Divider from "@material-ui/core/Divider";

const useStyles = makeStyles(() => ({
  root: {
    flexGrow: 1,
  },
  addPadding: {
    padding: "15px",
  },
  close: {
    color: "white",
    left: "85%",
  },
  divider: {
    height: "1px",
    background: "#707070",
    margin: 5,
  },
  snowInfo: {
    alignContent: "center",
  },
  bigHeaders: {
    fontFamily: "Donau",
    letterSpacing: 4,
    textTransform: "uppercase",
    fontWeight: 600,
    display: "block",
    color: "white",
  },
  smallHeaders: {
    fontFamily: "Donau",
    letterSpacing: 2,
    textTransform: "uppercase",
    fontWeight: 600,
    display: "block",
    fontSize: "medium",
  },
  normalText: {
    fontFamily: "Donau",
    letterSpacing: 2,
    fontWeight: 300,
    fontSize: "medium",
  },
  timeStamp: {
    fontFamily: "Donau",
    letterSpacing: 2,
    fontWeight: 600,
    fontSize: "medium",
  },
  dangerIcon: {
    verticalAlign: "middle",
  },
  skiabilityIcon: {
    height: "16px",
    width: "90px",
    display: "block",
  },
  expandOpen: {
    transform: "rotate(-180deg)"
  },
  expandClosed: {
    transform: "rotate(0)"
  },
  sponsorContainer: {
    flex: 1,
    display: "flex",
    justifyContent: "center",
    flexWrap: "wrap",
    paddingTop: "10px",
    paddingBottom: "5px"
  },
  sponsor: {
    width: "100px",
    height: "100px",
    padding: "10px"
  },
}));

function UserReviewView({segmentdata, writeReviewEnabled}) {
  const classes = useStyles();
  const isXS = useMediaQuery({ query: "(max-width: 599px)" });

  let timeSinceUpdate = "";
  let userTime = null;
  let userReview = null;
  const userSnowData = {
    name: null,
    skiability: null,
    snowtypeID: null
  };


  function GetUserRecords(){
    if (segmentdata.update !== undefined && segmentdata.update !== null){
      userTime = segmentdata.update.Käyttäjä_Aika;
      userReview = segmentdata.update.Käyttäjä_Arviointi;
      userSnowData.snowtypeID = segmentdata.update.Käyttäjä_lumilaatu;
      if (segmentdata.update.Lumi5 !== undefined && segmentdata.update.Lumi5 !== null){
        userSnowData.name = segmentdata.update.Lumi5.Nimi;
        userSnowData.skiability = segmentdata.update.Lumi5.Hiihdettavyys;
      }
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

  GetUserRecords();
  let latestUpdateTime = new Date(userTime);
  let currentTime = new Date();
  if (userTime != null){
    timeSinceUpdate = `Viimeksi päivitetty: ${getRelativeTimestamp(currentTime, latestUpdateTime)}`;
  }


  return (

    <div style={{display: writeReviewEnabled  === true  || userSnowData.name === null ? "none" : ""}} className={classes.addPadding}>
      <Grid item xs={12} sm={12}>
        <Typography className={classes.smallHeaders} style={{ paddingLeft: "5px", paddingTop: (isXS ? "0px" : "5px") }} variant="body1" component="p" display="inline">Käyttäjäarvio</Typography>
      </Grid>
      <Grid item xs={12} sm={12}>
        <Divider className={classes.divider} />
      </Grid>

      {userSnowData.name !== null && <Grid item xs={12} sm={4} style={{ paddingTop: (isXS ? "0px" : "10px") }} className={classes.addPadding} container>
        <Grid item xs={3} sm={3}>
          {
            <CardMedia
              component={"img"}
              src={process.env.PUBLIC_URL + "/icons/snowtypes-and-harms/" + userSnowData.snowtypeID + ".svg"}
              alt="lumityypin logo"
            />
          }
        </Grid>
        <Grid item container xs={9} sm={9} className={classes.snowInfo}>
          <Grid item xs={12} sm={12}>
            <Typography className={classes.smallHeaders} variant="body1" component="p">
              {userSnowData.name}
            </Typography>
          </Grid>
          {userSnowData.skiability !== null &&
              <Grid item xs={12} sm={12}>
                <Typography xs={12} sm={12} className={classes.normalText} variant="body2" component="p">
                  Hiihdettävyys
                  <img className={classes.skiabilityIcon} src={process.env.PUBLIC_URL + "/icons/skiability/" + userSnowData.skiability + ".svg"} alt="skiability" />
                </Typography>
              </Grid>}
        </Grid>
      </Grid>}

      <p>Käyttäjä Arvio Prosentti: {userReview === null ? "Ei saatavilla" : 100 * userReview + "%"} </p>
      <Typography className={classes.timeStamp} align="left" variant="body2" component="p">
        <p>{userTime === null ? " Aikaa ei saatavilla" : timeSinceUpdate}</p>
      </Typography>
    </div>

  );
}

export default UserReviewView;