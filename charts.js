import { ChartJSNodeCanvas } from "chartjs-node-canvas";
import * as utils from "./utils.js";
import smooth from "array-smooth";
import moment from "moment";
import axios from "axios";

const request = axios.create({
  timeout: 10000, // 10 seconds
  headers:{
    'User-Agent': 'Fuego Services'
  }
});

const COINPAPRIKA_ID = 'xfg-fuego';

function getCoinpaprikaData(options, callback) {
  // Coinpaprika: /coins/{coin_id}/ohlcv/historical
  const params = {
    start: options.start || undefined, // ISO 8601 date
    end: options.end || undefined,     // ISO 8601 date
    limit: options.days || 7
  };
  Object.keys(params).forEach(key => params[key] === undefined && delete params[key]);

  request.get(utils.coinpaprikaURL(`coins/${COINPAPRIKA_ID}/ohlcv/historical`, params)).then(response => {
    callback(response.data);
  }).catch(err => {
    console.log(`getCoinpaprikaData: ${err.message}`);
    callback(null);
  });
}

function getCustomChart(options, chartData, valueKey, resultCallback) {
  function makeConfiguration(data) {
    var timeLabels = [];
    var dataPoints = [];
    var dataLength = data.length;
    var durationAsMS = moment.duration(options.days / dataLength, 'd').asMilliseconds();

    data.forEach(function (value) {
      dataPoints.push(value[valueKey]);
    });

    for (let i = dataLength - 1; i >= 0; i--) {
      timeLabels.push(moment().subtract(durationAsMS * (i + 1), 'ms').format(options.dateFormat));
    }

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
