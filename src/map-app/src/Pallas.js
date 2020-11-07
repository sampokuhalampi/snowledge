import * as React from "react";
import { useEffect } from 'react';
import './App.css';
import './style.css';
import Map from './Map';
import Info from './Info';
import Login from './Login';
import { useMediaQuery } from 'react-responsive';


function App() {

  // Use state hooks
  const [token, setToken] = React.useState("");
  const [loaded, setLoaded] = React.useState(false);
  const [segments, setSegments] = React.useState([]);
  const [shownSegment, setShownSegment] = React.useState(null);

  //imported hooks
  const isMobile = useMediaQuery({query: '(max-width:760px)'});


  // after rendering segment data is fetched - should this be in some other way?
  useEffect(() => {
    const fetchData = async () => {
      const response = await fetch('api/segments');
      const data = await response.json();
      setSegments(data);
      setLoaded(true);
    };
    fetchData();
  }, []);

  // Event handler function for updating shown segment
  function chooseSegment(choice) {
    setShownSegment(choice);
  }

  

  return (
    <div className="App">
        <div className="top_bar">
        <p>
            Pallaksen lumet {(isMobile ? "mobiili" : "desktop")} 
        </p>
        <div id="loginlink"><Login /></div>
        </div>
        <div id="map">
          <Map segments={segments} onClick={chooseSegment} loaded={loaded} isMobile={isMobile} />
        </div>
        <div className="guide"></div>
        <div className="segment_info">
          <Info segmentdata={segments[shownSegment-1]} />
        </div>
    </div>
  );
}

export default App;