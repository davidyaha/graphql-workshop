# Basic Query and Mutations

## Step 1.0 - Setup

- Sign github's pre release agreenment https://github.com/prerelease/agreement

## Step 1.1

Queries - Go into github’s graphiql and run some queries - https://developer.github.com/early-access/graphql/explorer/
  - Show your login, the number of followers and a list of the first 5. For each follower: show login id, name and avatarURL
  ```graphql
  {
    viewer {
      login
      followers(first: 5) {
        totalCount
        edges {
          node {
            login
            name
            avatarURL(size: 100)
          }
        }
      }
    }
  }
  ```

  - Get the number of stargazers of some repository you know
  ```graphql
  {
    repository(owner: "graphql", name:"graphql-js") {
      id
      name
      stargazers {totalCount}
    }
  }
  ```

  - Get issue [#462](https://github.com/graphql/graphql-js/issues/462) from graphql/graphql-js repository and copy it's id
  ```graphql
  {
    repository(owner: "graphql", name:"graphql-js") {
      id
      name
      issue(number: 462) {
        id
        title
      }
    }
  }
  ```
----

## Step 1.2 Now let's use mutations

  - Use a mutation to add a reaction to the issue with the id we've picked up on the last query
  ```graphql
  mutation {
    addReaction(input: {subjectId: "MDU6SXNzdWUxNzA3MzcyMzg", content: HOORAY}) {
      reaction {
        id
        content
        user {
          login
        }
      }
    }
  }
  ```

  - Now query the issue again but this time get it's reactions as well
  ```graphql
  {
    repository(owner: "graphql", name: "graphql-js") {
      id
      name
      issue(number: 462) {
        id
        title
        reactions(last: 10) {
          totalCount
          edges {
            node {
              content
              user {
                login
              }
            }
          }
        }
      }
    }
  }
  ```
  ----

## Step 1.3 - Fragments and misc.

Cool we've succesfully queried and mutated data on a GraphQL API server. Let's try using fragments

  - Get the repository owner "graphql" and look what are your permissions for that organization
  ```graphql
  {
    repositoryOwner(login:"graphql") {
      __typename
      ... on Organization {
        name
        viewerCanCreateProjects
      }
    }
  }
  ```

  - Get your first follower's id, then query both the viewer(which is you) and your follower.
    For both users make sure to query their name and bio
  ```graphql
  {
    me: viewer {
      ...userFields
    }
    charleno: node(id: "MDQ6VXNlcjEzNjU=") {
      ...userFields
    }
  }

  fragment userFields on User {
    name
    bio
  }
  ```

  - Use field aliases to make viewer query return on your own name and your first follower to return on his/her name
  ```graphql
  {
    david: viewer {
      ...userFields
    }
    charleno: node(id: "MDQ6VXNlcjEzNjU=") {
      ...userFields
    }
  }
  ```
