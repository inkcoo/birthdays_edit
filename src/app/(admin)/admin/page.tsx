'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { BirthdayRecord, Department, TodayBirthday } from '@/types';

export default function AdminPage() {
  const [birthdaysText, setBirthdaysText] = useState('');
  const [originalText, setOriginalText] = useState('');
  const [departments, setDepartments] = useState<Department[]>([]);
  const [todayBirthdays, setTodayBirthdays] = useState<TodayBirthday[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [activeTab, setActiveTab] = useState<'today' | 'edit' | 'departments' | 'apikey'>('today');
  
  // API Key 状态
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [customKey, setCustomKey] = useState('');
  const [keyLoading, setKeyLoading] = useState(false);
  
  const router = useRouter();

  useEffect(() => {
    checkAuth();
    fetchData();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/birthdays');
      if (response.status === 401) {
        router.push('/login');
      }
    } catch {
      router.push('/login');
    }
  };

  const fetchData = async () => {
    try {
      const [birthdaysRes, deptRes, todayRes, apiKeyRes] = await Promise.all([
        fetch('/api/birthdays'),
        fetch('/api/departments'),
        fetch('/api/today'),
        fetch('/api/api-key'),
      ]);

      if (birthdaysRes.ok) {
        const text = await birthdaysRes.text();
        setBirthdaysText(text);
        setOriginalText(text);
      }

      if (deptRes.ok) {
        const data = await deptRes.json();
        setDepartments(data.departments || []);
      }

      if (todayRes.ok) {
        const data = await todayRes.json();
        setTodayBirthdays(data.today || []);
      }

      if (apiKeyRes.ok) {
        const data = await apiKeyRes.json();
        setApiKey(data.apiKey || null);
      }
    } catch (error) {
      console.error('获取数据失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage('');

    try {
      const response = await fetch('/api/birthdays', {
        method: 'PUT',
        headers: { 'Content-Type': 'text/plain' },
        body: birthdaysText,
      });

      if (response.ok) {
        setOriginalText(birthdaysText);
        setMessage('保存成功！');
        fetchData();
      } else {
        const data = await response.json();
        setMessage(data.error || '保存失败');
      }
    } catch {
      setMessage('网络错误，保存失败');
    } finally {
      setSaving(false);
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/login', { method: 'DELETE' });
    router.push('/');
  };

  const handleDeleteDepartment = async (deptName: string) => {
    if (!confirm(`确定要删除部门 "${deptName}" 及其所有记录吗？`)) return;

    try {
      const response = await fetch(`/api/departments?name=${encodeURIComponent(deptName)}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setMessage(`部门 "${deptName}" 已删除`);
        fetchData();
      } else {
        const data = await response.json();
        setMessage(data.error || '删除失败');
      }
    } catch {
      setMessage('网络错误，删除失败');
    }
    setTimeout(() => setMessage(''), 3000);
  };

  const handleGenerateApiKey = async () => {
    if (!confirm('确定要生成新的 API 密钥吗？旧密钥将立即失效。')) return;
    
    setKeyLoading(true);
    try {
      const response = await fetch('/api/api-key', { method: 'POST' });
      const data = await response.json();
      
      if (response.ok) {
        setApiKey(data.apiKey);
        setMessage('新 API 密钥已生成');
      } else {
        setMessage(data.error || '生成失败');
      }
    } catch {
      setMessage('网络错误，生成失败');
    }
    setKeyLoading(false);
    setTimeout(() => setMessage(''), 3000);
  };

  const handleSetCustomApiKey = async () => {
    if (customKey.length !== 16) {
      setMessage('密钥必须是 16 位字母数字组合');
      return;
    }
    
    setKeyLoading(true);
    try {
      const response = await fetch('/api/api-key', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customKey }),
      });
      const data = await response.json();
      
      if (response.ok) {
        setApiKey(data.apiKey);
        setCustomKey('');
        setMessage('自定义密钥已设置');
      } else {
        setMessage(data.error || '设置失败');
      }
    } catch {
      setMessage('网络错误，设置失败');
    }
    setKeyLoading(false);
    setTimeout(() => setMessage(''), 3000);
  };

  const handleDeleteApiKey = async () => {
    if (!confirm('确定要删除 API 密钥吗？公开 API 将无法访问。')) return;
    
    setKeyLoading(true);
    try {
      const response = await fetch('/api/api-key', { method: 'DELETE' });
      
      if (response.ok) {
        setApiKey(null);
        setMessage('API 密钥已删除');
      } else {
        const data = await response.json();
        setMessage(data.error || '删除失败');
      }
    } catch {
      setMessage('网络错误，删除失败');
    }
    setKeyLoading(false);
    setTimeout(() => setMessage(''), 3000);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-xl">加载中...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* 顶部导航 */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-800">生日记录管理</h1>
            </div>
            <div className="flex items-center space-x-4">
              <a href="/" target="_blank" className="text-blue-600 hover:text-blue-800">
                公开 API
              </a>
              <button
                onClick={handleLogout}
                className="text-red-600 hover:text-red-800"
              >
                退出登录
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* 主内容区 */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 消息提示 */}
        {message && (
          <div className={`mb-4 p-3 rounded-md ${message.includes('成功') || message.includes('已删除') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            {message}
          </div>
        )}

        {/* 标签页 */}
        <div className="mb-6 border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('today')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'today'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              今日生日 ({todayBirthdays.length})
            </button>
            <button
              onClick={() => setActiveTab('edit')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'edit'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              编辑记录
            </button>
            <button
              onClick={() => setActiveTab('departments')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'departments'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              部门管理 ({departments.length})
            </button>
            <button
              onClick={() => setActiveTab('apikey')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'apikey'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              API 密钥
            </button>
          </nav>
        </div>

        {/* 今日生日 */}
        {activeTab === 'today' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">今日生日人员</h2>
            {todayBirthdays.length === 0 ? (
              <p className="text-gray-500">今日没有人员生日</p>
            ) : (
              <ul className="space-y-2">
                {todayBirthdays.map((person, index) => (
                  <li key={index} className="flex items-center justify-between py-2 border-b last:border-0">
                    <span className="font-medium">{person.name}</span>
                    <div className="text-sm text-gray-500">
                      <span className="mr-2">{person.isLunar ? '农历' : '公历'}</span>
                      {person.department && (
                        <span className="px-2 py-1 bg-gray-100 rounded text-xs">{person.department}</span>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {/* 编辑记录 */}
        {activeTab === 'edit' && (
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">编辑生日记录</h2>
              <button
                onClick={handleSave}
                disabled={saving || birthdaysText === originalText}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? '保存中...' : '保存'}
              </button>
            </div>
            <p className="text-sm text-gray-500 mb-4">
              格式：姓名 -[年]-月-日-类型 [-部门] | 类型：a=公历，b=农历
            </p>
            <textarea
              value={birthdaysText}
              onChange={(e) => setBirthdaysText(e.target.value)}
              className="w-full h-96 p-4 border border-gray-300 rounded-md font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="在此编辑生日记录..."
            />
            {birthdaysText !== originalText && (
              <p className="mt-2 text-sm text-orange-600">
                内容有未保存的修改
              </p>
            )}
          </div>
        )}

        {/* 部门管理 */}
        {activeTab === 'departments' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">部门列表</h2>
            {departments.length === 0 ? (
              <p className="text-gray-500">暂无部门</p>
            ) : (
              <ul className="space-y-2">
                {departments.map((dept) => (
                  <li key={dept.name} className="flex items-center justify-between py-2 border-b last:border-0">
                    <div>
                      <span className="font-medium">{dept.name}</span>
                      <span className="ml-2 text-sm text-gray-500">({dept.count} 人)</span>
                    </div>
                    <button
                      onClick={() => handleDeleteDepartment(dept.name)}
                      className="text-red-600 hover:text-red-800 text-sm"
                    >
                      删除部门
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {/* API 密钥管理 */}
        {activeTab === 'apikey' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">公开 API 密钥管理</h2>
            
            <div className="mb-6">
              <p className="text-sm text-gray-600 mb-2">
                公开 API 端点格式：<code className="bg-gray-100 px-2 py-1 rounded">/api/public/birthdays?m=密钥</code>
              </p>
              <p className="text-sm text-gray-500">
                密钥为 16 位字母数字组合，可随时重置或自定义
              </p>
            </div>

            {apiKey ? (
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">当前 API 端点</label>
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    readOnly
                    value={`/api/public/birthdays?m=${apiKey}`}
                    className="flex-1 px-4 py-2 bg-gray-50 border border-gray-300 rounded-md font-mono text-sm"
                  />
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(`/api/public/birthdays?m=${apiKey}`);
                      setMessage('已复制到剪贴板');
                      setTimeout(() => setMessage(''), 3000);
                    }}
                    className="px-3 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 text-sm"
                  >
                    复制
                  </button>
                </div>
                <p className="mt-2 text-sm text-green-600">
                  ✓ 已启用
                </p>
              </div>
            ) : (
              <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
                <p className="text-sm text-yellow-800">
                  ⚠ 未配置 API 密钥，公开 API 无法访问
                </p>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">快速操作</h3>
                <div className="flex space-x-3">
                  <button
                    onClick={handleGenerateApiKey}
                    disabled={keyLoading}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 text-sm"
                  >
                    {keyLoading ? '处理中...' : apiKey ? '重置密钥' : '生成密钥'}
                  </button>
                  {apiKey && (
                    <button
                      onClick={handleDeleteApiKey}
                      disabled={keyLoading}
                      className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 text-sm"
                    >
                      删除密钥
                    </button>
                  )}
                </div>
              </div>

              <div className="pt-4 border-t">
                <h3 className="text-sm font-medium text-gray-700 mb-2">自定义密钥</h3>
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={customKey}
                    onChange={(e) => setCustomKey(e.target.value.replace(/[^a-zA-Z0-9]/g, '').slice(0, 16))}
                    placeholder="输入 16 位字母数字"
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-md font-mono text-sm"
                    maxLength={16}
                  />
                  <button
                    onClick={handleSetCustomApiKey}
                    disabled={keyLoading || customKey.length !== 16}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 text-sm"
                  >
                    设置
                  </button>
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  当前已输入：{customKey.length}/16 位
                </p>
              </div>
            </div>

            <div className="mt-6 p-4 bg-gray-50 rounded-md">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Python 使用示例</h3>
              <pre className="text-xs text-gray-600 overflow-x-auto">
{`import requests

# 使用 API 密钥获取生日数据
url = "https://your-domain.pages.dev/api/public/birthdays?m=${apiKey || 'YOUR_API_KEY'}"
response = requests.get(url)
if response.status_code == 200:
    data = response.text
    print(data)`}
              </pre>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
