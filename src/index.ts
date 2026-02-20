import {SignalingClient} from "./signaling/client/main";
import {
    SignalingAnswer,
    SignalingClientId,
    SignalingIceCandidate,
    SignalingMessage,
    SignalingMessageType,
    SignalingOffer,
    SignalingPeerList
} from "./signaling/messages";
import {MessageEvent} from "ws";
import {RTCDataChannel, RTCPeerConnection, RTCSessionDescription} from '@roamhq/wrtc';

const configuration = {'iceServers': [{'urls': 'stun:stun.l.google.com:19302'}]}

const client = new SignalingClient();

// ------------------- State -------------------
let clientId: string | undefined;
let peerList = new Set<string>();
const peerConnections = new Map<string, RTCPeerConnection>();
const connections = new Map<string, boolean>();
const dataChannels = new Map<string, RTCDataChannel>();
// ---------------------------------------------

function parseMessage(data: string | Buffer | ArrayBuffer | Buffer[]) {
    return typeof data === 'string'
        ? [SignalingMessage.fromJson(data)]
        : Array.isArray(data)
            ? data.map(SignalingMessage.fromBuffer)
            : [SignalingMessage.fromBuffer(data)];
}

async function handleClientId(message: SignalingClientId) {
    clientId = message.id;

    console.log(`Client ID ${clientId} received.`);
}

async function listenForIceCandidate(peer: string, peerConnection: RTCPeerConnection) {
    peerConnection.addEventListener('icecandidate', async event => {
        if (event.candidate) {
            const message = new SignalingIceCandidate(peer, clientId!, event.candidate);

            client.send(message);
        }
    });
}

async function listenForConnected(peer: string, peerConnection: RTCPeerConnection) {
    if (clientId == null) {
        console.error('Client ID is null.');
        return;
    }

    peerConnection.addEventListener('connectionstatechange', () => {
        if (peerConnection.connectionState === 'connected' && !connections.get(peer)) {
            connections.set(peer, true);
            console.log(`RTC to ${peer} connected.`);
        }
    });
}

async function setupDataChannel(peer: string, dataChannel: RTCDataChannel) {
    dataChannels.set(peer, dataChannel);

    dataChannel.addEventListener('open', () => {
        console.log(`Data channel with ${peer} opened`);
        dataChannel.send(`Hello from ${clientId}!`);
    });

    dataChannel.addEventListener('message', event => {
        console.log(`Message from ${peer}:`, event.data);
    });
}

async function setupPeerConnection(peer: string, isInitiator: boolean) {
    if (clientId == null) {
        console.error('Client ID is null.');
        return;
    }

    const peerConnection = new RTCPeerConnection(configuration);

    peerConnections.set(peer, peerConnection);
    connections.set(peer, false);

    await listenForIceCandidate(peer, peerConnection);

    await listenForConnected(peer, peerConnection);

    if (isInitiator) {
        const dataChannel = peerConnection.createDataChannel('chat');
        await setupDataChannel(peer, dataChannel);
    } else {
        peerConnection.addEventListener('datachannel', event => {
            console.log('Data channel received:', event.channel.label);
            setupDataChannel(peer, event.channel);
        });
    }

    return peerConnection;
}

async function handlePeerList(message: SignalingPeerList) {
    if (clientId == null) {
        console.error('Client ID is null.');
        return;
    }

    for (const peer of message.peerList) {
        if (peer == clientId) return;

        peerList.add(peer);

        const peerConnection = await setupPeerConnection(peer, true);

        if (peerConnection == null) return;

        const offer = await peerConnection.createOffer();

        await peerConnection.setLocalDescription(offer);

        const message = new SignalingOffer(peer, clientId, offer);

        client.send(message);

        console.log(`Offer to ${peer} sent.`);
    }
}

async function sendAnswer(peer: string, peerConnection: RTCPeerConnection) {
    if (clientId == null) {
        console.error('Client ID is null.');
        return;
    }

    const answer = await peerConnection.createAnswer();

    await peerConnection.setLocalDescription(answer);

    const answerMessage = new SignalingAnswer(peer, clientId, answer);

    client.send(answerMessage);

    console.log(`Answer to ${peer} sent.`);
}

async function handleOffer(message: SignalingOffer) {
    if (clientId == null) {
        console.error('Client ID is null.');
        return;
    }

    const peer = message.senderId;

    // if we have already sent an offer, do not react
    if (peerConnections.has(peer)) return;

    const peerConnection = await setupPeerConnection(peer, false);

    if (peerConnection == null) return;

    peerConnection.setRemoteDescription(message.offer);

    console.log(`Offer by ${peer} received.`);

    await sendAnswer(peer, peerConnection);
}

async function handleAnswer(message: SignalingAnswer) {
    if (clientId == null) {
        console.error('Client ID is null.');
        return;
    }

    const peer = message.senderId;

    const peerConnection = peerConnections.get(peer);

    if (peerConnection == null) {
        console.error(`Answer from ${peer} received, but no peer connection exists.`);
        return;
    }

    const remoteDescription = new RTCSessionDescription(message.answer);

    await peerConnection.setRemoteDescription(remoteDescription);

    console.log(`Answer from ${peer} received.`);
}

async function handleIceCandidate(message: SignalingIceCandidate) {
    if (clientId == null) {
        console.error('Client ID is null.');
        return;
    }

    const peer = message.senderId;

    const peerConnection = peerConnections.get(peer);

    if (peerConnection == null) {
        console.error(`ICE Candidate from ${peer} received, but no peer connection exists.`);
        return;
    }

    await peerConnection.addIceCandidate(message.candidate);
}

async function handleMessage(message: SignalingMessage) {
    switch (message.type) {
        case SignalingMessageType.ClientId:
            await handleClientId(message as SignalingClientId);
            break;

        case SignalingMessageType.PeerList:
            await handlePeerList(message as SignalingPeerList);
            break;

        case SignalingMessageType.Offer:
            await handleOffer(message as SignalingOffer);
            break;

        case SignalingMessageType.Answer:
            await handleAnswer(message as SignalingAnswer);
            break;

        case SignalingMessageType.IceCandidate:
            await handleIceCandidate(message as SignalingIceCandidate);
            break;
    }
}

async function handleMessageEvent(event: MessageEvent) {
    const messages = parseMessage(event.data);

    for (const message of messages) {
        await handleMessage(message);
    }
}

client.onMessage(async event => {
    await handleMessageEvent(event);
});

client.onOpen(async () => {
    console.log('Signaling connection opened.');
});
