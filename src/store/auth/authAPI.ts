import axios from "axios";
import { SiweMessage } from 'siwe';

import { getAuth, signInWithCustomToken } from "firebase/auth";

// A mock function to mimic making an async request for data
export function getNonce() {
  return fetch('http://localhost:5000/siwe/nonce').then((res) => {
    return res.json();
  });
}

// A mock function to mimic making an async request for data
export function verify() {
  return new Promise<{ token: string }>((resolve) =>
    setTimeout(() => resolve({ token: 'token' }), 500)
  );
}

function createSiweMessage (address: string, statement: string) {
  const domain = window.location.host;
  const origin = window.location.origin;

  const message = new SiweMessage({
    domain,
    address,
    statement,
    uri: origin,
    version: '1',
    chainId: 2828
  });

  return message.prepareMessage();
}

export async function authenticateAccount (account: string) {
  // const signer = await library.getSigner();
  const message = createSiweMessage(account, 'Login in to muse board');
  const { signature } = await (window.ethereum as any).request({
    method: 'eth_sign',
    params: [account, message],
  });

  try {
    const response = await axios.post('http://localhost:5000/siwe/verify', { signature, message });

    const { token } = response.data;

    return signInWithCustomToken(getAuth(), token);
  } catch (error) {
    console.log(error);
  }
}