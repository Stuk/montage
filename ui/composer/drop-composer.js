/*global require, exports*/
/**
	@module montage/ui/composer/drop-composer
    @requires montage
    @requires montage/ui/composer/composer
    @requires montage/core/event/mutable-event
*/
var Montage = require("montage").Montage,
    Composer = require("ui/composer/composer").Composer,
    MutableEvent = require("core/event/mutable-event").MutableEvent;
/**
    @class module:montage/ui/composer/drop-composer.DropComposer
    @extends module:montage/ui/composer/composer.Composer
    @fires pressStart
    @fires press
    @fires longPress
    @fires pressCancel
*/
var DropComposer = exports.DropComposer = Montage.create(Composer,/** @lends module:montage/ui/composer/drop-composer.DropComposer# */ {

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
