import React from 'react'
import Link from 'next/link'
import { useEffect } from 'react'

const nfaDependencyVersion =
  require('../package.json').dependencies['next-firebase-auth']
const nextDependencyVersion = require('../package.json').dependencies.next
const firebaseDependencyVersion =
  require('../package.json').dependencies.firebase

const styles = {
  container: {
    display: 'flex',
    justifyContent: 'flex-end',
    alignItems: 'center',
    padding: 16,
  },
  versionsContainer: {
    marginLeft: 0,
    marginRight: 'auto',
  },
  button: {
    marginLeft: 16,
    cursor: 'pointer',
  },
}

const Header = ({email,signout}) => (
  
  // useEffect(() => {
  //   console.log("client stuff")
  // }, []);


  <div style={styles.container}>
    <div style={styles.versionsContainer}>
      <div>v{nfaDependencyVersion}</div>
      <div>Next.js v{nextDependencyVersion}</div>
      <div>Firebase v{firebaseDependencyVersion}</div>
    </div>
{/* {console.log(`${email} pppppppppp`)

} */}
    {email ? (
      <>
        <p>Signed in as {email}</p>
        <button
          type="button"
          onClick={() => {
            signout()
          }}
          style={styles.button}
        >
          Sign out
        </button>
      </>
    ) : (
      <>
        <p>You are not signed in.</p>
        <Link href="/auth">
          <a>
            <button type="button" style={styles.button}>
              Sign in
            </button>
          </a>
        </Link>
      </>
    )}
  </div>
)

export default Header


Header.getServerSideProps = async () => {
  console.log("server stuff")
}
