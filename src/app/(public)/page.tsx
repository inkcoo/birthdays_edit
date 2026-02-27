export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="max-w-2xl mx-auto px-4 text-center">
        <h1 className="text-4xl font-bold text-gray-800 mb-6">
          生日记录管理平台
        </h1>
        <p className="text-lg text-gray-600 mb-8">
          管理生日记录，查看当日生日，支持农历/公历
        </p>
        
        <div className="space-y-4">
          <a
            href="/admin"
            className="inline-block bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors"
          >
            管理后台
          </a>
          
          <div className="mt-8 p-6 bg-white rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">公开 API</h2>
            <p className="text-gray-600 mb-4">
              以下接口需要 API 密钥访问
            </p>
            <div className="text-left space-y-2">
              <div className="p-3 bg-gray-50 rounded font-mono text-sm">
                <span className="text-green-600">GET</span> /api/public/birthdays?m=密钥
                <p className="text-gray-500 mt-1">返回纯文本格式的 birthdays.txt 内容</p>
              </div>
            </div>
            <p className="text-sm text-gray-500 mt-4">
              请在管理后台生成或查看 API 密钥
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
