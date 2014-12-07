
$(document).ready(populateScreen);

function populateScreen() {
    $.ajax({
        dataType: "json",
        url: "../../api/shares/allinstrumentcodes",
        success: onGetAllInstrumentCodes
    });
}

function onGetAllInstrumentCodes(data) {

    for (var i = 0; i < data.length; i++) {
        data[i] = { instrumentCode: data[i] };
    }

    $("#instrumentCodeLookup").dxDataGrid({
        dataSource: data,
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
        onSelectionChanged: function (selecteditems) {
            var data = selecteditems.selectedRowsData[0];
            showInstrumentCode(data.instrumentCode);
        }
    });

    showInstrumentCode('nab');
}

function showInstrumentCode(instrumentCode) {
    $.ajax({
        dataType: "json",
        url: "../../api/shares?instrumentCode=" + instrumentCode,
        success: onGetInstrumentCodeData,
        error: (function (jqXhr, textStatus, errorThrown) {
        })
    });
}

function onGetInstrumentCodeData(data) {

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

    renderCharts({
        raw: data,
        days: days
    });
}

var days;
var title;
var chartsInitialised = false;

function renderCharts(data) {

    if (!chartsInitialised) {
        days = ko.observableArray();
        title = ko.observable();
    }

    days(data.days);
    title(data.raw.marketCode + " - " + data.raw.instrumentCode + " - " + data.raw.companyName);

    if (!chartsInitialised) {
        chartsInitialised = true;
        initialiseCharts();
    }
}

function initialiseCharts() {
    var model = {};

    model.chartOptions = {
        title: title,
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

    model.rangeOptions = {
        size: {
            height: 80
        },
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
            minorTickInterval: 'month',
            majorTickInterval: 'year',
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
            var price = $("#container #chart").dxChart("instance");
            price.zoomArgument(new Date(e.startValue), new Date(e.endValue));
        },
        sliderMarker: { visible: false },
        margin: {
            right: 0,
            left: 0,
            top: 0,
            bottom: 0
        }
    };

    var html = [
        '<div id="chart" data-bind="dxChart: chartOptions" style="margin: 10px"></div>',
        '<div data-bind="dxRangeSelector: rangeOptions" style="margin: 10px"></div>'
    ].join('');

    $("#container").append(html);
    ko.applyBindings(model, $("#container")[0]);
}