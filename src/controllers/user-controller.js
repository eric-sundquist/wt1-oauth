/**
 * Module for the SnippetsController.
 *
 * @author Eric Sundqvist
 * @version 1.0.0
 */

/**
 * Encapsulates a controller.
 */
export class UserController {
  /**
   * Displays user profile.
   *
   * @param {object} req - Express request object.
   * @param {object} res - Express response object.
   * @param {Function} next - Express next middleware function.
   */
  async showProfile(req, res, next) {
    try {
      // fetch user information
      const viewData = {}

      res.render('user/profile', { viewData })
    } catch (error) {
      next(error)
    }
  }

  /**
   * Displays activities.
   *
   * @param {object} req - Express request object.
   * @param {object} res - Express response object.
   * @param {Function} next - Express next middleware function.
   */
  async showActivities(req, res, next) {
    try {
      // fetch user information
      const viewData = {}

      res.render('user/activities', { viewData })
    } catch (error) {
      next(error)
    }
  }

  /**
   * Displays group-projects.
   *
   * @param {object} req - Express request object.
   * @param {object} res - Express response object.
   * @param {Function} next - Express next middleware function.
   */
  async showGroupProjects(req, res, next) {
    try {
      // fetch user information
      const viewData = {}

      res.render('user/group-projects', { viewData })
    } catch (error) {
      next(error)
    }
  }

  // ------------------------------------------------------------------------------------------
  //---------------------------------------------------------------------------------

  /**
   * Displays snippet list.
   *
   * @param {object} req - Express request object.
   * @param {object} res - Express response object.
   * @param {Function} next - Express next middleware function.
   */
  async index(req, res, next) {
    try {
      const viewData = {
        snippets: (await Snippet.find()).map((snippet) => snippet.toObject())
      }

      res.render('snippets/index', { viewData })
    } catch (error) {
      next(error)
    }
  }

  /**
   * Displays a snippet.
   *
   * @param {object} req - Express request object.
   * @param {object} res - Express response object.
   * @param {Function} next - Express next middleware function.
   */
  async show(req, res, next) {
    const snippet = await Snippet.findById(req.params.id)

    if (!snippet) {
      const error = new Error('Not Found')
      error.status = 404
      next(error)
      return
    }

    if (req.session.username === snippet.owner) {
      res.locals.isOwner = true
    } else {
      res.locals.isOwner = false
    }

    res.render('snippets/show', { viewData: snippet.toObject() })
  }

  /**
   * Returns a HTML form for creating a new snippet.
   *
   * @param {object} req - Express request object.
   * @param {object} res - Express response object.
   */
  async create(req, res) {
    res.render('snippets/create')
  }

  /**
   * Creates a new snippet.
   *
   * @param {object} req - Express request object.
   * @param {object} res - Express response object.
   */
  async createPost(req, res) {
    try {
      const snippet = new Snippet({
        title: req.body.title,
        content: req.body.content,
        owner: req.session.username
      })

      await snippet.save()

      req.session.flash = { type: 'success', text: 'The snippet was created successfully.' }
      res.redirect('.')
    } catch (error) {
      req.session.flash = { type: 'danger', text: error.message }
      res.redirect('./create')
    }
  }

  /**
   * Returns a HTML form for updating a snippet.
   *
   * @param {object} req - Express request object.
   * @param {object} res - Express response object.
   */
  async update(req, res) {
    try {
      const snippet = await Snippet.findById(req.params.id)

      res.render('snippets/update', { viewData: snippet.toObject() })
    } catch (error) {
      req.session.flash = { type: 'danger', text: error.message }
      res.redirect('..')
    }
  }

  /**
   * Updates a specific snippet.
   *
   * @param {object} req - Express request object.
   * @param {object} res - Express response object.
   */
  async updatePost(req, res) {
    try {
      const snippet = await Snippet.findById(req.params.id)

      if (snippet) {
        snippet.title = req.body.title
        snippet.content = req.body.content

        await snippet.save()

        req.session.flash = { type: 'success', text: 'The snippet was updated successfully.' }
      } else {
        req.session.flash = {
          type: 'danger',
          text: 'The snippet you attempted to update was removed by another user after you got the original values.'
        }
      }
      res.redirect('..')
    } catch (error) {
      req.session.flash = { type: 'danger', text: error.message }
      res.redirect('./update')
    }
  }

  /**
   * Returns a HTML form for deleting a snippet.
   *
   * @param {object} req - Express request object.
   * @param {object} res - Express response object.
   */
  async delete(req, res) {
    try {
      const snippet = await Snippet.findById(req.params.id)

      res.render('snippets/delete', { viewData: snippet.toObject() })
    } catch (error) {
      req.session.flash = { type: 'danger', text: error.message }
      res.redirect('..')
    }
  }

  /**
   * Deletes the specified snippet.
   *
   * @param {object} req - Express request object.
   * @param {object} res - Express response object.
   */
  async deletePost(req, res) {
    try {
      await Snippet.findByIdAndDelete(req.body.id)

      req.session.flash = { type: 'success', text: 'The snippet was deleted successfully.' }
      res.redirect('..')
    } catch (error) {
      req.session.flash = { type: 'danger', text: error.message }
      res.redirect('./delete')
    }
  }

  /**
   * Checks if user is logged in..
   *
   * @param {object} req - Express request object.
   * @param {object} res - Express response object.
   * @param {Function} next - Express next middleware function.
   */
  authLoggedIn(req, res, next) {
    if (!req.session.username) {
      const error = new Error('Not Found')
      error.status = 404
      next(error)
      return
    }
    next()
  }

  /**
   * Checks if user is owner of snippet.
   *
   * @param {object} req - Express request object.
   * @param {object} res - Express response object.
   * @param {Function} next - Express next middleware function.
   */
  async authOwner(req, res, next) {
    const snippet = await Snippet.findById(req.params.id)
    if (req.session.username !== snippet.owner) {
      const error = new Error('Forbidden')
      error.status = 403
      next(error)
      return
    }
    res.locals.isOwner = true
    next()
  }
}
