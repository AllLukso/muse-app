/* This example requires Tailwind CSS v2.0+ */
import { useEffect, useState } from "react";

import Header from "../../components/Header"

import addIcon from '../../addIcon.svg';
import { useParams } from "react-router-dom";

interface NFTCardProps {
  address: string,
  tokenId: number
}

function NFTCard ({ address, tokenId }: NFTCardProps) {
  const [loaded, setLoaded] = useState<boolean>(false);
  const [image, setIamge] = useState<string>('');
  const [alt, setAlt] = useState<string>('');
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    if (loaded) { return; }

    fetch(`http://localhost:5000/nft/collection/${address}/${tokenId}?chain=ethereum`).then(res => res.json()).then((data) => {
      console.log();

      setIamge(data.image.replace('ipfs://', 'https://ipfs.io/ipfs/'));
      setAlt(data.name);
      setLoaded(true)
    });
  }, [loaded, address, tokenId]);

  if (!loaded) {
    return <div className="rounded-3xl border border-gray-300 hover:shadow-2xl mb-8 transition transition-duration-700">Loading</div>
  }

  return <div className="rounded-3xl border border-gray-300 hover:shadow-2xl mb-8 transition transition-duration-700" onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
    <img className={`w-full rounded-3xl transition-all transition-duration-700 ${hovered ? 'p-4' : ''}`} src={image} alt={alt} />
    <div className="p-4">
      <div>
        <span></span>
        <span>{alt}</span>
      </div>
      <div className="transition-all transition-duration-700" hidden={!hovered}>
        <button className="bg-black text-white font-bold py-4 shadow-lg w-full rounded-2xl">
          {/* <ClipboardCopyIcon className="mx-4 h-6 w-6 inline mr-2" aria-hidden="true" /> */}
          <img className="inline mr-4"alt="Add" src={addIcon}/>
          Add to museboard
        </button>
      </div>
    </div>
  </div>
}

interface CollectionData {
  totalSupply: number,
  name: string,
  symbol: string
}

export default function CollectionPage() {
  const { address } = useParams();
  const [data, setData] = useState<CollectionData | null>();

  useEffect(() => {
    fetch(`http://localhost:5000/nft/load/${address}?chain=ethereum`).then(response => response.json()).then(setData);
  }, []);

  return (
    <>
      <div className="min-h-full">
        <Header />
        <main>
          <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          { data && <h3>{data.name}</h3>}
          <br/>
          <div className="columns-4">
            { data && new Array(100).fill(1).map((_, tokenId) => <NFTCard key={`${address}:${tokenId}`} address={address as string} tokenId={tokenId + 1} />) }
          </div>
          </div>
        </main>
      </div>
    </>
  )
}
