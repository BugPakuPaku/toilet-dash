'use client'

import React, { useEffect, useState } from 'react';
import { Timestamp } from 'firebase/firestore';
import { DateRange } from '@/types';
import { isTimestampInRange, createDateRange, isWeekend } from '@/util';

export const REST_TIMES: DateRange[] = [
  createDateRange(10, 30, 10, 40),
  createDateRange(12, 10, 13, 0),
  createDateRange(14, 30, 14, 40),
  createDateRange(16, 10, 16, 15)
];

export function isRestTime(nowTime: Timestamp): boolean {
  if (isWeekend(nowTime)) {
    return false;
  }

  return REST_TIMES.some(x => isTimestampInRange(nowTime, x));
}

export function isNowRestTime(): boolean {
  return isRestTime(Timestamp.now());
}

export function updateCrowdingLevel(crowdingLevel: number | undefined): number {
  if (! crowdingLevel) {
    crowdingLevel = 0;
  }
  
  if (isNowRestTime()) {
    return crowdingLevel + 10;
  } else {
    return crowdingLevel;
  }
}