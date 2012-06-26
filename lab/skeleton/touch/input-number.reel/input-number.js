/* <copyright>
 This file contains proprietary software owned by Motorola Mobility, Inc.<br/>
 No rights, expressed or implied, whatsoever to this software are provided by Motorola Mobility, Inc. hereunder.<br/>
 (c) Copyright 2012 Motorola Mobility, Inc.  All Rights Reserved.
 </copyright> */
/*global require,exports */
var Montage = require("montage").Montage,
    Component = require("ui/component").Component;

/**
 * The input type="number"
 */
var InputNumber = exports.InputNumber = Montage.create(Component, {

   draw: {
       value: function() {
           // Just for now
           this._element.querySelector(".montage-InputNumber-plus").innerText = "+";
           this._element.querySelector(".montage-InputNumber-minus").innerText = "-";
       }
   }

});
