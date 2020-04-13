/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import Link from '@docusaurus/Link';

const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

function BlogPostItem(props) {
  const {children, frontMatter, metadata, truncated} = props;

  const {date, readingTime, tags} = metadata;
  const {author, title} = frontMatter;

  const authorURL = frontMatter.author_url || frontMatter.authorURL;
  const authorImageURL =
    frontMatter.author_image_url || frontMatter.authorImageURL;

  const match = date.substring(0, 10).split('-');
  const year = match[0];
  const month = MONTHS[parseInt(match[1], 10) - 1];
  const day = parseInt(match[2], 10);

  return (
    <article className="card h-100">
      <div className="row no-gutters rows-col-2 m-3">
        <div className="col-xs mr-3">
          {authorImageURL && (
            <img style={{width: '50px'}} src={authorImageURL} alt={author} />
          )}
        </div>
        <div className="col">
          {author && (
            <h5>
              <a href={authorURL} alt={author}>
                {author}
              </a>
            </h5>
          )}
          <time
            className="card-subtitle mb-md-4 font-weight-light"
            dateTime={date}>
            {month} {day}, {year}{' '}
          </time>
        </div>
      </div>

      <div className="card-body">
        <h3 className="card-title text-primary">{title}</h3>
        <div className="lead">{children}</div>
      </div>

      <footer className="row no-gutters m-3 justify-content-between">
        <div className="col col-xs">
          {tags.length > 0 && (
            <>
              {tags.map(({label, permalink: tagPermalink}) => (
                <Link key={tagPermalink} className="m-1" to={tagPermalink}>
                  <span className="badge badge-primary">{label}</span>
                </Link>
              ))}
            </>
          )}
        </div>
        <div className="col align-self-center text-right">
          {readingTime && (
            <small className={truncated ? 'mr-2' : ''}>
              {Math.ceil(readingTime)} min read
            </small>
          )}
          {truncated && (
            <a href="https://github.com/" className="stretched-link">
              Read more
            </a>
          )}
        </div>
      </footer>
    </article>
  );
}

export default BlogPostItem;
