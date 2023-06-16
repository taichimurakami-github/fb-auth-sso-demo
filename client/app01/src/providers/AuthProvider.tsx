import {
  createContext,
  useState,
  useContext,
  useEffect,
  PropsWithChildren,
} from "react";
import { auth } from "../firebase.app01";
import { Auth, User, onAuthStateChanged } from "firebase/auth";

const AuthContext = createContext<{ user: User | null; auth: Auth }>({
  user: null,
  auth: auth,
});

export function useAuthContext() {
  return useContext(AuthContext);
}

export function AuthProvider(props: PropsWithChildren) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const unsubscribed = onAuthStateChanged(auth, (user) => {
      console.log(user);
      setUser(user);
    });
    return () => {
      unsubscribed();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, auth }}>
      {props.children}
    </AuthContext.Provider>
  );
}
