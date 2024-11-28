// pages/_app.tsx
import Web3Provider from '../Web3Provider/Web3Provider';
import '../styles/global.css';
import type { AppProps } from 'next/app';
import { useRouter } from 'next/router';
import Navbar from '@/components/Navbar';

function App({ Component, pageProps }: AppProps) {
  const router = useRouter();

  return (
    <Web3Provider>
      <Navbar />
      <Component {...pageProps} />
    </Web3Provider>
  );
}

export default App;
