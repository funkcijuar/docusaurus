/**
 * Copyright (c) 2017-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import Head from '@docusaurus/Head'; // eslint-disable-line
import useDocusaurusContext from '@docusaurus/useDocusaurusContext'; // eslint-disable-line
import Navbar from '@theme/Navbar'; // eslint-disable-line
import Footer from '@theme/Footer'; // eslint-disable-line

import './styles.css';

function Layout(props) {
  const context = useDocusaurusContext();
  const {siteConfig = {}} = context;
  const {baseUrl, favicon, tagline, title: defaultTitle} = siteConfig;
  const {children, title, noFooter} = props;
  return (
    <React.Fragment>
      <Head defaultTitle={`${defaultTitle} · ${tagline}`}>
        {title && <title>{title}</title>}
        {favicon && <link rel="shortcut icon" href={baseUrl + favicon} />}
      </Head>
      <Navbar />
      {children}
      {!noFooter && <Footer />}
    </React.Fragment>
  );
}

export default Layout;
