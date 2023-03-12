/**
 * Module for the UserController.
 *
 * @author Eric Sundqvist
 * @version 1.0.0
 */

/**
 * Encapsulates a controller.
 */
export class UserController {
  /**
   * Fetch and display user information.
   *
   * @param {object} req - Express request object.
   * @param {object} res - Express response object.
   * @param {Function} next - Express next middleware function.
   */
  async showProfile(req, res, next) {
    const accessToken = await this.getToken(req, next)
    const viewData = await this.fetchData(`https://gitlab.lnu.se/api/v4/user?access_token=${accessToken}`, next)
    res.render('user/profile', { viewData })
  }

  /**
   * Fetch and display data about user activities.
   *
   * @param {object} req - Express request object.
   * @param {object} res - Express response object.
   * @param {Function} next - Express next middleware function.
   */
  async showActivities(req, res, next) {
    const accessToken = await this.getToken(req, next)
    const response = await fetch(`https://gitlab.lnu.se/api/v4/events?access_token=${accessToken}&per_page=100`)
    this.checkResponseErrorHandling(response, next)

    let viewData = { events: await response.json() }
    const totalEvents = response.headers.get('x-total')
    // If events are greater then 100, fetch next page and pick the first event and ad it the the previous 100 events.
    if (totalEvents > 100) {
      const events = await this.fetchData(
        `https://gitlab.lnu.se/api/v4/events?access_token=${accessToken}&per_page=100&page=2`,
        next
      )
      viewData.events = [...viewData.events, events[0]]
    }
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
    const query = ` 
    query {
      currentUser {
        groups(first: 3) {
          nodes {
            name
            fullPath
            webUrl
            avatarUrl
            projects(includeSubgroups: true, first: 5) {
              nodes {
                name
                webUrl
                avatarUrl
                path
                repository {
                  tree {
                    lastCommit {
                      author {
                        username
                        name
                      }
                      authorGravatar
                      authoredDate
                    }
                  }
                }
              }
              pageInfo {
                hasNextPage
              }
            }
          }
          pageInfo {
            hasNextPage
          }
        }
      }
    }
    `
    const { data } = await this.fetchGraphQl(query, await this.getToken(req, next), next)
    const viewData = {
      groups: data.currentUser.groups
    }
    res.render('user/group-projects', { viewData })
  }

  /**
   * Fetch data from the gitlab graphql api.
   *
   * @param {string} query
   * @param {string} accessToken
   * @param {Function} next - Express next middleware function.
   * @returns {Promise} resolves into the fetched data.
   */
  async fetchGraphQl(query, accessToken, next) {
    const url = 'https://gitlab.lnu.se/api/graphql'
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // prettier-ignore
        'Authorization': `Bearer ${accessToken}`
      },
      body: JSON.stringify({ query })
    })
    this.checkResponseErrorHandling(response, next)
    return response.json()
  }

  /**
   * Fetch, checks response and
   *
   * @param {string} url - the url to fetch from.
   * @param {Function} next - Express next middleware function.
   * @returns {Promise} resolves into json data.
   */
  async fetchData(url, next) {
    const response = await fetch(url)
    this.checkResponseErrorHandling(response, next)
    return response.json()
  }

  /**
   * Checks if fetch response is ok. Else handles error.
   *
   * @param {object} response
   * @param {Function} next - Express next middleware function.
   * @returns
   */
  checkResponseErrorHandling(response, next) {
    if (!response.ok) {
      const error = new Error(`${response.status} - ${response.statusText} - Fetch from ${url} failed`)
      next(error)
      return
    }
  }

  /**
   * Returns gitlab access token. If expired fetches a new one with refresh token.
   *
   * @param {object} req - Express request object.
   * @param {Function} next - Express next middleware function.
   * @returns {string} gitlab access token.
   */
  async getToken(req, next) {
    if (this.isTokenExpired(req.session.authData.expires_in, req.session.authData.created_at)) {
      const refreshAccessTokenUrl = `https://gitlab.lnu.se/oauth/token?client_id=${process.env.GITLAB_APP_ID}&client_secret=${process.env.GITLAB_APP_SECRET}&refresh_token=${req.session.authData.refresh_token}&grant_type=refresh_token&redirect_uri=${process.env.GITLAB_REDIRECT_URI}`

      const response = await this.fetchData(refreshAccessTokenUrl)
      this.checkResponseErrorHandling(response, next)
      const data = await response.json()
      req.session.authData = data

      return data.access_token
    } else {
      return req.session.authData.access_token
    }
  }
  /**
   * Checks if token is expired.
   *
   * @param {String} createdAt - time of token creation unix time in seconds.
   * @param {String} expiresIn - life time of token in seconds.
   * @returns {boolean} is the token expired?
   */
  isTokenExpired(createdAt, expiresIn) {
    const timeNow = Math.floor(Date.now() / 1000)
    const tokenExpires = expiresIn + createdAt
    // Indicates token as expired 5 sec early to give some margin.
    return timeNow > tokenExpires - 5
  }
}
