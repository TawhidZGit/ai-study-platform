import React from 'react';

/**
 * Simple markdown renderer for AI responses
 * Handles: bold, italic, headers, lists, code blocks
 */
const MarkdownRenderer = ({ content }) => {
  if (!content) return null;

  const renderLine = (line, index) => {
    // Empty line
    if (line.trim() === '') {
      return <br key={index} />;
    }

    // Headers
    if (line.startsWith('### ')) {
      return (
        <h3 key={index} className="text-lg font-bold text-gray-800 mt-4 mb-2">
          {parseInline(line.replace(/^### /, ''))}
        </h3>
      );
    }
    if (line.startsWith('## ')) {
      return (
        <h2 key={index} className="text-xl font-bold text-gray-800 mt-5 mb-3">
          {parseInline(line.replace(/^## /, ''))}
        </h2>
      );
    }
    if (line.startsWith('# ')) {
      return (
        <h1 key={index} className="text-2xl font-bold text-gray-800 mt-6 mb-3">
          {parseInline(line.replace(/^# /, ''))}
        </h1>
      );
    }

    // Unordered lists
    if (line.match(/^[\s]*[-*+]\s+/)) {
      const content = line.replace(/^[\s]*[-*+]\s+/, '');
      return (
        <li key={index} className="ml-4 mb-1 text-gray-700 leading-relaxed">
          {parseInline(content)}
        </li>
      );
    }

    // Ordered lists
    if (line.match(/^[\s]*\d+\.\s+/)) {
      const content = line.replace(/^[\s]*\d+\.\s+/, '');
      return (
        <li key={index} className="ml-4 mb-1 text-gray-700 leading-relaxed list-decimal">
          {parseInline(content)}
        </li>
      );
    }

    // Code blocks (```...```)
    if (line.startsWith('```')) {
      return null; // Will be handled separately
    }

    // Regular paragraph
    return (
      <p key={index} className="text-gray-700 leading-relaxed mb-3">
        {parseInline(line)}
      </p>
    );
  };

  const parseInline = (text) => {
    const parts = [];
    let currentIndex = 0;
    let key = 0;

    // Regex patterns for inline formatting
    const patterns = [
      { regex: /\*\*\*(.+?)\*\*\*/g, component: (match) => <strong key={key++} className="font-bold italic">{match[1]}</strong> },
      { regex: /\*\*(.+?)\*\*/g, component: (match) => <strong key={key++} className="font-bold">{match[1]}</strong> },
      { regex: /\*(.+?)\*/g, component: (match) => <em key={key++} className="italic">{match[1]}</em> },
      { regex: /_(.+?)_/g, component: (match) => <em key={key++} className="italic">{match[1]}</em> },
      { regex: /`(.+?)`/g, component: (match) => <code key={key++} className="bg-gray-100 px-1.5 py-0.5 rounded text-sm font-mono text-red-600">{match[1]}</code> },
    ];

    // Find all matches
    const allMatches = [];
    patterns.forEach(({ regex, component }) => {
      let match;
      const regexCopy = new RegExp(regex.source, regex.flags);
      while ((match = regexCopy.exec(text)) !== null) {
        allMatches.push({
          start: match.index,
          end: match.index + match[0].length,
          component: component(match),
          priority: regex.source.length // Longer patterns have priority
        });
      }
    });

    // Sort by start position and priority
    allMatches.sort((a, b) => {
      if (a.start === b.start) return b.priority - a.priority;
      return a.start - b.start;
    });

    // Remove overlapping matches (keep higher priority)
    const filteredMatches = [];
    let lastEnd = 0;
    for (const match of allMatches) {
      if (match.start >= lastEnd) {
        filteredMatches.push(match);
        lastEnd = match.end;
      }
    }

    // Build the result
    filteredMatches.forEach((match) => {
      if (match.start > currentIndex) {
        parts.push(text.substring(currentIndex, match.start));
      }
      parts.push(match.component);
      currentIndex = match.end;
    });

    if (currentIndex < text.length) {
      parts.push(text.substring(currentIndex));
    }

    return parts.length > 0 ? parts : text;
  };

  // Split content into lines and handle code blocks
  const lines = content.split('\n');
  const elements = [];
  let inCodeBlock = false;
  let codeBlockContent = [];
  let codeBlockLang = '';
  let inList = false;
  let listItems = [];
  let listType = 'ul';

  lines.forEach((line, index) => {
    // Code block handling
    if (line.startsWith('```')) {
      if (!inCodeBlock) {
        inCodeBlock = true;
        codeBlockLang = line.replace('```', '').trim();
        codeBlockContent = [];
      } else {
        inCodeBlock = false;
        elements.push(
          <pre key={`code-${index}`} className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto my-4">
            <code className="text-sm font-mono">{codeBlockContent.join('\n')}</code>
          </pre>
        );
        codeBlockContent = [];
      }
      return;
    }

    if (inCodeBlock) {
      codeBlockContent.push(line);
      return;
    }

    // List handling
    const isListItem = line.match(/^[\s]*[-*+]\s+/) || line.match(/^[\s]*\d+\.\s+/);
    const currentListType = line.match(/^[\s]*\d+\.\s+/) ? 'ol' : 'ul';

    if (isListItem) {
      if (!inList) {
        inList = true;
        listType = currentListType;
        listItems = [];
      }
      listItems.push(renderLine(line, index));
    } else {
      if (inList) {
        // Close the list
        elements.push(
          listType === 'ol' ? (
            <ol key={`list-${index}`} className="list-decimal ml-6 mb-4">
              {listItems}
            </ol>
          ) : (
            <ul key={`list-${index}`} className="list-disc ml-6 mb-4">
              {listItems}
            </ul>
          )
        );
        inList = false;
        listItems = [];
      }
      elements.push(renderLine(line, index));
    }
  });

  // Close any remaining list
  if (inList) {
    elements.push(
      listType === 'ol' ? (
        <ol key="list-final" className="list-decimal ml-6 mb-4">
          {listItems}
        </ol>
      ) : (
        <ul key="list-final" className="list-disc ml-6 mb-4">
          {listItems}
        </ul>
      )
    );
  }

  return <div className="markdown-content">{elements}</div>;
};

export default MarkdownRenderer;