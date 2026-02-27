export const runtime = 'edge';

import { NextRequest, NextResponse } from 'next/server';
import { verifySession } from '@/lib/session';

const BIRTHDAYS_KEY = 'birthdays.txt';

async function isAuthenticated(request: NextRequest): Promise<boolean> {
  const token = request.cookies.get('auth_token')?.value;
  if (!token) return false;
  
  const payload = await verifySession(token);
  return payload !== null;
}

export async function GET(request: NextRequest) {
  try {
    const isAuth = await isAuthenticated(request);
    if (!isAuth) {
      return NextResponse.json({ error: '未授权访问' }, { status: 401 });
    }

    const kv = (globalThis as any).BIRTHDAYS_KV;
    
    if (!kv) {
      console.error('BIRTHDAYS_KV 未绑定');
      return NextResponse.json({ error: '存储配置错误' }, { status: 500 });
    }

    const text = await kv.get(BIRTHDAYS_KEY, 'text');
    
    return new NextResponse(text || '', {
      headers: { 'Content-Type': 'text/plain; charset=utf-8' }
    });
  } catch (error) {
    console.error('获取生日记录失败:', error);
    return NextResponse.json({ error: '获取失败' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const isAuth = await isAuthenticated(request);
    if (!isAuth) {
      return NextResponse.json({ error: '未授权访问' }, { status: 401 });
    }

    const text = await request.text();

    const kv = (globalThis as any).BIRTHDAYS_KV;
    
    if (!kv) {
      console.error('BIRTHDAYS_KV 未绑定');
      return NextResponse.json({ error: '存储配置错误' }, { status: 500 });
    }

    await kv.put(BIRTHDAYS_KEY, text);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('更新生日记录失败:', error);
    return NextResponse.json({ error: '更新失败' }, { status: 500 });
  }
}
