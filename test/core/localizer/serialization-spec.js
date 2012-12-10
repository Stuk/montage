/* <copyright>
Copyright (c) 2012, Motorola Mobility LLC.
All Rights Reserved.

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are met:

* Redistributions of source code must retain the above copyright notice,
  this list of conditions and the following disclaimer.

* Redistributions in binary form must reproduce the above copyright notice,
  this list of conditions and the following disclaimer in the documentation
  and/or other materials provided with the distribution.

* Neither the name of Motorola Mobility LLC nor the names of its
  contributors may be used to endorse or promote products derived from this
  software without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE
LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF
SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS
INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN
CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
POSSIBILITY OF SUCH DAMAGE.
</copyright> */
/*global require,exports,describe,beforeEach,it,expect,waits,waitsFor,runs */
var Montage = require("montage").Montage,
    Localizer = require("montage/core/localizer"),
    Promise = require("montage/core/promise").Promise,
    Deserializer = require("montage/core/deserializer").Deserializer,
    TestPageLoader = require("support/testpageloader").TestPageLoader;

var testPage = TestPageLoader.queueTest("fallback", {directory: module.directory}, function() {
    var test = testPage.test;

    function testDeserializer(object, callback) {
        var deserializer = Deserializer.create(),
            objects, latch;

        deserializer._require = require;
        deserializer.initWithObject(object).deserialize(function(objs) {
            latch = true;
            objects = objs;
        });

        waitsFor(function() { return latch; });
        runs(function() {
            callback(objects);
        });
    }

    describe("core/localizer/serialization-spec", function() {
        describe("Message", function() {
            it("localizes the message", function() {
                expect(test.message.localized).toBe("Welcome to the site, World");
            });
        });

        describe("localizations unit", function() {

            it("requires a key", function() {
                expect(test.missingKey.value).toBe("Pass");
            });

            it("localizes a string", function() {
                expect(test.basic.value).toBe("Pass.");
            });

            it("localizes a string and uses available resources", function() {
                expect(test.resources.value).toBe("Hello");
            });

            it("creates a binding from the localizer to the object", function() {
                expect(test.binding.value).toBe("Hello World");
                expect(test.binding._bindingDescriptors.value).toBeDefined();
                test.bindingInput.value = "Earth";
                expect(test.binding.value).toBe("Hello Earth");
            });

            it("can localize two properties", function() {
                expect(test.twoProperties.unpressedLabel).toBe("Off");
                expect(test.twoProperties.pressedLabel).toBe("On");
            });
        });

        describe("localizer localizeObjects", function() {
            it("only works on the localizer", function() {
                testDeserializer({
                    other: {
                        value: {x: "pass"}
                    },
                    localizer: {
                        prototype: "montage/core/converter/converter",
                        localizeObjects: [
                            {
                                object: {"@": "other"},
                                "properties": {
                                    x: "fail"
                                }
                            }
                        ]
                    }
                }, function(objects) {
                    waits(10); // wait for promise to be resolved
                    runs(function() {
                        expect(objects.other.x).toBe("pass");
                    });
                });
            });

            it("can set properties on any object", function() {
                testDeserializer({
                    other: {
                        value: {x: "fail"}
                    },
                    localizer: {
                        object: "montage/core/localizer",
                        localizeObjects: [
                            {
                                object: {"@": "other"},
                                "properties": {
                                    x: "pass"
                                }
                            }
                        ]
                    }
                }, function(objects) {
                    waits(10); // wait for promise to be resolved
                    runs(function() {
                        expect(objects.other.x).toBe("pass");
                    });
                });
            });
            it("uses the existing property value as a key", function() {
                testDeserializer({
                    other: {
                        value: {x: "pass"}
                    },
                    localizer: {
                        object: "montage/core/localizer",
                        localizeObjects: [
                            {
                                object: {"@": "other"},
                                "properties": {
                                    x: true
                                }
                            }
                        ]
                    }
                }, function(objects) {
                    waits(10); // wait for promise to be resolved
                    runs(function() {
                        expect(objects.other.x).toBe("pass");
                    });
                });
            });
        });
    });
});
