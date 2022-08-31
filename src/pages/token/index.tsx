import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { getToken } from "../../store/tokens/tokensSlice";
import addIcon from "../../addIcon.svg";
import { openAddToBoardModal } from "../../store/muse/museSlice";
import { safeGet } from "@firebase/util";

const IPFS_GATEWAY = "https://2eff.lukso.dev/ipfs/";

function extractTitle(description: string = '', collectionName?: string) {
  const _title = (description.match(/^\[.*\]/g) || [])[0] || "";
  const _desc = description.replace(_title, "").trimStart();

  return {
    title: _title.replace(/[[\]]/g, "") || collectionName,
    description: _desc,
  };
}

function TokenImages({ images }: { images: any[] }) {
  const url = images[0].url;

  return (
    <img
      className="max-w-2xl mx-auto"
      src={url.replace("ipfs://", IPFS_GATEWAY)}
      alt="Token"
    />
  );
}

function CollectionImages({ collection }: { collection: any }) {
  const [loading, setLoading] = useState(true);
  const [image, setImage] = useState(null);

  useEffect(() => {
    if (!collection.metadata.url) { return; }

    const url = collection.metadata.url;

    if (!url) {
      setLoading(false);

      return;
    }

    fetch(url.replace('ipfs://', IPFS_GATEWAY))
      .then(res => res.json())
      .then((data) => {
        const imageUrl = safeGet(data, 'LSP4Metadata.images.0.0.url');

        imageUrl && setImage(imageUrl.replace('ipfs://', IPFS_GATEWAY));
        setLoading(false);
      });
  }, [collection.metadata.url]);

  if (loading) {
    return <div className="max-w-lg mx-auto aspect-square bg-gray-200 rounded-2xl animate-pulse"></div>
  }

  if (image) {
    return <img
      className="max-w-2xl mx-auto"
      src={image}
      alt="Token"
    />
  }

  return <div className="max-w-lg mx-auto aspect-square bg-gradient-to-tr to-purple-500 from-cyan-500 rounded-3xl">
  </div>;
}

export default function TokenPage() {
  const dispatch = useAppDispatch();
  const { tokenId, address } = useParams();
  const data = useAppSelector(getToken(address as string, tokenId as string));
  const [title, setTitle] = useState("");
  const [description, setDesc] = useState("");

  useEffect(() => {
    if (data.loading || !data.token) {
      return;
    }

    const { title: _t, description: _d } = extractTitle(data.token.description);

    _t && setTitle(_t);
    _d && setDesc(_d);
  }, [data.loading, data.token, data.collection]);

  function addToMuseboard() {
    if (!data.collection || !data.token) {
      return;
    }

    dispatch(
      openAddToBoardModal({
        contract: data.collection.address,
        id: data.token.id,
      })
    );
  }

  if (data.loading) {
    return <p>Loading</p>;
  }

  if (!data.token || !data.collection) {
    return <p>Not Found</p>;
  }

  return (
    <>
      <div className="min-h-full">
        <main>
          <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
            <div className="flex flex-row space-x-3">
              <button
                onClick={() => window.history.back()}
                className="px-4 py-2 bg-gray-200 rounded-lg text-black"
              >
                Back
              </button>
              <span className="grow"></span>
              <button
                onClick={addToMuseboard}
                className="px-4 py-2 bg-gray-200 rounded-lg text-black"
              >
                Add to museboard
              </button>
              <button className="px-4 py-2 bg-gray-200 rounded-lg text-black">
                Share
              </button>
            </div>
            <div className="py-8">
              {data.token.images.length !== 0 && (
                <TokenImages images={data.token.images} />
              )}
              {data.token.images.length === 0 && (
                <CollectionImages collection={data.collection} />
              )}
            </div>
            <div className="text-center">
              {title && (
                <span className="text-lg text-gray-600">
                  {data.collection.name}
                </span>
              )}
              <h2 className="text-3xl font-bold">
                {title ? title : data.collection.name}
              </h2>
            </div>
            <div></div>
            <div className="text-center max-w-md mx-auto my-8 p-8 bg-gray-100 rounded-md">
              <span>Description</span>
              <p>{description}</p>
            </div>
            <div className="text-center my-8">
              <button
                onClick={addToMuseboard}
                className="bg-black text-white font-bold py-4 px-8 shadow-lg rounded-2xl"
              >
                <img className="inline mr-4" alt="Add" src={addIcon} />
                Add to museboard
              </button>
            </div>
            <div className="grid grid-cols-2">
              <div className="w-full">
                <span className="block py-4 w-full">METADATA</span>
                <div className="border-t border-b my-4">
                  <div className="leading-10">
                    <div className="flex flex-row">
                      <span className="">Contract Address</span>
                      <span className="grow"></span>
                      <span>
                        {data.collection.address.substring(0, 5)}...
                        {data.collection.address.substring(
                          data.collection.address.length - 5
                        )}
                      </span>
                    </div>
                    <div className="flex flex-row">
                      <span>Token Standard</span>
                      <span className="grow"></span>
                      <span>LSP8</span>
                    </div>
                    <div className="flex flex-row">
                      <span>Blochain</span>
                      <span className="grow"></span>
                      <span>Lukso - L16</span>
                    </div>
                  </div>
                </div>
                <a
                  className="py-4"
                  target="_blank"
                  rel="noreferrer"
                  href={`https://explorer.execution.l16.lukso.network/address/${data.collection.address}`}
                >
                  BlockScout
                </a>
                <br />
                {data.token.metadata && <a
                  className="py-4"
                  href={data.token.metadata.replace("ipfs://", IPFS_GATEWAY)}
                  target="_blank"
                  rel="noreferrer"
                >
                  IPFS
                </a>}
              </div>
              <div></div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
