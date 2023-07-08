import "./App.css";
import { getAuth, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { useCallback, useEffect, useRef, useState } from "react";

import { auth } from "./firebase.app01";
import SignIn from "./components/SignIn";

const _API_ENDPOINT_ROOT =
  "http://127.0.0.1:5001/fb-auth-sso-test/us-central1/authtest/"; // ipではなくドメインにする（hostファイルを後述）
// const API_ENDPOINT_VERIFY_SESSION = _API_ENDPOINT_ROOT + "verifySession";
// const API_ENDPOINT_SESSION_LOGIN = _API_ENDPOINT_ROOT + "sessionLogin";
const API_ENDPOINT_VERIFY_SESSION = _API_ENDPOINT_ROOT + "verifySessionToken";
const API_ENDPOINT_CREATE_SESSION = _API_ENDPOINT_ROOT + "createSessionToken";
const LS_SESSIONTOKEN_KEY = "sessionToken";

export type PageState = "SignUp" | "SignIn" | "Top";

export default function App() {
  const [sessionTokenState, setSessionTokenState] = useState(
    localStorage.getItem(LS_SESSIONTOKEN_KEY)
  );

  const params = new URLSearchParams(window.location.search);
  const redirectUrl = useRef(params.get("redirectUrl") ?? "");
  const signOutFlg = useRef(params.get("signOut") ?? "");

  const handleSignIn = async (email: string, password: string) => {
    const cred = await signInWithEmailAndPassword(auth, email, password);
    console.log(cred);

    const userIdToken = await cred.user.getIdToken();
    console.log("user id token: ", userIdToken);

    const newSessionToken = await handleCreateSession(userIdToken);

    setSessionTokenState(newSessionToken);
    localStorage.setItem(LS_SESSIONTOKEN_KEY, newSessionToken);
  };

  const handleCreateSession = useCallback(
    async (idToken: string) => {
      // ここをcookieから取得したい，とりあえずaccess tokenをそのまま使えばよし
      // "eyJhbGciOiJSUzI1NiIsImtpZCI6ImE1MWJiNGJkMWQwYzYxNDc2ZWIxYjcwYzNhNDdjMzE2ZDVmODkzMmIiLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJodHRwczovL3NlY3VyZXRva2VuLmdvb2dsZS5jb20vZmItYXV0aC1zc28tdGVzdCIsImF1ZCI6ImZiLWF1dGgtc3NvLXRlc3QiLCJhdXRoX3RpbWUiOjE2ODg3NTUxNTgsInVzZXJfaWQiOiI0T080OGNJc2dGT21IbkVyOXhWMGdON25pVXAxIiwic3ViIjoiNE9PNDhjSXNnRk9tSG5Fcjl4VjBnTjduaVVwMSIsImlhdCI6MTY4ODc1NTE1OCwiZXhwIjoxNjg4NzU4NzU4LCJlbWFpbCI6InRlc3RAZXhhbXBsZS5jb20iLCJlbWFpbF92ZXJpZmllZCI6ZmFsc2UsImZpcmViYXNlIjp7ImlkZW50aXRpZXMiOnsiZW1haWwiOlsidGVzdEBleGFtcGxlLmNvbSJdfSwic2lnbl9pbl9wcm92aWRlciI6InBhc3N3b3JkIn19.hLnv9ZBgtRPdupcxytEEuf5R_gvXSApaWCl9OAvK-7JsipDyt7bmVzKnN8q0DxOLy6rNgTd3GJ8MmppI0d7ISbdNJlFbYqX5rAM_AN_TuRWFOJRdjxjjY4ry5mGBA2Mh5rFutxLR9pmEJSdp8gqWiT8HrfUki9e4aOPo6vdGuXd1bKj9Kn3Pg_gbUQKVUuetd5nyThcq1h6dlWMBk7XMI1ZN2-P9COPVxgs6P3SgNOHM1ZichaeM4VZdn9L07lFL98ILTDIdN8vHGV-zsX0SKbVSFIet8-Qjz_oazY7N_q_V5wkDJmpMpfgiKny8OO_5K-OUjFkOrO3vgRHiO8YveQ";
      // flow 1-2: Create new session
      const result = await fetch(API_ENDPOINT_CREATE_SESSION, {
        method: "post",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          idToken: idToken,
        }),
      }).then((r) => r.json());

      console.log("session creation result:");
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
    await signOut(getAuth());
    localStorage.removeItem(LS_SESSIONTOKEN_KEY);
    setSessionTokenState(null);
  }, []);

  const handleVerifySession = useCallback(async (sessionToken: string) => {
    // ここをcookieから取得したい，とりあえずaccess tokenをそのまま使えばよし
    // "eyJhbGciOiJSUzI1NiIsImtpZCI6ImE1MWJiNGJkMWQwYzYxNDc2ZWIxYjcwYzNhNDdjMzE2ZDVmODkzMmIiLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJodHRwczovL3NlY3VyZXRva2VuLmdvb2dsZS5jb20vZmItYXV0aC1zc28tdGVzdCIsImF1ZCI6ImZiLWF1dGgtc3NvLXRlc3QiLCJhdXRoX3RpbWUiOjE2ODg3NTUxNTgsInVzZXJfaWQiOiI0T080OGNJc2dGT21IbkVyOXhWMGdON25pVXAxIiwic3ViIjoiNE9PNDhjSXNnRk9tSG5Fcjl4VjBnTjduaVVwMSIsImlhdCI6MTY4ODc1NTE1OCwiZXhwIjoxNjg4NzU4NzU4LCJlbWFpbCI6InRlc3RAZXhhbXBsZS5jb20iLCJlbWFpbF92ZXJpZmllZCI6ZmFsc2UsImZpcmViYXNlIjp7ImlkZW50aXRpZXMiOnsiZW1haWwiOlsidGVzdEBleGFtcGxlLmNvbSJdfSwic2lnbl9pbl9wcm92aWRlciI6InBhc3N3b3JkIn19.hLnv9ZBgtRPdupcxytEEuf5R_gvXSApaWCl9OAvK-7JsipDyt7bmVzKnN8q0DxOLy6rNgTd3GJ8MmppI0d7ISbdNJlFbYqX5rAM_AN_TuRWFOJRdjxjjY4ry5mGBA2Mh5rFutxLR9pmEJSdp8gqWiT8HrfUki9e4aOPo6vdGuXd1bKj9Kn3Pg_gbUQKVUuetd5nyThcq1h6dlWMBk7XMI1ZN2-P9COPVxgs6P3SgNOHM1ZichaeM4VZdn9L07lFL98ILTDIdN8vHGV-zsX0SKbVSFIet8-Qjz_oazY7N_q_V5wkDJmpMpfgiKny8OO_5K-OUjFkOrO3vgRHiO8YveQ";
    // flow 1-2: Create new session
    const result = await fetch(API_ENDPOINT_VERIFY_SESSION, {
      method: "post",
      headers: {
        "Content-Type": "application/json",
        // Authorization: `Bearer ${idToken}`,
      },
      body: JSON.stringify({
        sessionToken: sessionToken,
      }),
    }).then((r) => r.json());
    console.log("session verification result:");
    console.log(result);

    return result.status === "success";
  }, []);

  useEffect(() => {
    // automatic sign-in execution.
    // 実行タイミング：
    // 1. ページを開いた時
    // 2. sessionTokenStateが更新された時
    (async () => {
      if (signOutFlg.current) {
        handleSignOut();
        console.log(`case2: redirecting to ${redirectUrl.current}`);
        window.location.href = `${redirectUrl.current}/?userSignOut=true`;
        return;
      }

      if (sessionTokenState) {
        const isSessionValid = await handleVerifySession(sessionTokenState);

        if (isSessionValid) {
          // sessionTokenを用いてリダイレクト
          console.log(`case1: redirecting to ${redirectUrl.current}`);
          window.location.href = `${redirectUrl.current}/?sessionToken=${sessionTokenState}`;
        }

        console.log("Session token is invalid.");

        //セッショントークンがinvalidな場合はログアウトしてサインインページを表示
        handleSignOut();
      }
    })();
  }, [sessionTokenState, handleVerifySession, handleSignOut]);

  return (
    <>
      {!sessionTokenState ? (
        <SignIn onHandleSignIn={handleSignIn} />
      ) : (
        <>
          <h1>Sign in succeeded!!</h1>
          <p>redirecting to {redirectUrl.current} ...</p>
          <p>access token: {sessionTokenState}</p>
        </>
      )}
    </>
  );
}
