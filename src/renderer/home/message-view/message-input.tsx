import {useContext, useState} from "react";
import {MessageContext, RTCContext} from "../../contexts";

export default function MessageInput() {
  const {rtcMessageHandler} = useContext(RTCContext);
  const {messageList, setMessageList, messageInput, setMessageInput} = useContext(MessageContext);

  const [isInputDisabled, setIsInputDisabled] = useState<boolean>(!messageInput.trim());

  function handleMessageInput(value: string) {
    setMessageInput(value);

    if (!value?.trim()) {
      setIsInputDisabled(true);

      return;
    }

    setIsInputDisabled(false);
  }

  function onKeyPress(key: string) {
    if (key === 'Enter') sendMessage();
  }

  function sendMessage() {
    if (rtcMessageHandler == null || !messageInput.trim()) return;

    const message = messageInput;

    rtcMessageHandler.send(message);

    setMessageList([...messageList, {
      message,
      sender: '',
      fromMe: true
    }]);

    setMessageInput('');
    setIsInputDisabled(true);
  }

  return (
    <div className="d-flex flex-row align-self-center w-95 mb-4">
      <input className="form-control message-input py-2 flex-grow-1 align-self-center"
             type="text"
             placeholder="Write a message . . ."
             value={messageInput}
             onKeyDown={e => onKeyPress(e.key)}
             onChange={(e) => handleMessageInput(e.target.value)}
      />
      <button className="btn bg btn-message-input"
              onClick={sendMessage} disabled={isInputDisabled}>
        Send
      </button>
    </div>
  )
}
