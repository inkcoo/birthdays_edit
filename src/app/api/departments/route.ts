export const runtime = 'edge';

import { NextRequest, NextResponse } from 'next/server';
import { verifySession } from '@/lib/session';
import { parseBirthdaysText, toBirthdaysText, extractDepartments, removeDepartment } from '@/lib/parser';

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
      return NextResponse.json({ error: '存储配置错误' }, { status: 500 });
    }

    const text = await kv.get(BIRTHDAYS_KEY, 'text') || '';
    const records = parseBirthdaysText(text);
    const departments = extractDepartments(records);

    return NextResponse.json({ departments });
  } catch (error) {
    console.error('获取部门列表失败:', error);
    return NextResponse.json({ error: '获取失败' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const isAuth = await isAuthenticated(request);
    if (!isAuth) {
      return NextResponse.json({ error: '未授权访问' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const departmentName = searchParams.get('name');

    if (!departmentName) {
      return NextResponse.json({ error: '部门名称不能为空' }, { status: 400 });
    }

    const kv = (globalThis as any).BIRTHDAYS_KV;
    
    if (!kv) {
      return NextResponse.json({ error: '存储配置错误' }, { status: 500 });
    }

    const text = await kv.get(BIRTHDAYS_KEY, 'text') || '';
    const records = parseBirthdaysText(text);
    const updatedRecords = removeDepartment(records, departmentName);
    const updatedText = toBirthdaysText(updatedRecords);

    await kv.put(BIRTHDAYS_KEY, updatedText);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('删除部门失败:', error);
    return NextResponse.json({ error: '删除失败' }, { status: 500 });
  }
}
