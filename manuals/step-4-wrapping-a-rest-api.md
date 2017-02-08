# Wrapping GitHub's REST API

Now that we have our app working with mocks, we would like change the mocks with real data, taken from GitHub.

## Step 4.1 - Setup

- Clone from tag #step-4
```bash
mkdir step-4 && cd step-4
git clone https://github.com/davidyaha/graphql-workshop.git ./
git checkout tags/step-4
```

- Install all
```bash
npm i
```

- Create a github API token for your user here - [https://github.com/settings/tokens/new]
  Enter a description, then check the user scope and press "Generate token" button.
  
- Create two constants on server/index.js file. One will hold you github login and the second will hold the token you've
  just created.
   
```javascript
const GITHUB_LOGIN = 'davidyaha';
const GITHUB_ACCESS_TOKEN = 'asdf821342321123232fds13ljkh1';
```

## Step 4.2 - Create a GitHub connector class

- Create a new file under server, named `github-connector.js`. This file will hold everything that is needed in order to 
  get data from the GitHub API. To do our REST calls we will use `fetch` from `node-fetch`.
  
```javascript
const fetch = require('node-fetch');
```

- Defining our `GithubConnector` class we will require the github's access token and save that on our instance 
```javascript
class GithubConnector {
  constructor( accessToken ) {
    this.accessToken = accessToken;
  }
}

module.exports = {
  GithubConnector,
};
```

- First we need a way to get any user object using the `login` string. GitHub's REST Api defines this as a GET to the
  `/users/{login}` route. We will do just that while passing the responsibility of making the request and parsing the 
  result to another method we will call `getFromGithub`.
```javascript
class GithubConnector {
  getUserForLogin( login ) {
    return this.getFromGithub(`/users/${login}`);
  }
}
```

- In order to fulfill our schema needs, we also got to have a way to get a certain user's following list. Github defines 
  that similarly as GET to `/users/{login}/following`. Following is a list and we've already specifies in our schema, a way
  to control the results of this list. So we can require page and items per page here, and pass them to Github.

```javascript
class GithubConnector {
  getFollowingForLogin( login, page, perPage ) {
    return this.getFromGithub(`/users/${login}/following`, page, perPage);
  }
}
```
  
- All those requests will happen from this `getFromGithub` method. We will define it as 
  `(relativeUrl, page, perPage) => Promise<Object | Array>`. We use `fetch` to make the GET request use the `result.json()`
   method to get a parsed body object. We build the url using Github's API url `'https://api.github.com'` and add at the
   end `access_token` parameter. The responsibility of adding paginating parameters to the url, we transfer to a 
   dedicated `paginate` method.
 
```javascript
class GithubConnector {
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
```
  
- Our schema resolvers will be able to use the `GithubConnector` class, using a context object that is created in 
  index.js and is passed into `graphqlExpress` middleware. Note that `user` field is also part of `context` and it holds
  the current user's github login. On a real setup, this will be created for every session after authenticating the user.
  
```javascript
app.use('/graphql', bodyParser.json(), graphqlExpress({
  schema: Schema,
  context: {
    githubConnector: new GithubConnector(GITHUB_ACCESS_TOKEN),
    user: {login: GITHUB_LOGIN},
  }
}));
```

## Step 4.3 - Create resolvers

- Up until now, our schema used mocks to resolve the queried data. Now, we would like to tell our schema how it can acquire
  some real data.

- On `schema.js` create an empty object called `resolvers` and pass it into `makeExecutableSchema`.

```javascript
const resolvers = {};
const Schema = makeExecutableSchema({typeDefs, resolvers});
```
 
- Now let's specify how to resolve the `Query` type. the first and only field we have on `Query` is `me`. The resolver
  function is being called by the graphql `execute` function with four argument. The `value` passed from the parent resolver.
  The `argumnets` (or `args`) passed as the field arguments. The `context` object we defined on our index.js file. And lastly
  the schema definition and other specific request information. The last argument is used mostly in framework like `join-monster`
  which allows optimization of sql database queries. It is out of our scope.
- For resolving `me` we use the githubConnector we added to the `context` object. We are using the `getUserForLogin`,
  and passing it the logged in user that we also added to `context`.

```javascript
const resolvers = {
  Query: {
    me(_, args, context) {
      return context.githubConnector.getUserForLogin(context.user.login);
    }
  },
};
```

- Next we need to define the `User` type. The `following` field will use `getFollowingForLogin` to get the list of users
  that the current user is following. This list does not have all the data we need to satisfy the other `User` fields, so
  we need to get each user's full public profile. That is done by mapping each user to the `getUserForLogin` method.
  The only other resolver we need to specify is the `followingCount`. This data is available from `getUserForLogin` but
  is ironically called `following` on github's returned object. Other resolvers are redundant as github's response maps
  to our other field names (id, name, login).

```javascript
const resolvers = {
  // ...
  
  User: {
    following( user, args, context ) {
      const { page, perPage } = args;
      return context.githubConnector.getFollowingForLogin(user.login, page, perPage)
                    .then(users =>
                      users.map(user => context.githubConnector.getUserForLogin(user.login))
                    );
    },
    followingCount: user => user.following,
  }
}
```

- We can now remove the mocks from our schema.js file and test from our web app or from graphiql

## Step 4.4 - Making fewer calls to GitHub

- So our schema is working great but it has two apparent issues. One it is somewhat slow and is depending on GitHub's API
  to give quick responses. Second, it queries GitHub a bunch of times for each GraphQL query. If we have circular follow
  dependencies it will even query more than once to get the same user profile. We will now fix those problems to some
  extent using very simple tool from facebook called `dataloader`.

- We will import `DataLoader` from the `dataloader` package on our github-connector.js file. 
```javascript
const DataLoader = require('dataloader');
```

- The `DataLoader` constructor needs a function that will be able to mass load any of the objects it is required. We will 
  also set our data loader to avoid batching requests as the GitHub API does not support batching. 
   
```javascript
  constructor( accessToken ) {
    this.accessToken = accessToken;
    this.dataLoader  = new DataLoader(this.fetchAll.bind(this), { batch: false });
  }
```

- To implement fetchAll we just need to use `fetch` as done before on `getFromGithub` for each url we receive. After that,
  use `Promise.all()` to create a single promise and return that. Make sure to print each call to fetch so we would know
  when our data loader is using it's cache and when it's not.
  
```javascript
  fetchAll( urls ) {
    return Promise.all(
      urls.map(url => {
        console.log('Fetching Url', url);
        return fetch(url).then(res => res.json())
      })
    );
  }
```

- Lastly we need to change `getFromGithub` to use our data loader instead of fetch.

```javascript
  getFromGithub( relativeUrl, page, perPage ) {
    const url = `https://api.github.com${relativeUrl}?access_token=${this.accessToken}`;
    return this.dataLoader.load(this.paginate(url, page, perPage));
  }
```

> Note that we don't invalidate the data loader's cache. Facebook suggests we would invalidate when ever a mutation is
> done. This a simple call to `clearAll` method and you can see an example for it on step 5.
  
- You should now see that whenever you query you GraphQL API, it will get the data the first time from GitHub, causing
  a long response time and on the second time it will load the data from memory with a fraction of the time.
  