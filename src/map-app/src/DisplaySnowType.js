import React from "react";
import Typography from "@material-ui/core/Typography";
import { makeStyles } from "@material-ui/core/styles";
import { CardMedia } from "@material-ui/core";
import Grid from "@material-ui/core/Grid";
import { useMediaQuery } from "react-responsive";


// eslint-disable-next-line no-unused-vars
const useStyles = makeStyles(() => ({

  snowInfo: {
    alignContent: "center",
  },
  mainheaders: {
    fontFamily: "Donau",
    letterSpacing: 2,
    textTransform: "uppercase",
    fontWeight: 600,
    display: "block",
    fontSize: "medium",
  },
  secondaryHeaders: {
    fontFamily: "Donau",
    letterSpacing: 2,
    textTransform: "uppercase",
    fontWeight: 600,
    display: "block",
    fontSize: "small",
  },
  mainText: {
    fontFamily: "Donau",
    letterSpacing: 2,
    fontWeight: 300,
    fontSize: "medium",
  },
  secondaryText: {
    fontFamily: "Donau",
    letterSpacing: 2,
    fontWeight: 300,
    fontSize: "small",
  },
  mainskiabilityIcon: {
    height: "16px",
    width: "90px",
    display: "block",
  },
  secondarySkiabilityIcon: {
    height: "16px",
    width: "90px",
    display: "block",
  },
  snowtypeIconBig: {
    display: "block",
    margin: "auto",
    width: "100%",
  },
  snowtypeIconSmall: {
    display: "block",
    margin: "auto",
    width: "75%",
  },
}));
  

function DisplaySnowType(props) {

  const classes = useStyles();
  const isXS = useMediaQuery({ query: "(max-width: 599px)" });

  const inline = isStonesOrBranches();

  function isStonesOrBranches () {
    if (props.Lumilaatu === 21 || props.Lumilaatu === 22) {
      return true;
    }
    return false;
  }



  return (
    <Grid item xs={inline ? 6 : 12} sm={5} style={{ paddingTop: (isXS ? "0px" : "10px") }} container>
      <Grid item xs={inline ? 6 : 4} sm={3}>
        {
          <CardMedia
            component={"img"}
            className={props.Main? classes.snowtypeIconBig : classes.snowtypeIconSmall}
            src={process.env.PUBLIC_URL + "/icons/snowtypes-and-harms/" + props.Lumilaatu + ".svg"}
            alt="lumityypin logo"
          />
        }
      </Grid>

      <Grid item container xs={inline ? 6 : 8} sm={9} className={classes.snowInfo}>
        <Grid item xs={12} sm={12}>
          <Typography className={props.Main? classes.mainheaders : classes.secondaryHeaders} variant="body1" component="p">
            {props.Nimi}
          </Typography>
        </Grid>

        {props.Hiihdettavyys !== null &&
        <Grid item xs={12} sm={12}>
          <Typography xs={12} sm={12} className={props.Main? classes.mainText : classes.secondaryText} variant="body2" component="p">
            Hiihdettävyys
            <img className={props.Main? classes.mainskiabilityIcon : classes.secondarySkiabilityIcon} src={process.env.PUBLIC_URL + "/icons/skiability/" + props.Hiihdettavyys + ".svg"} alt="skiability" />
          </Typography>
        </Grid>}
      </Grid>
    </Grid>
  );
}

export default DisplaySnowType;