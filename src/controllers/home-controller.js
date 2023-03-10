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
   * Redirect user to gitlab Oauth authorization page.
   *
   * @param {object} req - Express request object.
   * @param {object} res - Express response object.
   * @param {Function} next - Express next middleware function.
   */
  login(req, res, next) {
    if (req.session.authStateToken === undefined) {
      req.session.authStateToken = randomBytes(60).toString('base64')
    }

    const url = `https://gitlab.lnu.se/oauth/authorize?client_id=${process.env.GITLAB_APP_ID}&redirect_uri=${process.env.GITLAB_REDIRECT_URI}&response_type=code&state=${req.session.authStateToken}&scope=${process.env.GITLAB_SCOPE}`

    res.redirect(url)
  }

  /**
   * Gitlab oauth flow to recieve access token.
   *
   * @param {object} req - Express request object.
   * @param {object} res - Express response object.
   * @param {Function} next - Express next middleware function.
   */
  async authGitlabGetAccessToken(req, res, next) {
    // Verify that recieved state token is the same as sent
    if (req.session.authStateToken !== req.query.state) {
      const error = new Error('Something went wrong during authentication')
      error.status = 500
      next(error)
      return
    }

    const url = `https://gitlab.lnu.se/oauth/token?client_id=${process.env.GITLAB_APP_ID}&client_secret=${process.env.GITLAB_APP_SECRET}&code=${req.query.code}&grant_type=authorization_code&redirect_uri=${process.env.GITLAB_REDIRECT_URI}`

    const response = await fetch(url, {
      method: 'POST'
    })

    const data = await response.json()

    if (!response.ok) {
      const error = new Error('Something went wrong during authentication')
      error.status = 500
      next(error)
      return
    }

    await req.session.regenerate((err) => {
      if (err) return next(err)

      req.session.authData = data

      // Making sure session is saved before redirect
      req.session.save(function (err) {
        if (err) return next(err)

        res.redirect('/')
      })
    })
  }
}
