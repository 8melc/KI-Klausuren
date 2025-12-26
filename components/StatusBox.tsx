'use client';

interface StatusBoxProps {
  title: string;
  detail: string;
}

export default function StatusBox({ title, detail }: StatusBoxProps) {
  return (
    <div className="rounded-2xl border border-green-200 bg-green-50 p-4 text-sm text-green-900 shadow-sm">
      <p className="font-semibold">{title}</p>
      <p className="text-xs mt-1 text-green-800">{detail}</p>
    </div>
  );
}
