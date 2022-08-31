
export async function fetchToken (address: string, tokenId: string) {
  const res = await fetch(`${process.env.REACT_APP_API_HOST}/nft/collection/${address}/${tokenId}?chain=l16`);

  return res.json();
}

export function fetchList () {
  return fetch(`${process.env.REACT_APP_API_HOST}/nft/list`).then(res => res.json());
} 

// useEffect(() => {
  //   if (loadingData) {
  //     return;
  //   }

  //   const imagePath = tokenData
  //     ? "token.images.0.url"
  //     : "LSP4Metadata.images.0.1.url";
  //   const descriptionPath = tokenData
  //     ? "token.description"
  //     : "LSP4Metadata.description";

  //   setAlt(data.name);

  //   const dataPromise = tokenData
  //     ? Promise.resolve(tokenData)
  //     : fetchTokenId(tokenId);

  //   dataPromise.then((_data: any) => {
  //     if (!_data) {
  //       return;
  //     }

  //     const imageUrl = safeGet(_data, imagePath);
  //     const { title } = extractTitle(safeGet(_data, descriptionPath));

  //     title && setAlt(title);

  //     if (imageUrl) {
  //       setImage(imageUrl.replace("ipfs://", IPFS_GATEWAY));
  //     } else {
  //       const logoUrl = safeGet(_data, "LSP4Metadata.icon.0.url");

  //       logoUrl && setImage(logoUrl.replace("ipfs://", IPFS_GATEWAY));
  //     }
  //   });
  // }, [loadingData, tokenId]);