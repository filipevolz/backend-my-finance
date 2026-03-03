"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dateOnlyToString = dateOnlyToString;
function dateOnlyToString(date) {
    if (date instanceof Date) {
        return date.toISOString().split('T')[0];
    }
    return date;
}
//# sourceMappingURL=dateOnlyToString.js.map