import { AuthProvider } from "./providers/AuthProvider";
import App from "./App";

export default function AppContainer() {
  return (
    <AuthProvider>
      <App appName="app02(auth state test)" />
    </AuthProvider>
  );
}
