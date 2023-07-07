import "./App.css";
import { getAuth, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { useCallback, useEffect, useRef, useState } from "react";

import { auth } from "./firebase.app01";
import SignIn from "./components/SignIn";
import UserTop from "./components/Top";
import useAuthChangeDetector from "./hooks/useAuthChangeDetector";

const _API_ENDPOINT_ROOT =
  "http://127.0.0.1:5001/fb-auth-sso-test/us-central1/authtest/"; // ipではなくドメインにする（hostファイルを後述）
// const API_ENDPOINT_VERIFY_SESSION = _API_ENDPOINT_ROOT + "verifySession";
const API_ENDPOINT_SESSION_LOGIN = _API_ENDPOINT_ROOT + "sessionLogin";
const LS_SESSIONTOKEN_KEY = "sessionToken";

export type PageState = "SignUp" | "SignIn" | "Top";

export default function App() {
  const [tokenState, setTokenState] = useState(
    localStorage.getItem(LS_SESSIONTOKEN_KEY)
  );

  const { authCurrentUser } = useAuthChangeDetector();
  const params = new URLSearchParams(window.location.search);
  const redirectUrl = useRef(params.get("redirectUrl") ?? "");
  const signOutFlg = useRef(params.get("signOut") ?? "");

  const getIdtokenBySignInWithEmailAndPassword = async (
    email: string,
    password: string
  ) => {
    const cred = await signInWithEmailAndPassword(auth, email, password);
    console.log(cred);

    cred.user.getIdToken().then((token) => {
      console.log(token);
      setTokenState(token);
    });
  };

  const handleSignIn = useCallback(
    async (idToken: string) => {
      // ここをcookieから取得したい，とりあえずaccess tokenをそのまま使えばよし
      // "eyJhbGciOiJSUzI1NiIsImtpZCI6ImE1MWJiNGJkMWQwYzYxNDc2ZWIxYjcwYzNhNDdjMzE2ZDVmODkzMmIiLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJodHRwczovL3NlY3VyZXRva2VuLmdvb2dsZS5jb20vZmItYXV0aC1zc28tdGVzdCIsImF1ZCI6ImZiLWF1dGgtc3NvLXRlc3QiLCJhdXRoX3RpbWUiOjE2ODg3NTUxNTgsInVzZXJfaWQiOiI0T080OGNJc2dGT21IbkVyOXhWMGdON25pVXAxIiwic3ViIjoiNE9PNDhjSXNnRk9tSG5Fcjl4VjBnTjduaVVwMSIsImlhdCI6MTY4ODc1NTE1OCwiZXhwIjoxNjg4NzU4NzU4LCJlbWFpbCI6InRlc3RAZXhhbXBsZS5jb20iLCJlbWFpbF92ZXJpZmllZCI6ZmFsc2UsImZpcmViYXNlIjp7ImlkZW50aXRpZXMiOnsiZW1haWwiOlsidGVzdEBleGFtcGxlLmNvbSJdfSwic2lnbl9pbl9wcm92aWRlciI6InBhc3N3b3JkIn19.hLnv9ZBgtRPdupcxytEEuf5R_gvXSApaWCl9OAvK-7JsipDyt7bmVzKnN8q0DxOLy6rNgTd3GJ8MmppI0d7ISbdNJlFbYqX5rAM_AN_TuRWFOJRdjxjjY4ry5mGBA2Mh5rFutxLR9pmEJSdp8gqWiT8HrfUki9e4aOPo6vdGuXd1bKj9Kn3Pg_gbUQKVUuetd5nyThcq1h6dlWMBk7XMI1ZN2-P9COPVxgs6P3SgNOHM1ZichaeM4VZdn9L07lFL98ILTDIdN8vHGV-zsX0SKbVSFIet8-Qjz_oazY7N_q_V5wkDJmpMpfgiKny8OO_5K-OUjFkOrO3vgRHiO8YveQ";
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
        localStorage.setItem("sessionToken", result.cookieValue);
        return result.cookieValue;
      }

      return null;
    },
    [auth]
  );

  const handleSignOut = useCallback(async () => {
    getAuth().signOut();
    localStorage.removeItem(LS_SESSIONTOKEN_KEY);
  }, []);

  useEffect(() => {
    // automatic sign-in execution.
    (async () => {
      if (signOutFlg.current) {
        handleSignOut();
        console.log(`case2: redirecting to ${redirectUrl.current}`);
        window.location.href = `${redirectUrl.current}/?userSignOut=true`;
      }

      if (tokenState) {
        const sessionToken = await handleSignIn(tokenState);
        // sessionTokenを用いてリダイレクト
        console.log(`case1: redirecting to ${redirectUrl.current}`);
        window.location.href = `${redirectUrl.current}/?sessionToken=${sessionToken}`;
        return;
      }
    })();
  }, [tokenState]);

  return (
    <>
      {!authCurrentUser || !tokenState ? (
        <SignIn onHandleSignIn={getIdtokenBySignInWithEmailAndPassword} />
      ) : (
        <>
          <p>redirecting to {redirectUrl.current} ...</p>
          <p>access token: {tokenState}</p>
        </>
      )}
    </>
  );
}
