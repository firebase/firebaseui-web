/* globals window */
import React, { useEffect, useState } from 'react'
import StyledFirebaseAuth from 'react-firebaseui/StyledFirebaseAuth'
// firebase v9
import 'firebase/auth'
import { getAuth } from 'firebase/auth';
import { GoogleAuthProvider , EmailAuthProvider } from 'firebase/auth';
// let auth  (close this you don't need)
// if(getApps().length === 0){
//   console.log("0")
// }
// else{
  // const app = getApp()
  // const authFun = initializeAuth(app) 
   
  // console.log("2" , auth)
  // const authFun = getAuth()
  // const auth = getAuth
  // console.log("1" , authFun)
  // console.log("2" , auth)

  // const app = getApp()
  // const apps = getApps()
  // console.log("1" , app.options)
  // console.log("2" , apps)
// }
// Note that next-firebase-auth inits Firebase for us,
// so we don't need to.
// Auth providers
// https://github.com/firebase/firebaseui-web#configure-oauth-providers

const firebaseAuthConfig = {
  signInFlow: 'popup',
  signInOptions: [
    {
      provider: EmailAuthProvider.PROVIDER_ID,  //  Firebase v9
      requireDisplayName: false,
    },
    
     { provider: GoogleAuthProvider.PROVIDER_ID, //  Firebase v9
    },
  ],
  signInSuccessUrl: '/',
  credentialHelper: 'none',
  callbacks: {
    signInSuccessWithAuthResult: () =>
      false,
  },
}

const FirebaseAuth = () => {

  const [renderAuth, setRenderAuth] = useState(false)

  // const auth = getAuth()

  // console.log("1" , auth)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setRenderAuth(true)
      console.log('CLIENT')
    }
    
  }, [])

  return (
    <div>

      {renderAuth ?
        (<>
          <StyledFirebaseAuth
            uiConfig={firebaseAuthConfig}
            firebaseAuth={getAuth()}  //  Firebase v9
          />
          <p>True StyledFirebaseAuth for ui config</p>
        </>
        )
        :
        null}

    </div>
  )
}

export default FirebaseAuth