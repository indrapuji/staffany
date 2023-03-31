import Shift from '../database/default/entity/shift';

export const timeChecker = (shiftData: Shift[], body: any): boolean => {
  const arrayShiftData = [];
  shiftData.forEach((data: Shift) => {
    arrayShiftData.push({
      key: 'StartTime',
      value: data.startTime,
    });
    arrayShiftData.push({
      key: 'EndTime',
      value: data.endTime,
    });
  });
  arrayShiftData.push({
    key: 'StartTime',
    value: body.startTime,
  });
  arrayShiftData.push({
    key: 'EndTime',
    value: body.endTime,
  });
  arrayShiftData.sort((a, b) => a.value.localeCompare(b.value));
  let isError = false;
  for (let i = 0; i < arrayShiftData.length; i++) {
    let keyTemp = '';
    if (i % 2 === 0) {
      keyTemp = 'StartTime';
    } else {
      keyTemp = 'EndTime';
    }
    if (arrayShiftData[i].key !== keyTemp) {
      isError = true;
    }
    if (i % 2 === 0) {
      keyTemp = 'StartTime';
    } else {
      keyTemp = 'EndTime';
    }
  }
  return isError;
};
