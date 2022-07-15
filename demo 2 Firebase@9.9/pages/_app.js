import React from 'react'
import '../styles/globals.css'
import initAuth from '../utils/initAuth'

initAuth()
console.log('hey')

const MyApp = ({ Component, pageProps }) => (
  // eslint-disable-next-line react/jsx-props-no-spreading
  <Component {...pageProps} />
)

export default MyApp
