/**
 * Copyright (c) 2017-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, {useContext, useEffect} from 'react';

import DocsPaginator from '@theme/DocsPaginator'; // eslint-disable-line
import DocusaurusContext from '@docusaurus/context';
import Head from '@docusaurus/Head';

import styles from './styles.module.css';

function DocBody(props) {
  const {metadata, modules} = props;
  const {language, version} = metadata;
  const context = useContext(DocusaurusContext);
  useEffect(() => {
    context.setContext({metadata});
  }, []);

  const DocContents = modules[0];
  return (
    <div className={styles.docBody}>
      <Head>
        {metadata && metadata.title && <title>{metadata.title}</title>}
        {language && <html lang={language} />}
        {language && <meta name="docsearch:language" content={language} />}
        {version && <meta name="docsearch:version" content={version} />}
      </Head>
      <div className="container margin-bottom-xl">
        <div className="row">
          <div className="col col-8 col-offset-2">
            <h1 className="margin-vert-xl">{metadata.title}</h1>
            <DocContents />
            <div className="margin-vert-xl">
              <DocsPaginator />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DocBody;
