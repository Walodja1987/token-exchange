/**
 * Component to delay the update of a value until a certain period of inactivity has passed. Used for performance reasons as recommended here
 * in the wagmi docs: https://wagmi.sh/examples/contract-write-dynamic#step-5-add-a-debounce-to-the-input-value
 * Source of component code: https://usehooks-ts.com/react-hook/use-debounce
 */
import { useEffect, useState } from 'react'

export function useDebounce<T>(value: T, delay?: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay || 500)

    return () => {
      clearTimeout(timer)
    }
  }, [value, delay])

  return debouncedValue
}
