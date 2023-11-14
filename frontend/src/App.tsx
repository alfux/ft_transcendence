import { createRoot } from "react-dom/client";

import { MainPage } from "./Main/MainPage";
import { AuthComponent } from "./Auth/AuthComponent";

const root = createRoot(document.getElementById('root')!);
root.render(
  <App />
)

function NotAuthenticatedButton() {
  return (
    <div>
      <button onClick={() => window.location.href = 'http://localhost:3001/api/auth/login'}>
        Login with 42
      </button>
    </div>
  )
}

function App() {
  return (
    <div>
      <AuthComponent
        Authenticated={() => <MainPage />}
        NotAuthenticated={() => <NotAuthenticatedButton />}
      />
    </div>
  );
}

export default App;
