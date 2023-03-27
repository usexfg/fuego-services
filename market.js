import * as utils from "./utils.js";
import axios from "axios";

const request = axios.create({
  timeout: 10000, // 10 seconds
  headers:{
    'User-Agent': 'Conceal Services'
  }
});

export function getMarketInfo(req, resultCallback) {
  var queryParams = {
    ids: 'Conceal',
    vs_currencies: req.query.vsCurrencies || 'USD',
    include_market_cap: true,
    include_24hr_vol: true,
    include_24hr_change: true
  };

  request.get(utils.geckoURL("simple/price", queryParams)).then(response => {
    resultCallback({success: true, data: response.data});
  }).catch(err => {
    console.log(`getMarketInfo: ${err.message}`);
    throw err;
  });
};

export function getMarketHistory(req, resultCallback) {
  var queryParams = {
    vs_currency: req.query.vsCurrency || 'USD',
    days: req.query.days || 7
  };

  request.get(utils.geckoURL("coins/conceal/market_chart", queryParams)).then(response => {
    resultCallback({success: true, data: response.data});
  }).catch(err => {
    console.log(`getMarketHistory: ${err.message}`);
    throw err;
  });
};