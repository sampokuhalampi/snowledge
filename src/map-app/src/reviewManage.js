import * as React from "react";
import IconButton from "@material-ui/core/IconButton";
import Box from "@material-ui/core/Box";
import Grid from "@material-ui/core/Grid";
import { makeStyles } from "@material-ui/core/styles";
import Card from "@material-ui/core/Card";
import CardHeader from "@material-ui/core/CardHeader";
import CardContent from "@material-ui/core/CardContent";
import MoreVertIcon from "@material-ui/icons/MoreVert";
import { Typography } from "@material-ui/core";
import { CardMedia } from "@material-ui/core";

const useStyles = makeStyles((theme) => ({
  userCard: {
    padding: theme.spacing(1),
    maxWidth: 400,
    margin: "auto",
    marginTop: 10
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
  }, []);
  /*
   * Event handlers
   */

  // Arvioinnit haetaan
  const fetchReviews = async () => {
    const snow = await fetch("api/lumilaadut");
    // eslint-disable-next-line no-unused-vars
    const snowdata = await snow.json();
    const reviews = await fetch("api/allReviews");
    const data = await reviews.json();
    const segments = await fetch("api/segments");
    // eslint-disable-next-line no-unused-vars
    const segmentdata = await segments.json();

    let currentTime = new Date();

    await data.forEach(item => {

      let latestUpdateTime = new Date(item.Aika);
      item.TimeString = `${getRelativeTimestamp(currentTime, latestUpdateTime)}`;

      {/* 
      item.Snow = null;
      item.SegmentName = "";

      
      for (let snowItem of snowdata) {
        if(item.Lumilaatu === snowItem.ID) {
          item.Snow = snowItem;
          break;
        }
      }

      for(let s of segmentdata) {
        if(item.Segmentti === s.ID) {
          item.SegmentName = s.Nimi;
          break;
        }
      }
      */}
    });
    setReviewData(data);
    console.log("got reviewData!!");
    console.log(data);

  };

   
 
  // Renderöinti
  return (  
    <div>
      
      {/* Käyttäjäkortit */}
      <Box className={classes.cardContainer}>
        <Grid container spacing={0}> 
          
          {/* Luodaan jokaiselle käyttäjälle oma kortti */}
          {
            reviewData === null || reviewData === undefined
              ? 
              <div />
              :
              reviewData.map((item, index) => {
                return (
                  <Grid key={index} item xs={12} sm={4}>
                    <Card className={classes.userCard}>
                      <CardHeader 
                        title={item.Nimi === null ? "" : item.Nimi}
                        action={
                          <IconButton id={item.ID} aria-label="close">
                            <MoreVertIcon />
                          </IconButton>
                        }
                      />
                  

                      <CardContent>

                        {item.Lumi !== null &&
                          <Grid item xs={10} sm={10} spacing={2} container>                 
                            <Grid item xs={6} sm={3}>
                              {
                                <CardMedia
                                  component={"img"}
                                  src={process.env.PUBLIC_URL + "/icons/snowtypes-and-harms/" + item.ID + ".svg"}
                                  alt="lumityypin logo"
                                />
                              }
                            </Grid>

                            <Grid item container xs={6} sm={9} className={classes.snowInfo}>
                              <Grid item xs={12} sm={12}>
                                <Typography className={classes.smallHeaders} variant="body1" component="p">
                                  {item.Lumilaatu}
                                </Typography>
                              </Grid>
                            </Grid>
                          </Grid>
                        }

                        {item.Kommentti !== null &&
                          <p>{item.Kommentti}</p>                     
                        }


                        <Typography>{item.TimeString}</Typography>


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