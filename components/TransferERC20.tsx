"use client"

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
  // console.log('chain', chain)

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

  // Give back a "prepared config" to be sent through, including gas estimate and other information
  // needed for the transaction. The function also performs basic checks such as address validity and whether the  
  // provided token address is indeed a contract.
  // This hook runs only if token address, recipient and amount are defined (see `enabled` condition).
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
    enabled: Boolean(debouncedERC20Token && debouncedRecipient && debouncedAmount), // Run this query automatically only if token address, recipient and amount are defined
  })
  // console.log('debouncedERC20Token', debouncedERC20Token)
  // console.log('debouncedRecipient', debouncedRecipient)
  // console.log('debouncedAmount', debouncedAmount)

  // console.log('config', config)
  // console.log('prepareError', prepareError)


  // Perform the actual contract write transaction.
  const { data: writeData, error: writeError, isError: isWriteError, write } = useContractWrite(config)
  // console.log('writeData', writeData)
  // console.log('writeError', writeError)
  // console.log('isWriteError', isWriteError)
  // console.log('write',write)

  const { isLoading, isSuccess } = useWaitForTransaction({
    hash: writeData?.hash,
  })
  // console.log('isLoading', isLoading)

  // Get the block explorer link from the chains array based on the chain ID
  const blockExplorerLink = chain?.blockExplorers?.default.url;

  // Fetch token balance
  const balance = useBalance({
    address: address,
    token: debouncedERC20Token,
    // watch: true
  })

  // Render
  return (
    <>  
        <div className='w-full p-5 rounded-lg border'>
          <div className='mb-3 flex items-center gap-5'>
            <div>
              <svg 
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 512 512"
                className="h-5 w-5"
              >
                {/* <!--! Font Awesome Free 6.1.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free (Icons: CC BY 4.0, Fonts: SIL OFL 1.1, Code: MIT License) Copyright 2022 Fonticons, Inc. --> */}
                <path d="M511.6 36.86l-64 415.1c-1.5 9.734-7.375 18.22-15.97 23.05c-4.844 2.719-10.27 4.097-15.68 4.097c-4.188 0-8.319-.8154-12.29-2.472l-122.6-51.1l-50.86 76.29C226.3 508.5 219.8 512 212.8 512C201.3 512 192 502.7 192 491.2v-96.18c0-7.115 2.372-14.03 6.742-19.64L416 96l-293.7 264.3L19.69 317.5C8.438 312.8 .8125 302.2 .0625 289.1s5.469-23.72 16.06-29.77l448-255.1c10.69-6.109 23.88-5.547 34 1.406S513.5 24.72 511.6 36.86z"/>
              </svg>
            </div>
            <div className='font-bold mr-auto'>TOKEN TRANSFER</div>
            <div>
              <svg 
                xmlns="http://www.w3.org/2000/svg"
                fill="currentColor"
                className="bi bi-gear-fill h-5 w-5"
                viewBox="0 0 16 16">
                <path d="M9.405 1.05c-.413-1.4-2.397-1.4-2.81 0l-.1.34a1.464 1.464 0 0 1-2.105.872l-.31-.17c-1.283-.698-2.686.705-1.987 1.987l.169.311c.446.82.023 1.841-.872 2.105l-.34.1c-1.4.413-1.4 2.397 0 2.81l.34.1a1.464 1.464 0 0 1 .872 2.105l-.17.31c-.698 1.283.705 2.686 1.987 1.987l.311-.169a1.464 1.464 0 0 1 2.105.872l.1.34c.413 1.4 2.397 1.4 2.81 0l.1-.34a1.464 1.464 0 0 1 2.105-.872l.31.17c1.283.698 2.686-.705 1.987-1.987l-.169-.311a1.464 1.464 0 0 1 .872-2.105l.34-.1c1.4-.413 1.4-2.397 0-2.81l-.34-.1a1.464 1.464 0 0 1-.872-2.105l.17-.31c.698-1.283-.705-2.686-1.987-1.987l-.311.169a1.464 1.464 0 0 1-2.105-.872l-.1-.34zM8 10.93a2.929 2.929 0 1 1 0-5.86 2.929 2.929 0 0 1 0 5.858z"/>
              </svg>
            </div>
          </div>
          <hr className='mb-6'/>
          <form
            onSubmit={(e) => {
              e.preventDefault() // prevent the default behavior of form submissions to refresh the page to preserve the user inputs
              write?.()
            }}
            className="w-full"
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
            <div className="text-right text-sm mb-1">
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
                className="bg-gray-50 border border-gray-300 text-gray-900 text-md rounded-lg block w-full p-2.5 mb-4"
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
                className="bg-gray-50 border border-gray-300 text-gray-900 text-md rounded-lg block w-full p-2.5 mb-10"
              />
            </div>
            <>
              <button 
                disabled={!write || isLoading}
                type = "submit"
                className={`text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-3.5 text-center ${!write || isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
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
        </div>
    </>
  )
}

