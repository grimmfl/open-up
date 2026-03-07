export interface RoomPersistenceData {
  id: string;
  name: string;
}

export interface PersistenceData {
  user: {
    name: string;
  };
  devices: {
    inputDeviceId: string;
    outputDeviceId: string;
  };
  rooms: RoomPersistenceData[];
  darkMode?: boolean;
}

export const ValidationError = null;
export type ValidationError = typeof ValidationError;


export function validateData(data: any): PersistenceData | ValidationError {
  if (data == null) return ValidationError;

  const user = validateUser(data.user, ['user']);
  const devices = validateDevices(data.devices, ['devices']);
  const rooms = validateRooms(data.rooms, ['rooms']);

  if (data.darkMode != null && typeof data.darkMode !== 'boolean') {
    return validationError(data.darkMode, ['darkMode']);
  }

  if (user == ValidationError || devices == ValidationError || rooms == ValidationError) return ValidationError;

  return {
    user,
    devices,
    rooms,
    darkMode: data.darkMode,
  };
}

function validateUser(data: any, path: string[]): PersistenceData['user'] | ValidationError {
  if (data == null) {
    return validationError(data, path);
  }

  if (data.name == null || typeof data.name !== 'string') {
    return validationError(data.name, [...path, 'name']);
  }

  return { name: data.name };
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

function validationError(value: any, path: string[]): ValidationError {
  console.error(`invalid value ${value} for ${ path.join('.')}.`);

  return ValidationError;
}
