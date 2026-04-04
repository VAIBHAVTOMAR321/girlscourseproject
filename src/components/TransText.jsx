import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { getTranslation } from '../utils/translations';

/**
 * TransText Component - Reusable translation wrapper
 * 
 * Usage:
 *   <TransText k="dashboard.title" />
 *   <TransText k="button.submit" className="btn btn-primary" />
 *   <TransText k="feedback.question1" as="label" htmlFor="q1" />
 * 
 * Props:
 *   - k: Translation key (required)
 *   - as: HTML tag to render as (optional, defaults to 'span')
 *   - className: CSS classes to apply (optional)
 *   - Other props: spread to the rendered element
 */
export const TransText = ({ k, as: Component = 'span', className = '', ...props }) => {
  const { language } = useLanguage();
  const translatedText = getTranslation(k, language);

  return (
    <Component className={className} {...props}>
      {translatedText}
    </Component>
  );
};

export default TransText;
