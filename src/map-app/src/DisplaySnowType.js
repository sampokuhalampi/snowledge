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
  skiabilityIcon: {
    height: "16px",
    width: "90px",
    display: "block",
  },
}));
  


function DisplaySnowType(props) {

  const classes = useStyles();
  const isXS = useMediaQuery({ query: "(max-width: 599px)" });

  return (
    <Grid item xs={12} sm={4} style={{ paddingTop: (isXS ? "0px" : "10px") }} container>                 
      <Grid item xs={3} sm={3}>
        {
          <CardMedia
            component={"img"}
            src={process.env.PUBLIC_URL + "/icons/snowtypes-and-harms/" + props.Lumilaatu + ".svg"}
            alt="lumityypin logo"
          />
        }
      </Grid>

      <Grid item container xs={9} sm={9} className={classes.snowInfo}>
        <Grid item xs={12} sm={12}>
          <Typography className={classes.smallHeaders} variant="body1" component="p">
            {props.Nimi}
          </Typography>
        </Grid>

        {props.Hiihdettavyys !== null &&
        <Grid item xs={12} sm={12}>
          <Typography xs={12} sm={12} className={classes.normalText} variant="body2" component="p">
            Hiihdettävyys
            <img className={classes.skiabilityIcon} src={process.env.PUBLIC_URL + "/icons/skiability/" + props.Hiihdettavyys + ".svg"} alt="skiability" />
          </Typography>
        </Grid>}
      </Grid>
    </Grid>
  );
}

export default DisplaySnowType;