import axios from 'axios';
// import Promise from 'promise';

export const sendScore = scoredata => {
  axios.post("/addscore", scoredata);
};

export const getAllScores = () => {
  let scores = axios.get("/getAllScores");
  return scores;
};