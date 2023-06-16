import { AuthProvider } from "./providers/AuthProvider";
import App from "./App";

export default function AppContainer() {
  return (
    <AuthProvider>
      <App />
    </AuthProvider>
  );
}
