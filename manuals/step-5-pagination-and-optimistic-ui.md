# Pagination and Optimistic UI

## Step 5.1 - Setup

- Clone from tag #step-5
```bash
mkdir step-5 && cd step-5
git clone https://github.com/davidyaha/graphql-workshop.git ./
git checkout tags/step-5
```

- Install all
```bash
npm i
```

> Some minor changes was done to both the client and the server. Those changes was done without instructions in order
> to save time from the actual work on premise. You should know that your API can now use Github's follow command and
> exposes that as a mutation. Also your client has a refined layout and a small input form that we will use in this step.
 
## Step 5.2 - Add infinite scroll to our follow list

- We will use `Infinite` component from the package `react-infinite`. Let's import it to `FollowList.js`.

```javascript
import Infinite from 'react-infinite';
```

- Next we will wrap our list items with that `Infinite` component and configure it to match our screen's height and each
  items pixel height. We will also define and pass `loadMore` handler function. Later we will implement loadMore logic 
  from the parent component. Lastly we will pass in a spinner component.
    
```javascript
  static propTypes = {
    // ...
    loadMore: PropTypes.func,
    hasMore: PropTypes.func,
  };

  render() {
    // ... 
    
    return (
      <ListGroup>
        <Infinite containerHeight={450}
                  elementHeight={42}
                  infiniteLoadBeginEdgeOffset={300}
                  onInfiniteLoad={loadMore}
                  loadingSpinnerDelegate={this.renderLoadingMore()}
        >
          {items}
        </Infinite>
      </ListGroup>
    );
  }
  
  renderLoadingMore() {
    const {hasMore} = this.props;
    if (hasMore && hasMore())
      return (
        <h3>Getting more users...</h3>
      );
  }
```

## Step 5.3 - Query more!

- On our `App.js` file, we will add query variables to control the results we get from the following list.
  We expose the `$page` variable so we could change that when ever we have a new page to load. Also, we are adding the 
  field `followingCount` to our query, so we would have a way to decide when to query for more following users.
```javascript
const PER_PAGE = 15;
const ME_QUERY = gql`
    query App($page: Int) {
        me {
            id
            followingCount
            following(page: $page, perPage: ${PER_PAGE}) {
                ...FollowList
            }
        }
    }
`;
```

- We will now write our loadMore logic. Basically, what we would like, is to query exactly the same data, and only change
  the `$page` variable when there is more data to load. So for that exact use case, apollo will add to the `data` object,
  that is passed in as a prop, a function called `fetchMore`. It is a pre-binded and configured to run the same query with
  any variables that you would like to change. It is also allows you to specify a state reducer for your query result, so
  you can control how the new data will be inserted into the state.

- Every time we reach the end of our list, we would like to query for the next page. For that reason, we will keep the 
  `currentPage` number on our `state` and initialize it with the value `1` because of Github's pagination model. 

```javascript
  loadMore() {
    const { data: { fetchMore } } = this.props;
    const { currentPage = 1 } = this.state;
  }
```

- We then check if we have more data to load and if so, we are calling fetchMore with the `currentPage` + 1 so we would
  get the next page of results. After fetchMore returns successfully, we save the new `currentPage` to state.

```javascript
  loadMore() {
    // ...
    
    if ( this.hasMoreToLoad() ) {
      const nextPage = currentPage + 1;
      
      fetchMore({
        // Set new variables
        variables: { page: nextPage },
        
      }).then(() => {
        this.setState({ currentPage: nextPage });
      })
    }
  }
```

- Finally, we add in the state reducer. `updateQuery` gets the previous result as first argument and `fetchMoreResult` field
  on the second argument. We will than compute, using `update` from `react-addons-update` package, the new query result.
  In this case we will just push the new users to the current `following` field.
```javascript
  fetchMore({
    // ...
    
    updateQuery( previous, { fetchMoreResult } ) {
      // Don't update state if there is no data returned
      if ( !fetchMoreResult.data ) { return previous; }
      
      return update(previous, {
        me: {
          following: {
            $push: fetchMoreResult.data.me.following,
          }
        }
      });
    }
  })
```

- Now let's do the tedious task that is deciding weather we need to query for the next page. We are calculating the current
  max users loaded and check weather it's smaller then the whole list count. If so, we need to load more.

> Note that `PER_PAGE` is a constant we've used on the query as well. This number of items should surpass the screens 
> height by a small measurement so we would have room for the infinite scroll indicator to kick in. I've set it to 15.
  
```javascript
  hasMoreToLoad() {
    const { data: { me = {} } } = this.props;
    
    const { followingCount } = me;
    const { currentPage = 1 } = this.state;
    
    return currentPage * PER_PAGE < followingCount;
  }
```

- Finally let's hook these two function to our `FollowerList`.
```javascript
  <FollowList users={me.following}
              loadMore={() => this.loadMore()}
              hasMore={() => this.hasMoreToLoad()}/>
```

- Now let's try to infinitely scroll out list of followers! What? you are not following enough people so you can't test 
  this? Shoot. We will fix that right away!
  
## Step 5.4 - Follow Button

- We will write a small component that is actually a button that know how to activate a graphql mutation and add to the
  `App` query with the new followed user.

- First, we define the view component. It's `render` method only returns `react-bootstrap` button with the text "Follow"
  and the login value of the user we will follow when pressing this button.
  
```javascript
class FollowButton extends Component {
  static propTypes = {
    login: PropTypes.string,
    onClick: PropTypes.func,
  };
  
  render() {
    const { login, onClick } = this.props;
    return (
      <Button bsStyle="success"
              onClick={() => onClick(login)}
              disabled={!login || login === ""}>
        Follow {login}
      </Button>
    );
  }
}
```

- Now let's write our mutation. We are calling `follow` field with the `$login` variable. We expect to get the user we
  will are now following with `id`, `name` and `login` fields.

```javascript
const FOLLOW_MUTATION = gql`
    mutation FollowButton($login: String!) {
        follow(login: $login) {
            id
            name
            login
        }
    }
`;
```

- Same as with the queries, we use the `graphql` container and this time we give it a Redux style `mapMutateToProps` function.
  We will set our `onClick` to use a separate `follow` function. In order for follow to have access to the `mutate` function,
  we bind that as first argument.

```javascript
function mapMutateToProps( { mutate } ) {
  return {
    onClick: follow.bind(this, mutate),
  }
}

export default graphql(FOLLOW_MUTATION, { props: mapMutateToProps })(FollowButton);
```

- Next let's define the onClick behaviour. First, check if we actually got any `login` value to use. If so, we will 
  define our `updateQueries` reducer. This is an upgraded version of the reducer we implemented for `fetchMore`. 
  Because a mutation can have effects on multiple queries, we need to supply a reducer function to every query we would
  like to change. `App` is the name of the query we want to change. We are adding 1 to the `followingCount` value, and
  add to the top of the list, the new followed user.
  One last thing to do would be to call the actual `mutate` with the `login` variable and give it `updateQueries` object
  as well. We then return the promise we get from `mutate` to the caller (If we want to have a spinner, this will one way
  to implement that).

```javascript
function follow( mutate, login ) {
  if ( login ) {
    
    const updateQueries = {
      App: ( previousResult, { mutationResult } ) => {
        const followedUser = mutationResult.data.follow;
        return update(previousResult, {
          me: {
            followingCount: { $apply: n => n + 1 },
            following: {
              $unshift: [followedUser],
            },
          },
        });
      },
    };
    
    return mutate({ variables: { login }, updateQueries})
  } else {
    return Promise.reject('Can\'t follow because no login was supplied');
  }
}
```

- Add the button to App.js

```javascript
     //...
     <form>
        <FormGroup id="loginField">
          <ControlLabel>Enter user's login to follow</ControlLabel>
          <FormControl type="text"
                       placeholder="try davidyaha..."
                       onChange={e => this.setState({ selectedUser: e.target.value })}/>
        </FormGroup>
        <FollowButton login={this.state.selectedUser}/>
      </form>
      // ...
```

- Try it by following me "davidyaha" :)

## Step 5.5 - Add optimistic UI

- In order to make our follow list to update optimistically (like we gave it a valid login name), we need to prepare a 
  simulated response to our mutation. This mutation will have every field our mutation selector expects in order to pass
  validation. Don't worry, apollo is smart enough to rollback any simulated results in case an error occurs.
  If you don't know a value for the optimistic response, just mock it so the user will see an acceptable result.
  For instance we don't know a user's full name so we don't supply that. Our list item uses the `login` field as fallback
  for users that does not have `name` defined.
  
```javascript
    const optimisticResponse = {
      __typename: 'Mutation',
      follow: {
        __typename: 'User',
        id: 'temp',
        login: login,
        name: '',
      },
    };

    return mutate({ variables: { login }, updateQueries, optimisticResponse})

```

- Try that out, type in the login "dxcx" and discover his/her name


## That's has been our last step! Well done!