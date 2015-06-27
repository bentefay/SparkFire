define(function(require) {

    return {
        get: function (dataSource) {
            return {
                dataSource: dataSource,
                chart: {
                    useAggregation: false,
                    valueAxis: { valueType: 'numeric' },
                    series: {
                        type: 'line',
                        valueField: 'value',
                        argumentField: 'dateTime'
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
    };

});