
$(document).ready(hydrateChart);

function hydrateChart() {

    kendo.culture("en-AU");

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

            renderChart(days);
        },
        error: (function (jqXhr, textStatus, errorThrown) {
        })
    });
}

function renderChart(data) {

    $("#k-container").kendoStockChart({
        theme: "Material",
        dataSource: {
            data: data
        },
        title: {
            text: "NAB"
        },
        dateField: "date",
        series: [
            {
                type: "candlestick",
                openField: "open",
                highField: "high",
                lowField: "low",
                closeField: "close"
            },
            {
                type: "column",
                field: "volume",
                axis: "volumeAxis",
                tooltip: {
                    format: "{0:C0}"
                }
            }
        ],
        panes: [{
            title: "Value"
        },
        {
            name: "volumePane",
            title: "Volume",
            height: 80 // pixels
        }],
        valueAxes: [{
            // Default axis
            line: {
                visible: false
            }
        },
        {
            name: "volumeAxis",
            pane: "volumePane",
            visible: false
        }],
        navigator: {
            series: {
                type: "area",
                field: "close"
            }
        }
    });
}