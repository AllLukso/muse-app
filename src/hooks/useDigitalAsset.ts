import { useEffect, useState } from "react";

import { ERC725, ERC725JSONSchema } from "@erc725/erc725.js";

import LSP4DigitalAsset from "@erc725/erc725.js/schemas/LSP4DigitalAsset.json";

import IdentifiableDigitalAsset from "@lukso/lsp-smart-contracts/artifacts/LSP8IdentifiableDigitalAsset.json";
import DigitalAssetMetadata from "@lukso/lsp-smart-contracts/artifacts/LSP4DigitalAssetMetadata.json";

import { ERC725Y_INTERFACE_IDS } from "@erc725/erc725.js/build/main/src/lib/constants";
import { INTERFACE_IDS } from '@lukso/lsp-smart-contracts/constants';
import { BigNumber, ethers } from "ethers";
import { useWeb3React } from "@web3-react/core";

const schemas = [
  {
    name: "LSP8TokenIdType",
    key: "0x715f248956de7ce65e94d9d836bfead479f7e70d69b718d47bfe7b00e05b4fe4",
    keyType: "Singleton",
    valueType: "uint256",
    valueContent: "Number"
  },
  {
    name: "LSP8MetadataJSON:<bytes32>",
    key: "0x9a26b4060ae7f7d5e3cd0000<bytes32>",
    keyType: "Mapping",
    valueType: "bytes",
    valueContent: "JSONURL"
  }
];

const IPFS_GATEWAY = "https://2eff.lukso.dev/ipfs/";
const config = { ipfsGateway: IPFS_GATEWAY };

export default function useDigitalAsset(address: string) {
  const { account, library } = useWeb3React('NETWORK');
  const [loading, setLoading] = useState(true);
  const [valid, setValid] = useState(true);
  const [owner, setOwner] = useState(null);
  const [totalSupply, setTotalSupply] = useState(0);
  const [data, setData] = useState<any>({});

  const [assetContract] = useState(
    new ethers.Contract(address, IdentifiableDigitalAsset.abi, library)
  );
  const [metadataContract] = useState(
    new ethers.Contract(address, DigitalAssetMetadata.abi, library)
  );
  const [isNFT, setIsNFT] = useState(false);
  const [isToken, setIsToken] = useState(false);

  useEffect(() => {
    if (!loading) {
      return;
    }

    if (!library) {
      return;
    }

    if (!account) {
      return;
    }

    assetContract.supportsInterface(INTERFACE_IDS.LSP7DigitalAsset).then(setIsToken);
    assetContract.supportsInterface(INTERFACE_IDS.LSP8IdentifiableDigitalAsset).then(setIsNFT);
    assetContract.owner().then(setOwner);

    assetContract.totalSupply().then((supply: BigNumber) => {
      setTotalSupply(supply.toNumber());
    });

    metadataContract.supportsInterface(ERC725Y_INTERFACE_IDS["3.0"])
      .then(setValid);
  }, [loading, library, address]);

  // useEffect(() => {
    
  // }, [isNFT]);

  useEffect(() => {
    if (!valid) {
      return setLoading(false);
    }

    const erc725 = new ERC725(
      LSP4DigitalAsset.concat(schemas) as ERC725JSONSchema[],
      address,
      library,
      config
    );

    Promise.all(
      [1, 2, 3].map((idx) => {
        const key = LSP4DigitalAsset[idx].key;

        return metadataContract["getData(bytes32)"](key)
          .then((rawData: any) => {
            return erc725.decodeData([{ keyName: key, value: rawData }]);
          })
          .then((data: any) => data[0].value);
      })
    ).then(([name, symbol, metadataRef, creators]) => {
      setData({ name, symbol, metadataRef, creators });
      setLoading(false);
    });
  }, [valid, address]);

  // useEffect(() => {
  //   if (!data.metadataRef) {
  //     return;
  //   }

  //   console.log(data);

  //   if (typeof data.metadataRef.url !== 'string') { return; }

  //   const url = data.metadataRef.url.replace('ipfs://', 'https://ipfs.io/ipfs/');

  //   fetch(url)
  //     .then((res) => res.json())
  //     .then(console.log);
  // }, [data]);

  return {
    loading,
    valid,
    data,
    isNFT,
    isToken,
    owner,
    totalSupply,
    contract: assetContract,
    fetchTokenId: function (tokenId: string) {
      const key = ERC725.encodeKeyName(schemas[1].name, tokenId);
      const erc725y = new ERC725(
        [{
          name: "LSP8MetadataJSON:<bytes32>",
          key,
          keyType: "Mapping",
          valueType: "bytes",
          valueContent: "JSONURL"
        }] as ERC725JSONSchema[],
        address,
        library,
        config
      );

      // return Promise.resolve(key);

      return metadataContract["getData(bytes32)"](key)
        .then((rawData: any) => {
          return erc725y.decodeData([{ keyName: key, value: rawData }]);
        })
        .then((tokenData: any) => {
          if (!tokenData[0].value) {
            return data.metadataRef.url
          };

          return tokenData[0].value.url
        })
        .then((url: string) => {
          return fetch(url.replace('ipfs://', IPFS_GATEWAY))
        })
        .then((res: any) => res.json())
        .catch(console.log);
    }
  };
}
