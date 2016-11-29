import React, { Component } from 'react';
import { Grid, Row, Col, } from 'react-bootstrap';
import gql from 'graphql-tag';
import { graphql } from 'react-apollo';
import { getFragmentDefinitions } from 'apollo-client';
import logo from './logo.svg';
import './App.css';
import { FollowList } from './components/FollowList';

class App extends Component {
  render() {
    const { data = {} } = this.props;
    const { loading, me = {}, error } = data;
    
    if ( error ) alert(error);
    
    return (
      <div className="App">
        <div className="App-header">
          <img src={logo} className="App-logo" alt="logo"/>
          <h2>Github Follow Manager</h2>
        </div>
        <Grid>
          <Row>
            <Col xs={6} md={6}>
              {
                loading ?
                  <h3>Loading...</h3> :
                  <FollowList users={me.following}/>
              }
            </Col>
          </Row>
        </Grid>
      </div>
    );
  }
}

const ME_QUERY = gql`
    query App {
        me {
            id
            following {
                ...FollowList
            }
        }
    }
`;

const fragmentDependencies = getFragmentDefinitions(FollowList.fragments.user);
const options = { fragments: fragmentDependencies };
const AppWithData = graphql(ME_QUERY, { options })(App);

export default AppWithData;
