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
    const accessToken = await this.getToken(req)
    const viewData = await this.fetchData(`https://gitlab.lnu.se/api/v4/user?access_token=${accessToken}`)
    res.render('user/profile', { viewData })
  }

  /**
   * Displays activities.
   *
   * @param {object} req - Express request object.
   * @param {object} res - Express response object.
   * @param {Function} next - Express next middleware function.
   */
  async showActivities(req, res, next) {
    const accessToken = await this.getToken(req)
    // const data = await this.fetchData(`https://gitlab.lnu.se/api/v4/events?access_token=${accessToken}&per_page=10`)
    const response = await fetch(`https://gitlab.lnu.se/api/v4/events?access_token=${accessToken}&per_page=100`)
    if (!response.ok) {
      const error = new Error(`${response.status} - ${response.statusText} - Fetch from ${url} failed`)
      next(error)
      return
    }
    const data = await response.json()
    let viewData = data

    // om response har link next hämta nästa och plocka ut den första ur arrayen.
    const totalEvents = response.headers.get('x-total')
    if (totalEvents > 100) {
      const response2 = await fetch(
        `https://gitlab.lnu.se/api/v4/events?access_token=${accessToken}&per_page=100&page=2`
      )
      if (!response2.ok) {
        const error = new Error(`${response2.status} - ${response2.statusText} - Fetch from ${url} failed`)
        next(error)
        return
      }
      const data2 = await response2.json()
      viewData = [...viewData, data2[0]]
    }

    console.log(viewData.length)

    res.render('user/activities', { viewData })
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

  async fetchAllData(url, collection = []) {
    const { next, results } = await this.fetchData(url)
    collection.push(...results)
    return next ? this.fetchAllData(next, collection) : collection
  }

  async fetchData(url) {
    const response = await fetch(url)
    if (!response.ok) {
      const error = new Error(`${response.status} - ${response.statusText} - Fetch from ${url} failed`)
      next(error)
      return
    }
    return response.json()
  }

  async getToken(req) {
    if (this.isTokenExpired(req.session.authData.expires_in, req.session.authData.created_at)) {
      const refreshAccessTokenUrl = `https://gitlab.lnu.se/oauth/token?client_id=${process.env.GITLAB_APP_ID}&client_secret=${process.env.GITLAB_APP_SECRET}&refresh_token=${req.session.authData.refresh_token}&grant_type=refresh_token&redirect_uri=${process.env.GITLAB_REDIRECT_URI}`

      const response = await this.fetchData(refreshAccessTokenUrl)
      const data = await response.json()
      req.session.authData = data

      return data.access_token
    } else {
      return req.session.authData.access_token
    }
  }

  isTokenExpired(createdAt, expiresIn) {
    const timeNow = Math.floor(Date.now() / 1000)
    const tokenExpires = expiresIn + createdAt
    // Indicates token as expired 5 sec early to give some margin.
    return timeNow > tokenExpires - 5
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
}
