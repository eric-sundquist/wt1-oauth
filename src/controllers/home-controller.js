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
    console.log(req)
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
    if (req.session.csrfToken === undefined) {
      req.session.csrfToken = randomBytes(100).toString('base64')
    }
    console.log(req.session)

    res.redirect(
      `https://gitlab.lnu.se/oauth/authorize?client_id=${process.env.GITLAB_APP_ID}&redirect_uri=${process.env.GITLAB_REDIRECT_URI}&response_type=code&state=${req.session.csrfToken}&scope=${process.env.GITLAB_SCOPE}`
    )
  }
}
