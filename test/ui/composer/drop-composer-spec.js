/*global require,exports,describe,it,expect,waits,runs */
var Montage = require("montage").Montage,
    TestPageLoader = require("support/testpageloader").TestPageLoader,
    ActionEventListener = require("montage/core/event/action-event-listener").ActionEventListener;

var testPage = TestPageLoader.queueTest("drop-composer-test", function() {
    var test = testPage.test;

    describe("ui/composer/drop-composer-spec", function() {

    });
});
