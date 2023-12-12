import { createRoot } from "react-dom/client";
import { User } from "../../components/scorebar/ScoreBar"; 

function createComponent(
	Component : React.FC<{}> | React.FC<{user?: User}>,
	user?: User
) {
    const newFormContainer = document.createElement('div');
    const root = createRoot(newFormContainer);
	if (user)
		root.render(<Component user={user} />);
	else
    	root.render(<Component />);
    document.body.appendChild(newFormContainer);
    return () => {
      setTimeout(() => {
        root.unmount();
        document.body.removeChild(newFormContainer);
      });
    };
  }
  export default createComponent;
