define(function(require) {
    return {
        get: function(dataSource, selectedInstrumentCode) {
            return {
                dataSource: dataSource,
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
                onSelectionChanged: function(options) {
                    var data = options.selectedRowsData[0];
                    selectedInstrumentCode(data.instrumentCode);
                }
            }

        }
    };
});