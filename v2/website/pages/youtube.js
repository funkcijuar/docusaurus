import React from 'react';
import Helmet from 'react-helmet';
import YouTube from 'react-youtube';

export default class Player extends React.Component {
  render() {
    const opts = {
      height: '390',
      width: '640',
      playerVars: {
        autoplay: 1,
      },
    };

    return (
      <div>
        <Helmet>
          <title>My Youtube</title>
        </Helmet>
        <div align="center">
          {/* this is a React-youtube component */}
          <YouTube videoId="d9IxdwEFk1c" opts={opts} onReady={this._onReady} />
        </div>
      </div>
    );
  }

  _onReady(event) {
    // access to player in all event handlers via event.target
    event.target.playVideo();
  }
}
