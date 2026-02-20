import {useContext} from "react";
import {RoomContext} from "../../contexts";

export interface Message {
  sender: string;
  fromMe: boolean;
  message: string;
}


export default function MessageCard(
  {message}:
  { message: Message }
) {
  const { peerNames } = useContext(RoomContext);

  return (
    <div className={`m-3 p-3 bg min-w50 border-rounded ${
      message.fromMe ? 'align-self-end text-right' : 'align-self-start text-left'
    }`}>
      {
        message.fromMe
          ? ''
          : <div className="font-bold">
            {peerNames.get(message.sender) ?? 'Unknown'}
          </div>
      }

      {message.message}
    </div>
  )
}
