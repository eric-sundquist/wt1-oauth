/**
 * The routes.
 *
 * @author Mats Loock
 * @author Eric Sundqvist
 * @version 1.0.0
 */

import express from 'express'
import { router as homeRouter } from './home-router.js'
import { router as UserRouter } from './user-router.js'
import { router as accountRouter } from './account-router.js'

export const router = express.Router()

router.use('/', homeRouter)
router.use('/account', accountRouter)
router.use('/user', UserRouter)

router.use('*', (req, res, next) => {
  const error = new Error('Not Found')
  error.status = 404
  next(error)
})
