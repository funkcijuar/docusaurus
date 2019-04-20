/**
 * Copyright (c) 2017-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, {useState} from 'react';
import {renderRoutes} from 'react-router-config';
import ReactListenerProvider from 'react-listener-provider';

import Head from '@docusaurus/Head'; // eslint-disable-line
import routes from '@generated/routes'; // eslint-disable-line
import metadata from '@generated/metadata'; // eslint-disable-line
import siteConfig from '@generated/docusaurus.config'; //eslint-disable-line
import DocusaurusContext from '@docusaurus/context'; // eslint-disable-line

function App() {
  const [context, setContext] = useState({});
  return (
    <DocusaurusContext.Provider
      value={{siteConfig, ...metadata, ...context, setContext}}>
      {/* TODO: this link stylesheet to infima is temporary */}
      <Head>
        <link
          crossOrigin="anonymous"
          href="https://use.fontawesome.com/releases/v5.8.1/css/all.css"
          integrity="sha384-50oBUHEmvpQ+1lW4y57PTFmhCaXp0ML5d60M1M7uH2+nqUivzIebhndOJK28anvf"
          preload
          rel="stylesheet"
        />
        <link
          href="https://infima-dev.netlify.com/css/default/default.min.css"
          preload
          rel="stylesheet"
          type="text/css"
        />
      </Head>
      <ReactListenerProvider>{renderRoutes(routes)}</ReactListenerProvider>
    </DocusaurusContext.Provider>
  );
}

export default App;
