import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { ToastProvider } from '@/components/ui/Toast';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: {
    default: 'CreatorStudio — Le tableau de bord des créateurs faceless',
    template: '%s · CreatorStudio',
  },
  description:
    "Centralisez chaque étape de votre production vidéo, de l'idée à la publication. Projets, scripts, outils vidéo : un seul espace de travail.",
  applicationName: 'CreatorStudio',
  openGraph: {
    title: 'CreatorStudio — Le tableau de bord des créateurs faceless',
    description:
      'Transformez votre chaos créatif en machine de production. Projets, scripts et outils vidéo au même endroit.',
    type: 'website',
    locale: 'fr_FR',
    siteName: 'CreatorStudio',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body>
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
