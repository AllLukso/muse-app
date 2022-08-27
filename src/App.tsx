/* This example requires Tailwind CSS v2.0+ */
import { useState } from "react";

import Header from "./components/Header"

import nftImage from './nft_1.png';
import nftImage1 from './nft_2.png';
import nftImage2 from './nft_3.png';

import addIcon from './addIcon.svg';

interface NFTCardProps {
  image: string,
  alt: string
}

function NFTCard ({ image, alt }: NFTCardProps) {
  const [hovered, setHovered] = useState(false);

  return <div className="rounded-3xl border border-gray-300 hover:shadow-2xl mb-8 transition transition-duration-700" onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
    <img className={`w-full rounded-3xl transition-all transition-duration-700 ${hovered ? 'p-4' : ''}`} src={image} alt={alt} />
    <div className="p-4">
      <div>
        <span></span>
        <span>From: Some Collection</span>
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

export default function App() {
  return (
    <>
      <div className="min-h-full">
        <Header />
        <main>
          <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="columns-4">
            <NFTCard image={nftImage} alt="Img1"/>
            <NFTCard image={nftImage1} alt="Img2"/>
            <NFTCard image={nftImage2} alt="Img2" />
            <NFTCard image={nftImage2} alt="Img2" />
          </div>
          </div>
        </main>
      </div>
    </>
  )
}
