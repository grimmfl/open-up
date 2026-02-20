import {RTCDataChannel} from "@roamhq/wrtc";

export interface PeerInformation {
  clientId: string;
  name: string;
}

export class RTCMessageHandler {
  private chatChannels = new Map<string, RTCDataChannel>();
  private informationChannels = new Map<string, RTCDataChannel>();

  private chatEventListeners: ((peer: string, message: string) => void)[] = [];
  private informationEventListeners: ((information: PeerInformation) => void)[] = [];

  send(message: string) {
    for (const channel of this.chatChannels.values()) {
      channel.send(message);
    }
  }

  sendInformation(information: PeerInformation, peer: string | null = null) {
    if (peer == null)  {
      this.informationChannels.forEach(channel => this.sendInformationToChannel(information, channel));

      return;
    }

    const channel = this.informationChannels.get(peer);

    if (channel != null) this.sendInformationToChannel(information, channel);
  }

  addChatChannel(clientId: string, channel: RTCDataChannel) {
    this.chatChannels.set(clientId, channel);

    this.chatEventListeners.forEach(callback => {
      channel.addEventListener('message', event => {
        callback(clientId, event.data);
        console.log(`Received ${event.data}`);
      });
    });
  }

  addInformationChannel(clientId: string, channel: RTCDataChannel) {
    this.informationChannels.set(clientId, channel);

    this.informationEventListeners.forEach(callback => {
      channel.addEventListener('message', event => callback(JSON.parse(event.data)));
    });
  }

  removeChannels(clientId: string) {
    this.chatChannels.delete(clientId);
    this.informationChannels.delete(clientId);
  }

  addChatEventListener(callback: (peer: string, message: string) => void) {
    this.chatEventListeners.push(callback);

    this.chatChannels.forEach((channel, peer) => {
      channel.addEventListener('message', event => callback(peer, event.data))
    });
  }

  addInformationEventListener(callback: (information: PeerInformation) => void) {
    this.informationEventListeners.push(callback);

    this.informationChannels.forEach((channel, peer) => {
      channel.addEventListener('message', event => callback(JSON.parse(event.data)));
    });
  }

  leaveRoom() {
    this.chatChannels.clear();
    this.informationChannels.clear();
  }

  private sendInformationToChannel(information: PeerInformation, channel: RTCDataChannel) {
    channel.send(JSON.stringify(information));
  }

}
