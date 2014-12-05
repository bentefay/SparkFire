/*! 
* DevExtreme (Mobile Widgets)
* Version: 14.1.8
* Build date: Oct 30, 2014
*
* Copyright (c) 2012 - 2014 Developer Express Inc. ALL RIGHTS RESERVED
* EULA: https://www.devexpress.com/Support/EULAs/DevExtreme.xml
*/

"use strict";
if (!DevExpress.MOD_WIDGETS_MOBILE) {
    if (!DevExpress.MOD_WIDGETS_BASE)
        throw Error('Required module is not referenced: widgets-base');
    /*! Module widgets-mobile, file ui.switch.js */
    (function($, DX, undefined) {
        var ui = DX.ui,
            events = ui.events,
            fx = DX.fx;
        var SWITCH_CLASS = "dx-switch",
            SWITCH_WRAPPER_CLASS = SWITCH_CLASS + "-wrapper",
            SWITCH_CONTAINER_CLASS = SWITCH_CLASS + "-container",
            SWITCH_INNER_CLASS = SWITCH_CLASS + "-inner",
            SWITCH_HANDLE_CLASS = SWITCH_CLASS + "-handle",
            SWITCH_ON_VALUE_CLASS = SWITCH_CLASS + "-on-value",
            SWITCH_ON_CLASS = SWITCH_CLASS + "-on",
            SWITCH_OFF_CLASS = SWITCH_CLASS + "-off",
            SWITCH_ANIMATION_DURATION = 100;
        DX.registerComponent("dxSwitch", ui.dxEditor.inherit({
            _setDefaultOptions: function() {
                this.callBase();
                this.option({
                    hoverStateEnabled: true,
                    onText: Globalize.localize("dxSwitch-onText"),
                    offText: Globalize.localize("dxSwitch-offText"),
                    value: false
                })
            },
            _init: function() {
                this.callBase();
                this._animating = false;
                this._animationDuration = SWITCH_ANIMATION_DURATION
            },
            _recreateValueChangeAction: function() {
                this._valueChangeAction = this._createActionByOption("valueChangeAction", {excludeValidators: ["gesture"]})
            },
            _render: function() {
                var element = this._element();
                this._$switchInner = $("<div>").addClass(SWITCH_INNER_CLASS);
                this._$handle = $("<div>").addClass(SWITCH_HANDLE_CLASS).appendTo(this._$switchInner);
                this._$labelOn = $("<div>").addClass(SWITCH_ON_CLASS).prependTo(this._$switchInner);
                this._$labelOff = $("<div>").addClass(SWITCH_OFF_CLASS).appendTo(this._$switchInner);
                this._$switchContainer = $("<div>").addClass(SWITCH_CONTAINER_CLASS).append(this._$switchInner);
                this._$switchWrapper = $("<div>").addClass(SWITCH_WRAPPER_CLASS).append(this._$switchContainer);
                element.addClass(SWITCH_CLASS).append(this._$switchWrapper);
                element.dxSwipeable({
                    elastic: false,
                    startAction: $.proxy(this._handleSwipeStart, this),
                    updateAction: $.proxy(this._handleSwipeUpdate, this),
                    endAction: $.proxy(this._handleSwipeEnd, this)
                });
                this._renderLabels();
                this.callBase();
                this._updateMarginBound();
                this._renderValue();
                this._renderClick()
            },
            _updateMarginBound: function() {
                this._marginBound = this._$switchContainer.outerWidth(true) - this._$handle.outerWidth()
            },
            _marginDirection: function() {
                return this.option("rtlEnabled") ? "Right" : "Left"
            },
            _offsetDirection: function() {
                return this.option("rtlEnabled") ? -1 : 1
            },
            _renderPosition: function(state, swipeOffset) {
                var stateInt = state ? 1 : 0,
                    marginDirection = this._marginDirection(),
                    resetMarginDirection = marginDirection === "Left" ? "Right" : "Left";
                this._$switchInner.css("margin" + marginDirection, this._marginBound * (stateInt + swipeOffset - 1));
                this._$switchInner.css("margin" + resetMarginDirection, 0)
            },
            _validateValue: function() {
                var check = this.option("value");
                if (typeof check !== "boolean")
                    this._options["value"] = !!check
            },
            _renderClick: function() {
                var eventName = events.addNamespace("dxclick", this.NAME),
                    clickAction = this._createAction($.proxy(this._handleClick, this));
                this._element().off(eventName).on(eventName, function(e) {
                    clickAction({jQueryEvent: e})
                })
            },
            _handleClick: function(args) {
                var e = args.jQueryEvent;
                this._valueChangeEventInstance = e;
                if (this._animating || this._swiping)
                    return;
                this._animating = true;
                var that = this,
                    startValue = this.option("value"),
                    endValue = !startValue,
                    marginDirection = this._marginDirection(),
                    resetMarginDirection = marginDirection === "Left" ? "Right" : "Left",
                    fromConfig = {},
                    toConfig = {};
                this._$switchInner.css("margin" + resetMarginDirection, 0);
                fromConfig["margin" + marginDirection] = (Number(startValue) - 1) * this._marginBound;
                toConfig["margin" + marginDirection] = (Number(endValue) - 1) * this._marginBound;
                fx.animate(this._$switchInner, {
                    from: fromConfig,
                    to: toConfig,
                    duration: this._animationDuration,
                    complete: function() {
                        that._animating = false;
                        that.option("value", endValue)
                    }
                })
            },
            _handleSwipeStart: function(e) {
                var state = this.option("value"),
                    rtlEnabled = this.option("rtlEnabled"),
                    maxOffOffset = rtlEnabled ? 0 : 1,
                    maxOnOffset = rtlEnabled ? 1 : 0;
                e.jQueryEvent.maxLeftOffset = state ? maxOffOffset : maxOnOffset;
                e.jQueryEvent.maxRightOffset = state ? maxOnOffset : maxOffOffset;
                this._swiping = true;
                this._feedbackShow(this._element())
            },
            _handleSwipeUpdate: function(e) {
                this._renderPosition(this.option("value"), this._offsetDirection() * e.jQueryEvent.offset)
            },
            _handleSwipeEnd: function(e) {
                var that = this,
                    offsetDirection = this._offsetDirection(),
                    toConfig = {};
                toConfig["margin" + this._marginDirection()] = this._marginBound * (that.option("value") + offsetDirection * e.jQueryEvent.targetOffset - 1);
                fx.animate(this._$switchInner, {
                    to: toConfig,
                    duration: that._animationDuration,
                    complete: function() {
                        that._swiping = false;
                        var pos = that.option("value") + offsetDirection * e.jQueryEvent.targetOffset;
                        that.option("value", Boolean(pos));
                        that._feedbackOff()
                    }
                })
            },
            _renderValue: function() {
                this._validateValue();
                var val = this.option("value");
                this._renderPosition(val, 0);
                this._element().toggleClass(SWITCH_ON_VALUE_CLASS, val)
            },
            _renderLabels: function() {
                this._$labelOn.text(this.option("onText"));
                this._$labelOff.text(this.option("offText"))
            },
            _visibilityChanged: function(visible) {
                if (visible)
                    this.repaint()
            },
            _feedbackOff: function() {
                if (this._swiping) {
                    this._clearTimers();
                    return
                }
                this.callBase.apply(this, arguments)
            },
            _optionChanged: function(name, value, prevValue) {
                switch (name) {
                    case"visible":
                    case"width":
                        this._refresh();
                        break;
                    case"onText":
                    case"offText":
                        this._renderLabels();
                        break;
                    case"value":
                        this._renderValue();
                        this.callBase(name, value, prevValue);
                        break;
                    default:
                        this.callBase(name, value, prevValue)
                }
            }
        }))
    })(jQuery, DevExpress);
    /*! Module widgets-mobile, file ui.pivotTabs.js */
    (function($, DX, undefined) {
        var ui = DX.ui,
            fx = DX.fx,
            utils = DX.utils,
            translator = DX.translator,
            events = ui.events;
        var PIVOT_TABS_CLASS = "dx-pivottabs",
            PIVOT_TAB_CLASS = "dx-pivottabs-tab",
            PIVOT_TAB_SELECTED_CLASS = "dx-pivottabs-tab-selected",
            PIVOT_GHOST_TAB_CLASS = "dx-pivottabs-ghosttab",
            PIVOT_TAB_DATA_KEY = "dxPivotTabData",
            PIVOT_TAB_MOVE_DURATION = 200,
            PIVOT_TAB_MOVE_EASING = "cubic-bezier(.40, .80, .60, 1)";
        var animation = {
                moveTo: function($tab, position, completeAction) {
                    return fx.animate($tab, {
                            type: "slide",
                            to: {left: position},
                            duration: PIVOT_TAB_MOVE_DURATION,
                            easing: PIVOT_TAB_MOVE_EASING,
                            complete: completeAction
                        })
                },
                slideAppear: function($tab, position) {
                    return fx.animate($tab, {
                            type: "slide",
                            to: {
                                left: position,
                                opacity: 1
                            },
                            duration: PIVOT_TAB_MOVE_DURATION,
                            easing: PIVOT_TAB_MOVE_EASING
                        })
                },
                slideDisappear: function($tab, position) {
                    return fx.animate($tab, {
                            type: "slide",
                            to: {
                                left: position,
                                opacity: 0
                            },
                            duration: PIVOT_TAB_MOVE_DURATION,
                            easing: PIVOT_TAB_MOVE_EASING
                        })
                },
                complete: function(elements) {
                    if (!elements)
                        return;
                    $.each(elements, function(_, $element) {
                        fx.stop($element, true)
                    })
                },
                stop: function(elements) {
                    if (!elements)
                        return;
                    $.each(elements, function(_, $element) {
                        fx.stop($element)
                    })
                }
            };
        DX.registerComponent("dxPivotTabs", ui.CollectionContainerWidget.inherit({
            _setDefaultOptions: function() {
                this.callBase();
                this.option({
                    selectedIndex: 0,
                    prepareAction: null,
                    updatePositionAction: null,
                    rollbackAction: null
                })
            },
            _itemClass: function() {
                return PIVOT_TAB_CLASS
            },
            _itemDataKey: function() {
                return PIVOT_TAB_DATA_KEY
            },
            _itemContainer: function() {
                return this._element()
            },
            _elementWidth: function() {
                if (!this._elementWidthCache)
                    this._elementWidthCache = this._element().width();
                return this._elementWidthCache
            },
            _clearElementWidthCache: function() {
                delete this._elementWidthCache
            },
            _itemWidths: function() {
                if (!this._itemWidthsCache) {
                    var $tabs = this._itemElements(),
                        widths = [];
                    $tabs.each(function() {
                        widths.push($(this).outerWidth())
                    });
                    this._itemWidthsCache = widths
                }
                return this._itemWidthsCache
            },
            _init: function() {
                this.callBase();
                this._initGhostTab();
                this._initSwipeHandlers();
                this._initActions()
            },
            _dimensionChanged: function() {
                this._clearElementWidthCache();
                this._cleanPositionCache();
                this._updateTabsPositions()
            },
            _initGhostTab: function() {
                this._$ghostTab = $("<div>").addClass(PIVOT_GHOST_TAB_CLASS)
            },
            _initActions: function() {
                var excludeValidators = {excludeValidators: ["gesture"]};
                this._updatePositionAction = this._createActionByOption("updatePositionAction", excludeValidators);
                this._rollbackAction = this._createActionByOption("rollbackAction", excludeValidators);
                this._prepareAction = this._createActionByOption("prepareAction", excludeValidators)
            },
            _render: function() {
                this._element().addClass(PIVOT_TABS_CLASS);
                this.callBase();
                this._renderGhostTab()
            },
            _renderGhostTab: function() {
                this._itemContainer().append(this._$ghostTab);
                this._toggleGhostTab(false)
            },
            _toggleGhostTab: function(visible) {
                var $ghostTab = this._$ghostTab;
                if (visible) {
                    this._updateGhostTabContent();
                    $ghostTab.css("opacity", 1)
                }
                else
                    $ghostTab.css("opacity", 0)
            },
            _isGhostTabVisible: function() {
                return this._$ghostTab.css("opacity") == 1
            },
            _updateGhostTabContent: function(prevIndex) {
                prevIndex = prevIndex === undefined ? this._previousIndex() : prevIndex;
                var $ghostTab = this._$ghostTab,
                    $items = this._itemElements();
                $ghostTab.html($items.eq(prevIndex).html())
            },
            _updateTabsPositions: function(offset) {
                var $tabs = this._allTabElements(),
                    offset = this._applyOffsetBoundaries(offset),
                    isPrevSwipeHandled = this.option("rtlEnabled") ^ offset > 0 && offset !== 0,
                    tabPositions = this._calculateTabPositions(isPrevSwipeHandled ? "replace" : "append");
                this._moveTabs(tabPositions, offset);
                this._toggleGhostTab(isPrevSwipeHandled)
            },
            _moveTabs: function(positions, offset) {
                offset = offset || 0;
                var $tabs = this._allTabElements();
                $tabs.each(function(index) {
                    translator.move($(this), {left: positions[index] + offset})
                })
            },
            _applyOffsetBoundaries: function(offset) {
                offset = offset || 0;
                var maxOffset = offset > 0 ? this._maxRightOffset : this._maxLeftOffset;
                return offset * maxOffset
            },
            _animateRollback: function() {
                var that = this,
                    $tabs = this._itemElements(),
                    positions = this._calculateTabPositions("prepend");
                if (this._isGhostTabVisible()) {
                    this._swapGhostWithTab($tabs.eq(this._previousIndex()));
                    animation.moveTo(this._$ghostTab, positions[this._indexBoundary()], function() {
                        that._toggleGhostTab(false)
                    })
                }
                $tabs.each(function(index) {
                    animation.moveTo($(this), positions[index])
                })
            },
            _animateComplete: function(newIndex, currentIndex) {
                var that = this,
                    $tabs = this._itemElements(),
                    isPrevSwipeHandled = this._isGhostTabVisible();
                $tabs.eq(currentIndex).removeClass(PIVOT_TAB_SELECTED_CLASS);
                var animations = isPrevSwipeHandled ? this._animateIndexDecreasing(newIndex) : this._animateIndexIncreasing(newIndex);
                $tabs.eq(newIndex).addClass(PIVOT_TAB_SELECTED_CLASS)
            },
            _animateIndexDecreasing: function(newIndex) {
                var $tabs = this._itemElements(),
                    positions = this._calculateTabPositions("append", newIndex),
                    animations = [];
                $tabs.each(function(index) {
                    animations.push(animation.moveTo($(this), positions[index]))
                });
                animations.push(animation.slideDisappear(this._$ghostTab, positions[this._indexBoundary()]));
                return $.when.apply($, animations)
            },
            _animateIndexIncreasing: function(newIndex) {
                var that = this,
                    $tabs = this._itemElements(),
                    positions = this._calculateTabPositions("prepend", newIndex),
                    previousIndex = this._previousIndex(newIndex),
                    $prevTab = $tabs.eq(previousIndex),
                    prevTabPosition = translator.locate($prevTab).left,
                    rtl = this.option("rtlEnabled"),
                    bound = rtl ? this._elementWidth() - this._itemWidths()[previousIndex] : 0,
                    isNextSwipeHandled = (prevTabPosition - bound) * this._getRTLSignCorrection() < 0,
                    animations = [];
                if (!isNextSwipeHandled)
                    this._moveTabs(this._calculateTabPositions("append", previousIndex));
                this._updateGhostTabContent(previousIndex);
                this._swapGhostWithTab($tabs.eq(previousIndex));
                $tabs.each(function(index) {
                    var $tab = $(this),
                        newPosition = positions[index];
                    animations.push(index === previousIndex ? animation.slideAppear($tab, newPosition) : animation.moveTo($tab, newPosition))
                });
                animations.push(animation.moveTo(this._$ghostTab, positions[this._indexBoundary()], function() {
                    that._toggleGhostTab(false)
                }));
                return $.when.apply($, animations)
            },
            _swapGhostWithTab: function($tab) {
                var $ghostTab = this._$ghostTab,
                    lastTabPosition = translator.locate($tab).left,
                    lastTabOpacity = $tab.css("opacity");
                translator.move($tab, {left: translator.locate($ghostTab).left});
                $tab.css("opacity", $ghostTab.css("opacity"));
                translator.move($ghostTab, {left: lastTabPosition});
                $ghostTab.css("opacity", lastTabOpacity)
            },
            _calculateTabPositions: function(ghostPosition, index) {
                index = index === undefined ? this.option("selectedIndex") : index;
                var mark = index + ghostPosition;
                if (this._calculetedPositionsMark !== mark) {
                    this._calculetedPositions = this._calculateTabPositionsImpl(index, ghostPosition);
                    this._calculetedPositionsMark = mark
                }
                return this._calculetedPositions
            },
            _calculateTabPositionsImpl: function(currentIndex, ghostPosition) {
                var prevIndex = this._normalizeIndex(currentIndex - 1),
                    $tabs = this._itemElements(),
                    widths = this._itemWidths();
                var rtl = this.option("rtlEnabled"),
                    signCorrection = this._getRTLSignCorrection(),
                    tabsContainerWidth = this._elementWidth(),
                    nextPosition = rtl ? tabsContainerWidth : 0,
                    positions = [];
                var calculateTabPosition = function(currentIndex, width) {
                        var rtlOffset = rtl * width;
                        positions.splice(currentIndex, 0, nextPosition - rtlOffset);
                        nextPosition += width * signCorrection
                    };
                $.each(widths.slice(currentIndex), calculateTabPosition);
                $.each(widths.slice(0, currentIndex), calculateTabPosition);
                switch (ghostPosition) {
                    case"replace":
                        var lastTabPosition = positions[prevIndex];
                        positions.splice(prevIndex, 1, rtl ? tabsContainerWidth : -widths[prevIndex]);
                        positions.push(lastTabPosition);
                        break;
                    case"prepend":
                        positions.push(rtl ? tabsContainerWidth : -widths[prevIndex]);
                        break;
                    case"append":
                        positions.push(nextPosition - widths[currentIndex] * rtl);
                        break
                }
                return positions
            },
            _allTabElements: function() {
                return this._itemContainer().find("." + PIVOT_TAB_CLASS + ", ." + PIVOT_GHOST_TAB_CLASS)
            },
            _initSwipeHandlers: function() {
                this._element().on(events.addNamespace("dxswipestart", this.NAME), {itemSizeFunc: $.proxy(this._elementWidth, this)}, $.proxy(this._swipeStartHandler, this)).on(events.addNamespace("dxswipe", this.NAME), $.proxy(this._swipeUpdateHandler, this)).on(events.addNamespace("dxswipeend", this.NAME), $.proxy(this._swipeEndHandler, this))
            },
            _swipeStartHandler: function(e) {
                this._prepareAnimation();
                this._prepareAction();
                e.maxLeftOffset = 1;
                e.maxRightOffset = 1;
                if (DX.designMode || this.option("disabled") || this._indexBoundary() <= 1)
                    e.cancel = true;
                else
                    this._swipeGestureRunning = true
            },
            _prepareAnimation: function() {
                this._stopAnimation()
            },
            _stopAnimation: function() {
                animation.complete(this._allTabElements())
            },
            _swipeUpdateHandler: function(e) {
                var offset = e.offset;
                this._updateTabsPositions(offset);
                this._updatePositionAction({offset: offset})
            },
            _swipeEndHandler: function(e) {
                var targetOffset = e.targetOffset * this._getRTLSignCorrection();
                if (targetOffset === 0) {
                    this._animateRollback();
                    this._rollbackAction()
                }
                else {
                    var newIndex = this._normalizeIndex(this.option("selectedIndex") - targetOffset);
                    this.option("selectedIndex", newIndex)
                }
                this._swipeGestureRunning = false
            },
            _previousIndex: function(atIndex) {
                atIndex = atIndex === undefined ? this.option("selectedIndex") : atIndex;
                return this._normalizeIndex(atIndex - 1)
            },
            _normalizeIndex: function(index) {
                var boundary = this._indexBoundary();
                if (index < 0)
                    index = boundary + index;
                if (index >= boundary)
                    index = index - boundary;
                return index
            },
            _indexBoundary: function() {
                return this.option("items").length
            },
            _renderSelectedIndex: function(current) {
                this._calculateMaxOffsets(current);
                this._updateTabsPositions();
                this._itemElements().eq(current).addClass(PIVOT_TAB_SELECTED_CLASS)
            },
            _updateSelectedIndex: function(current) {
                this._calculateMaxOffsets(current)
            },
            _calculateMaxOffsets: function(index) {
                var $tabs = this._itemElements(),
                    currentTabWidth = this._itemWidths()[index],
                    prevTabWidth = this._itemWidths()[this._previousIndex(index)],
                    rtl = this.option("rtlEnabled");
                this._maxLeftOffset = rtl ? prevTabWidth : currentTabWidth;
                this._maxRightOffset = rtl ? currentTabWidth : prevTabWidth
            },
            _itemRenderDefault: function(item, index, $itemElement) {
                var $itemText = $("<span>").text(item.title);
                $itemElement.html($itemText)
            },
            _getRTLSignCorrection: function() {
                return this.option("rtlEnabled") ? -1 : 1
            },
            _visibilityChanged: function(visible) {
                if (visible)
                    this._dimensionChanged()
            },
            _clean: function() {
                animation.stop(this._allTabElements());
                this._clearElementWidthCache();
                this._cleanPositionCache();
                this.callBase()
            },
            _cleanPositionCache: function() {
                delete this._itemWidthsCache;
                delete this._calculetedPositionsMark
            },
            _optionChanged: function(name, value, prevValue) {
                switch (name) {
                    case"selectedIndex":
                        if (!this._swipeGestureRunning)
                            this._prepareAnimation();
                        if (this._itemElements().length)
                            this._animateComplete(value, prevValue);
                        this.callBase.apply(this, arguments);
                        break;
                    case"items":
                    case"rtlEnabled":
                        this._cleanPositionCache();
                        this.callBase.apply(this, arguments);
                        break;
                    case"prepareAction":
                    case"updatePositionAction":
                    case"rollbackAction":
                        this._initActions();
                        break;
                    default:
                        this.callBase.apply(this, arguments)
                }
            },
            prepare: function() {
                this._prepareAnimation()
            },
            updatePosition: function(offset) {
                this._updateTabsPositions(offset)
            },
            rollback: function() {
                this._animateRollback()
            }
        }));
        ui.dxPivotTabs.__internals = {animation: animation}
    })(jQuery, DevExpress);
    /*! Module widgets-mobile, file ui.pivot.js */
    (function($, DX, undefined) {
        var ui = DX.ui,
            events = ui.events,
            fx = DX.fx,
            translator = DX.translator;
        var PIVOT_CLASS = "dx-pivot",
            PIVOT_WRAPPER_CLASS = "dx-pivot-wrapper",
            PIVOT_TABS_CONTAINER_CLASS = "dx-pivottabs-container",
            PIVOT_ITEM_CONTAINER_CLASS = "dx-pivot-itemcontainer",
            PIVOT_ITEM_WRAPPER_CLASS = "dx-pivot-itemwrapper",
            PIVOT_ITEM_CLASS = "dx-pivot-item",
            PIVOT_ITEM_HIDDEN_CLASS = "dx-pivot-item-hidden",
            PIVOT_ITEM_DATA_KEY = "dxPivotItemData",
            PIVOT_RETURN_BACK_DURATION = 200,
            PIVOT_SLIDE_AWAY_DURATION = 50,
            PIVOT_SLIDE_BACK_DURATION = 250,
            PIVOT_SLIDE_BACK_EASING = "cubic-bezier(.10, 1, 0, 1)";
        var animation = {
                returnBack: function($element) {
                    fx.animate($element, {
                        type: "slide",
                        to: {left: 0},
                        duration: PIVOT_RETURN_BACK_DURATION
                    })
                },
                slideAway: function($element, position, completeAction) {
                    fx.animate($element, {
                        type: "slide",
                        to: {left: position},
                        duration: PIVOT_SLIDE_AWAY_DURATION,
                        complete: completeAction
                    })
                },
                slideBack: function($element) {
                    fx.animate($element, {
                        type: "slide",
                        to: {left: 0},
                        easing: PIVOT_SLIDE_BACK_EASING,
                        duration: PIVOT_SLIDE_BACK_DURATION
                    })
                },
                complete: function($element) {
                    fx.stop($element, true)
                },
                stop: function($element) {
                    fx.stop($element)
                }
            };
        DX.registerComponent("dxPivot", ui.CollectionContainerWidget.inherit({
            _setDefaultOptions: function() {
                this.callBase();
                this.option({selectedIndex: 0})
            },
            _itemClass: function() {
                return PIVOT_ITEM_CLASS
            },
            _itemDataKey: function() {
                return PIVOT_ITEM_DATA_KEY
            },
            _itemContainer: function() {
                return this._$itemWrapper
            },
            _elementWidth: function() {
                if (!this._elementWidthCache)
                    this._elementWidthCache = this._element().width();
                return this._elementWidthCache
            },
            _clearElementWidthCache: function() {
                delete this._elementWidthCache
            },
            _init: function() {
                this.callBase();
                this._initWrapper();
                this._initTabs();
                this._initItemContainer();
                this._clearItemsCache();
                this._initSwipeHandlers()
            },
            _dimensionChanged: function() {
                this._clearElementWidthCache()
            },
            _initWrapper: function() {
                this._$wrapper = $("<div>").addClass(PIVOT_WRAPPER_CLASS).appendTo(this._element())
            },
            _initItemContainer: function() {
                var $itemContainer = $("<div>").addClass(PIVOT_ITEM_CONTAINER_CLASS);
                this._$wrapper.append($itemContainer);
                this._$itemWrapper = $("<div>").addClass(PIVOT_ITEM_WRAPPER_CLASS);
                $itemContainer.append(this._$itemWrapper)
            },
            _clearItemsCache: function() {
                this._itemsCache = []
            },
            _initTabs: function() {
                var that = this,
                    $tabsContainer = $("<div>").addClass(PIVOT_TABS_CONTAINER_CLASS);
                this._$wrapper.append($tabsContainer);
                $tabsContainer.dxPivotTabs({
                    items: this.option("items"),
                    selectedIndex: this.option("selectedIndex"),
                    prepareAction: function() {
                        that._prepareAnimation()
                    },
                    updatePositionAction: function(args) {
                        that._updateContentPosition(args.offset)
                    },
                    rollbackAction: function() {
                        that._animateRollback()
                    },
                    itemSelectAction: function(args) {
                        that.option("selectedIndex", args.selectedIndex)
                    }
                });
                this._tabs = $tabsContainer.dxPivotTabs("instance")
            },
            _render: function() {
                this._element().addClass(PIVOT_CLASS);
                this.callBase()
            },
            _renderCurrentContent: function(currentIndex, previousIndex) {
                var itemsCache = this._itemsCache;
                itemsCache[previousIndex] = this._selectedItemElement();
                itemsCache[previousIndex].addClass(PIVOT_ITEM_HIDDEN_CLASS);
                if (itemsCache[currentIndex])
                    itemsCache[currentIndex].removeClass(PIVOT_ITEM_HIDDEN_CLASS);
                else
                    this._renderContent();
                this._fireSelectItemEvent(currentIndex, previousIndex)
            },
            _updateContentPosition: function(offset) {
                translator.move(this._$itemWrapper, {left: this._calculatePixelOffset(offset)})
            },
            _animateRollback: function() {
                animation.returnBack(this._$itemWrapper)
            },
            _animateComplete: function(newIndex, currentIndex) {
                var $itemWrapper = this._$itemWrapper,
                    rtlSignCorrection = this._getRTLSignCorrection(),
                    intermediatePosition = this._elementWidth() * (this._isPrevSwipeHandled() ? 1 : -1) * rtlSignCorrection;
                animation.slideAway($itemWrapper, intermediatePosition, $.proxy(function() {
                    translator.move($itemWrapper, {left: -intermediatePosition});
                    this._renderCurrentContent(newIndex, currentIndex)
                }, this));
                animation.slideBack($itemWrapper)
            },
            _calculatePixelOffset: function(offset) {
                offset = offset || 0;
                return offset * this._elementWidth()
            },
            _isPrevSwipeHandled: function() {
                var wrapperOffset = translator.locate(this._$itemWrapper).left,
                    rtl = this.option("rtlEnabled");
                return rtl ^ wrapperOffset > 0 && wrapperOffset !== 0
            },
            _initSwipeHandlers: function() {
                this._element().on(events.addNamespace("dxswipestart", this.NAME), {itemSizeFunc: $.proxy(this._elementWidth, this)}, $.proxy(this._swipeStartHandler, this)).on(events.addNamespace("dxswipe", this.NAME), $.proxy(this._swipeUpdateHandler, this)).on(events.addNamespace("dxswipeend", this.NAME), $.proxy(this._swipeEndHandler, this))
            },
            _swipeStartHandler: function(e) {
                this._prepareAnimation();
                this._tabs.prepare();
                if (DX.designMode || this.option("disabled") || this._indexBoundary() <= 1)
                    e.cancel = true;
                else
                    this._swipeGestureRunning = true;
                e.maxLeftOffset = 1;
                e.maxRightOffset = 1
            },
            _prepareAnimation: function() {
                this._stopAnimation()
            },
            _stopAnimation: function() {
                animation.complete(this._$itemWrapper)
            },
            _swipeUpdateHandler: function(e) {
                var offset = e.offset;
                this._updateContentPosition(offset);
                this._tabs.updatePosition(offset)
            },
            _swipeEndHandler: function(e) {
                var targetOffset = e.targetOffset * this._getRTLSignCorrection();
                if (targetOffset === 0) {
                    this._animateRollback();
                    this._tabs.rollback()
                }
                else {
                    var newIndex = this._normalizeIndex(this.option("selectedIndex") - targetOffset);
                    this.option("selectedIndex", newIndex)
                }
                this._swipeGestureRunning = false
            },
            _renderSelectedIndex: $.noop,
            _normalizeIndex: function(index) {
                var boundary = this._indexBoundary();
                if (index < 0)
                    index = boundary + index;
                if (index >= boundary)
                    index = index - boundary;
                return index
            },
            _indexBoundary: function() {
                return this.option("items").length
            },
            _renderContentImpl: function() {
                var items = this.option("items"),
                    selectedIndex = this.option("selectedIndex");
                if (items.length)
                    this._renderItems([items[selectedIndex]])
            },
            _selectedItemElement: function() {
                return this._$itemWrapper.children(":not(." + PIVOT_ITEM_HIDDEN_CLASS + ")")
            },
            _getRTLSignCorrection: function() {
                return this.option("rtlEnabled") ? -1 : 1
            },
            _clean: function() {
                animation.stop(this._$itemWrapper);
                this.callBase()
            },
            _refresh: function() {
                this._tabs._refresh();
                this.callBase()
            },
            _optionChanged: function(name, value, prevValue) {
                switch (name) {
                    case"disabled":
                        this._tabs.option("disabled", value);
                        this.callBase.apply(this, arguments);
                        break;
                    case"selectedIndex":
                        if (!this._swipeGestureRunning)
                            this._prepareAnimation();
                        this._animateComplete(value, prevValue);
                        this._tabs.option("selectedIndex", value);
                        break;
                    case"items":
                        this._tabs.option("items", value);
                        this._clearItemsCache();
                        this.callBase.apply(this, arguments);
                        break;
                    case"rtlEnabled":
                        this._tabs.option("rtlEnabled", value);
                        this._clearItemsCache();
                        this.callBase.apply(this, arguments);
                        break;
                    default:
                        this.callBase.apply(this, arguments)
                }
            }
        }));
        ui.dxPivot.__internals = {animation: animation}
    })(jQuery, DevExpress);
    /*! Module widgets-mobile, file ui.tileView.js */
    (function($, DX, undefined) {
        var ui = DX.ui,
            utils = DX.utils;
        var TILEVIEW_CLASS = "dx-tileview",
            TILEVIEW_CONTAINER_CLASS = "dx-tileview-wrapper",
            TILEVIEW_ITEM_CLASS = "dx-tile",
            TILEVIEW_ITEM_SELECTOR = "." + TILEVIEW_ITEM_CLASS,
            TILEVIEW_ITEM_DATA_KEY = "dxTileData";
        DX.registerComponent("dxTileView", ui.CollectionContainerWidget.inherit({
            _activeStateUnit: TILEVIEW_ITEM_SELECTOR,
            _deprecatedOptions: {listHeight: {
                    since: "14.1",
                    message: "Use the 'height' option instead"
                }},
            _optionAliases: {listHeight: "height"},
            _setDefaultOptions: function() {
                this.callBase();
                this.option({
                    hoverStateEnabled: true,
                    items: null,
                    showScrollbar: false,
                    height: 500,
                    baseItemWidth: 100,
                    baseItemHeight: 100,
                    itemMargin: 20,
                    indicateLoading: true
                })
            },
            _itemClass: function() {
                return TILEVIEW_ITEM_CLASS
            },
            _itemDataKey: function() {
                return TILEVIEW_ITEM_DATA_KEY
            },
            _itemContainer: function() {
                return this._$container
            },
            _init: function() {
                this.callBase();
                this._initScrollView()
            },
            _handleDataSourceLoadingChanged: function(isLoading) {
                var scrollView = this._scrollView;
                if (!scrollView)
                    return;
                if (isLoading && this.option("indicateLoading"))
                    scrollView.startLoading();
                else
                    scrollView.finishLoading()
            },
            _hideLoadingIfLoadIndicationOff: function() {
                if (!this.option("indicateLoading"))
                    this._handleDataSourceLoadingChanged(false)
            },
            _initScrollView: function() {
                this._scrollView = this._element().dxScrollView({
                    direction: "horizontal",
                    scrollByContent: true
                }).dxScrollView("instance");
                this._$container = this._scrollView.content();
                this._$container.addClass(TILEVIEW_CONTAINER_CLASS);
                this._scrollView.option("updateAction", $.proxy(this._renderGeometry, this))
            },
            _render: function() {
                this.callBase();
                this._element().addClass(TILEVIEW_CLASS);
                this.cellsPerColumn = 1;
                this._updateScrollView();
                this._fireContentReadyAction()
            },
            _renderContent: function() {
                this._renderContentImpl()
            },
            _updateScrollView: function() {
                this._scrollView.option({
                    rtlEnabled: this.option("rtlEnabled"),
                    showScrollbar: this.option("showScrollbar"),
                    disabled: this.option("disabled")
                });
                this._scrollView.update();
                this._indicateLoadingIfAlreadyStarted()
            },
            _indicateLoadingIfAlreadyStarted: function() {
                if (this._dataSource && this._dataSource.isLoading())
                    this._handleDataSourceLoadingChanged(true)
            },
            _renderGeometry: function() {
                var items = this.option("items") || [],
                    maxItemHeight = Math.max.apply(Math, $.map(items || [], function(item) {
                        return Math.round(item.heightRatio || 1)
                    }));
                this.cellsPerColumn = Math.floor(this._element().height() / (this.option("baseItemHeight") + this.option("itemMargin")));
                this.cellsPerColumn = Math.max(this.cellsPerColumn, maxItemHeight);
                this.cells = [];
                this.cells.push(new Array(this.cellsPerColumn));
                this._arrangeItems(items);
                this._$container.width(this.cells.length * this.option("baseItemWidth") + (this.cells.length + 1) * this.option("itemMargin"))
            },
            _arrangeItems: function(items) {
                var that = this,
                    offsetCorrection = this.option("rtlEnabled") ? this._$container.width() : 0;
                $.each(items, function(index, item) {
                    var currentItem = {};
                    currentItem.widthRatio = item.widthRatio || 1;
                    currentItem.heightRatio = item.heightRatio || 1;
                    currentItem.text = item.text || "";
                    currentItem.widthRatio = currentItem.widthRatio <= 0 ? 0 : Math.round(currentItem.widthRatio);
                    currentItem.heightRatio = currentItem.heightRatio <= 0 ? 0 : Math.round(currentItem.heightRatio);
                    var $item = that._itemElements().eq(index),
                        itemPosition = that._getItemPosition(currentItem);
                    if (itemPosition.x === -1)
                        itemPosition.x = that.cells.push(new Array(that.cellsPerColumn)) - 1;
                    that._occupyCells(currentItem, itemPosition);
                    that._arrangeItem($item, currentItem, itemPosition, offsetCorrection)
                })
            },
            _getItemPosition: function(item) {
                var position = {
                        x: -1,
                        y: 0
                    };
                for (var col = 0; col < this.cells.length; col++) {
                    for (var row = 0; row < this.cellsPerColumn; row++)
                        if (this._itemFit(col, row, item)) {
                            position.x = col;
                            position.y = row;
                            break
                        }
                    if (position.x > -1)
                        break
                }
                return position
            },
            _itemFit: function(column, row, item) {
                var result = true;
                if (row + item.heightRatio > this.cellsPerColumn)
                    return false;
                for (var columnIndex = column; columnIndex < column + item.widthRatio; columnIndex++)
                    for (var rowIndex = row; rowIndex < row + item.heightRatio; rowIndex++)
                        if (this.cells.length - 1 < columnIndex)
                            this.cells.push(new Array(this.cellsPerColumn));
                        else if (this.cells[columnIndex][rowIndex]) {
                            result = false;
                            break
                        }
                return result
            },
            _occupyCells: function(item, itemPosition) {
                for (var i = itemPosition.x; i < itemPosition.x + item.widthRatio; i++)
                    for (var j = itemPosition.y; j < itemPosition.y + item.heightRatio; j++)
                        this.cells[i][j] = true
            },
            _arrangeItem: function($item, item, itemPosition, offsetCorrection) {
                var baseItemHeight = this.option("baseItemHeight"),
                    baseItemWidth = this.option("baseItemWidth"),
                    itemMargin = this.option("itemMargin"),
                    leftOffset;
                if (!offsetCorrection)
                    leftOffset = itemPosition.x * baseItemWidth + (itemPosition.x + 1) * itemMargin;
                else {
                    var startOffsetPosition = itemPosition.x * baseItemWidth,
                        itemBasePartWidth = baseItemWidth + itemMargin,
                        itemWidth = itemBasePartWidth * item.widthRatio,
                        subitemMarginsWidth = itemPosition.x * itemMargin;
                    leftOffset = offsetCorrection - (startOffsetPosition + itemWidth + subitemMarginsWidth)
                }
                $item.css({
                    height: item.heightRatio * baseItemHeight + (item.heightRatio - 1) * itemMargin,
                    width: item.widthRatio * baseItemWidth + (item.widthRatio - 1) * itemMargin,
                    top: itemPosition.y * baseItemHeight + (itemPosition.y + 1) * itemMargin,
                    left: leftOffset,
                    display: item.widthRatio <= 0 || item.heightRatio <= 0 ? "none" : ""
                })
            },
            _optionChanged: function(name, value) {
                switch (name) {
                    case"showScrollbar":
                        this._initScrollView();
                        break;
                    case"disabled":
                        this._scrollView.option("disabled", value);
                        break;
                    case"baseItemWidth":
                    case"baseItemHeight":
                    case"itemMargin":
                        this._renderGeometry();
                        break;
                    case"height":
                        this.callBase.apply(this, arguments);
                        this._renderGeometry();
                        this._scrollView.update();
                        break;
                    case"indicateLoading":
                        this._hideLoadingIfLoadIndicationOff();
                        break;
                    default:
                        this.callBase.apply(this, arguments)
                }
            },
            scrollPosition: function() {
                return this._scrollView.scrollOffset().left
            }
        }))
    })(jQuery, DevExpress);
    /*! Module widgets-mobile, file ui.actionSheet.js */
    (function($, DX, undefined) {
        var ui = DX.ui;
        var ACTION_SHEET_CLASS = "dx-action-sheet",
            ACTION_SHEET_CONTAINER_CLASS = "dx-action-sheet-container",
            ACTION_SHEET_POPUP_WRAPPER_CLASS = "dx-action-sheet-popup-wrapper",
            ACTION_SHEET_POPOVER_WRAPPER_CLASS = "dx-action-sheet-popover-wrapper",
            ACTION_SHEET_CANCEL_BUTTON_CLASS = "dx-action-sheet-cancel",
            ACTION_SHEET_ITEM_CLASS = "dx-action-sheet-item",
            ACTION_SHEET_ITEM_DATA_KEY = "dxActionSheetItemData",
            ACTION_SHEET_WITHOUT_TITLE_CLASS = "dx-action-sheet-without-title";
        DX.registerComponent("dxActionSheet", ui.CollectionContainerWidget.inherit({
            _setDefaultOptions: function() {
                this.callBase();
                this.option({
                    usePopover: false,
                    target: null,
                    title: "",
                    showTitle: true,
                    showCancelButton: true,
                    cancelText: Globalize.localize("Cancel"),
                    cancelClickAction: null,
                    visible: false,
                    noDataText: ""
                })
            },
            _defaultOptionsRules: function() {
                return this.callBase().slice(0).concat([{
                            device: [{
                                    platform: "ios",
                                    tablet: true
                                }, {
                                    platform: "ios7",
                                    tablet: true
                                }],
                            options: {usePopover: true}
                        }])
            },
            _itemContainer: function() {
                return this._$itemContainer
            },
            _itemClass: function() {
                return ACTION_SHEET_ITEM_CLASS
            },
            _itemDataKey: function() {
                return ACTION_SHEET_ITEM_DATA_KEY
            },
            _toggleVisibility: $.noop,
            _renderDimensions: $.noop,
            _render: function() {
                this._element().addClass(ACTION_SHEET_CLASS);
                this._createItemContainer();
                this._renderPopup()
            },
            _createItemContainer: function() {
                this._$itemContainer = $("<div>").addClass(ACTION_SHEET_CONTAINER_CLASS);
                this._renderDisabled()
            },
            _renderDisabled: function() {
                this._$itemContainer.toggleClass("dx-state-disabled", this.option("disabled"))
            },
            _renderPopup: function() {
                this._$popup = $("<div>").appendTo(this._element());
                this._popup = this._isPopoverMode() ? this._createPopover() : this._createPopup();
                this._renderPopupTitle();
                this._mapPopupOption("visible")
            },
            _mapPopupOption: function(optionName) {
                this._popup.option(optionName, this.option(optionName))
            },
            _isPopoverMode: function() {
                return this.option("usePopover") && this.option("target")
            },
            _renderPopupTitle: function() {
                this._mapPopupOption("showTitle");
                this._popup._wrapper().toggleClass(ACTION_SHEET_WITHOUT_TITLE_CLASS, !this.option("showTitle"))
            },
            _clean: function() {
                if (this._$popup)
                    this._$popup.remove();
                this.callBase()
            },
            _createPopover: function() {
                var popover = this._$popup.dxPopover({
                        _templates: this.option("_templates"),
                        rtlEnabled: this.option("rtlEnabled"),
                        showTitle: true,
                        title: this.option("title"),
                        width: this.option("width") || 200,
                        height: this.option("height") || "auto",
                        target: this.option("target"),
                        hiddenAction: $.proxy(this.hide, this),
                        contentReadyAction: $.proxy(this._popupContentReadyAction, this)
                    }).dxPopover("instance");
                popover._wrapper().addClass(ACTION_SHEET_POPOVER_WRAPPER_CLASS);
                return popover
            },
            _createPopup: function() {
                var popup = this._$popup.dxPopup({
                        _templates: this.option("_templates"),
                        rtlEnabled: this.option("rtlEnabled"),
                        dragEnabled: false,
                        title: this.option("title"),
                        width: this.option("width") || "100%",
                        height: this.option("height") || "auto",
                        contentReadyAction: $.proxy(this._popupContentReadyAction, this),
                        position: {
                            my: "bottom",
                            at: "bottom",
                            of: window
                        },
                        animation: {
                            show: {
                                type: "slide",
                                duration: 400,
                                from: {position: {
                                        my: "top",
                                        at: "bottom",
                                        of: window
                                    }},
                                to: {position: {
                                        my: "bottom",
                                        at: "bottom",
                                        of: window
                                    }}
                            },
                            hide: {
                                type: "slide",
                                duration: 400,
                                from: {position: {
                                        my: "bottom",
                                        at: "bottom",
                                        of: window
                                    }},
                                to: {position: {
                                        my: "top",
                                        at: "bottom",
                                        of: window
                                    }}
                            }
                        }
                    }).dxPopup("instance");
                popup.optionChanged.add($.proxy(function(name, value) {
                    if (name !== "visible")
                        return;
                    this.option("visible", value)
                }, this));
                popup._wrapper().addClass(ACTION_SHEET_POPUP_WRAPPER_CLASS);
                return popup
            },
            _popupContentReadyAction: function() {
                this._popup.content().append(this._$itemContainer);
                this._attachClickEvent();
                this._attachHoldEvent();
                this._renderContent();
                this._renderCancelButton()
            },
            _renderCancelButton: function() {
                if (this._isPopoverMode())
                    return;
                if (this._$cancelButton)
                    this._$cancelButton.remove();
                if (this.option("showCancelButton")) {
                    var cancelClickAction = new DX.Action($.proxy(this.hide, this), {beforeExecute: this.option("cancelClickAction")});
                    this._$cancelButton = $("<div>").addClass(ACTION_SHEET_CANCEL_BUTTON_CLASS).appendTo(this._popup.content()).dxButton({
                        text: this.option("cancelText"),
                        clickAction: function(e) {
                            cancelClickAction.execute(e)
                        }
                    })
                }
            },
            _handleItemClick: function(e) {
                this.callBase(e);
                if (!$(e.target).is(".dx-state-disabled, .dx-state-disabled *"))
                    this.hide()
            },
            _handleItemHold: function(e) {
                this.callBase(e);
                if (!$(e.target).is(".dx-state-disabled, .dx-state-disabled *"))
                    this.hide()
            },
            _itemRenderDefault: function(item, index, itemElement) {
                itemElement.dxButton(item)
            },
            _optionChanged: function(name, value) {
                switch (name) {
                    case"width":
                    case"height":
                    case"visible":
                    case"title":
                        this._mapPopupOption(name);
                        break;
                    case"disabled":
                        this._renderDisabled();
                        break;
                    case"showTitle":
                        this._renderPopupTitle();
                        break;
                    case"showCancelButton":
                    case"cancelClickAction":
                    case"cancelText":
                        this._renderCancelButton();
                        break;
                    case"target":
                    case"usePopover":
                    case"items":
                        this._invalidate();
                        break;
                    default:
                        this.callBase.apply(this, arguments)
                }
            },
            toggle: function(showing) {
                var that = this,
                    d = $.Deferred();
                that._popup.toggle(showing).done(function() {
                    that.option("visible", showing);
                    d.resolveWith(that)
                });
                return d.promise()
            },
            show: function() {
                return this.toggle(true)
            },
            hide: function() {
                return this.toggle(false)
            }
        }))
    })(jQuery, DevExpress);
    /*! Module widgets-mobile, file ui.dropDownMenu.js */
    (function($, DX, undefined) {
        var ui = DX.ui,
            events = ui.events;
        var DROP_DOWN_MENU_CLASS = "dx-dropdownmenu",
            DROP_DOWN_MENU_POPUP_CLASS = "dx-dropdownmenu-popup",
            DROP_DOWN_MENU_POPUP_WRAPPER_CLASS = DROP_DOWN_MENU_POPUP_CLASS + "-wrapper",
            DROP_DOWN_MENU_LIST_CLASS = "dx-dropdownmenu-list",
            DROP_DOWN_MENU_BUTTON_CLASS = "dx-dropdownmenu-button";
        DX.registerComponent("dxDropDownMenu", ui.Widget.inherit({
            _setDefaultOptions: function() {
                this.callBase();
                this.option({
                    items: [],
                    itemClickAction: null,
                    dataSource: null,
                    itemTemplate: "item",
                    itemRender: null,
                    buttonText: "",
                    buttonIcon: "overflow",
                    buttonIconSrc: null,
                    buttonClickAction: null,
                    usePopover: false,
                    hoverStateEnabled: true
                })
            },
            _defaultOptionsRules: function() {
                return this.callBase().slice(0).concat([{
                            device: [{platform: "ios"}, {platform: "ios7"}],
                            options: {usePopover: true}
                        }])
            },
            _init: function() {
                this.callBase();
                this._initDataSource();
                this._initItemClickAction()
            },
            _initItemClickAction: function() {
                this._itemClickAction = this._createActionByOption("itemClickAction")
            },
            _render: function() {
                this._element().addClass(DROP_DOWN_MENU_CLASS);
                this._renderButton();
                this._renderClick();
                this.callBase()
            },
            _clean: function() {
                this._popup._element().remove()
            },
            _renderContentImpl: function() {
                this._renderPopup()
            },
            _renderButton: function() {
                var buttonIconSrc = this.option("buttonIconSrc"),
                    buttonIcon = this.option("buttonIcon");
                this._button = this._element().addClass(DROP_DOWN_MENU_BUTTON_CLASS).dxButton({
                    text: this.option("buttonText"),
                    icon: buttonIcon,
                    iconSrc: buttonIconSrc,
                    clickAction: this.option("buttonClickAction")
                }).dxButton("instance")
            },
            _renderClick: function() {
                var action = this._createAction(this._handleButtonClick),
                    eventName = events.addNamespace("dxclick", this.NAME);
                this._element().off(eventName).on(eventName, function(e) {
                    action({jQueryEvent: e})
                })
            },
            _handleButtonClick: function(e) {
                e.component._popup.toggle()
            },
            _renderList: function(instance) {
                var $content = instance.content(),
                    that = this;
                that._list = $content.addClass(DROP_DOWN_MENU_LIST_CLASS).dxList({
                    _templates: this.option("_templates"),
                    autoPagingEnabled: false,
                    indicateLoading: false,
                    noDataText: "",
                    itemRender: that.option("itemRender"),
                    itemTemplate: that._getTemplateByOption("itemTemplate"),
                    itemClickAction: function(e) {
                        that._popup.hide();
                        that._itemClickAction(e)
                    }
                }).data("dxList");
                that._setListDataSource();
                that._attachListClick();
                var listMaxHeight = $(window).height() * 0.5;
                if ($content.height() > listMaxHeight)
                    $content.height(listMaxHeight)
            },
            _toggleVisibility: function(visible) {
                this.callBase(visible);
                this._button.option("visible", visible)
            },
            _attachListClick: function() {
                var action = this._createAction(this._handleListClick);
                this._list._element().off("." + this.NAME).on(events.addNamespace("dxclick", this.NAME), function(e) {
                    action({jQueryEvent: e})
                })
            },
            _handleListClick: function(e) {
                e.component._popup.hide()
            },
            _renderPopup: function() {
                var $popup = this._$popup = $("<div>").appendTo(this._element());
                var popupOptions = {
                        contentReadyAction: $.proxy(this._popupContentReadyHandler, this),
                        deferRendering: false
                    };
                this._popup = this._createPopover($popup, popupOptions);
                this._popup._wrapper().addClass(DROP_DOWN_MENU_POPUP_WRAPPER_CLASS);
                this._popup._wrapper().toggleClass(DROP_DOWN_MENU_POPUP_CLASS, !this.option("usePopover"))
            },
            _popupContentReadyHandler: function() {
                var popup = this._$popup.dxPopover("instance");
                this._renderList(popup)
            },
            _createPopover: function($element, popupOptions) {
                return $element.dxPopover($.extend(popupOptions, {
                        target: this._element(),
                        rtlEnabled: this.option("rtlEnabled")
                    })).dxPopover("instance")
            },
            _setListDataSource: function() {
                if (this._list)
                    this._list.option("dataSource", this._dataSource || this.option("items"))
            },
            _optionChanged: function(name, value) {
                if (/^button/.test(name)) {
                    this._renderButton();
                    return
                }
                switch (name) {
                    case"items":
                    case"dataSource":
                        this._refreshDataSource();
                        this._setListDataSource();
                        break;
                    case"itemRender":
                    case"itemTemplate":
                        if (this._list)
                            this._list.option(name, value);
                        break;
                    case"itemClickAction":
                        this._initItemClickAction();
                        break;
                    case"usePopover":
                        this._invalidate();
                        break;
                    default:
                        this.callBase.apply(this, arguments)
                }
            }
        }).include(ui.DataHelperMixin))
    })(jQuery, DevExpress);
    /*! Module widgets-mobile, file ui.panorama.js */
    (function($, DX, undefined) {
        var ui = DX.ui,
            events = ui.events,
            fx = DX.fx,
            translator = DX.translator,
            utils = DX.utils;
        var PANORAMA_CLASS = "dx-panorama",
            PANORAMA_WRAPPER_CLASS = "dx-panorama-wrapper",
            PANORAMA_TITLE_CLASS = "dx-panorama-title",
            PANORAMA_GHOST_TITLE_CLASS = "dx-panorama-ghosttitle",
            PANORAMA_ITEMS_CONTAINER_CLASS = "dx-panorama-itemscontainer",
            PANORAMA_ITEM_CLASS = "dx-panorama-item",
            PANORAMA_GHOST_ITEM_CLASS = "dx-panorama-ghostitem",
            PANORAMA_ITEM_HEADER_CLASS = "dx-panorama-item-header",
            PANORAMA_ITEM_DATA_KEY = "dxPanoramaItemData",
            PANORAMA_ITEM_MARGIN_SCALE = .02,
            PANORAMA_TITLE_MARGIN_SCALE = .02,
            PANORAMA_BACKGROUND_MOVE_DURATION = 300,
            PANORAMA_BACKGROUND_MOVE_EASING = "cubic-bezier(.40, .80, .60, 1)",
            PANORAMA_TITLE_MOVE_DURATION = 300,
            PANORAMA_TITLE_MOVE_EASING = "cubic-bezier(.40, .80, .60, 1)",
            PANORAMA_ITEM_MOVE_DURATION = 300,
            PANORAMA_ITEM_MOVE_EASING = "cubic-bezier(.40, .80, .60, 1)";
        var moveBackground = function($element, position) {
                $element.css("background-position", position + "px 0%")
            };
        var position = function($element) {
                return translator.locate($element).left
            };
        var move = function($element, position) {
                translator.move($element, {left: position})
            };
        var animation = {
                backgroundMove: function($element, position, completeAction) {
                    return fx.animate($element, {
                            to: {"background-position": position + "px 0%"},
                            duration: PANORAMA_BACKGROUND_MOVE_DURATION,
                            easing: PANORAMA_BACKGROUND_MOVE_EASING,
                            complete: completeAction
                        })
                },
                titleMove: function($title, position, completeAction) {
                    return fx.animate($title, {
                            type: "slide",
                            to: {left: position},
                            duration: PANORAMA_TITLE_MOVE_DURATION,
                            easing: PANORAMA_TITLE_MOVE_EASING,
                            complete: completeAction
                        })
                },
                itemMove: function($item, position, completeAction) {
                    return fx.animate($item, {
                            type: "slide",
                            to: {left: position},
                            duration: PANORAMA_ITEM_MOVE_DURATION,
                            easing: PANORAMA_ITEM_MOVE_EASING,
                            complete: completeAction
                        })
                }
            };
        var endAnimation = function(elements) {
                if (!elements)
                    return;
                $.each(elements, function(_, element) {
                    fx.stop(element, true)
                })
            };
        var PanoramaItemsRenderStrategy = DX.Class.inherit({
                ctor: function(panorama) {
                    this._panorama = panorama
                },
                init: $.noop,
                render: $.noop,
                allItemElements: function() {
                    return this._panorama._itemElements()
                },
                updatePositions: DX.abstract,
                animateRollback: DX.abstract,
                detectBoundsTransition: DX.abstract,
                animateComplete: DX.abstract,
                _getRTLSignCorrection: function() {
                    return this._panorama._getRTLSignCorrection()
                },
                _isRTLEnabled: function() {
                    return this._panorama.option("rtlEnabled")
                },
                _itemMargin: function() {
                    return this._containerWidth() * PANORAMA_ITEM_MARGIN_SCALE
                },
                _containerWidth: function() {
                    return this._panorama._elementWidth()
                },
                _itemWidth: function() {
                    return this._panorama._itemWidth()
                },
                _indexBoundary: function() {
                    return this._panorama._indexBoundary()
                },
                _normalizeIndex: function(index) {
                    return this._panorama._normalizeIndex(index)
                },
                _startNextPosition: function() {
                    if (this._isRTLEnabled())
                        return this._containerWidth() - (this._itemMargin() + this._itemWidth());
                    else
                        return this._itemMargin()
                },
                _startPrevPosition: function() {
                    if (this._isRTLEnabled())
                        return this._containerWidth();
                    else
                        return -this._itemWidth()
                }
            });
        var PanoramaOneAndLessItemsRenderStrategy = PanoramaItemsRenderStrategy.inherit({
                updatePositions: function() {
                    var $items = this._panorama._itemElements(),
                        startPosition = this._startNextPosition();
                    $items.each(function() {
                        move($(this), startPosition)
                    })
                },
                animateRollback: $.noop,
                detectBoundsTransition: $.noop,
                animateComplete: $.noop
            });
        var PanoramaTwoItemsRenderStrategy = PanoramaItemsRenderStrategy.inherit({
                init: function() {
                    this._initGhostItem()
                },
                render: function() {
                    this._renderGhostItem()
                },
                _initGhostItem: function() {
                    this._$ghostItem = $("<div>").addClass(PANORAMA_GHOST_ITEM_CLASS)
                },
                _renderGhostItem: function() {
                    this._panorama._itemContainer().append(this._$ghostItem);
                    this._toggleGhostItem(false)
                },
                _toggleGhostItem: function(visible) {
                    var $ghostItem = this._$ghostItem;
                    if (visible)
                        $ghostItem.css("opacity", 1);
                    else
                        $ghostItem.css("opacity", 0)
                },
                _updateGhostItemContent: function(index) {
                    if (index !== false && index !== this._prevGhostIndex) {
                        this._$ghostItem.html(this._panorama._itemElements().eq(index).html());
                        this._prevGhostIndex = index
                    }
                },
                _isGhostItemVisible: function() {
                    return this._$ghostItem.css("opacity") == 1
                },
                _swapGhostWithItem: function($item) {
                    var $ghostItem = this._$ghostItem,
                        lastItemPosition = position($item);
                    move($item, position($ghostItem));
                    move($ghostItem, lastItemPosition)
                },
                allItemElements: function() {
                    return this._panorama._itemContainer().find("." + PANORAMA_ITEM_CLASS + ", ." + PANORAMA_GHOST_ITEM_CLASS)
                },
                updatePositions: function(offset) {
                    var $items = this.allItemElements(),
                        selectedIndex = this._panorama.option("selectedIndex"),
                        adjustedOffset = offset * this._getRTLSignCorrection(),
                        isGhostReplaceLast = adjustedOffset > 0 && selectedIndex === 0 || adjustedOffset < 0 && selectedIndex === 1,
                        isGhostReplaceFirst = adjustedOffset < 0 && selectedIndex === 0 || adjustedOffset > 0 && selectedIndex === 1,
                        ghostPosition = isGhostReplaceLast && "replaceLast" || isGhostReplaceFirst && "replaceFirst",
                        ghostContentIndex = isGhostReplaceLast && 1 || isGhostReplaceFirst && 0,
                        positions = this._calculateItemPositions(selectedIndex, ghostPosition);
                    this._updateGhostItemContent(ghostContentIndex);
                    this._toggleGhostItem(isGhostReplaceLast || isGhostReplaceFirst);
                    $items.each(function(index) {
                        move($(this), positions[index] + offset)
                    })
                },
                animateRollback: function(currentIndex) {
                    var that = this,
                        $items = this._panorama._itemElements(),
                        startPosition = this._startNextPosition(),
                        signCorrection = this._getRTLSignCorrection(),
                        offset = (position($items.eq(currentIndex)) - startPosition) * signCorrection,
                        ghostOffset = (position(this._$ghostItem) - startPosition) * signCorrection,
                        positions = this._calculateItemPositions(currentIndex, ghostOffset > 0 ? "prepend" : "append"),
                        isLastReplasedByGhost = currentIndex === 0 && offset > 0 && ghostOffset > 0 || currentIndex === 1 && ghostOffset < 0;
                    if (isLastReplasedByGhost)
                        this._swapGhostWithItem($items.eq(1));
                    else
                        this._swapGhostWithItem($items.eq(0));
                    $items.each(function(index) {
                        animation.itemMove($(this), positions[index])
                    });
                    animation.itemMove(this._$ghostItem, positions[2], function() {
                        that._toggleGhostItem(false)
                    })
                },
                detectBoundsTransition: function(newIndex, currentIndex) {
                    var ghostLocation = position(this._$ghostItem),
                        startPosition = this._startNextPosition(),
                        rtl = this._isRTLEnabled();
                    if (newIndex === 0 && rtl ^ ghostLocation < startPosition)
                        return "left";
                    if (currentIndex === 0 && rtl ^ ghostLocation > startPosition)
                        return "right"
                },
                animateComplete: function(boundCross, newIndex, currentIndex) {
                    var that = this,
                        ghostPosition = !boundCross ^ !(currentIndex === 0) ? "prepend" : "append",
                        $items = this._panorama._itemElements(),
                        positions = this._calculateItemPositions(newIndex, ghostPosition),
                        animations = [];
                    $items.each(function(index) {
                        animations.push(animation.itemMove($(this), positions[index]))
                    });
                    animations.push(animation.itemMove(this._$ghostItem, positions[2], function() {
                        that._toggleGhostItem(false)
                    }));
                    return $.when.apply($, animations)
                },
                _calculateItemPositions: function(atIndex, ghostPosition) {
                    var positions = [],
                        $items = this._panorama._itemElements(),
                        itemMargin = this._itemMargin(),
                        itemWidth = this._itemWidth(),
                        itemPositionOffset = (itemWidth + itemMargin) * this._getRTLSignCorrection(),
                        normalFlow = atIndex === 0,
                        prevPosition = this._startPrevPosition(),
                        nextPosition = this._startNextPosition();
                    positions.push(nextPosition);
                    nextPosition += itemPositionOffset;
                    if (normalFlow)
                        positions.push(nextPosition);
                    else
                        positions.splice(0, 0, nextPosition);
                    nextPosition += itemPositionOffset;
                    switch (ghostPosition) {
                        case"replaceFirst":
                            positions.push(positions[0]);
                            if (normalFlow)
                                positions[0] = nextPosition;
                            else
                                positions[0] = prevPosition;
                            break;
                        case"replaceLast":
                            if (normalFlow)
                                positions.splice(1, 0, prevPosition);
                            else
                                positions.splice(1, 0, nextPosition);
                            break;
                        case"prepend":
                            positions.push(prevPosition);
                            break;
                        case"append":
                            positions.push(nextPosition);
                            break
                    }
                    return positions
                }
            });
        var PanoramaThreeAndMoreItemsRenderStrategy = PanoramaItemsRenderStrategy.inherit({
                updatePositions: function(offset) {
                    var $items = this._panorama._itemElements(),
                        movingBack = offset * this._getRTLSignCorrection() < 0,
                        positions = this._calculateItemPositions(this._panorama.option("selectedIndex"), movingBack);
                    $items.each(function(index) {
                        move($(this), positions[index] + offset)
                    })
                },
                animateRollback: function(selectedIndex) {
                    var $items = this._panorama._itemElements(),
                        positions = this._calculateItemPositions(selectedIndex),
                        animatingItems = [selectedIndex, this._normalizeIndex(selectedIndex + 1)];
                    if (this._isRTLEnabled() ^ position($items.eq(selectedIndex)) > this._startNextPosition())
                        animatingItems.push(this._normalizeIndex(selectedIndex - 1));
                    $items.each(function(index) {
                        var $item = $(this);
                        if ($.inArray(index, animatingItems) !== -1)
                            animation.itemMove($item, positions[index]);
                        else
                            move($item, positions[index])
                    })
                },
                detectBoundsTransition: function(newIndex, currentIndex) {
                    var lastIndex = this._indexBoundary() - 1;
                    if (currentIndex === lastIndex && newIndex === 0)
                        return "left";
                    if (currentIndex === 0 && newIndex === lastIndex)
                        return "right"
                },
                animateComplete: function(boundCross, newIndex, currentIndex) {
                    var animations = [],
                        $items = this._panorama._itemElements(),
                        positions = this._calculateItemPositions(newIndex);
                    var transitionBack = this._normalizeIndex(currentIndex - 1) === newIndex,
                        cyclingItemIndex = $items.length === 3 && transitionBack ? this._normalizeIndex(currentIndex + 1) : null,
                        cyclingItemPosition = positions[this._indexBoundary()];
                    var animatingItems = [newIndex, currentIndex],
                        backAnimatedItemIndex = transitionBack ? currentIndex : newIndex;
                    if (!transitionBack)
                        animatingItems.push(this._normalizeIndex(backAnimatedItemIndex + 1));
                    $items.each(function(index) {
                        var $item = $(this);
                        if ($.inArray(index, animatingItems) === -1) {
                            move($item, positions[index]);
                            return
                        }
                        animations.push(index !== cyclingItemIndex ? animation.itemMove($item, positions[index]) : animation.itemMove($item, cyclingItemPosition, function() {
                            move($item, positions[index])
                        }))
                    });
                    return $.when.apply($, animations)
                },
                _calculateItemPositions: function(atIndex, movingBack) {
                    var previousIndex = this._normalizeIndex(atIndex - 1),
                        $items = this._panorama._itemElements(),
                        itemMargin = this._itemMargin(),
                        itemWidth = this._itemWidth(),
                        itemPositionOffset = (itemWidth + itemMargin) * this._getRTLSignCorrection(),
                        positions = [],
                        prevPosition = this._startPrevPosition(),
                        nextPosition = this._startNextPosition();
                    for (var i = atIndex; i !== previousIndex; i = this._normalizeIndex(i + 1)) {
                        positions[i] = nextPosition;
                        nextPosition += itemPositionOffset
                    }
                    if (movingBack) {
                        positions[previousIndex] = nextPosition;
                        nextPosition += itemPositionOffset
                    }
                    else
                        positions[previousIndex] = prevPosition;
                    positions.push(nextPosition);
                    return positions
                }
            });
        DX.registerComponent("dxPanorama", ui.CollectionContainerWidget.inherit({
            _setDefaultOptions: function() {
                this.callBase();
                this.option({
                    selectedIndex: 0,
                    title: "panorama",
                    backgroundImage: {
                        url: null,
                        width: 0,
                        height: 0
                    }
                })
            },
            _itemClass: function() {
                return PANORAMA_ITEM_CLASS
            },
            _itemDataKey: function() {
                return PANORAMA_ITEM_DATA_KEY
            },
            _itemContainer: function() {
                return this._$itemsContainer
            },
            _selectionByClickEnabled: function() {
                return false
            },
            _itemWidth: function() {
                if (!this._itemWidthCache)
                    this._itemWidthCache = this._itemElements().eq(0).outerWidth();
                return this._itemWidthCache
            },
            _clearItemWidthCache: function() {
                delete this._itemWidthCache
            },
            _elementWidth: function() {
                if (!this._elementWidthCache)
                    this._elementWidthCache = this._element().width();
                return this._elementWidthCache
            },
            _clearElementWidthCache: function() {
                delete this._elementWidthCache
            },
            _titleWidth: function() {
                if (!this._titleWidthCache)
                    this._titleWidthCache = this._$title.outerWidth();
                return this._titleWidthCache
            },
            _clearTitleWidthCache: function() {
                delete this._titleWidthCache
            },
            _init: function() {
                this.callBase();
                this._initItemsRenderStrategy();
                this._initWrapper();
                this._initTitle();
                this._initItemsContainer();
                this._initSwipeHandlers()
            },
            _dimensionChanged: function() {
                this._clearItemWidthCache();
                this._clearElementWidthCache();
                this._clearTitleWidthCache();
                this._updatePositions()
            },
            _initWrapper: function() {
                this._$wrapper = $("<div>").addClass(PANORAMA_WRAPPER_CLASS).appendTo(this._element())
            },
            _initItemsRenderStrategy: function() {
                var itemsRenderStrategy;
                switch (this.option("items").length) {
                    case 0:
                    case 1:
                        itemsRenderStrategy = PanoramaOneAndLessItemsRenderStrategy;
                        break;
                    case 2:
                        itemsRenderStrategy = PanoramaTwoItemsRenderStrategy;
                        break;
                    default:
                        itemsRenderStrategy = PanoramaThreeAndMoreItemsRenderStrategy
                }
                this._itemsRenderStrategy = new itemsRenderStrategy(this);
                this._itemsRenderStrategy.init()
            },
            _initBackgroundImage: function() {
                var bgUrl = this.option("backgroundImage.url");
                if (bgUrl)
                    this._element().css("background-image", "url(" + bgUrl + ")")
            },
            _initTitle: function() {
                this._$title = $("<div>").addClass(PANORAMA_TITLE_CLASS);
                this._$ghostTitle = $("<div>").addClass(PANORAMA_GHOST_TITLE_CLASS);
                this._$wrapper.append(this._$title);
                this._$wrapper.append(this._$ghostTitle);
                this._updateTitle()
            },
            _updateTitle: function() {
                var title = this.option("title");
                this._$title.text(title);
                this._$ghostTitle.text(title);
                this._toggleGhostTitle(false)
            },
            _toggleGhostTitle: function(visible) {
                var $ghostTitle = this._$ghostTitle;
                if (visible)
                    $ghostTitle.css("opacity", 1);
                else
                    $ghostTitle.css("opacity", 0)
            },
            _getRTLSignCorrection: function() {
                return this.option("rtlEnabled") ? -1 : 1
            },
            _initItemsContainer: function() {
                this._$itemsContainer = $("<div>").addClass(PANORAMA_ITEMS_CONTAINER_CLASS);
                this._$wrapper.append(this._$itemsContainer)
            },
            _render: function() {
                this._element().addClass(PANORAMA_CLASS);
                this.callBase();
                this._initBackgroundImage();
                this._itemsRenderStrategy.render()
            },
            _updatePositions: function(offset) {
                offset = offset || 0;
                this._updateBackgroundPosition(offset * this._calculateBackgroundStep());
                this._updateTitlePosition(offset * this._calculateTitleStep());
                this._itemsRenderStrategy.updatePositions(offset * this._elementWidth())
            },
            _updateBackgroundPosition: function(offset) {
                moveBackground(this._element(), this._calculateBackgroundPosition(this.option("selectedIndex")) + offset)
            },
            _updateTitlePosition: function(offset) {
                move(this._$title, this._calculateTitlePosition(this.option("selectedIndex")) + offset)
            },
            _animateRollback: function(currentIndex) {
                this._animateBackgroundMove(currentIndex);
                this._animateTitleMove(currentIndex);
                this._itemsRenderStrategy.animateRollback(currentIndex)
            },
            _animateBackgroundMove: function(toIndex) {
                return animation.backgroundMove(this._element(), this._calculateBackgroundPosition(toIndex))
            },
            _animateTitleMove: function(toIndex) {
                return animation.titleMove(this._$title, this._calculateTitlePosition(toIndex))
            },
            _animateComplete: function(newIndex, currentIndex) {
                var that = this,
                    boundCross = this._itemsRenderStrategy.detectBoundsTransition(newIndex, currentIndex);
                var backgroundAnimation = this._performBackgroundAnimation(boundCross, newIndex);
                var titleAnimation = this._performTitleAnimation(boundCross, newIndex);
                var itemsAnimation = this._itemsRenderStrategy.animateComplete(boundCross, newIndex, currentIndex);
                $.when(backgroundAnimation, titleAnimation, itemsAnimation).done(function() {
                    that._indexChangeOnAnimation = true;
                    that.option("selectedIndex", newIndex);
                    that._indexChangeOnAnimation = false
                })
            },
            _performBackgroundAnimation: function(boundCross, newIndex) {
                if (boundCross)
                    return this._animateBackgroundBoundsTransition(boundCross, newIndex);
                return this._animateBackgroundMove(newIndex)
            },
            _animateBackgroundBoundsTransition: function(bound, newIndex) {
                var that = this,
                    isLeft = bound === "left",
                    afterAnimationPosition = this._calculateBackgroundPosition(newIndex),
                    animationEndPositionShift = isLeft ^ this.option("rtlEnabled") ? -this._calculateBackgroundScaledWidth() : this._calculateBackgroundScaledWidth(),
                    animationEndPosition = afterAnimationPosition + animationEndPositionShift;
                return animation.backgroundMove(this._element(), animationEndPosition, function() {
                        moveBackground(that._element(), afterAnimationPosition)
                    })
            },
            _performTitleAnimation: function(boundCross, newIndex) {
                if (boundCross)
                    return this._animateTitleBoundsTransition(boundCross, newIndex);
                return this._animateTitleMove(newIndex)
            },
            _animateTitleBoundsTransition: function(bound, newIndex) {
                var that = this,
                    $ghostTitle = this._$ghostTitle,
                    ghostWidth = this._titleWidth(),
                    panoramaWidth = this._elementWidth(),
                    isLeft = bound === "left",
                    rtl = this.option("rtlEnabled"),
                    ghostTitleStartPosition = isLeft ^ rtl ? panoramaWidth : -ghostWidth,
                    ghostTitleEndPosition = isLeft ^ rtl ? -(panoramaWidth + ghostWidth) : panoramaWidth;
                move($ghostTitle, ghostTitleStartPosition);
                this._toggleGhostTitle(true);
                this._swapGhostWithTitle();
                var ghostAnimation = animation.titleMove($ghostTitle, ghostTitleEndPosition, function() {
                        that._toggleGhostTitle(false)
                    });
                var titleAnimation = animation.titleMove(this._$title, this._calculateTitlePosition(newIndex));
                return $.when(ghostAnimation, titleAnimation)
            },
            _swapGhostWithTitle: function() {
                var $ghostTitle = this._$ghostTitle,
                    $title = this._$title,
                    lastTitlePosition = position($title);
                move($title, position($ghostTitle));
                move($ghostTitle, lastTitlePosition)
            },
            _calculateTitlePosition: function(atIndex) {
                var panoramaWidth = this._elementWidth(),
                    titleWidth = this._titleWidth(),
                    titleMargin = panoramaWidth * PANORAMA_TITLE_MARGIN_SCALE,
                    titleStartPosition = this.option("rtlEnabled") ? panoramaWidth - titleMargin - titleWidth : titleMargin,
                    titleStep = atIndex * this._calculateTitleStep() * this._getRTLSignCorrection();
                return titleStartPosition - titleStep
            },
            _calculateTitleStep: function() {
                var panoramaWidth = this._elementWidth(),
                    titleWidth = this._titleWidth(),
                    indexBoundary = this._indexBoundary() || 1;
                return Math.max((titleWidth - panoramaWidth) / indexBoundary, titleWidth / indexBoundary)
            },
            _calculateBackgroundPosition: function(atIndex) {
                var panoramaWidth = this._elementWidth(),
                    backgroundScaledWidth = this._calculateBackgroundScaledWidth(),
                    backgroundStartPosition = this.option("rtlEnabled") ? panoramaWidth - backgroundScaledWidth : 0,
                    backgroundOffset = atIndex * this._calculateBackgroundStep() * this._getRTLSignCorrection();
                return backgroundStartPosition - backgroundOffset
            },
            _calculateBackgroundStep: function() {
                var itemWidth = this._itemWidth(),
                    backgroundScaledWidth = this._calculateBackgroundScaledWidth();
                return Math.max((backgroundScaledWidth - itemWidth) / (this._indexBoundary() || 1), 0)
            },
            _calculateBackgroundScaledWidth: function() {
                return this._element().height() * this.option("backgroundImage.width") / (this.option("backgroundImage.height") || 1)
            },
            _initSwipeHandlers: function() {
                this._element().on(events.addNamespace("dxswipestart", this.NAME), {itemSizeFunc: $.proxy(this._elementWidth, this)}, $.proxy(this._swipeStartHandler, this)).on(events.addNamespace("dxswipe", this.NAME), $.proxy(this._swipeUpdateHandler, this)).on(events.addNamespace("dxswipeend", this.NAME), $.proxy(this._swipeEndHandler, this))
            },
            _swipeStartHandler: function(e) {
                this._stopAnimations();
                e.maxLeftOffset = 1;
                e.maxRightOffset = 1;
                if (DX.designMode || this.option("disabled") || this._indexBoundary() <= 1)
                    e.cancel = true
            },
            _stopAnimations: function() {
                endAnimation([this._element(), this._$ghostTitle, this._$title]);
                endAnimation(this._itemsRenderStrategy.allItemElements())
            },
            _swipeUpdateHandler: function(e) {
                this._updatePositions(e.offset)
            },
            _swipeEndHandler: function(e) {
                var currentIndex = this.option("selectedIndex"),
                    targetOffset = e.targetOffset * this._getRTLSignCorrection();
                if (targetOffset === 0)
                    this._animateRollback(currentIndex);
                else
                    this._animateComplete(this._normalizeIndex(currentIndex - targetOffset), currentIndex)
            },
            _renderSelectedIndex: function(current, previous) {
                if (!this._indexChangeOnAnimation)
                    this._updatePositions()
            },
            _normalizeIndex: function(index) {
                var boundary = this._indexBoundary();
                if (index < 0)
                    index = boundary + index;
                if (index >= boundary)
                    index = index - boundary;
                return index
            },
            _indexBoundary: function() {
                return this.option("items").length
            },
            _visibilityChanged: function(visible) {
                if (visible)
                    this._dimensionChanged()
            },
            _optionChanged: function(name, value, prevValue) {
                switch (name) {
                    case"width":
                        this.callBase.apply(this, arguments);
                        this._dimensionChanged();
                        break;
                    case"backgroundImage":
                        this._invalidate();
                        break;
                    case"title":
                        this._updateTitle();
                        break;
                    case"items":
                        this._initItemsRenderStrategy();
                        this.callBase.apply(this, arguments);
                        break;
                    default:
                        this.callBase.apply(this, arguments)
                }
            },
            _itemRenderDefault: function(item, index, $itemElement) {
                this.callBase(item, index, $itemElement);
                if (!item.header)
                    return;
                var $itemHeader = $("<div>").addClass(PANORAMA_ITEM_HEADER_CLASS).text(item.header);
                $itemElement.prepend($itemHeader)
            }
        }));
        ui.dxPanorama.__internals = {animation: animation}
    })(jQuery, DevExpress);
    /*! Module widgets-mobile, file ui.slideout.js */
    (function($, DX, undefined) {
        var ui = DX.ui,
            events = ui.events,
            fx = DX.fx,
            utils = DX.utils,
            translator = DX.translator;
        var SLIDEOUT_CLASS = "dx-slideout",
            SLIDEOUT_WRAPPER_CLASS = "dx-slideout-wrapper",
            SLIDEOUT_ITEM_CONTAINER_CLASS = "dx-slideout-item-container",
            SLIDEOUT_MENU = "dx-slideout-menu",
            SLIDEOUT_SHIELD = "dx-slideout-shield",
            SLIDEOUT_ITEM_CLASS = "dx-slideout-item",
            SLIDEOUT_ITEM_DATA_KEY = "dxSlideoutItemData",
            INVISIBLE_STATE_CLASS = "dx-state-invisible",
            CONTENT_OFFSET = 45,
            ANIMATION_DURATION = 400;
        DX.registerComponent("dxSlideOut", ui.CollectionContainerWidget.inherit({
            _setDefaultOptions: function() {
                this.callBase();
                this.option({
                    activeStateEnabled: false,
                    menuItemRender: null,
                    menuItemTemplate: "menuItem",
                    swipeEnabled: true,
                    menuVisible: false,
                    menuGrouped: false,
                    menuGroupTemplate: "group",
                    menuGroupRender: null
                })
            },
            _itemClass: function() {
                return SLIDEOUT_ITEM_CLASS
            },
            _itemDataKey: function() {
                return SLIDEOUT_ITEM_DATA_KEY
            },
            _init: function() {
                this.callBase();
                this._deferredAnimate = undefined
            },
            _render: function() {
                this._renderWrapper();
                this._renderItemsContainer();
                this._renderShield();
                this._renderList();
                this._initSwipeHandlers();
                this._element().addClass(SLIDEOUT_CLASS);
                this.callBase();
                this._renderPosition(this.option("menuVisible"), false)
            },
            _renderWrapper: function() {
                this._wrapper = $("<div>").addClass(SLIDEOUT_WRAPPER_CLASS);
                this._element().append(this._wrapper)
            },
            _renderShield: function() {
                this._$shield = $("<div>").addClass(SLIDEOUT_SHIELD);
                this._$shield.appendTo(this._$container);
                this._$shield.on("dxclick", $.proxy(this.hideMenu, this));
                this._toggleShieldVisibility()
            },
            _dimensionChanged: function() {
                this._renderPosition(this.option("menuVisible"), false);
                this._clearListWidthCache()
            },
            _renderItemsContainer: function() {
                this._$container = $("<div>").addClass(SLIDEOUT_ITEM_CONTAINER_CLASS).appendTo(this._wrapper);
                this._$container.on("MSPointerDown", function(e){})
            },
            _selectedItemElement: function(index) {
                return this._itemElements().eq(0)
            },
            _renderContentImpl: function(template) {
                var items = this.option("items"),
                    selectedIndex = this.option("selectedIndex");
                if (items.length && selectedIndex > -1) {
                    var selectedItem = this._$list.dxList("instance").getItemByIndex(selectedIndex);
                    this._renderItems([selectedItem])
                }
            },
            _renderList: function() {
                this._$list = $("<div>").addClass(SLIDEOUT_MENU).prependTo(this._wrapper);
                this._renderItemClickAction();
                var list = this._$list.dxList().dxList("instance");
                this._$list.dxList({
                    _templates: this.option("_templates"),
                    itemTemplateProperty: "menuTemplate",
                    height: "100%",
                    indicateLoading: false,
                    itemClickAction: $.proxy(this._handleListItemClick, this),
                    items: this.option("items"),
                    dataSource: this.option("dataSource"),
                    itemRender: this.option("menuItemRender"),
                    itemTemplate: this._getTemplateByOption("menuItemTemplate"),
                    grouped: this.option("menuGrouped"),
                    groupTemplate: this.option("menuGroupTemplate"),
                    groupRender: this.option("menuGroupRender")
                })
            },
            _handleListItemClick: function(e) {
                var selectedIndex = this._$list.find(".dx-list-item").index(e.itemElement);
                this.option("selectedIndex", selectedIndex);
                this._itemClickAction(e)
            },
            _handleItemClick: $.noop,
            _renderItemClickAction: function() {
                this._itemClickAction = this._createActionByOption("itemClickAction")
            },
            _renderItem: function(index, item, container) {
                this._$container.find("." + SLIDEOUT_ITEM_CLASS).remove();
                this.callBase(index, item, this._$container)
            },
            _renderSelectedIndex: function() {
                this._renderContent()
            },
            _initSwipeHandlers: function() {
                this._$container.dxSwipeable({
                    elastic: false,
                    itemSizeFunc: $.proxy(this._getListWidth, this),
                    startAction: $.proxy(this.option("swipeEnabled") ? this._handleSwipeStart : function(e) {
                        e.jQueryEvent.cancel = true
                    }, this),
                    updateAction: $.proxy(this._handleSwipeUpdate, this),
                    endAction: $.proxy(this._handleSwipeEnd, this)
                })
            },
            _handleSwipeStart: function(e) {
                this._$shield.addClass(INVISIBLE_STATE_CLASS);
                fx.stop(this._$container);
                var menuVisible = this.option("menuVisible"),
                    rtl = this.option("rtlEnabled");
                e.jQueryEvent.maxLeftOffset = rtl ? !menuVisible : menuVisible;
                e.jQueryEvent.maxRightOffset = rtl ? menuVisible : !menuVisible
            },
            _handleSwipeUpdate: function(e) {
                var offset = this.option("menuVisible") ? e.jQueryEvent.offset + 1 * this._getRTLSignCorrection() : e.jQueryEvent.offset;
                offset *= this._getRTLSignCorrection();
                this._renderPosition(offset, false)
            },
            _handleSwipeEnd: function(e) {
                var targetOffset = e.jQueryEvent.targetOffset * this._getRTLSignCorrection() + this.option("menuVisible"),
                    menuVisible = targetOffset !== 0;
                if (this.option("menuVisible") === menuVisible)
                    this._renderPosition(this.option("menuVisible"), true);
                else
                    this.option("menuVisible", targetOffset !== 0)
            },
            _handleMenuButtonClick: function() {
                this.option("menuVisible", !this.option("menuVisible"))
            },
            _toggleMenuVisibility: function(visible, animate) {
                this.option("menuVisible", visible)
            },
            _renderPosition: function(offset, animate) {
                var pos = this._calculatePixelOffset(offset) * this._getRTLSignCorrection();
                if (animate) {
                    this._$shield.addClass(INVISIBLE_STATE_CLASS);
                    fx.animate(this._$container, {
                        type: "slide",
                        to: {left: pos},
                        duration: ANIMATION_DURATION,
                        complete: $.proxy(this._handleAnimationComplete, this)
                    })
                }
                else
                    translator.move(this._$container, {left: pos})
            },
            _calculatePixelOffset: function(offset) {
                var offset = offset || 0,
                    maxOffset = this._getListWidth();
                return offset * maxOffset
            },
            _getListWidth: function() {
                if (!this._listWidth) {
                    var listWidth = this._$list.width(),
                        elementWidth = this._element().width() - CONTENT_OFFSET;
                    this._listWidth = Math.min(elementWidth, listWidth)
                }
                return this._listWidth
            },
            _clearListWidthCache: function() {
                delete this._listWidth
            },
            _getRTLSignCorrection: function() {
                return this.option("rtlEnabled") ? -1 : 1
            },
            _changeMenuOption: function(name, value) {
                this._$list.dxList("instance").option(name, value);
                this._clearListWidthCache()
            },
            _visibilityChanged: function(visible) {
                if (visible)
                    this._dimensionChanged()
            },
            _optionChanged: function(name, value, prevValue) {
                switch (name) {
                    case"menuVisible":
                        this._renderPosition(value, true);
                        break;
                    case"swipeEnabled":
                        this._initSwipeHandlers();
                        break;
                    case"menuItemRender":
                        this._changeMenuOption("itemRender", value);
                        break;
                    case"menuItemTemplate":
                        this._changeMenuOption("itemTemplate", value);
                        break;
                    case"items":
                    case"dataSource":
                        this._changeMenuOption(name, value);
                        break;
                    case"menuGrouped":
                        this._changeMenuOption("grouped", value);
                        break;
                    case"menuGroupRender":
                        this._changeMenuOption("groupRender", value);
                        break;
                    case"menuGroupTemplate":
                        this._changeMenuOption("groupTemplate", value);
                        break;
                    case"itemClickAction":
                        this._renderItemClickAction();
                        break;
                    case"rtlEnabled":
                        this.callBase.apply(this, arguments);
                        this._renderPosition(this.option("menuVisible"), false);
                        break;
                    default:
                        this.callBase(name, value, prevValue)
                }
            },
            _toggleShieldVisibility: function() {
                this._$shield.toggleClass(INVISIBLE_STATE_CLASS, !this.option("menuVisible"))
            },
            _handleAnimationComplete: function() {
                this._toggleShieldVisibility();
                if (this._deferredAnimate)
                    this._deferredAnimate.resolveWith(this)
            },
            showMenu: function() {
                return this.toggleMenuVisibility(true)
            },
            hideMenu: function() {
                return this.toggleMenuVisibility(false)
            },
            toggleMenuVisibility: function(showing) {
                showing = showing === undefined ? !this.option("menuVisible") : showing;
                this._deferredAnimate = $.Deferred();
                this.option("menuVisible", showing);
                return this._deferredAnimate.promise()
            }
        }))
    })(jQuery, DevExpress);
    DevExpress.MOD_WIDGETS_MOBILE = true
}