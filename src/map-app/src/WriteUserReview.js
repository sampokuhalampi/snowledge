import React from "react";
import Button from "@material-ui/core/Button";
import { useMediaQuery } from "react-responsive";
import { IconButton } from "@material-ui/core";
import Typography from "@material-ui/core/Typography";
import { makeStyles } from "@material-ui/core/styles";
import { Box } from "@material-ui/core";
import { CardMedia } from "@material-ui/core";
import Grid from "@material-ui/core/Grid";
import CloseIcon from "@material-ui/icons/Close";
import { TextField } from "@material-ui/core";


// eslint-disable-next-line no-unused-vars
const useStyles = makeStyles(() => ({
  
  root: {
  },

  snowInfo: {
    width: "30px",
    height: "30px",
    marginRight: "5px",
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
    fontFamily: "Josefin Sans",
    padding: "3px",
    marginTop: "5px",
    marginLeft: "20px",
    marginRight: "20px",
    marginBottom: "5px",
    display: "flex",
    fontSize: "18px",
    justifyContent: "center",
  },

  mediumText: {
    fontFamily: "Josefin Sans",
    textTransform: "none",
    padding: "3px",
    marginBottom: "5px",
    display: "flex",
    fontSize: "14px",
    color: "#000",
  },

  buttonsLeft: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "left",
    alignItems: "left",
    marginTop: "20px",
    marginBottom: "20px",
    marginLeft: "10px",

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

  buttonsRight: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "right",
    alignItems: "right",
    margin: "10px",

    "& Button": {
      borderRadius: "30px",
      textTransform: "none",
      width: "94px",
      height: "37px",
      fontSize: "14px",
      marginBottom: "5px",
      marginRight: "10px",
      fontFamily: "Josefin Sans",
      color: "#FFF",
    },
  },

  buttonsCenter: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",

    "& Button": {
      borderRadius: "30px",
      textTransform: "lowercase",
      width: "181px",
      height: "60px",
      fontSize: "16px",
      marginBottom: "10px",
      fontFamily: "Josefin Sans",
      color: "#FFF",
    },
  },

  buttonsGrid: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",

    "& Button": {
      borderRadius: "30px",
      textTransform: "none",
      width: "181px",
      height: "60px",
      fontSize: "16px",
      marginBottom: "10px",
      fontFamily: "Josefin Sans",
      color: "#000",
      borderWidth: 2,
      borderColor: "#000",
    },
  },

  lightBlue: {
    backgroundColor: "#2B8ED6",
  },
  purple: {
    backgroundColor: "#9A8ABC",
  },
  lime: {
    backgroundColor: "#4C9F9A",
  },
  grey: {
    backgroundColor: "#949494",
  },
  blue: {
    backgroundColor: "#204376",
  },
  brown: {
    backgroundColor: "#4C3333",
  },
  darkGrey: {
    backgroundColor: "#4C4C4C",
  },
  white: {
    backgroundColor: "#FFF",
    display: "flex",
    flexDirection: "row",
    justifyContent: "left",
    alignItems: "left",
  },

  part: {

  },
  textFields: {

  },
}));



function WriteUserReview(props) {

  const styles = useStyles();
  const isXS = useMediaQuery({ query: "(max-width: 599px)" });
  
  const [view, setView] = React.useState("category");
  const [writeReviewEnabled, setWriteReviewEnabled] = React.useState(false);
  const [snowData, setSnowData] = React.useState([]);
  const [selectedType, setSelectedType] = React.useState(null);
  const [text, setText] = React.useState("");


  console.log(props);


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
    datavalues[2] = null;

    if (selectedType !== null) {
      datavalues[2] = selectedType.ID;
    }
    datavalues[3] = text;

    const data = {
      Segmentti: datavalues[0],
      Arvio: datavalues[1],
      Lumilaatu: datavalues[2],
      Kommentti: datavalues[3],
    };

    const fetchReview = async () => {
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

    getReviews();
    fetchReview();
    clearState();
    props.close();
  };
  


  async function fetchSnowTypes(category) {

    setView("selection");
    const snow = await fetch("api/lumilaadut");
    const data = await snow.json();
    console.log(data);

    if (category === "1") {

      setSnowData([data[3], data[9], data[8], data[7]]);

    } else if (category === "2") {

      setSnowData([data[4], data[11], data[10], data[12]]);

    } else if (category === "3") {
      setSnowData([data[2], data[16]]);

    } else if (category === "4") {

      setSnowData([data[1], data[17], data[18]]);
      
    } else if (category === "5") {
      setSnowData([data[0], data[15], data[13], data[14]]);

    } else if (category === "6") {
      setSnowData([data[5]]);

    }
  }

  const clearState = () => {
    setSelectedType(null);
    setText("");
  };

  const goBack = () => {
    if(view === "category") {
      setDisabled();
    } else if (view === "selection") {
      setView("category");
    } else if (view === "feedback") {
      setView("selection");
    }

    clearState();
  };

  function setEnabled() {
    setWriteReviewEnabled(true);
    clearState();
    props.open();
  }
  function setDisabled() {
    setWriteReviewEnabled(false);
    clearState();
    props.back();
  }

  //Feedback text updating
  const updateText = (e) => {
    setText(e.target.value);
  };


  if(writeReviewEnabled === true) {

    return (
      <>
        <Grid container item xs={12} sm={12} style={{ backgroundColor: "#000000B3", margin: 0, paddingBottom: "1%" }}>
          {/* Button for closing snow record view */}
          <Grid item xs={12} sm={12}>
            <IconButton aria-label="close" style={isXS ? { color: "white", left: "85%" } : { color: "white", left: "85%", paddingTop: "1%", paddingBottom: 0 }} onClick={() => props.close()}>
              <CloseIcon />
            </IconButton>
          </Grid>

          {/* Segment name */}
          <Grid item xs={12} sm={12}>
            <Typography className={styles.bigHeaders} variant="h5" align="center" component="p">
              {props.segmentdata === null ? "Ei nimitietoa" : props.segmentdata.Nimi}
            </Typography>
          </Grid>
        </Grid>


        { view === "category" && (
          <div>
            <Typography className={styles.smallHeaders}>Käyttäjäpohjainen palaute </Typography>
      
            <hr style={{backgroundColor: "black", height: 1}}/>
      
            <Typography className={styles.smallHeaders}>Kertoisitko, oliko lumi </Typography>
      
            <Box className={styles.buttonsCenter}>
            
              <Button variant="contained" className={styles.lightBlue} onClick={() => {fetchSnowTypes("1");}}>uutta/vastasatanutta</Button>
              
              <Button variant="contained" className={styles.purple} onClick={() => {fetchSnowTypes("2");}}>tuulen muovaamaa</Button>
              
              <Button variant="contained" className={styles.lime} onClick={() => {fetchSnowTypes("3");}}>jäistä</Button>
              
              <Button variant="contained" className={styles.grey} onClick={() => {fetchSnowTypes("4");}}>märkää</Button>
              
              <Button variant="contained" className={styles.blue} onClick={() => {fetchSnowTypes("5");}}>korppua</Button>
              
              <Button variant="contained" className={styles.brown} onClick={() => {fetchSnowTypes("6");}}>vähäistä</Button>
            
            </Box>

            <hr style={{backgroundColor: "black", height: 1}}/>

            <Box className={styles.buttonsRight}>
              <Button variant="contained" className={styles.darkGrey} onClick={goBack}>Takaisin</Button>
            </Box>
          </div>        
        )}



        { view === "selection" && (
          <div>
            <Typography className={styles.smallHeaders}>Käyttäjäpohjainen palaute </Typography>
            
            <hr style={{backgroundColor: "black", height: 1}}/>

            <Typography className={styles.smallHeaders}>Kertoisitko, oliko lumi </Typography>

            <Box className={styles.buttonsGrid}>
              {
                snowData.map((data, index) => {
                  return (
                    <IconButton
                      key={index} 
                      variant="outlined" 
                      className={styles.white} 
                      onClick={() => {setSelectedType(data);}}
                    >
                      <CardMedia
                        component={"img"}
                        src={process.env.PUBLIC_URL + "/icons/snowtypes-and-harms/" + data.ID + ".svg"}
                        alt="lumityypin logo"
                        className={styles.snowInfo}
                      />
                      <Typography className="mediumText">{data.Nimi}</Typography>
                    </IconButton>                  
                  );
                })
              }
            </Box>

            { selectedType !== null && (
              <Typography className = "mediumText">{selectedType.Lumityyppi_selite}</Typography>
            )}

            <hr style={{backgroundColor: "black", height: 1}}/>

            <Box className={styles.buttonsRight}>
              <Button variant="contained" className={styles.darkGrey} onClick={goBack}>Takaisin</Button>
              <Button variant="contained" className={styles.darkGrey} onClick={() => setView("feedback")}>Lähetä</Button>
            </Box>
          </div>
        )}

        { view === "feedback" && (
          <div>
            <Typography className={styles.smallHeaders}>Käyttäjäpohjainen palaute </Typography>
            
            <hr style={{backgroundColor: "black", height: 1}}/>

            <Typography className={styles.smallHeaders}>Kiitos palautteesta! </Typography>

            <Box className={styles.part}>
              <Typography variant="h5" className={styles.smallHeaders}>Muu huomio tai terveiset Pallaksen Pöllöille: </Typography>
              <TextField className={styles.textFields} value={text} maxRows={6} onChange={updateText} placeholder="Kirjoita..." multiline variant="outlined" />
            </Box>    

            <Box className={styles.buttonsRight}>
              <Button variant="contained" className={styles.darkGrey} onClick={goBack}>Takaisin</Button>
              <Button variant="contained" className={styles.darkGrey} onClick={postReview}>Lähetä</Button>
            </Box>        
          </div>
        )}
      </>
    );
  
  //Render review-buttons
  } else {
    return (
      <div>
        <Box className={styles.buttonsLeft}>       
          <Typography className={styles.mediumText}>Liikuitko alueella?</Typography> 

          <Button variant="contained" className={styles.blue} onClick={setEnabled}>Kyllä, lisää arvio lumitilanteesta.</Button>

          <Button variant="contained" className={styles.darkGrey} onClick={setEnabled}>Ei, lisää varoitus tai muu huomio.</Button>
        </Box>

      </div>
    );
  }
  
}

export default WriteUserReview;