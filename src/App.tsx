// eslint-disable react-hooks/exhaustive-deps
import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "./app/hooks";

import NFTCard from "./components/NFTCard";
import { fetchTokenList, selectTokenList, TokenListItem } from "./store/tokens/tokensSlice";



export default function App() {
  const dispatch = useAppDispatch();
  const tokens = useAppSelector(selectTokenList);

  useEffect(() => {
    dispatch(fetchTokenList());
  }, []);

  return (
    <>
      <div className="min-h-full">
        <main>
          <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
            <div className="columns-1 md:columns-2 lg:columns-4 gap-4">
              {tokens.map((_tokenData: TokenListItem, idx) => {
                return <NFTCard
                  key={idx}
                  tokenId={_tokenData.tokenId}
                  address={_tokenData.address}
                  classes="h-fit mb-4"
                />
              })}
            </div>
          </div>
        </main>
      </div>
    </>
  )
}
