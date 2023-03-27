import path from "path";
import fs from "graceful-fs";

function checkIfMatches(parameter, value, partial) {
  let matches = true;

  if (partial) {
    if (!value || !(((value.toUpperCase().indexOf(parameter.toUpperCase())) > -1) || (parameter === "*"))) {
      matches = false;
    }
  } else {
    if (!value || (value.toUpperCase() !== parameter.toUpperCase())) {
      matches = false;
    }
  }

  return matches;
}

export function getExchangesList(req, resultCallback) {
  fs.readFile(path.join(path.dirname(require.main.filename), 'data', 'exchanges.json'), 'utf8', function (err, data) {
    if (err) {
      resultCallback({success: false, error: err});
    } else {
      let partial = req.query.partial ? req.query.partial.toUpperCase() == "TRUE" : false

      resultCallback({
        success: false, 
        data: JSON.parse(data).exchanges.filter(function (exchange) {
          if (req.query.name) {
            if (!checkIfMatches(req.query.name, exchange.name, partial)) {
              return false;
            }
          }

          if (req.query.address) {
            if (!checkIfMatches(req.query.address, exchange.address, partial)) {
              return false;
            }
          }

          if (req.query.paymentId) {
            if (!checkIfMatches(req.query.paymentId, exchange.paymentId, partial)) {
              return false;
            }
          }

          return true;
        })
      });
    }
  });
};