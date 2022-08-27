/// <reference types="react-scripts" />

interface Ethereum {
  request: unknown
  enable: () => Promise<string[]>
  on?: (method: string, listener: (...args: any[]) => void) => void
  removeListener?: (method: string, listener: (...args: any[]) => void) => void
}

declare interface Window {
  ethereum?: Ethereum
}

declare const __DEV__: boolean

declare module '@lukso/lsp-smart-contracts/constants'