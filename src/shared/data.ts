export interface RoomPersistenceData {
  id: string;
  name: string;
}

export interface PeerPersistenceData {
  clientId: string;
  volume: number;
}

export interface PersistenceData {
  user: {
    name: string;
    clientId?: string;
  };
  devices: {
    inputDeviceId: string;
    outputDeviceId: string;
  };
  rooms: RoomPersistenceData[];
  darkMode?: boolean;
  peers?: PeerPersistenceData[];
}

export const ValidationError = null;
export type ValidationError = typeof ValidationError;


export function validateData(data: any): PersistenceData | ValidationError {
  if (data == null) return ValidationError;

  const user = validateUser(data.user, ['user']);
  const devices = validateDevices(data.devices, ['devices']);
  const rooms = validateRooms(data.rooms, ['rooms']);
  const peers = validatePeers(data.peers, ['peers']);

  if (data.darkMode != null && typeof data.darkMode !== 'boolean') {
    return validationError(data.darkMode, ['darkMode']);
  }

  if (user === ValidationError || devices === ValidationError || rooms === ValidationError || peers === ValidationError) return ValidationError;

  return {
    user,
    devices,
    rooms,
    darkMode: data.darkMode,
    peers
  };
}

function validateUser(data: any, path: string[]): PersistenceData['user'] | ValidationError {
  if (data == null) {
    return validationError(data, path);
  }

  if (data.name == null || typeof data.name !== 'string') {
    return validationError(data.name, [...path, 'name']);
  }

  if (data.clientId != null && typeof data.clientId !== 'string') {
    return validationError(data.clientId, [...path, 'clientId']);
  }

  return { name: data.name, clientId: data.clientId };
}

function validateDevices(data: any, path: string[]): PersistenceData['devices'] | ValidationError {
  if (data == null) {
    return validationError(data, path);
  }

  if (data.inputDeviceId == null || typeof data.inputDeviceId !== 'string') {
    return validationError(data.inputDeviceId, [...path, 'inputDeviceId']);
  }

  if (data.outputDeviceId == null || typeof data.outputDeviceId !== 'string') {
    return validationError(data.outputDeviceId, [...path, 'outputDeviceId']);
  }

  return {
    inputDeviceId: data.inputDeviceId,
    outputDeviceId: data.outputDeviceId,
  };
}

function validateRooms(data: any, path: string[]): RoomPersistenceData[] | ValidationError {
  if (data == null || !Array.isArray(data)) {
    return validationError(data, path);
  }

  const result: PersistenceData['rooms'] = [];

  for (let i = 0; i < data.length; i++) {
    const room = validateRoom(data[i], [...path, `[${i}]`]);

    if (room == ValidationError) return ValidationError;

    result.push(room);
  }

  return result;
}

function validateRoom(data: any, path: string[]): RoomPersistenceData | ValidationError {
  if (data == null) {
    return validationError(data, path);
  }

  if (data.id == null || typeof data.id !== 'string') {
    return validationError(data.id, [...path, 'id']);
  }

  if (data.name == null || typeof data.name !== 'string') {
    return validationError(data.name, [...path, 'name']);
  }

  return {
    id: data.id,
    name: data.name
  };
}

function validatePeers(data: any, path: string[]): PeerPersistenceData[] | undefined | ValidationError {
  if (data == null) return undefined;

  if (!Array.isArray(data)) {
    return validationError(data, path);
  }

  const peers = [];

  for (let [peer, i] of data.map((p, i) => [p, i])) {
    const result = validatePeer(peer, [...path, i.toString()]);

    if (result === ValidationError) return result;

    peers.push(result);
  }

  return peers;
}

function validatePeer(data: any, path: string[]): PeerPersistenceData | ValidationError {
  if (data == null) {
    return validationError(data, path);
  }

  if (data.clientId == null || typeof data.clientId !== 'string') {
    return validationError(data.clientId, [...path, 'clientId']);
  }

  if (data.volume == null || typeof data.volume !== 'number') {
    return validationError(data.volume, [...path, 'volume']);
  }

  return {
    clientId: data.clientId,
    volume: data.volume
  };
}

function validationError(value: any, path: string[]): ValidationError {
  console.error(`invalid value ${value} for ${ path.join('.')}.`);

  return ValidationError;
}
