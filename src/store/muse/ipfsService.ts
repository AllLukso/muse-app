import { ERC725, ERC725JSONSchema } from '@erc725/erc725.js';
import { BigNumber, Contract, providers, utils } from 'ethers';

import { LSP4MetadataBeforeUpload } from '@lukso/lsp-factory.js/build/main/src/lib/interfaces/lsp4-digital-asset';
import * as uploadHelpers from '@lukso/lsp-factory.js/build/main/src/lib/helpers/uploader.helper';

import MuseBoardNFT from '../../contracts/MuseBoardsNFT.json';

const ipfsGateway = {
  host: 'api.2eff.lukso.dev',
  port: 443,
  protocol: 'https'
};

export async  function createBoard(title: string, description: string, file: File, contractAddress: string, library: providers.Web3Provider, owner: string, updateStatus: Function) {
  const contract = new Contract(contractAddress, MuseBoardNFT.abi, library);

  const totalSupply:BigNumber = await contract.totalSupply();

  const tokenId = utils.formatBytes32String(totalSupply.toNumber().toString());

  updateStatus('Uploading Image');

  const images = await uploadHelpers.imageUpload(file, { ipfsGateway })

  const data: LSP4MetadataBeforeUpload = {
    LSP4Metadata: {
      description: `[${title}] ${description}`,
      links: [],
      icon: images,
      images: [images],
      assets: []
    }
  };

  const schema: ERC725JSONSchema = {
    "name": "LSP8MetadataJSON:<bytes32>",
    "key": "0x9a26b4060ae7f7d5e3cd0000<bytes32>",
    "keyType": "Mapping",
    "valueType": "bytes",
    "valueContent": "JSONURL"
  };

  updateStatus('Uploading Metadata');

  const metadataUpload = await uploadHelpers.ipfsUpload(JSON.stringify(data), ipfsGateway);
  const metadataUrl = `ipfs://${metadataUpload.cid.toString()}`;

  const { values } = ERC725.encodeData(
    [{ keyName: 'LSP8MetadataJSON:<bytes32>', dynamicKeyParts: [tokenId], value: { json: data, url: metadataUrl }}],
    [schema] as ERC725JSONSchema[]
  );

  updateStatus('Minting Board');

  // return contract.connect(library.getSigner())['setData(bytes32,bytes)'](keys[0], values[0]);
  await contract.connect(library.getSigner()).mint(owner, tokenId, false, values[0]);
}