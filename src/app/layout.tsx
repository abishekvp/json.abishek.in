import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'JSON Master Studio — Formatter, Validator, Tree Inspector & Converter | abishek.in',
  description: 'Professional fullscreen JSON suite: Prettify & Minify, Auto-repair broken JSON, Interactive tree visualizer, JSONPath query engine, JSON Diff, and convert to TypeScript, CSV, YAML, XML, Go, and Python.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="icon" href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🌲</text></svg>" />
      </head>
      <body className="bg-surface-darker text-slate-100 antialiased overflow-hidden select-none">
        {children}
      </body>
    </html>
  );
}
