import {
  usePrizePool,
  usePrizeTokenPrice,
  useVault,
  useVaultSharePrice
} from '@pooltogether/hyperstructure-react-hooks'
import { PRIZE_POOLS } from '@shared/utilities'
import { SupportedNetwork } from 'src/types'
import { Address, parseUnits } from 'viem'

/**
 * Returns an initial exchange rate for POOL on the liquidation pair
 * @param chainId chain ID of the liquidation pair
 * @param vaultAddress vault address to configure for
 * @returns
 */
export const useLiquidationPairInitialAmountIn = (
  chainId: SupportedNetwork,
  vaultAddress: Address
) => {
  const vault = useVault({ chainId, address: vaultAddress })
  const { data: shareToken, isFetched: isFetchedShareToken } = useVaultSharePrice(vault)

  const prizePoolAddress = PRIZE_POOLS.find((pool) => pool.chainId === chainId)?.address as Address

  const prizePool = usePrizePool(chainId, prizePoolAddress)
  const { data: prizeToken, isFetched: isFetchedPrizeToken } = usePrizeTokenPrice(prizePool)

  const isFetched = isFetchedShareToken && isFetchedPrizeToken

  const initialAmountIn =
    !!shareToken && !!prizeToken
      ? parseUnits(`${shareToken.price / prizeToken.price}`, prizeToken.decimals)
      : undefined

  return { data: initialAmountIn, isFetched }
}