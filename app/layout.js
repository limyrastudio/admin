import './admin.css';

export const metadata = { title: 'Admin · Limyra Studio' };

export default function RootLayout({ children }) {
  return (
    <html lang="tr">
      <body>{children}</body>
    </html>
  );
}
