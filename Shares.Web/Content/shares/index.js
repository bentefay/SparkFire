
define(function (require) {

    var model;
    var shares = { XAxisSyncer: require('xAxisSyncer') };
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
        model.indicatorData = {};
        model.instrumentCodesDataSource = ko.observable();
        model.indicatorsDataSource = ko.observable();
        model.useAggregation = { text: 'Use aggregation?' };

        model.chartOptionsCollection = ko.observableArray([
            { options: getChartOptions('price'), id: 'price', heightOption: { height: ko.observable(), ratio: 2 } },
            { options: getChartOptions('volume'), id: 'volume', heightOption: { height: ko.observable(), ratio: 1 } }
        ]);

        updateChartHeights();

        model.rangeOptions = getRangeOptions();
        model.instrumentCodeOptions = getInstrumentCodeOptions();
        model.instrumentCodeTitle = ko.observable();
        model.indicators = getIndicatorOptions();

        var aggregateTypes = ['Day', 'Week', 'Month', 'Quarter', 'Year'];
        model.aggregateType = { items: aggregateTypes, value: ko.observable(aggregateTypes[3]), width: 'auto', min: 1 };

        model.aggregateSize = { value: ko.observable(1) };
        model.isRelative = { text: 'Relative To Now?', value: ko.observable(true) };

        model.selectedInstrumentCode = ko.observable();

        model.instrumentCodeRequestParams = ko.computed(function() {
            return constructInstrumentCodeRequestParams();
        });

        ko.applyBindings(model);

        for (var i = 0; i < model.chartOptionsCollection().length; i++) {
            model.chartOptionsCollection()[i].instance = $("#" + model.chartOptionsCollection()[i].id).dxChart("instance");
        }

        model.rangeSelectorInstance = $("#range").dxRangeSelector("instance");
        model.instrumentCodesInstance = $("#instrumentCodes").dxDataGrid("instance");
        model.indicatorsInstance = $("#indicators").dxDataGrid("instance");
        model.getDataStrategies = [];

        model.getDataStrategies.push({
            dataId: "default",
            getData: function(params) {
                $.ajax({
                    dataType: "json",
                    url: "../../api/instrumentData",
                    data: params,
                    success: onGetInstrumentData,
                    error: (function(jqXhr, textStatus, errorThrown) {
                    })
                });
            }
        });

        showLoading();

        xAxisSyncer = new shares.XAxisSyncer();
        xAxisSyncer.add(_(model.chartOptionsCollection()).map(function (o) { return o.instance }));
        xAxisSyncer.add([model.rangeSelectorInstance]);
    }

    function updateChartHeights() {
        options = _(model.chartOptionsCollection()).map(function (o) { return o.heightOption; });
        var summedRatios = _(options).map(function (o) { return o.ratio; }).reduce(function (acc, i) { return acc + i; }, 0);
        var percentagePerRatio = 100 / summedRatios;
        for (var i = 0; i < options.length; i++) {
            var percentage = percentagePerRatio * options[i].ratio;
            options[i].height(percentage + "%");
        }
    }

    function constructInstrumentCodeRequestParams() {
        var params = {
            instrumentCode: model.selectedInstrumentCode(),
            aggregateType: model.aggregateType.value(),
            aggregateSize: model.aggregateSize.value(),
            isRelative: model.isRelative.value()
        };
        return params;
    }

    function showInstrument(params) {

        if (!params.instrumentCode) {
            return;
        }

        showLoading();

        for (var i = 0; i < model.getDataStrategies.length; i++) {
            model.getDataStrategies[i].getData(params);
        }
    }

    function showLoading() {
        var c = model.chartOptionsCollection();
        for (var i = 0; i < c.length; i++) {
            c[i].instance.showLoadingIndicator();
        }
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

        model.instrumentCodesInstance.selectRows(["NAB"], false);

        // Immediately show the instrument and then introduce a delay for further changes
        model.selectedInstrumentCode("NAB");
        showInstrument(model.instrumentCodeRequestParams());

        model.instrumentCodeRequestParams.extend({ rateLimit: { timeout: 2000, method: "notifyWhenChangesStop" } })
            .subscribe(function (params) {
                showInstrument(params);
            });

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
            onSelectionChanged: function (options) {
                var data = options.selectedRowsData[0];
                model.selectedInstrumentCode(data.instrumentCode);
            }
        }
    }

    function onGetIndicators(data) {

        for (var i = 0; i < data.length; i++) {
            data[i].isPlotted = false;
        }

        var arrayStore = new DevExpress.data.ArrayStore({
            data: data,
            key: 'displayName',
            onUpdated: function (key) {
                arrayStore.byKey(key).done(function (dataItem) {

                    if (dataItem.isPlotted) {

                        model.indicatorData[key] = ko.observableArray();
                        var options = { options: getChartOptions(key), id: key, heightOption: { height: ko.observable("0%"), ratio: 1 } };
                        model.chartOptionsCollection.splice(1, 0, options);
                        var instance = $("#" + key).dxChart("instance");
                        xAxisSyncer.add([instance]);
                        options.instance = instance;

                        updateChartHeights();

                        var drawn = false;

                        var onDrawn = function () {

                            if (drawn) return;

                            instance.off('drawn', onDrawn);
                            drawn = true;

                            setTimeout(function () {
                                for (var i = 0; i < model.chartOptionsCollection().length; i++) {
                                    model.chartOptionsCollection()[i].instance.render({
                                        force: true,
                                        animate: false,
                                        asyncSeriesRendering: true
                                    });
                                }
                            }, 200);

                        };

                        instance.on('drawn', onDrawn);

                        var getData = function(params) {

                            params = _(params).extend(dataItem.defaultParameterObject);

                            $.ajax({
                                dataType: "json",
                                url: "../../api/indicator/" + dataItem.name,
                                data: params,
                                success: function (data) {
                                    model.indicatorData[key](data);
                                }
                            });
                        }

                        var params = model.instrumentCodeRequestParams();
                        getData(params);
                        model.getDataStrategies.push({ dataId: key, getData: getData });

                    } else {

                        var removedOptions = model.chartOptionsCollection.remove(function (item) { return item.id === key; });
                        delete model.indicatorData[key];

                        xAxisSyncer.remove([removedOptions[0].instance]);
                        model.getDataStrategies = _(model.getDataStrategies).reject(function(s) { return s.dataId === key; });

                        updateChartHeights();

                        setTimeout(function () {
                            for (var i = 0; i < model.chartOptionsCollection().length; i++) {
                                model.chartOptionsCollection()[i].instance.render({
                                    force: true,
                                    animate: false,
                                    asyncSeriesRendering: true
                                });
                            }
                        }, 200);

                    }
                });
            }
        });

        model.indicatorsDataSource({
            store: arrayStore
        });
    }

    function getIndicatorOptions() {

        return {
            dataSource: model.indicatorsDataSource,
            loadPanel: true,
            showColumnLines: false,
            columns: [
                { dataField: 'isPlotted', dataType: 'boolean', allowFiltering: false, width: 30, allowEditing: true, showEditorAlways: true },
                { dataField: 'displayName', allowEditing: false }
            ],
            scrolling: {
                mode: 'standard'
            },
            editing: {
                editEnabled: true,
                editMode: 'batch'
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
            },
            onRowUpdated: function (args) {
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

        var series;
        var valueAxisPrefix = "";
        var customizeTooltipText;
        var dataSource = model.days;

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

                dataSource = model.indicatorData["ATR"];

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
});