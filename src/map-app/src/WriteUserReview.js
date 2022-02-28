import React from "react";

function WriteUserReview(props) {

  //Haetaan kaikki review-data tietokannasta
  const getReviews = async () => {

    const reviews = await fetch("api/reviews");
    const reviewData = await reviews.json();

    console.log("Reviews: ");
    console.log(reviewData);
  };

  //Kun käyttäjä arvioi lumitietoja, lähetetään POST -methodin api- kutsu api/review
  const openReview = () => {

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

  
  return (
    <div  style={{display: props.writeReviewEnabled === true ? "" : "none"}}>
      <div>Hello user review!</div>
      <button onClick={openReview}>Test button</button>
    </div>
  );
}

export default WriteUserReview;