import RoomView from "./room-view/room-view";
import MessageView from "./message-view/message-view";

export default function Home() {
  return (
    <div className="h-100 d-flex flex-column flex-md-row justify-content-start bg gap-md-5 h-100 overflow-hidden">
      <RoomView/>
      <MessageView/>
    </div>
  );
}
