import { VaultList } from '@shared/types'
import { DOMAINS, NETWORK } from '@shared/utilities'

export const baseVaults: VaultList['tokens'] = [
  {
    chainId: NETWORK.base,
    address: '0x6B5a5c55E9dD4bb502Ce25bBfbaA49b69cf7E4dd',
    name: 'Prize POOL',
    decimals: 18,
    symbol: 'przPOOL',
    logoURI: `${DOMAINS.app}/icons/przPOOL.svg`,
    extensions: {
      underlyingAsset: {
        address: '0xd652C5425aea2Afd5fb142e120FeCf79e18fafc3',
        symbol: 'POOL',
        name: 'PoolTogether'
      },
      yieldSource: {
        name: 'PoolTogether'
      }
    }
  },
  {
    chainId: NETWORK.base,
    address: '0x7f5C2b379b88499aC2B997Db583f8079503f25b9',
    name: 'Prize USDC',
    decimals: 6,
    symbol: 'przUSDC',
    logoURI: `${DOMAINS.app}/icons/przUSDC.svg`,
    tags: ['moonwell'],
    extensions: {
      underlyingAsset: {
        address: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
        symbol: 'USDC',
        name: 'USD Coin'
      },
      yieldSource: {
        name: 'Moonwell',
        appURI: 'https://moonwell.fi/markets/supply/base/usdc'
      }
    }
  },
  {
    chainId: NETWORK.base,
    address: '0x8d1322CaBe5Ef2949f6bf4941Cc7765187C1091A',
    name: 'Prize AERO',
    decimals: 18,
    symbol: 'przAERO',
    logoURI: `${DOMAINS.app}/icons/przAERO.svg`,
    tags: ['moonwell'],
    extensions: {
      underlyingAsset: {
        address: '0x940181a94A35A4569E4529A3CDfB74e38FD98631',
        symbol: 'AERO',
        name: 'Aerodrome'
      },
      yieldSource: {
        name: 'Moonwell',
        appURI: 'https://moonwell.fi/markets/supply/base/aero'
      }
    }
  },
  {
    chainId: NETWORK.base,
    address: '0x5b623C127254C6fec04b492ecDF4b11c45FBB9D5',
    name: 'Prize cbETH',
    decimals: 18,
    symbol: 'przCBETH',
    logoURI: `${DOMAINS.app}/icons/przCBETH.svg`,
    tags: ['moonwell'],
    extensions: {
      underlyingAsset: {
        address: '0x2Ae3F1Ec7F1F5012CFEab0185bfc7aa3cf0DEc22',
        symbol: 'cbETH',
        name: 'Coinbase Wrapped Staked ETH'
      },
      yieldSource: {
        name: 'Moonwell',
        appURI: 'https://moonwell.fi/markets/supply/base/cbeth'
      }
    }
  },
  {
    chainId: NETWORK.base,
    address: '0x75D700F4C21528A2bb603b6Ed899ACFdE5c4B086',
    name: 'Prize wstETH',
    decimals: 18,
    symbol: 'przWSTETH',
    logoURI: `${DOMAINS.app}/icons/przSTETH.svg`,
    tags: ['moonwell'],
    extensions: {
      underlyingAsset: {
        address: '0xc1CBa3fCea344f92D9239c08C0568f6F2F0ee452',
        symbol: 'wstETH',
        name: 'Wrapped Staked Ether'
      },
      yieldSource: {
        name: 'Moonwell',
        appURI: 'https://moonwell.fi/markets/supply/base/wsteth'
      }
    }
  },
  {
    chainId: NETWORK.base,
    address: '0x6Bb041d7E70b7040611ef688b5e707a799ADe60A',
    name: 'Prize USDA',
    decimals: 18,
    symbol: 'przUSDA',
    logoURI: `${DOMAINS.app}/icons/przUSDA.svg`,
    tags: ['angle'],
    extensions: {
      underlyingAsset: {
        address: '0x0000206329b97DB379d5E1Bf586BbDB969C63274',
        symbol: 'USDA',
        name: 'USDA'
      },
      yieldSource: {
        name: 'Angle',
        appURI: 'https://angle.money/stusd'
      }
    }
  },
  {
    chainId: NETWORK.base,
    address: '0x4e42f783db2d0c5bdff40fdc66fcae8b1cda4a43',
    name: 'Prize WETH',
    decimals: 18,
    symbol: 'przWETH',
    logoURI: `${DOMAINS.app}/icons/przWETH.svg`,
    tags: ['aave'],
    extensions: {
      underlyingAsset: {
        address: '0x4200000000000000000000000000000000000006',
        symbol: 'WETH',
        name: 'Wrapped Ether'
      },
      yieldSource: {
        name: 'Aave',
        appURI:
          'https://app.aave.com/reserve-overview/?underlyingAsset=0x4200000000000000000000000000000000000006&marketName=proto_base_v3'
      }
    }
  },
  {
    chainId: NETWORK.base,
    address: '0x6428DDB6EF1818FA99552E10882D34c1db57BBcA',
    name: 'Prize WETH/WELL',
    decimals: 18,
    symbol: 'przWELL/WETH',
    logoURI: `${DOMAINS.app}/icons/przAERO.svg`,
    tags: ['beefy', 'lp', 'aerodrome'],
    extensions: {
      underlyingAsset: {
        address: '0x89D0F320ac73dd7d9513FFC5bc58D1161452a657',
        symbol: 'vAMM-WETH/WELL',
        name: 'Volatile AMM - WETH/WELL'
      },
      yieldSource: {
        name: 'Beefy',
        appURI: 'https://app.beefy.com/vault/aerodrome-weth-bwell'
      },
      lp: {
        appURI:
          'https://aerodrome.finance/deposit?token0=0x4200000000000000000000000000000000000006&token1=0xA88594D404727625A9437C3f886C7643872296AE&type=-1'
      }
    }
  },
  {
    chainId: NETWORK.base,
    address: '0x850ec48D2605aaD9c3de345A6a357A9A14b8cf1B',
    name: 'Prize POOL/LUSD',
    decimals: 18,
    symbol: 'przPOOL/LUSD',
    logoURI: `${DOMAINS.app}/icons/przAERO.svg`,
    tags: ['beefy', 'lp', 'aerodrome'],
    extensions: {
      underlyingAsset: {
        address: '0x0b15b1d434f86eCaa83d14398C8Db6d162F3921e',
        symbol: 'vAMM-LUSD/POOL',
        name: 'Volatile AMM - LUSD/POOL'
      },
      yieldSource: {
        name: 'Beefy',
        appURI: 'https://app.beefy.com/vault/aerodrome-lusd-pool'
      },
      lp: {
        appURI:
          'https://aerodrome.finance/deposit?token0=0x368181499736d0c0CC614DBB145E2EC1AC86b8c6&token1=0xd652C5425aea2Afd5fb142e120FeCf79e18fafc3&type=-1'
      }
    }
  },
  {
    chainId: NETWORK.base,
    address: '0x78adc13c9ab327c79d10cab513b7c6bd3b346858',
    name: 'Prize Super OETH',
    decimals: 18,
    symbol: 'przSuperOETHb',
    tags: ['origin'],
    extensions: {
      underlyingAsset: {
        address: '0xDBFeFD2e8460a6Ee4955A68582F85708BAEA60A3',
        symbol: 'superOETHb',
        name: 'Super OETH'
      },
      yieldSource: {
        name: 'Origin',
        appURI: 'https://app.originprotocol.com/#/super'
      }
    }
  },
  {
    chainId: NETWORK.base,
    address: '0xada66220fe59c7374ea6a93bd211829d5d0af75d',
    name: 'Prize USDC',
    decimals: 6,
    symbol: 'przUSDC',
    logoURI: `${DOMAINS.app}/icons/przUSDC.svg`,
    tags: ['morpho'],
    extensions: {
      underlyingAsset: {
        address: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
        symbol: 'USDC',
        name: 'USD Coin'
      },
      yieldSource: {
        name: 'Morpho',
        appURI:
          'https://app.morpho.org/vault?vault=0xc1256Ae5FF1cf2719D4937adb3bbCCab2E00A2Ca&network=base'
      }
    }
  },
  {
    chainId: NETWORK.base,
    address: '0xdd5e858c0aa9311c4b49bc8d35951f7f069ff46a',
    name: 'Prize EURC',
    decimals: 6,
    symbol: 'przEURC',
    tags: ['morpho'],
    extensions: {
      underlyingAsset: {
        address: '0x60a3E35Cc302bFA44Cb288Bc5a4F316Fdb1adb42',
        symbol: 'EURC',
        name: 'EURC'
      },
      yieldSource: {
        name: 'Morpho',
        appURI:
          'https://app.morpho.org/vault?vault=0xf24608E0CCb972b0b0f4A6446a0BBf58c701a026&network=base'
      }
    }
  },
  {
    chainId: NETWORK.base,
    address: '0xd56f6f32473d6321512956a1351d4bcec07914cb',
    name: 'Prize WETH',
    decimals: 18,
    symbol: 'przWETH',
    logoURI: `${DOMAINS.app}/icons/przWETH.svg`,
    tags: ['morpho'],
    extensions: {
      underlyingAsset: {
        address: '0x4200000000000000000000000000000000000006',
        symbol: 'WETH',
        name: 'Wrapped Ether'
      },
      yieldSource: {
        name: 'Morpho',
        appURI:
          'https://app.morpho.org/vault?vault=0xa0E430870c4604CcfC7B38Ca7845B1FF653D0ff1&network=base'
      }
    }
  },
  {
    chainId: NETWORK.base,
    address: '0x48c773aA0023980c3123Acd4Ae1d59753F812067',
    name: 'Prize Giveth',
    decimals: 18,
    symbol: 'przSuperOETHgiv',
    tags: ['origin'],
    extensions: {
      underlyingAsset: {
        address: '0xDBFeFD2e8460a6Ee4955A68582F85708BAEA60A3',
        symbol: 'superOETHb',
        name: 'Super OETH'
      },
      yieldSource: {
        name: 'Origin',
        appURI: 'https://app.originprotocol.com/#/super'
      }
    }
  }
]
