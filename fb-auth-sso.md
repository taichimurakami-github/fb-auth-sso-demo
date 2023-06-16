# Firebase Auth SSO

## Flow

<img src="https://assets.st-note.com/production/uploads/images/42248488/picture_pc_3834dc61d60c82cc96ea74c15b8f6fb6.png?width=800" />

### Session Coockie の作成及び確認

ref:

- [セッション Cookie を管理する](https://firebase.google.com/docs/auth/admin/manage-cookies?hl=ja)

```js
// セッションCoockieを作成する
app.post("/sessionLogin", (req, res) => {
  // Get the ID token passed and the CSRF token.
  const idToken = req.body.idToken.toString();
  const csrfToken = req.body.csrfToken.toString();
  // Guard against CSRF attacks.
  if (csrfToken !== req.cookies.csrfToken) {
    res.status(401).send("UNAUTHORIZED REQUEST!");
    return;
  }
  // Set session expiration to 5 days.
  const expiresIn = 60 * 60 * 24 * 5 * 1000;
  // Create the session cookie. This will also verify the ID token in the process.
  // The session cookie will have the same claims as the ID token.
  // To only allow session cookie setting on recent sign-in, auth_time in ID token
  // can be checked to ensure user was recently signed in before creating a session cookie.
  getAuth()
    .createSessionCookie(idToken, { expiresIn })
    .then(
      (sessionCookie) => {
        // Set cookie policy for session cookie.
        const options = { maxAge: expiresIn, httpOnly: true, secure: true };
        res.cookie("session", sessionCookie, options);
        res.end(JSON.stringify({ status: "success" }));
      },
      (error) => {
        res.status(401).send("UNAUTHORIZED REQUEST!");
      }
    );
});
```

```js
// セッションCookieを確認して権限チェック
// Whenever a user is accessing restricted content that requires authentication.
app.post("/profile", (req, res) => {
  const sessionCookie = req.cookies.session || "";
  // Verify the session cookie. In this case an additional check is added to detect
  // if the user's Firebase session was revoked, user deleted/disabled, etc.
  getAuth()
    .verifySessionCookie(sessionCookie, true /** checkRevoked */)
    .then((decodedClaims) => {
      serveContentForUser("/profile", req, res, decodedClaims);
    })
    .catch((error) => {
      // Session cookie is unavailable or invalid. Force user to login.
      res.redirect("/login");
    });
});
```

```js
// ログアウト
app.post("/sessionLogout", (req, res) => {
  res.clearCookie("session");
  res.redirect("/login");
});
```

### Custom Token を要求する

- [カスタム トークンを作成する](https://firebase.google.com/docs/auth/admin/create-custom-tokens?hl=ja)

```js
//カスタムトークン作成 @ server-side

/**
 * Without custom claims
 */
const uid = "some-uid";

getAuth()
  .createCustomToken(uid)
  .then((customToken) => {
    // Send token back to client
  })
  .catch((error) => {
    console.log("Error creating custom token:", error);
  });

/**
 * With custom claims
 *
 * ex: Firestore Database Rules
 *
 * >>>
 * {
 *  "rules": {
 *    "premiumContent": {
 *      ".read": "auth.token.premiumAccount === true"
 *    }
 *  }
 * }
 * >>>
 */
const userId = "some-uid";
const additionalClaims = {
  premiumAccount: true,
};

getAuth()
  .createCustomToken(userId, additionalClaims)
  .then((customToken) => {
    // Send token back to client
  })
  .catch((error) => {
    console.log("Error creating custom token:", error);
  });
```

- [クライアントでのカスタム トークンを使用したログイン](https://firebase.google.com/docs/auth/admin/create-custom-tokens?hl=ja#web-version-9)

```js
import { getAuth, signInWithCustomToken } from "firebase/auth";

const auth = getAuth();
signInWithCustomToken(auth, token)
  .then((userCredential) => {
    // Signed in
    const user = userCredential.user;
    // ...
  })
  .catch((error) => {
    const errorCode = error.code;
    const errorMessage = error.message;
    // ...
  });
```
