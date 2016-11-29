import React, { Component, PropTypes } from 'react';
import { ListGroupItem } from 'react-bootstrap';
import gql from 'graphql-tag';
import { propType, filter } from 'graphql-anywhere';

export class FollowListItem extends Component {
  static fragments = {
    user: gql`
        fragment FollowListItem on User {
            name
            login
        }
    `,
  };
  
  static filter = data => filter(FollowListItem.fragments.user, data);
  
  static propType = {
    user: propType(FollowListItem.fragments.user),
    onClick: PropTypes.func,
  };
  
  render() {
    const { user, onClick } = this.props;
    return (
      <ListGroupItem onClick={() => onClick(user.login)}>
        {user.name || user.login}
      </ListGroupItem>
    )
  }
}