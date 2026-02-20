import {RTCConnectionManager, RTCEventType} from "./connection-manager";
import {RTCMessageHandler} from "./message-handler";

const Mode = ["create", "join"] as const;
export type Mode = typeof Mode[number];

const connectionManager = new RTCConnectionManager();
const messageHandler = new RTCMessageHandler();

connectionManager.addEventListener(RTCEventType.ChatChannel, event => {
  messageHandler.addChatChannel(event.peer!, event.dataChannel!);
})

function parseArg(
  name: string,
  required: boolean = true,
  isValid: (value: string) => boolean = () => true
) {
  const arg = process.argv
    .find(arg => arg.startsWith(name));

  if (!required || arg == null) {
    console.error(`ERROR: "${name}" parameter is required.`)
    process.exit(1);
  }

  const value = arg!.split('=')[1];

  if (!isValid(value)) {
    console.error(`ERROR: invalid value "${value}" for "${name}" parameter.`)
    process.exit(1);
  }

  return value;
}

const mode = parseArg(
  'mode',
  true,
    value => Mode.indexOf(value as Mode) !== -1
);

const code = parseArg(
  'code',
  true,
  value => value.length === 4 && /[A-Z0-9a-z]{4}/.test(value)
).toUpperCase();

connectionManager.addEventListener(RTCEventType.ClientId, async () => {
  switch (mode) {
    case 'create':
      await connectionManager.createRoom(code);
      break;
    case 'join':
      await connectionManager.joinRoom(code);
      break;
  }
});
