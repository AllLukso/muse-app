import { Fragment, useEffect, useState } from "react";

import { Listbox, Transition } from "@headlessui/react";
import { SelectorIcon } from "@heroicons/react/solid";

import { Link, useParams } from "react-router-dom";
import useUniversalProfile, {
  ImageRef,
  UniversalProfile,
} from "../../hooks/useUniversalProfile";
import Address from "../../components/Address";
import { useWeb3React } from "@web3-react/core";

import safeGet from "lodash/get";
import { PlusCircleIcon } from "@heroicons/react/outline";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { getMuseState, openNewBoardModal } from "../../store/muse/museSlice";

import NFTCard from '../../components/NFTCard';

function extractTitle (description: string) {
  const _title = (description.match(/^\[.*\]/g) || [])[0] || ""
  const _desc = description.replace(_title, '').trimStart();

  return { title: _title.replace(/[[\]]/g, ""), description: _desc }
}

function DynamicImage({
  images,
  className = "",
}: {
  images: ImageRef[];
  className?: string;
}) {
  const url = images[0].url.replace("ipfs://", "https://ipfs.io/ipfs/");

  return <img className={className} src={url} alt="Profile" />;
}

function ProfileCard({
  data,
  address,
  loading,
  canEdit,
}: {
  data: UniversalProfile;
  address: string;
  loading: boolean;
  canEdit: boolean;
}) {
  if (loading) {
    return <p>Loading</p>;
  }

  return (
    <div className="max-w-sm mx-auto mt-10">
      <div className="flex flex-row">
        <div className="flex-none w-50">
          {data && data.profileImage.length !== 0 && (
            <DynamicImage
              images={data.profileImage}
              className="h-20 w-20 rounded-full"
            />
          )}
        </div>
        <div className="grow">
          <div className="px-4">
            <h2 className="text-3xl font-extrabold">{data.name}</h2>
            <Address address={address as string} />
            <div className="flex row">
              <div>
                <span className="text-gray-400">Following</span>{" "}
                <span className="font-bold">123</span>
              </div>
              <div className="mx-4">
                <span className="text-gray-400">Followers</span>{" "}
                <span className="font-bold">542</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="py-4">
        <p className="text-gray-400">{data.description}</p>
      </div>
      {!canEdit && (
        <button className="w-full bg-black text-white font-bold py-2 rounded-xl shadow-lg">
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
          Follow
        </button>
      )}
    </div>
  );
}

interface NFT {
  contract: string;
  tokenId: string;
}

function Museboard({ board }: { board: any }) {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>({});

  useEffect(() => {
    Promise
      .resolve(board.metadata)
      .then((rawData) => {
        const { title, description } = extractTitle(safeGet(rawData, "LSP4Metadata.description", '') as string);

        const images = safeGet(rawData, "LSP4Metadata.images.0");

        setData({ title, description, images });
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="group">
        <button className="animate-pulse w-full aspect-square bg-gray-200 hover:bg-gradient-to-tr to-purple-500 from-cyan-500 rounded-3xl transition-all duration-700"></button>
        <p className="text-center font-semibold mt-4">Loading Board</p>
      </div>
    );
  }

  console.log(board, board.address);

  return (
    <Link to={`/board/${board.address}/${board.id}`} className="group">
      {data.images && data.images.length >= 1 ? (
        <DynamicImage images={data.images} className="rounded-3xl bg-gradient-to-tr to-purple-500 from-cyan-500 hover:p-1 transition-all duration-500 hover:shadow-xl" />
      ) : (
        <button className="w-full aspect-square bg-gradient-to-tr to-purple-500 from-cyan-500 rounded-3xl transition-all duration-700"></button>
      )}
      <p className="text-center font-semibold mt-4">
        {data.title}
      </p>
    </Link>
  );
}

function MuseboardList() {
  const museState = useAppSelector(getMuseState);

  if (!museState.initialised) {
    return <p>Not Initialised</p>;
  }

  return (
    <>
      {museState.boards.map((board: any) => (
        <Museboard key={board.id} board={board} />
      ))}
    </>
  );
}

const actions = [{ name: "NFTs" }, { name: "museboards" }];

export default function ProfilePage() {
  const dispatch = useAppDispatch();
  const { address } = useParams();
  const { loading, data, fetch, loadTokensForAsset } = useUniversalProfile(
    address as string
  );
  const { account } = useWeb3React("NETWORK");
  const [nfts, setNFTs] = useState<NFT[]>([]);

  function openModal() {
    dispatch(openNewBoardModal());
  }

  const [selected, setSelected] = useState(actions[0]);

  useEffect(() => {
    if (loading) {
      return;
    }

    fetch("LSP5ReceivedAssets[]")
      ?.then((data) => {
        return data.value as string[];
      })
      .then((assets: string[]) => {
        return Promise.all(
          assets.map((assetAddress: string) =>
            loadTokensForAsset(assetAddress).then((tokenIds: string[]) =>
              tokenIds.map((tokenId) => ({ contract: assetAddress, tokenId }))
            )
          )
        );
      })
      .then((assets) => assets.flat())
      .then(setNFTs);
  }, [loading, address]);

  return (
    <>
      <div className="min-h-full">
        <main>
          <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
            <ProfileCard
              loading={loading}
              data={data as UniversalProfile}
              address={address as string}
              canEdit={account === address}
            />
            <Listbox value={selected} onChange={setSelected}>
              <div className="relative mt-4">
                <Listbox.Button className="relative cursor-default rounded-lg bg-white py-2 pr-10 text-left focus:outline-none focus-visible:border-indigo-500 focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75 focus-visible:ring-offset-2 focus-visible:ring-offset-orange-300 sm:text-sm">
                  <h3 className="text-2xl font-bold truncate">
                    {selected.name}
                  </h3>
                  <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                    <SelectorIcon
                      className="h-5 w-5 text-gray-400"
                      aria-hidden="true"
                    />
                  </span>
                </Listbox.Button>
                <Transition
                  as={Fragment}
                  leave="transition ease-in duration-100"
                  leaveFrom="opacity-100"
                  leaveTo="opacity-0"
                >
                  <Listbox.Options className="absolute block w-40 mt-1 max-h-60 overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                    {actions.map((action, actionIdx) => (
                      <Listbox.Option
                        key={actionIdx}
                        className={`relative cursor-default select-none py-2 px-4 text-gray-900`}
                        value={action}
                      >
                        {({ selected }) => (
                          <span
                            className={`block truncate ${
                              selected ? "font-medium" : "font-normal"
                            }`}
                          >
                            {action.name}
                          </span>
                        )}
                      </Listbox.Option>
                    ))}
                  </Listbox.Options>
                </Transition>
              </div>
            </Listbox>
            <div className="mt-2">
              {selected.name === "NFTs" && (
                <section id="owned-nfts">
                  <h4 className="text-gray-500 py-4">OWNED</h4>
                  <div className="columns-4 gap-4">
                    {nfts.map((token) => (
                      <NFTCard
                        key={`${token.contract}:${token.tokenId}`}
                        address={token.contract}
                        tokenId={token.tokenId}
                        classes="mb-4"
                      />
                    ))}
                  </div>
                </section>
              )}
              {selected.name === "museboards" && (
                <section id="owned-nfts">
                  <h4 className="text-gray-500 py-4">OWNED</h4>
                  <div className="grid lg:grid-cols-5 gap-4">
                    <div className="group transition-all duration-700">
                      <button
                        onClick={() => openModal()}
                        className="w-full aspect-square bg-gray-200 hover:bg-gradient-to-tr to-purple-500 from-cyan-500 rounded-3xl"
                      >
                        <PlusCircleIcon className="h-10 w-10 mx-auto group-hover:text-white" />
                      </button>
                      <p className="text-center font-semibold mt-4">
                        Create New
                      </p>
                    </div>
                    <MuseboardList />
                  </div>
                </section>
              )}
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
