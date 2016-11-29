const fetch = require('node-fetch');

class GithubConnector {
  constructor( accessToken ) {
    this.accessToken = accessToken;
  }
  
  getUserForLogin( login ) {
    return this.getFromGithub(`/users/${login}`);
  }
  
  getFollowingForLogin( login, page, perPage ) {
    return this.getFromGithub(`/users/${login}/following`, page, perPage);
  }
  
  getFromGithub( relativeUrl, page, perPage ) {
    const url = `https://api.github.com${relativeUrl}?access_token=${this.accessToken}`;
    return fetch(this.paginate(url, page, perPage)).then(res => res.json());
  }
  
  paginate( url, page, perPage ) {
    let transformed = url.indexOf('?') !== -1 ? url : url + '?';
    
    if ( page ) {
      transformed = `${transformed}&page=${page}`
    }
    
    if ( perPage ) {
      transformed = `${transformed}&per_page=${perPage}`
    }
    
    return transformed;
  }
}

module.exports = {
  GithubConnector,
};