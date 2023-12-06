import { createRoot } from "react-dom/client";

function createComponent(Component : React.FC<{}>){
    const newFormContainer = document.createElement('div');
    const root = createRoot(newFormContainer);
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