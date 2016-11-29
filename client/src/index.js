import React from 'react';
import ReactDOM from 'react-dom';
import { ApolloClient, createNetworkInterface } from 'apollo-client';
import { ApolloProvider } from 'react-apollo';
import App from './App';
import './index.css';
import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap/dist/css/bootstrap-theme.css';

const networkInterface = createNetworkInterface({ uri: '/graphql' });
const dataIdFromObject = obj => obj.id && obj.__typename ? `${obj.__typename}:${obj.id}` : null;

const client = new ApolloClient({ networkInterface, dataIdFromObject });

const app = (
  <ApolloProvider client={client}>
    <App/>
  </ApolloProvider>
);
ReactDOM.render(
  app,
  document.getElementById('root')
);
