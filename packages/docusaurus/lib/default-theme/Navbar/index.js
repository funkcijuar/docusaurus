/**
 * Copyright (c) 2017-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, {useContext} from 'react';

import Link from '@docusaurus/Link';
import Search from '@theme/Search';
import DocusaurusContext from '@docusaurus/context';

function Navbar(props) {
  const context = useContext(DocusaurusContext);
  const {siteConfig = {}, env = {}, metadata = {}} = context;
  // TODO: navbar headerlinks should depends on theme, not siteConfig;
  const {
    baseUrl,
    headerLinks,
    headerIcon,
    algolia,
    title,
    disableHeaderTitle,
  } = siteConfig;

  const {language: thisLanguage, version: thisVersion} = metadata;

  const translationEnabled = env.translation.enabled;
  const versioningEnabled = env.versioning.enabled;
  const defaultVersion = versioningEnabled && env.versioning.defaultVersion;

  // function to generate each header link
  const makeLinks = link => {
    if (link.url) {
      // internal link
      const targetLink = `${baseUrl}${link.url}`;
      return (
        <div key={targetLink} className="navbar__item">
          <Link
            activeClassName="navbar__link--active"
            className="navbar__link"
            to={targetLink}>
            {link.label}
          </Link>
        </div>
      );
    }
    if (link.href) {
      // set link to specified href
      return (
        <div key={link.label} className="navbar__item">
          <Link to={link.href} className="navbar__link">
            {link.label}
          </Link>
        </div>
      );
    }
    return null;
  };

  return (
    <nav className="navbar navbar--light navbar--fixed-top">
      <div className="navbar__inner">
        <div className="navbar__items">
          <Link
            className="navbar__brand"
            to={baseUrl + (translationEnabled ? thisLanguage : '')}>
            {headerIcon && (
              <img
                className="navbar__logo"
                src={baseUrl + headerIcon}
                alt={title}
              />
            )}
            {!disableHeaderTitle && <strong>{title}</strong>}
          </Link>
          {versioningEnabled && (
            <div key="versions" className="navbar__item">
              <Link
                className="navbar__link"
                to={
                  baseUrl +
                  (translationEnabled ? `${thisLanguage}/versions` : `versions`)
                }>
                {thisVersion || defaultVersion}
              </Link>
            </div>
          )}
          {headerLinks.map(makeLinks)}
        </div>
        <div className="navbar__items navbar__items--right">
          {algolia && (
            <div className="navbar__search" key="search-box">
              <Search {...props} />
            </div>
          )}
          <div className="navbar__item">
            <a
              className="navbar__link"
              href="https://github.com/facebook/docusaurus"
              rel="noopener noreferrer"
              target="_blank">
              <i className="fab fa-github fa-lg" />
            </a>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
