'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import UploadBox from '@/components/UploadBox';
import CourseSelectionCard from '@/components/CourseSelectionCard';
import StepHeader from '@/components/StepHeader';
import UploadedFilesList from '@/components/UploadedFilesList';
import AnalysisStartSection from '@/components/AnalysisStartSection';
import type { UploadedFile } from '@/components/UploadBox';
import { CourseInfo, StoredResultEntry, STORAGE_KEY, ResultStatus } from '@/types/results';
import { ensureValidSession } from '@/lib/supabase/session-validator';

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
  if (!stored) {
    console.warn('updateStorageEntry: kein Eintrag im localStorage gefunden', { id, patch });
    return;
  }
  let list: StoredResultEntry[] = [];
  try {
    list = JSON.parse(stored);
  } catch (error) {
    console.error('updateStorageEntry: JSON.parse fehlgeschlagen', error);
    return;
  }
  const next = list.map((item) =>
    item.id === id
      ? {
          ...item,
          ...patch,
          // Sicherheitsnetz: Status & Analyse müssen nach der Analyse wirklich gesetzt sein
          status: (patch.status as ResultStatus) ?? item.status,
          analysis: patch.analysis ?? item.analysis,
        }
      : item
  );
  console.log('updateStorageEntry: aktualisierte Liste', next);
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

  // Helper-Funktion für 2-Schritt-Upload zu Supabase Storage
  const uploadFileToStorage = async (file: File): Promise<{ fileKey: string } | null> => {
    try {
      // Schritt 1: Hole Upload-URL
      const urlResponse = await fetch('/api/upload-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileName: file.name,
          fileType: file.type,
        }),
      });

      if (!urlResponse.ok) {
        const errorData = await urlResponse.json().catch(() => ({ error: 'Unbekannter Fehler' }));
        throw new Error(errorData.error || `HTTP ${urlResponse.status}`);
      }

      const urlData = await urlResponse.json();
      const { uploadUrl, fileKey, token, method, warning } = urlData;

      if (warning) {
        console.warn('Upload-URL Warnung:', warning);
      }

      // Schritt 2: Lade Datei direkt zu Supabase Storage
      const uploadMethod = method || 'PUT';
      const uploadResponse = await fetch(uploadUrl, {
        method: uploadMethod,
        headers: {
          'Content-Type': file.type,
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
        body: file,
      });

      if (!uploadResponse.ok) {
        throw new Error(`Upload fehlgeschlagen: ${uploadResponse.status} ${uploadResponse.statusText}`);
      }

      return { fileKey };
    } catch (error) {
      console.error('Fehler beim Upload zu Supabase Storage:', error);
      throw error;
    }
  };

  const handleExpectationUpload = async (files: UploadedFile[]) => {
    if (!files.length) return;
    const file = files[0];
    setExpectationFileName(file.fileName);

    // 1. SESSION VALIDIERUNG vor Supabase-Call
    const { session, error: sessionError } = await ensureValidSession();
    
    if (sessionError || !session) {
      const errorMsg = sessionError?.message || 'Deine Sitzung ist abgelaufen. Bitte melde dich neu an.';
      setErrorMessage(errorMsg);
      toast.error(errorMsg);
      router.push('/');
      return;
    }

    try {
      // 2. Upload zu Supabase Storage
      toast.info('Lade Erwartungshorizont hoch...');
      const uploadResult = await uploadFileToStorage(file.file);
      
      if (!uploadResult) {
        setErrorMessage('Upload fehlgeschlagen');
        return;
      }

      // 3. Rufe Extract-API mit fileKey auf
      toast.info('Extrahiere Text aus PDF...');
      const response = await fetch('/api/extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileKey: uploadResult.fileKey }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unbekannter Fehler' }));
        setErrorMessage(errorData.error || 'Der Erwartungshorizont konnte nicht extrahiert werden.');
        return;
      }

      const data = await response.json();
      setExpectationText(data.text);
      localStorage.setItem('erwartungshorizont', data.text);
      
      // Speichere auch in Supabase (Session ist jetzt garantiert gültig)
      try {
        const saveResponse = await fetch('/api/expectation-horizon', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            fileName: file.fileName,
            content: data.text,
          }),
        });
        
        if (!saveResponse.ok) {
          const errorData = await saveResponse.json().catch(() => ({}));
          console.error('Fehler beim Speichern in Supabase:', saveResponse.status, errorData);
          // Nicht kritisch - localStorage funktioniert weiterhin
        }
      } catch (error) {
        console.error('Fehler beim Speichern in Supabase:', error);
        // Nicht kritisch - localStorage funktioniert weiterhin
      }
      
      toast.success('Erwartungshorizont erfolgreich hochgeladen');
      setErrorMessage(null);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Fehler beim Upload';
      setErrorMessage(errorMsg);
      toast.error(errorMsg);
    }
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

    // 1. SESSION VALIDIERUNG vor Supabase-Calls
    const { session, error: sessionError } = await ensureValidSession();
    
    if (sessionError || !session) {
      const errorMsg = sessionError?.message || 'Deine Sitzung ist abgelaufen. Bitte melde dich neu an.';
      setErrorMessage(errorMsg);
      toast.error(errorMsg);
      router.push('/');
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
            const errorData: unknown = await response.json().catch(() => ({}));
            console.error('Fehler beim Speichern in Supabase:', response.status, errorData);
          } else {
            console.log('Korrektur erfolgreich in Supabase gespeichert:', entry.id);
          }
        } catch (error) {
          console.error('Fehler beim Speichern in Supabase:', error);
          // Nicht kritisch - localStorage funktioniert weiterhin
        }

        // 2-Schritt-Upload: Zuerst zu Supabase Storage, dann Extract mit fileKey
        console.log(`[${upload.fileName}] Starte Upload zu Supabase Storage...`);
        setAnalysisProgress({ 
          current: i + 1, 
          total: uploads.length, 
          currentFile: `${upload.fileName} (Upload läuft...)` 
        });
        
        let fileKey: string;
        try {
          const uploadResult = await uploadFileToStorage(upload.file);
          if (!uploadResult) {
            throw new Error('Upload fehlgeschlagen - keine fileKey erhalten');
          }
          fileKey = uploadResult.fileKey;
          console.log(`[${upload.fileName}] Upload erfolgreich, fileKey:`, fileKey);
        } catch (uploadError) {
          const errorMsg = uploadError instanceof Error ? uploadError.message : 'Upload fehlgeschlagen';
          console.error(`[${upload.fileName}] Upload fehlgeschlagen:`, errorMsg);
          
          updateStorageEntry(upload.id, { 
            status: 'Fehler',
            analysis: {
              error: `Upload fehlgeschlagen: ${errorMsg}`,
              gesamtpunkte: 0,
              erreichtePunkte: 0,
              prozent: 0,
              aufgaben: [],
              zusammenfassung: `Fehler beim Upload: ${errorMsg}`
            }
          });
          
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
        
        // 3. Rufe Extract-API mit fileKey auf
        console.log(`[${upload.fileName}] Starte PDF-Extraktion...`);
        setAnalysisProgress({ 
          current: i + 1, 
          total: uploads.length, 
          currentFile: `${upload.fileName} (Extraktion läuft...)` 
        });
        
        const extractResponse = await fetch('/api/extract-klausur', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ fileKey }),
        });

        if (!extractResponse.ok) {
          const errorData = await extractResponse.json().catch(() => ({ error: 'Unbekannter Fehler' }));
          const errorMessage = errorData.error || `HTTP ${extractResponse.status}`;
          console.error(`[${upload.fileName}] PDF-Extraktion fehlgeschlagen:`, errorMessage);
          
          updateStorageEntry(upload.id, { 
            status: 'Fehler',
            analysis: {
              error: `PDF-Extraktion fehlgeschlagen: ${errorMessage}`,
              gesamtpunkte: 0,
              erreichtePunkte: 0,
              prozent: 0,
              aufgaben: [],
              zusammenfassung: `Fehler bei der Extraktion: ${errorMessage}`
            }
          });
          
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
        console.log(`[${upload.fileName}] PDF-Extraktion erfolgreich:`, extracted.text?.length || 0, 'Zeichen');
        
        if (!extracted.text || extracted.text.trim().length === 0) {
          console.error(`[${upload.fileName}] Kein Text aus PDF extrahiert`);
          updateStorageEntry(upload.id, { 
            status: 'Fehler',
            analysis: {
              error: 'Kein Text aus PDF extrahiert',
              gesamtpunkte: 0,
              erreichtePunkte: 0,
              prozent: 0,
              aufgaben: [],
              zusammenfassung: 'Die PDF-Datei konnte nicht gelesen werden. Bitte prüfe, ob die Datei korrekt ist.'
            }
          });
          continue;
        }
        
        console.log(`[${upload.fileName}] Starte Analyse...`);
        const analysisResponse = await fetch('/api/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            klausurText: extracted.text,
            erwartungshorizont: expectationText,
          }),
        });

      if (!analysisResponse.ok) {
        const errorData = await analysisResponse.json().catch(() => ({ error: 'Unbekannter Fehler' }));
        const errorMessage = errorData.error || `HTTP ${analysisResponse.status}`;
        console.error(`[${upload.fileName}] Analyse fehlgeschlagen:`, errorMessage);
        
        updateStorageEntry(upload.id, { 
          status: 'Fehler',
          analysis: {
            error: `Analyse fehlgeschlagen: ${errorMessage}`,
            gesamtpunkte: 0,
            erreichtePunkte: 0,
            prozent: 0,
            aufgaben: [],
            zusammenfassung: `Fehler bei der Analyse: ${errorMessage}`
          }
        });
        
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
      console.log(`[${upload.fileName}] Analyse erfolgreich:`, {
        erreichtePunkte: analysis.erreichtePunkte || analysis.meta?.achievedPoints,
        maxPunkte: analysis.gesamtpunkte || analysis.meta?.maxPoints,
        aufgabenAnzahl: analysis.aufgaben?.length || analysis.tasks?.length
      });
      
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
        console.log(`[${upload.fileName}] Erfolgreich in Supabase gespeichert`);
      } catch (error) {
        console.error(`[${upload.fileName}] Fehler beim Update in Supabase:`, error);
      }
      }

      clearUploads();
      console.log('Alle Analysen abgeschlossen, weiterleiten zu /results');
      router.push('/results');
    } catch (error) {
      console.error('Kritischer Fehler in handleStartAnalysis:', error);
      const errorMessage = error instanceof Error ? error.message : 'Ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut.';
      setErrorMessage(errorMessage);
      toast.error(errorMessage);
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
