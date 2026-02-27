import { NextRequest, NextResponse } from 'next/server';
import { verifySession } from '@/lib/session';
import { parseBirthdaysText } from '@/lib/parser';
import { filterTodayBirthdays } from '@/lib/dateUtils';

const BIRTHDAYS_KEY = 'birthdays.txt';

/**
 * 验证登录状态
 */
async function isAuthenticated(request: NextRequest): Promise<boolean> {
  const token = request.cookies.get('auth_token')?.value;
  if (!token) return false;
  
  const payload = await verifySession(token);
  return payload !== null;
}

/**
 * GET - 获取今日生日人员
 */
export async function GET(request: NextRequest) {
  try {
    const isAuth = await isAuthenticated(request);
    if (!isAuth) {
      return NextResponse.json({ error: '未授权访问' }, { status: 401 });
    }

    // @ts-ignore - Cloudflare KV binding
    const kv = (globalThis as any).BIRTHDAYS_KV;
    
    if (!kv) {
      return NextResponse.json({ error: '存储配置错误' }, { status: 500 });
    }

    const text = await kv.get(BIRTHDAYS_KEY, 'text') || '';
    const records = parseBirthdaysText(text);
    const todayBirthdays = filterTodayBirthdays(records);

    return NextResponse.json({ 
      today: todayBirthdays,
      date: new Date().toISOString().split('T')[0]
    });
  } catch (error) {
    console.error('获取今日生日失败:', error);
    return NextResponse.json({ error: '获取失败' }, { status: 500 });
  }
}
