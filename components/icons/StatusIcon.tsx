'use client';

interface StatusIconProps {
  type: 'check' | 'clock' | 'x' | 'question';
  className?: string;
  style?: React.CSSProperties;
}

export default function StatusIcon({ type, className, style }: StatusIconProps) {
  const svgProps = { className, style, fill: 'none' as const, viewBox: '0 0 24 24', stroke: 'currentColor' as const };
  
  switch (type) {
    case 'check':
      return (
        <svg {...svgProps}>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      );
    case 'clock':
      return (
        <svg {...svgProps}>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
    case 'x':
      return (
        <svg {...svgProps}>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      );
    case 'question':
      return (
        <svg {...svgProps}>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
  }
}
