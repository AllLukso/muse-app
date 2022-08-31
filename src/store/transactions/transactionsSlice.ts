import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { providers } from 'ethers';
import { RootState} from '../../app/store';

export interface TransactionsState {
  initialised: boolean;
  boardsContract: {
    address: string | null;
    created: boolean;
    updated: boolean;
  }
  status: 'idle' | 'loading' | 'failed';
  newBoardModal: {
    open: boolean
  }
}

const initialState: TransactionsState = {
  initialised: false,
  boardsContract: {
    address: null,
    created: false,
    updated: false
  },
  status: 'idle',
  newBoardModal: {
    open: false
  }
};

export const transactionsSlice = createSlice({
  name: 'muse',
  initialState,
  // The `reducers` field lets us define reducers and generate associated actions
  reducers: {
    openNewBoardModal: (state) => {
      state.newBoardModal.open = true;
    },
    closeNewBoardModal: (state) => {
      state.newBoardModal.open = false;
    }
  },
  // The `extraReducers` field lets the slice handle actions defined elsewhere,
  // including actions generated by createAsyncThunk or in other slices.
  extraReducers: (builder) => {
    
  },
});

export const { openNewBoardModal, closeNewBoardModal } = transactionsSlice.actions;

export default transactionsSlice.reducer;