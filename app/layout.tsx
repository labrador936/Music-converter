import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'ConvertKit Tools — Free Media Tools',
  description: 'Simple tools for converting media files you own or are authorized to use.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
