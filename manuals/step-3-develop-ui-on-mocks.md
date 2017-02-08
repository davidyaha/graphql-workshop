# Github Private Messaging

## Step 3.1 - Setup

- Clone from tag #step-3

```bash
mkdir step-3 && cd step-3
git clone https://github.com/davidyaha/graphql-workshop.git ./
git checkout tags/step-3
```

- Install all
```bash
npm i
npm i -g create-react-app
```

- Run development servers (Webpack powered static server and our API server we've built on step 2)
```bash
npm start
```

## Step 3.2 - Create follow list item component

- Create our components dir and in it, a file name FollowListItem.js

```bash
mkdir components && cd components
touch FollowListItem.js
```

- In the file named FollwerListItem.js, import the usual `React, {Component, PropTypes}` combo, and also, import `ListGroupItem` from `react-bootstrap` package.

```javascript
import React, { Component, PropTypes } from 'react';
import { ListGroupItem } from 'react-bootstrap';
```

- Now let's start writing our view. The goal of this view is to show the name of our followed user and when we click on 
  it, it should allow us to navigate into a chat with this person. So if so, it will receive two props, `user` an object
  that holds the data we want on our followed user, and an `onClick` function, to handle the click event. 
```javascript
export class FollowListItem extends Component {
  static propType = {
    user: PropTypes.object,
    onClick: PropTypes.func,
  };
}
```

- Next we will define this view's `render` method. 
  It will use `ListGroupItem` and we will provide it with the onClick prop that 
  we just received. We will also render in it, the field `name` of our `user` prop.
```javascript
export class FollowListItem extends Component {
  static propType = {
    user: PropTypes.object,
    onClick: PropTypes.func,
  };
  
  render() {
    const { user, onClick } = this.props;
    
    return (
      <ListGroupItem onClick={onClick}>
        {user.name}
      </ListGroupItem>
    )
  }
}
```

- We have roughly defined how we expect to get data from the user of this view, 
  but GraphQL allows us to define in greater detail our data requirements, and even
  send those requirements to our server so he can provide us with just what we need

## Step 3.3 - Define query fields

- Import the `gql` es6 template tag from the `graphql-tag` package
```javascript
import gql from 'graphql-tag';
```

- Then add a static member to our view called `fragments`. By convention, this `fragments` 
  member will be a map between a prop name to the graphql fragment that satisfies it.

```javascript
export class FollowListItem extends Component {
  // ...
  
  static fragments = {
    user: gql``,
  };
  
  // ...
}
```

- Again, by convention, our fragment will be named as it's containing class. 
  As per our needs, this fragment will work on the `User` type and it will require
  `name` and `login` fields.

```javascript
export class FollowListItem extends Component {
  static fragments = {
    // ...
      
    user: gql`
        fragment FollowListItem on User {
            name
            login
        }
    `,
    
    // ...
  };
}
```

- Now we would like to use this declaration to validate the props that we receive 
  and also filter data so we would not re-render in vain. For these needs, we will
  import both `propType` and `filter` util functions from `graphql-anywhere` package.
  
```javascript
import { propType, filter } from 'graphql-anywhere';
```

- We will create a static `filter` function that will use the util and will be pre binded
  to our fragment.
  
```javascript
export class FollowListItem extends Component {
  // ...
    
  static filter = data => filter(FollowListItem.fragments.user, data);
  
  // ...
}
```

- And after that, we will change our propTypes declaration and use the `propType` util
  to get a validator for the `user` prop.
 
```javascript
export class FollowListItem extends Component {
  // ...
    
  static propType = {
    user: propType(FollowListItem.fragments.user),
    onClick: PropTypes.func,
  };
  
  // ...
}
```

- Lastly, you might have noticed we required not only the `name` but also the `login`
  field of each user. We will change the `onClick` callback into an arrow function calls
  the external `onClick` function with our `login`
  
```javascript
export class FollowListItem extends Component {
  // ...
    
  render() {
    const { user, onClick } = this.props;
    return (
      <ListGroupItem onClick={() => onClick(user.login)}>
        {user.name}
      </ListGroupItem>
    )
  }
 
  // ...
}
```

## Step 3.4 - Create the FollowList

- Create another file in `components` named `FollowList.js`
- In it we will create the follow list group that will call `FollowListItem` that we've just created. 
  Note how we use the static `filter` mothod to get the fields `FollowListItem` requires from each `user`. 
  Also note that we requiring `users` prop here as well because `following` is a list of users.

```javascript
import React, { Component, PropTypes } from 'react';
import { ListGroup } from 'react-bootstrap';
import { FollowListItem } from './FollowListItem';

export class FollowList extends Component {
  
  static propTypes = {
    users: PropTypes.arrayOf(PropTypes.object),
    onUserSelected: PropTypes.func,
  };
  
  render() {
    const { users = [], onUserSelected } = this.props;
    
    const items = users.map(user => <FollowListItem key={user.id} 
                                                    onClick={onUserSelected}
                                                    user={FollowListItem.filter(user)}/>);
    
    return (
      <ListGroup>
        {items}
      </ListGroup>
    );
  }
}
```

- Now let's sprinkle in some GraphQL magic. One thing to consider here, we are using a `fragment` within a `fragment`.
  So to support that, we are adding into our fragment string template, the `FollowListItem` fragment we
  just wrote. 

```javascript
import React, { Component, PropTypes } from 'react';
import { ListGroup } from 'react-bootstrap';
import gql from 'graphql-tag';
import { propType, filter } from 'graphql-anywhere';
import { FollowListItem } from './FollowListItem';

export class FollowList extends Component {
  static fragments = {
    user: gql`
        fragment FollowList on User {
            id
            ...FollowListItem
        }
        ${FollowListItem.fragments.user}
    `,
  };
  
  static filter = data => filter(FollowList.fragments.user, data);
  
  static propTypes = {
    users: propType(FollowList.fragments.user),
    onUserSelected: PropTypes.func,
  };
  
  render() {
    const { users = [], onUserSelected } = this.props;
    
    const items = users.map(user => <FollowListItem key={user.id}
                                                    onClick={onUserSelected}
                                                    user={FollowListItem.filter(user)}/>);
    
    return (
      <ListGroup>
        {items}
      </ListGroup>
    );
  }
}
```

## Step 3.5 - Creating the actual query

- Our App.js file has already been pre-populated with some basic layout. For this step we will ignore the need of a
  router and act as though this App component is our one and only page.

```javascript
import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';

class App extends Component {
  render() {
    return (
      <div className="App">
        <div className="App-header">
          <img src={logo} className="App-logo" alt="logo"/>
          <h2>Github Private Messaging</h2>
        </div>
      </div>
    );
  }
}

export default App;
```

- The code that exists on App.js right now is the same code you will get after running `create-react-app` on a new project. 
  I've only removed the body of this page and changed the title to our example app name.
   
- First, let's use our follow list component. We will render it inside of a bootstrap Grid.

```javascript
import { Grid, Row, Col } from 'react-bootstrap';
import { FollowList } from './components/FollowList';

class App extends Component {
  render() {
    return (
      <div className="App">
        <div className="App-header">
          <img src={logo} className="App-logo" alt="logo"/>
          <h2>Github Follow Manager</h2>
        </div>
        <Grid>
          <Row>
            <Col xs={6} md={6}>
              <FollowList/>
            </Col>
          </Row>
        </Grid>
      </div>
    );
  }
}
```

- Now let's write our GraphQL query. Using `gql` again we will write a query that uses the FollowList fragment on a `me`
  query.
   
```javascript
import gql from 'graphql-tag';

// ...

const ME_QUERY = gql`
    query App {
        me {
            id
            following { 
                ...FollowList
            }
        }
    }
`;
```

- The behaviour we would like is that our query will be sent whenever the `App` component loads. In order to do that, we will
  use a helper function from `react-apollo` package, called `graphql`. It does a similar work as Redux's `connect` 
  function. You will provide it with a query, options, and possibly a "map to props" function, and it will return a function
  that when called with the `App` component, will wrap it and return a container component that can be used as any other react
  component. Note that we need to give our used fragments as part of the query options. We are doing that using 
  `getFragmentDefinitions` function from `apollo-client` package. 
  
```javascript
import { graphql } from 'react-apollo';
import { getFragmentDefinitions } from 'apollo-client';

// ...

const fragmentDependencies = getFragmentDefinitions(FollowList.fragments.user);
const options = { fragments: fragmentDependencies };
const AppWithData = graphql(ME_QUERY, { options })(App);

export default AppWithData;
```

- We didn't provide a map function so our `App` component will receive a prop called `data` as the response from the server.
  This `data` prop has the same shape of the shown response on our graphiql, but it is enriched with a couple more utilities.
  One of those enriching fields is the `loading` flag, which let's us know when the query is trying to get the data from our
  server. 
- We will now use both `me` (our query field) and `loading` to create the follow list. When loading is false we can render
  `FollowList` and give it our `following` list as the `users` prop.
  
```javascript
class App extends Component {
  render() {
    const { data = {} } = this.props;
    const { loading, me } = data;
    
    return (
      <div className="App">
        <div className="App-header">
          <img src={logo} className="App-logo" alt="logo"/>
          <h2>Github Follow Manager</h2>
        </div>
        <Grid>
          <Row>
            <Col xs={6} md={6}>
              {
                loading ?
                  <h3>Loading...</h3> :
                  <FollowList users={me.following} onUserSelected={()=>null}/>
              }
            </Col>
          </Row>
        </Grid>
      </div>
    );
  }
}
```

## Step 3.6 - Connecting to our api server

- Our index.js file is also pre-populated. This is the exact same code you will get from `create-react-app` but I've imported
  the bootstrap css files.
  
```javascript
import React from 'react';
import ReactDOM from 'react-dom';

import App from './App';
import './index.css';
import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap/dist/css/bootstrap-theme.css';

const app = (
  <App/>
);

ReactDOM.render(
  app,
  document.getElementById('root')
);
```

- To create our client, we will import `ApolloClient` and `createNetworkInterface` from `apollo-client` package.

```javascript
import {ApolloClient, createNetworkInterface} from 'apollo-client';
```

- Apollo client is not tied into a specific transport and you can create whatever network interface you would like as long
  as it conforms to the expected interface. For most use cases, HTTP POST requests will suffice and so the apollo team, 
  bundled a util function to create a simple HTTP network interface. The minimal configuration that we will pass is our
  api server url which is `'/graphql'`.

```javascript
const networkInterface = createNetworkInterface({uri: '/graphql'});
const client = new ApolloClient({networkInterface});
```

- In order to get our components to use this client at whatever level in our view tree, we will use `ApolloProvider` from
  `react-apollo` package.

```javascript
import {ApolloProvider} from 'react-apollo';
```

- `ApolloProvider` is a wrapping react component like the `Provider` from Redux. It will receive the client we just created
  and if you already use Redux, it will receive the `store` object instead of the Redux `Provider`.

```javascript
const app = (
  <ApolloProvider client={client}>
    <App/>
  </ApolloProvider>
);
```

- That's it. Our app should be fully configured. Go to http://localhost:3000/ and see the results. You can use Redux dev tools
  to see what actions are being dispatched by apollo and how it is is being reduced into the state. 