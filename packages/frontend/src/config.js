import { ethers } from 'ethers'
import config from '../../../config'
export const UNIREP_ADDRESS = config.UNIREP_ADDRESS
export const APP_ADDRESS = config.APP_ADDRESS
export const ETH_PROVIDER_URL = config.ETH_PROVIDER_URL

export const provider = ETH_PROVIDER_URL.startsWith('http')
  ? new ethers.providers.JsonRpcProvider(ETH_PROVIDER_URL)
  : new ethers.providers.WebSocketProvider(ETH_PROVIDER_URL)

// export const SERVER = 'http://192.168.1.230:8000'
export const SERVER = 'https://relay.zketh.io'
// export const WS_SERVER = 'ws://192.168.1.230:8001'
export const WS_SERVER = 'wss://relay.zketh.io/ws'
// export const KEY_SERVER = 'http://192.168.1.230:8000/build/'
export const KEY_SERVER = 'https://relay.zketh.io/build/'
// export const KEY_SERVER = 'https://keys.unirep.io/2-beta-1/'
