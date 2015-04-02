define(function(require) {

    function get(dataType, dataSource) {

        var series;
        var valueAxisPrefix = "";
        var customizeTooltipText;

        switch (dataType) {
            case "price":
                valueAxisPrefix = "$";

                series = [
                    {
                        type: 'candleStick',
                        openValueField: 'open',
                        highValueField: 'high',
                        lowValueField: 'low',
                        closeValueField: 'close',
                        argumentField: 'date',
                        color: '#5F8B95',
                        reduction: {
                            color: '#5F8B95'
                        }
                    }
                ];

                customizeTooltipText = function () {
                    return "<b>".concat(Globalize.format(this.argument, "dd/MM/yyyy"), "</b><br/>",
                        "Open: $", this.openValue, "<br/>",
                        "Close: $" + this.closeValue, "<br/>",
                        "High: $", this.highValue, "<br/>",
                        "Low: $", this.lowValue, "<br/>");
                }
                break;

            case "volume":
                series = [
                    {
                        type: 'bar',
                        valueField: 'volume',
                        argumentField: 'date'
                    }
                ];

                customizeTooltipText = function () {
                    return "<b>".concat(Globalize.format(this.argument, "dd/MM/yyyy"), "</b><br/>", "Volume: ", this.value);
                }
                break;

            case "atr":

                series = [
                    {
                        type: 'line',
                        valueField: 'value',
                        argumentField: 'dateTime',
                        point: { visible: false }
                    }
                ];

                customizeTooltipText = function () {
                    return "<b>".concat(Globalize.format(this.argument, "dd/MM/yyyy"), "</b><br/>", "ATR: ", this.value);
                }
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

                customizeTooltipText = function () {
                    return "<b>" + Globalize.format(this.argument, "dd/MM/yyyy") + "</b><br/>" +
                        _(this.points).map(function (p) { return p.seriesName + ": " + p.value }).join("<br/>");
                }
                break;

            case "macdh":

                series = [
                    {
                        type: 'bar',
                        valueField: 'value',
                        argumentField: 'dateTime'
                    }
                ];

                customizeTooltipText = function () {
                    return "<b>".concat(Globalize.format(this.argument, "dd/MM/yyyy"), "</b><br/>", "MACDH: ", this.value);
                }
                break;

            case "percentR":

                series = [
                    {
                        type: 'line',
                        valueField: 'value',
                        argumentField: 'dateTime',
                        point: { visible: false }
                    }
                ];

                customizeTooltipText = function () {
                    return "<b>".concat(Globalize.format(this.argument, "dd/MM/yyyy"), "</b><br/>", "Percent R: ", this.value);
                }
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

                customizeTooltipText = function () {
                    return "<b>" + Globalize.format(this.argument, "dd/MM/yyyy") + "</b><br/>" +
                        _(this.points).map(function (p) { return p.seriesName + ": " + p.value }).join("<br/>");
                }
                break;

            case "tradingBand":

                series = [
                    {
                        name: 'Upper',
                        type: 'line',
                        valueField: 'upper',
                        argumentField: 'dateTime',
                        point: { visible: false },
                        color: '#0000FF'
                    },
                    {
                        name: 'Indicator',
                        type: 'line',
                        valueField: 'indicator',
                        argumentField: 'dateTime',
                        point: { visible: false },
                        color: '#FF0000'
                    },
                    {
                        name: 'Lower',
                        type: 'line',
                        valueField: 'lower',
                        argumentField: 'dateTime',
                        point: { visible: false },
                        color: '#00FF00'
                    }
                ];

                customizeTooltipText = function () {
                    return "<b>" + Globalize.format(this.argument, "dd/MM/yyyy") + "</b><br/>" +
                        _(this.points).map(function (p) { return p.seriesName + ": " + p.value }).join("<br/>");
                }
                break;

            default:
                throw new Error("Unexpected dataType: " + dataType);
        }

        return {
            dataSource: dataSource,
            valueAxis: {
                valueType: 'numeric',
                placeholderSize: 40,
                label: {
                    customizeText: function() {
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