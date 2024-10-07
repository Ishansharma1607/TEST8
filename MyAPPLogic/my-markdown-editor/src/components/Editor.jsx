import React, { useState } from 'react';

function Editor({ markdown, onChange }) {
  return (
    <textarea
      id="textArea"
      name="text"
      className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
      rows="20"
      placeholder="Enter your markdown text here..."
      value={markdown}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}

export default Editor;
