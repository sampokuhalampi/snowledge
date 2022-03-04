import React from "react";
import Button from "@material-ui/core/Button";
import { IconButton } from "@material-ui/core";
import Typography from "@material-ui/core/Typography";
import { makeStyles } from "@material-ui/core/styles";
import { Box } from "@material-ui/core";
import { CardMedia } from "@material-ui/core";
import { TextField } from "@material-ui/core";


// eslint-disable-next-line no-unused-vars
const useStyles = makeStyles(() => ({

  snowInfo: {
    width: "30px",
    height: "30px",
    marginRight: "5px",
  },

  smallHeaders: {
    padding: "3px",
    marginTop: "5px",
    marginLeft: "20px",
    marginRight: "20px",
    marginBottom: "5px",
    display: "flex",
    fontSize: "18px",
    justifyContent: "center",
    color: "#000",
    fontFamily: "Josefin Sans",
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
    margin: "20px",
  },
  textFields: {
    borderRadius: "30px",
    width: "100%",
  },
}));



function WriteUserReview(props) {

  const styles = useStyles();
  //const isXS = useMediaQuery({ query: "(max-width: 599px)" });
  
  const [view, setView] = React.useState("category");
  const [writeReviewEnabled, setWriteReviewEnabled] = React.useState(false);
  const [allSnowTypes, setAllSnowTypes] = React.useState([]);
  const [snowData, setSnowData] = React.useState([]);
  const [selectedType, setSelectedType] = React.useState(null);
  const [text, setText] = React.useState("");
  //const [onlyFeedback, setOnlyFeedback] = React.useState(false);


  //Haetaan kaikki review-data tietokannasta ------ vain debug tarkoituksiin
  
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

  
  async function getSnowTypes() {
    const snow = await fetch("api/lumilaadut");
    const data = await snow.json();
    setAllSnowTypes(data);
    console.log(data);
  }
  


  function fetchSnowTypes(category) {

    setView("selection");

    if (category === "1") {
      setSnowData([allSnowTypes[3], allSnowTypes[9], allSnowTypes[8], allSnowTypes[7]]);

    } else if (category === "2") {
      setSnowData([allSnowTypes[4], allSnowTypes[11], allSnowTypes[10], allSnowTypes[12]]);

    } else if (category === "3") {
      setSnowData([allSnowTypes[2], allSnowTypes[16]]);

    } else if (category === "4") {
      setSnowData([allSnowTypes[1], allSnowTypes[17], allSnowTypes[18]]);
      
    } else if (category === "5") {
      setSnowData([allSnowTypes[0], allSnowTypes[15], allSnowTypes[13], allSnowTypes[14]]);

    } else if (category === "6") {
      setSnowData([allSnowTypes[5]]);
    }
  }

  const clearState = () => {
    setView("category");
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

  async function setEnabled(snowSelection) {

    setWriteReviewEnabled(true);
    clearState();
    props.open();

    if(snowSelection === false) {
      setView("feedback");
      //setOnlyFeedback(true);
    } else {
      getSnowTypes();
    }
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
              <Typography variant="h5" className={styles.mediumText}>Muu huomio tai terveiset Pallaksen Pöllöille: </Typography>
              <TextField className={styles.textFields} value={text} maxRows={6} onChange={updateText} placeholder="Kirjoita..." multiline variant="outlined" />
            </Box>    

            <Box className={styles.buttonsRight}>         
              <Button variant="contained" className={styles.darkGrey} onClick={setDisabled}>Sulje</Button>
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

          <Button variant="contained" className={styles.blue} onClick={() => setEnabled(true)}>Kyllä, lisää arvio lumitilanteesta.</Button>

          <Button variant="contained" className={styles.darkGrey} onClick={() => setEnabled(false)}>Ei, lisää varoitus tai muu huomio.</Button>
        </Box>

      </div>
    );
  }
  
}

export default WriteUserReview;