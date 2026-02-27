export const runtime = 'edge';

import { NextRequest, NextResponse } from 'next/server';
import { verifySession } from '@/lib/session';
import { generateApiKey } from '@/lib/apiKey';

const API_KEY_STORAGE_KEY = 'api_secret_key';

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

    const apiKey = await kv.get(API_KEY_STORAGE_KEY, 'text');
    
    return NextResponse.json({ 
      apiKey: apiKey || null,
      endpoint: apiKey ? `/api/public/birthdays?m=${apiKey}` : null
    });
  } catch (error) {
    console.error('获取 API 密钥失败:', error);
    return NextResponse.json({ error: '获取失败' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const isAuth = await isAuthenticated(request);
    if (!isAuth) {
      return NextResponse.json({ error: '未授权访问' }, { status: 401 });
    }

    const kv = (globalThis as any).BIRTHDAYS_KV;
    
    if (!kv) {
      return NextResponse.json({ error: '存储配置错误' }, { status: 500 });
    }

    const body = await request.json();
    const { customKey } = body;

    let newApiKey: string;

    if (customKey) {
      if (!/^[a-zA-Z0-9]{16}$/.test(customKey)) {
        return NextResponse.json({ 
          error: '密钥必须是 16 位字母数字组合' 
        }, { status: 400 });
      }
      newApiKey = customKey;
    } else {
      newApiKey = generateApiKey();
    }

    await kv.put(API_KEY_STORAGE_KEY, newApiKey);

    return NextResponse.json({ 
      success: true,
      apiKey: newApiKey,
      endpoint: `/api/public/birthdays?m=${newApiKey}`
    });
  } catch (error) {
    console.error('生成 API 密钥失败:', error);
    return NextResponse.json({ error: '生成失败' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const isAuth = await isAuthenticated(request);
    if (!isAuth) {
      return NextResponse.json({ error: '未授权访问' }, { status: 401 });
    }

    const kv = (globalThis as any).BIRTHDAYS_KV;
    
    if (!kv) {
      return NextResponse.json({ error: '存储配置错误' }, { status: 500 });
    }

    await kv.delete(API_KEY_STORAGE_KEY);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('删除 API 密钥失败:', error);
    return NextResponse.json({ error: '删除失败' }, { status: 500 });
  }
}
