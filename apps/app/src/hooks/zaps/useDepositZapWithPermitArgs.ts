import { Vault } from '@generationsoftware/hyperstructure-client-js'
import { useVaultTokenData } from '@generationsoftware/hyperstructure-react-hooks'
import { Token } from '@shared/types'
import { vaultABI } from '@shared/utilities'
import { useMemo } from 'react'
import { getArbitraryProxyTx } from 'src/utils'
import { Address, ContractFunctionArgs, encodeFunctionData, zeroAddress } from 'viem'
import { useAccount } from 'wagmi'
import { ZAP_SETTINGS } from '@constants/config'
import { zapRouterABI } from '@constants/zapRouterABI'
import { useIsVelodromeLp } from './useIsVelodromeLp'
import { useLpToken } from './useLpToken'
import { useSendDepositZapTransaction } from './useSendDepositZapTransaction'
import { useSwapTx } from './useSwapTx'

type ZapPermit = ContractFunctionArgs<typeof zapRouterABI, 'nonpayable', 'executeOrder'>[0]
type ZapConfig = ContractFunctionArgs<typeof zapRouterABI, 'nonpayable', 'executeOrder'>[1]
type ZapRoute = ContractFunctionArgs<typeof zapRouterABI, 'nonpayable', 'executeOrder'>[3]

/**
 * Returns deposit zap with permit args
 * @param data input token, vault, signature, deadline, nonce, swapTx, amountOut, enabled
 * @returns
 */
export const useDepositZapWithPermitArgs = ({
  inputToken,
  vault,
  signature,
  deadline,
  nonce,
  swapTx,
  amountOut,
  enabled
}: {
  inputToken: Parameters<typeof useSendDepositZapTransaction>['0']
  vault: Vault
  signature: `0x${string}`
  deadline: bigint
  nonce: bigint
  swapTx: ReturnType<typeof useSwapTx>['data']
  amountOut?: { expected: bigint; min: bigint }
  enabled?: boolean
}) => {
  const zapRouterAddress = ZAP_SETTINGS[vault?.chainId]?.zapRouterAddress as Address | undefined

  const { address: userAddress } = useAccount()

  const { data: vaultToken } = useVaultTokenData(vault)

  const depositTx = useMemo(() => {
    if (!!vault && !!zapRouterAddress) {
      return {
        target: vault.address,
        value: 0n,
        data: encodeFunctionData({
          abi: vaultABI,
          functionName: 'deposit',
          args: [0n, zapRouterAddress]
        })
      }
    }
  }, [vault, zapRouterAddress])

  const { data: isVaultTokenVelodromeLp, isFetched: isFetchedVaultTokenVelodromeLp } =
    useIsVelodromeLp(vaultToken as Token)

  const { data: lpVaultToken } = useLpToken(vaultToken as Token, {
    enabled: isVaultTokenVelodromeLp ?? false
  })

  const isFetched =
    !!inputToken &&
    !!vault &&
    !!signature &&
    !!deadline &&
    nonce !== undefined &&
    nonce !== -1n &&
    !!amountOut &&
    enabled &&
    !!userAddress &&
    !!vaultToken &&
    !!depositTx &&
    isFetchedVaultTokenVelodromeLp &&
    (!isVaultTokenVelodromeLp || !!lpVaultToken)

  // TODO: if token is a velodrome lp token, add appropriate swaps + addLiquidity call
  const data = useMemo((): [ZapPermit, ZapConfig, `0x${string}`, ZapRoute] | undefined => {
    if (isFetched) {
      const zapPermit: ZapPermit = {
        permitted: [{ token: inputToken.address, amount: inputToken.amount }],
        nonce,
        deadline
      }

      const zapConfig: ZapConfig = {
        inputs: [{ token: inputToken.address, amount: inputToken.amount }],
        outputs: [
          { token: vault.address, minOutputAmount: amountOut.min },
          { token: inputToken.address, minOutputAmount: 0n },
          { token: vaultToken.address, minOutputAmount: 0n }
        ],
        relay: { target: zeroAddress, value: 0n, data: '0x0' },
        user: userAddress,
        recipient: userAddress
      }

      let zapRoute: ZapRoute = [{ ...depositTx, tokens: [{ token: vaultToken.address, index: 4 }] }]

      if (!!swapTx) {
        // Swap for vault token -> Deposit
        zapRoute = [
          {
            ...getArbitraryProxyTx(swapTx.allowanceProxy),
            tokens: [{ token: inputToken.address, index: -1 }]
          },
          { ...swapTx.tx, tokens: [{ token: inputToken.address, index: -1 }] },
          ...zapRoute
        ]
      }

      return [zapPermit, zapConfig, signature, zapRoute]
    }
  }, [
    inputToken,
    vault,
    signature,
    deadline,
    nonce,
    swapTx,
    amountOut,
    userAddress,
    vaultToken,
    depositTx,
    isVaultTokenVelodromeLp,
    lpVaultToken,
    isFetched
  ])

  return { data, isFetched }
}
