# Writing a GraphQL schema

After learning to work with Github's GraphQL explorer, we now want to try and learn how it's done.
Our implementation will be much more simpler but it will eventually help us understand how to wrap 
every REST Api with GraphQL endpoint.

## Step 2.1 - Setup

- Clone from tag #step-2

```bash
mkdir step-2 && cd step-2
git clone https://github.com/davidyaha/graphql-workshop.git ./
git checkout tags/step-2
```

- Install all
```bash
npm i
(cd server && npm i)
```

- Make sure you are running on node@^v6.0.0. 
  If not run:
```bash
nvm install 6
```

## Step 2.2 - Write your schema

- Create a new file named schema.js. We would write our schema inside a single ES6 template string.

```javascript
const typeDefs = `
  ... our schema goes here ....
`;
```

- Every great schema starts with a `schema` declaration. It will have two fields, `query` of type `Query` and `mutation` of type `Mutation`.
```graphql
schema {
  query: Query
  mutation: Mutation
}
```

- Next we define our `Query` type. We will add only one field `me` of type `User`, because this is the only thing the interests us at the moment.
```graphql
type Query {
  me: User
}
```

- Now define our Mutation type. Add a field called `follow`. This field will get a mandatory argument called `userId` of the type `ID`. It will return the type `User` as well.
```graphql
type Mutation {
  follow(userId: ID!): User
}
```
- Note how we used the exclamation mark (`!`) to define a mandatory type.
  
- All we have left is to define our `User` type. 
A user will have `id`, `login`, `name`, `followerCount` and a list of `followers`.
`followers` can accept optional `skip` and `limit` arguments to control the returned items on the followers list.
We will give `skip` a default value of 0 and `limit` default value of 10.


```graphql
type User {
  id: ID!
  login: String!
  name: String
  followerCount: Int
  followers(skip: Int = 0, limit: Int = 10): [User]
}
```

- Now we use apollo to parse that schema and make an executable schema out of it.
- Import the `makeExecutableSchema` from `graphql-tools` package.

```javascript
const {makeExecutableSchema} = require('graphql-tools');
```

- Call it with the `typeDefs` string we just defined.
```javascript
const Schema = makeExecutableSchema({typeDefs});
```

- And lastly, export the executable schema.
```javascript
module.exports = {
  Schema,
};
```

## Step 2.3 - Create a GraphQL endpoint with your schema

- Create a new file named index.js. This of course, will be our server's entry point.
- Import `express`, `body-parser` and our `graphqlExpress` middleware.

```javascript
const express = require('express');
const bodyParser = require('body-parser');
const {graphqlExpress} = require('graphql-server-express');
```

- Import our `Schema` object.
```javascript
const {Schema} = require('./schema');
```

- Now we create our `express` app, and add our `bodyParser` and `graphqlExpress` middleware on `/graphql` path.

```javascript
const app = express();

app.use('/graphql', bodyParser.json(), graphqlExpress({
  schema: Schema,
}));
```

- Lastly we need to tell `express` to start listening on some port.
```javascript
app.listen(3001);
```

- Now we can go ahead and start the app by typing `npm start` in our project directory.

- If it works without errors, close it using Ctrl + C and run `npm run watch` to make our server restart when we change our files.

- So now we have a GrpahQL endpoint but we don't know how to explore the API. To do just that, we will add `graphiqlExpress` middleware.
```javascript
// Import graphiqlExpress from the same package
const {graphqlExpress, graphiqlExpress} = require('graphql-server-express');

// ... Just before calling the listen method

app.use('/graphiql', graphiqlExpress({
  endpointURL: '/graphql', // This will tell the graphiql interface where to run queries
}));
```

- Now open your browser on http://localhost:3001/graphiql and start exploring the schema we've just wrote!
 
- Try to run the following `me` query. 

```graphql
query {
  me {
    login
    name
    followerCount
    followers(limit: 5) {
      login
      name
    }
  }
}
```

- You will get the following response:
```json
{
  "data": {
    "me": null
  }
}
```

## Step 2.4 - Adding mocks

Our schema does not know how to resolve `me` or any other field for that matter. 
We need to provide it with proper resolvers but until we get to do that, 
there is one more very cool feature to apollo which is generating mock resolvers.

- Import from `graphql-tools` the function `addMockFunctionsToSchema` on our schema.js file.

```javascript
const {makeExecutableSchema, addMockFunctionsToSchema} = require('graphql-tools');
```

- Now call this function right before the export of our `Schema` object.

```javascript
addMockFunctionsToSchema({schema: Schema});
```

- Go back to our grahpiql tool on http://localhost:3001/graphiql and run the `me` query again.

- This time you will receive a response of the following structure:
```json
{
  "data": {
    "me": {
      "login": "Hello World",
      "name": "Hello World",
      "followerCount": -96,
      "followers": [
        {
          "login": "Hello World",
          "name": "Hello World"
        },
        {
          "login": "Hello World",
          "name": "Hello World"
        }
      ]
    }
  }
}
```

So we can see that our schema now knows how to return data. We can also see that the data is quite genric and sometimes doesn't make sense.
In order to change that, we use a package called `casual` to tweak some of the mocked data.

-  Import `casual` to our schema.js file and create a `mocks` object.
Pass that `mocks` object to the `addMockFunctionsToSchema` function. 
```javascript
const casual = require('casual');
// ....
const mocks = {};

addMockFunctionsToSchema({schema: Schema, mocks});
```

- First let's make `followerCount` to be a positive number.
```javascript
const mocks = {
  User: () => ({
    followerCount: () => casual.integer(0), // start from 0
  }),
};
```

- Now let's get `name` and `login` fields return fitting strings.
```javascript
const mocks = {
  User: () => ({
    login: () => casual.username,
    name: () => casual.name,
    
    followerCount: () => casual.integer(0),
  }),
};
```

- Lastly, we will use `MockedList` from `graphql-tools`, to make followers return a list of users that it's length corresponds to the given `limit` argument.
 
```javascript
const {makeExecutableSchema, addMockFunctionsToSchema, MockList} = require('graphql-tools');

// ....

const mocks = {
  User: () => ({
    login: () => casual.username,
    name: () => casual.name,
    followerCount: () => casual.integer(0),
    
    followers: (_, args) => new MockList(args.limit),
  }),
};
```

- Now run the `me` query again. You should get a more sensible result.
```json
{
  "data": {
    "follow": {
      "login": "Haleigh.Kutch",
      "name": "Dr. Marlen Smith",
      "followerCount": 182,
      "followers": [
        {
          "login": "Solon_Hirthe",
          "name": "Mrs. Jamie Roberts"
        },
        {
          "login": "Wyman_Arnold",
          "name": "Dr. Alisa Price"
        },
        {
          "login": "Mabelle_Donnelly",
          "name": "Ms. Monica Bosco"
        },
        {
          "login": "Wiegand_Keira",
          "name": "Miss Emilia McDermott"
        },
        {
          "login": "Duncan.Hickle",
          "name": "Mrs. Jacinto Reinger"
        }
      ]
    }
  }
}
```