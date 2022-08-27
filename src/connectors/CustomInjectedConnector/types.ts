export type SendReturnResult = { result: any }
export type SendReturn = any

export type Send = () => Promise<SendReturnResult | SendReturn>
export type SendOld = ({ method }: { method: string }) => Promise<SendReturnResult | SendReturn>