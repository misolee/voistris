import axios from 'axios';

export const sendScore = scoredata => {
  axios.post("/addscore", scoredata);
};