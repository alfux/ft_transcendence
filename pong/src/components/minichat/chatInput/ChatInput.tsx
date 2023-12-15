import { chatSocket } from "../../../sockets/chat";
import { ChannelOptions, ChatProps } from "../MiniChat";

const ChatInput: React.FC<ChatProps> = (props) => {
  /*======================================================================
  ===================Send a Message On Click TO the Selected Conversatio(Group)==========
  ======================================================================== */
  const sendMessage = () => {
    const handleKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key == "Enter") {
        e.preventDefault();
        const message = props.messageText;
        const conversation_id: number = props.selectedGroup?.id;
        props.setMessageText(message);
        chatSocket.emit("send_message", {
          message: message,
          conversation_id: conversation_id,
        });
        props.setMessageText("");
      }
    };

    return (
      <>
        <input
          className="message-input-text"
          type="text"
          placeholder="Message ..."
          value={props.messageText}
          onKeyDown={handleKey}
          onChange={(e) => props.setMessageText(e.target.value)}
        />
      </>
    );
  };

  return (
    <div className="message-input">
      {props.selectedGroupOption === ChannelOptions.CHANNEL && sendMessage()}
    </div>
  );
};
export default ChatInput;
