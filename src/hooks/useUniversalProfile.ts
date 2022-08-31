import { useEffect, useState } from "react";

import { ERC725, ERC725JSONSchema } from "@erc725/erc725.js";

import ProfileMetadataSchema from "@erc725/erc725.js/schemas/LSP3UniversalProfileMetadata.json";
import ReceivedAssetsSchema from "@erc725/erc725.js/schemas/LSP5ReceivedAssets.json";
import IssuedAssetsSchema from '@erc725/erc725.js/schemas/LSP12IssuedAssets.json';

import UniversalProfileContract from "@lukso/lsp-smart-contracts/artifacts/UniversalProfile.json";
import KeyManager from "@lukso/lsp-smart-contracts/artifacts/LSP6KeyManager.json";

import IdentifiableDigitalAsset from "@lukso/lsp-smart-contracts/artifacts/LSP8IdentifiableDigitalAsset.json";

import { INTERFACE_IDS } from "@lukso/lsp-smart-contracts/constants";

import * as ethers from 'ethers';
import { useWeb3React } from "@web3-react/core";

const IPFS_GATEWAY = "https://2eff.lukso.dev/ipfs/";
const config = { ipfsGateway: IPFS_GATEWAY };

/*
 * Fetch the @param's Universal Profile's
 * LSP3 data
 *
 * @param address of Universal Profile
 * @return string JSON or custom error
 */
export async function fetchProfileData(profile: any) {
  try {
    return await profile.fetchData("LSP3Profile");
  } catch (error) {
    console.log(error);

    return console.log("This is not an ERC725 Contract");
  }
}

export async function fetchPermissions(account: string, library: any, profile: any) {
  const pk = ERC725.encodeKeyName(`AddressPermissions:Permissions:${account}`);

  return profile["getData(bytes32)"](pk)
    .then((encodedPermissions: any) => {
      return ERC725.decodePermissions(encodedPermissions);
    });
}

export interface ImageRef {
  hash: string,
  url: string,
  width: string,
  height: string,
  hashFunction: string
}
export interface UniversalProfile {
  name: string,
  description: string,
  profileImage: ImageRef[],
  backgroundImage: ImageRef[]
}

export default function useUniversalProfile(address: string, fetchData = true) {
  const { library } = useWeb3React('NETWORK');
  const [loading, setLoading] = useState(true);
  const [keyManager, setKeyManager] = useState<ethers.Contract | null>(null);
  const [profile, setProfileContract] = useState<ethers.Contract | null>(null);
  const [balance, setBalance] = useState("0");
  const [valid, setValid] = useState(false);
  const [data, setData] = useState<UniversalProfile>();
  const [erc725y, setERC725Y] = useState<ERC725 | null>(null);

  useEffect(() => {
    if (!loading) {
      return;
    }

    if (!library) {
      return;
    }

    const contract = new ethers.Contract(address, UniversalProfileContract.abi, library);
    const erc725 = new ERC725(
      ProfileMetadataSchema.concat(ReceivedAssetsSchema).concat(IssuedAssetsSchema) as ERC725JSONSchema[],
      address,
      window.ethereum,
      config
    );

    library.getBalance(address).then((b: ethers.BigNumber) => {
      setBalance(ethers.utils.formatEther(b));
    });
    setProfileContract(contract);

    contract
      .supportsInterface(INTERFACE_IDS.LSP0ERC725Account)
      .then((supported: any) => {
        setERC725Y(erc725);
        setValid(supported);
      });
  }, [loading, library, address]);

  useEffect(() => {
    if (!profile) { return; }    

    profile
        .owner()
        .then((owner: string) => {
          const keyManagerContract = new ethers.Contract(
            owner,
            KeyManager.abi,
            library
          );

          setKeyManager(keyManagerContract);
        });
  }, [valid]);

  useEffect(() => {
    if (!valid) { return; }

    if (!fetchData) {
      setLoading(false);
      return;
    }

    fetchProfileData(erc725y).then((data) => {
      data.value && setData(data.value.LSP3Profile);

      setLoading(false);
    });
  }, [valid]);

  return {
    loading,
    keyManager,
    profile,
    balance,
    valid,
    data,
    permissions: function (account: string) {
      return fetchPermissions(account, library, profile);
    },
    fetch: function (type: string) {
      return erc725y?.fetchData(type);
    },
    fetchDynamic: function (type: string, address: string) {
      return erc725y?.fetchData({ keyName: type, dynamicKeyParts: address });
    },
    loadTokensForAsset: function (contractAddress: string) {
      const contract = new ethers.Contract(contractAddress, IdentifiableDigitalAsset.abi, library);

      return contract.tokenIdsOf(address as string);
    }
  };
}
