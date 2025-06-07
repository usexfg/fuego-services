import bodyParser from "body-parser";
import expressWinston from "express-winston";
import * as runProfiler from "./profile.js";
import * as exchanges from "./exchanges.js";
import * as charts from "./charts.js";
import * as market from "./market.js";
import * as pools from "./pools.js";
import { nodes } from "./nodes.js";
import * as utils from "./utils.js";
import express from "express";
import winston from "winston";
import config from "./config.js";
import cors from "cors";
import path from "path";
import fs from "graceful-fs";
import axios from 'axios';

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
app.set('trust proxy', true);

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
const port = process.env.PORT || config.server.port;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

// root welcome route
app.get('/', (req, res) => {
  res.json({
    message: 'Fuego API is up and running',
    endpoints: [
      '/ping',
      '/charts/price.png',
      '/charts/volume.png',
      '/charts/marketcap.png',
      '/nodes/geodata',
      '/pools/list',
      '/pools/data',
      '/exchanges/list',
      '/market/info',
      '/market/history',
      '/system/profile',
      '/chain/height',
      '/chain/supply',
      '/chain/difficulty'
    ]
  });
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
  try {
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
  } catch (err) {
    res.status(500).send(err.message);
  }
});

app.get("/charts/price.png", (req, res) => {
  try {
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
  } catch (err) {
    res.status(500).send(err.message);
  }
});

app.get("/charts/volume.png", (req, res) => {
  try {
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
  } catch (err) {
    res.status(500).send(err.message);
  }
});

app.get("/charts/marketcap.png", (req, res) => {
  try {
    console.log('call to /charts/marketcap.png was made', req.query);
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
  } catch (err) {
    res.status(500).send(err.message);
  }
});

app.get("/nodes/geodata", (req, res) => {
  try {
    console.log('call to /nodes/geodata was made', req.query);
    res.json(nodesIntance.getGeoData(null));
  } catch (err) {
    res.status(500).send(err.message);
  }
});

app.get("/pools/list", (req, res) => {
  try {
    console.log('call to /pools/list was made', req.query);
    pools.getPoolList(function (response) {
      if (response.success) {
        res.json(response.data);
      } else {
        reportError(response.err.message, res);
      }
    });
  } catch (err) {
    res.status(500).send(err.message);
  }
});

app.get("/pools/data", (req, res) => {
  try {
    console.log('call to /pools/data was made', req.query);
    pools.getPoolData(function (response) {
      if (response.success) {
        res.json(response.data);
      } else {
        reportError(response.err.message, res);
      }
    });
  } catch (err) {
    res.status(500).send(err.message);
  }
});

app.get("/exchanges/list", (req, res) => {
  try {
    console.log('call to /exchanges/list was made', req.query);
    exchanges.getExchangesList(req, function (response) {
      if (response.success) {
        res.json(response.data);
      } else {
        reportError(response.err.message, res);
      }
    });
  } catch (err) {
    res.status(500).send(err.message);
  }
});

app.get("/market/info", (req, res) => {
  try {
    console.log('call to //market/info was made', req.query);
    market.getMarketInfo(req, function (response) {
      if (response.success) {
        res.json(response.data);
      } else {
        reportError(response.err.message, res);
      }
    });
  } catch (err) {
    res.status(500).send(err.message);
  }
});

app.get("/market/history", (req, res) => {
  try {
    console.log('call to /market/history was made', req.query);
    market.getMarketHistory(req, function (response) {
      if (response.success) {
        res.json(response.data);
      } else {
        reportError(response.err.message, res);
      }
    });
  } catch (err) {
    res.status(500).send(err.message);
  }
});

app.get('/system/profile', async (req, res) => {
  try {
    let profile = await runProfiler(req.query.duration ? parseInt(req.query.duration) : 30);
    res.attachment(`profile_${Date.now()}.cpuprofile`);
    res.send(profile);
  } catch (err) {
    res.status(500).send(err.message);
  }
})

// health check endpoint
app.get('/ping', (req, res) => {
  res.send('pong');
});

// Fuego daemon RPC configuration
const fuegoDaemonConfig = {
  host: 'localhost',
  port: 18081, // default RPC port
  username: '', // if authentication is required
  password: ''  // if authentication is required
};

// Function to call Fuego daemon RPC
async function callFuegoRPC(method, params = {}) {
  const url = `http://${fuegoDaemonConfig.host}:${fuegoDaemonConfig.port}/json_rpc`;
  const data = {
    jsonrpc: '2.0',
    id: '0',
    method,
    params
  };
  const auth = fuegoDaemonConfig.username ? {
    username: fuegoDaemonConfig.username,
    password: fuegoDaemonConfig.password
  } : undefined;
  try {
    const response = await axios.post(url, data, { auth });
    return response.data.result;
  } catch (error) {
    console.error(`Error calling Fuego RPC method ${method}:`, error.message);
    throw error;
  }
}

// Endpoint to get chain height
app.get('/chain/height', async (req, res) => {
  try {
    const result = await callFuegoRPC('get_block_count');
    res.json({ height: result.count });
  } catch (error) {
    res.status(500).send('Error fetching chain height');
  }
});

// Endpoint to get chain supply
app.get('/chain/supply', async (req, res) => {
  try {
    const result = await callFuegoRPC('get_coinbase_tx_sum', { height: 0, count: 1 });
    res.json({ supply: result.emission_amount });
  } catch (error) {
    res.status(500).send('Error fetching chain supply');
  }
});

// Endpoint to get chain difficulty
app.get('/chain/difficulty', async (req, res) => {
  try {
    const result = await callFuegoRPC('get_last_block_header');
    res.json({ difficulty: result.block_header.difficulty });
  } catch (error) {
    res.status(500).send('Error fetching chain difficulty');
  }
});

// handle any application errors
app.use(function (err, req, res, next) {
  if (err) {
    reportError(err.message, res);
  }
});