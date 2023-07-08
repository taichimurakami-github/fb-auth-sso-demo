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

app.post("/createSessionToken", (req, res) => {
  // Get the ID token passed and the CSRF token.
  const idToken = req.body.idToken.toString(); // Can get from user.getIdToken() in firebase.auth.clientSDK
  console.log("Starting to session-cookie creation");
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
      (sessionToken) => {
        console.log("Created session cookie: ", sessionToken);
        // Set cookie policy for session cookie.
        const options = {
          maxAge: expiresIn,
          httpOnly: true,
          // secure: true
        };
        res.setHeader("Cache-Control", "private");
        // res.cookie("__session", sessionToken, options);
        res.setHeader(
          "Set-Cookie",
          cookie.serialize("__session", sessionToken, options)
        );
        res.end(
          JSON.stringify({
            status: "success",
            cookieValue: sessionToken,
            sessionCoockie: sessionToken,
            maxAge: expiresIn,
            httpOnly: true,
            secure: true,
          })
        );
        // const responseBody = {
        //   status: "success",
        //   cookieValue: sessionToken,
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
app.post("/verifySessionToken", (req, res) => {
  const sessionToken = req.body.sessionToken.toString();

  try {
    fbadmin
      .auth()
      .verifySessionCookie(sessionToken, true /** checkRevoked */)
      .then((decodedClaims) => {
        // serveContentForUser("/profile", req, res, decodedClaims);
        //
        console.log(
          "Succeeded to verify sessionCoockie. Now creating custom token for AuthN"
        );
        console.log("User uid is ", decodedClaims.uid);
        res.status(200).send({
          status: "success",
          sessionToken: sessionToken,
          uid: decodedClaims.uid,
          claims: decodedClaims,
        });
      });
  } catch (error) {
    console.log("\nE_SESSION_VERIFICATION");
    console.log(error);
    // Session cookie is unavailable or invalid. Force user to login.
    res.status(401).send({
      status: "error",
      msg: "Unauthenticated. Please sign in first.",
    });
  }
});

app.post("/createCustomToken", (req, res) => {
  const uid = req.body.uid.toString();

  try {
    fbadmin
      .auth()
      .createCustomToken(uid)
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
  } catch (error) {
    console.log("\nE_SESSION_VERIFICATION");
    console.log(error);
    // Session cookie is unavailable or invalid. Force user to login.
    res.status(401).send({
      status: "error",
      msg: "Unauthenticated. Please sign in first.",
    });
  }
});

export const authtest = functions.https.onRequest(app);
