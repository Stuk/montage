/*global require, exports*/
/**
	@module montage/ui/composer/drag-composer
    @requires montage
    @requires montage/ui/composer/composer
    @requires montage/core/event/mutable-event
*/
var Montage = require("montage").Montage,
    Composer = require("ui/composer/composer").Composer,
    MutableEvent = require("core/event/mutable-event").MutableEvent;
/**
    @class module:montage/ui/composer/drag-composer.DragComposer
    @extends module:montage/ui/composer/composer.Composer
    @fires pressStart
    @fires press
    @fires longPress
    @fires pressCancel
*/
var DragComposer = exports.DragComposer = Montage.create(Composer,/** @lends module:montage/ui/composer/drag-composer.DragComposer# */ {

    // Load/unload

    load: {
        value: function() {

        }
    },

    unload: {
        value: function() {

        }
    }
});
