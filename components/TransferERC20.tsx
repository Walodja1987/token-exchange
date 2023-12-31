import * as React from 'react'
import {
  usePrepareContractWrite,
  useContractWrite,
  useContractRead,
  useWaitForTransaction,
  useNetwork,
  useAccount,
  useBalance,
} from 'wagmi'
import { parseUnits } from 'viem'
import erc20ABI from '../abis/IERC20.json'
import { useDebounce } from 'usehooks-ts' // Alternatively, check useDebounce.tsx component, suggested here: https://wagmi.sh/examples/contract-write-dynamic#step-5-add-a-debounce-to-the-input-value 
 
export function TransferERC20() {
  // Get connected wallet address
  const { address } = useAccount();
  
  // Get the info about the connected chain (incl. name, id, native currency, block explorer link, etc.)
  const { chain } = useNetwork();

  const [erc20Token, setERC20Token] = React.useState('0xf5d5Ea0a5E86C543bEC01a9e4f513525365a86fD')
  const [recipient, setRecipient] = React.useState('')
  const [amount, setAmount] = React.useState('')

  // As the `usePrepareContractWrite` hook performs an RPC request to obtain the gas estimate on mount
  // and on every change to `args`, we don't want to spam the RPC and become rate-limited.
  // To mitigate this, delay the update of a value after 500 milliseconds of inactivity
  const debouncedERC20Token = useDebounce(erc20Token, 500) as `0x${string}`
  const debouncedRecipient = useDebounce(recipient, 500)
  const debouncedAmount = useDebounce(amount, 500) as `${number}` // Field input is restricted to number. Hence, cast to `${number}`
  
  const { data: readData } = useContractRead({
    address: debouncedERC20Token,
    abi: erc20ABI,
    functionName: 'decimals',
  })
  const decimals = readData as number

  // Give back a "prepared config" to be sent through to, including gas estimate and other information
  // needed for the transaction. The function also also performs basic checks such as address validity and whether the  
  // provided token address is indeed a contract.
  const {
    config,
    error: prepareError,
    isError: isPrepareError
  } = usePrepareContractWrite({
    address: debouncedERC20Token,
    abi: erc20ABI,
    functionName: 'transfer',
    args: [
      debouncedRecipient,
      parseUnits(debouncedAmount || '0', decimals)
    ], // || '0' required to handle potentially undefined `debouncedAmount` value
    enabled: Boolean(debouncedERC20Token && debouncedRecipient && debouncedAmount), // Run this query automatically only if both, recipient and amount are defined
  })

  // Perform the actual contract write transaction.
  const { data: writeData, error: writeError, isError: isWriteError, write } = useContractWrite(config)

  const { isLoading, isSuccess } = useWaitForTransaction({
    hash: writeData?.hash,
  })

  // Get the block explorer link from the chains array based on the chain ID
  const blockExplorerLink = chain?.blockExplorers?.default.url;

  // Fetch token balance
  const balance = useBalance({
    address: address,
    token: debouncedERC20Token,
    watch: true
  })

  // Render
  return (
    <>      
      <form
        onSubmit={(e) => {
          e.preventDefault() // prevent the default behavior of form submissions to refresh the page to preserve the user inputs
          write?.()
        }}
        className="w-1/4"
      >      
        <div>
          <label htmlFor="Token">Token</label>
          <input
            id="erc20token"
            type="text"
            onChange={(e) => setERC20Token(e.target.value)}
            placeholder="0xf5d5Ea0a5E86C543bEC01a9e4f513525365a86fD"
            value={erc20Token}
            autoComplete="off"
            className="bg-gray-50 border border-gray-300 text-gray-900 text-md rounded-lg block w-full p-2.5"
          />
        </div>
        <div className="text-right text-sm">
          Balance: {balance.data?.formatted ? parseFloat(balance.data?.formatted).toFixed(2) : ''} {balance.data?.symbol}
        </div>
        <div>
          <label htmlFor="Recipient">Recipient</label>
          <input
            id="recipient"
            type="text"
            onChange={(e) => setRecipient(e.target.value)}
            placeholder="0x47566C6c8f70E4F16Aa3E7D8eED4a2bDb3f4925b"
            value={recipient}
            autoComplete="off"
            className="bg-gray-50 border border-gray-300 text-gray-900 text-md rounded-lg block w-full p-2.5"
          />
        </div>
        <div>
          <label htmlFor="Amount">Amount</label>
          <input
            id="amount"
            type="number"
            onChange={(e) => setAmount(e.target.value)}
            placeholder="100"
            value={amount}
            autoComplete="off"
            className="bg-gray-50 border border-gray-300 text-gray-900 text-md rounded-lg block w-full p-2.5"
          />
        </div>
        <>
          <button 
            disabled={!write || isLoading}
            type = "submit"
            className={`text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center mt-4 ${!write || isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {isLoading ? 'Transferring...' : 'Transfer'}
          </button>
          {isSuccess && (
            <div>
              Successfully transferred the token!
              <div>
                <a href={`${blockExplorerLink}/tx/${writeData?.hash}`}>Block explorer</a>
              </div>
            </div>
          )}
          {/* Throw if there was an error while preparing the write contract tx */}
          {(isPrepareError || isWriteError) && (
            <div>Error: {(prepareError || writeError)?.message}</div>
          )}
        </>
      </form>
    </>
  )
}

