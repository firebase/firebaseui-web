import { getCustomIdAndRefreshTokens } from 'src/firebaseAdmin'
import { setCookie } from 'src/cookies'
import {
    getAuthUserCookieName,
    getAuthUserTokensCookieName,
} from 'src/authCookies'

import { getConfig } from 'src/config'

export default async function setAuthCookies(req, res) {
    if (!(req.headers && req.headers.authorization)) {
        throw new Error('The request is missing an Authorization header value')
    }

    // This should be the original Firebase ID token from
    // the Firebase JS SDK.
    const token = req.headers.authorization

    // Get a custom ID token and refresh token, given a valid
    // Firebase ID token.
    const { idToken, refreshToken, AuthUser } = await getCustomIdAndRefreshTokens(token)

    // Pick a subset of the config.cookies options to
    // pass to setCookie.
    const cookieOptions = (({
        domain,
        httpOnly,
        keys,
        maxAge,
        overwrite,
        path,
        sameSite,
        secure,
        signed,
    }) => ({
        domain,
        httpOnly,
        keys,
        maxAge,
        overwrite,
        path,
        sameSite,
        secure,
        signed,
    }))(getConfig().cookies)

    // Store  ID and  tokens  in a cookie. This
    // cookie will available to future requests to pages,
    // providing valid Firebase ID token (refreshed as needed)
    // for SSR.
    setCookie(
        getAuthUserTokensCookieName(),
        // Note: any change to cookie data structure needs to be
        // backwards-compatible.
        JSON.stringify({
            idToken,
            refreshToken,
        }),
        { req, res },
        cookieOptions
    )

    // Store the AuthUser data. This cookie will be available
    // to future requests to pages, providing the user data. It
    // will *not* include a Firebase ID token, because it may have
    // expired, but provides the AuthUser data without any
    // additional server-side requests.
    setCookie(
        getAuthUserCookieName(),
        // Note: any change to cookie data structure needs to be
        // backwards-compatible.
        // Don't include the token in the "AuthUser" cookie, because
        // the token should only be used from the "AuthUserTokens"
        // cookie. Here, it is redundant information, and we don't
        // want the token to be used if it's expired.
        AuthUser.serialize({ includeToken: false }),
        {
            req,
            res,
        },
        cookieOptions
    )

    return {
        idToken,
        refreshToken,
        AuthUser,
    }
}

