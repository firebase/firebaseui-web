import { unsetAuthCookies } from 'next-firebase-auth'
import initAuth from '../../utils/initAuth'

initAuth()
// logout remove cookie
const handler = async (req, res) => {
  try {
    await unsetAuthCookies(req, res)
    console.info("removed cookies (logout)")
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error(e)
    return res.status(500).json({ error: 'Unexpected error.' })
  }
  return res.status(200).json({ status: true })
}

export default handler
