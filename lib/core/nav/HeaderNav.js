/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

const CWD = process.cwd();

const React = require("react");
const fs = require("fs");
const siteConfig = require(CWD + "/siteConfig.js");
const translation = require("../../server/translation.js");

const ENABLE_TRANSLATION = fs.existsSync(CWD + "/languages.js");
const ENABLE_VERSIONING = fs.existsSync(CWD + "/versions.json");
let versions;
if (ENABLE_VERSIONING) {
  versions = require(CWD + "/versions.json");
}
require("../../server/readMetadata.js").generateDocsMetadata();
const Metadata = require("../metadata.js");

class LanguageDropDown extends React.Component {
  render() {
    const enabledLanguages = [];
    let currentLanguage = "English";

    translation["languages"].map(lang => {
      if (lang.tag == this.props.language) {
        currentLanguage = lang.name;
      }
      if (lang.tag == this.props.language) {
        return;
      }
      enabledLanguages.push(
        <li key={lang.tag}>
          <a href={siteConfig.baseUrl + lang.tag}>
            {lang.name}
          </a>
        </li>
      );
    });

    if (enabledLanguages.length < 1) {
      return null;
    }

    if (siteConfig.recruitingLink) {
      enabledLanguages.push(
        <li key="recruiting">
          <a href={siteConfig.recruitingLink} target="_blank">
            Help Translate
          </a>
        </li>
      );
    }

    return (
      <span>
        <li>
          <a id="languages-menu" href="#">
            <img
              className="languages-icon"
              src={this.props.baseUrl + "img/language.svg"}
            />
            {currentLanguage}
          </a>
          <div id="languages-dropdown" className="hide">
            <ul id="languages-dropdown-items">
              {enabledLanguages}
            </ul>
          </div>
        </li>
        <script
          dangerouslySetInnerHTML={{
            __html: `
        const languagesMenuItem = document.getElementById("languages-menu");
        const languagesDropDown = document.getElementById("languages-dropdown");
        languagesMenuItem.addEventListener("click", function(){
          if(languagesDropDown.className == "hide") {
            languagesDropDown.className = "visible";
          } else {
            languagesDropDown.className = "hide";
          }
        });
      `
          }}
        />
      </span>
    );
  }
}

class HeaderNav extends React.Component {
  constructor() {
    super();
    this.state = {
      slideoutActive: false
    };
  }

  makeLinks(link) {
    let href;
    if (link.search && this.props.config.algolia) {
      return (
        <li className="navSearchWrapper reactNavSearchWrapper">
          <input id="search_input_react" type="text" placeholder="Search" />
        </li>
      );
    } else if (link.languages) {
      return (
        <LanguageDropDown
          baseUrl={this.props.baseUrl}
          language={this.props.language}
        />
      );
    } else if (link.doc) {
      let id;
      if (!ENABLE_VERSIONING || this.props.version === "next") {
        id = this.props.language + "-" + link.doc;
      } else {
        id =
          this.props.language +
          "-version-" +
          (this.props.version || versions[0]) +
          "-" +
          link.doc;
      }
      if (!Metadata[id]) {
        throw new Error(
          "A headerLink is specified with a document that does not exist. No document exists with id: " +
            link.doc
        );
      }
      href = this.props.config.baseUrl + Metadata[id].permalink;
    } else if (link.page) {
      if (fs.existsSync(CWD + "/pages/en/" + link.page + ".js")) {
        href =
          siteConfig.baseUrl + this.props.language + "/" + link.page + ".html";
      } else {
        href = siteConfig.baseUrl + link.page + ".html";
      }
    } else if (link.href) {
      href = link.href;
    } else if (link.blog) {
      href = this.props.baseUrl + "blog";
    }
    return (
      <li>
        <a href={href} target={link.external ? "_blank" : "_self"}>
          {translation[this.props.language]
            ? translation[this.props.language]["localized-strings"][link.label]
            : link.label}
        </a>
      </li>
    );
  }

  render() {
    const versionsLink =
      this.props.baseUrl +
      (ENABLE_TRANSLATION
        ? this.props.language + "/versions.html"
        : "versions.html");
    return (
      <div className="fixedHeaderContainer">
        <div className="headerWrapper wrapper">
          <header>
            <a href={this.props.baseUrl}>
              <img src={this.props.baseUrl + siteConfig.headerIcon} />
              {!this.props.config.disableHeaderTitle &&
                <h2>
                  {this.props.title}
                </h2>}
            </a>
            {ENABLE_VERSIONING &&
              <a href={versionsLink}>
                <h3>
                  {this.props.version || versions[0]}
                </h3>
              </a>}
            {this.renderResponsiveNav()}
          </header>
        </div>
      </div>
    );
  }

  renderResponsiveNav() {
    const headerLinks = this.props.config.headerLinks;
    // add language drop down to end if location not specified
    let languages = false;
    headerLinks.forEach(link => {
      if (link.languages) {
        languages = true;
      }
    });
    if (!languages) {
      headerLinks.push({ languages: true });
    }
    // add search bar to end if location not specified
    let search = false;
    headerLinks.forEach(link => {
      if (link.search) {
        search = true;
      }
    });
    if (!search && this.props.config.algolia) {
      headerLinks.push({ search: true });
    }
    return (
      <div className="navigationWrapper navigationSlider">
        <nav className="slidingNav">
          <ul className="nav-site nav-site-internal">
            {headerLinks.map(this.makeLinks, this)}
          </ul>
        </nav>
      </div>
    );
  }
}

module.exports = HeaderNav;
