if (typeof _shares == 'undefined') {
    _shares = {};
}

_shares.XAxisSyncer = (function () {

    var constructor = function () {
        var self = this;

        self._instanceDescriptors = [];
        self._leader = null;
        self._timerId = null;
    };

    constructor.prototype.add = function (instances) {
        var self = this;

        for (var i = 0; i < instances.length; i++) {

            var instance = instances[i];
            var instanceDescriptor = { instance: instance }

            if (instance.zoomArgument) {
                // dxChart
                instance.on('drawn', function (args) {
                    var ranges = args.component.businessRanges[0].arg;
                    if (ranges.minVisible && ranges.maxVisible) {
                        self._updateZoom({ startValue: ranges.minVisible, endValue: ranges.maxVisible }, args.component);
                    }
                });

                instanceDescriptor.setBounds = function (newBounds) {
                    bounds = this.instance.businessRanges[0].arg;
                    if (!boundsEqual(newBounds, bounds.minVisible, bounds.maxVisible))
                        this.instance.zoomArgument(new Date(newBounds.startValue), new Date(newBounds.endValue));
                };

                instanceDescriptor.remove = function () {
                    this.instance.off('drawn');
                }
            } else if (instance.setSelectedRange) {
                // dxRangeSelector
                instance.on('selectedRangeChanged', function (args) {
                    self._updateZoom(args, args.component);
                });

                instanceDescriptor.setBounds = function (newBounds) {
                    bounds = this.instance.getSelectedRange();
                    if (!boundsEqual(newBounds, bounds.startValue, bounds.endValue))
                        this.instance.setSelectedRange(newBounds);
                }

                instanceDescriptor.remove = function () {
                    this.instance.off('selectedRangeChanged');
                }
            } else {
                throw new Error("Unknown instance type");
            }

            self._instanceDescriptors.push(instanceDescriptor);

        }
    };

    constructor.prototype.remove = function (instances) {
        var self = this;

        var instanceDescriptorsToRemove = _(self._instanceDescriptors)
            .where(function (instanceDescriptor) { _(instances).contains(instanceDescriptor.instance) });

        for (var i = 0; i < instanceDescriptorsToRemove.length; i++) {
            instanceDescriptor.remove();
        }

        self._instanceDescriptors = _(self._instanceDescriptors).difference(instanceDescriptorsToRemove);
    }

    constructor.prototype._updateZoom = function(newBounds, instance) {
        var self = this;

        if (self._leader === null) {
            self._leader = instance;
        } else if (instance !== self._leader) {
            return;
        }

        if (self._timerId !== null)
            clearTimeout(self._timerId);

        self._timerId = setTimeout(function () {
            self._leader = null;
            self._timerId = null;
        }, 500);

        for (var i = 0; i < self._instanceDescriptors.length; i++) {

            var instanceDescriptor = self._instanceDescriptors[i];

            if (instanceDescriptor.instance === instance)
                continue;

            instanceDescriptor.setBounds(newBounds);
        }
    }

    function boundsEqual(bounds, startValue, endValue) {

        if (!startValue || !endValue || !bounds.startValue || !bounds.endValue)
            return false;

        return startValue.getTime() === bounds.startValue.getTime() && endValue.getTime() === bounds.endValue.getTime();
    }

    return constructor;
})();