import React, { Component, PropTypes } from 'react';
import { ListGroupItem } from 'react-bootstrap';

export class FollowListItem extends Component {
  
  static propType = {
    user: PropTypes.object,
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