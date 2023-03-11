/**
 * User routes.
 *
 * @author Eric Sundqvist
 * @version 1.0.0
 */

import express from 'express'
import { UserController } from '../controllers/user-controller.js'
import { AccountController } from '../controllers/account-controller.js'

export const router = express.Router()

const controller = new UserController()
const accountController = new AccountController()

router.get('/profile', accountController.authLoggedIn, (req, res, next) => controller.showProfile(req, res, next))

router.get('/activities', accountController.authLoggedIn, (req, res, next) => controller.showActivities(req, res, next))

router.get('/group-projects', accountController.authLoggedIn, (req, res, next) =>
  controller.showGroupProjects(req, res, next)
)
