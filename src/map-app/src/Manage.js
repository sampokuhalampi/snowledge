/**
Segmenttien hallintanäkymän runko


Luonut: Markku Nirkkonen 26.11.2020

Muutosloki:

Markku Nirkkonen 18.12.2020
Lisätty Käyttäjät välilehti ja samalla siirretty segmenttihallinnan
ja käyttäjähallinnan koodit omiin moduuleihinsa

Markku Nirkkonen 8.12.2020
Segmentin muokkaaminen (ei syötetarkistuksia) toimintakuntoinen

Markku Nirkkonen 6.12.2020
Alettu lisätä segmentin lisäystoimintoa

Markku Nirkkonen 4.12.2020
Segmentin poisto toimivaksi, lisätty varmistusdialogi poistamiseen

26.11.2020
Pohja, segmenttien listaus, segmentin poisto
Segmentin muokkaus ja niiden lisääminen puuttuu vielä

**/

import * as React from "react";
import Box from "@material-ui/core/Box";
import { makeStyles } from "@material-ui/core/styles";
import Divider from "@material-ui/core/Divider";
import Button from "@material-ui/core/Button";
import SegmentManage from "./SegmentManage";
// eslint-disable-next-line no-unused-vars
import UserManage from "./UserManage";
import ReviewManage from "./reviewManage";


const useStyles = makeStyles(() => ({
  tabs: {
    display: "flex",
  },
  tabLinks: {
    margin: "auto"
  }
}));

function Manage(props) {

  const classes = useStyles();

  // Hooks
  const [showSegments, setShowSegments] = React.useState(true);
  const [showUsers, setShowUsers] = React.useState(false);
  const [showReviews, setShowReviews] = React.useState(false);

  const segmentDisabled = Boolean(showSegments);
  const usersDisabled = Boolean(showUsers);
  const reviewsDisabled = Boolean(showReviews);
  
  /*
   * Event handlers
   */

  // Näkymän vaihto käyttäjähallintaan
  const openUser = () => {
    setShowSegments(false);
    setShowReviews(false);
    setShowUsers(true);
  };

  // Näkymän vaihto segmenttihallintaan
  const openSegment = () => {
    setShowSegments(true);
    setShowReviews(false);
    setShowUsers(false);
  };

  // Näkymän vaihto arviointihallintaan
  const openReview = () => {
    setShowSegments(false);
    setShowReviews(true);
    setShowUsers(false);
  };

  // Renderöinti
  return (  
    <div>
      {/* Hallintanäkymän valinta käyttäjät / segmentit */}
      <Box className={classes.tabs}>
        <Button className={classes.tabLinks} disabled={segmentDisabled} onClick={openSegment}>Segmentit</Button>
        <Button className={classes.tabLinks} disabled={usersDisabled} onClick={openUser}>Käyttäjät</Button> 
        <Button className={classes.tabLinks} disabled={reviewsDisabled} onClick={openReview}>Palautteet</Button>      
      </Box>
      <Divider />

      {/* Näytetään muuttujan showSegments (boolean) mukaan joko segmenttienhallinta tai käyttäjienhallinta */}
      { showSegments &&
        <SegmentManage 
          segments={props.segments}
          token={props.token}
          onUpdate={props.onUpdate}
          updateSegments={props.updateSegments}
          shownSegment={props.shownSegment}
          updateWoods={props.updateWoods}
        /> 
      }

      {showUsers && 
        <UserManage token={props.token} role={props.role}/>
      }

      {showReviews && 
        <ReviewManage token={props.token} role={props.role}/>     
      }
      
      <div style={{height: "60px"}}></div>
    </div>
  );
}

export default Manage;