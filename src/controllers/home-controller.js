/**
 * Home controller.
 *
 * @author Eric Sundqvist
 * @version 1.0.0
 */

import { randomBytes } from 'crypto'

/**
 * Encapsulates a controller.
 */
export class HomeController {
  /**
   * Renders a view and sends the rendered HTML string as an HTTP response.
   * index GET.
   *
   * @param {object} req - Express request object.
   * @param {object} res - Express response object.
   * @param {Function} next - Express next middleware function.
   */
  index(req, res, next) {
    res.render('home/index')
    console.log('--Rendering index--')
  }

  /**
   * Log in the user blabla
   *
   * @param {object} req - Express request object.
   * @param {object} res - Express response object.
   * @param {Function} next - Express next middleware function.
   */
  login(req, res, next) {
    // `https://gitlab.lnu.se/oauth/authorize?client_id=APP_ID&redirect_uri=REDIRECT_URI&response_type=code&state=STATE&scope=REQUESTED_SCOPES`

    // generate one-time use CSRF token and store it in session
    if (req.session.authStateToken === undefined) {
      req.session.authStateToken = randomBytes(60).toString('base64')
    }

    // const params = new URLSearchParams({
    //   client_id: process.env.GITLAB_APP_ID,
    //   redirect_uri: process.env.GITLAB_REDIRECT_URI,
    //   response_type: 'code',
    //   state: req.session.authStateToken,
    //   scope: process.env.GITLAB_SCOPE
    // })

    const redirectUrl = `https://gitlab.lnu.se/oauth/authorize?client_id=${process.env.GITLAB_APP_ID}&redirect_uri=${process.env.GITLAB_REDIRECT_URI}&response_type=code&state=${req.session.authStateToken}&scope=${process.env.GITLAB_SCOPE}`

    res.redirect(redirectUrl)
  }

  /**
   * Log in the user blabla
   *
   * @param {object} req - Express request object.
   * @param {object} res - Express response object.
   * @param {Function} next - Express next middleware function.
   */
  async authGitlabRedirect(req, res, next) {
    // Ska man kolla så state stämmer???
    // req.query.state
    console.log('CODE:')
    console.log(req.query.code)

    // post to server for access token
    // const params = new URLSearchParams({
    //   client_id: process.env.GITLAB_APP_ID,
    //   client_secret: process.env.GITLAB_APP_SECRET,
    //   code: req.query.code,
    //   grant_type: 'authorization_code',
    //   redirect_uri: process.env.APP_START_REDIRECT
    // })

    const uri = `https://gitlab.lnu.se/oauth/token?client_id=${process.env.GITLAB_APP_ID}&client_secret=${process.env.GITLAB_APP_SECRET}&code=${req.query.code}&grant_type=authorization_code&redirect_uri=${process.env.GITLAB_REDIRECT_URI}`
    console.log(uri)

    const response = await fetch(uri, {
      method: 'POST'
    })

    const data = await response.json()
    console.log('fetch response')
    console.log(response.status)
    console.log(response.statusText)
    console.log(data)

    // regenerate session
    req.session.regenerate()
    req.session.authData = data

    res.redirect(process.env.APP_START_URI)
  }
}
