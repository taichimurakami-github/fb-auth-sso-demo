> FirebaseAuthError: Firebase ID token has incorrect "iss" (issuer) claim. Expected "https://securetoken.google.com/fb-auth-sso-test" but got "https://session.firebase.google.com/fb-auth-sso-test". Make sure the ID token comes from the same Firebase project as the service account used to authenticate this SDK. See https://firebase.google.com/docs/auth/admin/verify-id-tokens for details on how to retrieve an ID token.
> at FirebaseAuthError.FirebaseError [as constructor] (/Users/tchi/Dev_private/fb-auth-sso-demo/functions/node_modules/.pnpm/firebase-admin@10.3.0/node_modules/firebase-admin/lib/utils/error.js:44:28)
> at FirebaseAuthError.PrefixedFirebaseError [as constructor] (/Users/tchi/Dev_private/fb-auth-sso-demo/functions/node_modules/.pnpm/firebase-admin@10.3.0/node_modules/firebase-admin/lib/utils/error.js:90:28)
> at new FirebaseAuthError (/Users/tchi/Dev_private/fb-auth-sso-demo/functions/node_modules/.pnpm/firebase-admin@10.3.0/node_modules/firebase-admin/lib/utils/error.js:149:16)
> at FirebaseTokenVerifier.verifyContent (/Users/tchi/Dev_private/fb-auth-sso-demo/functions/node_modules/.pnpm/firebase-admin@10.3.0/node_modules/firebase-admin/lib/auth/token-verifier.js:245:19)
> at /Users/tchi/Dev_private/fb-auth-sso-demo/functions/node_modules/.pnpm/firebase-admin@10.3.0/node_modules/firebase-admin/lib/auth/token-verifier.js:165:19
> at processTicksAndRejections (node:internal/process/task_queues:96:5) {
> errorInfo: {
> code: 'auth/argument-error',
> message: 'Firebase ID token has incorrect "iss" (issuer) claim. Expected "https://securetoken.google.com/fb-auth-sso-test" but got "https://session.firebase.google.com/fb-auth-sso-test". Make sure the ID token comes from the same Firebase project as the service account used to authenticate this SDK. See https://firebase.google.com/docs/auth/admin/verify-id-tokens for details on how to retrieve an ID token.'
> },
> codePrefix: 'auth'
> }
> /Users/tchi/Dev_private/fb-auth-sso-demo/functions/node_modules/.pnpm/firebase-admin@10.3.0/node_modules/firebase-admin/lib/utils/error.js:44
> var \_this = \_super.call(this, errorInfo.message) || this;
> ^

> FirebaseAuthError: Firebase ID token has incorrect "iss" (issuer) claim. Expected "https://securetoken.google.com/fb-auth-sso-test" but got "https://session.firebase.google.com/fb-auth-sso-test". Make sure the ID token comes from the same Firebase project as the service account used to authenticate this SDK. See https://firebase.google.com/docs/auth/admin/verify-id-tokens for details on how to retrieve an ID token.
> at FirebaseAuthError.FirebaseError [as constructor] (/Users/tchi/Dev_private/fb-auth-sso-demo/functions/node_modules/.pnpm/firebase-admin@10.3.0/node_modules/firebase-admin/lib/utils/error.js:44:28)
> at FirebaseAuthError.PrefixedFirebaseError [as constructor] (/Users/tchi/Dev_private/fb-auth-sso-demo/functions/node_modules/.pnpm/firebase-admin@10.3.0/node_modules/firebase-admin/lib/utils/error.js:90:28)
> at new FirebaseAuthError (/Users/tchi/Dev_private/fb-auth-sso-demo/functions/node_modules/.pnpm/firebase-admin@10.3.0/node_modules/firebase-admin/lib/utils/error.js:149:16)
> at FirebaseTokenVerifier.verifyContent (/Users/tchi/Dev_private/fb-auth-sso-demo/functions/node_modules/.pnpm/firebase-admin@10.3.0/node_modules/firebase-admin/lib/auth/token-verifier.js:245:19)
> at /Users/tchi/Dev_private/fb-auth-sso-demo/functions/node_modules/.pnpm/firebase-admin@10.3.0/node_modules/firebase-admin/lib/auth/token-verifier.js:165:19
> at processTicksAndRejections (node:internal/process/task_queues:96:5) {
> errorInfo: {
> code: 'auth/argument-error',
> message: 'Firebase ID token has incorrect "iss" (issuer) claim. Expected "https://securetoken.google.com/fb-auth-sso-test" but got "https://session.firebase.google.com/fb-auth-sso-test". Make sure the ID token comes from the same Firebase project as the service account used to authenticate this SDK. See https://firebase.google.com/docs/auth/admin/verify-id-tokens for details on how to retrieve an ID token.'
> },
> codePrefix: 'auth'
> }

FirebaseAuthError: Firebase ID token has incorrect "iss" (issuer) claim.

Expected "https://securetoken.google.com/fb-auth-sso-test" but got "https://session.firebase.google.com/fb-auth-sso-test".

Make sure the ID token comes from the same Firebase project as the service account used to authenticate this SDK. See https://firebase.google.com/docs/auth/admin/verify-id-tokens for details on how to retrieve an ID token.

## Flows

```mermaid
sequenceDiagram
  participant a1 as App01
  participant a2 as App02
  participant tp as TokenProvider
  participant sv as Server

  note over a1: ユーザによるログイン操作
  a1 ->> tp: redirect
  note over tp: sessionCookie(sc)が保存されているか確認
  tp ->> sv: post /validateSessionCoockie
  note over sv: scの有効性を確認
  sv ->> tp: sessionCookie validation result
  alt sessionCookie is valid
    tp ->> a1: sessionCookie
  else sessionCookie is invalid
    note over tp: signOut()
    note over tp: ログインフォームを表示
    note over tp: signInWithEmailAndPassword()
    note over tp: userCred.getIdToken()
    tp ->> sv: post /createSessionCookie
    sv ->> tp: new sessionCookie
    note over tp: sessionCookieをローカルに保存
    tp ->> a1: sessionCookie
  end

  a1 ->> sv: post /createCustomToken
  note over sv: custom token作成
  sv ->> a1: customToken

  note over a1: signInWithCustomToken()
  note over a1: ログイン完了

  note over a2: ユーザによるログイン操作
  a2 ->> tp: redirect
  note over tp: sessionCookie(sc)が保存されているか確認
  tp ->> sv: post /validateSessionCoockie
  note over sv: scの有効性を確認
  note over sv: 先程ログイン時に確かめたのでvalidなはず
  sv ->> tp: sessionCookie validation result
  tp ->> a2: sessionCookie
  a2 ->> sv: post /createCustomToken
  note over sv: custom token作成
  sv ->> a2: customToken

```
