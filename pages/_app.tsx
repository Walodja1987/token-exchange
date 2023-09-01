import '../styles/globals.css';
import '@rainbow-me/rainbowkit/styles.css';
import { getDefaultWallets, RainbowKitProvider } from '@rainbow-me/rainbowkit';
import type { AppProps } from 'next/app';
import { configureChains, createConfig, WagmiConfig } from 'wagmi';
import { arbitrum, goerli, mainnet, optimism, polygon, polygonMumbai } from 'wagmi/chains';
import { publicProvider } from 'wagmi/providers/public';
import { jsonRpcProvider } from 'wagmi/providers/jsonRpc';
import { alchemyProvider } from '@wagmi/core/providers/alchemy'

const { chains, publicClient, webSocketPublicClient } = configureChains(
  [
    polygon,
    ...(process.env.NEXT_PUBLIC_ENABLE_TESTNETS === 'true' ? [polygonMumbai] : []),
  ],
  [
    // jsonRpcProvider({
    //   rpc: (chain) => {
    //     console.log('chain.id',chain.id)
    //     // console.log('process.env[`NEXT_PUBLIC_RPC_URL_${chain.id}`]', process.env[`NEXT_PUBLIC_RPC_URL_${chain.id}`])
    //     // console.log('process.env[`NEXT_PUBLIC_RPC_URL_${chain.id}`]', process.env[`NEXT_PUBLIC_RPC_URL_${chain.id}`])
    //     console.log('NEXT_PUBLIC_RPC_URL_137', process.env[`NEXT_PUBLIC_RPC_URL_137`])
    //     console.log(`NEXT_PUBLIC_RPC_URL_${chain.id}`, process.env[`NEXT_PUBLIC_RPC_URL_${chain.id}`]);

    //     return {
    //       http: process.env[`NEXT_PUBLIC_RPC_URL_${chain.id}`] || '',
    //       // http: 'https://polygon-bor.publicnode.com'
    //     }
    //   },
    // }),
    // alchemyProvider({ apiKey: '...' }),
    publicProvider()
  ]
);
// console.log('chains', chains)
// console.log('process.env[`NEXT_PUBLIC_RPC_URL_${chain.id}`]',process.env[`NEXT_PUBLIC_RPC_URL_${chains[0].id}`])

// console.log('chains _app.tsx', chains)

const { connectors } = getDefaultWallets({
  appName: 'Token Exchange',
  projectId: '0e9fea3c75816bd2dd605895a28b885b',
  chains,
});

const wagmiConfig = createConfig({
  autoConnect: true,
  connectors,
  publicClient,
  webSocketPublicClient,
});

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <WagmiConfig config={wagmiConfig}>
      <RainbowKitProvider chains={chains}>
        <Component {...pageProps} />
      </RainbowKitProvider>
    </WagmiConfig>
  );
}

export default MyApp;
