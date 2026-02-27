import {RTCDataChannel, RTCPeerConnection, RTCRtpSender, RTCSessionDescription} from "@roamhq/wrtc";
import {SignalingClient} from "./signaling/client/main";
import {
  SignalingAnswer,
  SignalingClientId,
  SignalingCreateRoom,
  SignalingError,
  SignalingIceCandidate, SignalingJoinOrCreateRoom,
  SignalingJoinRoom, SignalingLeaveRoom,
  SignalingMessage,
  SignalingMessageType,
  SignalingOffer,
  SignalingPeerList
} from "./signaling/messages";


const RTCConfiguration = {'iceServers': [{'urls': 'stun:stun.l.google.com:19302'}]}


export enum RTCEventType {
  ClientId,
  Connected,
  Disconnected,
  ChatChannel,
  InformationChannel,
  RemoteStream,
  Message
}

export interface RTCEventConfig {
  messageType?: SignalingMessageType;
}

export interface RTCEvent {
  clientId?: string;
  peer?: string;
  dataChannel?: RTCDataChannel;
  remoteStream?: MediaStream;
  message?: SignalingMessage;
}

export class RTCConnectionManager {
  private clientId: string | undefined;
  private peerList: string[] = [];

  private peerConnections = new Map<string, RTCPeerConnection>();
  private connections = new Map<string, boolean>();
  private chatChannels = new Map<string, RTCDataChannel>();
  private informationChannels = new Map<string, RTCDataChannel>();
  private tracks = new Map<string, RTCRtpSender[]>();

  private _audioInput: MediaStream | null = null;

  private clientIdEventListeners = new Map<string, ((event: RTCEvent, callbackId: string) => void)>();
  private connectedEventListeners = new Map<string, ((event: RTCEvent, callbackId: string) => void)>()
  private disconnectedEventListeners = new Map<string, ((event: RTCEvent, callbackId: string) => void)>();
  private chatChannelEventListeners = new Map<string, ((event: RTCEvent, callbackId: string) => void)>();
  private informationChannelEventListeners = new Map<string, ((event: RTCEvent, callbackId: string) => void)>();
  private remoteStreamEventListeners = new Map<string, ((event: RTCEvent, callbackId: string) => void)>();
  private messageEventListeners = new Map<SignalingMessageType | null, Map<string, ((event: RTCEvent, callbackId: string) => void)>>();

  private client;

  constructor(url: string) {
    this.client = new SignalingClient(url);

    this.client.onMessage(async event => {
      await this.handleMessageEvent(event);
    });

    this.client.onOpen(async () => {
      console.log('Signaling connection opened.');
    });
  }

  createRoom(code: string) {
    if (this.clientId == null) {
      console.error('Client ID is null.');
      return;
    }

    this.client.send(new SignalingCreateRoom(this.clientId, code));
  }

  joinRoom(code: string) {
    if (this.clientId == null) {
      console.error('Client ID is null.');
      return;
    }

    this.client.send(new SignalingJoinRoom(this.clientId, code));
  }

  joinOrCreateRoom(roomId: string) {
    if (this.clientId == null) {
      console.error('Client ID is null.');
      return;
    }

    this.client.send(new SignalingJoinOrCreateRoom(this.clientId, roomId));
  }

  addEventListener(event: RTCEventType, callback: (event: RTCEvent, callbackId: string) => void, config: RTCEventConfig = {}) {
    const id = crypto.randomUUID().toString();

    this.alterEventListener(event, listener => listener.set(id, callback), config);
  }

  removeEventListener(event: RTCEventType, callbackId: string, config: RTCEventConfig = {}) {
    this.alterEventListener(event, listener => listener.delete(callbackId), config);
  }

  leaveRoom() {
    if (this.clientId != null) this.client.send(new SignalingLeaveRoom(this.clientId));

    this.peerConnections.forEach(conn => conn.close());
    this.peerConnections.clear();
    this.connections.clear();
    this.chatChannels.forEach(channel => channel.close());
    this.chatChannels.clear();
    this.informationChannels.forEach(channel => channel.close());
    this.informationChannels.clear();
  }

  private alterEventListener(event: RTCEventType, alterFn: (listeners: Map<string, any>) => void, config: RTCEventConfig = {}) {
    switch (event) {
      case RTCEventType.ClientId:
        alterFn(this.clientIdEventListeners);
        return;
      case RTCEventType.Connected:
        alterFn(this.connectedEventListeners);
        return;
      case RTCEventType.Disconnected:
        alterFn(this.disconnectedEventListeners);
        return;
      case RTCEventType.ChatChannel:
        alterFn(this.chatChannelEventListeners);
        return;
      case RTCEventType.InformationChannel:
        alterFn(this.informationChannelEventListeners);
        return;
      case RTCEventType.RemoteStream:
        alterFn(this.remoteStreamEventListeners);
        return;
      case RTCEventType.Message:
        const type = config.messageType ?? null;

        const callbacks = this.messageEventListeners.get(type) ?? new Map<string, (message: RTCEvent, callbackId: string) => void>();

        alterFn(callbacks);

        this.messageEventListeners.set(type, callbacks);
        return;
    }
  }

  setAudioInput(stream: MediaStream) {
    this._audioInput = stream;

    this.peerConnections.forEach((conn, peer) => {
      const oldTracks = this.tracks.get(peer);

      if (oldTracks != null) {
        oldTracks.forEach(track => conn.removeTrack(track));
      }

      this.addInputStream(peer, conn, stream);
    })
  }

  setMuted(isMuted: boolean) {
    this._audioInput?.getAudioTracks()?.forEach(t => t.enabled = !isMuted);
  }

  private async handleMessageEvent(event: MessageEvent) {
    const messages = await SignalingMessage.parseMessage(event.data);

    for (const message of messages) {
      await this.handleMessage(message);
    }
  }

  private async handleMessage(message: SignalingMessage) {
    this.callOnMessage(message, null);

    switch (message.type) {
      case SignalingMessageType.ClientId:
        this.callOnMessage(message, SignalingMessageType.ClientId);
        await this.handleClientId(message as SignalingClientId);
        break;

      case SignalingMessageType.PeerList:
        this.callOnMessage(message, SignalingMessageType.PeerList);
        await this.handlePeerList(message as SignalingPeerList);
        break;

      case SignalingMessageType.Offer:
        this.callOnMessage(message, SignalingMessageType.Offer);
        await this.handleOffer(message as SignalingOffer);
        break;

      case SignalingMessageType.Answer:
        this.callOnMessage(message, SignalingMessageType.Answer);
        await this.handleAnswer(message as SignalingAnswer);
        break;

      case SignalingMessageType.IceCandidate:
        this.callOnMessage(message, SignalingMessageType.IceCandidate);
        await this.handleIceCandidate(message as SignalingIceCandidate);
        break;

      case SignalingMessageType.Error:
        this.callOnMessage(message, SignalingMessageType.Error);
        await this.handleError(message as SignalingError);
        break;
    }
  }

  private callOnMessage(message: SignalingMessage, type: SignalingMessageType | null) {
    const callbacks = this.messageEventListeners.get(type) ?? new Map<string, (message: RTCEvent, callbackId: string) => void>();

    const event = { message };
    callbacks.forEach((callback, id) => callback(event, id));
  }

  private async handleClientId(message: SignalingClientId) {
    this.clientId = message.id;

    const event = {
      clientId: this.clientId!
    };

    this.clientIdEventListeners.forEach((callback, id) => callback(event, id));

    console.log(`Client ID ${this.clientId} received.`);
  }

  private async handlePeerList(message: SignalingPeerList) {
    if (this.clientId == null) {
      console.error('Client ID is null.');
      return;
    }

    // remove peers that are no longer in the peer list
    for (const peer of this.peerList) {
      if (message.peerList.includes(peer)) continue;

      this.removePeer(peer);
    }

    this.peerList = message.peerList.filter(p => p !== this.clientId);

    for (const peer of message.peerList) {
      if (peer == this.clientId) return;

      const peerConnection = await this.setupPeerConnection(peer, true);

      if (peerConnection == null) return;

      const offer = await peerConnection.createOffer();

      await peerConnection.setLocalDescription(offer);

      const message = new SignalingOffer(peer, this.clientId, offer);

      this.client.send(message);

      console.log(`Offer to ${peer} sent.`);
    }
  }

  private removePeer(peer: string) {
    this.peerConnections.delete(peer);
    this.connections.delete(peer);
    this.informationChannels.delete(peer);
    this.chatChannels.delete(peer);

    const event = { peer };
    this.disconnectedEventListeners.forEach((callback, id) => callback(event, id));
  }

  private async setupPeerConnection(peer: string, isInitiator: boolean) {
    if (this.clientId == null) {
      console.error('Client ID is null.');
      return;
    }

    const peerConnection = new RTCPeerConnection(RTCConfiguration);

    this.peerConnections.set(peer, peerConnection);
    this.connections.set(peer, false);

    if (this._audioInput != null) {
      this.addInputStream(peer, peerConnection, this._audioInput);
    }

    await this.listenForTrack(peer, peerConnection);

    await this.listenForIceCandidate(peer, peerConnection);

    await this.listenForConnected(peer, peerConnection);

    if (isInitiator) {
      this.setupDataChannel(peer, peerConnection.createDataChannel('information'));
      this.setupDataChannel(peer, peerConnection.createDataChannel('chat'));
    } else {
      peerConnection.addEventListener('datachannel', async event => {
        console.log('Data channel received:', event.channel.label);
        this.setupDataChannel(peer, event.channel);
      });
    }

    return peerConnection;
  }

  private addInputStream(peer: string, conn: RTCPeerConnection, stream: MediaStream) {
    this.tracks.set(peer, stream.getAudioTracks().map(t => conn.addTrack(t, stream)));
  }

  private async listenForTrack(peer: string, peerConnection: RTCPeerConnection) {
    peerConnection.addEventListener('track', event => {
      const [remoteStream] = event.streams;

      const rtcEvent = { peer, remoteStream };

      this.remoteStreamEventListeners.forEach((callback, id) => callback(rtcEvent, id));
    })
  }

  private setupDataChannel(peer: string, dataChannel: RTCDataChannel) {
    const event = { peer, dataChannel };

    if (dataChannel.label === 'chat') {
      this.chatChannels.set(peer, dataChannel);

      dataChannel.addEventListener('open', () => {
        this.chatChannelEventListeners.forEach((callback, id) => callback(event, id));
      });

      return;
    }

    if (dataChannel.label === 'information') {
      this.informationChannels.set(peer, dataChannel);

      dataChannel.addEventListener('open', () => {
        this.informationChannelEventListeners.forEach((callback, id) => callback(event, id));
      });

      return;
    }
  }

  private async listenForConnected(peer: string, peerConnection: RTCPeerConnection) {
    if (this.clientId == null) {
      console.error('Client ID is null.');
      return;
    }

    peerConnection.addEventListener('connectionstatechange', () => {
      if (peerConnection.connectionState === 'connected' && !this.connections.get(peer)) {
        this.connections.set(peer, true);

        const event = { peer };

        this.connectedEventListeners.forEach((callback, id) => callback(event, id));

        console.log(`RTC to ${peer} connected.`);
      }
    });
  }

  private async listenForIceCandidate(peer: string, peerConnection: RTCPeerConnection) {
    peerConnection.addEventListener('icecandidate', async event => {
      if (event.candidate) {
        const message = new SignalingIceCandidate(peer, this.clientId!, event.candidate);

        this.client.send(message);
      }
    });
  }

  private async handleOffer(message: SignalingOffer) {
    if (this.clientId == null) {
      console.error('Client ID is null.');
      return;
    }

    const peer = message.senderId;

    // if we have already sent an offer, do not react
    if (this.peerConnections.has(peer)) return;

    const peerConnection = await this.setupPeerConnection(peer, false);

    if (peerConnection == null) return;

    peerConnection.setRemoteDescription(message.offer);

    console.log(`Offer by ${peer} received.`);

    await this.sendAnswer(peer, peerConnection);
  }

  private async sendAnswer(peer: string, peerConnection: RTCPeerConnection) {
    if (this.clientId == null) {
      console.error('Client ID is null.');
      return;
    }

    const answer = await peerConnection.createAnswer();

    await peerConnection.setLocalDescription(answer);

    const answerMessage = new SignalingAnswer(peer, this.clientId, answer);

    this.client.send(answerMessage);

    console.log(`Answer to ${peer} sent.`);
  }

  private async handleAnswer(message: SignalingAnswer) {
    if (this.clientId == null) {
      console.error('Client ID is null.');
      return;
    }

    const peer = message.senderId;

    const peerConnection = this.peerConnections.get(peer);

    if (peerConnection == null) {
      console.error(`Answer from ${peer} received, but no peer connection exists.`);
      return;
    }

    const remoteDescription = new RTCSessionDescription(message.answer);

    await peerConnection.setRemoteDescription(remoteDescription);

    console.log(`Answer from ${peer} received.`);
  }

  private async handleIceCandidate(message: SignalingIceCandidate) {
    if (this.clientId == null) {
      console.error('Client ID is null.');
      return;
    }

    const peer = message.senderId;

    const peerConnection = this.peerConnections.get(peer);

    if (peerConnection == null) {
      console.error(`ICE Candidate from ${peer} received, but no peer connection exists.`);
      return;
    }

    await peerConnection.addIceCandidate(message.candidate);
  }

  private async handleError(message: SignalingError) {
    console.error(`Signaling error: ${message.message}`)
  }
}
