import React from 'react'

/**
 * Renders content that may contain HTML tags like <br>, <li>, <b>, <p>, <i> and &nbsp; entities
 * @param {string} content - The content to render, may contain various HTML tags and entities
 * @returns {React.ReactNode} - Rendered content with proper tag handling
 */
export const renderContentWithLineBreaks = (content) => {
  if (!content) return null
  
  // Handle string content with HTML tags and entities
  if (typeof content === 'string') {
    let processedContent = content
    
    // Process content inside curly braces {} - show as code, not rendered HTML
    // This handles cases like {<input type="text">} to show the code instead of the input tag
    processedContent = processedContent.replace(/\{([^}]*)\}/g, (match, innerContent) => {
      return '<code>' + innerContent.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;') + '</code>'
    })
    
    // Replace &nbsp; with non-breaking spaces
    processedContent = processedContent.replace(/&nbsp;/g, '\u00A0')
    
    // Handle <p> tags
    processedContent = processedContent.replace(/<p>(.*?)<\/p>/gs, '<p>$1</p>')
    
    // Handle <b> tags for bold text
    processedContent = processedContent.replace(/<b>(.*?)<\/b>/gs, '<strong>$1</strong>')
    
    // Handle <i> tags for italic text
    processedContent = processedContent.replace(/<i>(.*?)<\/i>/gs, '<em>$1</em>')
    
    // Add form handling to clear inputs when submit is clicked
    processedContent = processedContent.replace(/<form/g, '<form onsubmit="event.preventDefault(); this.reset();"')
    processedContent = processedContent.replace(/<button/g, '<button onclick="event.preventDefault(); this.form && this.form.reset();"')
    
    // Handle plain text lists with newlines
    // Look for lines that start with indentation or are simple list items
    const lines = processedContent.split('\n')
    let hasPlainList = false
    const processedLines = lines.map(line => {
      const trimmed = line.trim()
      if (trimmed && !trimmed.startsWith('<') && !trimmed.endsWith('>')) {
        // Check if this looks like a list item (starts with -, *, +, or number followed by .)
        if (trimmed.match(/^[-*+] /) || trimmed.match(/^\d+\. /)) {
          hasPlainList = true
          return `<li>${trimmed.replace(/^[-*+] |^\d+\. /, '')}</li>`
        } else if (trimmed && lines.length > 1) {
          // Check if this is part of a list based on context
          const prevLine = lines[lines.indexOf(line) - 1]?.trim()
          const nextLine = lines[lines.indexOf(line) + 1]?.trim()
          const isListContext = (prevLine && (prevLine.match(/^[-*+] /) || prevLine.match(/^\d+\. /) || prevLine === '</li>')) ||
                                (nextLine && (nextLine.match(/^[-*+] /) || nextLine.match(/^\d+\. /) || nextLine === '</li>'))
          
          if (isListContext && trimmed) {
            hasPlainList = true
            return `<li>${trimmed}</li>`
          }
        }
      }
      return line
    })
    
    processedContent = processedLines.join('\n')
    
    // Wrap list items in ul
    if (hasPlainList) {
      processedContent = processedContent.replace(
        /(<li>.*?<\/li>)/s, 
        '<ul style="list-style-type: disc; margin: 0; padding-left: 20px;">$1</ul>'
      )
    }
    
    // Handle <li> tags for list items
    // Ensure each <li> is properly wrapped in <ul> with solid disc styling
    const hasListItems = processedContent.includes('<li>')
    if (hasListItems) {
      // Check if already wrapped in ul/ol
      if (!processedContent.includes('<ul') && !processedContent.includes('<ol')) {
        // Find all <li>...</li> sequences and wrap them in a styled ul
        processedContent = processedContent.replace(
          /(<li>.*?<\/li>)/gs, 
          '<ul style="list-style-type: disc; margin: 0; padding-left: 20px;">$1</ul>'
        )
      } else {
        // If already in ul/ol, ensure it has the right styling
        processedContent = processedContent.replace(
          /<ul(\s*[^>]*)?>/g, 
          '<ul style="list-style-type: disc; margin: 0; padding-left: 20px;">'
        )
        processedContent = processedContent.replace(
          /<ol(\s*[^>]*)?>/g, 
          '<ol style="list-style-type: decimal; margin: 0; padding-left: 20px;">'
        )
      }
    }
    
    // Handle <br> tags
    processedContent = processedContent.replace(/<br\s*\/?>/gi, '<br>')
    
    // Handle newlines
    processedContent = processedContent.replace(/\n/g, '<br>')
    
     // Now render the processed content
    return (
      <span dangerouslySetInnerHTML={{ __html: processedContent }} />
    )
  }
  
  return content
}

/**
 * A component that wraps content and renders it with proper HTML tag handling
 * @param {string} children - The content to render
 * @returns {React.ReactNode} - Rendered content
 */
export const ContentWithLineBreaks = ({ children }) => {
  return <>{renderContentWithLineBreaks(children)}</>
}
