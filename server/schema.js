const { makeExecutableSchema, addMockFunctionsToSchema, MockList } = require('graphql-tools');
const casual                                                       = require('casual');

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

const mocks = {
  User: () => ({
    login: () => casual.username,
    name: () => casual.name,
    followingCount: () => casual.integer(0),
    following: (_, {perPage}) => new MockList(perPage),
  }),
};

addMockFunctionsToSchema({schema: Schema, mocks});

module.exports = {
  Schema,
};
