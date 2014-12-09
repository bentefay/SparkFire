
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

    var onContentReader = function () {
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

    model.priceOptions = getChartOptions('price');
    model.volumeOptions = getChartOptions('volume');
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
        onSelectionChanged: function (selecteditems) {
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
        selectedRangeChanged: function(e) { updateZoom(e, 'range'); },
        sliderMarker: { visible: false },
        margin: {
            right: 0,
            left: 0,
            top: 0,
            bottom: 0
        }
    }
}

function getChartOptions(dataType) {

    var series = [];
    var valueAxisPrefix = "";

    if (dataType === "price") {

        valueAxisPrefix = "$";

        series.push(
        {
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
        });
    } else {
        series.push(
        {
            type: 'bar',
            valueField: 'volume',
            argumentField:
                'date'
        });
    }

    return {
        dataSource: days,
        valueAxis: {
            valueType: 'numeric',
            placeholderSize: 30,
            label: {
                customizeText: function () {
                    if (this.value > 1000000000) {
                        return valueAxisPrefix.concat(this.value / 1000000000, "B");
                    } else if (this.value > 1000000) {
                        return valueAxisPrefix.concat(this.value / 1000000, "M");
                    } else if (this.value > 1000) {
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
            grid: {
                visible: true
            },
            label: {
                visible: dataType === "volume"
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
                    return "Volume: " + this.value;
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
        series: series,
        animation: { enabled: false },
        onDrawn: function (data) {
            var ranges = data.component.businessRanges[0].arg;
            if (ranges.minVisible && ranges.maxVisible)
                updateZoom({ startValue: ranges.minVisible, endValue: ranges.maxVisible }, dataType);
        }
    };
}

var leader = null;
var timerId = null;

function updateZoom(e, controlType) {

    var bounds;

    if (leader === null) {
        leader = controlType;
    } else if (controlType !== leader) {
        return;
    }

    if (timerId !== null)
        clearTimeout(timerId);

    timerId = setTimeout(function () {
        leader = null;
        timerId = null;
    }, 500);

    if (controlType !== "price") {
        var price = $("#price").dxChart("instance");
        bounds = price.businessRanges[0].arg;
        if (!boundsEqual(e, bounds.minVisible, bounds.maxVisible))
            price.zoomArgument(new Date(e.startValue), new Date(e.endValue));
    }

    if (controlType !== "volume") {
        var volume = $("#volume").dxChart("instance");
        bounds = volume.businessRanges[0].arg;
        if (!boundsEqual(e, bounds.minVisible, bounds.maxVisible))
            volume.zoomArgument(new Date(e.startValue), new Date(e.endValue));
    }

    if (controlType !== "range") {
        var range = $("#range").dxRangeSelector("instance");
        bounds = range.getSelectedRange();
        if (!boundsEqual(e, bounds.startValue, bounds.endValue))
            range.setSelectedRange(e);
    }
}

function boundsEqual(e, startValue, endValue) {

    if (!startValue || !endValue || !e.startValue || !e.endValue)
        return false;

    return startValue.getTime() === e.startValue.getTime() && endValue.getTime() === e.endValue.getTime();
}