const { makeExecutableSchema } = require('graphql-tools');

const typeDefs = `
  schema {
    query: Query
    mutation: Mutation
  }
  
  type Query {
    me: User
  }
  
  type Mutation {
    follow(login: String!): User
  }
  
  type User {
    id: ID!
    login: String!
    name: String
    followingCount: Int
    following(page: Int = 0, perPage: Int = 10): [User]
  }
`;

const Schema = makeExecutableSchema({ typeDefs });

module.exports = {
  Schema,
};
