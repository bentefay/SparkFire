
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
        model.instrumentCodesDataSource = ko.observable();
        model.indicatorsDataSource = ko.observable();

        model.chartOptionsCollection = ko.observableArray();
        model.chartOptionsDictionary = {};

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
        model.getDataStrategies = {};

        model.getDataStrategies["default"] = {
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
        };

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

        _(model.getDataStrategies).each(function(dataStrategy) {
            dataStrategy.getData(params);
        });
    }

    function showLoading() {
        var c = model.chartOptionsCollection();
        for (var i = 0; i < c.length; i++) {
            c[i].instance.showLoadingIndicator();
        }
    }

    function onGetInstrumentData(data) {

        var prices = data.prices;

        model.instrumentCodeTitle(data.marketCode + " - " + data.instrumentCode + " - " + data.companyName);
        model.prices(data.prices);

        setTimeout(function() {
            if (prices.length > 0)
                xAxisSyncer.setAllBounds(new Date(prices[0].dateTime), new Date(prices[prices.length - 1].dateTime));
        }, 400);
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
            key: 'id',
            onUpdated: function (key) {
                arrayStore.byKey(key).done(function (dataItem) {
                    indicatorIsPlottedChanged(dataItem);
                });
            }
        });

        model.indicatorsDataSource({
            store: arrayStore
        });
    }

    function indicatorIsPlottedChanged(indicatorInfo) {

        if (indicatorInfo.isPlotted) {

            addIndicator(indicatorInfo);

        } else {

            removeIndicator(indicatorInfo);
        }
    }

    function addIndicator(indicatorInfo) {

        var options = model.chartOptionsDictionary[indicatorInfo.graphGroup];
        var isNewGraph = !options;

        var dataSource = ko.observableArray();

        if (isNewGraph) {
            options = {
                id: indicatorInfo.graphGroup,
                heightOption: { height: ko.observable("0%"), ratio: 1 },
                dataSource: dataSource,
                indicatorInfos: {}
            };
        } else {
            options.dataSource = dataSource;
        }

        options.indicatorInfos[indicatorInfo.id] = indicatorInfo;

        updateIndicatorChart(options, !isNewGraph);
    }

    function removeIndicator(indicatorInfo) {

        var options = model.chartOptionsDictionary[indicatorInfo.graphGroup];

        if (_(options.indicatorInfos).keys().length > 1) {

            delete options.indicatorInfos[indicatorInfo.id];
            updateIndicatorChart(options, true);

        } else {
            model.chartOptionsCollection.remove(options);
            delete model.chartOptionsDictionary[indicatorInfo.graphGroup];

            xAxisSyncer.remove([options.instance]);
            delete model.getDataStrategies[indicatorInfo.graphGroup];
        }

        updateChartHeights();

        renderAllCharts();
    }

    function updateIndicatorChart(options, chartExists) {

        var indicatorIds = _(options.indicatorInfos).map(function (info) { return info.id; });
        options.options = chartOptions.get(indicatorIds, options.dataSource);

        if (chartExists) {
            model.chartOptionsCollection.remove(options);
        }

        model.chartOptionsCollection.splice(1, 0, options);
        model.chartOptionsDictionary[options.id] = options;

        var instance = $("#" + options.id).dxChart("instance");
        options.instance = instance;

        if (!chartExists) {
            xAxisSyncer.add([instance]);
        }

        updateChartHeights();

        renderAllChartsAfter(options.instance);

        var getData = function (params) {

            var indicatorInfos = _(options.indicatorInfos).map(function (info) { return info; });

            var deferreds = _(options.indicatorInfos).map(function (info) {
                params = _(params).extend(info.defaultParameterObject);
                return $.ajax({
                    dataType: "json",
                    url: "../../api/indicator/" + info.id,
                    data: params
                });
            });

            whenDone(deferreds, function (results) {
                var indicatorCollection = _(results).map(function (r, i) {
                    return { info: indicatorInfos[i], data: r.data };
                });
                var data = mergeIndicatorData(indicatorCollection);
                options.dataSource(data);
            });
        }

        var params = model.instrumentCodeRequestParams();
        getData(params);
        model.getDataStrategies[options.id] = { getData: getData };
    }

    function whenDone(deferreds, done) {
        $.when.apply(undefined, deferreds).done(function () {
            if (deferreds.length === 1)
                done([{ data: arguments[0], statusText: arguments[1], jqXHR: arguments[2] }]);
            else
                done(_(arguments).map(function (a) {
                    return { data: a[0], statusText: a[1], jqXHR: a[2] };
                }));
        });
    }

    function mergeIndicatorData(indicatorCollection) {

        var mergedPoints = {};

        var fields = _(indicatorCollection).chain()
            .map(function (i) {
                return _(i.info.fieldNames)
                    .filter(function (f) { return f !== "dateTime"; })
                    .map(function (f) { return i.info.id + "_" + f; });
            })
            .flatten(true)
            .value();

        _(indicatorCollection).each(function (indicator) {
            for (var i = 0; i < indicator.data.length; i++) {
                var indicatorPoint = indicator.data[i];
                var mergedPoint = mergedPoints[indicatorPoint.dateTime];
                if (!mergedPoint) {
                    mergedPoint = { dateTime: indicatorPoint.dateTime };
                    _(fields).each(function(f) { mergedPoint[f] = null; });
                    mergedPoints[indicatorPoint.dateTime] = mergedPoint;
                }
                _(indicatorPoint).chain().keys().each(function (key) {
                    if (key !== "dateTime")
                        mergedPoint[indicator.info.id + "_" + key] = indicatorPoint[key];
                });
            }
        });

        return _(mergedPoints).map(function(p) { return p; });
    }

    function renderAllChartsAfter(instance) {
        var drawn = false;

        var onDrawn = function () {

            if (drawn) return;

            instance.off('drawn', onDrawn);
            drawn = true;

            renderAllCharts();
        };

        instance.on('drawn', onDrawn);
    }

    function renderAllCharts() {
        setTimeout(function () {
            _(model.chartOptionsCollection()).each(function(option) {
                option.instance.render({
                    force: true,
                    animate: false,
                    asyncSeriesRendering: true
                });
            });
        }, 200);
    }
});