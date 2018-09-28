/* eslint-disable */
import React from 'react';
import {Link} from 'react-router-dom';
import Helmet from 'react-helmet';
import Layout from '@theme/Layout'; // eslint-disable-line

export default class Pages extends React.Component {
  render() {
    const {metadata, children, siteConfig} = this.props;
    const {language} = metadata;
    return (
      <Layout {...this.props}>
        <Helmet defaultTitle={siteConfig.title}>
          {language && <html lang={language} />}
          {language && <meta name="docsearch:language" content={language} />}
        </Helmet>
        {children}
      </Layout>
    );
  }
}
