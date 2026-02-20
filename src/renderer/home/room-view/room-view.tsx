import {useContext, useEffect, useState} from "react";
import CreateRoomButton from "./create-room-button";
import JoinRoomButton from "./join-room-button";
import {RoomContext, RTCContext} from "../../contexts";
import {RTCEventType} from "../../../rtc/connection-manager";
import DisconnectButton from "./disconnect-button";
import PeersDisplay from "./peers-display";
import MicrophoneIcon from "../../icons/microphone-icon";
import SoundIcon from "../../icons/sound-icon";
import MicrophoneButton from "./microphone-button";
import SoundButton from "./sound-button";
import CopyRoomButton from "./copy-room-button";
import PersistedRooms from "./persisted-rooms";
import RoomNameInput from "./room-name-input";

export default function RoomView() {
  const {roomId} = useContext(RoomContext);


  return (
    <div className="d-flex flex-column justify-content-start h-md-100 w-md-2">
      <div className="d-flex flex-row justify-content-between mb-4">
        <MicrophoneButton/>
        <SoundButton/>
        <DisconnectButton/>
      </div>

      {
        roomId == null
          ?
          <div className="d-flex flex-column h-md-100 overflow-md-hidden">
            <JoinRoomButton/>
            <CreateRoomButton/>
            <PersistedRooms/>
          </div>
          :
          <div className="d-flex flex-column">
            <RoomNameInput/>
            <CopyRoomButton/>
            <div className="mt-md-3">
              <PeersDisplay/>
            </div>
          </div>
      }
    </div>
  )
}
