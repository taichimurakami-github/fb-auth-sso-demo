import { getAuth } from "firebase/auth";

export default function SignIn(props: {
  onHandleSignInWithGoogle: () => void;
}) {
  return (
    <div>
      <h1>SignIn page</h1>
      <button onClick={props.onHandleSignInWithGoogle}>
        Googleでサインイン
      </button>
    </div>
  );
}
