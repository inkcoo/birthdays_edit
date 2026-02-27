import { BirthdayRecord } from '@/types';

/**
 * 解析 birthdays.txt 文本内容为生日记录数组
 * 支持四种格式:
 * 1. 姓名 - 年 - 月-日-类型 (带年份不带部门)
 * 2. 姓名 - 月-日-类型 (不带年份不带部门)
 * 3. 姓名 - 月-日-类型-部门 (不带年份带部门)
 * 4. 姓名 - 年 - 月-日-类型-部门 (带年份带部门)
 */
export function parseBirthdaysText(text: string): BirthdayRecord[] {
  const records: BirthdayRecord[] = [];
  const lines = text.split('\n').filter(line => line.trim() !== '');

  for (const line of lines) {
    const parts = line.split('-').map(p => p.trim());
    
    if (parts.length < 4) continue;

    const record: BirthdayRecord = {
      name: parts[0],
      month: '',
      day: '',
      type: '',
      originalLine: line
    };

    // 判断格式：检查是否有年份（数字且长度>=4）
    const secondPart = parts[1];
    const isYear = /^\d{4}$/.test(secondPart);

    if (isYear) {
      // 带年份的格式
      record.year = secondPart;
      record.month = parts[2];
      record.day = parts[3];
      record.type = parts[4] || '';
      
      // 检查是否有部门
      if (parts.length >= 6) {
        record.department = parts[5];
      }
    } else {
      // 不带年份的格式
      record.month = secondPart;
      record.day = parts[2];
      record.type = parts[3] || '';
      
      // 检查是否有部门
      if (parts.length >= 5) {
        record.department = parts[4];
      }
    }

    records.push(record);
  }

  return records;
}

/**
 * 将生日记录数组转换回文本格式
 */
export function toBirthdaysText(records: BirthdayRecord[]): string {
  return records.map(record => {
    const parts = [record.name];
    
    if (record.year) {
      parts.push(record.year);
    }
    
    parts.push(record.month, record.day, record.type);
    
    if (record.department) {
      parts.push(record.department);
    }
    
    return parts.join('-');
  }).join('\n');
}

/**
 * 提取所有部门列表
 */
export function extractDepartments(records: BirthdayRecord[]): { name: string; count: number }[] {
  const deptMap = new Map<string, number>();
  
  for (const record of records) {
    if (record.department) {
      deptMap.set(record.department, (deptMap.get(record.department) || 0) + 1);
    }
  }
  
  return Array.from(deptMap.entries()).map(([name, count]) => ({ name, count }));
}

/**
 * 删除指定部门的所有记录
 */
export function removeDepartment(records: BirthdayRecord[], departmentName: string): BirthdayRecord[] {
  return records.filter(record => record.department !== departmentName);
}

/**
 * 添加新记录
 */
export function addRecord(records: BirthdayRecord[], newRecord: Omit<BirthdayRecord, 'originalLine'>): BirthdayRecord[] {
  const originalLine = [
    newRecord.name,
    newRecord.year,
    newRecord.month,
    newRecord.day,
    newRecord.type,
    newRecord.department
  ].filter(Boolean).join('-');
  
  return [...records, { ...newRecord, originalLine }];
}

/**
 * 更新记录
 */
export function updateRecord(
  records: BirthdayRecord[], 
  originalLine: string, 
  updatedRecord: Omit<BirthdayRecord, 'originalLine'>
): BirthdayRecord[] {
  const newOriginalLine = [
    updatedRecord.name,
    updatedRecord.year,
    updatedRecord.month,
    updatedRecord.day,
    updatedRecord.type,
    updatedRecord.department
  ].filter(Boolean).join('-');
  
  return records.map(record => 
    record.originalLine === originalLine 
      ? { ...updatedRecord, originalLine: newOriginalLine }
      : record
  );
}

/**
 * 删除记录
 */
export function deleteRecord(records: BirthdayRecord[], originalLine: string): BirthdayRecord[] {
  return records.filter(record => record.originalLine !== originalLine);
}
