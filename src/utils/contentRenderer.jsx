import React from 'react'

/**
 * Renders content that may contain <br> tags as actual line breaks
 * @param {string} content - The content to render, may contain <br>, <br/>, or <br /> tags
 * @returns {React.ReactNode} - Rendered content with proper line breaks
 */
export const renderContentWithLineBreaks = (content) => {
  if (!content) return null
  
  // Handle string content with <br> tags
  if (typeof content === 'string') {
    // Split by various <br> tag formats: <br>, <br/>, <br />
    const parts = content.split(/<br\s*\/?>/gi)
    
    return parts.map((part, index) => (
      <React.Fragment key={index}>
        {part}
        {index < parts.length - 1 && <br />}
      </React.Fragment>
    ))
  }
  
  return content
}

/**
 * A component that wraps content and renders it with proper line break handling
 * @param {string} children - The content to render
 * @returns {React.ReactNode} - Rendered content
 */
export const ContentWithLineBreaks = ({ children }) => {
  return <>{renderContentWithLineBreaks(children)}</>
}
