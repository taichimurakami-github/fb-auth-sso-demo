import * as admin from "firebase-admin";
import * as functions from "firebase-functions";
import * as express from "express";
import * as cors from "cors";
import * as cookieParser from "cookie-parser";
import * as cookie from "cookie";
// import * as session from "express-session";
import { firebaseConfig } from "./firebase";
import { serviceAccountInfo } from "./serviceAccountInfo";

export const REGION = "asia-northeast1";

export const fbadmin = admin.initializeApp({
  ...firebaseConfig,
  credential: admin.credential.cert(serviceAccountInfo as admin.ServiceAccount),
});

export const fsadmin = admin.firestore;

// // Start writing Firebase Functions
// // https://firebase.google.com/docs/functions/typescript
//
// export const helloWorld = functions.https.onRequest((request, response) => {
//   functions.logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });

const app = express();
app.use(cors({ origin: true }));
app.use(cookieParser());

/**
 * Flow1-2: Create new session
 */
app.post("/sessionLogin", (req, res) => {
  // Get the ID token passed and the CSRF token.
  const idToken = req.body.idToken.toString(); // Can get from user.getIdToken() in firebase.auth.clientSDK
  console.log("idToken: ", idToken);
  // const csrfToken = req.body.csrfToken.toString();

  // Guard against CSRF attacks. !! Commented out temporarily, cause it's just testing
  // if (csrfToken !== req.cookies.csrfToken) {
  //   res.status(401).send("UNAUTHORIZED REQUEST!");
  //   return;
  // }

  fbadmin
    .auth()
    .verifyIdToken(idToken)
    .then((r) => console.log(r));

  const expiresIn = 60 * 60 * 24 * 5 * 1000; // Set session expiration to 5 days.

  /**
   * Create the session cookie. This will also verify the ID token in the process.
   * The session cookie will have the same claims as the ID token.
   * To only allow session cookie setting on recent sign-in, auth_time in ID token
   * can be checked to ensure user was recently signed in before creating a session cookie.
   */
  fbadmin
    .auth()
    .createSessionCookie(idToken, { expiresIn })
    .then(
      (sessionCookie) => {
        console.log("Created session cookie: ", sessionCookie);
        // Set cookie policy for session cookie.
        const options = {
          maxAge: expiresIn,
          httpOnly: true,
          // secure: true
        };
        res.setHeader("Cache-Control", "private");
        // res.cookie("__session", sessionCookie, options);
        res.setHeader(
          "Set-Cookie",
          cookie.serialize("__session", sessionCookie, options)
        );
        res.end(
          JSON.stringify({
            status: "success",
            cookieValue: sessionCookie,
            maxAge: expiresIn,
            httpOnly: true,
            secure: true,
          })
        );
        // const responseBody = {
        //   status: "success",
        //   cookieValue: sessionCookie,
        //   maxAge: expiresIn,
        //   httpOnly: true,
        //   secure: true,
        // };
        // res.status(200).send(responseBody);
        // console.log("send request:", responseBody);
      },
      (error) => {
        console.log("\nE_SESSION_CREATION");
        console.log(error);
        res.status(401).send({
          status: "error",
          msg: "UNAUTHORIZED REQUEST!",
        });
      }
    );
});

/**
 * Flow1-1: Check session status
 * Flow2: Get Custom Token for AuthN
 */
app.post("/verifySession", (req, res) => {
  // セッションCookieを確認して権限チェック
  // Whenever a user is accessing restricted content that requires authentication.
  // const sessionCookie = req?.cookies?.session || "";
  // console.log("Cookies: ", JSON.stringify(req.cookies));
  // console.log("sessionCoockie: ", sessionCookie);
  // Verify the session cookie. In this case an additional check is added to detect
  // if the user's Firebase session was revoked, user deleted/disabled, etc.

  const sessionCookie = req.body.sessionCookie.toString();

  fbadmin
    .auth()
    .verifySessionCookie(sessionCookie, true /** checkRevoked */)
    .then((decodedClaims) => {
      // serveContentForUser("/profile", req, res, decodedClaims);
      //
      console.log(
        "Succeeded to verify sessionCoockie. Now creating custom token for AuthN"
      );
      console.log("User uid is ", decodedClaims.uid);

      fbadmin
        .auth()
        .createCustomToken(decodedClaims.uid)
        .then((customToken) => {
          console.log("Succeeded to create custom token:", customToken);
          // Send token back to client
          res.status(200).send({
            status: "success",
            customToken: customToken,
          });
        })
        .catch((error) => {
          console.log("Error creating custom token:", error);
          res.status(200).send({
            status: "error",
            customToken: "",
          });
        });
    })
    .catch((error) => {
      console.log("\nE_SESSION_VERIFICATION");
      console.log(error);
      // Session cookie is unavailable or invalid. Force user to login.
      res.status(401).send({
        status: "error",
        msg: "Unauthenticated. Please sign in first.",
      });
    });
});

export const authtest = functions.https.onRequest(app);
