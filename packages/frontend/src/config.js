import { ethers } from 'ethers'
import config from '../../../config'

const prod = NODE_ENV === 'production'

const _UNIREP_ADDRESS = prod
  ? '0x209D53D7D610CD4B22dbbf942eF13B7657c69b57'
  : undefined
const _APP_ADDRESS = prod
  ? '0x4d7ceE2b4aA8ab9f5513bA692692A2C48c2b4b0E'
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
  ? 'https://keys.zketh.io/v0/'
  : 'https://keys.zketh.io/v0/'
//: 'http://localhost:8000/build/'
// export const KEY_SERVER = 'https://keys.unirep.io/2-beta-1/'
