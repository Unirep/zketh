import { ethers } from 'ethers'
import fs from 'fs/promises'
import os from 'os'
import path from 'path'
import _config from '../../../config.js'
import { config } from 'dotenv'
config()

export const UNIREP_ADDRESS =
  process.env.UNIREP_ADDRESS ?? _config.UNIREP_ADDRESS
export const APP_ADDRESS = process.env.APP_ADDRESS ?? _config.APP_ADDRESS
export const ETH_PROVIDER_URL =
  process.env.ETH_PROVIDER_URL ?? _config.ETH_PROVIDER_URL
export const PRIVATE_KEY = process.env.PRIVATE_KEY ?? _config.PRIVATE_KEY

const DB_PATH =
  process.env.DB_PATH || (await fs.mkdtemp(path.join(os.tmpdir(), 'zketh')))
const stat = await fs.stat(DB_PATH)
if (!stat.isDirectory()) {
  throw new Error('DB_PATH is not a directory')
}
export const dbpath = (name) => path.join(DB_PATH, name)

export const CHANNEL_PATH = path.join(DB_PATH, 'channels')
try {
  await fs.mkdir(CHANNEL_PATH)
} catch (err) {}
export const channelpath = (name) => path.join(CHANNEL_PATH, name)

export const provider = ETH_PROVIDER_URL.startsWith('http')
  ? new ethers.providers.JsonRpcProvider(ETH_PROVIDER_URL)
  : new ethers.providers.WebSocketProvider(ETH_PROVIDER_URL)

export const KEY_SERVER = 'https://keys.zketh.io/v0/'
