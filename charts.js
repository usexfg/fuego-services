import { ChartJSNodeCanvas } from "chartjs-node-canvas";
import * as utils from "./utils.js";
import smooth from "array-smooth";
import moment from "moment";
import axios from "axios";
import fs from 'fs';
import csvParser from 'csv-parser';

const request = axios.create({
  timeout: 10000, // 10 seconds
  headers:{
    'User-Agent': 'Fuego Services'
  }
});

const COINPAPRIKA_ID = 'xfg-fuego';
const fuegoUrl = "https://graphsv2.coinpaprika.com/currency/data/xfg-fango/30d/?quote=usd";

function getCoinpaprikaData(options, callback) {
  if (options.days > 30) {
    // Use local CSV data for requests longer than 30 days
    const priceData = [];
    fs.createReadStream('data/CoinPaprika_XFG_price_all_2025-06-05.csv')
      .pipe(csvParser())
      .on('data', (row) => {
        priceData.push({
          time: new Date(row.DateTime).getTime(),
          price: parseFloat(row.Price)
        });
      })
      .on('end', () => {
        console.log('CSV file successfully processed');
        callback(priceData);
      });
  } else {
    // Use the provided URL for fetching XFG price data
    request.get(fuegoUrl).then(response => {
      console.log('Coinpaprika data:', response.data);
      // Correctly access the nested data structure
      const priceData = response.data[0].price.map(item => ({
        time: item[0],
        price: item[1]
      }));
      callback(priceData);
    }).catch(err => {
      console.log(`getCoinpaprikaData: ${err.message}`);
      callback(null);
    });
  }
}

function getCustomChart(options, chartData, valueKey, resultCallback) {
  function makeConfiguration(data) {
    var timeLabels = data.map(item => moment(item.time).format(options.dateFormat));
    var dataPoints = data.map(item => item.price);

    return {
      type: 'line',
      data: {
        labels: timeLabels,
        datasets: [{
          data: smooth(dataPoints, 3),
          backgroundColor: 'rgba(255,165,0,0.2)',
          fill: true,
          borderWidth: 2,
          pointRadius: 0,
          borderColor: '#FFA500'
        }]
      },
      options: {
        animation: false,
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false,
            labels: {
              display: false
            }
          }
        },
        scales: {
          yAxes: {
            ticks: {
              maxTicksLimit: 5,
              fontSize: 10,
              callback: function (value, index, values) {
                return options.priceSymbol + value.toFixed(options.priceDecimals);
              }
            },
            grid: {
              display: false
            }
          },
          xAxes: {
            ticks: {
              autoSkip: true,
              maxTicksLimit: options.xPoints,
              maxRotation: 0,
              minRotation: 0
            },
            grid: {
              display: false
            }
          }
        },
        hover: {
          mode: 'nearest',
          intersect: true
        }
      }
    };
  }

  (async () => {
    const canvasRenderService = new ChartJSNodeCanvas({
      width: options.width,
      height: options.height,
    });

    resultCallback(await canvasRenderService.renderToBuffer(makeConfiguration(chartData)));
  })();
}

export function getPriceChart(options, resultCallback) {
  getCoinpaprikaData(options, function (data) {
    if (data) {
      console.log('Chart data for price:', data);
      getCustomChart(options, data, 'close', resultCallback);
    } else {
      resultCallback(null);
    }
  });
};

export function getVolumeChart(options, resultCallback) {
  getCoinpaprikaData(options, function (data) {
    if (data) {
      getCustomChart(options, data, 'volume', resultCallback);
    } else {
      resultCallback(null);
    }
  });
};

export function getMarketcapChart(options, resultCallback) {
  getCoinpaprikaData(options, function (data) {
    if (data) {
      getCustomChart(options, data, 'market_cap', resultCallback);
    } else {
      resultCallback(null);
    }
  });
};
