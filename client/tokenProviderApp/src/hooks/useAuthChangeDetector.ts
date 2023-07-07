import { User, getAuth, onAuthStateChanged } from "firebase/auth";
import React, { useEffect, useState } from "react";

export default function useAuthChangeDetector() {
  const [authCurrentUser, setAuthCurrentUser] = useState<null | User>(null);

  useEffect(() => {
    const auth = getAuth();

    return onAuthStateChanged(auth, (user) => {
      setAuthCurrentUser(user);

      if (!user) {
        console.log("User not found");
      } else {
        console.log("Sign in successful");
        console.log(user);
      }
    });
  }, []);

  return { authCurrentUser };
}
