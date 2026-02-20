const RoomCodeCharacters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
const RoomCodeLength = 4;


export function generateRoomCode() {
  let code = '';

  for (let i = 0; i < RoomCodeLength; i++) {
    code += RoomCodeCharacters.charAt(Math.floor(Math.random() * RoomCodeCharacters.length));
  }

  return code
}
