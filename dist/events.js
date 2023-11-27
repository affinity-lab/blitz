"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BLITZ_EVENTS = void 0;
const affinity_util_1 = require("@affinity-lab/affinity-util");
var BLITZ_EVENTS;
(function (BLITZ_EVENTS) {
    BLITZ_EVENTS["BEFORE_INSERT"] = "BEFORE_INSERT";
    BLITZ_EVENTS["AFTER_INSERT"] = "AFTER_INSERT";
    BLITZ_EVENTS["BEFORE_UPDATE"] = "BEFORE_UPDATE";
    BLITZ_EVENTS["AFTER_UPDATE"] = "AFTER_UPDATE";
    BLITZ_EVENTS["BEFORE_DELETE"] = "BEFORE_DELETE";
    BLITZ_EVENTS["AFTER_DELETE"] = "AFTER_DELETE";
    BLITZ_EVENTS["STORAGE_DESTROY"] = "STORAGE_DESTROY";
    BLITZ_EVENTS["STORAGE_DELETE"] = "STORAGE_DELETE";
})(BLITZ_EVENTS || (exports.BLITZ_EVENTS = BLITZ_EVENTS = {}));
(0, affinity_util_1.scopeEnum)(BLITZ_EVENTS, "BLITZ_EVENTS");
//# sourceMappingURL=events.js.map