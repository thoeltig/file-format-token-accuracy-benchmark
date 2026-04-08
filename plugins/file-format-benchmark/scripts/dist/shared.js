"use strict";
function calcDriftPerc(avg, val) {
    return ToPercentage((val - avg) / avg);
}
function ToPercentage(value) {
    return roundTo2Digits(value * 100);
}
function roundTo2Digits(value) {
    return value > 0 ? Math.round(value * 100) / 100 : 0;
}
function roundTo3Digits(value) {
    return value > 0 ? Math.round(value * 1000) / 1000 : 0;
}
