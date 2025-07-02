import axios from 'axios';

const alquranApi = axios.create({
  baseURL: 'https://api.alquran.cloud/v1'
});

export default alquranApi;
