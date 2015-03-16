define(function(require) {
    return {
        get: function(dataSource) {
            return {
                dataSource: dataSource,
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
                onSelectionChanged: function(selecteditems) {
                    var data = selecteditems.selectedRowsData[0];
                },
                onRowUpdated: function(args) {
                }
            }
        }
    };
});