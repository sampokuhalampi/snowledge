/**
Pää javascript react appiin

Luonut: Markku Nirkkonen

Päivityshistoria

28.2.2022 Jere Pesälä added Lumi5 variable for snow-type of the user review

Juho Kumara 3.12.2021 Lisätty lumityyppien talletus hookiin, ja välitetään se propsina infolle

29.12.2020 Lisätty kirjautuneen käyttäjän tietojen tallentamiseen liittyviä toimintoja

11.12. Lisättiin lumilaadun ja alasegmentin tiedot hakujen parsimiseen

Markku Nirkkonen 26.11.2020
Hallintanäkymän komponentti lisätty

Arttu Lakkala 15.11 Lisätty päivityksen lisäys segmenttiin.

**/

import * as React from "react";
import { useEffect } from "react";
import "./App.css";
import "./style.css";
import Map from "./NewMap";
import Manage from "./Manage";
import Info from "./Info";
import WeatherTab from "./weather/WeatherTab";
import { useMediaQuery } from "react-responsive";
import BottomNav from "./BottomNav";
import WelcomeView from "./WelcomeView";
import Login from "./Login";
// eslint-disable-next-line no-unused-vars
import SnowIcon from "@material-ui/icons/AcUnit";
// eslint-disable-next-line no-unused-vars
import IconButton from "@material-ui/core/IconButton";
import Logout from "./Logout";
import SnowTypes from "./SnowTypes";

var refreshInterval = setInterval(window.location.reload.bind(window.location), (30*60000));

function App() {

  // Use state hookit
  const [token, setToken] = React.useState(null);
  const [user, setUser] = React.useState(null);
  const [segments, setSegments] = React.useState([]);
  const [segmentColors, setSegmentColors] = React.useState(null);
  const [woodsSegment, setWoodsSegment] = React.useState(null);
  const [shownSegment, setShownSegment] = React.useState(null);
  const [snowtypes, setSnowtypes] = React.useState([]);
  const [showManagement, setShowManagement] = React.useState(false);
  const [showMap, setShowMap] = React.useState(true);
  const [showSnow, setShowSnow] = React.useState(false);
  const [showWeather, setShowWeather] = React.useState(false);
  const [showWelcomeView, setShowWelcomeView] = React.useState(true); 
  const [selectedSegment, setSelectedSegment] = React.useState(null);

  //imported hook. Kysely näyttöportin koosta
  const isMobile = useMediaQuery({query: "(max-width:900px)"});


  /* Sponsor logos & links

    Save logo files into map-app/public/sponsorit
    Link addresses to sponsor's website

    Example:
    const sponsor1 = {
      logo: "sponsor1.png",
      address: "https://www.google.com/"
    };
  */
  const sponsor1 = {
    logo: "",
    address: ""
  };
  const sponsor2 = {
    logo: "",
    address: ""
  };
  const sponsor3 = {
    logo: "",
    address: ""
  };

  const sponsors = [sponsor1, sponsor2, sponsor3];


  /*
   * Haetaan renderöinnin jälkeen aina tiedot lumilaaduista, päivityksistä ja segmenteistä
   * Tallennetaan ne hookkeihin
   *
   */
  useEffect(() => {
    const fetchData = async () => {
      const snow = await fetch("api/lumilaadut");
      const snowdata = await snow.json();
      const updates = await fetch("api/segments/update");
      const updateData = await updates.json();
      const response = await fetch("api/segments");
      const data = await response.json();

      setSnowtypes(snowdata);

      // Taulukko käytettäville väreille kartassa. Musta väri oletuksena, jos tietoa ei ole
      // Muut värit suoraan kannasta. Taulukko on olennainen NewMap.js:n toiminnan kannalta (kartan värit)
      // emptyColor.name kirjoitusmuoto on olennainen myös NewMap.js:n updateHighlighted -funktiossa
      // Mikäli muutetaan, muutettava myös siellä.
      // const emptyColor = [{color: "#000000", name: "Ei tietoa"}];
      const snowcolors = snowdata.map((item) => {
        return {color: item.Vari, name: item.Nimi, ID: item.ID};
      });
      // Yhdistetään olemassa olevat värit ja "ei tietoa" (viimeiseksi)
      setSegmentColors(snowcolors);
      
      await updateData.forEach(update => {
        snowdata.forEach(snow => {
          if (snow.ID === update.Lumilaatu_ID1) {
            update.Lumi1 = snow;
          }
          if (snow.ID === update.Lumilaatu_ID2) {
            update.Lumi2 = snow;
          }
          if (snow.ID === update.Toissijainen_ID1) {
            update.Lumi3 = snow;
          }
          if (snow.ID === update.Toissijainen_ID2) {
            update.Lumi4 = snow;
          }
          if (snow.ID === update.A1_Lumilaatu) {
            update.Lumi5 = snow;
          }
          if (snow.ID === update.A2_Lumilaatu) {
            update.Lumi6 = snow;
          }
          if (snow.ID === update.A3_Lumilaatu) {
            update.Lumi7 = snow;
          }
        });
      });
      
      setWoodsSegment(null);
      data.forEach(segment => {       
        segment.update = null;
        updateData.forEach(update => {
          if (update.Segmentti === segment.ID) {
            segment.update = update;
          }
        });
        if(segment.On_Alasegmentti != null)
        {
          data.forEach(mahd_yla_segmentti => {
            if(mahd_yla_segmentti.ID === segment.On_Alasegmentti){
              segment.On_Alasegmentti = mahd_yla_segmentti.Nimi;
            }
          });
        }
        if (segment.Nimi === "Metsä") {
          setWoodsSegment(segment);
        }
      });
      updateSegments(data);
 
      console.log("Segments updated: ", data);
    };

    fetchData();
    const interval = setInterval(() => {
      fetchData();
    }, 15000);

    return () => clearInterval(interval);
  }, []);

  /*
   * Event handlerit
   */
  useEffect(() => {
    if(selectedSegment !== null) {
      let selectedId = selectedSegment-1;

      if(selectedId >= 0 && selectedId < segments.length) {
        if(selectedSegment === segments[ selectedId ].ID) {
          setChoice(segments[ selectedId ]);
        } else {
          console.log("Could not find segment with reference");
          segments.forEach(segment => {
            if(segment.ID === selectedSegment) {
              setChoice(segment);
            }
          });
        }
      }
    } else {
      setChoice(null);
    }
  }, [segments, selectedSegment]);


  // Removes welcome view on mobile
  function updateShowWelcomeView() {
    setShowWelcomeView(false);
  } 

  // Segmentin valinta
  function chooseSegment(choice) {
    setSelectedSegment(choice);
  }
  function setChoice(choice) {
    setShownSegment(choice);
  }

  // Token tallennetaan reactin stateen
  // eslint-disable-next-line no-unused-vars
  function updateToken(token) {
    if (typeof token !== "undefined"){
      clearInterval(refreshInterval);
    }
    setToken(token);
  }

  // Käyttäjän päivitys (kirjautuneen)
  // eslint-disable-next-line no-unused-vars
  function updateUser(user) {
    setUser(user);
  }

  // Kaikkien segmenttien päivittäminen
  function updateSegments(data) {
    setSegments(data);
  }

  function updateWoods(data) {
    setWoodsSegment(data);
  }

  function updateShown(value) {
    switch(value) {
    case 0: 
      setShowMap(true);
      setShowSnow(false);
      setShowWeather(false);
      setShowManagement(false);
      break;
    case 1:
      setShowSnow(true);
      setShowMap(false);
      setShowWeather(false);
      setShowManagement(false);
      break;
    case 2: 
      setShowWeather(true);
      setShowSnow(false);
      setShowMap(false);
      setShowManagement(false);
      break;
    case 3:
      setShowWeather(false);
      setShowSnow(false);
      setShowMap(false);
      setShowManagement(true);
      break;
    }
  }

  // TODO: Komponenttien tyylejä ja asetteluja voi vielä parannella
  return (
    <div className="root">
      <div className="app">
        {/* Sovelluksen yläpalkki */}
        {/*<div className="top_bar">
          <TopBar 
            isMobile={isMobile} 
            updateUser={updateUser}
            user={user}
            token={token} 
            updateToken={updateToken} 
            updateView={updateView}
            viewManagement={viewManagement} 
            manageOrMap={manageOrMap} 
          />   
        </div>*/}
        {/* Weather tab - this is here temporarily so that component is rendered
        and information fetched when application starts */}
        {
          showWeather 
            ? 
            <div className="weather_tab">
              <WeatherTab/>
            </div>
            : 
            <div></div> 
        }

        {/* Information about snow types */}
        {
          showSnow
            ? 
            <div className="snow_tab">
              <SnowTypes isMobile={isMobile}/>
            </div>
            : 
            <div></div> 
        }
        {/* Management view */}
        {(showManagement 
          ?
          <div className="management_view">
            <Manage 
              segments={segments}
              role={user.Rooli}
              token={token}
              onUpdate={chooseSegment}
              updateSegments={updateSegments}
              shownSegment={shownSegment}
              updateWoods={updateWoods}
            />
          </div>
          :
          <div/>)}
        <div className="map_container">
          <Map 
            shownSegment={shownSegment}
            segmentColors={segmentColors}
            segments={segments} 
            onClick={chooseSegment} 
            isMobile={isMobile}
            woodsSegment={woodsSegment}
            viewManagement={showManagement}
            showMap={showMap}
          />
        </div>
        {/* <div className="guide"></div> */}
          
        {/* Sovelluksen sivupalkki, jossa näytetään kartalta valitun segmentin tietoja
            Näytetään, kun jokin segmentti valittuna, eikä olla hallintanäkymässä */}
        <div className="segment_info">
          {(shownSegment !== null && !showManagement && !showWeather && !showSnow ? 
            <Info
              //segments={segments}
              segmentdata={shownSegment} 
              token={token}
              updateSegments={updateSegments}
              onUpdate={chooseSegment}
              onClose={chooseSegment}
              updateWoods={updateWoods}
              snowtypes={snowtypes}
              sponsors={sponsors}
            />
            :
            <div />
          )} 
        </div>
        <div className="bottom_navigation">
          <BottomNav
            updateShown={updateShown}
            user={user}
            isMobile={isMobile}
          />
        </div>
      </div>
      {!showWelcomeView && isMobile ?
        <div></div>
        :
        <div className="welcome_view">
          <WelcomeView isMobile={isMobile} sponsors={sponsors} updateShowWelcomeView={updateShowWelcomeView}/>
        </div>}
      {(
        token === null || token === undefined 
          ? 
          <Login updateToken={updateToken} updateUser={updateUser}/> 
          :
          <Logout updateToken={updateToken} updateUser={updateUser} showManagement={showManagement} updateShown={updateShown}/>
      )}
    </div>
  );
}

export default App;
