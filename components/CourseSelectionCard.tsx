'use client'

import { useState, useEffect } from 'react'
import Combobox from './Combobox'
import { getSubjectSuggestions, getGradeSuggestions, getClassSuggestions, enrichOptionsWithOberstufe } from '@/lib/course-suggestions'
import type { CourseInfo } from '@/types/results'

interface CourseSelectionCardProps {
  course: CourseInfo
  onChange: (field: keyof CourseInfo, value: string) => void
  subjectOptions: string[]
  gradeOptions: string[]
  classOptions: string[]
  blinkingField?: keyof CourseInfo | null
}

export default function CourseSelectionCard({ 
  course, 
  onChange, 
  subjectOptions, 
  gradeOptions, 
  classOptions, 
  blinkingField 
}: CourseSelectionCardProps) {
  const [isBlinking, setIsBlinking] = useState(false)

  useEffect(() => {
    if (blinkingField) {
      setIsBlinking(true)
      const timeout = setTimeout(() => setIsBlinking(false), 2000)
      return () => clearTimeout(timeout)
    }
  }, [blinkingField])

  const getFieldClass = (field: keyof CourseInfo) => {
    const isFieldBlinking = blinkingField === field && isBlinking
    if (isFieldBlinking) {
      return 'border-red-500 ring-2 ring-red-500 bg-red-50 animate-pulse'
    }
    return ''
  }

  // Enrich options with Oberstufe variants
  const enrichedSubjectOptions = enrichOptionsWithOberstufe(
    subjectOptions.filter(s => s !== 'Sonstiges'), 
    'subject'
  )
  const enrichedGradeOptions = enrichOptionsWithOberstufe(gradeOptions, 'grade')
  const enrichedClassOptions = enrichOptionsWithOberstufe(classOptions, 'class')

  const subjectSuggestions = (input: string) => getSubjectSuggestions(input, enrichedSubjectOptions)
  const gradeSuggestions = (input: string) => getGradeSuggestions(input, enrichedGradeOptions)
  const classSuggestions = (input: string) => getClassSuggestions(input, enrichedClassOptions)

  return (
    <div className="flex flex-wrap gap-6">
      <div className="flex-1 min-w-[180px]">
        <Combobox
          value={course.subject}
          onChange={(value) => onChange('subject', value)}
          options={enrichedSubjectOptions}
          placeholder="Fach wählen oder eingeben"
          label="Fach"
          suggestions={subjectSuggestions}
          allowCustom
          inputClassName={getFieldClass('subject')}
        />
      </div>
      
      <div className="flex-1 min-w-[140px]">
        <Combobox
          value={course.gradeLevel}
          onChange={(value) => onChange('gradeLevel', value)}
          options={enrichedGradeOptions}
          placeholder="Jahrgang wählen oder eingeben"
          label="Jahrgang"
          suggestions={gradeSuggestions}
          allowCustom
          inputClassName={getFieldClass('gradeLevel')}
        />
      </div>
      
      <div className="flex-1 min-w-[140px]">
        <Combobox
          value={course.className}
          onChange={(value) => onChange('className', value)}
          options={enrichedClassOptions}
          placeholder="Klasse wählen oder eingeben"
          label="Klasse/Kurs"
          suggestions={classSuggestions}
          allowCustom
          inputClassName={getFieldClass('className')}
        />
      </div>
      
      <div className="flex-1 min-w-[140px] space-y-2">
        <p className="text-xs font-semibold uppercase text-gray-500 mb-2">Schuljahr</p>
        <input
          className={`w-full rounded-xl border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all h-12 bg-white shadow-sm hover:border-blue-400 ${course.schoolYear ? 'text-gray-900' : 'text-gray-400'} ${getFieldClass('schoolYear' as any)}`}
          value={course.schoolYear}
          onChange={(e) => onChange('schoolYear' as any, e.target.value)}
          placeholder="2025/26"
        />
      </div>
    </div>
  )
}
