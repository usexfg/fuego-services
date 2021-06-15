const bodyParser = require("body-parser");
const runProfiler = require('./profile.js')
const exchanges = require("./exchanges.js");
const express = require("express");
const winston = require('winston');
const expressWinston = require('express-winston');
const config = require("./config.js").configOpts;
const charts = require("./charts.js");
const market = require("./market.js");
const pools = require("./pools.js");
const nodes = require("./nodes.js");
const utils = require("./utils.js");
const cors = require("cors");
const path = require("path");
const fs = require('graceful-fs');

// message base for winston logging
const MESSAGE = Symbol.for('message');

const logFormatter = (logEntry) => {
  const base = { timestamp: new Date() };
  const json = Object.assign(base, logEntry);
  logEntry[MESSAGE] = JSON.stringify(json);
  return logEntry;
};

// create all needed classes
var nodesIntance = new nodes();

var app = express(); // create express app
// use the json parser for body
app.use(bodyParser.json());
app.use(cors());

app.use(expressWinston.logger({
  transports: [
    new winston.transports.Console()
  ],
  format: winston.format.combine(
    winston.format.colorize(),
    winston.format.json()
  )
}));

app.use(expressWinston.errorLogger({
  transports: [
    new winston.transports.Console()
  ],
  format: winston.format.combine(
    winston.format.colorize(),
    winston.format.json()
  )
}));

// start listener
app.listen(config.server.port, () => {
  console.log("Server running on port " + config.server.port);
});

function reportError(message, res) {
  console.error('Error trying to execute request!', message);
  res.status(500).send(`Error executing the API: ${message}`);
}

function getChartOptions(req) {
  return {
    dateFormat: req.query.dateFormat || 'YYYY-MM-DD',
    vsCurrency: req.query.vsCurrency || 'usd',
    days: parseInt(req.query.days) || 7,
    xPoints: parseInt(req.query.xPoints) || 7,
    priceDecimals: parseInt(req.query.priceDecimals) || 2,
    priceSymbol: req.query.priceSymbol || "$",
    width: parseInt(req.query.width) || 1200,
    height: parseInt(req.query.height) || 400
  };
}

// get request for the list of all active nodes
app.get("/charts/7daysPrice.png", (req, res) => {
  console.log('call to /charts/7daysPrice.png was made', req);
  charts.getPriceChart(getChartOptions(req), function (image) {
    if (image) {
      res.writeHead(200, {
        'Content-Type': 'image/png',
        'Content-Length': image.length
      });

      res.end(image);
    } else {
      res.status(500).send("Error executing the API: charts/7daysPrice.png");
    }
  });
});

app.get("/charts/price.png", (req, res) => {
  console.log('call to /charts/price.png was made', req.query);
  charts.getPriceChart(getChartOptions(req), function (image) {
    if (image) {
      res.writeHead(200, {
        'Content-Type': 'image/png',
        'Content-Length': image.length
      });

      res.end(image);
    } else {
      res.status(500).send("Error executing the API: charts/price.png");
    }
  });
});

app.get("/charts/volume.png", (req, res) => {
  console.log('call to /charts/volume.png was made', req.query);
  charts.getVolumeChart(getChartOptions(req), function (image) {
    if (image) {
      res.writeHead(200, {
        'Content-Type': 'image/png',
        'Content-Length': image.length
      });

      res.end(image);
    } else {
      res.status(500).send("Error executing the API: charts/volume.png");
    }
  });
});

app.get("/charts/marketcap.png", (req, res) => {
  lconsole.log('call to /charts/marketcap.png was made', req.query);
  charts.getMarketcapChart(getChartOptions(req), function (image) {
    if (image) {
      res.writeHead(200, {
        'Content-Type': 'image/png',
        'Content-Length': image.length
      });

      res.end(image);
    } else {
      res.status(500).send("Error executing the API: charts/marketcap.png");
    }
  });
});

app.get("/nodes/geodata", (req, res) => {
  console.log('call to /nodes/geodata was made', req.query);
  res.json(nodesIntance.getGeoData(null));
});

app.get("/pools/list", (req, res) => {
  console.log('call to /pools/list was made', req.query);
  pools.getPoolList(function (response) {
    if (response.success) {
      res.json(response.data);
    } else {
      reportError(response.err.message, res);
    }
  });
});

app.get("/pools/data", (req, res) => {
  console.log('call to /pools/data was made', req.query);
  pools.getPoolData(function (response) {
    if (response.success) {
      res.json(response.data);
    } else {
      reportError(response.err.message, res);
    }
  });
});

app.get("/exchanges/list", (req, res) => {
  console.log('call to /exchanges/list was made', req.query);
  exchanges.getExchangesList(req, function (data) {
    res.json(data);
  });
});

app.get("/market/info", (req, res) => {
  console.log('call to //market/info was made', req.query);
  market.getMarketInfo(req, function (data) {
    res.json(data);
  });
});

app.get("/market/history", (req, res) => {
  console.log('call to /market/history was made', req.query);
  market.getMarketHistory(req, function (data) {
    res.json(data);
  });
});

app.get('/system/profile', async (req, res) => {
  try {
    let profile = await runProfiler(req.query.duration ? parseInt(req.query.duration) : 30);
    res.attachment(`profile_${Date.now()}.cpuprofile`);
    res.send(profile);
  } catch (er) {
    res.status(500).send(er.message);
  }
})

// handle any application errors
app.use(function (err, req, res, next) {
  if (err) {
    reportError(err.message, res);
  }
});