import EspecialClient from 'especial/client'
import { makeAutoObservable, makeObservable, observable } from 'mobx'
import { WS_SERVER } from '../config'

export default class Message {
  connection = null
  client = null
  keepaliveTimer = null
  connected = false
  info = {}

  messages = []

  constructor() {
    makeAutoObservable(this)
    this.load()
  }

  async load() {
    await this.connect()
  }

  async connect() {
    if (this.connected) return console.log('Already connected')
    try {
      const _client = new EspecialClient(WS_SERVER)
      makeObservable(_client,
        {
          connected: observable
          })

      this.client = _client
      await _client.connect()
      this.connected = _client.connected
    } catch (err) {
      this.client = null
      return
    }
    this.client.addConnectedHandler(() => {
      this.connected = this.client.connected
      if (!this.connected) {
        // clear the client, possibly attempt reconnect
        this.client = null
      }
    })
    this.keepaliveTimer = setInterval(() => this.client.send('ping'), 5 * 60 * 1000)
    const { data, message, status } = await this.client.send('info')
    this.info = data
  }

}
