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
  }

  /**
   * Log in the user blabla
   *
   * @param {object} req - Express request object.
   * @param {object} res - Express response object.
   * @param {Function} next - Express next middleware function.
   */
  login(req, res, next) {
    if (req.session.authStateToken === undefined) {
      req.session.authStateToken = randomBytes(60).toString('base64')
    }
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
    const uri = `https://gitlab.lnu.se/oauth/token?client_id=${process.env.GITLAB_APP_ID}&client_secret=${process.env.GITLAB_APP_SECRET}&code=${req.query.code}&grant_type=authorization_code&redirect_uri=${process.env.GITLAB_REDIRECT_URI}`

    const response = await fetch(uri, {
      method: 'POST'
    })
    const data = await response.json()

    if (!response.ok) {
      const error = new Error('Something went wrong during authentication')
      error.status = 500
      next(error)
      return
    }
    req.session.regenerate(function (err) {
      if (err) console.log(err)
    })
    req.session.authData = data

    res.redirect(process.env.APP_START_URI)
  }
}
