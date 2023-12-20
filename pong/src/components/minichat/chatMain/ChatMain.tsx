
import { ChatProps } from "../MiniChat";
import ChatBox from "../chatBox/ChatBox";
import UsersLayout from "../usersLayout/UsersLayout";


const ChatMain: React.FC<ChatProps> = (props) => {

  return (
    <div className="chat-main">
      <UsersLayout {...props}/>
      <ChatBox {...props}/>
    </div>
  );
};
export default ChatMain;
