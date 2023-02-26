import { ethers } from 'ethers'
import config from '../../../config'

const prod = NODE_ENV === 'production'

const _UNIREP_ADDRESS = prod
  ? '0x7a2088a1bFc9d81c55368AE168C2C02570cB814F'
  : undefined
const _APP_ADDRESS = prod
  ? '0x09635F643e140090A9A8Dcd712eD6285858ceBef'
  : undefined

export const UNIREP_ADDRESS = config.UNIREP_ADDRESS ?? _UNIREP_ADDRESS
export const APP_ADDRESS = config.APP_ADDRESS ?? _APP_ADDRESS
export const ETH_PROVIDER_URL = config.ETH_PROVIDER_URL

export const provider = ETH_PROVIDER_URL.startsWith('http')
  ? new ethers.providers.JsonRpcProvider(ETH_PROVIDER_URL)
  : new ethers.providers.WebSocketProvider(ETH_PROVIDER_URL)

export const SERVER = prod ? 'https://relay.zketh.io' : 'http://localhost:8000'
export const WS_SERVER = prod
  ? 'wss://relay.zketh.io/ws'
  : 'ws://localhost:8001'
export const KEY_SERVER = prod
  ? 'https://relay.zketh.io/build/'
  : 'http://localhost:8000/build/'
// export const KEY_SERVER = 'https://keys.unirep.io/2-beta-1/'
