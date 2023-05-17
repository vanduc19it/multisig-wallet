import type { AppProps } from "next/app";
import { ThirdwebProvider } from "@thirdweb-dev/react";
import "../styles/globals.css";
import { ChakraProvider } from "@chakra-ui/react";
import { Mumbai } from "@thirdweb-dev/chains";

const activeChain = "mumbai";

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ChakraProvider>
    <ThirdwebProvider activeChain={activeChain} supportedChains={[Mumbai]}>
      <Component {...pageProps} />
    </ThirdwebProvider>
    </ChakraProvider>
  );
}

export default MyApp;
