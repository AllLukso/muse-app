import { ExternalProvider } from "@ethersproject/providers";
import { createWeb3ReactRoot, useWeb3React, Web3ReactProvider } from "@web3-react/core";

import { providers } from 'ethers'
import { useEffect, useState } from "react";
import { CustomInjectedConnector } from "./connectors/CustomInjectedConnector";

function getLibrary() {
  return new providers.Web3Provider(window.ethereum as ExternalProvider);
}

const Web3ProviderNetwork = createWeb3ReactRoot("NETWORK");
export const connector = new CustomInjectedConnector({ supportedChainIds: [2828] });

interface ReactChildren {
  children: JSX.Element
}

function Web3Container ({ children }: ReactChildren) {
  const { active } = useWeb3React();
  const [loaded, setLoaded] = useState(false);
  const {
    active: networkActive,
    activate: activateNetwork
  } = useWeb3React("NETWORK");

  useEffect(() => {
    if (loaded) { return; }

    setLoaded(true);

    if (!networkActive) {
      connector.isAuthorized().then((authorized) => {
        authorized && activateNetwork(connector);
      });
    }
  }, [loaded, active, networkActive, activateNetwork]);

  return children as JSX.Element;
}

export default function Web3Root ({ children }: ReactChildren): JSX.Element {
  return <Web3ReactProvider getLibrary={getLibrary}>
    <Web3ProviderNetwork getLibrary={getLibrary}>
      <Web3Container children={children} />
    </Web3ProviderNetwork>
  </Web3ReactProvider>
}