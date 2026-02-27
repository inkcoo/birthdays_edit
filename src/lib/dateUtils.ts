// @ts-ignore - lunar-javascript 没有类型定义
import { Solar, Lunar } from 'lunar-javascript';
import { BirthdayRecord, TodayBirthday } from '@/types';

/**
 * 获取当前公历日期
 */
export function getGregorianToday(): { month: number; day: number } {
  const now = new Date();
  return {
    month: now.getMonth() + 1,
    day: now.getDate()
  };
}

/**
 * 获取当前农历日期
 */
export function getLunarToday(): { month: number; day: number } {
  const now = new Date();
  const lunar = Solar.fromDate(now).getLunar();
  return {
    month: lunar.getMonth(),
    day: lunar.getDay()
  };
}

/**
 * 筛选今日生日人员
 */
export function filterTodayBirthdays(records: BirthdayRecord[]): TodayBirthday[] {
  const gregorianToday = getGregorianToday();
  const lunarToday = getLunarToday();
  
  const todayBirthdays: TodayBirthday[] = [];
  
  for (const record of records) {
    const recordMonth = parseInt(record.month, 10);
    const recordDay = parseInt(record.day, 10);
    
    if (isNaN(recordMonth) || isNaN(recordDay)) continue;
    
    const isLunar = record.type === 'b';
    
    // 匹配日期
    let isMatch = false;
    if (isLunar) {
      // 农历生日匹配农历今日
      isMatch = recordMonth === lunarToday.month && recordDay === lunarToday.day;
    } else {
      // 公历生日匹配公历今日
      isMatch = recordMonth === gregorianToday.month && recordDay === gregorianToday.day;
    }
    
    if (isMatch) {
      todayBirthdays.push({
        name: record.name,
        type: record.type,
        department: record.department,
        isLunar
      });
    }
  }
  
  return todayBirthdays;
}

/**
 * 将公历日期转换为农历
 */
export function gregorianToLunar(year: number, month: number, day: number): { lunarMonth: number; lunarDay: number; lunarYear: number } {
  const solar = Solar.fromYmd(year, month, day);
  const lunar = solar.getLunar();
  return {
    lunarYear: lunar.getYear(),
    lunarMonth: lunar.getMonth(),
    lunarDay: lunar.getDay()
  };
}

/**
 * 将农历日期转换为公历（近似）
 */
export function lunarToGregorian(lunarYear: number, lunarMonth: number, lunarDay: number): Date | null {
  try {
    const lunar = Lunar.fromYmd(lunarYear, lunarMonth, lunarDay);
    return lunar.getSolar().getJavaDate();
  } catch {
    return null;
  }
}
