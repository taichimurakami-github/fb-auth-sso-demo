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

firebase admin SDK において，エラーが発生したためその解決策を考えてください．
以下に詳細を示します：

# やりたいこと

異なるドメインでホスティングされた 2 つの web アプリケーション（app01, app02）の間で，ユーザの認証状態を共有したい（Single Sign On の実装）

# 実装詳細

- ユーザの認証には Firebase Auth を用いる
- app01, app02 とは独立して，ログイン認証用のページ及び Firebase project を 1 つ用意
- app から自動でログインページに遷移し，ローカルに保存されている sessionToken の状態を確認する
- 保存されている sessionToken があれば，その有効性を firebase admin SDK にて検証する
- 保存されている sessionToken がなければ，firebase auth の signInWithEmailAndPassword() を用いて userCredential を取得し，その中の getIdToken() の返り値を新たな sessionToken() として検証する．
- app ページに sessionToken を伴ってリダイレクトする
- app ページより，sessionToken を伴って自作のサーバにアクセスし， firebase admin SDK でログイン用の customToken を作成する
- 作成した customToken を用いて，ログイン認証を行う

# 動作確認

以下の項目は既に動作確認済み．

- sessionToken の作成
- 異なる app 間における sessionToken の共有
- customToken の作成
- 作成した customToken を用いて signInWithCustomToken()を実行

# エラー内容

```
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
```

# 補足

あくまで sessionToken を作成しているのは，app に関わらず独立して用意されたログインページ上であり，
動作確認の時点で，一度作成した sessionToken を他のページでも使いまわせることを確認しているため，
incorrect iss のエラーが出るのは不自然に思える．
