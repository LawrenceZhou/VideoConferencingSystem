import React from 'react';
import { Message } from '@twilio/conversations';
import MessageInfo from './MessageInfo/MessageInfo';
import MessageListScrollContainer from './MessageListScrollContainer/MessageListScrollContainer';
import TextMessage from './TextMessage/TextMessage';
import useVideoContext from '../../../hooks/useVideoContext/useVideoContext';
import MediaMessage from './MediaMessage/MediaMessage';

interface MessageListProps {
  messages: Message[];
  to: string;
  setTo: (to: string) => void;
}

interface Attributes {
  [key: string]: string;
}

const getFormattedTime = (message?: Message) =>
  message?.dateCreated?.toLocaleTimeString('en-us', { hour: 'numeric', minute: 'numeric' }).toLowerCase();

export default function MessageList({ messages, to, setTo }: MessageListProps) {
  const { room } = useVideoContext();
  const localParticipant = room!.localParticipant;

  return (
    <MessageListScrollContainer messages={messages}>
      {messages.map((message, idx) => {
        const time = getFormattedTime(message)!;
        const previousTime = getFormattedTime(messages[idx - 1]);

        const isLocalParticipant = localParticipant.identity === message.author;

        let message_to = '';
        console.log(message.attributes);
        if (message.attributes) {
          //let parsed_attributes= JSON.parse(message.attributes as string);
          let parsed_attributes = message.attributes as Attributes;
          message_to = parsed_attributes.to;
          console.log(message.attributes, parsed_attributes, message_to);
          //message_to = message.attributes.to! as string;
          //parsedJSON['to'];
        }

        let previous_to = '';
        if (idx > 0) {
          //let parsed_attributes= JSON.parse(message.attributes as string);
          let previous_parsed_attributes = messages[idx - 1].attributes as Attributes;
          previous_to = previous_parsed_attributes.to;
          console.log(previous_to);
          //message_to = message.attributes.to! as string;
          //parsedJSON['to'];
        }

        // Display the MessageInfo component when the author or formatted timestamp differs from the previous message
        const shouldDisplayMessageInfo =
          time !== previousTime || message.author !== messages[idx - 1]?.author || message_to !== previous_to;

        const toShow =
          message_to === localParticipant.identity ||
          message.author === localParticipant.identity ||
          message_to === 'all';

        const message_to_convert = message_to === localParticipant.identity ? 'You' : message_to;

        if (toShow) {
          return (
            <React.Fragment key={message.sid}>
              {shouldDisplayMessageInfo && (
                <MessageInfo
                  author={message.author!}
                  isLocalParticipant={isLocalParticipant}
                  dateCreated={time}
                  to={message_to_convert}
                  setTo={setTo}
                />
              )}
              {message.type === 'text' && <TextMessage body={message.body!} isLocalParticipant={isLocalParticipant} />}
              {message.type === 'media' && <MediaMessage media={message.attachedMedia![0]} />}
            </React.Fragment>
          );
        }
        return null;
      })}
    </MessageListScrollContainer>
  );
}
