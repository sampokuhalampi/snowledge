import React from "react";
//import TextField from "@material-ui/core/TextField";
import Button from "@material-ui/core/Button";
import Typography from "@material-ui/core/Typography";
import { makeStyles } from "@material-ui/core/styles";
import { Box } from "@material-ui/core";
import { Grid } from "@material-ui/core";
import { CardMedia } from "@material-ui/core";
//import { ThemeProvider, createTheme } from "@material-ui/core/styles";

// Changes button color palette. Muuttaa nappien väripalettia.
/*
const theme = createTheme({
  palette: {
    primary: {
      main: "#000000B3"
    },
    secondary: {
      main: "#EEEEEE"
    }
  },
  overrides: {
    MuiCheckbox: {
      colorSecondary: {
        color: "#000000B3",
        "&$checked": {
          color: "#000000B3",
        },
      },
    },
  },
});
*/

// eslint-disable-next-line no-unused-vars
const useStyles = makeStyles((/*theme*/) => ({
  editButton: {
    fontFamily: "Donau",
    color: "black",
    display: "flex",
  },
  snowInfo: {
    alignContent: "center",
  },
  box: {
    padding: "7px",
    margin: "10px",
  },
  part: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    marginBottom: "15px",
    marginTop: "15px",
  },
  normalText: {
    fontFamily: "Donau",
    letterSpacing: 2,
    fontWeight: 300,
    fontSize: "medium",
  },
  largeHeaders: {
    fontFamily: "Donau",
    fontSize: "medium",
    letterSpacing: 4,
    textTransform: "uppercase",
    fontWeight: 1000,
    display: "block",
  },
  smallHeaders: {
    fontFamily: "Donau",
    padding: "3px",
    marginTop: "5px",
    marginBottom: "5px",
    letterSpacing: 2,
    fontWeight: 300,
    display: "flex",
    fontSize: "medium",
    justifyContent: "center",
  },
  buttons: {
    paddingLeft: 66,
    paddingRight: 56,
    position: "relative",
    borderRadius: "10px",

    "& .MuiButton-endIcon": {
      position: "absolute",
      right: 16
    }
  },
  buttonsWrapper: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
  },
  item: {
    padding: "10px",
    marginTop: "3px",
    marginBottom: "3px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    borderRadius: "10px",
  },
  textFields: {
    fontFamily: "Donau",
    borderRadius: "10px",
  },
}));


function WriteUserReview(props) {

  const styles = useStyles();
  const [view, setView] = React.useState("category");
  const [selection, setSelection] = React.useState("");
  //const [snowType, setSnowType] = React.useState("");

  //Haetaan kaikki review-data tietokannasta
  const getReviews = async () => {

    const reviews = await fetch("api/reviews");
    const reviewData = await reviews.json();

    console.log("Reviews: ");
    console.log(reviewData);
  };

  //Kun käyttäjä arvioi lumitietoja, lähetetään POST -methodin api- kutsu api/review
  const postReview = () => {

    let datavalues = [];
    datavalues[0] = props.segmentdata.ID;
    datavalues[1] = null;
    datavalues[2] = 6;
    datavalues[3] = "Hello world";

    const data = {
      Segmentti: datavalues[0],
      Arvio: datavalues[1],
      Lumilaatu: datavalues[2],
      Kommentti: datavalues[3],
    };

    const fetchReview = async () => {
    //setLoading(true);
      const response = await fetch("api/review/" + props.segmentdata.ID,
        {
          method: "POST",
          headers: {
            "Accept": "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        });
      const res = await response.json();
      console.log(res);
    };
    fetchReview();
    getReviews();
  };

  const sendSelection = (s) => {
    setSelection(s);
    setView("selection");
  };

  if(props.writeReviewEnabled === true) {

    //Snow category selection view
    if(view === "category") {
      return (
        <div>
    
          <Typography className={styles.smallHeaders}>Käyttäjäpohjainen seuranta </Typography>
    
          <hr style={{backgroundColor: "black", height: 1}}/>
    
          <Typography className={styles.smallHeaders}>Kertoisitko, oliko lumi </Typography>
    
          <Box className={styles.buttonsWrapper}>
          
            <Button variant="contained" onClick={() => {sendSelection("0");}}>uutta/vastasatanutta</Button>
            
            <Button variant="contained" onClick={() => {sendSelection("1");}}>tuulen muovaamaa</Button>
            
            <Button variant="contained" onClick={postReview}>jäistä</Button>
            
            <Button variant="contained" onClick={postReview}>märkää</Button>
            
            <Button variant="contained" onClick={postReview}>korppua</Button>
            
            <Button variant="contained" onClick={postReview}>vähäistä</Button>
          
          </Box>
        </div>
      );


    //Snow type selection view
    } else if (view === "selection") {
      return (
        <div>
          <Typography>Tarkenna tietoa</Typography>
          
          <Typography>{selection}</Typography>

          <Grid item xs={12} sm={5} container className={styles.snowInfo}>
            <Grid item xs={4} sm={3}>
              {/* Segmentin logon tulee olla nimetty segmentin ID:n kanssa yhtenevästi */}
              <CardMedia
                component={"img"}
                src={process.env.PUBLIC_URL + "/icons/snowtypes-and-harms/" + 1 + ".svg"}
                alt="lumityypin logo"
              />
            </Grid>
          </Grid>
        </div>
      );

    //Final feedback view
    } else if (view === "feedback") {
      return (
        <div>
          <Typography>Anna palautetta</Typography>
        </div>
      );
    } else {
      return <div className="writeReview" />;
    }
  } else {
    return <div className="writeReview" />;
  }
  
}

export default WriteUserReview;