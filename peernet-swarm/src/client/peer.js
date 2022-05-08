import '@vandeurenglenn/debug'

export default class Peer {
  #connection
  #ready = false
  #connecting = false
  #connected = false
  #channelReady = false
  #destroying = false
  #destroyed = false
  #isNegotiating = false
  #firstNegotiation = true
  #iceComplete = false
  #remoteTracks = []
  #remoteStreams = []
  #pendingCandidates = []
  #senderMap = new Map()
  #iceCompleteTimer
  #channel
  #peerId

  get connection() {
    return this.#connection
  }

  get connected() {
    return this.#connected
  }

  get readyState() {
    return this.channel?.readyState
  }

/**
 * @params {Object} options
 * @params {string} options.channelName - this peerid : otherpeer id
 */
 constructor(options = {}) {
    this._in = this._in.bind(this);
    this.offerOptions = options.offerOptions
    this.initiator = options.initiator
    this.streams = options.streams
    this.socketClient = options.socketClient
    this.id = options.id
    this.to = options.to
    this.bw = {
      up: 0,
      down: 0
    }

    this.channelName = options.channelName

    this.#peerId = options.peerId
    this.options = options
    this.#init()
   }

   get peerId() {
     return this.#peerId
   }

   set socketClient(value) {
     // this.socketClient?.pubsub.unsubscribe('signal', this._in)
     this._socketClient = value
     this._socketClient.pubsub.subscribe('signal', this._in)
   }

   get socketClient() {
     return this._socketClient
   }

   send(message) {
     switch (this.channel?.readyState) {
       case 'open':
        this.bw.up += message.length || message.byteLength
        this.channel.send(message)
       break;
       case 'closed':
       case 'closing':
        debug('channel already closed, this usually means a bad implementation, try checking the readyState or check if the peer is connected before sending')
       break;
       case undefined:
       debug(`trying to send before a channel is created`)
       break;
     }
   }

   request(data) {
    return new Promise((resolve, reject) => {
      const id = Math.random().toString(36).slice(-12)
      // TODO: get rid of JSON
      data = new TextEncoder().encode(JSON.stringify({id, data}))
      const _onData = message => {
        message = JSON.parse(new TextDecoder().decode(message.data))
        if (message.id === id) {
          resolve(message.data)
          pubsub.unsubscribe(`peer:data`, _onData)
        }
      }

      pubsub.subscribe(`peer:data`, _onData)

      // cleanup subscriptions
      // setTimeout(() => {
      //   pubsub.unsubscribe(`peer:data-request-${id}`, _onData)
      // }, 5000);

      this.send(data)
    });
  }

   async #init() {
     try {
       const iceServers = [{
        urls: 'stun:stun.l.google.com:19302' // Google's public STUN server
       }]

       this.#connection = new wrtc.RTCPeerConnection();

       this.#connection.onicecandidate = ({ candidate }) => {
         if (candidate) {
           this.address = candidate.address
           this.port = candidate.port
           this.protocol = candidate.protocol
           this.ipFamily = this.address.includes('::') ? 'ipv6': 'ipv4'
           this._sendMessage({candidate})
         }
       };
       // if (this.initiator) this.#connection.onnegotiationneeded = () => {
         // console.log('create offer');
       this.#connection.ondatachannel = (message) => {
         message.channel.onopen = () => {
           this.#connected = true
           pubsub.publish('peer:connected', this)
         }
         message.channel.onclose = () => this.close.bind(this)

         message.channel.onmessage = (message) => {
           pubsub.publish('peer:data', message)
           debug(`incoming message from ${this.peerId}`)
           this.bw.down += message.length || message.byteLength
         }
         this.channel = message.channel
       }
      if (this.initiator) {

        this.channel = this.#connection.createDataChannel('messageChannel')
        this.channel.onopen = () => {
          this.#connected = true
          pubsub.publish('peer:connected', this)
          // this.channel.send('hi')
        }
        this.channel.onclose = () => this.close.bind(this)

        this.channel.onmessage = (message) => {
          pubsub.publish('peer:data', message)
          debug(`incoming message from ${this.peerId}`)
          this.bw.down += message.length || message.byteLength
        }

       const offer = await this.#connection.createOffer()
       await this.#connection.setLocalDescription(offer)

       this._sendMessage({'sdp': this.#connection.localDescription})

     } catch (e) {
       console.log(e);
     }
   }

   _sendMessage(message) {
     this.socketClient.send({url: 'signal', params: {
       to: this.to,
       from: this.id,
       channelName: this.options.channelName,
       ...message
     }})
   }

   async _in(message, data) {
    // message = JSON.parse(message);
    if (message.to !== this.id) return
    // if (data.videocall) return this._startStream(true, false); // start video and audio stream
    // if (data.call) return this._startStream(true, true); // start audio stream
    if (message.candidate) {
      debug(`incoming candidate ${this.channelName}`)
      debug(message.candidate.candidate)
      this.remoteAddress = message.candidate.address
      this.remotePort = message.candidate.port
      this.remoteProtocol = message.candidate.protocol
      this.remoteIpFamily = this.remoteAddress?.includes('::') ? 'ipv6': 'ipv4'
      return this.#connection.addIceCandidate(new wrtc.RTCIceCandidate(message.candidate));
    }
    try {
      if (message.sdp) {
        if (message.sdp.type === 'offer') {
          debug(`incoming offer ${this.channelName}`)
          await this.#connection.setRemoteDescription(new wrtc.RTCSessionDescription(message.sdp))
          const answer = await this.#connection.createAnswer();
          await this.#connection.setLocalDescription(answer)
          this._sendMessage({'sdp': this.#connection.localDescription})
        }
        if (message.sdp.type === 'answer') {
          debug(`incoming answer ${this.channelName}`)
          await this.#connection.setRemoteDescription(new wrtc.RTCSessionDescription(message.sdp))
        }
     }
    } catch (e) {
      console.log(e);
    }
 }

 close() {
   debug(`closing ${this.peerId}`)
   this.#connected = false
   this.channel?.close()
   this.#connection?.close()

   this.socketClient.pubsub.unsubscribe('signal', this._in)
 }
}
