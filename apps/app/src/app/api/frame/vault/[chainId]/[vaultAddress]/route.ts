import { FrameRequest, Token } from '@shared/types'
import { NETWORK } from '@shared/utilities'
import { NextRequest, NextResponse } from 'next/server'
import { Address, isAddress, parseUnits } from 'viem'
import { APP_URL, SUPPORTED_NETWORKS } from '@constants/config'
import {
  errorResponse,
  frameResponse,
  getAllowance,
  getUserAddress,
  getVaultData
} from '../../../utils'

export const dynamic = 'force-dynamic'

export interface FrameState {
  view:
    | 'userSelection'
    | 'account'
    | 'depositParams'
    | 'approveTx'
    | 'approveTxSuccess'
    | 'depositTx'
    | 'depositTxSuccess'
    | 'redeemParams'
    | 'redeemTx'
    | 'redeemTxSuccess'
  user?: { name: string; address: Address }
  tokens?: {
    share: Token & { amount: string; withdrawAmount: string }
    asset: Token & { amount: string; depositAmount: string }
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: { chainId: string; vaultAddress: string } }
): Promise<NextResponse> {
  const networks = [...SUPPORTED_NETWORKS.mainnets, ...SUPPORTED_NETWORKS.testnets]
  const rawChainId = parseInt(params.chainId)
  const chainId =
    !!rawChainId && networks.includes(rawChainId) ? (rawChainId as NETWORK) : undefined

  const vaultAddress = isAddress(params.vaultAddress) ? params.vaultAddress : undefined

  if (!chainId || !vaultAddress) {
    return errorResponse('Invalid Request', 400)
  }

  const postUrl = `${APP_URL}/api/frame/vault/${chainId}/${vaultAddress}`

  const frameRequest: FrameRequest = await req.json()

  const prevState = !!frameRequest.untrustedData.state
    ? (JSON.parse(frameRequest.untrustedData.state) as FrameState)
    : undefined

  if (!prevState) {
    // TODO: get cached name/address, if found, include in frame data
    return frame(postUrl, undefined, { chainId, vaultAddress })
  }

  const userInput = frameRequest.untrustedData.inputText?.trim()
  const buttonClicked = frameRequest.untrustedData.buttonIndex

  let user = prevState.user

  if (!user && prevState.view === 'userSelection' && !!userInput) {
    const userAddress = await getUserAddress(userInput)

    if (!!userAddress) {
      user = { name: userInput, address: userAddress }
    }
  }

  return frame(postUrl, prevState, { chainId, vaultAddress, user, userInput, buttonClicked })
}

interface FrameData {
  chainId: NETWORK
  vaultAddress: Address
  user?: { name: string; address: Address }
  userInput?: string
  buttonClicked?: number
}

interface BaseViewData {
  postUrl: string
  tokens: FrameState['tokens']
}

interface ViewData extends BaseViewData {
  chainId: NETWORK
  vaultAddress: Address
  user: NonNullable<FrameData['user']>
}

const frame = async (postUrl: string, prevState: FrameState | undefined, data: FrameData) => {
  const { chainId, vaultAddress, user, userInput, buttonClicked } = data

  const tokens = prevState?.tokens

  if (!!user) {
    const viewData: ViewData = { postUrl, chainId, vaultAddress, tokens, user }

    if (prevState?.view === 'account') {
      if (buttonClicked === 1) {
        return userSelectionView(viewData)
      } else if (buttonClicked === 2) {
        return depositParamsView(viewData)
      } else if (buttonClicked === 3) {
        return redeemParamsView(viewData)
      }
    } else if (prevState?.view === 'depositParams') {
      if (buttonClicked === 2) {
        if (isFullViewData(viewData)) {
          if (!!userInput && isValidNumberInput(userInput)) {
            const asset = viewData.tokens.asset
            const depositAssetAmount = parseUnits(userInput, asset.decimals)
            const assetBalance = BigInt(asset.amount)

            if (assetBalance < depositAssetAmount) {
              return depositParamsView({ ...viewData, errorMsg: 'Not enough tokens in wallet' })
            }

            viewData.tokens.asset.depositAmount = depositAssetAmount.toString()

            const allowance = await getAllowance(chainId, vaultAddress, user.address, asset.address)

            if (allowance < depositAssetAmount) {
              return approveTxView(viewData)
            } else {
              return depositTxView(viewData)
            }
          } else {
            return depositParamsView({ ...viewData, errorMsg: 'Enter a valid token amount' })
          }
        } else {
          return errorResponse('Incomplete View Data')
        }
      }
    } else if (prevState?.view === 'approveTx') {
      if (buttonClicked === 2) {
        return approveTxSuccessView(viewData)
      }
    } else if (prevState?.view === 'approveTxSuccess') {
      if (isFullViewData(viewData)) {
        return depositTxView(viewData)
      } else {
        return errorResponse('Incomplete View Data')
      }
    } else if (prevState?.view === 'depositTx') {
      if (buttonClicked === 2) {
        return depositTxSuccessView(viewData)
      }
    } else if (prevState?.view === 'redeemParams') {
      if (buttonClicked === 2) {
        if (isFullViewData(viewData)) {
          // TODO: if not enough balance, stay in redeemParams and display error msg
          // TODO: if has balance, go to redeemTxView
        } else {
          return errorResponse('Incomplete View Data')
        }
      } else if (buttonClicked === 3) {
        if (isFullViewData(viewData)) {
          // TODO: if no balance, stay in redeemParams and display error msg
          // TODO: if has any balance, go to redeemTxView
        } else {
          return errorResponse('Incomplete View Data')
        }
      }
    } else if (prevState?.view === 'redeemTx') {
      if (buttonClicked === 2) {
        return redeemTxSuccessView(viewData)
      }
    }

    return accountView(viewData)
  } else if (!prevState || prevState.view === 'userSelection') {
    return userSelectionView({ postUrl, tokens, isInvalidAddress: true })
  } else {
    return userSelectionView({ postUrl, tokens })
  }
}

const userSelectionView = (data: BaseViewData & { isInvalidAddress?: boolean }) => {
  const { postUrl, tokens, isInvalidAddress } = data

  const view: FrameState['view'] = 'userSelection'

  const imgSrc = isInvalidAddress
    ? `${APP_URL}/facebook-share-image-1200-630.png` // TODO: get static user selection img with error msg
    : `${APP_URL}/facebook-share-image-1200-630.png` // TODO: get static user selection img

  return frameResponse<FrameState>({
    img: { src: imgSrc },
    postUrl,
    buttons: [{ content: 'Submit' }],
    input: { placeholder: 'Enter an address or ENS...' },
    state: { view, tokens }
  })
}

const accountView = async (data: ViewData) => {
  const { postUrl, chainId, vaultAddress, tokens, user } = data

  const view: FrameState['view'] = 'account'

  const { share, asset } = tokens ?? (await getVaultData(chainId, vaultAddress, user.address))

  const imgSrc = new URL(`${postUrl}/image`)
  imgSrc.searchParams.set('view', view)
  imgSrc.searchParams.set('userName', user.name)
  imgSrc.searchParams.set('userAddress', user.address)
  // TODO: pass relevant token data to img route

  return frameResponse<FrameState>({
    img: { src: imgSrc.toString(), aspectRatio: '1:1' },
    postUrl,
    buttons: [
      { content: 'Switch Account' },
      { content: 'Deposit' },
      { content: 'Withdraw' },
      {
        content: 'View on App',
        action: 'link',
        target: `${APP_URL}/vault/${chainId}/${vaultAddress}`
      }
    ],
    state: {
      view,
      user,
      tokens: {
        share: { ...share, withdrawAmount: '0' },
        asset: { ...asset, depositAmount: '0' }
      }
    }
  })
}

const depositParamsView = async (data: ViewData & { errorMsg?: string }) => {
  const { postUrl, chainId, vaultAddress, tokens, user, errorMsg } = data

  const view: FrameState['view'] = 'depositParams'

  const { share, asset } = tokens ?? (await getVaultData(chainId, vaultAddress, user.address))

  const imgSrc = new URL(`${postUrl}/image`)
  imgSrc.searchParams.set('view', view)
  imgSrc.searchParams.set('userName', user.name)
  imgSrc.searchParams.set('userAddress', user.address)
  // TODO: pass relevant token data to img route
  errorMsg && imgSrc.searchParams.set('errorMsg', errorMsg)

  return frameResponse<FrameState>({
    img: { src: imgSrc.toString(), aspectRatio: '1:1' },
    postUrl,
    buttons: [{ content: 'Back' }, { content: 'Deposit Amount' }],
    state: {
      view,
      user,
      tokens: {
        share: { ...share, withdrawAmount: '0' },
        asset: { ...asset, depositAmount: '0' }
      }
    }
  })
}

const approveTxView = async (data: ViewData & { tokens: NonNullable<FrameState['tokens']> }) => {
  const { postUrl, tokens, user } = data

  const view: FrameState['view'] = 'approveTx'

  const imgSrc = new URL(`${postUrl}/image`)
  imgSrc.searchParams.set('view', view)
  imgSrc.searchParams.set('userName', user.name)
  imgSrc.searchParams.set('userAddress', user.address)
  // TODO: pass relevant token data to img route

  return frameResponse<FrameState>({
    img: { src: imgSrc.toString(), aspectRatio: '1:1' },
    postUrl,
    buttons: [{ content: 'Cancel' }, { content: 'Approve' }],
    state: { view, user, tokens }
  })
}

const approveTxSuccessView = async (data: ViewData) => {
  const { postUrl, tokens, user } = data

  const view: FrameState['view'] = 'approveTxSuccess'

  const imgSrc = new URL(`${postUrl}/image`)
  imgSrc.searchParams.set('view', view)
  imgSrc.searchParams.set('userName', user.name)
  imgSrc.searchParams.set('userAddress', user.address)

  return frameResponse<FrameState>({
    img: { src: imgSrc.toString(), aspectRatio: '1:1' },
    postUrl,
    buttons: [{ content: 'Continue' }],
    state: { view, user, tokens }
  })
}

const depositTxView = async (data: ViewData & { tokens: NonNullable<FrameState['tokens']> }) => {
  const { postUrl, tokens, user } = data

  const view: FrameState['view'] = 'depositTx'

  const imgSrc = new URL(`${postUrl}/image`)
  imgSrc.searchParams.set('view', view)
  imgSrc.searchParams.set('userName', user.name)
  imgSrc.searchParams.set('userAddress', user.address)
  // TODO: pass relevant token data to img route

  return frameResponse<FrameState>({
    img: { src: imgSrc.toString(), aspectRatio: '1:1' },
    postUrl,
    buttons: [{ content: 'Cancel' }, { content: 'Deposit' }],
    state: { view, user, tokens }
  })
}

const depositTxSuccessView = async (data: ViewData) => {
  const { postUrl, tokens, user } = data

  const view: FrameState['view'] = 'depositTxSuccess'

  const imgSrc = new URL(`${postUrl}/image`)
  imgSrc.searchParams.set('view', view)
  imgSrc.searchParams.set('userName', user.name)
  imgSrc.searchParams.set('userAddress', user.address)

  return frameResponse<FrameState>({
    img: { src: imgSrc.toString(), aspectRatio: '1:1' },
    postUrl,
    buttons: [{ content: 'View Account' }],
    state: { view, user, tokens }
  })
}

const redeemParamsView = async (data: ViewData) => {
  const { postUrl, chainId, vaultAddress, tokens, user } = data

  const view: FrameState['view'] = 'redeemParams'

  const { share, asset } = tokens ?? (await getVaultData(chainId, vaultAddress, user.address))

  const imgSrc = new URL(`${postUrl}/image`)
  imgSrc.searchParams.set('view', view)
  imgSrc.searchParams.set('userName', user.name)
  imgSrc.searchParams.set('userAddress', user.address)
  // TODO: pass relevant token data to img route

  return frameResponse<FrameState>({
    img: { src: imgSrc.toString(), aspectRatio: '1:1' },
    postUrl,
    buttons: [{ content: 'Back' }, { content: 'Withdraw Amount' }, { content: 'Withdraw All' }],
    state: {
      view,
      user,
      tokens: {
        share: { ...share, withdrawAmount: '0' },
        asset: { ...asset, depositAmount: '0' }
      }
    }
  })
}

const redeemTxView = async (data: ViewData & { tokens: NonNullable<FrameState['tokens']> }) => {
  const { postUrl, tokens, user } = data

  const view: FrameState['view'] = 'redeemTx'

  const imgSrc = new URL(`${postUrl}/image`)
  imgSrc.searchParams.set('view', view)
  imgSrc.searchParams.set('userName', user.name)
  imgSrc.searchParams.set('userAddress', user.address)
  // TODO: pass relevant token data to img route

  return frameResponse<FrameState>({
    img: { src: imgSrc.toString(), aspectRatio: '1:1' },
    postUrl,
    buttons: [{ content: 'Cancel' }, { content: 'Withdraw' }],
    state: { view, user, tokens }
  })
}

const redeemTxSuccessView = async (data: ViewData) => {
  const { postUrl, tokens, user } = data

  const view: FrameState['view'] = 'redeemTxSuccess'

  const imgSrc = new URL(`${postUrl}/image`)
  imgSrc.searchParams.set('view', view)
  imgSrc.searchParams.set('userName', user.name)
  imgSrc.searchParams.set('userAddress', user.address)

  return frameResponse<FrameState>({
    img: { src: imgSrc.toString(), aspectRatio: '1:1' },
    postUrl,
    buttons: [{ content: 'View Account' }],
    state: { view, user, tokens }
  })
}

const isFullViewData = (
  viewData: ViewData
): viewData is ViewData & { tokens: NonNullable<FrameState['tokens']> } => {
  return viewData.tokens !== undefined
}

const isValidNumberInput = (str: string) => {
  return !isNaN(Number(str)) && !isNaN(parseFloat(str)) && parseFloat(str) > 0
}
