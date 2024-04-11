import { NextRequest } from 'next/server'
import { errorResponse } from 'src/app/api/frame/utils'
import { isAddress } from 'viem'
import { FrameState } from '../route'

export function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams

  const view = searchParams.get('view') as FrameState['view'] | null
  const userName = searchParams.get('userName')
  const userAddress = searchParams.get('userAddress')

  if (!!userAddress && isAddress(userAddress)) {
    if (view === 'account') {
      return accountViewImg({ userName, userAddress })
    } else if (view === 'depositParams') {
      return depositParamsViewImg({ userName, userAddress })
    } else if (view === 'approveTx') {
      return approveTxViewImg({ userName, userAddress })
    } else if (view === 'approveTxSuccess') {
      return approveTxSuccessViewImg({ userName, userAddress })
    } else if (view === 'depositTx') {
      return depositTxViewImg({ userName, userAddress })
    } else if (view === 'depositTxSuccess') {
      return depositTxSuccessViewImg({ userName, userAddress })
    } else if (view === 'redeemParams') {
      return redeemParamsViewImg({ userName, userAddress })
    } else if (view === 'redeemTx') {
      return redeemTxViewImg({ userName, userAddress })
    } else if (view === 'redeemTxSuccess') {
      return redeemTxSuccessViewImg({ userName, userAddress })
    }
  }

  return errorResponse('Invalid Request', 400)
}
