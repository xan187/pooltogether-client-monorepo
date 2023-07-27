import classNames from 'classnames'
import { useAtom } from 'jotai'
import { useEffect } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { vaultChainIdAtom, vaultTokenAddressAtom } from 'src/atoms'
import { Address, isAddress } from 'viem'
import { NextButton } from '@components/buttons/NextButton'
import { SUPPORTED_NETWORKS } from '@constants/config'
import { useSteps } from '@hooks/useSteps'
import { NetworkInput } from './NetworkInput'
import { SimpleInput } from './SimpleInput'

interface NetworkAndTokenFormValues {
  vaultChainId: string
  vaultToken: string
}

interface NetworkAndTokenFormProps {
  className?: string
}

export const NetworkAndTokenForm = (props: NetworkAndTokenFormProps) => {
  const { className } = props

  const formMethods = useForm<NetworkAndTokenFormValues>({ mode: 'onChange' })

  const [vaultChainId, setVaultChainId] = useAtom(vaultChainIdAtom)
  const [vaultTokenAddress, setVaultTokenAddress] = useAtom(vaultTokenAddressAtom)

  const { nextStep } = useSteps()

  useEffect(() => {
    !!vaultChainId &&
      formMethods.setValue('vaultChainId', vaultChainId.toString(), { shouldValidate: true })
    !!vaultTokenAddress &&
      formMethods.setValue('vaultToken', vaultTokenAddress, { shouldValidate: true })
  }, [])

  const onSubmit = (data: NetworkAndTokenFormValues) => {
    setVaultChainId(parseInt(data.vaultChainId))
    setVaultTokenAddress(data.vaultToken.trim() as Address)
    nextStep()
  }

  return (
    <FormProvider {...formMethods}>
      <form
        onSubmit={formMethods.handleSubmit(onSubmit)}
        className={classNames('flex flex-col grow gap-12 items-center', className)}
      >
        <div className='flex flex-col gap-4 items-center'>
          <span className='text-sm font-medium text-pt-purple-100'>Select Network</span>
          <div className='flex flex-wrap justify-center gap-x-6 gap-y-4'>
            {SUPPORTED_NETWORKS.map((chainId) => (
              <NetworkInput key={`chain-${chainId}`} chainId={chainId} />
            ))}
          </div>
        </div>
        <SimpleInput
          formKey='vaultToken'
          validate={{
            isValidAddress: (v: string) => isAddress(v?.trim()) || 'Enter a valid token address.'
          }}
          placeholder='0x0000...'
          label='Deposit Token Address'
          className='w-full max-w-md'
        />
        <NextButton disabled={!formMethods.formState.isValid} />
      </form>
    </FormProvider>
  )
}
