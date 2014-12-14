
var model;

var priceInstance;
var volumeInstance;
var rangeInstance;
var instrumentCodesInstance;
var indicatorsInstance;
var xAxisSyncer;

$(document).ready(initialisePage);

function initialisePage() {

    initialiseView();

    $.ajax({
        dataType: "json",
        url: "../../api/instrumentCodes",
        success: onGetInstrumentCodes
    });

    $.ajax({
        dataType: "json",
        url: "../../api/indicators",
        success: onGetIndicators
    });
}

function updateView(data) {
    model.instrumentCodeTitle(data.raw.marketCode + " - " + data.raw.instrumentCode + " - " + data.raw.companyName);
    model.days(data.days);
}

function initialiseView() {

    model = {};

    model.days = ko.observableArray();
    model.instrumentCodesDataSource = ko.observable();
    model.indicatorsDataSource = ko.observable();
    model.useAggregation = { text: 'Use aggregation?' };

    model.priceOptions = getChartOptions('price');
    model.volumeOptions = getChartOptions('volume');
    model.rangeOptions = getRangeOptions();
    model.instrumentCodeOptions = getInstrumentCodeOptions();
    model.instrumentCodeTitle = ko.observable();
    model.indicators = getIndicatorOptions();

    var aggregateTypes = ['Day', 'Week', 'Month', 'Quarter', 'Year'];
    model.aggregateType = { items: aggregateTypes, value: ko.observable(aggregateTypes[0]), width: 'auto', min: 1 };

    model.aggregateSize = { value: ko.observable(1) };
    model.isRelative = { text: 'Relative To Now?', value: ko.observable(true) };

    model.selectedInstrumentCode = ko.observable();

    ko.computed(function () {
        var params = {
            instrumentCode: model.selectedInstrumentCode(),
            aggregateType: model.aggregateType.value(),
            aggregateSize: model.aggregateSize.value(),
            isRelative: model.isRelative.value()
        };
        showInstrument(params);
    }).extend({ rateLimit: 2000 });

    ko.applyBindings(model);

    priceInstance = $("#price").dxChart("instance");
    volumeInstance = $("#volume").dxChart("instance");
    rangeInstance = $("#range").dxRangeSelector("instance");
    instrumentCodesInstance = $("#instrumentCodes").dxDataGrid("instance");
    indicatorsInstance = $("#indicators").dxDataGrid("instance");

    showLoading();

    xAxisSyncer = new _shares.XAxisSyncer();
    xAxisSyncer.add([priceInstance, volumeInstance, rangeInstance]);
}

function showInstrument(params) {

    if (!params.instrumentCode) {
        return;
    }

    showLoading();

    $.ajax({
        dataType: "json",
        url: "../../api/instrumentData",
        data: params,
        success: onGetInstrumentData,
        error: (function (jqXhr, textStatus, errorThrown) {
        })
    });
}

function showLoading() {
    priceInstance.showLoadingIndicator();
    volumeInstance.showLoadingIndicator();
    rangeInstance.showLoadingIndicator();
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

function onGetInstrumentCodes(data) {

    for (var i = 0; i < data.length; i++) {
        data[i] = { instrumentCode: data[i] };
    }

    model.instrumentCodesDataSource({ store: { data: data, type: 'array', key: 'instrumentCode' } });

    instrumentCodesInstance.selectRows(["NAB"], false);
}

function getInstrumentCodeOptions() {

    return {
        dataSource: model.instrumentCodesDataSource,
        loadPanel: true,
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
            model.selectedInstrumentCode(data.instrumentCode);
        }
    }
}

function onGetIndicators(data) {

    for (var i = 0; i < data.length; i++) {
        data[i].isPlotted = false;
    }

    model.indicatorsDataSource({ store: { data: data, type: 'array', key: 'displayName' } });
}

function getIndicatorOptions() {

    return {
        dataSource: model.indicatorsDataSource,
        loadPanel: true,
        showColumnLines: false,
        columns: [
            { dataField: 'isPlotted', allowFiltering: false, width: 30, allowEditing: true },
            { dataField: 'displayName', allowEditing: false }
        ],
        scrolling: {
            mode: 'virtual'
        },
        editing: {
            editEnabled: true,
            editMode: 'cell'
        },
        selection: {
            mode: 'single'
        },
        sorting: {
            mode: "none"
        },
        filterRow: {
            visible: false,
            applyFilter: "auto"
        },
        searchPanel: {
            visible: true,
            width: 130
        },
        showColumnHeaders: false,
        hoverStateEnabled: true,
        onSelectionChanged: function (selecteditems) {
            var data = selecteditems.selectedRowsData[0];
        }
    }
}

function getRangeOptions() {
    return {
        dataSource: model.days,
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
    var customizeTooltipText;

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

        customizeTooltipText = function () {
            return "<b>".concat(Globalize.format(this.argument, "dd/MM/yyyy"), "</b><br/>", 
                "Open: $", this.openValue, "<br/>", 
                "Close: $" + this.closeValue, "<br/>", 
                "High: $", this.highValue, "<br/>", 
                "Low: $", this.lowValue, "<br/>");
        }

    } else {
        series.push(
        {
            type: 'bar',
            valueField: 'volume',
            argumentField:
                'date'
        });

        customizeTooltipText = function() {
            return "<b>".concat(Globalize.format(this.argument, "dd/MM/yyyy"), "</b><br/>", "Volume: ", this.value);
        }
    }

    return {
        dataSource: model.days,
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
            shadow: { opacity: 0.1 },
            arrowLength: 30
        },
        legend: {
            visible: false
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