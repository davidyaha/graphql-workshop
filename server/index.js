const express = require('express');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const { graphqlExpress, graphiqlExpress } = require('graphql-server-express');

const { Schema } = require('./schema');
const { GithubConnector } = require('./github-connector');

const GITHUB_LOGIN = 'davidyaha';
const GITHUB_ACCESS_TOKEN = 'sjkafdhjkh32098097halskdjhf';

const app = express();

app.use(morgan('tiny'));

app.use('/graphql', bodyParser.json(), graphqlExpress({
  schema: Schema,
  context: {
    githubConnector: new GithubConnector(GITHUB_ACCESS_TOKEN),
    user: { login: GITHUB_LOGIN },
  }
}));

app.use('/graphiql', graphiqlExpress({
  endpointURL: '/graphql',
}));

app.listen(3001);
