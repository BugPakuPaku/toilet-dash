export function floorNumberToString(floorNumber: number) {
  return floorNumber.toString() + "階";
}

export function floorStringToNumber(floorString: string) {
  let floorStringNumber: string = floorString.substring(0, floorString.length - 1);

  return parseInt(floorString);
}