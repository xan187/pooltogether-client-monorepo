import { NETWORK } from '@pooltogether/hyperstructure-client-js'
import { Wallet } from '@rainbow-me/rainbowkit'
import {
  argentWallet,
  braveWallet,
  coinbaseWallet,
  injectedWallet,
  ledgerWallet,
  metaMaskWallet,
  rainbowWallet,
  safeWallet,
  tahoWallet,
  trustWallet,
  walletConnectWallet,
  xdefiWallet,
  zerionWallet
} from '@rainbow-me/rainbowkit/wallets'
import { SupportedNetwork } from 'src/types'
import { Address } from 'viem'
import { arbitrum, Chain, mainnet, optimism, polygon, sepolia } from 'wagmi/chains'

/**
 * Supported networks
 */
export const SUPPORTED_NETWORKS = [NETWORK.sepolia] as const

/**
 * Wagmi networks
 */
export const WAGMI_CHAINS = {
  [NETWORK.mainnet]: mainnet,
  [NETWORK.polygon]: polygon,
  [NETWORK.optimism]: optimism,
  [NETWORK.arbitrum]: arbitrum,
  [NETWORK.sepolia]: sepolia
} as const

/**
 * Wallets
 */
export const WALLETS: {
  [wallet: string]: (data: { appName: string; chains: Chain[]; projectId: string }) => Wallet
} = {
  metamask: metaMaskWallet,
  walletconnect: walletConnectWallet,
  rainbow: rainbowWallet,
  injected: injectedWallet,
  argent: argentWallet,
  coinbase: coinbaseWallet,
  ledger: ledgerWallet,
  taho: tahoWallet,
  trust: trustWallet,
  zerion: zerionWallet,
  brave: braveWallet,
  safe: safeWallet,
  xdefi: xdefiWallet
} as const

/**
 * RPCs
 */
export const RPC_URLS = {
  [NETWORK.mainnet]: process.env.NEXT_PUBLIC_MAINNET_RPC_URL,
  [NETWORK.polygon]: process.env.NEXT_PUBLIC_POLYGON_RPC_URL,
  [NETWORK.optimism]: process.env.NEXT_PUBLIC_OPTIMISM_RPC_URL,
  [NETWORK.arbitrum]: process.env.NEXT_PUBLIC_ARBITRUM_RPC_URL,
  [NETWORK.sepolia]: process.env.NEXT_PUBLIC_SEPOLIA_RPC_URL
} as const

/**
 * Contract addresses
 */
export const CONTRACTS: Record<
  SupportedNetwork,
  {
    prizePool: Address
    twabController: Address
    claimer: Address
  }
> = {
  [NETWORK.sepolia]: {
    prizePool: '0xA377A589C1957D7777F6eDF1b7C22C911a56e90F',
    twabController: '0x21A7c83D23d75b5eA80115974e3473fc35B1f263',
    claimer: '0x28781b60C9b3FE86c3018EBb9650766ea08673f5'
  }
}

export const LOCAL_STORAGE_KEYS = {
  vaultIds: 'vaultIds'
}
