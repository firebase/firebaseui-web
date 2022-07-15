import React from 'react'

const styles = {
  container: {
    width: '100vw',
    height: '100vh',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
}

const FullPageLoader = () => (
  <div style={styles.container}>
    <h3>Loading...</h3>
  </div>
)

export default FullPageLoader
