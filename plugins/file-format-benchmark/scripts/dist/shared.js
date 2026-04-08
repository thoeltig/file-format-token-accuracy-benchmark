"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.roundTo3Digits = exports.roundTo2Digits = exports.ToPercentage = exports.calcDriftPerc = void 0;
function calcDriftPerc(avg, val) {
    return ToPercentage((val - avg) / avg);
}
exports.calcDriftPerc = calcDriftPerc;
function ToPercentage(value) {
    return roundTo2Digits(value * 100);
}
exports.ToPercentage = ToPercentage;
function roundTo2Digits(value) {
    return value > 0 ? Math.round(value * 100) / 100 : 0;
}
exports.roundTo2Digits = roundTo2Digits;
function roundTo3Digits(value) {
    return value > 0 ? Math.round(value * 1000) / 1000 : 0;
}
exports.roundTo3Digits = roundTo3Digits;
