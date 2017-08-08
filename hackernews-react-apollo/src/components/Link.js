import React, { Component } from 'react';

class Link extends Component {
  render() {
    return (
      <div>
        <div>{this.props.link.description} ({this.props.link.url})</div>
      </div>
    )
  }

  _voteForLink = async () => {
    // we will implement this in chapter 6
  }
}

export default Link;