/* eslint-disable */
import React from 'react';
import {Link} from 'react-router-dom';
import Helmet from 'react-helmet';

import Layout from '@theme/Layout'; // eslint-disable-line
import DocsPaginator from '@theme/DocsPaginator'; // eslint-disable-line

import styles from './styles.css';

export default class Docs extends React.Component {
  renderSidebar(metadata, docsSidebars, docsMetadatas) {
    const {sidebar, language, id: thisID} = metadata;
    if (!sidebar || !docsSidebars) {
      return null;
    }
    const thisSidebar = docsSidebars[sidebar];
    return (
      thisSidebar &&
      Object.keys(thisSidebar).map(categoryName => {
        return (
          <div className="navGroup" key={categoryName}>
            <h3 className="navGroupCategoryTitle">{categoryName}</h3>
            <ul>
              {thisSidebar[categoryName].map(rawLinkID => {
                const linkID = (language ? `${language}-` : '') + rawLinkID;
                const linkMetadata = docsMetadatas[linkID];
                if (!linkMetadata) {
                  throw new Error(
                    `Improper sidebars.json file, document with id '${linkID}' not found.`,
                  );
                }
                const linkClassName =
                  linkID === thisID ? 'navListItemActive' : 'navListItem';
                return (
                  <li className={linkClassName} key={linkID}>
                    <Link className="navItem" to={linkMetadata.permalink}>
                      {linkMetadata.sidebar_label || linkMetadata.title}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        );
      })
    );
  }

  render() {
    const {
      route,
      siteConfig,
      docsMetadatas,
      docsSidebars,
      metadata,
    } = this.props;
    const {language, version} = metadata;
    return (
      <Layout {...this.props}>
        <Helmet>
          <title>{(metadata && metadata.title) || siteConfig.title}</title>
          {language && <html lang={language} />}
          {language && <meta name="docsearch:language" content={language} />}
          {version && <meta name="docsearch:version" content={version} />}
        </Helmet>
        <div>{this.renderSidebar(metadata, docsSidebars, docsMetadatas)}</div>
        <div className={styles.mainContainer}>{this.props.children}</div>
        <DocsPaginator docsMetadatas={docsMetadatas} metadata={metadata} />
      </Layout>
    );
  }
}
