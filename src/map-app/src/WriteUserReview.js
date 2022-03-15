import React from "react";
import Button from "@material-ui/core/Button";
import { IconButton } from "@material-ui/core";
import Typography from "@material-ui/core/Typography";
import { makeStyles } from "@material-ui/core/styles";
import { Box } from "@material-ui/core";
import { CardMedia } from "@material-ui/core";
import { TextField } from "@material-ui/core";
import Grid from "@material-ui/core/Grid";
import { useMediaQuery } from "react-responsive";
import InputBase from "@material-ui/core/InputBase";


// eslint-disable-next-line no-unused-vars
const useStyles = makeStyles(() => ({

  snowInfo: {
    width: "30px",
    height: "30px",
    marginRight: "5px",
  },
  skiabilityIcon: {
    height: "16px",
    width: "90px",
    display: "block",
    marginLeft: "20px",
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

  grid: {
    margin: "10px",
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
    borderRadius: "30px",
    maxHeight: "85px",
    marginBottom: "10px",
    display: "flex",
    justifyContent: "left",
  },

  description: {
    margin: "10px",
    display: "flex",
    flexDirection: "column",
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
  const isXS = useMediaQuery({ query: "(max-width: 599px)" });
  
  const [view, setView] = React.useState(props.mode);
  const [allSnowTypes, setAllSnowTypes] = React.useState([]);
  const [snowData, setSnowData] = React.useState([]);
  const [selectedType, setSelectedType] = React.useState(null);
  const [selectedButton, setSelectedButton] = React.useState(0);
  const [stones, setStones] = React.useState(false);
  const [branches, setBranches] = React.useState(false);
  const [text, setText] = React.useState("");
  const [updateID, setUpdateID] = React.useState(null);
  //const [onlyFeedback, setOnlyFeedback] = React.useState(false);

  React.useMemo(() => {
    getSnowTypes();
  }, []);


  //Haetaan kaikki review-data tietokannasta ------ vain debug tarkoituksiin
  
  const getReviews = async () => {

    const reviews = await fetch("api/reviews");
    const reviewData = await reviews.json();

    console.log("Reviews: ");
    console.log(reviewData);
  };

  const postData = async (path, data, id) => {
    const response = await fetch(path + id,
      {
        method: "POST",
        headers: {
          "Accept": "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
    const res = await response.json();
    return res;
  };


  // When a user reviews snowdata, POST-method call is sent to api/review. 
  // New snow review is added to the database.
  // The call returns ID number to the new row in the database, so that feedback text can be
  // later added to it. 
  const postSnowType = async () => {

    let snowID = null;
    if (selectedType !== null) {
      snowID = selectedType.ID;
    }

    const data = {
      Segmentti: props.segmentdata.ID,
      Arvio: null,
      Lumilaatu: snowID,
      Kivia: stones,
      Oksia: branches,
      Kommentti: null,
    };

    let res = postData("api/review/", data, props.segmentdata.ID);
    console.log("New snow type");
    console.log(res);

    // Parse the ID to our snow review
    res.then(item => {
      let row = JSON.stringify(item[0]);
      JSON.parse(row, (key, value) => {
        if(Number.isInteger(value)) {
          setUpdateID(value);
        }
      });
    });
    //Move to the next view
    setView("feedback");
  };


  // Post the feedback text to the database. If continuing from the snow type selection, 
  // we update the existing row with ID. Otherwise, post new row to the database. 
  const postFeedback = async () => {
    const data = {
      Segmentti: props.segmentdata.ID,
      Arvio: null,
      Lumilaatu: null,
      Kivia: null,
      Oksia: null,
      Kommentti: text,
    };

    if(updateID === null) {
      console.log("Regular description");
      let res = postData("api/review/", data, props.segmentdata.ID);
      console.log(res);
    } else {     
      console.log("Description with ID ");
      let res = postData("api/updateReview/", data, updateID);
      console.log(res);
    }
    getReviews();
    clearState();
    props.close();
  };

  
  async function getSnowTypes() {
    const snow = await fetch("api/lumilaadut");
    const data = await snow.json();
    setAllSnowTypes(data);
    console.log("Got data!");
    console.log(data);
  }
  


  function fetchSnowTypes(category) {

    setView("selection");

    if (category === "1") {
      setSnowData([allSnowTypes[3], allSnowTypes[9], allSnowTypes[8], allSnowTypes[7]]);
      setSelectedType(allSnowTypes[3]);

    } else if (category === "2") {
      setSnowData([allSnowTypes[4], allSnowTypes[11], allSnowTypes[10], allSnowTypes[12]]);
      setSelectedType(allSnowTypes[4]);

    } else if (category === "3") {
      setSnowData([allSnowTypes[2], allSnowTypes[16]]);
      setSelectedType(allSnowTypes[2]);

    } else if (category === "4") {
      setSnowData([allSnowTypes[1], allSnowTypes[17], allSnowTypes[18]]);
      setSelectedType(allSnowTypes[1]);
      
    } else if (category === "5") {
      setSnowData([allSnowTypes[0], allSnowTypes[15], allSnowTypes[13], allSnowTypes[14]]);
      setSelectedType(allSnowTypes[0]);

    } else if (category === "6") {
      setSnowData([allSnowTypes[5]]);
      setSelectedType(allSnowTypes[5]);
    }
  }

  const clearState = () => {
    setView("category");
    setSelectedType(null);
    setSelectedButton(0);
    setStones(false);
    setBranches(false);
    setText("");
    setUpdateID(null);
  };

  const goBack = () => {
    if(view === "category") {
      clearState();
      props.back();
    } else if (view === "selection") {
      setView("category");
    } else if (view === "feedback") {
      setView("selection");
    }

    clearState();
  };

  const selectButton = (key, data) => {
    setSelectedButton(key);
    setSelectedType(data);
  };

  //Feedback text updating
  const updateText = (e) => {
    setText(e.target.value);
  };


  return (
    <>
      { view === "category" && (
        <div>
          <Typography className={styles.smallHeaders}>Käyttäjäpohjainen palaute </Typography>
    
          <hr style={{backgroundColor: "#949494", height: 1, width: "95%", justifySelf: "center"}}/>
    
          <Typography className={styles.smallHeaders}>Kertoisitko, oliko lumi </Typography>
    
          <Box className={styles.buttonsCenter}>
          
            <Button variant="contained" className={styles.lightBlue} onClick={() => {fetchSnowTypes("1");}}>uutta/vastasatanutta</Button>
            
            <Button variant="contained" className={styles.purple} onClick={() => {fetchSnowTypes("2");}}>tuulen muovaamaa</Button>
            
            <Button variant="contained" className={styles.lime} onClick={() => {fetchSnowTypes("3");}}>jäistä</Button>
            
            <Button variant="contained" className={styles.grey} onClick={() => {fetchSnowTypes("4");}}>märkää</Button>
            
            <Button variant="contained" className={styles.blue} onClick={() => {fetchSnowTypes("5");}}>korppua</Button>
            
            <Button variant="contained" className={styles.brown} onClick={() => {fetchSnowTypes("6");}}>vähäistä</Button>
          
          </Box>

          <hr style={{backgroundColor: "#949494", height: 1, width: "95%", justifySelf: "center"}}/>

          <Box className={styles.buttonsRight}>
            <Button variant="contained" className={styles.darkGrey} onClick={goBack}>Takaisin</Button>
          </Box>
        </div>        
      )}



      { view === "selection" && (
        <div>
          <Typography className={styles.smallHeaders}>Käyttäjäpohjainen palaute </Typography>
          
          <hr style={{backgroundColor: "#949494", height: 1, width: "95%", justifySelf: "center"}}/>

          <Typography className={styles.mediumText} style={{justifyContent: "center"}}>Lumityypin tarkennus: </Typography>

          <Grid container className={styles.grid}>
            {
              snowData.map((data, index) => {
                return (
                  <Grid key={index} item xs={6} sm={6}>      
                    <IconButton
                      onClick={() => selectButton(index, data)}
                      className={styles.white}
                      style={{ 
                        width: (isXS ? "90%" : "70%"), 
                        border: (index === selectedButton ? "3px solid #4F81CD" : "1px solid #62A1FF") }}
                    >
                      <CardMedia
                        component={"img"}
                        src={process.env.PUBLIC_URL + "/icons/snowtypes-and-harms/" + data.ID + ".svg"}
                        alt="lumityypin logo"
                        className={styles.snowInfo}
                      />
                      <Typography className={styles.mediumText}>{data.Nimi}</Typography>                 
                    </IconButton>  
                  </Grid>                
                );
              })
            }
          </Grid>

          
          {/* Lumitiedon kuvausteksti */}
          { selectedType !== null && (
            <Box className={styles.description}>
              <Typography className={styles.smallHeaders} style={{justifyContent: "left"}}>{selectedType.Nimi}</Typography>
              <Grid item xs={12} sm={12} align="center">
                <InputBase
                  className={styles.mediumText}
                  style={{marginLeft: "20px", marginRight: "20px"}}
                  value={selectedType.Lumityyppi_selite}
                  fullWidth={true}
                  multiline
                  maxRows={6}
                />
              
              </Grid>

              { selectedType.Hiihdettavyys > 0 && (
                <img className={styles.skiabilityIcon} src={process.env.PUBLIC_URL + "/icons/skiability/" + selectedType.Hiihdettavyys + ".svg"} alt="skiability" />
              )}
            </Box> 
          )}

          <hr style={{backgroundColor: "#949494", height: 1, width: "95%", justifySelf: "center"}}/>


          <Typography className={styles.smallHeaders}>Voit vielä lisätä, jos alueella oli: </Typography>
          <Grid container>
            <Grid item xs={6} sm={6} align="center">
              <IconButton
                onClick={() => setStones(!stones)}
                className={styles.white}
                style={{ 
                  width: (isXS ? "90%" : "70%"), 
                  border: (stones ? "3px solid #4F81CD" : "1px solid #62A1FF") }}
              >
                <CardMedia
                  component={"img"}
                  src={process.env.PUBLIC_URL + "/icons/snowtypes-and-harms/" + 21 + ".svg"}
                  alt="lumityypin logo"
                  className={styles.snowInfo}
                />
                <Typography className={styles.mediumText}>Kiviä</Typography>                 
              </IconButton> 
            </Grid> 
            <Grid item xs={6} sm={6} align="center">
              <IconButton
                onClick={() => setBranches(!branches)}
                className={styles.white}
                style={{ 
                  width: (isXS ? "90%" : "70%"), 
                  border: (branches ? "3px solid #4F81CD" : "1px solid #62A1FF") }}
              >
                <CardMedia
                  component={"img"}
                  src={process.env.PUBLIC_URL + "/icons/snowtypes-and-harms/" + 22 + ".svg"}
                  alt="lumityypin logo"
                  className={styles.snowInfo}
                />
                <Typography className={styles.mediumText}>Oksia</Typography>                 
              </IconButton> 
            </Grid>
          </Grid>

          <Box className={styles.buttonsRight}>
            <Button variant="contained" className={styles.darkGrey} onClick={goBack}>Takaisin</Button>
            <Button variant="contained" className={styles.darkGrey} onClick={postSnowType}>Lähetä</Button>
          </Box>
        </div>
      )}

      { view === "feedback" && (
        <div> 
          <Typography className={styles.smallHeaders}>Käyttäjäpohjainen palaute </Typography>
          
          <hr style={{backgroundColor: "#949494", height: 1, width: "95%", justifySelf: "center"}}/>

          <Typography className={styles.smallHeaders}>Kiitos palautteesta! </Typography>

          <Box className={styles.part}>
            <Typography variant="h5" className={styles.mediumText}>Muu huomio tai terveiset Pallaksen Pöllöille: </Typography>
            <TextField className={styles.textFields} value={text} maxRows={6} onChange={updateText} placeholder="Kirjoita..." multiline variant="outlined" />
          </Box>    

          <Box className={styles.buttonsRight}>         
            <Button variant="contained" className={styles.darkGrey} onClick={props.close}>Sulje</Button>
            <Button variant="contained" className={styles.darkGrey} 
              disabled={ text === "" ? true : false } onClick={postFeedback}>Lähetä</Button>
          </Box>        
        </div>
      )}
    </>
  );
}

export default WriteUserReview;