import { useContext, useState } from 'react';
import {MessageContext, RTCContext} from "../../contexts";

export default function MessageInput() {
  const {rtcMessageHandler} = useContext(RTCContext);
  const {setMessageList, messageInput, setMessageInput} = useContext(MessageContext);

  const [isInputDisabled, setIsInputDisabled] = useState<boolean>(!messageInput.trim());
  const [isControlDown, setIsControlDown] = useState<boolean>(false);
  const [images, setImages] = useState<string[]>([]);

  function handleMessageInput(value: string) {
    setMessageInput(value);

    if (!value?.trim()) {
      setIsInputDisabled(true);

      return;
    }

    setIsInputDisabled(false);
  }

  function handleImage() {
    navigator.clipboard.read().then(async (clipboardItems) => {
      for (const clipboardItem of clipboardItems) {
        const imageType = clipboardItem.types.find((type) =>
          type.startsWith('image/'),
        );

        if (imageType == null) continue;

        const blob = await clipboardItem.getType(imageType);

        const reader = new FileReader();
        reader.readAsDataURL(blob);
        reader.onloadend = function () {
          const base64data = reader.result as string;
          setImages(prev => [...prev, base64data])
        };
      }
    });
  }

  function onKeyPress(key: string) {
    if (key === 'Control') setIsControlDown(true);

    if (isControlDown && key === 'v') {
      handleImage();
    }

    if (key === 'Enter') sendMessage();
  }

  function onKeyUp(key: string) {
    if (key === 'Control') setIsControlDown(false);
  }

  function sendImages() {
    for (const image of images) {
      rtcMessageHandler!.send({ message: image, type: 'image'});
      setMessageList(prev => [
        ...prev,
        {
          message: image,
          sender: '',
          fromMe: true,
          type: 'image'
        },
      ]);
    }

    setImages([]);
  }

  function sendMessage() {
    if (rtcMessageHandler == null || (!messageInput.trim() && images.length === 0)) return;

    sendImages();

    if (!messageInput.trim()) return;

    const message = messageInput;

    rtcMessageHandler.send({ message, type: 'text' });

    setMessageList(prev => [...prev, {
      message,
      sender: '',
      fromMe: true,
      type: 'text'
    }]);

    setMessageInput('');
    setIsInputDisabled(true);
  }

  return (
    <div className="d-flex flex-column align-self-center align-content-center w-95 mb-4">
      { images.length > 0 &&
        <div className="d-flex flex-row p-2 mb-2 bg border-rounded flex-wrap">
        {images.map((image, i) => (
          <img key={`input-image${i}`} src={image} alt="" width="80px" className="m-1 border-rounded"/>
        ))}
      </div>
      }
      <div className="d-flex flex-row w-100">
        <input
          className="form-control message-input py-2 flex-grow-1 align-self-center"
          type="text"
          placeholder="Write a message . . ."
          value={messageInput}
          onKeyDown={(e) => onKeyPress(e.key)}
          onKeyUp={(e) => onKeyUp(e.key)}
          onChange={(e) => handleMessageInput(e.target.value)}
        />
        <button
          className="btn bg btn-message-input"
          onClick={sendMessage}
          disabled={isInputDisabled && images.length === 0}
        >
          Send
        </button>
      </div>
    </div>
  );
}
