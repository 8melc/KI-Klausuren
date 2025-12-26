'use client';

import type { CourseInfo } from '@/types/results';

interface CourseSelectionBarProps {
  course: CourseInfo;
  onChange: (field: keyof CourseInfo, value: string) => void;
  subjectOptions: string[];
  gradeOptions: string[];
  classOptions: string[];
}

export default function CourseSelectionBar({
  course,
  onChange,
  subjectOptions,
  gradeOptions,
  classOptions,
}: CourseSelectionBarProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm space-y-3">
      <p className="text-sm font-semibold text-gray-500">Kursdaten</p>
      <div className="flex flex-wrap gap-4">
        <label className="flex-1 min-w-[180px] space-y-1">
          <span className="text-xs font-medium text-gray-600">Fach wählen</span>
          <select
            className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            value={course.subject}
            onChange={(event) => onChange('subject', event.target.value)}
          >
            <option value="">Fach wählen</option>
            {subjectOptions.map((subject) => (
              <option key={subject} value={subject}>
                {subject}
              </option>
            ))}
          </select>
        </label>
        <label className="flex-1 min-w-[140px] space-y-1">
          <span className="text-xs font-medium text-gray-600">Jahrgang wählen</span>
          <select
            className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            value={course.gradeLevel}
            onChange={(event) => onChange('gradeLevel', event.target.value)}
          >
            <option value="">Jahrgang wählen</option>
            {gradeOptions.map((grade) => (
              <option key={grade} value={grade}>
                {grade}
              </option>
            ))}
          </select>
        </label>
        <label className="flex-1 min-w-[140px] space-y-1">
          <span className="text-xs font-medium text-gray-600">Klasse wählen</span>
          <select
            className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            value={course.className}
            onChange={(event) => onChange('className', event.target.value)}
          >
            <option value="">Klasse wählen</option>
            {classOptions.map((klass) => (
              <option key={klass} value={klass}>
                {klass}
              </option>
            ))}
          </select>
        </label>
        <label className="flex-1 min-w-[140px] space-y-1">
          <span className="text-xs font-medium text-gray-600">Schuljahr</span>
          <input
            className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            value={course.schoolYear}
            onChange={(event) => onChange('schoolYear', event.target.value)}
            placeholder="2025/26"
          />
        </label>
      </div>
    </div>
  );
}
