/**
    @module "ui/contact.reel"
    @requires montage
    @requires montage/ui/component
*/
var Montage = require("montage").Montage,
    Component = require("montage/ui/component").Component,
    DragComposer = require("montage/ui/composer/drag-composer").DragComposer;

/**
    Description TODO
    @class module:"ui/contact.reel".Contact
    @extends module:montage/ui/component.Component
*/
exports.Contact = Montage.create(Component, /** @lends module:"ui/contact.reel".Contact# */ {

    _dragComposer: {
        value: null
    },

    didCreate: {
        value: function() {
            this._dragComposer = DragComposer.create();
            this.addComposer(this._dragComposer);
        }
    },

    init: {
        value: function(name, email, telephone) {
            this.name = name;
            this.email = email;
            this.telephone = telephone;

            return this;
        }
    },

    name: {
        value: null
    },
    email: {
        value: null
    },
    telephone: {
        value: null
    }

});
