import React, { Component } from 'react';
import { Grid, Row, Col, FormGroup, FormControl, ControlLabel } from 'react-bootstrap';
import gql from 'graphql-tag';
import { graphql } from 'react-apollo';
import { getFragmentDefinitions } from 'apollo-client';
import update from 'react-addons-update';
import logo from './logo.svg';
import './App.css';
import { FollowList } from './components/FollowList';
import FollowButton from './components/FollowButton';

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
                  <FollowList users={me.following}
                              loadMore={this.loadMore.bind(this)}
                              hasMore={() => this.hasMoreToLoad()}/>
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
                <FollowButton login={this.state.selectedUser}/>
              </form>
            </Col>
          </Row>
        </Grid>
      </div>
    );
  }
  
  loadMore() {
    const { data: { fetchMore } } = this.props;
    const { currentPage = 1 } = this.state;
    
    if ( this.hasMoreToLoad() ) {
      const nextPage = currentPage + 1;
      
      fetchMore({
        // Set new variables
        variables: { page: nextPage },
        
        // The result's state reducer
        updateQuery( previous, { fetchMoreResult } ) {
          // Don't update state if there is no data returned
          if ( !fetchMoreResult.data ) { return previous; }
          
          return update(previous, {
            me: {
              following: {
                $push: fetchMoreResult.data.me.following,
              }
            }
          });
        }
      }).then(() => {
        this.setState({ currentPage: nextPage });
      })
    }
  }
  
  hasMoreToLoad() {
    const { data: { me = {} } } = this.props;
    
    const { followingCount } = me;
    const { currentPage = 1 } = this.state;
    
    return currentPage * PER_PAGE < followingCount;
  }
}

const PER_PAGE = 15;
const ME_QUERY = gql`
    query App($page: Int) {
        me {
            id
            followingCount
            following(page: $page, perPage: ${PER_PAGE}) {
                ...FollowList
            }
        }
    }
`;

const fragmentDependencies = getFragmentDefinitions(FollowList.fragments.user);
const options = { fragments: fragmentDependencies };
const AppWithData = graphql(ME_QUERY, { options })(App);

export default AppWithData;
