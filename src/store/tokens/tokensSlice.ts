import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { useAppDispatch } from '../../app/hooks';
import { RootState } from '../../app/store';
import { fetchList, fetchToken } from './tokensAPI';

export interface ImageRef {
  hash: string;
  hashFunction: string;
  height: number;
  width: number;
  url: string;
}

export interface Asset {
  hash: string;
  hashFunction: string;
  height: number;
  width: number;
  url: string;
}

export interface Icon {
  hash: string;
  hashFunction: string;
  height: number;
  width: number;
  url: string;
}

export interface Collection {
  name: string;
  symbol: string;
  address: string;
  metadata: {
    hash: string,
    hashFunction: string,
    url: string
  };
  creators: any[];
  images: ImageRef[]
}

export interface Token {
  id: string,
  address: string;
  description: string;
  icons: Icon[];
  assets: Asset[][];
  images: ImageRef[][];
  links: any[];
  metadata: string;
}

export interface TokenListItem {
  address: string,
  tokenId: string,
  loading: boolean,
  token?: Token;
  collection?: Collection;
}

export interface TokensListState {
  tokens: TokenListItem[],
  collections: Map<string, Map<string, string>>,
  loading: boolean;
}

const initialState: TokensListState = {
  tokens: [],
  collections: {} as Map<string, Map<string, string>>,
  loading: true,
};

// The function below is called a thunk and allows us to perform async logic. It
// can be dispatched like a regular action: `dispatch(incrementAsync(10))`. This
// will call the thunk with the `dispatch` function as the first argument. Async
// code can then be executed and other actions can be dispatched. Thunks are
// typically used to make async requests.
export const fetchTokenList = createAsyncThunk(
  'tokens/fetchList',
  async () => {
    const response = await fetchList();

    return response;
  }
);

export const fetchTokenData = createAsyncThunk(
  'tokens/fetchTokenData',
  async ({ contract, tokenId }: { contract: string, tokenId: string }) => {
    const response = await fetchToken(contract, tokenId);

    return response;
  }
);

export const tokensSlick = createSlice({
  name: 'tokens',
  initialState,
  // The `reducers` field lets us define reducers and generate associated actions
  reducers: {
  },
  // The `extraReducers` field lets the slice handle actions defined elsewhere,
  // including actions generated by createAsyncThunk or in other slices.
  extraReducers: (builder) => {
    builder
      .addCase(fetchTokenList.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchTokenList.fulfilled, (state, action) => {
        state.loading = false;
        state.tokens = (action.payload as TokenListItem[]).map((_d) => ({
          token: _d.token,
          collection: _d.collection,
          loading: false,
          address: _d.collection?.address,
          tokenId: _d.token?.id
        })) as TokenListItem[];
      })

    builder
      .addCase(fetchTokenData.rejected, (state, action) => {
        console.log('Rejected fetch data');

        const { tokenId, contract } = action.meta.arg;
        const tokenIndex = state.tokens.findIndex((token) => {
          return token.address === contract && tokenId === token.tokenId;
        });

        state.tokens[tokenIndex].loading = false;
        (state.tokens[tokenIndex].token as any) = {
          id: tokenId,
          address: contract,
          icons: [],
          images: [],
          description: 'Could not fetch token',
          assets: [],
          links: []
        }
      })
      .addCase(fetchTokenData.pending, (state, action) => {
        const { tokenId, contract } = action.meta.arg;

        const existingTokenIndex = state.tokens.findIndex((token) => {
          return token.address === contract && tokenId === token.tokenId;
        });

        if (existingTokenIndex >= 0) {
          state.tokens[existingTokenIndex].loading = true;
        }
        else {
          state.tokens.push({
            address: contract,
            tokenId: tokenId,
            loading: true
          })
        }
      })
      .addCase(fetchTokenData.fulfilled, (state, action) => {
        const { tokenId, contract } = action.meta.arg;

        const _data = {
          loading: false,
          tokenId: tokenId,
          address: contract,
          token: action.payload.token,
          collection: action.payload.collection
        };

        const existingTokenIndex = state.tokens.findIndex((token) => {
          return token.address === contract && tokenId === token.tokenId;
        });

        if (existingTokenIndex >= 0) {
          state.tokens[existingTokenIndex] = _data;
        } else {
          state.tokens.push(_data)
        }
      })
  },
});

// The function below is called a selector and allows us to select a value from
// the state. Selectors can also be defined inline where they're used instead of
// in the slice file. For example: `useSelector((state: RootState) => state.counter.value)`
export const selectTokenList = (state: RootState) => {
  return state.tokens.tokens;
}

export const getToken = (contract: string, tokenId: string) => (state: RootState): TokenListItem => {
  const token = state.tokens.tokens.find((tokenListItem) => {
    return tokenListItem.address === contract && tokenListItem.tokenId === tokenId
  });

  if (!token) {
    const dispatch = useAppDispatch();

    dispatch(fetchTokenData({ contract, tokenId }));

    return { loading: true, address: contract, tokenId };
  }

  return token;
}

export default tokensSlick.reducer;