import type { AppProps } from 'next/app';
import { MonoCloudAuthProvider } from '@monocloud/nextjs-auth/client';
import { Header } from '@/components/header';
import '@/styles/globals.css';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <MonoCloudAuthProvider>
      <Header />
      <Component {...pageProps} />
    </MonoCloudAuthProvider>
  );
}
