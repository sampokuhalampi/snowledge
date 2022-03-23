/**

Component for showing snow record information for segment

Luonut: Markku Nirkkonen

Päivityshistoria

13.12.2021 Juho Kumara
Updated styling

5.12.2021 Juho Kumara
Snow type names, icons and skiiability values are now shown correctly.

7.11.2021 Oona Laitamaki
Updated layout design

23.10.2021 Oona Laitamaki
Changed layout design & added relative timestamp, skiability elements and sub snowtypes

18.10.2021
Moved here from Info.js

**/


import * as React from "react";
import { useMediaQuery } from "react-responsive";
import { makeStyles } from "@material-ui/core/styles";
import CardMedia from "@material-ui/core/CardMedia";
import Collapse from "@material-ui/core/Collapse";
import Divider from "@material-ui/core/Divider";
import Grid from "@material-ui/core/Grid";
import IconButton from "@material-ui/core/IconButton";
import Typography from "@material-ui/core/Typography";
import CloseIcon from "@material-ui/icons/Close";
import InputBase from "@material-ui/core/InputBase";
import Link from "@material-ui/core/Link";
{/*import UserReviewView from "./UserReviewView";*/}
import DisplaySnowType from "./DisplaySnowType";
import { Box } from "@material-ui/core";
import Button from "@material-ui/core/Button";


const useStyles = makeStyles(() => ({
  root: {
    flexGrow: 1,
  },
  addPadding: {
    padding: "5px 15px",
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
  mediumText: {
    textTransform: "none",
    padding: "3px",
    marginBottom: "5px",
    display: "flex",
    fontSize: "14px",
    color: "#000",
    fontFamily: "Josefin Sans",
  },
  timeStamp: {
    paddingTop: "10px",
    paddingBottom: "5px",
    fontFamily: "Donau",
    letterSpacing: 2,
    fontWeight: 600,
    fontSize: "medium",
  },
  dangerIcon: {
    verticalAlign: "middle",
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
  buttonsLeft: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "left",
    marginTop: "20px",
    marginBottom: "10px",

    "& Button": {
      borderRadius: "30px",
      textTransform: "none",
      width: "266px",
      height: "37px",
      fontSize: "14px",
      marginBottom: "5px",
      fontFamily: "Josefin Sans",
      color: "#FFF",
    },
  },
  blue: {
    backgroundColor: "#204376",
  },
  darkGrey: {
    backgroundColor: "#4C4C4C",
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

function SnowRecordView({ segmentdata, writeReviewEnabled, openForm, openFeedback, close, signedUser}) {
  const classes = useStyles();
  // Avalanche warning LINK
  const url = "https://www.pallaksenpollot.com/";
  // 0px  XS  600px  SM  900px  MD
  const isXS = useMediaQuery({ query: "(max-width: 599px)" });
  //const isSM = useMediaQuery({ query: "(min-width: 600px) and (max-width: 900px)" });
  const description = (segmentdata.update === null || segmentdata.update === undefined ? "" : segmentdata.update.Kuvaus);
  const isEmpty = (segmentdata.update === null || segmentdata.update === undefined ? true : checkIfEmpty());
  // eslint-disable-next-line no-unused-vars
  const [expanded, setExpanded] = React.useState(isXS ? false : true);


  // Gets boolean value of snowtype visibility, by given index (indices 1&2 are primary types, 3&4 are secondary types, 5 user type)
  function isEnabled(index) {
    if (segmentdata.update !== null && segmentdata.update !== undefined) {

      switch (index) {
      case 1:
        if (segmentdata.update.Lumi1 !== undefined) return true;
        break;
      case 2:
        if (segmentdata.update.Lumi2 !== undefined) return true;
        break;
      case 3:
        if (segmentdata.update.Lumi3 !== undefined) return true;
        break;
      case 4:
        if (segmentdata.update.Lumi4 !== undefined) return true;
        break;
      case 5:
        if (segmentdata.update.Lumi5 !== undefined) return true;
        break;
      default:
        break;
      }

      return false;
    }
  }

  function ifGuideInfoExists() {
    if(isEnabled(1) || isEnabled(2) || isEnabled(3) || isEnabled(4)) {
      return true;
    }
    return false;
  }

  function ifUserInfoExists() {
    if(isEnabled(5)) {
      return true;
    }
    return false;
  }

  function checkIfEmpty() {
    if(ifGuideInfoExists() || ifUserInfoExists()) {
      return false;
    }
    return true;
  }

  const handleExpandClick = () => {
    setExpanded(!expanded);
  };

  var guideUpdateTime = "";
  var userUpdateTime = "";

  // Parsitaan päivämäärä ja aika päivityksestä, mikäli päivitys löytyy
  if (segmentdata.update !== null && segmentdata.update !== undefined) {

    let currentTime = new Date();

    if(segmentdata.update.Aika !== null && segmentdata.update.Aika !== undefined) {
      // Datasta saadaan viimeisin päivitysaika
      let latestUpdateTime = new Date(segmentdata.update.Aika);
      guideUpdateTime = `Viimeksi päivitetty: ${getRelativeTimestamp(currentTime, latestUpdateTime)}`;
    }

    if(segmentdata.update.Käyttäjä_Aika !== null && segmentdata.update.Käyttäjä_Aika !== undefined) {
      // Datasta saadaan viimeisin päivitysaika
      let latestUpdateTime = new Date(segmentdata.update.Käyttäjä_Aika);
      userUpdateTime = `Viimeksi päivitetty: ${getRelativeTimestamp(currentTime, latestUpdateTime)}`;
    }
  }

  var dangerimage;
  var dangertext;

  // Alustetaan komponentit, mikäli valitulla segmentillä on lumivyöryvaara
  if (segmentdata !== null) {
    if (segmentdata.Lumivyöryvaara) {
      // Lumivyöryvaaran merkin tiedostonimi on !.png
      dangerimage = <Grid item xs={12} sm={12} style={{ backgroundColor: "orange", margin: 0, paddingBottom: "1%" }}>
        <img className={classes.dangerIcon} style={isXS ? { maxWidth: "15%" } : { maxWidth: "8%" }} src={process.env.PUBLIC_URL + "/icons/avalanche.svg"} alt="lumivyöryvaaran logo" />
      </Grid>;
      dangertext = <div>
        <Typography className={classes.normalText} variant="subtitle1" color="error" display="inline">Tarkista lumivyörytilanne nettisivuiltamme: </Typography>
        <Link className={classes.normalText} href={url} rel="noopener noreferrer" variant="subtitle1" display="inline">{url}</Link>
        <Grid item xs={12} sm={12} style={{ backgroundColor: "orange", margin: 0, paddingBottom: "1%" }}></Grid>
      </div>;
    } else {
      dangerimage = <div />;
      dangertext = null;
    }
  }

  return (
    <Grid container className={classes.root}>
      <Grid container item xs={12} sm={12} style={{ backgroundColor: "#000000B3", margin: 0, paddingBottom: "1%" }}>
        {/* Button for closing snow record view */}
        <Grid item xs={12} sm={12}>
          <IconButton aria-label="close" style={isXS ? { color: "white", left: "85%" } : { color: "white", left: "90%", paddingTop: "1%", paddingBottom: 0 }} onClick={() => close()}>
            <CloseIcon />
          </IconButton>
        </Grid>

        {/* Segment name */}
        <Grid item xs={12} sm={12}>
          <Typography className={classes.bigHeaders} variant="h5" align="center" component="p">
            {segmentdata === null ? "Ei nimitietoa" : segmentdata.Nimi}
          </Typography>
        </Grid>
      </Grid>

      <Grid container style={{display: writeReviewEnabled === true ? "none" : ""}}>
        {/* Avalanche warning and icon if needed */}
        <Grid item xs={12} sm={12} align="center">
          {segmentdata === null ? null : dangerimage}
          {segmentdata === null ? null : dangertext}
        </Grid>
        
        {/* Forest segment view */}
        {segmentdata.Nimi === "Metsä" && 
          <Grid item xs={12} sm={12} container className={classes.addPadding}>
            <Grid item xs={12} sm={5} container className={classes.snowInfo}>
              <Grid item xs={4} sm={3}>
                <CardMedia 
                  component={"img"} 
                  src={process.env.PUBLIC_URL + "/icons/snowtypes-and-harms/icon_forest.svg"} 
                  alt="lumityypin logo"
                />
              </Grid>
              <Grid item container xs={8} sm={9} className={classes.snowInfo}>
                <Grid item xs={12} sm={12}>
                  <Typography className={classes.smallHeaders} variant="body1" component="p">
                    Metsäalue
                  </Typography>
                </Grid>
              </Grid>
            </Grid>
          </Grid>}
        
        {/* Pohjamaasto, kommentoi näkyviin jos halutaan näyttää */}
        {/* <Typography variant="subtitle1" align="center" component="p">
          {segmentdata === null ? "Ei tietoa pohjamaastosta" : segmentdata.Maasto}
          </Typography> */}
        {(!isEmpty) && 
          <Grid item xs={12} sm={12} container className={classes.addPadding}>

            {/* Author headers */}
            {ifGuideInfoExists() &&
              <Grid item xs={12} sm={12}>
                <Typography className={classes.smallHeaders} style={{ paddingLeft: "5px", paddingTop: (isXS ? "0px" : "5px") }} variant="body1" component="p" display="inline">Oppaiden arvio</Typography>
              </Grid>
            }
            {!ifGuideInfoExists() &&
              <Grid item xs={12} sm={12}>
                <Typography className={classes.smallHeaders} style={{ paddingLeft: "5px", paddingTop: (isXS ? "0px" : "5px") }} variant="body1" component="p" display="inline">Käyttäjäarvio</Typography>
              </Grid>
            }

            {/* Desktop view information */}
            {!isXS && <>    
              {/* Main snowtype info */}
              {isEnabled(1) &&
                <DisplaySnowType Lumilaatu={segmentdata.update.Lumilaatu_ID1} Nimi={segmentdata.update.Lumi1.Nimi} Hiihdettavyys={segmentdata.update.Lumi1.Hiihdettavyys} Main={true}/>
              }
              {/* Main snowtype info 2 */}
              {isEnabled(2) &&
                <DisplaySnowType Lumilaatu={segmentdata.update.Lumilaatu_ID2} Nimi={segmentdata.update.Lumi2.Nimi} Hiihdettavyys={segmentdata.update.Lumi2.Hiihdettavyys} Main={true}/>
              }    

              {/* Secondary snowtypes */}
              {isEnabled(3) && 
                <DisplaySnowType Lumilaatu={segmentdata.update.Toissijainen_ID1} Nimi={segmentdata.update.Lumi3.Nimi} Hiihdettavyys={segmentdata.update.Lumi3.Hiihdettavyys} Main={false}/>
              }
              {isEnabled(4) && 
                <DisplaySnowType Lumilaatu={segmentdata.update.Toissijainen_ID2} Nimi={segmentdata.update.Lumi4.Nimi} Hiihdettavyys={segmentdata.update.Lumi4.Hiihdettavyys} Main={false}/>
              }

              {ifGuideInfoExists() && <>
                {/* Description of segment, this might be changed later */}
                <Grid item xs={12} sm={12} align="start" style={{ padding: "15px 10px"}}>
                  {description !== "" &&
                    <text className={classes.normalText}>
                      {description}
                    </text>}
                </Grid>

                {/* Info about latest update time */}
                <Grid item sm={12} container>
                  <Grid item sm={5}>
                    <Typography className={classes.timeStamp} variant="body2" component="p">
                      {segmentdata.update === null || segmentdata.update === undefined ? "" : guideUpdateTime}
                    </Typography>
                  </Grid>
                </Grid >
              </>}

              {/* User-made snowtypes */}
              {ifUserInfoExists() && <Grid item xs={12} sm={12} container>
                {ifGuideInfoExists() && <>
                  <Grid item xs={12} sm={12}>
                    <Divider className={classes.divider} />
                  </Grid> 
                  <Grid item xs={12} sm={12}>
                    <Typography className={classes.smallHeaders} style={{ paddingLeft: "5px", paddingTop: (isXS ? "10px" : "5px") }} variant="body1" component="p" display="inline">Käyttäjien arvio</Typography>
                  </Grid>
                </>
                } 

                <DisplaySnowType Lumilaatu={segmentdata.update.Käyttäjä_lumilaatu} Nimi={segmentdata.update.Lumi5.Nimi} Hiihdettavyys={segmentdata.update.Lumi5.Hiihdettavyys} Main={false}/>
                
                {segmentdata.update.Käyttäjä_lisätiedot === 1 && (
                  <DisplaySnowType Lumilaatu={21} Nimi={"Kiviä"} Hiihdettavyys={null} Main={false}/>
                )}
                {segmentdata.update.Käyttäjä_lisätiedot === 2 && (
                  <DisplaySnowType Lumilaatu={22} Nimi={"Oksia"} Hiihdettavyys={null} Main={false}/>
                )}
                {segmentdata.update.Käyttäjä_lisätiedot === 3 && (
                  <>
                    <DisplaySnowType Lumilaatu={21} Nimi={"Kiviä"} Hiihdettavyys={null} Main={false}/>
                    <DisplaySnowType Lumilaatu={22} Nimi={"Oksia"} Hiihdettavyys={null} Main={false}/>
                  </>
                )}

                <Grid item xs={12} sm={12} container>
                  <Grid item xs={12} sm={5}>
                    <Typography className={classes.timeStamp} align="left" variant="body2" component="p">
                      {segmentdata.update === null || segmentdata.update === undefined ? "" : userUpdateTime}
                    </Typography>
                  </Grid>
                </Grid >
              </Grid>}
            </>}




            {/* Mobile view information */}
            {isXS && <>

              {ifGuideInfoExists() && <>
                {/* Main snowtype info */}
                {isEnabled(1) &&
                  <DisplaySnowType Lumilaatu={segmentdata.update.Lumilaatu_ID1} Nimi={segmentdata.update.Lumi1.Nimi} Hiihdettavyys={segmentdata.update.Lumi1.Hiihdettavyys} Main={true}/>
                }
                {/* Main snowtype info 2 */}
                {isEnabled(2) &&
                  <DisplaySnowType Lumilaatu={segmentdata.update.Lumilaatu_ID2} Nimi={segmentdata.update.Lumi2.Nimi} Hiihdettavyys={segmentdata.update.Lumi2.Hiihdettavyys} Main={true}/>
                }              
              </>}
              {!ifGuideInfoExists() && <>
                <DisplaySnowType Lumilaatu={segmentdata.update.Käyttäjä_lumilaatu} Nimi={segmentdata.update.Lumi5.Nimi} Hiihdettavyys={segmentdata.update.Lumi5.Hiihdettavyys} Main={true}/>
              </>}

              {!expanded &&
              <Grid item xs={12} sm={12} container>

                {/* Info about latest update time */}
                <Grid item xs={12} sm={5}>
                  <Typography className={classes.timeStamp} align="left" variant="body2" component="p">
                    {segmentdata.update === null || segmentdata.update === undefined ? "" : guideUpdateTime}
                  </Typography>
                </Grid>
              </Grid >
              }

              <Grid item xs={12} sm={12}>
                <Collapse in={expanded} timeout="auto" unmountOnExit>

                  {/* Secondary snowtypes */}
                  {isEnabled(3) && 
                    <DisplaySnowType Lumilaatu={segmentdata.update.Toissijainen_ID1} Nimi={segmentdata.update.Lumi3.Nimi} Hiihdettavyys={segmentdata.update.Lumi3.Hiihdettavyys} Main={false}/>
                  }
                  {isEnabled(4) && 
                    <DisplaySnowType Lumilaatu={segmentdata.update.Toissijainen_ID2} Nimi={segmentdata.update.Lumi4.Nimi} Hiihdettavyys={segmentdata.update.Lumi4.Hiihdettavyys} Main={false}/>
                  }

                  {ifGuideInfoExists() && <>
                    {/* Description of segment, this might be changed later */}
                    <Grid item xs={12} style={{ paddingTop: "10px"}}>
                      {description !== "" && <InputBase
                        className={classes.normalText}
                        value={description}
                        multiline
                        fullWidth={true}
                        maxRows={6}
                        disabled={true}
                      />}
                    </Grid>

                    {/* Info about latest update time */}
                    <Grid item xs={12} sm={12} container>
                      <Grid item xs={12} sm={5}>
                        <Typography className={classes.timeStamp} align="left" variant="body2" component="p">
                          {segmentdata.update === null || segmentdata.update === undefined ? "" : guideUpdateTime}
                        </Typography>
                      </Grid>
                    </Grid >
                  </>}


                  {/* User-made snowtypes */}
                  {ifUserInfoExists() && <Grid item xs={12} sm={12} container>
                    {ifGuideInfoExists() && <>
                      <Grid item xs={12} sm={12}>
                        <Divider className={classes.divider} />
                      </Grid> 
                      <Grid item xs={12} sm={12}>
                        <Typography className={classes.smallHeaders} style={{ paddingLeft: "5px", paddingTop: (isXS ? "10px" : "5px") }} variant="body1" component="p" display="inline">Käyttäjien arvio</Typography>
                      </Grid>

                      <DisplaySnowType Lumilaatu={segmentdata.update.Käyttäjä_lumilaatu} Nimi={segmentdata.update.Lumi5.Nimi} Hiihdettavyys={segmentdata.update.Lumi5.Hiihdettavyys} Main={true}/>
                    </> }
                    
                    <div>
                      {segmentdata.update.Käyttäjä_lisätiedot === 1 && (
                        <DisplaySnowType Lumilaatu={21} Nimi={"Kiviä"} Hiihdettavyys={null} Main={false}/>
                      )}
                      {segmentdata.update.Käyttäjä_lisätiedot === 2 && (
                        <DisplaySnowType Lumilaatu={22} Nimi={"Oksia"} Hiihdettavyys={null} Main={false}/>
                      )}
                      {segmentdata.update.Käyttäjä_lisätiedot === 3 && (
                        <Grid style={{display: "flex", padding: "0px 15px"}}>
                          <DisplaySnowType Lumilaatu={21} Nimi={"Kiviä"} Hiihdettavyys={null} Main={false}/>
                          <DisplaySnowType Lumilaatu={22} Nimi={"Oksia"} Hiihdettavyys={null} Main={false}/>
                        </Grid>
                      )}
                    </div>

                    <Grid item xs={12} sm={12} container>
                      <Grid item xs={12} sm={5}>
                        <Typography className={classes.timeStamp} align="left" variant="body2" component="p">
                          {segmentdata.update === null || segmentdata.update === undefined ? "" : userUpdateTime}
                        </Typography>
                      </Grid>
                    </Grid >

                  </Grid>}

                  {/* Sponsor logos */}
                  {(isXS && segmentdata.Nimi !== "Metsä") && <Grid container item xs={12} className={classes.sponsorContainer} >
                    {/*<Grid item xs={6}>
                      <a href="https://www.google.com/" target="_blank" rel="noopener noreferrer">
                        <img src="sponsor.png" alt="Sponsor logo" className={classes.sponsor} />
                      </a>
                    </Grid>
                    <Grid item xs={6}>
                      <a href="https://www.google.fi/maps/" target="_blank" rel="noopener noreferrer">
                        <img src="" alt="sponsor2.png" className={classes.sponsor} />
                      </a>
                    </Grid>*/}
                  </Grid>}

                  {/*<UserReviewView segmentdata={segmentdata} writeReviewEnabled ={writeReviewEnabled}/>*/}
                </Collapse>
              </Grid>
            </>}


            {/* Snow review buttons */}
            {!signedUser && ( 
              <Grid item xs={12} sm={12}>
                <Collapse in={expanded} timeout="auto" unmountOnExit>
                  
                  <Divider className={classes.divider} />

                  <Box className={classes.buttonsLeft}>       
                    <Typography className={classes.mediumText}>Liikuitko alueella?</Typography> 

                    <Button variant="contained" className={classes.blue} onClick={openForm}>Kyllä, lisää arvio lumitilanteesta.</Button>
                    <Button variant="contained" className={classes.darkGrey} onClick={openFeedback}>Lisää muu havainto.</Button>
                  </Box>
                </Collapse>
              </Grid>
            )}

            {(isXS && (isEnabled(3) || isEnabled(4) || isEnabled(5) || description !== "")) &&
            <Grid item xs={12} align="center">
              <IconButton
                className={expanded ? classes.expandOpen : classes.expandClosed}
                style={{ padding: 0 }}
                onClick={handleExpandClick}
                aria-expanded={expanded}
                aria-label="show more"
              >
                <img src={`${process.env.PUBLIC_URL}/icons/expand.svg`} width="80%" height="15px" alt="expand" fill="black"></img>
              </IconButton>
            </Grid>
            }
          </Grid>}
        {(isEmpty) && 
          <div className={classes.addPadding}>
            <Typography className={classes.timeStamp}>
              Ei havaintoja alueelta.
            </Typography>

            {!signedUser && (
              <Box className={classes.buttonsLeft}>       
                <Typography className={classes.mediumText}>Liikuitko alueella?</Typography> 

                <Button variant="contained" className={classes.blue} onClick={openForm}>Kyllä, lisää arvio lumitilanteesta.</Button>
                <Button variant="contained" className={classes.darkGrey} onClick={openFeedback}>Lisää muu havainto.</Button>
              </Box>
            )}

          </div>
        }
      </Grid>
    </Grid> 
  );
}

export default SnowRecordView;
