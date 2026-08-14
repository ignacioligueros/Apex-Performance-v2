import React from 'react';
import { renderToString } from 'react-dom/server';
import Markdown from 'react-markdown';

try {
  const html = renderToString(<Markdown>{""}</Markdown>);
  console.log("Success:", html);
} catch (e) {
  console.log("Crash:", e);
}
