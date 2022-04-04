import * as React from "react";
import Box from "@material-ui/core/Box";
import Grid from "@material-ui/core/Grid";
import { makeStyles } from "@material-ui/core/styles";
import Card from "@material-ui/core/Card";
import CardHeader from "@material-ui/core/CardHeader";
import CardContent from "@material-ui/core/CardContent";
import { Typography } from "@material-ui/core";
import { CardMedia } from "@material-ui/core";

const useStyles = makeStyles(() => ({
  userCard: {
    widht: "90%",
    margin: "10px",
  },
  cardContainer: {
    flexGrow: 1,
    marginTop: 10,
  },
  coordinateInputs: {
    display: "flex"
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
  snowInfo: {
    alignContent: "center",
  },
  timeStamp: {
    paddingTop: "10px",
    fontFamily: "Donau",
    letterSpacing: 2,
    fontWeight: 600,
    fontSize: "medium",
  },
}));


function getRelativeTimestamp(current, previous) {
  var msPerMinute = 60 * 1000;
  var msPerHour = msPerMinute * 60;
  var msPerDay = msPerHour * 24;
  var msPerMonth = msPerDay * 30;
  var msPerYear = msPerDay * 365;

  var elapsed = current - previous;

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

// eslint-disable-next-line no-unused-vars
function ReviewManage(props) {

  const classes = useStyles();

  // Hooks
  const [reviewData, setReviewData] = React.useState([]);

  React.useEffect(() => {
    fetchReviews();
    
    const interval = setInterval(() => {
      fetchReviews();
    }, 10000);

    return () => clearInterval(interval);
  }, []);
  /*
   * Event handlers
   */

  // Arvioinnit haetaan
  const fetchReviews = async () => {
    const reviews = await fetch("api/allReviews");
    const data = await reviews.json();

    let currentTime = new Date();

    await data.forEach(item => {

      let latestUpdateTime = new Date(item.Aika);
      item.TimeString = `${getRelativeTimestamp(currentTime, latestUpdateTime)}`;
    });
    setReviewData(data);
  };

 
  // Renderöinti
  return (  
    <div>
      
      <Box className={classes.cardContainer}>
        <Grid container spacing={0}> 
          
          {/* Luodaan jokaiselle arviolle oma kortti */}
          {
            reviewData.length === 0
              ? 
              <p style={{padding: "10px"}}>Ei käyttäjäarvioita</p>
              :
              reviewData.map((item, index) => {
                return (
                  <Grid key={index} item xs={12} sm={12}>
                    <Card className={classes.userCard}>
                      <CardHeader 
                        title={item.Segmentti === null ? "" : item.Segmentti}
                        className={classes.normalText}
                      />
                  

                      <CardContent>

                        {item.Lumilaatu !== null &&
                          <Grid item xs={10} sm={10} spacing={2} container>                 
                            <Grid item xs={6} sm={1}>
                              {
                                <CardMedia
                                  component={"img"}
                                  src={process.env.PUBLIC_URL + "/icons/snowtypes-and-harms/" + item.Lumilaatu + ".svg"}
                                  alt="lumityypin logo"
                                />
                              }
                            </Grid>

                            <Grid item container xs={6} sm={11} className={classes.snowInfo}>
                              <Grid item xs={12} sm={12}>
                                <Typography className={classes.smallHeaders} variant="body1" component="p">
                                  {item.Lumi}
                                </Typography>
                              </Grid>
                            </Grid>
                          </Grid>
                        }

                        {item.Kommentti !== null &&
                          <p>{item.Kommentti}</p>                     
                        }


                        <Typography className={classes.timeStamp}>{item.TimeString}</Typography>


                      </CardContent>
                    </Card>                 
                  </Grid>
                );
              })
          }  
        </Grid>   
      </Box>
    </div>
  );
  
}

export default ReviewManage;