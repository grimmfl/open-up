import {WebSocket, WebSocketServer} from 'ws';
import {
  SignalingClientId,
  SignalingCreateRoom,
  SignalingError,
  SignalingJoinOrCreateRoom,
  SignalingJoinRoom,
  SignalingLeaveRoom,
  SignalingMessage,
  SignalingMessageType,
  SignalingPeerList
} from "../messages";
import {generateRoomCode} from "../../../shared/room-code-generator";

interface ClientInfo {
  socket: WebSocket;
  roomId: string | null;
}

const server = new WebSocketServer({port: 3000});

const clients = new Map<string, ClientInfo>();
const rooms = new Map<string, string[]>();
const roomCodeToId = new Map<string, string>();
const roomIdToCode = new Map<string, string>();

// TODO remove a client from all rooms on n times not found

function broadcast(message: SignalingMessage, roomId: string) {
  const peers = rooms.get(roomId);

  if (peers == null) {
    console.error(`Room ${roomId} not found.`);
    return;
  }

  for (const peer of peers) {
    const client = clients.get(peer);

    if (client == null) {
      console.warn(`Client ${peer} not found.`);
      continue;
    }

    client.socket.send(message.toBuffer());
  }
}

function broadcastPeerList(roomId: string) {
  const peers = rooms.get(roomId);
  const code = roomIdToCode.get(roomId);

  if (peers == null || code == null) {
    console.error(`Room ${roomId} not found.`);
    return;
  }

  const message = new SignalingPeerList('', '', peers, code, roomId);

  broadcast(message, roomId);
}

function forwardMessage(message: SignalingMessage) {
  const client = clients.get(message.targetId);

  if (client == null) {
    console.error(`Target ${message.targetId} not found.`);
    return;
  }

  client.socket.send(message.toBuffer());
}

function createRoom(message: SignalingCreateRoom, socket: WebSocket, client: ClientInfo) {
  if (roomCodeToId.has(message.roomCode)) {
    socket.send(
      SignalingError.roomAlreadyExists(message.roomCode, message.senderId).toBuffer()
    );

    return;
  }

  console.log(`Room ${message.roomCode} created.`);

  const id = crypto.randomUUID().toString();

  addRoom(id, message.roomCode, [message.senderId]);

  client.roomId = id;

  broadcastPeerList(id);
}

function addRoom(id: string, code: string, peers: string[]) {
  rooms.set(id, peers);
  roomCodeToId.set(code, id);
  roomIdToCode.set(id, code);
}

function joinRoomById(roomId: string, clientId: string, client: ClientInfo) {
  const peers = rooms.get(roomId)!;
  peers.push(clientId);
  client.roomId = roomId;

  broadcastPeerList(roomId);
}

function joinRoom(message: SignalingJoinRoom, socket: WebSocket, client: ClientInfo) {
  const id = roomCodeToId.get(message.roomCode);

  if (id == null) {
    socket.send(
      SignalingError.roomNotFound(message.roomCode, message.senderId).toBuffer()
    );

    return;
  }

  joinRoomById(id, message.senderId, client);
}

function joinOrCreateRoom(message: SignalingJoinOrCreateRoom, client: ClientInfo) {
  if (!rooms.has(message.roomId)) {
    const code = generateRoomCode();

    addRoom(message.roomId, code, []);
  }

  joinRoomById(message.roomId, message.senderId, client);
}

function leaveRoom(message: SignalingLeaveRoom, client: ClientInfo) {
  const roomCode = client.roomId;

  if (roomCode == null) return;

  const room = rooms.get(roomCode);

  if (room == null) return;

  room.splice(room.indexOf(message.senderId), 1);

  if (room.length === 0) {
    rooms.delete(roomCode);
  } else {
    broadcastPeerList(roomCode);
  }
}

function handleMessage(message: SignalingMessage, socket: WebSocket) {
  const sender  = clients.get(message.senderId);

  if (sender == null) return;

  switch (message.type) {
    case SignalingMessageType.CreateRoom:
      createRoom(message as SignalingCreateRoom, socket, sender);
      break;

    case SignalingMessageType.JoinRoom:
      joinRoom(message as SignalingJoinRoom, socket, sender);
      break;

    case SignalingMessageType.JoinOrCreate:
      joinOrCreateRoom(message as SignalingJoinOrCreateRoom, sender);
      break;

    case SignalingMessageType.LeaveRoom:
      leaveRoom(message as SignalingLeaveRoom, sender);
      break;

    default:
      forwardMessage(message);
      break
  }
}

function removeClient(clientId: string) {
  clients.delete(clientId);

  // TODO maybe make a map client -> room for more efficient access
  const toDelete: string[] = [];

  rooms.forEach((room, id) => {
    const index = room.indexOf(clientId);

    if (index !== -1) room.splice(index, 1);

    if (room.length === 0) toDelete.push(id);
  })

  for (const room of toDelete) {
    console.log(`Room ${room} closed.`);

    rooms.delete(room);
  }

  console.log(`Client ${clientId} disconnected.`);
}

server.on('connection', socket => {
  const clientId = crypto.randomUUID().toString();

  clients.set(clientId, {
    socket,
    roomId: null
  });

  console.log(`Client ${clientId} connected.`);

  socket.send(new SignalingClientId(clientId, '', clientId).toBuffer());

  socket.on('message', async buffer => {
    const messages = await SignalingMessage.parseMessage(buffer);

    for (const message of messages) {
      handleMessage(message, socket);
    }
  });

  socket.on('close', () => {
    removeClient(clientId);
  })
});
