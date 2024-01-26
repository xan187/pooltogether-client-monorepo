import {
  NETWORK,
  V4_PRIZE_SUBGRAPH_API_URLS,
  V4_TWAB_SUBGRAPH_API_URLS,
  V5_SUBGRAPH_API_URLS
} from './constants'
import {
  V4SubgraphPrizeData,
  V4SubgraphUserData,
  V5SubgraphPrizeData,
  V5SubgraphUserData,
  V5SubgraphVaultData
} from './types'

export const getV5SubgraphUserData = async (
  chainId: NETWORK,
  options: { maxUsersPerPage: number; lastUserId?: string }
) => {
  if (chainId in V5_SUBGRAPH_API_URLS) {
    const subgraphUrl = V5_SUBGRAPH_API_URLS[chainId as keyof typeof V5_SUBGRAPH_API_URLS]

    const result = await fetch(subgraphUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: `query($maxUsersPerPage: Int, $lastUserId: Bytes) {
          users(first: $maxUsersPerPage, where: { accounts_: { balance_gt: 0 }, id_gt: $lastUserId }) {
            id
          }
        }`,
        variables: {
          maxUsersPerPage: options.maxUsersPerPage,
          lastUserId: options.lastUserId ?? ''
        }
      })
    })

    const data =
      (await result.json<{ data?: { users?: V5SubgraphUserData[] } }>())?.data?.users ?? []

    return data
  } else {
    return []
  }
}

export const getPaginatedV5SubgraphUserData = async (
  chainId: NETWORK,
  options?: { maxPageSize?: number }
) => {
  const data: V5SubgraphUserData[] = []
  let lastUserId = ''

  const maxUsersPerPage = options?.maxPageSize ?? 1_000

  while (true) {
    const newPage = await getV5SubgraphUserData(chainId, { maxUsersPerPage, lastUserId })

    data.push(...newPage)

    if (newPage.length < maxUsersPerPage) {
      break
    } else {
      lastUserId = newPage[newPage.length - 1].id
    }
  }

  return data
}

export const getV5SubgraphVaultData = async (
  chainId: NETWORK,
  options: { maxVaultsPerPage: number; lastVaultId?: string }
) => {
  if (chainId in V5_SUBGRAPH_API_URLS) {
    const subgraphUrl = V5_SUBGRAPH_API_URLS[chainId as keyof typeof V5_SUBGRAPH_API_URLS]

    const result = await fetch(subgraphUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: `query($maxVaultsPerPage: Int, $lastVaultId: Bytes) {
          vaults(first: $maxVaultsPerPage, where: { balance_gt: 0, id_gt: $lastVaultId }) {
            id
            address
            balance
          }
        }`,
        variables: {
          maxVaultsPerPage: options.maxVaultsPerPage,
          lastVaultId: options.lastVaultId ?? ''
        }
      })
    })

    const data =
      (
        await result.json<{
          data?: { vaults?: { id: string; address: string; balance: string }[] }
        }>()
      )?.data?.vaults ?? []

    const formattedData: V5SubgraphVaultData[] = data.map((entry) => ({
      id: entry.id,
      address: entry.address as `0x${string}`,
      balance: BigInt(entry.balance)
    }))

    return formattedData
  } else {
    return []
  }
}

export const getPaginatedV5SubgraphVaultData = async (
  chainId: NETWORK,
  options?: { maxPageSize?: number }
) => {
  const data: V5SubgraphVaultData[] = []
  let lastVaultId = ''

  const maxVaultsPerPage = options?.maxPageSize ?? 100

  while (true) {
    const newPage = await getV5SubgraphVaultData(chainId, { maxVaultsPerPage, lastVaultId })

    data.push(...newPage)

    if (newPage.length < maxVaultsPerPage) {
      break
    } else {
      lastVaultId = newPage[newPage.length - 1].id
    }
  }

  return data
}

export const getV5SubgraphPrizeData = async (
  chainId: NETWORK,
  options: { maxPrizesPerPage: number; lastPrizeId?: string }
) => {
  if (chainId in V5_SUBGRAPH_API_URLS) {
    const subgraphUrl = V5_SUBGRAPH_API_URLS[chainId as keyof typeof V5_SUBGRAPH_API_URLS]

    const result = await fetch(subgraphUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: `query($maxPrizesPerPage: Int, $lastPrizeId: Bytes) {
          prizeClaims(first: $maxPrizesPerPage, where: { id_gt: $lastPrizeId }) {
            id
            payout
          }
        }`,
        variables: {
          maxPrizesPerPage: options.maxPrizesPerPage,
          lastPrizeId: options.lastPrizeId ?? ''
        }
      })
    })

    const data =
      (await result.json<{ data?: { prizeClaims?: { id: string; payout: string }[] } }>())?.data
        ?.prizeClaims ?? []

    const formattedData: V5SubgraphPrizeData[] = data.map((entry) => ({
      id: entry.id,
      payout: BigInt(entry.payout)
    }))

    return formattedData
  } else {
    return []
  }
}

export const getPaginatedV5SubgraphPrizeData = async (
  chainId: NETWORK,
  options?: { maxPageSize?: number }
) => {
  const data: V5SubgraphPrizeData[] = []
  let lastPrizeId = ''

  const maxPrizesPerPage = options?.maxPageSize ?? 1_000

  while (true) {
    const newPage = await getV5SubgraphPrizeData(chainId, { maxPrizesPerPage, lastPrizeId })

    data.push(...newPage)

    if (newPage.length < maxPrizesPerPage) {
      break
    } else {
      lastPrizeId = newPage[newPage.length - 1].id
    }
  }

  return data
}

export const getV4SubgraphUserData = async (
  chainId: NETWORK,
  options: { maxUsersPerPage: number; lastUserId?: string }
) => {
  if (chainId in V4_TWAB_SUBGRAPH_API_URLS) {
    const subgraphUrl = V4_TWAB_SUBGRAPH_API_URLS[chainId as keyof typeof V4_TWAB_SUBGRAPH_API_URLS]

    const result = await fetch(subgraphUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: `query($maxUsersPerPage: Int, $lastUserId: Bytes) {
          accounts(first: $maxUsersPerPage, where: { balance_gt: 0, id_gt: $lastUserId }) {
            id
          }
        }`,
        variables: {
          maxUsersPerPage: options.maxUsersPerPage,
          lastUserId: options.lastUserId ?? ''
        }
      })
    })

    const data =
      (await result.json<{ data?: { accounts?: V4SubgraphUserData[] } }>())?.data?.accounts ?? []

    return data
  } else {
    return []
  }
}

export const getPaginatedV4SubgraphUserData = async (
  chainId: NETWORK,
  options?: { maxPageSize?: number }
) => {
  const data: V4SubgraphUserData[] = []
  let lastUserId = ''

  const maxUsersPerPage = options?.maxPageSize ?? 1_000

  while (true) {
    const newPage = await getV4SubgraphUserData(chainId, { maxUsersPerPage, lastUserId })

    data.push(...newPage)

    if (newPage.length < maxUsersPerPage) {
      break
    } else {
      lastUserId = newPage[newPage.length - 1].id
    }
  }

  return data
}

export const getV4SubgraphPrizeData = async (chainId: NETWORK) => {
  if (chainId in V4_PRIZE_SUBGRAPH_API_URLS) {
    const subgraphUrl =
      V4_PRIZE_SUBGRAPH_API_URLS[chainId as keyof typeof V4_PRIZE_SUBGRAPH_API_URLS]

    const result = await fetch(subgraphUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: `query($id: Int) {
          aggregate(id: $id) {
            totalClaimed
          }
        }`,
        variables: { id: 1 }
      })
    })

    const data =
      (await result.json<{ data?: { aggregate?: { totalClaimed: string } } }>())?.data?.aggregate
        ?.totalClaimed ?? undefined

    const formattedData: V4SubgraphPrizeData = { totalClaimed: !!data ? BigInt(data) : 0n }

    return formattedData
  } else {
    return { totalClaimed: 0n }
  }
}
