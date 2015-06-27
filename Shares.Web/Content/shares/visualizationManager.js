define(function() {

    var XAxisSyncer = require('xAxisSyncer');

    var constructor = function() {
        var that = this;

        that.VisualizationModels = ko.observableArray();

        _updateVisualizationHeights();

        showLoading();

        that._xAxisSyncer = new XAxisSyncer();

    };

    constructor.prototype._updateVisualizationHeights = function () {
        var that = this;
        var visualizationModels = that.VisualizationModels();
        var summedRatios = _(visualizationModels).map(function (o) { return o.heightRatio; }).reduce(function (acc, i) { return acc + i; }, 0);
        var percentagePerRatio = 100 / summedRatios;
        for (var i = 0; i < visualizationModels.length; i++) {
            var percentage = percentagePerRatio * visualizationModels[i].heightRatio;
            visualizationModels[i].height(percentage + "%");
        }
    }

    constructor.prototype.add = function (chartModels) {
        var that = this;
        for (var i = 0; i < chartModels.length; i++) {
            that.VisualizationModels.push(chartModels[i]);
        }
        that._updateVisualizationHeights();
    }

    constructor.prototype.showLoading = function() {
        var that = this;
        
        var c = that.VisualizationModels();
        for (var i = 0; i < c.length; i++) {
            c[i].instance.showLoadingIndicator();
        }
    }
});