import { NO_REFETCH } from '@shared/generic-react-hooks'
import { useQueries } from '@tanstack/react-query'
import { useMemo } from 'react'
import { GetTransactionReceiptReturnType } from 'viem'
import { usePublicClient } from 'wagmi'

export const useTxReceipts = (
  chainId: number,
  hashes: `0x${string}`[]
): { data: GetTransactionReceiptReturnType[]; isFetched: boolean } => {
  const publicClient = usePublicClient({ chainId })

  const getQueryKey = (hash: `0x${string}`) => ['txReceipt', chainId, hash]

  const results = useQueries({
    queries: hashes.map((hash) => {
      return {
        queryKey: getQueryKey(hash),
        queryFn: async () => await publicClient.getTransactionReceipt({ hash }),
        enabled: !!chainId && !!publicClient && !!hash,
        ...NO_REFETCH
      }
    })
  })

  return useMemo(() => {
    const isFetched = results?.every((result) => result.isFetched)

    const data = results
      .filter((result) => !!result.data)
      .map((result) => result.data) as GetTransactionReceiptReturnType[]

    return { isFetched, data }
  }, [results])
}
