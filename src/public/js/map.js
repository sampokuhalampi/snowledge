
/*
 * Kannasta saatu data käsitellään taulukoksi, jossa alkioina segmentin id ja koordinaatit sisältävä taulukko
 *
 */


/* THIS fucntion is redundatn now



function segmentDataToArray(data) {

    const coordsForSegments = data.map((item) => {
        return [item.Segmentti, item.Sijainti];
    });

    let dataArray = [];
    let coordsArray = [];
    let segment;
    for (let i = 0; i < coordsForSegments.length; i++) {
        if (i < coordsForSegments.length - 1) {
            if (coordsForSegments[i][0] == coordsForSegments[i+1][0]) {
                coordsArray.push({lat: coordsForSegments[i][1].x, lng: coordsForSegments[i][1].y});
            } else {
                coordsArray.push({lat: coordsForSegments[i][1].x, lng: coordsForSegments[i][1].y});
                segment = coordsForSegments[i][0]
                dataArray.push([{segment}, {coordsArray}]);
                coordsArray = [];
            }     
        } else {
            coordsArray.push({lat: coordsForSegments[i][1].x, lng: coordsForSegments[i][1].y});
            segment = coordsForSegments[i][0]
            dataArray.push([{segment}, {coordsArray}]);
            coordsArray = [];    
        }
    }
    return dataArray;
}
*/

// Segmenttien tiedot json-muodossa kannasta
function getSegments() {
  return fetch(window.location.href + "db/segments")
    .then((response) => { 
      return response.json().then((data) => {
        return data;
      }).catch((err) => {
        console.log(err);
      }); 
    });
}

function initMap() {
  // Pallakesen keskuksen koordinaatit
  const pallas = { lat: 68.045721, lng: 24.062813 };
  // Kartta, keskitetty pallakselle
  // eslint-disable-next-line no-undef
  const map = new google.maps.Map(document.getElementById("map"), {
    zoom: 13,
    center: pallas,
    mapTypeId: "terrain",
  });

  // Piirtää segmentin kannasta haettujen koordinaattien mukaisesti.
  function drawSegmentsFromData(map) {
    let coordsJson;
    getSegments().then((data) => {
      const segmentArray = data;

      for (let i = 0; i < segmentArray.length; i++) {
        let segment;
        // eslint-disable-next-line no-undef
        segment = new google.maps.Polygon({
          paths: segmentArray[i].Points,
          strokeColor: "#0000FF",
          strokeOpacity: 0.8,
          strokeWeight: 2,
          fillColor: "#0000FF",
          fillOpacity: 0.15,
        });

        segment.setMap(map);
    
        segment.addListener("mouseover", () => {
          segment.setOptions({fillOpacity: 0.8});
        });
            
        segment.addListener("mouseout", () => {
          segment.setOptions({fillOpacity: 0.15});
        });
            
        segment.addListener("click", () => {
          let infoDiv = document.getElementById("segment_info");
          // eslint-disable-next-line no-undef
          infoDiv.innerHTML = "<p>Segmentin " + dataArray[i][0].segment + " tietoja</p>";
        });
      }     
    });   
  }
  drawSegmentsFromData(map);
}