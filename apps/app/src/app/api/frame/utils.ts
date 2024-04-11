import { FrameButton, SubgraphPrize, Token, TokenWithAmount, VaultInfo } from '@shared/types'
import {
  erc20ABI,
  getTokenBalances,
  getUserSubgraphPrizes,
  getVaultId,
  NETWORK,
  vaultABI
} from '@shared/utilities'
import { ImageResponse } from 'next/og'
import { NextResponse } from 'next/server'
import { CSSProperties, ReactElement } from 'react'
import { Address, createPublicClient, http, isAddress, PublicClient } from 'viem'
import { getEnsAddress, normalize } from 'viem/ens'
import {
  APP_URL,
  DEFAULT_VAULT_LISTS,
  RPC_URLS,
  SUPPORTED_NETWORKS,
  WAGMI_CHAINS
} from '@constants/config'

export const frameResponse = <FrameStateType extends {}>(data: {
  img: { src: string; aspectRatio?: '1.91:1' | '1:1' }
  postUrl: string
  buttons: FrameButton[]
  input?: { placeholder: string }
  state?: FrameStateType
}) => {
  const { img, postUrl, buttons, input, state } = data

  let frame = `<!DOCTYPE html>
    <html><head>
    <meta property='fc:frame' content='vNext' />
    <meta property='og:image' content='${img.src}' />
    <meta property='fc:frame:image' content='${img.src}' />
    <meta name='fc:frame:post_url' content='${postUrl}' />
  `

  if (!!img.aspectRatio && img.aspectRatio !== '1.91:1') {
    frame += `<meta name='fc:frame:image:aspect_ratio' content='${img.aspectRatio}' />`
  }

  if (!!state) {
    frame += `<meta name='fc:frame:state' content='${JSON.stringify(state)}' />`
  }

  if (!!input) {
    frame += `<meta name='fc:frame:input:text' content='${input.placeholder}' />`
  }

  buttons.forEach((button, i) => {
    frame += `<meta name='fc:frame:button:${i + 1}' content='${button.content}' />`

    if (!!button.action) {
      frame += `<meta name='fc:frame:button:${i + 1}:action' content='${button.action}' />`

      if (button.action === 'link' || button.action === 'mint' || button.action === 'tx') {
        frame += `<meta name='fc:frame:button:${i + 1}:target' content='${button.target}' />`

        if (button.action === 'tx') {
          frame += `<meta name='fc:frame:button:${i + 1}:post_url' content='${button.callback}' />`
        }
      }
    }
  })

  frame += '</head></html>'

  return new NextResponse(frame, { status: 200 })
}

export const imageResponse = async (
  content: ReactElement,
  options?: { style?: CSSProperties; width?: number; height?: number }
) => {
  const fontUrl = `${APP_URL}/fonts/inter/inter-regular.woff`
  const fontData = await fetch(fontUrl).then((res) => res.arrayBuffer())

  return new ImageResponse(content, {
    width: options?.width ?? 600,
    height: options?.height ?? 600,
    fonts: [{ name: 'Inter', data: fontData, style: 'normal', weight: 400 }]
  })
}

export const errorResponse = (message: string, status?: number) => {
  return NextResponse.json({ message }, { status: status ?? 418 })
}

export const getPublicClient = (network: NETWORK): PublicClient => {
  return createPublicClient({
    chain: WAGMI_CHAINS[network as keyof typeof WAGMI_CHAINS],
    transport: http(RPC_URLS[network as keyof typeof RPC_URLS])
  }) as PublicClient
}

export const getUserAddress = async (user: string) => {
  if (isAddress(user)) return user

  if (user.endsWith('.eth')) {
    const client = getPublicClient(NETWORK.mainnet)

    const address = await getEnsAddress(client, { name: normalize(user) })

    return address ?? undefined
  }
}

export const getUserVaultBalances = async (
  network: NETWORK,
  userAddress: Address,
  vaults: VaultInfo[]
) => {
  const userVaultBalances: { [tokenAddress: Address]: TokenWithAmount & VaultInfo } = {}

  const client = getPublicClient(network)

  const validVaults = vaults.filter((v) => v.chainId === network)
  const vaultAddresses = validVaults.map((v) => v.address)

  const tokens = await getTokenBalances(client, userAddress, vaultAddresses)

  Object.entries(tokens).forEach(([_tokenAddress, token]) => {
    const tokenAddress = _tokenAddress as Address
    const vaultInfo = validVaults.find((v) => getVaultId(v) === getVaultId(token))

    userVaultBalances[tokenAddress] = { ...token, ...vaultInfo }
  })

  return userVaultBalances
}

export const getAllUserVaultBalances = async (userAddress: Address) => {
  const allUserVaultBalances: (TokenWithAmount & VaultInfo)[] = []

  await Promise.allSettled(
    SUPPORTED_NETWORKS.mainnets.map((network) =>
      (async () => {
        const networkBalances = await getUserVaultBalances(
          network,
          userAddress,
          DEFAULT_VAULT_LISTS.default.tokens
        )
        allUserVaultBalances.push(...Object.values(networkBalances))
      })()
    )
  )

  return allUserVaultBalances
}

export const getUserLastPrizes = async (network: NETWORK, userAddress: Address) => {
  const userLastPrizes = await getUserSubgraphPrizes(network, userAddress, { numPrizes: 10 })
  return userLastPrizes.map((prize) => ({ network, ...prize }))
}

export const getAllUserLastPrizes = async (userAddress: Address) => {
  const allUserLastPrizes: (SubgraphPrize & { network: NETWORK })[] = []

  await Promise.allSettled(
    SUPPORTED_NETWORKS.mainnets.map((network) =>
      (async () => {
        const networkLastPrizes = await getUserLastPrizes(network, userAddress)
        allUserLastPrizes.push(...networkLastPrizes)
      })()
    )
  )

  return allUserLastPrizes.sort((a, b) => b.timestamp - a.timestamp)
}

export const getVaultData = async (
  network: NETWORK,
  vaultAddress: Address,
  userAddress: Address
) => {
  const client = getPublicClient(network)

  const shareInfo = await client.multicall({
    contracts: [
      { address: vaultAddress, abi: vaultABI, functionName: 'symbol' },
      { address: vaultAddress, abi: vaultABI, functionName: 'name' },
      { address: vaultAddress, abi: vaultABI, functionName: 'decimals' },
      { address: vaultAddress, abi: vaultABI, functionName: 'asset' },
      { address: vaultAddress, abi: vaultABI, functionName: 'balanceOf', args: [userAddress] }
    ]
  })

  const share: Token & { amount: string } = {
    chainId: network,
    address: vaultAddress,
    symbol: shareInfo[0].result as string,
    name: shareInfo[1].result as string,
    decimals: shareInfo[2].result as number,
    amount: (shareInfo[4].result as bigint).toString()
  }

  const assetAddress = shareInfo[3].result as Address

  const assetInfo = await client.multicall({
    contracts: [
      { address: assetAddress, abi: erc20ABI, functionName: 'symbol' },
      { address: assetAddress, abi: erc20ABI, functionName: 'name' },
      { address: assetAddress, abi: erc20ABI, functionName: 'decimals' },
      { address: assetAddress, abi: erc20ABI, functionName: 'balanceOf', args: [userAddress] }
    ]
  })

  const asset: Token & { amount: string } = {
    chainId: network,
    address: assetAddress,
    symbol: assetInfo[0].result as string,
    name: assetInfo[1].result as string,
    decimals: assetInfo[2].result as number,
    amount: (assetInfo[3].result as bigint).toString()
  }

  return { share, asset }
}

export const getAllowance = async (
  network: NETWORK,
  vaultAddress: Address,
  userAddress: Address,
  tokenAddress: Address
) => {
  const client = getPublicClient(network)

  const allowance = await client.readContract({
    address: tokenAddress,
    abi: erc20ABI,
    functionName: 'allowance',
    args: [userAddress, vaultAddress]
  })

  return allowance
}
