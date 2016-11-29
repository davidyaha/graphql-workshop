const fetch      = require('node-fetch');
const DataLoader = require('dataloader');

class GithubConnector {
  constructor( accessToken ) {
    this.accessToken = accessToken;
    this.dataLoader  = new DataLoader(this.fetchAll.bind(this), { batch: false });
  }
  
  getUserForLogin( login ) {
    return this.getFromGithub(`/users/${login}`);
  }
  
  getFollowingForLogin( login, page, perPage ) {
    return this.getFromGithub(`/users/${login}/following`, page, perPage);
  }
  
  follow( login ) {
    return this.putToGithub(`/user/following/${login}`);
  }
  
  putToGithub( relativeUrl ) {
    const url = `https://api.github.com${relativeUrl}?access_token=${this.accessToken}`;
    
    const options = { method: 'PUT', headers: { 'Content-Length': 0 } };
    return fetch(url, options).then(() => this.dataLoader.clearAll());
  }
  
  getFromGithub( relativeUrl, page, perPage ) {
    const url = `https://api.github.com${relativeUrl}?access_token=${this.accessToken}`;
    return this.dataLoader.load(this.paginate(url, page, perPage));
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
  
  fetchAll( urls ) {
    return Promise.all(
      urls.map(url => {
        console.log('Fetching Url', url);
        return fetch(url).then(res => res.json())
      })
    );
  }
}

module.exports = {
  GithubConnector,
};