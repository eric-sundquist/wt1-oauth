/**
 * The routes.
 *
 * @author Mats Loock
 * @author Eric Sundqvist
 * @version 1.0.0
 */

import express from 'express'
import { router as homeRouter } from './home-router.js'
import { router as snippetsRouter } from './snippets-router.js'

export const router = express.Router()

router.use('/', homeRouter)
router.use('/snippets', snippetsRouter)

router.use('*', (req, res, next) => {
  const error = new Error('Not Found')
  error.status = 404
  next(error)
})
