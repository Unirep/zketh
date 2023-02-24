import EspecialClient from 'especial/client'
import { makeAutoObservable } from 'mobx'
import { WS_SERVER } from '../config'

export default class Message {
  connection = null
  client = null
  keepaliveTimer = null
  info = {}

  constructor() {
    makeAutoObservable(this)
    this.load()
  }

  async load() {
    await this.connect()
  }

  get connected() {
    return this.client?.connected ?? false
  }

  async connect() {
    if (this.connected) return console.log('Already connected')
    try {
      this.client = new EspecialClient(WS_SERVER)
      await this.client.connect()
    } catch (err) {
      console.log('connection error')
      console.log(err)
      this.client = null
      return
    }
    // this.client.addConnectedHandler(() => {
    //   if (!this.connected) {
    //     // clear the client, possibly attempt reconnect
    //     this.client = null
    //   }
    // })
    this.keepaliveTimer = setInterval(() => this.client.send('ping'), 5 * 60 * 1000)
    const { data, message, status } = await this.client.send('info')
    this.info = data
  }

}
