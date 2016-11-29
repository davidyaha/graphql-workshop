import React from 'react';
import ReactDOM from 'react-dom';
import { ApolloClient, createNetworkInterface } from 'apollo-client';
import { ApolloProvider } from 'react-apollo';
import App from './App';
import './index.css';
import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap/dist/css/bootstrap-theme.css';

const networkInterface = createNetworkInterface({ uri: '/graphql' });
const client = new ApolloClient({ networkInterface });

const app = (
  <ApolloProvider client={client}>
    <App/>
  </ApolloProvider>
);
ReactDOM.render(
  app,
  document.getElementById('root')
);
