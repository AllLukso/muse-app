import { useEffect } from "react";

import { BrowserRouter, Route, Routes } from "react-router-dom";
import { getAuth } from "firebase/auth";

import { setUser } from "./store/auth/authSlice";

import { useAppDispatch } from "./app/hooks";

import Web3Root  from "./Web3Container";

import App from './App';
import CollectionPage from "./pages/CollectionPage";
import ProfilePage from './pages/profile/ProfilePage';


export default function Bootstrap() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    const auth = getAuth();

    auth.onAuthStateChanged((user) => {
      user?.getIdToken().then(console.log);

      dispatch(setUser(user ? user.uid : null));
    });
  }, []);

  return (
    <Web3Root>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<App />} />
          <Route path="/collection/:address" element={<CollectionPage />} />
          <Route path="/profile/:address" element={<ProfilePage />} />
        </Routes>
      </BrowserRouter>
    </Web3Root>
  );
}
