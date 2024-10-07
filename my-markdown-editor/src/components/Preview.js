import React from 'react';
import { processMarkdown } from '../utils/markdown.jsx';

function Preview({ markdown }) {
  const htmlContent = processMarkdown(markdown);

  return (
    <div
      id="preview"
      className="markdown-preview shadow border rounded w-full py-2 px-3 bg-white h-[calc(20rem*1.5)] overflow-y-auto"
      dangerouslySetInnerHTML={{ __html: htmlContent }}
    />
  );
}

export default Preview;

