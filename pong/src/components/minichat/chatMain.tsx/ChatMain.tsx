import { User } from "../../scorebar/ScoreBar";
import { ChatProps } from "../MiniChat";
import ChannelProfile from "../channelProfile.tsx/ChannelProfile";
import ChatBox from "../chatBox/ChatBox";
import UsersLayout from "../usersLayout/UsersLayout";


const ChatMain: React.FC<ChatProps> = (props) => {
    
  return (
    <div className="chat-main">
      {/* <ChannelProfile {...props}/> */}
      <UsersLayout {...props}/>
      <ChatBox {...props}/>
    </div>
  );
};
export default ChatMain;
