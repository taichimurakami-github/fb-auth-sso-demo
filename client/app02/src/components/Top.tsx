// import useUserDB from "../hooks/useUserDB";
// import { useAuthContext } from "../context/AuthProvider";

import { User } from "firebase/auth";

export default function UserTop(props: { user: User; signOut: () => void }) {
  // const { user } = useAuthContext();

  // const { userState } = useUserDB(user?.email ?? "");

  return (
    <div>
      <h1>User Top page</h1>
      <h2>
        Sign in completed!! <br />
        (by access token from app01)
      </h2>
      <button onClick={props.signOut}>Sign out</button>

      <div style={{ height: "50px" }}></div>
      <h2>Sign in infomation:</h2>
      <div
        style={{
          margin: "35px auto",
        }}
      >
        {JSON.stringify(props.user)
          .split(",")
          .map((v) => (
            <p>{v}</p>
          ))}
      </div>
    </div>
  );
}
