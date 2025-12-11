'use client';

import { useState, useEffect } from 'react';
import type { CourseInfo } from '@/types/results';

interface CourseSelectionCardProps {
  course: CourseInfo;
  onChange: (field: keyof CourseInfo, value: string) => void;
  subjectOptions: string[];
  gradeOptions: string[];
  classOptions: string[];
  blinkingField?: keyof CourseInfo | null;
}

export default function CourseSelectionCard({
  course,
  onChange,
  subjectOptions,
  gradeOptions,
  classOptions,
  blinkingField,
}: CourseSelectionCardProps) {
  const [isCustomMode, setIsCustomMode] = useState(false);
  const [isBlinking, setIsBlinking] = useState(false);
  
  useEffect(() => {
    if (blinkingField) {
      setIsBlinking(true);
      const interval = setInterval(() => {
        setIsBlinking((prev) => !prev);
      }, 300);
      
      const timeout = setTimeout(() => {
        clearInterval(interval);
        setIsBlinking(false);
      }, 2000);
      
      return () => {
        clearInterval(interval);
        clearTimeout(timeout);
      };
    } else {
      setIsBlinking(false);
    }
  }, [blinkingField]);
  
  const getFieldClass = (field: keyof CourseInfo) => {
    const baseClass = 'w-full rounded-xl border px-3 py-2 text-sm font-medium outline-none transition-all duration-300';
    const isFieldBlinking = blinkingField === field && isBlinking;
    
    if (isFieldBlinking) {
      return `${baseClass} border-red-500 ring-2 ring-red-500 bg-red-50 text-gray-700`;
    }
    return `${baseClass} border-gray-300 text-gray-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500`;
  };
  
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
            className={getFieldClass('subject')}
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
              className={getFieldClass('subject')}
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
            className={getFieldClass('gradeLevel')}
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
            className={getFieldClass('className')}
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
            className={getFieldClass('schoolYear')}
            value={course.schoolYear}
            onChange={(event) => onChange('schoolYear', event.target.value)}
            placeholder="2025/26"
          />
        </div>
    </div>
  );
}
