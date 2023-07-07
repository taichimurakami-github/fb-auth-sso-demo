import "./App.css";
import { getAuth, signInWithCustomToken } from "firebase/auth";
import { useCallback, useEffect, useRef } from "react";

import { auth } from "./firebase.app01";
import SignIn from "./components/SignIn";
import UserTop from "./components/Top";
import useAuthChangeDetector from "./hooks/useAuthChangeDetector";

const _API_ENDPOINT_ROOT =
  "http://127.0.0.1:5001/fb-auth-sso-test/us-central1/authtest/"; // ipではなくドメインにする（hostファイルを後述）
const API_ENDPOINT_VERIFY_SESSION = _API_ENDPOINT_ROOT + "verifySession";
// const API_ENDPOINT_SESSION_LOGIN = _API_ENDPOINT_ROOT + "sessionLogin";

export type PageState = "SignUp" | "SignIn" | "Top";

export default function App(props: { appName: string }) {
  const { authCurrentUser } = useAuthChangeDetector();
  // const [params] = useSearchParams();
  const params = new URLSearchParams(window.location.search);
  const sessionToken = useRef(params.get("sessionToken") ?? null);
  const userSignOut = useRef(params.get("userSignOut") ?? null);

  const handleSignInWithCustomToken = useCallback(
    async (sessionCookieValue: string) => {
      const { customToken } = await fetch(API_ENDPOINT_VERIFY_SESSION, {
        method: "post",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sessionCookie: sessionCookieValue,
        }),
      }).then((r) => r.json());

      console.log("custom token: ", customToken);

      if (customToken) {
        return await signInWithCustomToken(auth, customToken);
      } else {
        console.error("Invalid custome token : ", customToken);
        return null;
      }
    },
    []
  );

  const handleSignIn = useCallback(async () => {
    const SIGNIN_TOKEN_PROVIDER_PAGE_URL = "http://localhost:7777";
    const url = `${SIGNIN_TOKEN_PROVIDER_PAGE_URL}/?redirectUrl=${window.location.origin}`;

    window.location.href = url;
  }, [auth]);

  const handleSignOut = useCallback(async () => {
    await getAuth().signOut();
    window.location.href = `${window.location.origin}/?userSignOut=true`;
  }, []);

  useEffect(() => {
    if (sessionToken.current && !userSignOut.current) {
      handleSignInWithCustomToken(sessionToken.current);
    } else {
      // handleSignIn();
    }
  }, [sessionToken, handleSignInWithCustomToken]);

  return (
    <>
      <h1
        style={{
          borderBottom: "2px solid white",
          lineHeight: "6rem",
          marginBottom: "50px",
        }}
      >
        {props.appName}
      </h1>
      {/* {pageState === "SignIn" && (
        <SignIn onhandleSignIn={handleSignIn} />
      )}
      {pageState === "Top" && <UserTop />} */}
      {!authCurrentUser ? (
        <SignIn onHandleSignInWithGoogle={handleSignIn} />
      ) : (
        <UserTop user={authCurrentUser} signOut={handleSignOut} />
      )}
    </>
  );
}
