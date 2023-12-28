
import { ChatProps } from "../ChatProps.interface";
import ChatBox from "../chatBox/ChatBox";
import UsersLayout from "../usersLayout/UsersLayout";


const ChatMain: React.FC<ChatProps> = (props: any & {onUpdate: boolean}) => {

	return (
		<div className="chat-main">
			<UsersLayout {...props} onUpdate={props.onUpdate} />
			<ChatBox {...props} onUpdate={props.onUpdate} />
		</div>
	);
};
export default ChatMain;
