import React from 'react'
import {
  useAuthUser,
  withAuthUser,
  withAuthUserTokenSSR,
} from 'next-firebase-auth'
import Header from '../components/Header'
import DemoPageLinks from '../components/DemoPageLinks'

const styles = {
  content: {
    padding: 32,
  },
  infoTextContainer: {
    marginBottom: 32,
  },
}

const Demo = () => {

  const AuthUser = useAuthUser()

  if(AuthUser){
    // console.log(AuthUser.email)
  }

  return (
    <div>

      <Header email={AuthUser.email} signout={AuthUser.signOut} />

      <div style={styles.content}>
        <div style={styles.infoTextContainer}>
          <h3><a target="_blank" href="https://github.com/gladly-team/next-firebase-auth">Docs - next-firebase-auth</a></h3>
          <h3><a target="_blank" href="https://github.com/firebase/firebaseui-web/blob/master/README.md">Docs - firebaseui-web</a></h3>
          <p>
            {/* This page does not require authentication, so it won't redirect to
            the login page if you are not signed in. */}
            {/* No need Auth , So You don't need to login */}
            
          </p>
          <ul>
            <li>Nextjs</li>
            <li>Firebase</li>
            <li>firebaseui</li>
            <li>next-firebase-auth (store in cookies)</li>
          </ul>
          <p>
            If you remove `getServerSideProps` from  page, it will be static
            and load authed user only on client side.
          </p>
        </div>
        <DemoPageLinks />
      </div>
    </div>
  )
}

  export const getServerSideProps = withAuthUserTokenSSR()()

  export default withAuthUser()(Demo)
