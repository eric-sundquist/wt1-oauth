/**
 * Snippets routes.
 *
 * @author Mats Loock
 * @author Eric Sundqvist
 * @version 1.0.0
 */

import express from 'express'
import { SnippetsController } from '../controllers/snippets-controller.js'

export const router = express.Router()

const controller = new SnippetsController()

// Map HTTP verbs and route paths to controller action methods.

router.get('/', (req, res, next) => controller.index(req, res, next))

router.get('/create', controller.authLoggedIn, (req, res, next) => controller.create(req, res, next))
router.post('/create', controller.authLoggedIn, (req, res, next) => controller.createPost(req, res, next))

router.get('/:id/update', controller.authLoggedIn, controller.authOwner, (req, res, next) => controller.update(req, res, next))
router.post('/:id/update', controller.authLoggedIn, controller.authOwner, (req, res, next) => controller.updatePost(req, res, next))

router.get('/:id/delete', controller.authLoggedIn, controller.authOwner, (req, res, next) => controller.delete(req, res, next))
router.post('/:id/delete', controller.authLoggedIn, controller.authOwner, (req, res, next) => controller.deletePost(req, res, next))

router.get('/:id/show', (req, res, next) => controller.show(req, res, next))
