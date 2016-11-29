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

const resolvers = {
  Query: {
    me( _, args, context ) {
      return context.githubConnector.getUserForLogin(context.user.login);
    }
  },
  Mutation: {
    follow(_, args, context) {
      return context.githubConnector.follow(args.login)
                    .then(() => context.githubConnector.getUserForLogin(args.login))
    },
  },
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
};

const Schema = makeExecutableSchema({ typeDefs, resolvers });

module.exports = {
  Schema,
};
