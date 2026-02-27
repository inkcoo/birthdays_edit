import '@/app/globals.css';

export const metadata = {
  title: '生日记录管理平台',
  description: '管理和查看生日记录',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
