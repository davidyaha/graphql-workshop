import React, { Component, PropTypes } from 'react';
import { ListGroup } from 'react-bootstrap';
import gql from 'graphql-tag';
import { propType, filter } from 'graphql-anywhere';

import { FollowListItem } from './FollowListItem';

export class FollowList extends Component {
  static fragments = {
    user: gql`
        fragment FollowList on User {
            id
            ...FollowListItem
        }
        ${FollowListItem.fragments.user}
    `,
  };
  
  static filter = data => filter(FollowList.fragments.user, data);
  
  static propTypes = {
    users: PropTypes.arrayOf(propType(FollowList.fragments.user)),
    onUserSelected: PropTypes.func,
  };
  
  render() {
    const { users = [], onUserSelected, loadMore } = this.props;
    const items = users.map(user => <FollowListItem key={user.id}
                                                    onClick={onUserSelected}
                                                    user={FollowListItem.filter(user)}/>);
    
    return (
      <ListGroup>
        {items}
      </ListGroup>
    );
  }
}