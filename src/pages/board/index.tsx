import { useParams } from "react-router-dom";
import { useAppSelector } from "../../app/hooks";
import {
  getMuseBoard,
} from "../../store/muse/museSlice";

import * as museService from "../../store/muse/museService";
import { useEffect, useState } from "react";
import { useWeb3React } from "@web3-react/core";
import NFTCard from "../../components/NFTCard";

import safeGet from "lodash/get";

const IPFS_GATEWAY = "https://2eff.lukso.dev/ipfs/";

export default function BoardPage() {
  const { address, boardId } = useParams();
  const { library } = useWeb3React("NETWORK");
  const [tokens, setTokens] = useState<any[]>([]);
  const board = useAppSelector(
    getMuseBoard(address as string, boardId as string)
  );
  const [imageUrl, setImage] = useState("");

  useEffect(() => {
    if (!library) {
      return;
    }

    if (!board) {
      return;
    }

    const url = safeGet(board.metadata, "LSP4Metadata.images.0.0.url").replace(
      "ipfs://",
      IPFS_GATEWAY
    );

    setImage(url);

    museService
      .loadBoard(address as string, boardId as string, library)
      .then(setTokens);
  }, [library, board]);

  if (!board) {
    return <p>Loading</p>;
  }

  return (
    <>
      <div className="min-h-full pb-16">
        <main>
          <div className="bg-slate-900 h-96 relative mb-48">
            <img
              className="absolute left-0 top-0.5 h-96 w-full object-cover opacity-30 z-0"
              src={imageUrl}
              alt="Board"
            />
            <div className="absolute top-16 left-0 right-0 h-80 z-10">
            <div className="max-w-7xl mb-40 mx-auto flex flex-row space-x-3">
              <button
                onClick={() => window.history.back()}
                className="px-4 py-2 bg-gray-200 rounded-lg text-black"
              >
                Back
              </button>
              <span className="grow"></span>
              <button className="px-4 py-2 bg-gray-200 rounded-lg text-black" onClick={() => window.alert('Not Implemented')}>
                Share
              </button>
            </div>
              <div className="flex flex-row space-x-8 max-w-7xl mx-auto">
                <div className="min-w-fit">
                  <img
                    className="w-64 h-64 rounded-2xl border-4 border-white  object-cover object-center"
                    src={imageUrl}
                    alt="Board"
                  />
                </div>
                <div className="flex flex-col grow">
                  <div>
                    <h2 className="text-5xl text-white font-semibold">
                      {board.title}
                    </h2>
                    <p className="text-lg text-white mt-2 h-16 text-ellipsis">
                      {board.description.substring(0, 180)}{board.description.length > 180 && '...'}
                    </p>
                  </div>
                  <div className="grow"></div>
                  <div className="flex flex-row space-x-8">
                    <div>
                      <img className="h-8 w-8 rounded-full inline mr-4 bg-black" src={`https://avatars.dicebear.com/api/identicon/${board.owner}.svg`} alt="Board Owner"/>
                      <span className="text-gray-500 mr-4">Curated by</span>
                      <span className="font-semibold">{board.owner.substring(0, 5)}...{board.owner.substring(board.owner.length - 5)}</span>
                    </div>
                    <span className="leading-7">500 Followers</span>
                    <span className="leading-7">{tokens.length} NFTs</span>
                  </div>
                  <div className="pt-4 mb-2">
                    <button className="bg-black text-white font-bold py-2 px-8 rounded-xl shadow-lg">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="w-6 h-6 inline mr-2"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M19 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM4 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 0110.374 21c-2.331 0-4.512-.645-6.374-1.766z"
                        />
                      </svg>
                      Follow Museboard
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="max-w-7xl mx-auto">
            <div className="columns-1 md:columns-2 lg:columns-4 gap-4">
              {tokens.map((token) => (
                <NFTCard
                  key={`${token.address}:${token.tokenId}`}
                  address={token.address}
                  tokenId={token.tokenId}
                />
              ))}
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
