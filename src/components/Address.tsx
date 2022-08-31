import { ClipboardCopyIcon } from '@heroicons/react/outline';

function copy (text: string) {
  navigator.clipboard.writeText(text)
}

export default function Address({ address }: { address: string }) {
  return (
      <p>
        <span className="pr-2">{address.substring(0, 5)}...{address.substring(address.length - 5)}</span>
        <button className="inline" onClick={() => copy(address)}><ClipboardCopyIcon className="h-5 w-5"/></button>
      </p>
  );
}
