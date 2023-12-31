import "./App.css";
import {
  GoogleAuthProvider,
  getAuth,
  signInWithCustomToken,
  signInWithEmailAndPassword,
  signInWithPopup,
} from "firebase/auth";
import { useCallback, useEffect, useState } from "react";

import { auth } from "./firebase.app01";
import SignIn from "./components/SignIn";
import UserTop from "./components/Top";
import useAuthChangeDetector from "./hooks/useAuthChangeDetector";

const _API_ENDPOINT_ROOT =
  "http://127.0.0.1:5001/fb-auth-sso-test/us-central1/authtest/"; // ipではなくドメインにする（hostファイルを後述）
const API_ENDPOINT_VERIFY_SESSION = _API_ENDPOINT_ROOT + "verifySession";
const API_ENDPOINT_SESSION_LOGIN = _API_ENDPOINT_ROOT + "sessionLogin";

export type PageState = "SignUp" | "SignIn" | "Top";

export default function App(props: { appName: string }) {
  const [pageState, setPageState] = useState<PageState>("SignIn");
  const { authCurrentUser } = useAuthChangeDetector();

  const handleSignInWithCustomToken = useCallback(async () => {
    const { customToken } = await fetch(API_ENDPOINT_VERIFY_SESSION, {
      method: "post",
    }).then((r) => r.json());

    console.log("custom token: ", customToken);

    if (customToken) {
      const signInResult = await signInWithCustomToken(auth, customToken);

      console.log(signInResult);
    } else {
      console.error("Invalid custome token : ", customToken);
    }
  }, []);

  const handleSignInWithCustomTokenWithSessionCookieValue = useCallback(
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

  const handleSignInWithGoogle = useCallback(async () => {
    // const provider = new GoogleAuthProvider();
    // provider.addScope("https://www.googleapis.com/auth/contacts.readonly");

    // const r = await signInWithPopup(auth, provider);

    // const accessToken = GoogleAuthProvider.credentialFromResult(r);
    // console.log(`access token : ${accessToken}`);

    const r = await signInWithEmailAndPassword(
      auth,
      "test@example.com",
      "hogefuga"
    );
    const idToken = await r.user.getIdToken();
    const deserializedIdToken = await r.user.getIdTokenResult();
    console.log("idToken: ", idToken);
    console.log(deserializedIdToken);

    // flow 1-2: Create new session
    const result = await fetch(API_ENDPOINT_SESSION_LOGIN, {
      method: "post",
      headers: {
        "Content-Type": "application/json",
        // Authorization: `Bearer ${idToken}`,
      },
      body: JSON.stringify({
        idToken: idToken,
      }),
    }).then((r) => r.json());

    console.log("sessionLogin API result:");
    console.log(result);

    // flow 2: Check Session status and Get custom token
    if (result.status === "success") {
      // document.cookie = `session=${result.cookieValue};max-age=${result.maxAge};domain=http://127.0.0.1:5001/fb-auth-sso-test/us-central1/authtest`;

      // handleSignInWithCustomToken();
      const signInResult =
        await handleSignInWithCustomTokenWithSessionCookieValue(
          result.cookieValue
        );

      console.log(signInResult);
    }
  }, [auth]);

  const handleSignOut = useCallback(async () => {
    getAuth().signOut();
  }, []);

  // useEffect(() => {
  //   console.log(auth);
  //   if (auth.currentUser) {
  //     handleSignInWithCustomToken();
  //   }
  // }, [auth, auth.currentUser]);

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
        <SignIn onHandleSignInWithGoogle={handleSignInWithGoogle} />
      )}
      {pageState === "Top" && <UserTop />} */}
      {!authCurrentUser ? (
        <SignIn onHandleSignInWithGoogle={handleSignInWithGoogle} />
      ) : (
        <UserTop user={authCurrentUser} signOut={handleSignOut} />
      )}
    </>
  );
}
