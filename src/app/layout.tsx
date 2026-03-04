import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Content Moderation App',
  description: 'AI-powered comment moderation using InsForge and openai/gpt-4o-mini',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased" suppressHydrationWarning>{children}</body>
    </html>
  );
}
