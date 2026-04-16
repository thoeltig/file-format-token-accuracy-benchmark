
export function calcDriftPerc(avg: number, val: number): number{
    return ToPercentage((val - avg) / avg);
}

export function ToPercentage(value: number): number {
    return roundTo2Digits(value*100);
}

export function roundTo2Digits(value: number): number {
    return value !== 0 ? Math.round(value*100)/100 : 0;
}

export function roundTo3Digits(value: number): number {
    return value !== 0 ? Math.round(value*1000)/1000 : 0;
}