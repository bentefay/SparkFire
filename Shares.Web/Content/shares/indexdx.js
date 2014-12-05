
$(document).ready(hydrateChart);

function hydrateChart() {

    $.ajax({
        dataType: "json",
        url: "../../api/shares?path=NAB.EOD",
        success: function (data) {

            var days = [];

            for (var i = 0; i < data.date.length; i++) {
                days[i] = {
                    date: data.date[i],
                    open: data.open[i],
                    high: data.high[i],   
                    low: data.low[i],
                    close: data.close[i],
                    volume: data.volume[i]
                };
            }

            renderChart({
                description: data.description,
                days: days
            });
        },
        error: (function (jqXhr, textStatus, errorThrown) {
        })
    });
}

function renderChart(data) {

    var model = {};

    model.chartOptions = {
        title: data.description,
        dataSource: data.days,
        panes: [
            { name: 'price' },
            { name: 'volume' }
        ],
        valueAxis: {
            valueType: 'numeric'
        },
        argumentAxis: {
            valueMarginsEnabled: false,
            grid: {
                visible: true
            },
            label: {
                visible: true
            },
            argumentType: 'datetime'
        },
        crosshair: {
            enabled: true,
            label: {
                visible: true
            }
        },                               
        tooltip: {
            enabled: true,
            location: "edge",
            customizeText: function () {
                if (!this.openValue) {
                    return this.value;
                } else {
                    return "Open: $" + this.openValue + "<br/>" +
                        "Close: $" + this.closeValue + "<br/>" +
                        "High: $" + this.highValue + "<br/>" +
                        "Low: $" + this.lowValue + "<br/>";
                }
            }
        },
        legend: {
            visible: false
        },
        useAggregation: true,
        commonSeriesSettings: {
            ignoreEmptyPoints: true
        },
        series: [{
            pane: 'price',
            type: 'candleStick',
            openValueField: 'open',
            highValueField: 'high',
            lowValueField: 'low',
            closeValueField: 'close',
            argumentField: 'date',
            color: 'black',
            reduction: {
                color: 'black'
            }
        },
        {
            pane: 'volume',
            type: 'bar',
            valueField: 'volume',
            argumentField: 'date'
        } ]
    };

    model.rangeOptions = {
        size: {
            height: 120
        },
        dataSource: data.days,
        chart: {
            useAggregation: true,
            valueAxis: { valueType: 'numeric' },
            series: {
                type: 'line',
                valueField: 'open',
                argumentField: 'date'
            },
        },
        scale: {
            minorTickInterval: 'month',
            majorTickInterval: 'year',
            valueType: 'datetime',
            placeholderHeight: 20
        },
        behavior: {
            callSelectedRangeChanged: "onMoving",
            snapToTicks: false
        },
        selectedRangeChanged: function (e) {
            var price = $("#container #chart").dxChart("instance");
            price.zoomArgument(new Date(e.startValue), new Date(e.endValue));
        }
    };

    var html = [
        '<div id="chart" data-bind="dxChart: chartOptions" style="height: 600px;margin: 50px"></div>',
        '<div data-bind="dxRangeSelector: rangeOptions" style="height: 60px;margin: 50px"></div>'
    ].join('');

    $("#container").append(html);
    ko.applyBindings(model, $("#container")[0]);

    console.log("?");
}