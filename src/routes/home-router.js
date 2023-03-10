/**
 * Home routes.
 *
 * @author Eric Sundqvist
 * @version 1.0.0
 */

import express from 'express'
import { HomeController } from '../controllers/home-controller.js'

export const router = express.Router()

const controller = new HomeController()

router.get('/', (req, res, next) => controller.index(req, res, next))
//TODO Ta bort???
// router.get('/login', (req, res, next) => controller.login(req, res, next))
// router.get('/auth/gitlab', (req, res, next) => controller.authGitlabGetAccessToken(req, res, next))
// router.get('/auth/redirect', (req, res, next) => controller.redirect(req, res, next))
// router.get('/logout', (req, res, next) => controller.logout(req, res, next))
