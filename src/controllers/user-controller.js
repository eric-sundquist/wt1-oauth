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
    const viewData = await this.fetchData(`https://gitlab.lnu.se/api/v4/user?access_token=${accessToken}`, next)
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
    const response = await this.fetchResponse(
      `https://gitlab.lnu.se/api/v4/events?access_token=${accessToken}&per_page=100`,
      next
    )

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
    // fetch user information
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
    const { data } = await this.fetchGraphQl(query, await this.getToken(req), next)
    const viewData = {
      groups: data.currentUser.groups
    }
    res.render('user/group-projects', { viewData })
  }

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
    if (!response.ok) {
      const error = new Error(`${response.status} - ${response.statusText} - Fetch from ${url} failed`)
      next(error)
      return
    }
    return response.json()
  }

  async fetchResponse(url, next) {
    const response = await fetch(url)
    if (!response.ok) {
      const error = new Error(`${response.status} - ${response.statusText} - Fetch from ${url} failed`)
      next(error)
      return
    }
    return response
  }

  async fetchData(url, next) {
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
}
