import type { Metadata, Viewport } from 'next';
import ThemeRegistry from '@/theme/ThemeRegistry';
import ReactQueryProvider from '@/utils/ReactQueryProvider';

export const metadata: Metadata = {
  title: {
    default: 'QuidPath ERP',
    template: '%s | QuidPath ERP',
  },
  description: 'Modern enterprise resource planning platform for growing businesses.',
  keywords: ['ERP', 'Accounting', 'Inventory', 'CRM', 'HRM', 'POS', 'Projects'],
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#43A047',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <ThemeRegistry>
          <ReactQueryProvider>{children}</ReactQueryProvider>
        </ThemeRegistry>
      </body>
    </html>
  );
}
