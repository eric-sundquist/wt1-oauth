/**
 * Login routes.
 *
 * @author Eric Sundqvist
 * @version 1.0.0
 */

import express from 'express'
import { AccountController } from '../controllers/account-controller.js'

export const router = express.Router()

const controller = new AccountController()

router.get('/login', (req, res, next) => controller.login(req, res, next))
router.get('/auth/gitlab', (req, res, next) => controller.authGitlabGetAccessToken(req, res, next))
router.post('/logout', controller.authLoggedIn, (req, res, next) => controller.logout(req, res, next))
