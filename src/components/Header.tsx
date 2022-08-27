import { Fragment } from 'react'

import { Disclosure } from "@headlessui/react";
import { BellIcon, MenuIcon, XIcon, UserCircleIcon, SearchIcon } from "@heroicons/react/outline";

import { useWeb3React } from '@web3-react/core';
import logo from '../logo.svg';

import { connector } from '../Web3Container';
import { getAuth } from 'firebase/auth';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { getUser, loginWithLukso } from '../store/auth/authSlice';

function signOut (deactivateNetwork: Function) {
  const auth = getAuth();

  return auth.signOut().then(() => deactivateNetwork());
}

function ConnectWallet ({ activateNetwork }: any): JSX.Element {
  return <button
    className="px-8 py-2 rounded-lg shadow-md bg-purple-200 text-purple-900"
    onClick={() => activateNetwork(connector)}
  >
    Connect Wallet
  </button>
}

function NavActions ({ account, active, activate, deactivate }: { account: string | null | undefined, active: boolean, activate: Function, deactivate: Function }) {
  const user = useAppSelector(getUser);
  const dispatch = useAppDispatch();

  if (!active) {
    return <ConnectWallet activateNetwork={activate} />
  }

  if (!user) {
    return <button
      type="button"
      className="px-4 py-2 rounded-xl text-gray-800 transition duration-700 hover:bg-gray-200 hover:text-gray-900  focus:outline-none"
      onClick={() => dispatch(loginWithLukso(account as string))}
    >
      <span className="sr-only">Sign In</span>
      {/* <UserCircleIcon className="h-6 w-6 inline mr-2" aria-hidden="true" /> */}
      Login
    </button>
  }

  return (
    <>
      <button
        type="button"
        className="px-4 py-2 rounded-xl text-gray-800 transition duration-700 hover:bg-gray-200 hover:text-gray-900  focus:outline-none"
      >
        <span className="sr-only">View notifications</span>
        <BellIcon className="h-6 w-6 inline mr-2" aria-hidden="true" />
        Notifications
      </button>
      <button
        type="button"
        className="px-4 py-2 rounded-xl text-gray-800 transition duration-700 hover:bg-gray-200 hover:text-gray-900  focus:outline-none"
      >
        <span className="sr-only">View Profile</span>
        <UserCircleIcon className="h-6 w-6 inline mr-2" aria-hidden="true" />
        Profile
      </button>
      <button
        type="button"
        className="px-4 py-2 rounded-xl text-gray-800 transition duration-700 hover:bg-gray-200 hover:text-gray-900  focus:outline-none"
        onClick={() => signOut(deactivate)}
      >
        <span className="sr-only">Sign Out</span>
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
        </svg>
      </button>
    </>
  );
}

export default function Header() {
  const { account, active, activate, deactivate } = useWeb3React('NETWORK');

  const imageUrl = `https://avatars.dicebear.com/api/identicon/${account}.svg`

  return <Disclosure as="nav" className="bg-white border border-b-gray-200 border-b-1 ">
    {({ open }) => (
      <>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <button className="flex-shrink-0">
                <img src={logo} alt="Museboard"/>
              </button>
            </div>
            <div className="flex flex-grow ml-16 py-2 rounded-full border border-gray-200 ">
              <SearchIcon className="mx-4 h-6 w-6 inline mr-2" aria-hidden="true" />
              <input className="focus:outline-none w-full inline-block" name="searchQuery" placeholder="Search all Web3"/>
            </div>
            <div className="hidden md:block">
              <div className="ml-4 flex items-center md:ml-6">
                <NavActions account={account} active={active} activate={activate} deactivate={deactivate}/>
              </div>
            </div>
            <div className="-mr-2 flex md:hidden">
              {/* Mobile menu button */}
              <Disclosure.Button className="bg-gray-800 inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white">
                <span className="sr-only">Open main menu</span>
                {open ? (
                  <XIcon className="block h-6 w-6" aria-hidden="true" />
                ) : (
                  <MenuIcon className="block h-6 w-6" aria-hidden="true" />
                )}
              </Disclosure.Button>
            </div>
          </div>
        </div>

        <Disclosure.Panel className="md:hidden">
          <div className="pt-4 pb-3 border-t border-gray-700">
            <div className="flex items-center px-5">
              <div className="flex-shrink-0">
                <img
                  className="h-10 w-10 rounded-full"
                  src={imageUrl}
                  alt=""
                />
              </div>
              <div className="ml-3">
                <div className="text-base font-medium leading-none text-white">
                  {`${account?.substring(0, 5)}...${account?.slice(-5)}`}
                </div>
                <div className="text-sm font-medium leading-none text-gray-400">
                  {account}
                </div>
              </div>
              <button
                type="button"
                className="ml-auto bg-gray-800 flex-shrink-0 p-1 rounded-full text-gray-400 hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white"
              >
                <span className="sr-only">View notifications</span>
                <BellIcon className="h-6 w-6" aria-hidden="true" />
              </button>
            </div>
            <div className="mt-3 px-2 space-y-1">
              <Disclosure.Button
                  as="a"
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-400 hover:text-white hover:bg-gray-700"
                >
                  {`${account?.substring(0, 5)}...${account?.slice(-5)}`}
              </Disclosure.Button>
            </div>
          </div>
        </Disclosure.Panel>
      </>
    )}
  </Disclosure>;
}
