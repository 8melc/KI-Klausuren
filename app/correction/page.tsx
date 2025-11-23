'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import UploadBox, { UploadResult } from '@/components/UploadBox';

const MAX_KLAUSUREN = 10;
const SUBJECT_OPTIONS = ['Mathematik', 'Deutsch', 'Chemie', 'Physik', 'Biologie'];
const GRADE_OPTIONS = ['5', '6', '7', '8', '9', '10', '11', '12', '13'];
const CLASS_OPTIONS = ['10A', '10B', '11A', '11B', '12A'];

interface CourseContext {
  subject: string;
  gradeLevel: string;
  className: string;
  schoolYear: string;
}

interface KlausurDoc {
  id: string;
  name: string;
  text: string;
  preview: string;
  size: number;
  subject: string;
  gradeLevel: string;
  className: string;
}

const steps = [
  { id: 1, title: 'Erwartungshorizont', description: 'Bewertungsraster oder Musterlösung als PDF hinterlegen' },
  { id: 2, title: 'Klausuren', description: 'Einzelne Schülerarbeiten als PDF hochladen' },
  { id: 3, title: 'Analyse starten', description: 'Bewertungen ansehen, korrigieren und exportieren' },
];

export default function CorrectionPage() {
  const [expectationText, setExpectationText] = useState<string | null>(() => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('erwartungshorizont');
  });
  const [klausuren, setKlausuren] = useState<KlausurDoc[]>(() => {
    if (typeof window === 'undefined') return [];
    const stored = localStorage.getItem('klausurDocs');
    if (!stored) return [];
    try {
      return JSON.parse(stored);
    } catch {
      return [];
    }
  });
  const [courseContext, setCourseContext] = useState<CourseContext>(() => {
    if (typeof window === 'undefined') {
      return { subject: SUBJECT_OPTIONS[0], gradeLevel: GRADE_OPTIONS[6], className: CLASS_OPTIONS[0], schoolYear: '2025/26' };
    }
    const stored = localStorage.getItem('courseContext');
    if (!stored) return { subject: SUBJECT_OPTIONS[0], gradeLevel: GRADE_OPTIONS[6], className: CLASS_OPTIONS[0], schoolYear: '2025/26' };
    try {
      return JSON.parse(stored);
    } catch {
      return { subject: SUBJECT_OPTIONS[0], gradeLevel: GRADE_OPTIONS[6], className: CLASS_OPTIONS[0], schoolYear: '2025/26' };
    }
  });
  const router = useRouter();

  const currentStep = useMemo(() => {
    if (expectationText && klausuren.length > 0) return 3;
    if (expectationText) return 2;
    return 1;
  }, [expectationText, klausuren.length]);

  const persistDocs = (docs: KlausurDoc[]) => {
    setKlausuren(docs);
    localStorage.setItem('klausurDocs', JSON.stringify(docs));
  };

  const updateCourseContext = (field: keyof CourseContext, value: string) => {
    const next = { ...courseContext, [field]: value };
    setCourseContext(next);
    localStorage.setItem('courseContext', JSON.stringify(next));
  };

  const handleExpectationUpload = (result: UploadResult) => {
    setExpectationText(result.text);
    localStorage.setItem('erwartungshorizont', result.text);
  };

  const handleKlausurUpload = (result: UploadResult) => {
    const doc: KlausurDoc = {
      id: typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function' ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`,
      name: result.filename || 'Klausur',
      text: result.text,
      preview: result.text.substring(0, 160),
      size: result.size,
      subject: courseContext.subject,
      gradeLevel: courseContext.gradeLevel,
      className: courseContext.className,
    };
    persistDocs([...klausuren, doc].slice(0, MAX_KLAUSUREN));
  };

  const handleRemoveKlausur = (id: string) => {
    persistDocs(klausuren.filter((doc) => doc.id !== id));
  };

  const handleStartAnalysis = () => {
    if (!expectationText || klausuren.length === 0) return;
    localStorage.setItem('autoAnalyze', '1');
    router.push('/results');
  };

  return (
    <section className="page-section">
      <div className="container">
        <div className="page-intro">
          <h1 className="page-intro-title">Korrektur starten</h1>
          <p className="page-intro-text">
            Wählen Sie Fach, Jahrgang und Klasse aus und laden Sie anschließend Erwartungshorizont
            sowie Klausuren hoch.
          </p>
        </div>

        <div className="course-selection">
          <label>
            Fach
            <select value={courseContext.subject} onChange={(e) => updateCourseContext('subject', e.target.value)}>
              {SUBJECT_OPTIONS.map((subject) => (
                <option key={subject} value={subject}>{subject}</option>
              ))}
            </select>
          </label>
          <label>
            Jahrgangsstufe
            <select value={courseContext.gradeLevel} onChange={(e) => updateCourseContext('gradeLevel', e.target.value)}>
              {GRADE_OPTIONS.map((grade) => (
                <option key={grade} value={grade}>{grade}</option>
              ))}
            </select>
          </label>
          <label>
            Klasse
            <select value={courseContext.className} onChange={(e) => updateCourseContext('className', e.target.value)}>
              {CLASS_OPTIONS.map((klass) => (
                <option key={klass} value={klass}>{klass}</option>
              ))}
            </select>
          </label>
          <label>
            Schuljahr
            <input
              type="text"
              value={courseContext.schoolYear}
              onChange={(e) => updateCourseContext('schoolYear', e.target.value)}
              placeholder="2025/26"
            />
          </label>
        </div>

        <div className="wizard-steps">
          {steps.map((step) => (
            <div key={step.id} className={`wizard-step ${currentStep === step.id ? 'wizard-step-active' : ''} ${currentStep > step.id ? 'wizard-step-complete' : ''}`}>
              <div className="wizard-step-number">{step.id}</div>
              <div>
                <p className="wizard-step-title">{step.title}</p>
                <p className="wizard-step-description">{step.description}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="upload-step" id="expectation-step">
          <div className="step-header">
            <span className="step-badge">Schritt 1</span>
            <h3 className="step-heading">Erwartungshorizont &amp; Kriterien</h3>
          </div>
          <UploadBox
            label="Erwartungshorizont"
            hint="PDF mit Bewertungsraster oder Musterlösung"
            buttonLabel={expectationText ? 'Erneut hochladen' : 'PDF auswählen'}
            onUploadComplete={handleExpectationUpload}
          />
          {expectationText && (
            <div className="status-card status-card-success">
              <div className="status-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="status-content-title">Erwartungshorizont bereit</p>
                <p className="status-content-text">{expectationText.substring(0, 180)}...</p>
              </div>
            </div>
          )}
        </div>

        <div className="upload-step" id="klausur-step">
          <div className="step-header">
            <span className="step-badge">Schritt 2</span>
            <h3 className="step-heading">Schülerklausuren hochladen</h3>
          </div>
          <UploadBox
            label="Klausuren hochladen"
            hint="Bis zu 10 PDFs pro Lauf"
            buttonLabel="Dateien auswählen"
            endpoint="/api/extract-klausur"
            allowMultiple
            maxFiles={MAX_KLAUSUREN}
            currentCount={klausuren.length}
            onUploadComplete={handleKlausurUpload}
          />
          {klausuren.length > 0 ? (
            <div className="student-list">
              <div className="student-list-header">
                <h4>Hochgeladene Arbeiten</h4>
                <span className="student-count">{klausuren.length}/{MAX_KLAUSUREN} Dateien</span>
              </div>
              {klausuren.map((doc) => (
                <div key={doc.id} className="student-item">
                  <div className="student-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div className="student-name-input">{doc.name}</div>
                  <button className="remove-button" type="button" onClick={() => handleRemoveKlausur(doc.id)}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="status-card status-card-info">
              <div className="status-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="status-content-title">Hinweis</p>
                <p className="status-content-text">
                  Nimm dir Zeit für jede Datei. Klassen- und Fachkontext wird automatisch gespeichert.
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="action-section wizard-actions">
          <button
            type="button"
            className="primary-button"
            onClick={handleStartAnalysis}
            disabled={!expectationText || klausuren.length === 0}
          >
            <span>Analyse starten</span>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </button>
          <p className="action-hint">
            Nach dem Start werden alle Arbeiten sequentiell analysiert und im Ergebnisbereich gelistet.
          </p>
        </div>
      </div>
    </section>
  );
}
