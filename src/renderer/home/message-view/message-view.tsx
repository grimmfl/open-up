import MessageCard from "./message-card";
import MessageInput from "./message-input";
import {useContext, useEffect, useRef, useState} from "react";
import {MessageContext, RoomContext} from "../../contexts";
import NewMessageTooltip from "./new-message-tooltip";

export default function MessageView() {
  const {messageList} = useContext(MessageContext);
  const {roomId} = useContext(RoomContext);

  const [showNewMessageTooltip, setShowNewMessageTooltip] = useState(false);
  const [previousMessageCount, setPreviousMessageCount] = useState(0);
  const [scrollOffset, setScrollOffset] = useState(0);

  const divRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    scrollDown('instant')
  }, []);

  useEffect(() => {
    const div = divRef.current;

    if (div == null) return;

    if (scrollOffset < 1) {
      scrollDown('smooth');
      return;
    }

    if (messageList.slice(previousMessageCount).find(m => !m.fromMe)) {
      setShowNewMessageTooltip(true);
    }

    setPreviousMessageCount(messageList.length);
  }, [messageList]);

  function scrollDown(behavior: ScrollBehavior) {
    const div = divRef.current;
    if (!div) return;

    const observer = new ResizeObserver(() => {
      setTimeout(() => {
        div.lastElementChild?.scrollIntoView({ behavior });
      }, 100);
    });

    observer.observe(div);
    setTimeout(() => observer.disconnect(), 300); // stop after layout settles
  }

  function onScroll() {
    const div = divRef.current;

    if (div == null) return;

    setScrollOffset(Math.abs(div.scrollHeight - div.scrollTop - div.clientHeight));

    setShowNewMessageTooltip(false);
  }

  const divClass = `${roomId != null ? 'd-flex' : 'd-none d-md-flex'} flex-grow-1 flex-column justify-content-between bg-darker border-rounded h-100 flex-1 min-h0`

  return (
    <div className={divClass}>
      <div className="d-flex flex-column justify-content-start min-h0 position-relative">
        <div className="d-flex flex-column justify-content-start overflow-auto mb-2" ref={divRef} onScroll={onScroll}>
          {messageList.map((message, index) =>
            <MessageCard key={`message${index}`} message={message}/>
          )}
        </div>
        { showNewMessageTooltip && <NewMessageTooltip/> }
      </div>
      <MessageInput/>
    </div>
  )
}
