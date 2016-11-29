const express = require('express');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const { graphqlExpress, graphiqlExpress } = require('graphql-server-express');

const { Schema } = require('./schema');

const app = express();

app.use(morgan('tiny'));

app.use('/graphql', bodyParser.json(), graphqlExpress({
  schema: Schema,
}));

app.use('/graphiql', graphiqlExpress({
  endpointURL: '/graphql',
}));

app.listen(3001);
