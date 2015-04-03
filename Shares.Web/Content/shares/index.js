
define(function (require) {

    var model;
    var shares = { XAxisSyncer: require('xAxisSyncer') };
    var chartOptions = require('chartOptions');
    var rangeOptions = require('rangeOptions');
    var instrumentCodeCollectionOptions = require('instrumentCodeCollectionOptions');
    var indicatorCollectionOptions = require('indicatorCollectionOptions');
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

    function initialiseView() {

        model = {};
        model.prices = ko.observableArray();
        model.indicatorData = {};
        model.instrumentCodesDataSource = ko.observable();
        model.indicatorsDataSource = ko.observable();
        model.chartOptionsCollection = ko.observableArray();

        updateChartHeights();

        model.selectedInstrumentCode = ko.observable();

        model.rangeOptions = rangeOptions.get(model.prices);
        model.instrumentCodeOptions = instrumentCodeCollectionOptions.get(model.instrumentCodesDataSource, model.selectedInstrumentCode);
        model.instrumentCodeTitle = ko.observable();
        model.indicators = indicatorCollectionOptions.get(model.indicatorsDataSource);

        var aggregateTypes = [ { key: 'Day', displayName: 'd' }, { key: 'Week', displayName: 'w' }, { key: 'Month', displayName: 'm' }, 
            { key: 'Quarter', displayName: 'q' }, { key: 'Year', displayName: 'y' }];
        model.aggregateTypes = { items: aggregateTypes, selectedItem: ko.observable(aggregateTypes[3]) };

        model.aggregateSize = { value: ko.observable(1), width: '60px' };
        model.isRelative = { text: 'Relative', value: ko.observable(true) };

        model.instrumentCodeRequestParams = ko.computed(function() {
            return constructInstrumentCodeRequestParams();
        });

        ko.applyBindings(model);

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
        xAxisSyncer.add([model.rangeSelectorInstance]);
    }

    function updateChartHeights() {
        var options = _(model.chartOptionsCollection()).map(function (o) { return o.heightOption; });
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
            aggregateType: model.aggregateTypes.selectedItem().key,
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

        var prices = data.prices;
        
        if (prices.length > 0)
            xAxisSyncer.setAllBounds(prices[0].dateTime, prices[prices.length - 1].dateTime);

        model.instrumentCodeTitle(data.marketCode + " - " + data.instrumentCode + " - " + data.companyName);
        model.prices(data.prices);
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

    function onGetIndicators(data) {

        for (var i = 0; i < data.length; i++) {
            data[i].isPlotted = false;
        }

        var arrayStore = new DevExpress.data.ArrayStore({
            data: data,
            key: 'name',
            onUpdated: function (key) {
                arrayStore.byKey(key).done(function (dataItem) {

                    if (dataItem.isPlotted) {

                        var getData = function(params) {

                            params = _(params).extend(dataItem.defaultParameterObject);

                            $.ajax({
                                dataType: "json",
                                url: "../../api/indicator/" + dataItem.name,
                                data: params,
                                success: function (data) {

                                    model.indicatorData[key] = ko.observableArray(data);
                                    var options = { options: chartOptions.get(key, model.indicatorData[key]), id: key, heightOption: { height: ko.observable("0%"), ratio: 1 } };
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
});