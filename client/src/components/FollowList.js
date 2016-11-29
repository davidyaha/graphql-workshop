import React, { Component, PropTypes } from 'react';
import { ListGroup } from 'react-bootstrap';
import gql from 'graphql-tag';
import { propType, filter } from 'graphql-anywhere';
import Infinite from 'react-infinite';

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
    loadMore: PropTypes.func,
    hasMore: PropTypes.func,
  };
  
  render() {
    const { users = [], onUserSelected, loadMore } = this.props;
    const items = users.map(user => <FollowListItem key={user.id}
                                                    onClick={onUserSelected}
                                                    user={FollowListItem.filter(user)}/>);
    
    return (
      <ListGroup>
        <Infinite containerHeight={450}
                  elementHeight={42}
                  infiniteLoadBeginEdgeOffset={300}
                  onInfiniteLoad={loadMore}
                  loadingSpinnerDelegate={this.renderLoadingMore()}
        >
          {items}
        </Infinite>
      </ListGroup>
    );
  }
  
  renderLoadingMore() {
    const {hasMore} = this.props;
    if (hasMore && hasMore())
      return (
        <h3>Getting more users...</h3>
      );
  }
}