import { getAuth } from "firebase/auth";
import { useCallback, useState } from "react";

export default function SignIn(props: {
  onHandleSignIn: (email: string, password: string) => void;
}) {
  const [emailState, setEmailState] = useState("test@example.com");
  const [passwordState, setPasswordState] = useState("hogefuga");

  const handleOnChangeEmail = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setEmailState(e.currentTarget.value);
    },
    [setEmailState]
  );

  const handleOnChangePassword = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setPasswordState(e.currentTarget.value);
    },
    [setPasswordState]
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    props.onHandleSignIn(emailState, passwordState);
  };

  return (
    <div>
      <h1>SignIn page</h1>
      <p>
        Yout haven't signed in yet.
        <br />
        Please input your account info.
      </p>
      <form
        onSubmit={handleSubmit}
        style={{
          display: "grid",
          gap: 16,
        }}
      >
        <input
          placeholder="email"
          value={emailState}
          onChange={handleOnChangeEmail}
          style={{
            fontSize: "16px",
            padding: "5px",
          }}
        />
        <input
          placeholder="password"
          value={passwordState}
          onChange={handleOnChangePassword}
          style={{
            fontSize: "16px",
            padding: "5px",
          }}
        />
        <button>サインイン</button>
      </form>
    </div>
  );
}
