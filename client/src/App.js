import React, { Component } from 'react';
import { Grid, Row, Col, FormGroup, FormControl, ControlLabel } from 'react-bootstrap';
import gql from 'graphql-tag';
import { graphql } from 'react-apollo';
import { getFragmentDefinitions } from 'apollo-client';
import logo from './logo.svg';
import './App.css';
import { FollowList } from './components/FollowList';

class App extends Component {
  state = {};
  
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
              <h3>Following {me.followingCount}</h3>
            </Col>
          </Row>
          <Row>
            <Col xs={6} md={6}>
              {
                loading ?
                  <h3>Loading...</h3> :
                  <FollowList users={me.following}/>
              }
            </Col>
            <Col xs={6} md={6}>
              <form>
                <FormGroup id="loginField">
                  <ControlLabel>Enter user's login to follow</ControlLabel>
                  <FormControl type="text"
                               placeholder="try davidyaha..."
                               onChange={e => this.setState({ selectedUser: e.target.value })}/>
                </FormGroup>
              </form>
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
