const queryString = require('query-string');
const request = require("request");

module.exports = {
  getMarketInfo: function (req, resultCallback) {
    var queryParams = {
      ids: 'Fango',
      vs_currencies: req.query.vsCurrencies || 'USD',
      include_market_cap: true,
      include_24hr_vol: true,
      include_24hr_change: true
    };

    var packetData = {
      uri: `https://api.coingecko.com/api/v3/simple/price?${queryString.stringify(queryParams)}`,
      strictSSL: false,
      method: "GET",
      json: true
    };

    request(packetData, function (err, res, data) {
      if (err) throw err;
      else resultCallback({success: true, data: data});
    });
  },
  getMarketHistory: function (req, resultCallback) {
    var queryParams = {
      vs_currency: req.query.vsCurrency || 'USD',
      days: req.query.days || 7
    };

    var packetData = {
      uri: `https://api.coingecko.com/api/v3/coins/fango/market_chart?${queryString.stringify(queryParams)}`,
      strictSSL: false,
      method: "GET",
      json: true
    };

    request(packetData, function (err, res, data) {
      if (err) throw err;
      else resultCallback({success: true, data: data});
    });
  }
};
