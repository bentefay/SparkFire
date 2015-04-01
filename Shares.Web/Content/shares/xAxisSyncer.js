define(function() {

    var constructor = function() {
        var self = this;

        self._instanceDescriptors = [];
        self._leader = null;
        self._timerId = null;
        self._currentBounds = null;
    };

    constructor.prototype.add = function(instances) {
        var self = this;

        for (var i = 0; i < instances.length; i++) {

            var instance = instances[i];
            var instanceDescriptor = { instance: instance }

            if (instance.zoomArgument) {
                // dxChart
                instance.on('drawn', function(args) {
                    var ranges = args.component.businessRanges[0].arg;
                    if (ranges.minVisible && ranges.maxVisible)
                        self._setAllBounds({ startValue: ranges.minVisible, endValue: ranges.maxVisible }, args.component);
                });

                instanceDescriptor.setBounds = function(newBounds) {
                    bounds = this.instance.businessRanges[0].arg;
                    if (!boundsEqual(newBounds, bounds.minVisible, bounds.maxVisible))
                        this.instance.zoomArgument(new Date(newBounds.startValue), new Date(newBounds.endValue));
                };

                instanceDescriptor.remove = function() {
                    this.instance.off('drawn');
                }

            } else if (instance.setSelectedRange) {
                // dxRangeSelector
                instance.on('selectedRangeChanged', function(args) {
                    self._setAllBounds(args, args.component);
                });

                instanceDescriptor.setBounds = function(newBounds) {
                    bounds = this.instance.getSelectedRange();
                    if (!boundsEqual(newBounds, bounds.startValue, bounds.endValue))
                        this.instance.setSelectedRange(newBounds);
                }

                instanceDescriptor.remove = function() {
                    this.instance.off('selectedRangeChanged');
                }
            } else {
                throw new Error("Unknown instance type");
            }

            if (self._currentBounds)
                instanceDescriptor.setBounds(self._currentBounds);

            self._instanceDescriptors.push(instanceDescriptor);

        }
    };

    constructor.prototype.remove = function(instances) {
        var self = this;

        var instanceDescriptorsToRemove = _(self._instanceDescriptors)
            .filter(function(instanceDescriptor) {
                return _(instances).contains(instanceDescriptor.instance)
            });

        for (var i = 0; i < instanceDescriptorsToRemove.length; i++) {
            instanceDescriptorsToRemove[i].remove();
        }

        self._instanceDescriptors = _(self._instanceDescriptors).difference(instanceDescriptorsToRemove);
    }

    constructor.prototype._setAllBounds = function (newBounds, leader) {
        var self = this;

        if (self._leader === null) {
            self._leader = leader;
        } else if (leader !== self._leader) {
            return;
        }

        if (self._timerId !== null)
            clearTimeout(self._timerId);

        if (leader) {
            self._timerId = setTimeout(function() {
                self._leader = null;
                self._timerId = null;
            }, 500);
        }

        self._currentBounds = newBounds;

        for (var i = 0; i < self._instanceDescriptors.length; i++) {

            var instanceDescriptor = self._instanceDescriptors[i];

            if (instanceDescriptor.instance === leader)
                continue;

            instanceDescriptor.setBounds(newBounds);
        }
    }

    constructor.prototype.setAllBounds = function (startValue, endValue) {
        var self = this;

        self._setAllBounds({ startValue: startValue, endValue: endValue }, null);
    }

    function boundsEqual(bounds, startValue, endValue) {

        if (!startValue || !endValue || !bounds.startValue || !bounds.endValue)
            return false;

        return startValue.getTime() === bounds.startValue.getTime() && endValue.getTime() === bounds.endValue.getTime();
    }

    return constructor;

});