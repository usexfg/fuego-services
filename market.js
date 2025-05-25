import * as utils from "./utils.js";
import axios from "axios";

const request = axios.create({
  timeout: 10000, // 10 seconds
  headers:{
    'User-Agent': 'Fuego Services'
  }
});

// Fuego (XFG) Coinpaprika ID: xfg-fuego
const COINPAPRIKA_ID = 'xfg-fuego';

export function getMarketInfo(req, resultCallback) {
  // Coinpaprika: /tickers/{coin_id}
  request.get(utils.coinpaprikaURL(`tickers/${COINPAPRIKA_ID}`)).then(response => {
    resultCallback({success: true, data: response.data});
  }).catch(err => {
    console.log(`getMarketInfo: ${err.message}`);
    resultCallback({success: false, err});
  });
};

export function getMarketHistory(req, resultCallback) {
  // Coinpaprika: /coins/{coin_id}/ohlcv/historical
  const params = {
    start: req.query.start || undefined, // ISO 8601 date, e.g. '2023-01-01'
    end: req.query.end || undefined,     // ISO 8601 date, e.g. '2023-01-31'
    limit: req.query.days || 7           // Number of days
  };
  // Remove undefined params
  Object.keys(params).forEach(key => params[key] === undefined && delete params[key]);

  request.get(utils.coinpaprikaURL(`coins/${COINPAPRIKA_ID}/ohlcv/historical`, params)).then(response => {
    resultCallback({success: true, data: response.data});
  }).catch(err => {
    console.log(`getMarketHistory: ${err.message}`);
    resultCallback({success: false, err});
  });
};
