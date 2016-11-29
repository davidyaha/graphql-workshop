import React, { Component, PropTypes } from 'react';
import { Button } from 'react-bootstrap';
import gql from 'graphql-tag';
import { graphql } from 'react-apollo';
import update from 'react-addons-update';

class FollowButton extends Component {
  static propTypes = {
    login: PropTypes.string,
    onClick: PropTypes.func,
  };
  
  render() {
    const { login, onClick } = this.props;
    console.log(login);
    return (
      <Button bsStyle="success"
              onClick={() => onClick(login)}
              disabled={!login || login === ""}>
        Follow {login}
      </Button>
    );
  }
}

const FOLLOW_MUTATION = gql`
    mutation FollowButton($login: String!) {
        follow(login: $login) {
            id
            name
            login
        }
    }
`;

function follow( mutate, login ) {
  if ( login ) {
    const optimisticResponse = {
      __typename: 'Mutation',
      follow: {
        __typename: 'User',
        id: 'temp',
        login: login,
        name: '',
      },
    };
    
    const updateQueries = {
      App: ( previousResult, { mutationResult } ) => {
        const followedUser = mutationResult.data.follow;
        return update(previousResult, {
          me: {
            followingCount: { $apply: n => n + 1 },
            following: {
              $unshift: [followedUser],
            },
          },
        });
      },
    };
    
    return mutate({ variables: { login }, optimisticResponse, updateQueries})
  } else {
    return Promise.reject('Can\'t follow because no login was supplied');
  }
}

function mapMutateToProps( { mutate } ) {
  return {
    onClick: follow.bind(this, mutate),
  }
}

export default graphql(FOLLOW_MUTATION, { props: mapMutateToProps })(FollowButton);