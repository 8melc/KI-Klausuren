'use client';

import { useState } from 'react';
import type { CourseInfo } from '@/types/results';

interface CourseSelectionCardProps {
  course: CourseInfo;
  onChange: (field: keyof CourseInfo, value: string) => void;
  subjectOptions: string[];
  gradeOptions: string[];
  classOptions: string[];
}

export default function CourseSelectionCard({
  course,
  onChange,
  subjectOptions,
  gradeOptions,
  classOptions,
}: CourseSelectionCardProps) {
  const [isCustomMode, setIsCustomMode] = useState(false);
  
  const fieldClass =
    'w-full rounded-xl border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500';
  
  // Prüfe, ob das aktuelle Fach in der Standardliste ist (ohne "Sonstiges")
  const standardSubjects = subjectOptions.filter(s => s !== 'Sonstiges');
  const isStandardSubject = course.subject && standardSubjects.includes(course.subject);
  const showCustomInput = isCustomMode || (course.subject && !isStandardSubject && course.subject !== '');
  
  const handleSubjectChange = (value: string) => {
    if (value === 'Sonstiges') {
      // "Sonstiges" ausgewählt - aktiviere Custom-Modus
      setIsCustomMode(true);
      onChange('subject', '');
    } else if (value !== '') {
      // Standard-Fach ausgewählt
      setIsCustomMode(false);
      onChange('subject', value);
    } else {
      // Leer ausgewählt
      setIsCustomMode(false);
      onChange('subject', '');
    }
  };
  
  const handleCustomSubjectChange = (value: string) => {
    // Direkt den Wert setzen - Custom-Modus bleibt aktiv
    onChange('subject', value);
    if (value === '') {
      setIsCustomMode(false);
    }
  };

  return (
    <div className="flex flex-wrap gap-6">
        <div className="flex-1 min-w-[180px] space-y-2">
          <p className="text-xs font-semibold uppercase text-gray-500">Fach</p>
          <select
            className={fieldClass}
            value={isStandardSubject ? course.subject : showCustomInput ? 'Sonstiges' : course.subject || ''}
            onChange={(event) => handleSubjectChange(event.target.value)}
          >
            <option value="">Fach wählen</option>
            {subjectOptions.map((subject) => (
              <option key={subject} value={subject}>
                {subject}
              </option>
            ))}
          </select>
          {showCustomInput && (
            <input
              type="text"
              className={fieldClass}
              placeholder="Eigenes Fach eingeben"
              value={course.subject || ''}
              onChange={(event) => handleCustomSubjectChange(event.target.value)}
              style={{ marginTop: 'var(--spacing-xs)' }}
              autoFocus={isCustomMode}
            />
          )}
        </div>
        <div className="flex-1 min-w-[140px] space-y-2">
          <p className="text-xs font-semibold uppercase text-gray-500">Jahrgang</p>
          <select
            className={fieldClass}
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
        </div>
        <div className="flex-1 min-w-[140px] space-y-2">
          <p className="text-xs font-semibold uppercase text-gray-500">Klasse</p>
          <select
            className={fieldClass}
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
        </div>
        <div className="flex-1 min-w-[140px] space-y-2">
          <p className="text-xs font-semibold uppercase text-gray-500">Schuljahr</p>
          <input
            className={fieldClass}
            value={course.schoolYear}
            onChange={(event) => onChange('schoolYear', event.target.value)}
            placeholder="2025/26"
          />
        </div>
    </div>
  );
}
