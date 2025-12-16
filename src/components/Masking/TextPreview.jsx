import React, { useMemo } from 'react';
import './Masking.css';

const TextPreview = ({ text, maskingData }) => {
  // Logic to highlight text
  const highlightedText = useMemo(() => {
    if (!text) return 'No text preview available.';

    // Mapping keys to placeholders (must match backend 'masking.py')
    const fieldMap = {
      policyNumber: '[POLIZZA_XXX]',
      contractor: '[CONTRAENTE_XXX]',
      vat: '[PIVA_XXX]',
      fiscalCode: '[CF_XXX]',
      insured: '[ASSICURATO_XXX]'
    };

    // 1. Build a list of { value, placeholder } objects to search for
    const replacements = [];

    // Standard fields
    Object.entries(fieldMap).forEach(([key, placeholder]) => {
      const val = maskingData[key];
      if (val && val.trim().length > 2) {
        replacements.push({ value: val.trim(), placeholder, type: 'standard' });
      }
    });

    // Custom fields (other) - split by newline
    if (maskingData.other) {
      maskingData.other.split('\n').filter(Boolean).forEach((val, idx) => {
        if (val && val.trim().length > 2) {
          replacements.push({ value: val.trim(), placeholder: `[DATO_OSCURATO_${idx + 1}]`, type: 'other' });
        }
      });
    }

    if (replacements.length === 0) return text;

    // 2. Create a regex that matches ANY of the values
    // We sort by length desc to match longest first (avoid partial matches)
    replacements.sort((a, b) => b.value.length - a.value.length);

    // Escape regex chars
    const pattern = replacements.map(r => r.value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|');
    const regex = new RegExp(`(${pattern})`, 'gi');

    const parts = text.split(regex);

    return parts.map((part, i) => {
      // Find which replacement matches this part (case insensitive)
      const match = replacements.find(r => r.value.toLowerCase() === part.toLowerCase());

      if (match) {
        return (
          <span key={i} className="highlight-mask" title={`Originale: ${part}`}>
            {match.placeholder}
          </span>
        );
      }
      return part;
    });
  }, [text, maskingData]);

  return (
    <div className="text-preview-container">
      <div className="preview-header">
        <h4>Text Preview</h4>
        <span className="badge">Mono Mode</span>
      </div>
      <div className="preview-content">
        {highlightedText}
      </div>
    </div>
  );
};

export default TextPreview;