import { BigNumber, Contract, providers } from 'ethers';

import safeGet from 'lodash/get';

import UniversalProfileContract from "@lukso/lsp-smart-contracts/artifacts/UniversalProfile.json";
import ERC725, { ERC725JSONSchema } from '@erc725/erc725.js';

import MuseBoardsNFT from '../../contracts/MuseBoardsNFT.json';

import { LSPFactory } from '@lukso/lsp-factory.js';

import { Web3Provider } from "/Users/shashank/muse/muse-app/node_modules/@lukso/lsp-factory.js/node_modules/@ethersproject/providers";
import { AddToBoardPayload } from './museSlice';

const MUSE_BOARD_NFT_KEY = '0xcbc95fde762927ff629ff098282ffbc88bbfb99ae0f6ce08a1d31d1642def7bf';
const IPFS_GATEWAY = "https://2eff.lukso.dev/ipfs/";

const schemas: ERC725JSONSchema[] = [
  {
    name: 'MuseBoardsNFT',
    key: MUSE_BOARD_NFT_KEY,
    keyType: 'Singleton',
    valueType: 'address',
    valueContent: 'Address'
  },
  {
    name: "LSP8MetadataJSON:<bytes32>",
    key: "0x9a26b4060ae7f7d5e3cd0000<bytes32>",
    keyType: "Mapping",
    valueType: "bytes",
    valueContent: "JSONURL",
  }
];

function extractTitle(description: string) {
  const _title = (description.match(/^\[.*\]/g) || [])[0] || "";
  const _desc = description.replace(_title, "").trimStart();

  return { title: _title.replace(/[[\]]/g, ""), description: _desc };
}

function fetchTokenMetadata (metadataRef: any) {
  const url = metadataRef.url.replace('ipfs://', IPFS_GATEWAY);
  
  return fetch(url).then(res => res.json())
}

export async function loadInitialState (address: string, provider: providers.Web3Provider) {
  const contract = new Contract(address, UniversalProfileContract.abi, provider);
  const erc725 = new ERC725(schemas, address, window.ethereum);

  (window as any).upContract = contract;

  const rawData = await contract['getData(bytes32)'](MUSE_BOARD_NFT_KEY);
  const data = await erc725.decodeData([{ keyName: MUSE_BOARD_NFT_KEY, value: rawData }]);

  return data[0].value;
}

export function deployBaseMuseContract (owner: string, provider: providers.Web3Provider): Promise<string> {
  const factory = new LSPFactory(provider as Web3Provider);

  try {
    return new Promise((resolve, reject) => {
      factory.LSP8IdentifiableDigitalAsset.deploy({
        controllerAddress: owner,
        name: 'MuseBoards',
        symbol: 'Muse'
      }, {
        // LSP8IdentifiableDigitalAsset: {
        //   // version: MuseBoardsNFT.bytecode,
        //   // deployProxy: false
        // },
        onDeployEvents: {
          next: (deploymentEvent) => {
            console.log(deploymentEvent);
          },
          error: (error) => {
            return reject(error);
          },
          complete: (contracts) => {
            console.log('Digital Asset deployment completed');
            return resolve(contracts.LSP8IdentifiableDigitalAsset.address as string);
          },
        }
      });
    })
  } catch (error) {
    console.log(error);

    return Promise.resolve('');
  }

  // try {
  //   const signer = await provider.getSigner();
  //   const factory = new ContractFactory(MuseBoardsNFT.abi, MuseBoardsNFT.bytecode, signer);

  //   const contract = await factory.deploy('MuseBoards', 'MUSE', owner);

  //   await contract.deployTransaction.wait();

  //   console.log(await contract.totalSupply());

  //   return contract.address;
  // } catch (error) {
  //   console.log(error);

  //   return null;
  // }
}

export async function setMuseBoardsContractAddress (owner: string, address: string, provider: providers.Web3Provider) {

  try {
    const contract = new Contract(owner, UniversalProfileContract.abi, provider);
    const { keys, values } = ERC725.encodeData([{ keyName: 'MuseBoardsNFT', value: address }], schemas);

    console.log(keys, values, owner, address);

    const signer = await provider.getSigner();

    console.log(contract.connect(signer))

    await contract.connect(signer)['setData(bytes32,bytes)'](keys[0], values[0]);

    // return txn;
  } catch (error) {
    console.log(error);
  }
}

export async function loadBoardsForAddress(address: string, provider: providers.Web3Provider) {
  const contract = new Contract(address, MuseBoardsNFT.abi, provider);

  const owner = contract.owner();

  return contract
    .totalSupply()
    .then((supply: BigNumber) => supply.toNumber())
    .then((supply: number) => {
      return Promise.all(
        Array(supply)
          .fill("")
          .map((_, idx) => contract.tokenAt(idx))
      );
    })
    .then((tokenIds: string[]) => {
      const tokenKeys = tokenIds.map((tokenId) =>
        ERC725.encodeKeyName(schemas[1].name, [tokenId])
      );

      return contract["getData(bytes32[])"](tokenKeys).then(
        (tokensData: string[]) => {
          return { values: tokensData, ids: tokenIds };
        }
      );
    })
    .then(async ({ ids, values }: { ids: string[]; values: string[] }) => {
      const encodedData = values.map((packet, index) => ({
        keyName: schemas[1].name,
        key: schemas[1].key,
        dynamicKeyParts: [ids[index]],
        value: packet,
      }));

      const data = ERC725.decodeData(encodedData, [schemas[1]]);

      return Promise.all(ids.map(async (tokenId, idx) => {
        const metadata = await fetchTokenMetadata(data[idx].value);

        const { title, description } = extractTitle(safeGet(metadata, 'LSP4Metadata.description', ''));

        return {
          title: title ? title : description,
          description,
          address,
          id: tokenId,
          metadata: metadata,
          owner: await owner
        };
      }));
    });
}

export async function addTokenToBoard(payload: AddToBoardPayload) {
  try {
    const contract = new Contract(payload.boardsAddress, MuseBoardsNFT.abi, payload.provider);

    return contract.connect(payload.provider.getSigner()).addTokenToBoard(payload.boardId, payload.contractAddress, payload.tokenId, '0x');
  } catch (error) {
    console.log(error);
  }
}

export async function loadBoard(boardsAddress: string, boardId: string, provider: providers.Web3Provider): Promise<{ address: string, tokenId: string, data: string }[]> {
  const contract = new Contract(boardsAddress, MuseBoardsNFT.abi, provider);
  const boardSize = (await contract.boardSize(boardId)).toNumber();

  if (boardSize === 0) {
    return [];
  }

  const keys = await Promise.all(Array(boardSize).fill('').map((_, idx) => {
    return contract.getBoardTokenAt(boardId, idx);
  }));
  
  const rawDataPackets = await contract['getData(bytes32[])'](keys);

  return rawDataPackets.map((packet: string) => {
    const address = packet.substring(0, 42);
    const tokenId = packet.substring(42, 42 + 64);
    const data = packet.substring(42 + 64);

    return { address, tokenId, data };
  });
}
