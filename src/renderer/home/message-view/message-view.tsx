import MessageCard from "./message-card";
import MessageInput from "./message-input";
import {useContext, useEffect } from "react";
import {MessageContext, RoomContext} from "../../contexts";

export default function MessageView() {
  const {messageList} = useContext(MessageContext);
  const {roomId} = useContext(RoomContext);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'A') {
        e.preventDefault();
        const href = (target as HTMLAnchorElement).href;
        window.electron.ipcRenderer.sendMessage('open-link', href);
      }
    };

    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);

  const divClass = `${roomId != null ? 'd-flex' : 'd-none d-md-flex'} flex-grow-1 flex-column justify-content-between bg-darker border-rounded h-100 flex-1 min-h0`

  return (
    <div className={divClass}>
      <div className="d-flex flex-column justify-content-start overflow-auto mb-2">
        {messageList.map((message, index) =>
          <MessageCard key={`message${index}`} message={message}/>
        )}
      </div>
      <MessageInput/>
    </div>
  )
}
