'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import UploadBox, { UploadedFile } from '@/components/UploadBox';
import { CourseInfo, StoredResultEntry, STORAGE_KEY } from '@/types/results';

const SUBJECT_OPTIONS = ['Mathematik', 'Deutsch', 'Chemie', 'Physik', 'Biologie'];
const GRADE_OPTIONS = ['5', '6', '7', '8', '9', '10', '11', '12', '13'];
const CLASS_OPTIONS = ['10A', '10B', '11A', '11B', '12A'];

const appendToStorage = (entry: StoredResultEntry) => {
  const stored = localStorage.getItem(STORAGE_KEY);
  const list: StoredResultEntry[] = stored ? JSON.parse(stored) : [];
  const filtered = list.filter((item) => item.id !== entry.id);
  const next = [...filtered, entry];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
};

const updateStorageEntry = (id: string, patch: Partial<StoredResultEntry>) => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return;
  const list: StoredResultEntry[] = JSON.parse(stored);
  const next = list.map((item) => (item.id === id ? { ...item, ...patch } : item));
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
};

export default function CorrectionPage() {
  const [course, setCourse] = useState<CourseInfo>({
    subject: '',
    gradeLevel: '',
    className: '',
    schoolYear: '',
  });
  const [uploads, setUploads] = useState<UploadedFile[]>([]);
  const [expectationFileName, setExpectationFileName] = useState<string | null>(null);
  const [expectationText, setExpectationText] = useState<string | null>(null);
  const [successUploads, setSuccessUploads] = useState<string[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const router = useRouter();

  const isCourseComplete =
    Boolean(course.subject) &&
    Boolean(course.gradeLevel) &&
    Boolean(course.className) &&
    Boolean(course.schoolYear);

  const handleCourseChange = (field: keyof CourseInfo, value: string) => {
    const next = { ...course, [field]: value };
    setCourse(next);
    localStorage.setItem('courseContext', JSON.stringify(next));
  };

  const handleExpectationUpload = async (files: UploadedFile[]) => {
    if (!files.length) return;
    const file = files[0];
    setExpectationFileName(file.fileName);

    const formData = new FormData();
    formData.append('file', file.file);

    const response = await fetch('/api/extract', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      setErrorMessage('Der Erwartungshorizont konnte nicht extrahiert werden.');
      return;
    }

    const data = await response.json();
    setExpectationText(data.text);
    localStorage.setItem('erwartungshorizont', data.text);
    setErrorMessage(null);
  };

  const handleKlausurUpload = (files: UploadedFile[]) => {
    setUploads((prev) => [...prev, ...files].slice(0, 10));
    setSuccessUploads(files.map((file) => file.fileName));
  };

  const clearUploads = () => {
    setUploads([]);
    setSuccessUploads([]);
  };

  const handleStartAnalysis = async () => {
    if (!isCourseComplete) {
      setErrorMessage('Bitte wählen Sie Fach, Jahrgangsstufe, Klasse und Schuljahr.');
      return;
    }
    if (!expectationText) {
      setErrorMessage('Bitte laden Sie zuerst den Erwartungshorizont hoch.');
      return;
    }
    if (uploads.length === 0) {
      setErrorMessage('Bitte laden Sie mindestens eine Klausur hoch.');
      return;
    }

    setErrorMessage(null);

    for (const upload of uploads) {
      appendToStorage({
        id: upload.id,
        studentName: upload.fileName.replace(/\.pdf$/i, ''),
        status: 'Analyse läuft…',
        fileName: upload.fileName,
        course,
      });

      const formData = new FormData();
      formData.append('file', upload.file);
      const extractResponse = await fetch('/api/extract-klausur', {
        method: 'POST',
        body: formData,
      });

      if (!extractResponse.ok) {
        updateStorageEntry(upload.id, { status: 'Fehler' });
        continue;
      }

      const extracted = await extractResponse.json();
      const analysisResponse = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          klausurText: extracted.text,
          erwartungshorizont: expectationText,
        }),
      });

      if (!analysisResponse.ok) {
        updateStorageEntry(upload.id, { status: 'Fehler' });
        continue;
      }

      const analysis = await analysisResponse.json();
      updateStorageEntry(upload.id, { status: 'Bereit', analysis });
    }

    clearUploads();
    router.push('/results');
  };

  return (
    <section className="page-section">
      <div className="container">
        <div className="page-intro">
          <h1 className="page-intro-title">Korrekturprozess</h1>
          <p className="page-intro-text">
            Wähle Kursdaten aus, lade Erwartungshorizont und Klausuren hoch und starte anschließend die Analyse.
          </p>
        </div>

        {!isCourseComplete && (
          <div className="text-red-600 mb-4">
            Bitte wählen Sie zuerst Fach, Jahrgangsstufe, Klasse und Schuljahr aus.
          </div>
        )}

        <div className="course-selection mb-6">
          <label>
            Fach
            <select value={course.subject} onChange={(e) => handleCourseChange('subject', e.target.value)}>
              <option value="">Fach wählen</option>
              {SUBJECT_OPTIONS.map((subject) => (
                <option key={subject} value={subject}>
                  {subject}
                </option>
              ))}
            </select>
          </label>
          <label>
            Jahrgangsstufe
            <select value={course.gradeLevel} onChange={(e) => handleCourseChange('gradeLevel', e.target.value)}>
              <option value="">Jahrgang wählen</option>
              {GRADE_OPTIONS.map((grade) => (
                <option key={grade} value={grade}>
                  {grade}
                </option>
              ))}
            </select>
          </label>
          <label>
            Klasse
            <select value={course.className} onChange={(e) => handleCourseChange('className', e.target.value)}>
              <option value="">Klasse wählen</option>
              {CLASS_OPTIONS.map((klass) => (
                <option key={klass} value={klass}>
                  {klass}
                </option>
              ))}
            </select>
          </label>
          <label>
            Schuljahr
            <input
              type="text"
              value={course.schoolYear}
              onChange={(e) => handleCourseChange('schoolYear', e.target.value)}
              placeholder="2025/26"
            />
          </label>
        </div>

        <div className="upload-step">
          <h2 className="section-title">Schritt 1 – Erwartungshorizont</h2>
          <UploadBox
            label="PDF mit Bewertungsraster"
            onUpload={handleExpectationUpload}
            disabled={!isCourseComplete}
          />
          {expectationFileName && (
            <div className="status-card status-card-success mt-3">
              <p>Erwartungshorizont erfolgreich hochgeladen</p>
              <p>Datei: {expectationFileName}</p>
            </div>
          )}
        </div>

        <div className="upload-step mt-6">
          <h2 className="section-title">Schritt 2 – Schülerklausuren</h2>
          <UploadBox
            allowMultiple
            label="Klausuren (max. 10)"
            buttonLabel="Dateien auswählen"
            onUpload={handleKlausurUpload}
            disabled={!isCourseComplete}
          />
          {successUploads.map((name) => (
            <div key={name} className="status-card status-card-success mt-2">
              <p>Klausur erfolgreich hochgeladen</p>
              <p>{name}</p>
            </div>
          ))}
        </div>

        <div className="action-section mt-6">
          <button
            type="button"
            className="primary-button"
            disabled={!isCourseComplete || !expectationText || uploads.length === 0}
            onClick={handleStartAnalysis}
          >
            Analyse starten
          </button>
          {errorMessage && <p className="text-red-600 mt-2">{errorMessage}</p>}
        </div>
      </div>
    </section>
  );
}
