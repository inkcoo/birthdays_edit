export const runtime = 'edge';

import { NextRequest, NextResponse } from 'next/server';

const BIRTHDAYS_KEY = 'birthdays.txt';
const API_KEY_STORAGE_KEY = 'api_secret_key';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const apiKey = searchParams.get('m');

    const kv = (globalThis as any).BIRTHDAYS_KV;
    
    if (!kv) {
      console.error('BIRTHDAYS_KV 未绑定');
      return new NextResponse('存储配置错误', { 
        status: 500,
        headers: { 'Content-Type': 'text/plain; charset=utf-8' }
      });
    }

    if (!apiKey) {
      return new NextResponse('缺少 API 密钥 (m 参数)', { 
        status: 401,
        headers: { 'Content-Type': 'text/plain; charset=utf-8' }
      });
    }

    const storedKey = await kv.get(API_KEY_STORAGE_KEY, 'text');
    
    if (!storedKey) {
      return new NextResponse('API 密钥未配置', { 
        status: 401,
        headers: { 'Content-Type': 'text/plain; charset=utf-8' }
      });
    }

    if (apiKey !== storedKey) {
      return new NextResponse('无效的 API 密钥', { 
        status: 403,
        headers: { 'Content-Type': 'text/plain; charset=utf-8' }
      });
    }

    const text = await kv.get(BIRTHDAYS_KEY, 'text');
    
    return new NextResponse(text || '', {
      headers: { 
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache'
      }
    });
  } catch (error) {
    console.error('获取生日记录失败:', error);
    return new NextResponse('获取失败', { 
      status: 500,
      headers: { 'Content-Type': 'text/plain; charset=utf-8' }
    });
  }
}
