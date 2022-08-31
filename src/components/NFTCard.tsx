/* This example requires Tailwind CSS v2.0+ */
import { useEffect, useState } from "react";

import addIcon from "../addIcon.svg";

import safeGet from "lodash/get";
import { Link } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import { getToken } from "../store/tokens/tokensSlice";
import { openAddToBoardModal } from "../store/muse/museSlice";

const IPFS_GATEWAY = "https://2eff.lukso.dev/ipfs/";
interface NFTCardProps {
  address: string;
  tokenId: string;
  classes?: string;
}

function extractTitle(description: string) {
  const _title = (description.match(/^\[.*\]/g) || [])[0] || "";
  const _desc = description.replace(_title, "").trimStart();

  return { title: _title.replace(/[[\]]/g, ""), description: _desc };
}

export default function NFTCard({
  address,
  tokenId,
  classes
}: NFTCardProps) {
  const dispatch = useAppDispatch();
  const [image, setImage] = useState<string>("");
  const [alt, setAlt] = useState<string>("");
  const [padding] = useState<number>(Math.random() * 150);
  const [aspect, setAspect] = useState<string|null>(null);
  const _tokenData = useAppSelector(getToken(address, tokenId));

  useEffect(() => {
    if (!_tokenData || _tokenData.loading) { return; }

    const imagePath = "token.images.0.url";
    const descriptionPath = "token.description";

    const imageUrl = safeGet(_tokenData, imagePath);
    const iconUrl = safeGet(_tokenData, 'token.icons.0.url');
    
    let { title, description } = extractTitle(safeGet(_tokenData, descriptionPath, ''));

    if (!title && !description) {
      const { title: cTitle, description: cDescription } = extractTitle(
        safeGet(_tokenData, 'collection.description') || safeGet(_tokenData, 'collection.name', '')
      );

      setAlt(cTitle ? cTitle : cDescription);
    } else {
      setAlt(title ? title : description);
    }

    if (imageUrl) {
      setImage(imageUrl.replace("ipfs://", IPFS_GATEWAY));

      const height = safeGet(_tokenData, 'token.images.0.height') as number;
      const width = safeGet(_tokenData, 'token.images.0.width') as number;

      setAspect(`${height}/${width * 1.2}`);

      return;
    }

    if (iconUrl) {
      setImage(iconUrl.replace("ipfs://", IPFS_GATEWAY));

      return;
    }
    
    // Fallback to loading collection image
    const collectionMetadataUrl = safeGet(_tokenData, 'collection.metadata.url');

    if (!collectionMetadataUrl) { return; }

    fetch(collectionMetadataUrl.replace("ipfs://", IPFS_GATEWAY))
      .then(res => res.json())
      .then((_colData) => {
        const logoUrl = safeGet(_colData, "LSP4Metadata.images.0.0.url") || safeGet(_colData, "LSP4Metadata.icon.0.url", '');

        logoUrl && setImage(logoUrl.replace("ipfs://", IPFS_GATEWAY));
      })
  }, [_tokenData]);
  
  function addToMuseboard() {
    dispatch(openAddToBoardModal({ contract: address, id: tokenId }));
  }

  if (!_tokenData || _tokenData.loading) {
    return (
      <div
        className="group overflow-hidden rounded-3xl flex flex-col border border-gray-300 hover:shadow-2xl mb-8 transition-all transition-duration-700 hover:p-4"
        style={{ height: 400 + padding }}
      >
        <div className="animate-pulse grow bg-cover bg-center rounded-3xl bg-gray-200"></div>
      </div>
    );
  }

  return (
    <div
      className={`group grow-0 overflow-hidden rounded-3xl flex flex-col border border-gray-300 hover:shadow-2xl transition-all transition-duration-700 hover:p-4 ${classes}`}
      style={aspect ? { aspectRatio: aspect } : { height: 400 + padding }}
    >
      <Link
        to={`/collection/${address}/token/${tokenId}`}
        className={`grow bg-cover bg-center rounded-3xl ${
          image ? "" : "bg-gradient-to-r from-purple-500 to-pink-500"
        }`}
        style={image ? { backgroundImage: `url(${image})` } : {}}
      ></Link>
      <div>
        <div className="p-4 group-hover:p-2 transition-all transition-duration-700">
          <p className="truncate font-semibold text-gray-700">{alt}</p>
        </div>
        <div className="transition-all transition-duration-700 hidden group-hover:block">
          <p className="px-2 mb-2 font-semibold"><span className="text-gray-600 font-normal mr-2 mb-2 ">From</span>{_tokenData.collection?.name}</p>
          <button onClick={addToMuseboard} className="bg-black text-white font-bold py-4 shadow-lg w-full rounded-2xl">
            <img className="inline mr-4" alt="Add" src={addIcon} />
            Add to museboard
          </button>
        </div>
      </div>
    </div>
  );
}
