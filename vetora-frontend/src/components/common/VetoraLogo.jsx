import React from 'react';

/**
 * Vetora brand mark — a monogram "V" with a small pulse/paw-pad dot,
 * evoking a heartbeat pulse (pet health) rather than a generic paw icon.
 * Renders as an SVG so it scales crisply at any size.
 */
const VetoraLogo = ({ className = 'w-5 h-5' }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
    <path
      d="M3.5 4.5L10.8 16.2L12.2 13.4"
      stroke="currentColor"
      strokeWidth="2.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M20.5 4.5L13.2 16.2"
      stroke="currentColor"
      strokeWidth="2.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <circle cx="11.9" cy="19" r="1.7" fill="currentColor" />
  </svg>
);

export default VetoraLogo;
