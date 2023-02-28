import { ethers } from 'ethers'
import config from '../../../config'

const prod = NODE_ENV === 'production'

const _UNIREP_ADDRESS = prod
  ? '0x7FD08e9aDa2aFf50Fb5b8826505e5e0133bbCae6'
  : undefined
const _APP_ADDRESS = prod
  ? '0xeFC4E39B63259EF4C1Ff2C7630840B6271F34Bd4'
  : undefined

export const UNIREP_ADDRESS = config.UNIREP_ADDRESS ?? _UNIREP_ADDRESS
export const APP_ADDRESS = config.APP_ADDRESS ?? _APP_ADDRESS
export const ETH_PROVIDER_URL = config.ETH_PROVIDER_URL

export const provider = ETH_PROVIDER_URL.startsWith('http')
  ? new ethers.providers.JsonRpcProvider(ETH_PROVIDER_URL)
  : new ethers.providers.WebSocketProvider(ETH_PROVIDER_URL)

export const SERVER = prod
  ? 'https://relay.zketh.io'
  : 'http://192.168.1.230:8000'
export const WS_SERVER = prod
  ? 'wss://relay.zketh.io/ws'
  : 'ws://192.168.1.230:8001'
export const KEY_SERVER = prod
  ? 'https://relay.zketh.io/build/'
  : 'http://192.168.1.230:8000/build/'
// export const KEY_SERVER = 'https://keys.unirep.io/2-beta-1/'
