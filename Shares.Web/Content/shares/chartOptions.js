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

            case "ATR":

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

            case "MACD":

                series = [
                    {
                        type: 'line',
                        valueField: 'value',
                        argumentField: 'dateTime',
                        point: { visible: false }
                    }
                ];

                customizeTooltipText = function () {
                    return "<b>".concat(Globalize.format(this.argument, "dd/MM/yyyy"), "</b><br/>", "MACD: ", this.value);
                }
                break;

            case "MACDH":

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

            case "ADX":

                series = [
                    {
                        type: 'line',
                        valueField: 'adx',
                        argumentField: 'dateTime',
                        point: { visible: false }
                    },
                    {
                        type: 'line',
                        valueField: 'positiveDi',
                        argumentField: 'dateTime',
                        point: { visible: false }
                    },
                    {
                        type: 'line',
                        valueField: 'negativeDi',
                        argumentField: 'dateTime',
                        point: { visible: false }
                    }
                ];

                customizeTooltipText = function () {
                    return "<b>".concat(Globalize.format(this.argument, "dd/MM/yyyy"), "</b><br/>", "ADX: ", this.value);
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
                    visible: dataType === "volume"
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
                arrowLength: 10
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