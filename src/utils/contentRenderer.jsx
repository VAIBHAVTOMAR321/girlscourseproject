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
    
    // First, escape all HTML tags completely
    processedContent = processedContent.replace(/&/g, '&amp;')
    processedContent = processedContent.replace(/</g, '&lt;')
    processedContent = processedContent.replace(/>/g, '&gt;')
    
    // Then, selectively unescape only the tags we want to preserve
    // This way, all other tags remain escaped and are displayed as text
    const tagsToPreserve = [
      { search: /&lt;br\s*\/?&gt;/gi, replace: '<br>' },
      { search: /&lt;p&gt;(.*?)&lt;\/p&gt;/gs, replace: '<p>$1</p>' },
      { search: /&lt;b&gt;(.*?)&lt;\/b&gt;/gs, replace: '<strong>$1</strong>' },
      { search: /&lt;i&gt;(.*?)&lt;\/i&gt;/gs, replace: '<em>$1</em>' },
      { search: /&lt;strong&gt;(.*?)&lt;\/strong&gt;/gs, replace: '<strong>$1</strong>' },
      { search: /&lt;em&gt;(.*?)&lt;\/em&gt;/gs, replace: '<em>$1</em>' },
      { search: /&lt;li&gt;(.*?)&lt;\/li&gt;/gs, replace: '<li>$1</li>' },
      { search: /&lt;ul(\s*[^&gt;]*)&gt;/g, replace: '<ul style="list-style-type: disc; margin: 0; padding-left: 20px;">' },
      { search: /&lt;\/ul&gt;/g, replace: '</ul>' },
      { search: /&lt;ol(\s*[^&gt;]*)&gt;/g, replace: '<ol style="list-style-type: decimal; margin: 0; padding-left: 20px;">' },
      { search: /&lt;\/ol&gt;/g, replace: '</ol>' }
    ]
    
    tagsToPreserve.forEach(({ search, replace }) => {
      processedContent = processedContent.replace(search, replace)
    })
    
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
    
    // Handle special characters like { and }
    processedContent = processedContent.replace(/\{/g, '&#123;').replace(/\}/g, '&#125;')
    
    // Replace &nbsp; with non-breaking spaces
    processedContent = processedContent.replace(/&nbsp;/g, '\u00A0')
    
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
