'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import UploadBox from '@/components/UploadBox';
import CourseSelectionCard from '@/components/CourseSelectionCard';
import StepHeader from '@/components/StepHeader';
import UploadedFilesList from '@/components/UploadedFilesList';
import AnalysisStartSection from '@/components/AnalysisStartSection';
import type { UploadedFile } from '@/components/UploadBox';
import { CourseInfo, StoredResultEntry, STORAGE_KEY } from '@/types/results';

const SUBJECT_OPTIONS = [
  'Mathematik',
  'Deutsch',
  'Englisch',
  'Französisch',
  'Spanisch',
  'Latein',
  'Chemie',
  'Physik',
  'Biologie',
  'Geschichte',
  'Geographie',
  'Politik',
  'Wirtschaft',
  'Philosophie',
  'Kunst',
  'Musik',
  'Sport',
  'Informatik',
  'Sonstiges',
];
const GRADE_OPTIONS = ['5', '6', '7', '8', '9', '10', '11', '12', '13'];
const CLASS_OPTIONS = ['A', 'B', 'C', 'D', 'E'];

// Berechnet das aktuelle Schuljahr basierend auf dem Datum
// Schuljahr läuft von August bis Juli (z.B. 2024/25)
const getCurrentSchoolYear = (): string => {
  const now = new Date();
  const month = now.getMonth() + 1; // 1-12
  const year = now.getFullYear();
  
  // Wenn wir ab August sind, startet das neue Schuljahr
  if (month >= 8) {
    return `${year}/${(year + 1).toString().slice(-2)}`;
  } else {
    // Vor August gehört es noch zum vorherigen Schuljahr
    return `${year - 1}/${year.toString().slice(-2)}`;
  }
};

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
  // Initialer State ohne localStorage/Date-Logik für SSR-Kompatibilität
  const [course, setCourse] = useState<CourseInfo>({
    subject: '',
    gradeLevel: '',
    className: '',
    schoolYear: '',
  });
  
  // useEffect für Client-seitige Initialisierung (nur auf Client)
  useEffect(() => {
    // Lade gespeicherte Kursdaten oder setze Standardwerte
    const stored = localStorage.getItem('courseContext');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setCourse({
          subject: parsed.subject || '',
          gradeLevel: parsed.gradeLevel || '',
          className: parsed.className || '',
          schoolYear: parsed.schoolYear || getCurrentSchoolYear(),
        });
      } catch {
        // Fallback bei Parse-Fehler
        setCourse((prev) => ({
          ...prev,
          schoolYear: getCurrentSchoolYear(),
        }));
      }
    } else {
      setCourse((prev) => ({
        ...prev,
        schoolYear: getCurrentSchoolYear(),
      }));
    }
  }, []);
  const [uploads, setUploads] = useState<UploadedFile[]>([]);
  const [expectationFileName, setExpectationFileName] = useState<string | null>(null);
  const [expectationText, setExpectationText] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState<{ current: number; total: number; currentFile: string } | null>(null);
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
    
    // Speichere auch in Supabase
    try {
      await fetch('/api/expectation-horizon', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileName: file.fileName,
          content: data.text,
        }),
      });
    } catch (error) {
      console.error('Fehler beim Speichern in Supabase:', error);
      // Nicht kritisch - localStorage funktioniert weiterhin
    }
    
    setErrorMessage(null);
  };

  const handleKlausurUpload = (files: UploadedFile[]) => {
    setUploads((prev) => [...prev, ...files].slice(0, 10));
  };

  const handleRemoveUpload = (id: string) => {
    setUploads((prev) => prev.filter((upload) => upload.id !== id));
  };

  const clearUploads = () => {
    setUploads([]);
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
    setIsAnalyzing(true);
    setAnalysisProgress({ current: 0, total: uploads.length, currentFile: '' });

    try {
      for (let i = 0; i < uploads.length; i++) {
        const upload = uploads[i];
        setAnalysisProgress({ current: i + 1, total: uploads.length, currentFile: upload.fileName });

        const entry = {
          id: upload.id,
          studentName: upload.fileName.replace(/\.pdf$/i, ''),
          status: 'Analyse läuft…' as const,
          fileName: upload.fileName,
          course,
        };

        appendToStorage(entry);
        
        // Speichere auch in Supabase
        try {
          const response = await fetch('/api/corrections', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(entry),
          });
          
          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error('Fehler beim Speichern in Supabase:', response.status, errorData);
          } else {
            console.log('Korrektur erfolgreich in Supabase gespeichert:', entry.id);
          }
        } catch (error) {
          console.error('Fehler beim Speichern in Supabase:', error);
          // Nicht kritisch - localStorage funktioniert weiterhin
        }

        const formData = new FormData();
        formData.append('file', upload.file);
        const extractResponse = await fetch('/api/extract-klausur', {
          method: 'POST',
          body: formData,
        });

        if (!extractResponse.ok) {
          updateStorageEntry(upload.id, { status: 'Fehler' });
          
          // Update in Supabase
          try {
            await fetch('/api/corrections', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                id: upload.id,
                studentName: upload.fileName.replace(/\.pdf$/i, ''),
                fileName: upload.fileName,
                course,
                status: 'Fehler',
              }),
            });
          } catch (error) {
            console.error('Fehler beim Update in Supabase:', error);
          }
          
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
        
        // Update in Supabase
        try {
          await fetch('/api/corrections', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              id: upload.id,
              studentName: upload.fileName.replace(/\.pdf$/i, ''),
              fileName: upload.fileName,
              course,
              status: 'Fehler',
            }),
          });
        } catch (error) {
          console.error('Fehler beim Update in Supabase:', error);
        }
        
        continue;
      }

      const analysis = await analysisResponse.json();
      updateStorageEntry(upload.id, { status: 'Bereit', analysis });
      
      // Update in Supabase
      try {
        await fetch('/api/corrections', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: upload.id,
            studentName: upload.fileName.replace(/\.pdf$/i, ''),
            fileName: upload.fileName,
            course,
            status: 'Bereit',
            analysis,
          }),
        });
      } catch (error) {
        console.error('Fehler beim Update in Supabase:', error);
      }
      }

      clearUploads();
      router.push('/results');
    } catch (error) {
      setErrorMessage('Ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut.');
      setIsAnalyzing(false);
      setAnalysisProgress(null);
    }
  };

  return (
    <section className="module-section">
      <div className="container">
        <h2 className="section-title">Korrekturprozess: Upload & Analyse</h2>
        <p className="section-description">
          Kursdaten wählen, Erwartungshorizont und Klausuren hochladen, anschließend Analyse starten.
        </p>

        <div className="module-grid" style={{ marginBottom: 'var(--spacing-2xl)' }}>
          <div className="module-card">
            <h3>Kursdaten</h3>
            <div style={{ marginTop: 'var(--spacing-lg)' }}>
              <CourseSelectionCard
                course={course}
                onChange={handleCourseChange}
                subjectOptions={SUBJECT_OPTIONS}
                gradeOptions={GRADE_OPTIONS}
                classOptions={CLASS_OPTIONS}
              />
            </div>
            {!isCourseComplete && (
              <p style={{ marginTop: 'var(--spacing-md)', color: 'var(--color-error)', fontSize: '0.875rem' }}>
                Bitte wählen Sie zuerst Fach, Jahrgangsstufe, Klasse und Schuljahr aus.
              </p>
            )}
          </div>
        </div>

        <div className="process-grid" style={{ marginBottom: 'var(--spacing-2xl)' }}>
          <div className="process-card">
            <h3>Schritt 1 – Erwartungshorizont</h3>
            <p style={{ marginBottom: 'var(--spacing-lg)' }}>
              Hinterlegen Sie das Raster, nach dem die KI bewerten soll.
            </p>
            <UploadBox
              title="Erwartungshorizont"
              description="PDF mit Bewertungsraster oder Musterlösung"
              buttonLabel="Datei auswählen"
              onUpload={handleExpectationUpload}
              disabled={!isCourseComplete}
            />
            {expectationFileName && (
              <div style={{ marginTop: 'var(--spacing-lg)', padding: 'var(--spacing-md)', background: 'var(--color-success-light)', border: '1px solid var(--color-success)', borderRadius: 'var(--radius-lg)', color: 'var(--color-success-dark)' }}>
                ✓ Erwartungshorizont erfolgreich hochgeladen – {expectationFileName}
              </div>
            )}
          </div>

          <div className="process-card">
            <h3>Schritt 2 – Schülerklausuren</h3>
            <p style={{ marginBottom: 'var(--spacing-lg)' }}>
              Bis zu 10 PDFs pro Lauf hochladen.
            </p>
            <UploadBox
              title="Klausuren hochladen"
              description="Bis zu 10 PDFs pro Lauf"
              buttonLabel="Dateien auswählen"
              allowMultiple
              onUpload={handleKlausurUpload}
              disabled={!isCourseComplete}
            />
            {uploads.length > 0 && (
              <div style={{ marginTop: 'var(--spacing-lg)' }}>
                <UploadedFilesList files={uploads} onRemove={handleRemoveUpload} />
              </div>
            )}
          </div>
        </div>

        <div style={{ marginTop: 'var(--spacing-2xl)' }}>
          <AnalysisStartSection
            disabled={!isCourseComplete || !expectationText || uploads.length === 0 || isAnalyzing}
            onStart={handleStartAnalysis}
            error={errorMessage}
            isAnalyzing={isAnalyzing}
            progress={analysisProgress}
          />
        </div>
      </div>
    </section>
  );
}
