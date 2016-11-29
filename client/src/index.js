import React from 'react';
import ReactDOM from 'react-dom';

import App from './App';
import './index.css';
import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap/dist/css/bootstrap-theme.css';

const app = (
  <App/>
);
ReactDOM.render(
  app,
  document.getElementById('root')
);
