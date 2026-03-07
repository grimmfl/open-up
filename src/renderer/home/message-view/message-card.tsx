import { ReactElement, useContext, useEffect, useState } from 'react';
import {RoomContext} from "../../contexts";
import DOMPurify from 'dompurify';

export const MessageType = ['text', 'image'] as const;
export type MessageType = typeof MessageType[number];

export interface Message {
  sender: string;
  fromMe: boolean;
  message: string;
  type: MessageType;
}

function escapeHtml(message: string) {
  return message
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

async function isImageURL(url: string) {
  if (/\.(jpg|jpeg|png|gif|webp|svg|bmp|ico)(\?.*)?$/i.test(url)) {
    return true;
  }
  try {
    const res = await fetch(url, { method: 'HEAD', mode: 'no-cors' });
    return res.headers.get('Content-Type')?.startsWith('image/') ?? false;
  } catch {
    return false;
  }
}

async function replaceLinks(message: string) {
    const regex = /https?:\/\/[^\s/$.?#].[^\s]*/gi;
    const matches = [...message.matchAll(regex)];

    // check all URLs in parallel
    const replacements = await Promise.all(
      matches.map(async ([url]) => ({
        url,
        isImage: await isImageURL(url),
      })),
    );

    return message.replace(regex, (url) => {
      const result= replacements.find((r) => r.url === url);
      if (result == null) return url;
      return result.isImage
        ? `<div class="d-flex flex-column">
            <a href="${url}" target="_blank" rel="noopener noreferrer">${url}</a>
            <img src="${url}" alt="${url}" width="200px" class="align-self-end mt-2">
           </div>`
        : `<a href="${url}" target="_blank" rel="noopener noreferrer">${url}</a>`;
    });

}

async function formatMessage(message: string) {
  message = escapeHtml(message);
  message = await replaceLinks(message)
  message = DOMPurify.sanitize(message);

  return <div dangerouslySetInnerHTML={{ __html: message }}></div>;
}


export default function MessageCard(
  {message}:
  { message: Message }
) {
  const { peerNames } = useContext(RoomContext);

  const [messageDisplay, setMessageDisplay] = useState<ReactElement | null>(null);

  useEffect(() => {
    if (message.type === 'text') {
      formatMessage(message.message).then((m) => setMessageDisplay(m));
    }

    if (message.type === 'image') {
      setMessageDisplay(<img src={message.message} alt="" width="200px"/>);
    }
  }, []);

  return (
    <div className={`m-3 p-3 bg min-w50 border-rounded wrap-text ${
      message.fromMe ? 'align-self-end text-right' : 'align-self-start text-left'
    }`}>
      {
        message.fromMe
          ? ''
          : <div className="font-bold">
            {peerNames.get(message.sender) ?? 'Unknown'}
          </div>
      }

      {messageDisplay}
    </div>
  )
}
