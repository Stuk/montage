/*global require,exports,describe,it,expect,waits,runs */
var Montage = require("montage").Montage,
    TestPageLoader = require("support/testpageloader").TestPageLoader,
    ActionEventListener = require("montage/core/event/action-event-listener").ActionEventListener;

var testPage = TestPageLoader.queueTest("drag-composer-test", function() {
    var test = testPage.test;

    describe("ui/composer/drag-composer-spec", function() {

    });
});
