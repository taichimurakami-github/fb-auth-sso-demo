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
    // ここをcookieから取得したい，とりあえずaccess tokenをそのまま使えばよし
    const idToken =
      "eyJhbGciOiJSUzI1NiIsImtpZCI6ImE1MWJiNGJkMWQwYzYxNDc2ZWIxYjcwYzNhNDdjMzE2ZDVmODkzMmIiLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJodHRwczovL3NlY3VyZXRva2VuLmdvb2dsZS5jb20vZmItYXV0aC1zc28tdGVzdCIsImF1ZCI6ImZiLWF1dGgtc3NvLXRlc3QiLCJhdXRoX3RpbWUiOjE2ODg3NTUxNTgsInVzZXJfaWQiOiI0T080OGNJc2dGT21IbkVyOXhWMGdON25pVXAxIiwic3ViIjoiNE9PNDhjSXNnRk9tSG5Fcjl4VjBnTjduaVVwMSIsImlhdCI6MTY4ODc1NTE1OCwiZXhwIjoxNjg4NzU4NzU4LCJlbWFpbCI6InRlc3RAZXhhbXBsZS5jb20iLCJlbWFpbF92ZXJpZmllZCI6ZmFsc2UsImZpcmViYXNlIjp7ImlkZW50aXRpZXMiOnsiZW1haWwiOlsidGVzdEBleGFtcGxlLmNvbSJdfSwic2lnbl9pbl9wcm92aWRlciI6InBhc3N3b3JkIn19.hLnv9ZBgtRPdupcxytEEuf5R_gvXSApaWCl9OAvK-7JsipDyt7bmVzKnN8q0DxOLy6rNgTd3GJ8MmppI0d7ISbdNJlFbYqX5rAM_AN_TuRWFOJRdjxjjY4ry5mGBA2Mh5rFutxLR9pmEJSdp8gqWiT8HrfUki9e4aOPo6vdGuXd1bKj9Kn3Pg_gbUQKVUuetd5nyThcq1h6dlWMBk7XMI1ZN2-P9COPVxgs6P3SgNOHM1ZichaeM4VZdn9L07lFL98ILTDIdN8vHGV-zsX0SKbVSFIet8-Qjz_oazY7N_q_V5wkDJmpMpfgiKny8OO_5K-OUjFkOrO3vgRHiO8YveQ";
    console.log("idToken: ", idToken);

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
