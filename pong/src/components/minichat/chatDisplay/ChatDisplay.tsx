import { useEffect, useState } from "react";
import { ChannelOptions, ChatProps } from "../MiniChat";
import { User } from "../../scorebar/ScoreBar";

const ChatDisplay: React.FC<ChatProps> = (props) => {


  /*======================================================================
  ===================If Channel Have messages Display the messages==========
  ======================================================================== */
  const displayChannelMessages = props.channelMessages?.map((message: any) => {
    return (
      <div key={message?.id}>
        <p key={message?.content}>
          {message?.sender?.user?.username} : {message?.content}
        </p>
      </div>
    );
  });

  useEffect(() => {
    if (props.displayContainer.current) {
      props.displayContainer.current.scrollTo(
        0,
        props.displayContainer.current.scrollHeight
      );
    }
  }, [props.channelMessages]);

  return (
    <div ref={props.displayContainer} className="message-output">
      <div className="message-output-box">
        {props.selectedGroupOption === ChannelOptions.CHANNEL &&
          displayChannelMessages}
      </div>
    </div>
  );
};
export default ChatDisplay;
