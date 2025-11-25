'use client';

interface StepHeaderProps {
  stepNumber: number;
  title: string;
  subtitle?: string;
}

export default function StepHeader({ stepNumber, title, subtitle }: StepHeaderProps) {
  return (
    <div className="flex items-center gap-3">
      <div className="rounded-full bg-blue-100 text-blue-700 w-10 h-10 flex items-center justify-center font-semibold">
        {stepNumber}
      </div>
      <div>
        <p className="text-sm font-semibold text-gray-600">Schritt {stepNumber}</p>
        <h2 className="text-xl font-bold text-gray-900">{title}</h2>
        {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
      </div>
    </div>
  );
}
