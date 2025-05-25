// Copyright (c) 2019, Taegus Cromis, The Conceal Developers
//
// Please see the included LICENSE file for more information.

import queryString from "query-string";
import shell from "shelljs";
import path from "path";
import fs from "fs";

export function ensureUserDataDir() {
  var userDataDir = process.env.APPDATA || (process.platform === "darwin" ? process.env.HOME + "/Library/Application Support" : process.env.HOME + "/.local/share");
  userDataDir = path.join(userDataDir, "ccxServices");

  if (!fs.existsSync(userDataDir)) {
    shell.mkdir('-p', userDataDir);
  }

  return userDataDir;
};

export function geckoURL(path, params) {
  return `https://api.coingecko.com/api/v3/${path}?${queryString.stringify(params)}`;

};

export function coinpaprikaURL(path, params) {
  const base = `https://api.coinpaprika.com/v1/${path}`;
  if (params && Object.keys(params).length > 0) {
    return `${base}?${queryString.stringify(params)}`;
  }
  return base;
}