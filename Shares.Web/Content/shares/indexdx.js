
$(document).ready(initialisePage);

function initialisePage() {

    initialiseView();

    $.ajax({
        dataType: "json",
        url: "../../api/shares/allinstrumentcodes",
        success: onGetInstrumentCodes
    });
}

function onGetInstrumentCodes(data) {

    for (var i = 0; i < data.length; i++) {
        data[i] = { instrumentCode: data[i] };
    }

    instrumentCodes(data);

    var grid = $("#instrumentCodes").dxDataGrid("instance");

    var onContentReader = function() {
        grid.selectRowsByIndexes([0]);
        grid.off('contentReady', onContentReader);
    };

    grid.on('contentReady', onContentReader);
}

function showInstrument(instrumentCode) {

    $.ajax({
        dataType: "json",
        url: "../../api/shares?instrumentCode=" + instrumentCode,
        success: onGetInstrumentData,
        error: (function (jqXhr, textStatus, errorThrown) {
        })
    });
}

function onGetInstrumentData(data) {

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

    updateView({
        raw: data,
        days: days
    });
}

var model;
var days;
var instrumentCodes;

function updateView(data) {
    model.instrumentCode(data.raw.marketCode + " - " + data.raw.instrumentCode + " - " + data.raw.companyName);
    days(data.days);
}

function initialiseView() {

    model = {};

    days = ko.observableArray();
    instrumentCodes = ko.observableArray();

    model.chartOptions = getChartOptions();
    model.rangeOptions = getRangeOptions();
    model.instrumentCodeOptions = getInstrumentCodeOptions();
    model.instrumentCode = ko.observable();

    ko.applyBindings(model);
}

function getInstrumentCodeOptions() {

    return {
        dataSource: instrumentCodes,
        loadPanel: false,
        scrolling: {
            mode: 'virtual'
        },
        selection: {
                mode: 'single'
        },
        sorting: {
                mode: "none"
        },
        filterRow: {
                visible: true,
                applyFilter: "auto"
        },
        showColumnHeaders: false,
        hoverStateEnabled: true,
        onSelectionChanged: function(selecteditems) {
            var data = selecteditems.selectedRowsData[0];
            showInstrument(data.instrumentCode);
        }
    }
}

function getRangeOptions() {
    return {
        dataSource: days,
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
                //minorTickInterval: 'month',
                //majorTickInterval: 'year',
                valueType: 'datetime',
                placeholderHeight: 20,
                minRange: {
                    days: 20
                }
        },
        behavior: {
                callSelectedRangeChanged: "onMovingComplete",
                snapToTicks: true,
                allowSlidersSwap: false,
                animation: false
        },
        selectedRangeChanged: function (e) {
            var price = $("#candles").dxChart("instance");
            price.zoomArgument(new Date(e.startValue), new Date(e.endValue));
        },
        sliderMarker: { visible: false },
        margin: {
                right: 0,
                left: 0,
                top: 0,
                bottom: 0
        }
    }
}

function getChartOptions() {
    return {
        dataSource: days,
        panes: [
            { name: 'price' },
            { name: 'volume' }
        ],
        defaultPane: 'price',
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
        useAggregation: false,
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
        }],
        animation: { enabled: false }
    };
}