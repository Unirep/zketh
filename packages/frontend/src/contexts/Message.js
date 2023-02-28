import EspecialClient from 'especial/client'
import { makeAutoObservable, makeObservable, observable } from 'mobx'
import { WS_SERVER } from '../config'

const CHANNEL_NAME = 'internal'

export default class Message {
  connection = null
  client = null
  keepaliveTimer = null
  connected = false
  info = {}

  messages = []

  constructor(state) {
    makeAutoObservable(this)
    this.state = state
    this.load()
  }

  async load() {
    await this.connect()
    const { data } = await this.client.send('load.messages', {
      channelName: CHANNEL_NAME,
    })
    this.ingestMessages(data)
  }

  async signup() {
    const { auth } = this.state
    if (!auth.publicSignals || !auth.proof) throw new Error('No proof')
    await this.client.send('user.register', {
      publicSignals: auth.publicSignals,
      proof: auth.proof,
    })
  }

  async send(text) {
    const { publicSignals, proof } = await this.state.auth.proveAddressData(
      text
    )
    await this.client.send('create.message', {
      text,
      publicSignals,
      proof,
      channelName: CHANNEL_NAME,
    })
  }

  async ingestMessages(message) {
    let newMessages = [...this.messages]
    for (const msg of [message].flat()) {
      newMessages = [msg, ...newMessages.filter((m) => m._id !== msg._id)]
    }
    newMessages.sort((a, b) => (a.timestamp > b.timestamp ? -1 : 1))
    this.messages = newMessages
  }

  async connect() {
    if (this.connected) return console.log('Already connected')
    try {
      const _client = new EspecialClient(WS_SERVER)
      makeObservable(_client, {
        connected: observable,
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
    })
    this.client.listen('msg', ({ data }) => this.ingestMessages(data))
    this.keepaliveTimer = setInterval(
      () => this.client.send('ping'),
      5 * 60 * 1000
    )
    const { data, message, status } = await this.client.send('info')
    this.info = data
  }
}
