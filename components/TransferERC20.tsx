import * as React from 'react'
import { usePrepareContractWrite, useContractWrite } from 'wagmi'
import { parseUnits } from 'ethers/lib/utils'
import erc20ABI from '../abis/IERC20.json'
import { useDebounce } from './useDebounce'
 
export function TransferERC20() {
  const [recipient, setRecipient] = React.useState('')
  const [amount, setAmount] = React.useState('')

  // As the `usePrepareContractWrite` hook performs an RPC request to obtain the gas estimate on mount
  // and on every change to `args`, we don't want to spam the RPC and become rate-limited.
  // To mitigate this, delay the update of a value after 500 milliseconds of inactivity
  const debouncedRecipient = useDebounce(recipient, 500)
  const debouncedAmount = useDebounce(amount, 500)
  
  // Give back a "prepared config" to be sent through to, including gas estimate and other information
  // needed for the transaction
  const { config, error } = usePrepareContractWrite({
    address: '0xBE53A7e28be039259a2f19eA0A766756d2c5A0EE',
    abi: erc20ABI,
    functionName: 'transfer',
    args: [debouncedRecipient, parseUnits(debouncedAmount || '0', 18)], // || '0' required to handle potentially undefined `debouncedAmount` value
    enabled: Boolean(debouncedRecipient && debouncedAmount), // Run this query automatically only if both, recipient and amount are defined
  })

  // Perform the actual contract write transaction.
  const { write } = useContractWrite(config)

  // Render
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault() // prevent the default behavior of form submissions to refresh the page to preserve the user inputs
        write?.()
      }}
    >
      <label htmlFor="Recipient">Recipient</label>
      <input
        id="recipient"
        onChange={(e) => setRecipient(e.target.value)}
        placeholder=""
        value={recipient}
        autoComplete="off"
        />
      <label htmlFor="Amount">Amount</label>
      <input
        id="amount"
        onChange={(e) => setAmount(e.target.value)}
        placeholder=""
        value={amount}
        autoComplete="off"
      />
      <>
        <button disabled={!write}>
          Transfer
        </button>
        {error && (
          <div>An error occurred preparing the transaction: {error.message}</div>
        )}
      </>
    </form>
  )
}

