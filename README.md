# Chart API-s

Currently there are 3 chart API calls supported that return PNG images as result. The calls have the following endpoints:

* /charts/price.png -> Price history for Fango coin
* /charts/volume.png -> Volume history for Fango coin
* /charts/marketcap.png -> Marketcap history for Fango coin

The type chart you get back depends on the parameters you pass in the URL.

## Supported Parameters

**vsCurrency**: The currency versus which the chart values are ploted. For instance USD. Example:

```
charts/price.png?vsCurrency=usd
```

**days**: Timespan for which the chart is ploted. Example:

```
charts/price.png?days=30
```

**xPoints**: The number of labels on the x-axis. Example:

```
charts/price.png?xPoints=7
```

**priceDecimals**: The number of decimal places for the price values. Example:

```
charts/price.png?priceDecimals=2
```

**priceSymbol**: The symbol appended to the price values. Example:

```
charts/price.png?priceSymbol=$
```

**width**: the width of the resulting image. Example:

```
charts/price.png?width=1200
```

**height**: the height of the resulting image. Example:

```
charts/price.png?height=800
```
**dateFormat**: The format of the date on charts. Example:

```
charts/price.png?dateFormat=YYYY-MM-DD
```

# Pool API-s

These are APIs that will give you pools info

* /pools/list -> This gives you a shuffled list of all XFG pools 
* /pools/data -> This gives you a shuffled list of all XFG pools data

# Exchange API-s

These are APIs that will give you exchanges info

* /exchanges/list -> This gives you a filtered list of exchanges data.


## Supported Parameters

**name**: Filter by the exchange name. Partial searches supported (by default). Example:

```
exchanges/list?name=Hotbit
```

**address**: Filter by the exchange address if its a permanent one. Partial searches supported (by default). Example:

```
exchanges/list?address=ccx7dnmkqFgHHnuQsaWjg57Hk69jmk6k4XKdG34jmX39ho5Gz45SJJ9U96zYzAcqP421xp8qU3NVpMsFhCotmuGR75i9PAQXEj
```

Both parameters also support wildcard searches and partial searches. For example

```
exchanges/list?name=Hot
```

Will search for all exchanges with that substring in the name. While

```
exchanges/list?address=*
```

Will search for all exchanges that have an address field present.

**partial**: Explicitly define if partial search is on or off. Its on by default. If you want to disable it you can set it like this: 

```
exchanges/list?partial=false
```


# Node API-s

These are APIs that will give you nodes info

* /nodes/geodata -> This gives you geodata for all known nodes.


# Market API-s

These are APIs that will give you market info for XFG

* /market/info -> This gives you general info for the market.

## Supported Parameters

**vsCurrencies**: The currencies for which the info will be retreived.

```
market/info?vsCurrencies=usd,btc,eur
```
* /market/history -> This gives you history info for the market for last N days.

## Supported Parameters

**vsCurrency**: The currency for which the history will be shown

```
market/history?vsCurrency=usd
```

**days**: Timespan for which the history is retreived

```
market/history?days=30
```

