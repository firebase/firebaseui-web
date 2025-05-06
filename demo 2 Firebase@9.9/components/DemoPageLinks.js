import React from 'react'
import Link from 'next/link'

const styles = {
  content: {
    padding: '4px 32px 32px 32px',
    background: '#eeeeee',
    display: 'inline-block',
  },
  linkAnchor: {
    color: 'teal',
    display: 'block',
    lineHeight: '160%',
  },
  // &:active {
    
  // }
  
  // a:active : {
  //   color: '#eeeeee',
  // }
}

const DemoPageLinks = () => (
  <div style={styles.content}>
    <h4>Examples</h4>
    <div>
      <Link href="/">
        <a style={styles.linkAnchor}>Home</a>
        {/* <a style={styles.linkAnchor}>Home: SSR, no auth required</a> */}
      </Link>
      <Link href="/ssr-auth-required">
        <a style={styles.linkAnchor}>
          Click to Fetch data with ssr with ID token
          {/* Example: SSR + data fetching with ID token */}
        </a>
      </Link>
      {/* <Link href="/ssr-no-token">
        <a style={styles.linkAnchor}>Example: SSR + no ID token</a>
      </Link> */}
      {/* <Link href="/static-auth-required-loader">
        <a style={styles.linkAnchor}>
          Example: static + loader + data fetching with ID token
        </a>
      </Link> */}
      {/* <Link href="/auth">
        <a style={styles.linkAnchor}>Login page: static</a>
      </Link>
      <Link href="/auth-ssr">
        <a style={styles.linkAnchor}>Login page: server-rendered</a>
      </Link> */}
    </div>
  </div>
)

DemoPageLinks.displayName = 'DemoPageLinks'

export default DemoPageLinks
