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
    Serializer = require("montage/core/serializer").Serializer,
    Deserializer = require("montage/core/deserializer").Deserializer,
    TestPageLoader = require("support/testpageloader").TestPageLoader;

var stripPP = function stripPrettyPrintting(str) {
    return str.replace(/\n\s*/g, "");
};

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

    function testSerializer(object, callback) {
        var serializer = Serializer.create().initWithRequire(require),
            objects;

        testDeserializer(object, function(o) {
            objects = o;
            waits(10); // wait for messages to be resolved
            runs(function() {
                var serialization = serializer.serializeObject(objects.target);
                callback(stripPP(serialization));
            });
        });
    }

    describe("core/localizer/serialization-spec", function() {
        describe("Message", function() {
            it("localizes the message", function() {
                expect(test.message.localized).toBe("Welcome to the site, World");
            });

            it("does not serialize the default localizer", function() {
                testSerializer({
                    target: {
                        prototype: "montage/core/localizer[Message]",
                        properties: {
                            key: "hello"
                        }
                    }
                }, function(serialization) {
                    expect(serialization).not.toContain("localizer");
                });
            });

            it("serializes an non-default localizer", function() {
                testSerializer({
                    localizer: {
                        prototype: "montage/core/localizer",
                        properties: {
                            locale: "en-x-test"
                        }
                    },
                    target: {
                        prototype: "montage/core/localizer[Message]",
                        properties: {
                            key: "hello",
                            localizer: {"@": "localizer"}
                        }
                    }
                }, function(serialization) {
                    expect(serialization).toBe('{"localizer":{"prototype":"montage/core/localizer","properties":{"locale":"en-x-test"}},"root":{"value":{"key":"hello","localizer":{"@":"localizer"}}}}');
                });
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

            it("accepts a binding for the default message", function() {
                testDeserializer({
                    source: {
                        value: {value: "Hello, {name}"}
                    },
                    target: {
                        prototype: "montage",
                        localizations: {
                            "value": {
                                "_": "", // key is required
                                "_default": {"<-": "@source.value"},
                                "name": "someone"
                            }
                        }
                    }
                }, function(objects) {
                    waits(10); // wait for promise to be resolved
                    runs(function() {
                        expect(objects.target.value).toBe("Hello, someone");
                        objects.source.value = "Goodbye, {name}";
                    });
                    // messages get localized asynchronously, so need to wait
                    // until next tick
                    waits(10);
                    runs(function() {
                        expect(objects.target.value).toBe("Goodbye, someone");
                    });
                });
            });

            describe("serializer", function() {
                var objects,
                    serializer;

                beforeEach(function() {
                    testDeserializer({
                        source: {
                            value: {x: "Hello, {name}"}
                        },
                        target: {
                            prototype: "montage",
                            localizations: {
                                "binding": {
                                    "_": "", // key is required
                                    "_default": {"<-": "@source.value"},
                                    "name": "someone"
                                },
                                "message": {
                                    "_": "", // key is required
                                    "_default": "Hello",
                                }
                            }
                        }
                    }, function(o) {
                        objects = o;
                    });

                    serializer = Serializer.create().initWithRequire(require);
                });

                it("doesn't create a localizations block when there are none", function() {
                    testSerializer({
                        source: {
                            value: {value: "Hello", identifier: "source"}
                        },
                        target: {
                            prototype: "montage",
                            bindings: {
                                "test": {"<-": "@source.value"}
                            }
                        }
                    }, function(serialization) {
                        expect(serialization).not.toContain("localizations");
                    });
                });

                it("serializes simple localization strings", function() {
                    testSerializer({
                        target: {
                            prototype: "montage",
                            localizations: {
                                "message": {
                                    "_": "hello", // key is required
                                    "_default": "Hello"
                                }
                            }
                        }
                    }, function(serialization) {
                        expect(serialization).toBe('{"root":{"prototype":"montage/core/core[Montage]","properties":{},"localizations":{"message":{"_":"hello","_default":"Hello"}}}}');
                    });
                });

                it("serializes default message binding", function() {
                    testSerializer({
                        source: {
                            value: {value: "Hello, {name}", identifier: "source"}
                        },
                        target: {
                            prototype: "montage",
                            localizations: {
                                "binding": {
                                    "_": "", // key is required
                                    "_default": {"<-": "@source.value"},
                                    "name": "someone"
                                }
                            }
                        }
                    }, function(serialization) {
                        expect(serialization).toBe('{"root":{"prototype":"montage/core/core[Montage]","properties":{},"localizations":{"binding":{"_":"","_default":{"<-":"@source.value"},"name":"someone"}}},"source":{}}');
                    });
                });

                it("serializes data binding", function() {
                    testSerializer({
                        source: {
                            value: {value: "World", identifier: "source"}
                        },
                        target: {
                            prototype: "montage",
                            localizations: {
                                "binding": {
                                    "_": "", // key is required
                                    "_default": "Hello, {name}",
                                    "name": {"<-": "@source.value"}
                                }
                            }
                        }
                    }, function(serialization) {
                        expect(serialization).toBe('{"root":{"prototype":"montage/core/core[Montage]","properties":{},"localizations":{"binding":{"_":"","_default":"Hello, {name}","name":{"<-":"@source.value"}}}},"source":{}}');
                    });
                });
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
