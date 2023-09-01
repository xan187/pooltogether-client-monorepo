import {
  useAllUserPrizePoolWins,
  useLastCheckedDrawIds,
  usePrizeTokenPrice
} from '@generationsoftware/hyperstructure-react-hooks'
import { useMemo } from 'react'
import { Address, formatUnits } from 'viem'
import { useSupportedPrizePools } from './useSupportedPrizePools'

/**
 * Returns a user's total prize winnings in ETH
 * @returns
 */
export const useUserTotalWinnings = (
  userAddress: Address,
  options?: { skipPrizeChecking?: boolean }
) => {
  const prizePools = useSupportedPrizePools()
  const prizePoolsArray = Object.values(prizePools)

  const {
    data: wins,
    isFetched: isFetchedWins,
    refetch: refetchWins
  } = useAllUserPrizePoolWins(prizePoolsArray, userAddress)

  // TODO: this assumes every prize pool is using the same prize token - not ideal
  const { data: prizeToken, isFetched: isFetchedPrizeToken } = usePrizeTokenPrice(
    prizePoolsArray[0]
  )

  const { lastCheckedDrawIds } = useLastCheckedDrawIds()

  const totalTokensWonByChain = useMemo(() => {
    if (!!wins && !!lastCheckedDrawIds) {
      const totals: { [chainId: number]: bigint } = {}
      for (const key in wins) {
        const chainId = parseInt(key)
        const lastCheckedDrawId = lastCheckedDrawIds[userAddress.toLowerCase()]?.[chainId] ?? 0

        let chainTotal = 0n

        wins[chainId].forEach((win) => {
          if (win.drawId <= lastCheckedDrawId || options?.skipPrizeChecking) {
            chainTotal += BigInt(win.payout)
          }
        })

        totals[chainId] = chainTotal
      }
      return totals
    }
  }, [wins, lastCheckedDrawIds, userAddress, options])

  return useMemo(() => {
    const isFetched =
      isFetchedWins && isFetchedPrizeToken && !!wins && !!prizeToken && !!totalTokensWonByChain

    let totalWinnings = 0

    if (isFetched) {
      for (const key in totalTokensWonByChain) {
        const chainId = parseInt(key)
        const tokenAmount = parseFloat(
          formatUnits(totalTokensWonByChain[chainId], prizeToken.decimals)
        )
        totalWinnings += tokenAmount * prizeToken.price
      }
    }

    return { isFetched, refetch: refetchWins, data: isFetched ? totalWinnings : undefined }
  }, [totalTokensWonByChain, prizeToken])
}
