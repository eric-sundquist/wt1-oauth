/**
 * Account controller.
 *
 * @author Eric Sundqvist
 * @version 1.0.0
 */

import { User } from '../models/user.js'

/**
 * Encapsulates a controller.
 */
export class AccountController {
  /**
   * Renders a view and sends the rendered HTML string as an HTTP response.
   * login GET.
   *
   * @param {object} req - Express request object.
   * @param {object} res - Express response object.
   * @param {Function} next - Express next middleware function.
   */
  login (req, res, next) {
    res.render('account/login')
  }

  /**
   * Login post request.
   *
   * @param {object} req - Express request object.
   * @param {object} res - Express response object.
   * @param {Function} next - Express next middleware function.
   */
  async loginPost (req, res, next) {
    try {
      const user = await User.authenticate(req.body.username, req.body.password)

      req.session.regenerate((err) => {
        if (err) {
          throw new Error('Failed to re-generate session.')
        }
        req.session.username = user.username
        req.session.flash = { type: 'success', text: 'You have been logged in.' }

        // Redirect.
        res.redirect('../snippets')
      })
    } catch (error) {
      req.session.flash = { type: 'danger', text: error.message }
      res.redirect('../account/login')
    }
  }

  /**
   * Renders a view and sends the rendered HTML string as an HTTP response.
   * register GET.
   *
   * @param {object} req - Express request object.
   * @param {object} res - Express response object.
   * @param {Function} next - Express next middleware function.
   */
  register (req, res, next) {
    res.render('account/register')
  }

  /**
   * Register post request.
   *
   * @param {object} req - Express request object.
   * @param {object} res - Express response object.
   * @param {Function} next - Express next middleware function.
   */
  async registerPost (req, res, next) {
    try {
      const user = new User({
        username: req.body.username,
        password: req.body.password
      })

      await user.save()

      req.session.flash = { type: 'success', text: 'The user was created successfully.' }
      res.redirect('./login')
    } catch (error) {
      req.session.flash = { type: 'danger', text: error.message }
      res.redirect('./register')
    }
  }

  /**
   * Deletes the specified snippet.
   *
   * @param {object} req - Express request object.
   * @param {object} res - Express response object.
   */
  async logoutPost (req, res) {
    try {
      req.session.destroy()
      res.redirect('..')
    } catch (error) {
      // Redirect to the login form and display an error message. ...
      req.session.flash = { type: 'danger', text: error.message }
      res.redirect('..')
    }
  }

  /**
   * Checks if user is logged in..
   *
   * @param {object} req - Express request object.
   * @param {object} res - Express response object.
   * @param {Function} next - Express next middleware function.
   */
  authLoggedIn (req, res, next) {
    if (!req.session.username) {
      const error = new Error('Not Found')
      error.status = 404
      next(error)
      return
    }
    next()
  }
}
