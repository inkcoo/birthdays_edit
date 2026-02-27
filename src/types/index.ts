export interface BirthdayRecord {
  name: string;
  year?: string;
  month: string;
  day: string;
  type: string; // 'a' = 公历，'b' = 农历
  department?: string;
  originalLine: string;
}

export interface Department {
  name: string;
  count: number;
}

export interface TodayBirthday {
  name: string;
  type: string;
  department?: string;
  isLunar: boolean;
}
