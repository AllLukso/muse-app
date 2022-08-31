/* This example requires Tailwind CSS v2.0+ */
import React, { Fragment, useEffect, useState } from "react";

import { Transition, Dialog, Switch } from "@headlessui/react";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import { closeNewBoardModal, deployMuseboardsNFT, getMuseState, loadBoardsForAddress, newBoardModal, setMuseboardsNFT } from "../store/muse/museSlice";
import { PhotographIcon } from "@heroicons/react/solid";
import { PencilAltIcon } from "@heroicons/react/outline";
import { useWeb3React } from "@web3-react/core";
import { createBoard } from "../store/muse/ipfsService";
import { Loader } from "./AddTokenToBoard";

function CircleFileUpload({ onChange }: { onChange: Function }) {
  const [uploaded, setUploaded] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [fileURL, setFileURL] = useState<string | null>(null);

  function handleUpload(files: FileList) {
    setFile(files[0]);
    setFileURL(URL.createObjectURL(files[0]));
    setUploaded(true);
  }

  useEffect(() => {
    onChange(file);
  }, [file])

  return (
    <label
      htmlFor="file-upload"
      className="relative cursor-pointer bg-white font-medium focus-within:outline-none"
    >
      {uploaded && (
        <div className="inline-block h-20 w-20 leading-4 mx-auto relative">
          <img src={fileURL as string} className=" rounded-full" alt="Logo" />
          <span className="h-10 w-10 absolute -right-2 -bottom-2 bg-white shadow-md hover:shadow-xl rounded-full">
            <PencilAltIcon className="h-5 w-5 mt-2.5 mx-auto" />
          </span>
        </div>
      )}
      {!uploaded && (
        <span className="inline-block h-20 w-20 leading-4 hover:shadow-lg mx-auto rounded-full bg-gradient-to-tr to-purple-500 from-cyan-500">
          <PhotographIcon className="h-10 w-10 mx-auto mt-5 text-white" />
        </span>
      )}
      <input
        id="file-upload"
        name="file-upload"
        type="file"
        className="sr-only"
        onChange={(e) => handleUpload(e.target.files as FileList)}
      />
    </label>
  );
}

function BoardForm({ submitForm, onCancel }: { submitForm: Function, onCancel: Function }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [logo, setLogo] = useState(null);
  const [enabled, setEnabled] = useState(false)

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    console.log(e);

    submitForm({ title, description, logo });
  }

  function handleClose(e: React.MouseEvent<HTMLButtonElement, MouseEvent>) {
    setTitle('');
    setDescription('');
    setLogo(null);

    onCancel();
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="text-center mt-8 mb-8">
        <CircleFileUpload onChange={setLogo} />
      </div>
      <div className="mt-4">
        <span className="py-4">Title</span>
        <input
          type="text"
          name="title"
          placeholder="Title"
          className="w-full border border-gray-100 px-4 py-2 rounded-md shadow-md"
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>
      
      <div className="mt-4">
        <span className="py-2">Description</span>
        <textarea
          name="title"
          placeholder="Optional"
          className="w-full border border-gray-100 px-4 py-2 rounded-md shadow-md"
          onChange={(e) => setDescription(e.target.value)}
        ></textarea>
      </div>
      <div>
          <Switch
          checked={enabled}
          onChange={setEnabled}
          className={`${
            enabled ? 'bg-blue-600' : 'bg-gray-200'
          } relative inline-flex h-6 w-11 items-center rounded-full`}
        >
          <span className="sr-only">Enable notifications</span>
          <span
            className={`${
              enabled ? 'translate-x-6' : 'translate-x-1'
            } inline-block h-4 w-4 transform rounded-full bg-white`}
          />
        </Switch>
      </div>
      <div className="flex flex-row space-x-4 mt-10">
        <button name="cancel" className="w-full bg-black text-white font-bold py-2 rounded-xl shadow-lg" onClick={handleClose}>
          Cancel
        </button>
        <button type="submit" name="submit" className="w-full bg-black text-white font-bold py-2 rounded-xl shadow-lg">
          Create
        </button>
      </div>
    </form>
  );
}

function DeployMuseContract () {
  const { account, library } = useWeb3React('NETWORK');
  const dispatch = useAppDispatch();

  function deployContract() {
    console.log('x');

    dispatch(deployMuseboardsNFT({ address: account as string, provider: library }))
  }

  return <div>
    <p>To start creating boards, lets quickly get our contracts in order.</p>

    <button className="w-full bg-black text-white font-bold py-2 rounded-xl shadow-lg" onClick={deployContract}>
      Deploy Contract
    </button>
  </div>
}

function UpdateMuseContract ({ contractAddress }: { contractAddress: string }) {
  const { account, library } = useWeb3React('NETWORK');
  const dispatch = useAppDispatch();

  function linkContract() {
    dispatch(setMuseboardsNFT({ address: contractAddress, owner: account as string, provider: library }))
  }

  return <div>
    <p>To start creating boards, lets quickly get our contracts in order.</p>

    <button className="w-full bg-black text-white font-bold py-2 rounded-xl shadow-lg" onClick={linkContract}>
      Link Contract to Profile
    </button>
  </div>
}

export default function CreateMuseBoard() {
  const { account, library } = useWeb3React('NETWORK');
  const dispatch = useAppDispatch();
  const createNewBoardModal = useAppSelector(newBoardModal);
  const museState = useAppSelector(getMuseState);
  const [loading, setLoading] = useState(false);
  const [status, updateStatus] = useState('');

  function closeModal() {
    dispatch(closeNewBoardModal());
  }

  async function handleCreateBoard (data: { title: string, description: string, logo: File, public?: boolean }) {
    setLoading(true);
    await createBoard(data.title, data.description, data.logo, museState.boardsContract.address as string, library, account as string, updateStatus).finally(() => setLoading(false));
    dispatch(closeNewBoardModal());
    dispatch(loadBoardsForAddress({ address: museState.boardsContract.address as string, provider: library }));
  }

  return (
    <Transition appear show={createNewBoardModal.open} as={Fragment}>
      <Dialog as="div" className="relative z-10" onClose={closeModal}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <Dialog.Title
                  as="h3"
                  className="text-xl text-center font-medium leading-6 text-gray-900"
                >
                  { museState.initialised ? 'Create museboard' : 'Start using museboard' }
                </Dialog.Title>

                { loading ? <div className="text-center"><Loader/> <div>{status}</div></div>: <>
                { museState.initialised && <BoardForm submitForm={handleCreateBoard} onCancel={closeModal} /> }
                { !museState.initialised && !museState.boardsContract.created && <DeployMuseContract /> }
                { !museState.initialised && museState.boardsContract.created && !museState.boardsContract.updated && <UpdateMuseContract contractAddress={museState.boardsContract.address as string}/> }
                </>}
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
