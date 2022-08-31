import { useEffect } from "react";

import { BrowserRouter, Route, Routes } from "react-router-dom";
import { getAuth } from "firebase/auth";

import { setUser } from "./store/auth/authSlice";

import { useAppDispatch, useAppSelector } from "./app/hooks";

import Web3Root  from "./Web3Container";

import App from './App';
import CollectionPage from "./pages/CollectionPage";
import ProfilePage from './pages/profile/ProfilePage';
import TokenPage from './pages/token';
import BoardPage from "./pages/board";

import CreateMuseBoardModal from './components/CreateMuseBoard';
import { getMuseState, loadBoardsForAddress, loadMuse } from "./store/muse/museSlice";
import { useWeb3React } from "@web3-react/core";
import AddTokenToBoard from "./components/AddTokenToBoard";
import Header from "./components/Header";

function StoreLoader () {
  const dispatch = useAppDispatch();
  const museState = useAppSelector(getMuseState);
  const { account, library } = useWeb3React('NETWORK');

  useEffect(() => {
    if (!account) { return; }

    if (museState.status === 'created') {
      const action = loadMuse({ address: account as string, provider: library });

      dispatch(action);
    }

    if (museState.status === 'idle' && museState.initialised) {
      const action = loadBoardsForAddress({
        address: museState.boardsContract.address as string,
        provider: library
      });

      dispatch(action);
    }
  }, [museState.status, museState.initialised, account]);

  return <></>
}

export default function Bootstrap() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    const auth = getAuth();

    auth.onAuthStateChanged((user) => {
      dispatch(setUser(user ? user.uid : null));
    });
  }, []);

  return (
    <Web3Root>
      <>
        <StoreLoader />
        <BrowserRouter>
          <Header />
          <Routes>
            <Route path="/" element={<App />} />
            <Route path="/collection/:address/token/:tokenId" element={<TokenPage />} />
            <Route path="/collection/:address" element={<CollectionPage />} />
            <Route path="/profile/:address" element={<ProfilePage />} />
            <Route path="/board/:address/:boardId" element={<BoardPage />} />
          </Routes>
          <CreateMuseBoardModal />
          <AddTokenToBoard />
        </BrowserRouter>
      </>
    </Web3Root>
  );
}
