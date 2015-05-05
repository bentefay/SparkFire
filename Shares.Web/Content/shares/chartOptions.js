define(function(require) {

    function getConfig(dataType) {

        var series;
        var valueAxisPrefix = "";

        switch (dataType) {
            case "price":
                valueAxisPrefix = "$";

                series = [
                    {
                        name: 'Price',
                        type: 'candleStick',
                        openValueField: 'open',
                        highValueField: 'high',
                        lowValueField: 'low',
                        closeValueField: 'close',
                        argumentField: 'dateTime',
                        color: '#5F8B95',
                        reduction: {
                            color: '#5F8B95'
                        },
                        getTooltips: function (data) {
                            return ["Open: $" + data.openValue, "Close: $" + data.closeValue, "High: $" + data.highValue, "Low: $" + data.lowValue];
                        }
                    }
                ];
                break;

            case "volume":
                series = [
                    {
                        name: 'Volume',
                        type: 'bar',
                        valueField: 'value',
                        argumentField: 'dateTime'
                    }
                ];
                break;

            case "atr":

                series = [
                    {
                        name: 'ATR',
                        type: 'line',
                        valueField: 'value',
                        argumentField: 'dateTime',
                        point: { visible: false }
                    }
                ];

                break;

            case "macdSignalLine":

                series = [
                    {
                        name: 'MACD',
                        type: 'line',
                        valueField: 'macd',
                        argumentField: 'dateTime',
                        point: { visible: false },
                        color: '#000000'
                    },
                    {
                        name: 'Signal Line',
                        type: 'line',
                        valueField: 'signalLine',
                        argumentField: 'dateTime',
                        point: { visible: false },
                        color: '#FF0000'
                    }
                ];
                break;

            case "macdh":

                series = [
                    {
                        name: "MACDH",
                        type: 'bar',
                        valueField: 'value',
                        argumentField: 'dateTime'
                    }
                ];
                break;

            case "percentR":

                series = [
                    {
                        name: 'Percent R',
                        type: 'line',
                        valueField: 'value',
                        argumentField: 'dateTime',
                        point: { visible: false }
                    }
                ];
                break;

            case "adx":

                series = [
                    {
                        name: 'ADX',
                        type: 'line',
                        valueField: 'adx',
                        argumentField: 'dateTime',
                        point: { visible: false },
                        color: '#0000FF'
                    },
                    {
                        name: 'Positive DI',
                        type: 'line',
                        valueField: 'positiveDi',
                        argumentField: 'dateTime',
                        point: { visible: false },
                        color: '#FF0000'
                    },
                    {
                        name: 'Negative DI',
                        type: 'line',
                        valueField: 'negativeDi',
                        argumentField: 'dateTime',
                        point: { visible: false },
                        color: '#00FF00'
                    }
                ];
                break;

            case "tradingBand":

                valueAxisPrefix = "$";

                series = [
                    {
                        name: 'TB Upper',
                        type: 'line',
                        valueField: 'upper',
                        argumentField: 'dateTime',
                        point: { visible: false },
                        color: '#0000FF'
                    },
                    {
                        name: 'TB Indicator',
                        type: 'line',
                        valueField: 'indicator',
                        argumentField: 'dateTime',
                        point: { visible: false },
                        color: '#FF0000'
                    },
                    {
                        name: 'TB Lower',
                        type: 'line',
                        valueField: 'lower',
                        argumentField: 'dateTime',
                        point: { visible: false },
                        color: '#00FF00'
                    }
                ];
                break;

            default:
                throw new Error("Unexpected dataType: " + dataType);
        }

        _(series).chain().each(function(s) {
            if (!s.getTooltips) {
                s.getTooltips = function(data) {
                    return [ data.seriesName + ": " + valueAxisPrefix + data.value ];
                };
            } 
        });
        
        _(series).each(function(s) {
            _(s).chain().keys().filter(function(k) {
                return k.indexOf('alueField') != -1;
            }).each(function(k) {
                s[k] = dataType + "_" + s[k];
            });
        });

        return {
            series: series,
            valueAxisPrefix: valueAxisPrefix
        };
    }

    function get(dataTypes, dataSource) {

        var configs = _(dataTypes).chain().map(function (dataType) { return getConfig(dataType); });

        var customizeTooltipText = function () {
            var that = this;
            return "<b>" + Globalize.format(that.argument, "dd/MM/yyyy") + "</b><br/>" +
                _(that.points).chain().map(function (p) {
                    var options = p.point.series.getOptions();
                    return options.getTooltips(p);
                }).flatten(true).value().join("<br/>");
        };

        var series = configs.map(function (config) { return config.series; }).flatten(true).value();

        var valueAxisPrefix = configs.value()[0].valueAxisPrefix;

        return {
            dataSource: dataSource,
            valueAxis: {
                valueType: 'numeric',
                placeholderSize: 40,
                label: {
                    customizeText: function () {
                        if (this.value >= 1000000000) {
                            return valueAxisPrefix.concat(this.value / 1000000000, "B");
                        } else if (this.value >= 1000000) {
                            return valueAxisPrefix.concat(this.value / 1000000, "M");
                        } else if (this.value >= 1000) {
                            return valueAxisPrefix.concat(this.value / 1000, "K");
                        } else {
                            return valueAxisPrefix.concat(this.value);
                        }
                    }
                }
            },
            scrollingMode: 'all',
            zoomingMode: 'all',
            scrollBar: {
                visible: false
            },
            argumentAxis: {
                valueMarginsEnabled: false,
                placeHolderSize: 0,
                grid: {
                    visible: true
                },
                label: {
                    // Only having one chart with x axis labels results in the chart 
                    // sometimes being a different width due to the labels increasing the margin
                    // visible: dataType === "volume"
                },
                argumentType: 'datetime'
            },
            crosshair: {
                enabled: false,
                label: {
                    visible: true
                }
            },
            tooltip: {
                enabled: true,
                location: "edge",
                customizeText: customizeTooltipText,
                shadow: { opacity: 0 },
                opacity: 0.8,
                paddingLeftRight: 9,
                paddingTopBottom: 8,
                arrowLength: 10,
                shared: true
            },
            legend: {
                visible: false
            },
            margin: {
                right: 10
            },
            useAggregation: false,
            commonSeriesSettings: {
                ignoreEmptyPoints: true
            },
            series: series,
            animation: { enabled: false },
            loadingIndicator: { show: true }
        };

    }

    return { get: get };
});