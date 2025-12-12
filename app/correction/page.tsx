'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { toast } from 'sonner'

import UploadBox from '@/components/UploadBox'
import CourseSelectionCard from '@/components/CourseSelectionCard'
import UploadedFilesList from '@/components/UploadedFilesList'
import UploadProgressList from '@/components/UploadProgressList'
import AnalysisStartSection from '@/components/AnalysisStartSection'

import { useUploadQueue } from '@/hooks/useUploadQueue'
import { useAnalysisQueue } from '@/hooks/useAnalysisQueue'

import type { UploadedFile } from '@/components/UploadBox'
import type { CourseInfo } from '@/types/results'
import { ensureValidSession } from '@/lib/supabase/session-validator'
import { getCurrentSchoolYear } from '@/lib/school-year'

const SUBJECT_OPTIONS = ['Mathematik', 'Deutsch', 'Englisch', 'Französisch', 'Spanisch', 'Latein', 'Chemie', 'Physik', 'Biologie', 'Geschichte', 'Geographie', 'Politik', 'Wirtschaft', 'Philosophie', 'Kunst', 'Musik', 'Sport', 'Informatik', 'Sonstiges']
const GRADE_OPTIONS = ['5', '6', '7', '8', '9', '10', '11', '12', '13']
const CLASS_OPTIONS = ['A', 'B', 'C', 'D', 'E', 'GK', 'LK']

const STORAGE_KEY = 'correctionpilot-results'

interface StoredResultEntry {
  id: string
  status: string
  analysis: any
  gesamtpunkte: number
  erreichtePunkte: number
  prozent: number
  zusammenfassung?: string
}

const readResults = (): Array<{ id: string; fileName: string; status: string }> => {
  if (typeof window === 'undefined') return []
  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) return []
  try {
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed.map((item: any) => ({
      id: item.id || '',
      fileName: item.fileName || '',
      status: item.status || ''
    }))
  } catch (error) {
    console.error('Fehler beim Lesen der Ergebnisse:', error)
    return []
  }
}

const getStoredResult = (correctionId: string): { analysis: any } | null => {
  if (typeof window === 'undefined') return null
  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) return null
  try {
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return null
    const entry = parsed.find((item: any) => item.id === correctionId && item.status === 'Bereit')
    if (entry && entry.analysis) {
      return { analysis: entry.analysis }
    }
    return null
  } catch (error) {
    console.error('Fehler beim Lesen des gespeicherten Ergebnisses:', error)
    return null
  }
}

const updateStorageEntry = (id: string, patch: Partial<StoredResultEntry>) => {
  const stored = localStorage.getItem(STORAGE_KEY)
  if (!stored) return
  const list: StoredResultEntry[] = JSON.parse(stored)
  const next = list.map(item => item.id === id ? { ...item, ...patch } : item)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
}

const appendToStorage = (entry: { id: string; studentName: string; status: string; fileName: string; course: CourseInfo; analysis?: any }) => {
  const stored = localStorage.getItem(STORAGE_KEY)
  const list: any[] = stored ? JSON.parse(stored) : []
  const existingIndex = list.findIndex(item => item.id === entry.id)
  if (existingIndex >= 0) {
    list[existingIndex] = { ...list[existingIndex], ...entry }
  } else {
    list.push(entry)
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list))
}

export default function CorrectionPage() {
  const router = useRouter()
  const [course, setCourse] = useState<CourseInfo>({ subject: '', gradeLevel: '', className: '', schoolYear: '' })
  const [uploads, setUploads] = useState<UploadedFile[]>([])
  const [expectationFileName, setExpectationFileName] = useState<string | null>(null)
  const [expectationText, setExpectationText] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [blinkingField, setBlinkingField] = useState<keyof CourseInfo | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [results, setResults] = useState<Array<{ id: string; fileName: string; status: string }>>(() => readResults())
  const [isLoaded, setIsLoaded] = useState(false)

  // ============================================================================
  // LAYER 1: SESSION-BASED IDEMPOTENCY GUARD
  // Tracks ALL file IDs that have been processed in this session
  // ============================================================================
  const processedFilesRef = useRef<Set<string>>(new Set())
  
  // Separate tracking for queued analyses (prevents double-queueing)
  const queuedAnalysesRef = useRef<Set<string>>(new Set())
  
  // Tracks files that have completed saving (prevents double-save)
  const savedCorrectionsRef = useRef<Set<string>>(new Set())
  

  const isCourseComplete = Boolean(course.subject && course.gradeLevel && course.className && course.schoolYear)

  // Load results on mount and mark completed files
  useEffect(() => {
    const loadedResults = readResults()
    setResults(loadedResults)
    
    // Mark all finished results in savedCorrectionsRef
    loadedResults.forEach((result) => {
      if (result.status === 'Bereit' && result.id) {
        savedCorrectionsRef.current.add(result.id)
        // CRITICAL: Also mark in processedFilesRef to prevent re-queueing
        processedFilesRef.current.add(result.id)
        console.log(`[Init] ${result.fileName} (ID: ${result.id}) bereits fertig - in Guards markiert.`)
      }
    })
    
    setIsLoaded(true)
  }, [])

  // Load course data from localStorage (client-only)
  useEffect(() => {
    const stored = localStorage.getItem('courseContext')
    if (stored) {
      try {
        const parsed = JSON.parse(stored)
        setCourse({ subject: parsed.subject || '', gradeLevel: parsed.gradeLevel || '', className: parsed.className || '', schoolYear: parsed.schoolYear || getCurrentSchoolYear() })
      } catch {
        setCourse(prev => ({ ...prev, schoolYear: getCurrentSchoolYear() }))
      }
    } else {
      setCourse(prev => ({ ...prev, schoolYear: getCurrentSchoolYear() }))
    }
  }, [])

  const handleCourseChange = (field: keyof CourseInfo, value: string) => {
    const next = { ...course, [field]: value }
    setCourse(next)
    localStorage.setItem('courseContext', JSON.stringify(next))
    
    if (blinkingField === field) setBlinkingField(null)
    if (next.subject && next.gradeLevel && next.className && next.schoolYear) setErrorMessage(null)
  }

  const handleDisabledUploadClick = () => {
    const step1Element = document.getElementById('step-1-kursdaten')
    step1Element?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    
    if (!course.subject) setBlinkingField('subject')
    else if (!course.gradeLevel) setBlinkingField('gradeLevel')
    else if (!course.className) setBlinkingField('className')
    else if (!course.schoolYear) setBlinkingField('schoolYear')
    
    setErrorMessage('Bitte vervollständige zuerst die Kursdaten in Schritt 1.')
    setTimeout(() => setBlinkingField(null), 2000)
  }

  const handleDisabledStepClick = (stepNumber: number) => {
    if (!isCourseComplete) handleDisabledUploadClick()
  }

  const handleExpectationUpload = async (files: UploadedFile[]) => {
    if (!files.length) return
    const file = files[0]
    try {
      const fileKey = await uploadFileToStorage(file.file)
      setExpectationFileName(file.fileName)
      const extractResponse = await fetch('/api/extract-klausur', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileKey })
      })
      const extracted = await extractResponse.json()
      setExpectationText(extracted.text)
      toast.success('Erwartungshorizont erfolgreich hochgeladen!')
    } catch (error) {
      toast.error('Fehler beim Hochladen der Musterlösung')
    }
  }

  const handleKlausurUpload = (files: UploadedFile[]) => {
    setUploads(prev => [...prev, ...files.slice(0, 30)])
  }

  const handleRemoveUpload = (id: string) => {
    setUploads(prev => prev.filter(file => file.id !== id))
    // Also remove from processedFilesRef if user manually removes before analysis
    processedFilesRef.current.delete(id)
  }

  const handleStartAnalysis = async () => {
    if (!isCourseComplete) {
      setErrorMessage('Bitte vervollständige zuerst die Kursdaten.')
      return
    }
    if (!expectationText) {
      setErrorMessage('Bitte lade zuerst den Erwartungshorizont hoch.')
      return
    }
    if (uploads.length === 0) {
      setErrorMessage('Bitte lade mindestens eine Klausur hoch.')
      return
    }
    if (!isLoaded) {
      console.log('Result-Storage noch nicht geladen – Analyse-Start abgebrochen.')
      return
    }

    setErrorMessage(null)
    setIsAnalyzing(true)

    const currentResults = readResults()
    setResults(currentResults)

    // ============================================================================
    // LAYER 1 + LAYER 3: PRE-FLIGHT CHECKS WITH SESSION GUARD
    // ============================================================================
    const filesToProcess = uploads.filter((file) => {
      // SESSION GUARD: Has this file ID been processed in this session?
      if (processedFilesRef.current.has(file.id)) {
        console.log(
          `[SESSION-GUARD] ${file.fileName} (ID: ${file.id}) wurde bereits in dieser Session verarbeitet. SKIP.`
        )
        // Ensure UI reflects completed state
        uploadQueue.updateItem(file.id, {
          status: 'completed',
          progress: 100,
        })
        return false
      }

      // STORAGE GUARD: Is there already a finished result in localStorage?
      const alreadyDone = currentResults.some(
        (r) => r.fileName === file.fileName && r.status === 'Bereit'
      )

      if (alreadyDone) {
        console.log(
          `[STORAGE-GUARD] ${file.fileName} ist bereits fertig analysiert im Storage. SKIP.`
        )
        // Mark in all guard refs
        processedFilesRef.current.add(file.id)
        savedCorrectionsRef.current.add(file.id)
        
        uploadQueue.updateItem(file.id, {
          status: 'completed',
          progress: 100,
        })
        return false
      }

      // SAVED CORRECTIONS GUARD: Additional safety check
      if (savedCorrectionsRef.current.has(file.id)) {
        console.log(
          `[SAVED-GUARD] ${file.fileName} (ID: ${file.id}) ist bereits in savedCorrectionsRef. SKIP.`
        )
        processedFilesRef.current.add(file.id)
        uploadQueue.updateItem(file.id, {
          status: 'completed',
          progress: 100,
        })
        return false
      }

      // QUEUE STATUS GUARD: Is this file already in progress?
      const uploadItem = uploadQueue.queue.find((q) => q.id === file.id)
      if (
        uploadItem &&
        (uploadItem.status === 'analyzing' ||
          uploadItem.status === 'completed')
      ) {
        console.log(
          `[QUEUE-GUARD] ${file.fileName} ist bereits in Bearbeitung/fertig. SKIP.`
        )
        processedFilesRef.current.add(file.id)
        return false
      }

      return true
    })

    if (filesToProcess.length === 0) {
      console.log(
        '✅ Alle hochgeladenen Klausuren sind bereits analysiert – nichts Neues zu tun.'
      )
      setIsAnalyzing(false)
      // Check if we should redirect
      if (results.length > 0) {
          router.push('/results')
      }
      return
    }

    // ============================================================================
    // MARK FILES AS PROCESSED IMMEDIATELY (BEFORE QUEUEING)
    // This prevents re-queueing on subsequent re-renders
    // ============================================================================
    filesToProcess.forEach((file) => {
      processedFilesRef.current.add(file.id)
      console.log(`[SESSION-GUARD] Markiere ${file.fileName} (ID: ${file.id}) als verarbeitet.`)
    })

    // Add to upload queue (Layer 2 deduplication inside useUploadQueue)
    uploadQueue.addToQueue(filesToProcess)

    // Create storage entries for new files
    for (const file of filesToProcess) {
      if (savedCorrectionsRef.current.has(file.id)) {
        continue
      }

      const entry = {
        id: file.id,
        studentName: file.fileName.replace('.pdf', ''),
        status: 'Analyse läuft…' as const,
        fileName: file.fileName,
        course,
        analysis: null,
      }

      appendToStorage(entry)

      try {
        await fetch('/api/corrections', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(entry),
        })
      } catch (error) {
        console.error('Fehler beim Speichern in Supabase', error)
      }
    }
  }

  const uploadFileToStorage = async (file: File): Promise<string | null> => {
    const MAX_FILE_SIZE = 50 * 1024 * 1024
    if (file.size > MAX_FILE_SIZE) throw new Error('Datei zu groß (max 50MB)')
    
    const urlResponse = await fetch('/api/upload-url', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fileName: file.name, fileType: file.type, fileSize: file.size })
    })

    if (!urlResponse.ok) {
      const errorData = await urlResponse.json()
      throw new Error(errorData.error || 'Upload-URL Fehler')
    }

    const { uploadUrl, fileKey } = await urlResponse.json()
    const xhr = new XMLHttpRequest()

    return new Promise((resolve, reject) => {
      xhr.upload.addEventListener('progress', e => {
        if (e.lengthComputable) {
          const progress = Math.round((e.loaded / e.total) * 100)
          // Optional: Update detailed upload progress here if needed
        }
      })
      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) resolve(fileKey)
        else reject(new Error(`Upload failed: ${xhr.status}`))
      })
      xhr.addEventListener('error', () => reject(new Error('Network error')))
      xhr.open('PUT', uploadUrl)
      xhr.setRequestHeader('Content-Type', file.type)
      xhr.send(file)
    })
  }

  // Upload Queue with callbacks
  const uploadQueue = useUploadQueue({
    maxConcurrent: 4,
    onExtractComplete: async (item, text) => {
      // GUARD: Check if already saved
      if (savedCorrectionsRef.current.has(item.id)) {
        console.log(
          `[EXTRACT-GUARD] ${item.fileName} (ID: ${item.id}) ist bereits gespeichert. SKIP Analyse.`
        )
        uploadQueue.updateItem(item.id, { status: 'completed', progress: 100 })
        return
      }

      // GUARD: Check storage for existing result
      const currentResults = readResults()
      const alreadyDone = currentResults.some(
        (r) => r.fileName === item.fileName && r.status === 'Bereit'
      )
      if (alreadyDone) {
        console.log(
          `[EXTRACT-GUARD] ${item.fileName} ist bereits im Storage als 'Bereit'. SKIP Analyse.`
        )
        savedCorrectionsRef.current.add(item.id)
        uploadQueue.updateItem(item.id, { status: 'completed', progress: 100 })
        return
      }

      // GUARD: Prevent double-queueing of analysis
      if (queuedAnalysesRef.current.has(item.id)) {
        console.log(
          `[EXTRACT-GUARD] Analyse für ${item.fileName} (ID: ${item.id}) wurde bereits gestartet. SKIP.`
        )
        return
      }

      if (!expectationText?.trim()) throw new Error('Erwartungshorizont fehlt')
      
      console.log(`${item.fileName} Extraktion abgeschlossen, füge zur Analyse-Queue hinzu...`)
      
      uploadQueue.updateItem(item.id, { status: 'analyzing', progress: 80 })
      
      queuedAnalysesRef.current.add(item.id)
      
      analysisQueue.addToQueue([{
        id: item.id,
        fileName: item.fileName,
        klausurText: text.trim(),
        erwartungshorizont: expectationText.trim(),
        correctionId: item.id,
        status: 'pending'
      }])
    }
  })

  const analysisQueue = useAnalysisQueue({
    maxConcurrent: 5,
    getStoredResult: (item) => {
      return getStoredResult(item.correctionId)
    },
    shouldSkipAnalysis: (item) => {
      if (savedCorrectionsRef.current.has(item.correctionId)) {
        console.log(
          `[ANALYSIS-GUARD] ${item.fileName} (ID: ${item.correctionId}) ist bereits in savedCorrectionsRef. SKIP API-Call.`
        )
        return true
      }
      const currentResults = readResults()
      const alreadyDone = currentResults.some(
        (r) => r.id === item.correctionId && r.status === 'Bereit'
      )
      if (alreadyDone) {
        console.log(
          `[ANALYSIS-GUARD] ${item.fileName} (ID: ${item.correctionId}) ist bereits im Storage als 'Bereit'. SKIP API-Call.`
        )
        savedCorrectionsRef.current.add(item.correctionId)
        return true
      }
      return false
    },
    onAnalysisComplete: async (item, analysis) => {
      if (savedCorrectionsRef.current.has(item.correctionId)) {
        console.log(`Korrektur ${item.correctionId} wurde bereits gespeichert, überspringe erneutes Speichern.`)
        return
      }
      savedCorrectionsRef.current.add(item.correctionId)

      const entry = {
        id: item.correctionId,
        studentName: item.fileName.replace('.pdf', ''),
        status: 'Bereit' as const,
        fileName: item.fileName,
        course,
        analysis
      }
      
      updateStorageEntry(item.correctionId, { status: 'Bereit', analysis })
      
      try {
        await fetch('/api/corrections', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(entry)
        })
        console.log('✅ CLEAN SAVE DONE:', item.fileName, item.correctionId)
      } catch (error) {
        console.error('Fehler beim Update in Supabase', error)
      }
      
      uploadQueue.updateItem(item.correctionId, { status: 'completed', progress: 100 })
    },
    onError: async (item, error) => {
      console.error(`${item.fileName} Analyse fehlgeschlagen:`, error)
      updateStorageEntry(item.correctionId!, {
        status: 'Fehler',
        analysis: { error },
        gesamtpunkte: 0,
        erreichtePunkte: 0,
        prozent: 0,
        zusammenfassung: `Fehler bei der Analyse: ${error}`
      })
      
      try {
        await fetch('/api/corrections', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: item.correctionId,
            studentName: item.fileName.replace('.pdf', ''),
            fileName: item.fileName,
            course,
            status: 'Fehler'
          })
        })
      } catch (err) {
        console.error('Fehler beim Update in Supabase', err)
      }
      
      uploadQueue.updateItem(item.correctionId!, { status: 'error', progress: 0 })
    }
  })

  // ========================================================================
  // FINALER REDIRECT: HARD FORCE
  // Prüft, ob ALLE Uploads UND Analysen fertig sind
  // ========================================================================
  const redirectRef = useRef(false)

  useEffect(() => {
    // Abbruch, wenn Analyse nicht aktiv oder leer
    if (!isAnalyzing || uploadQueue.totalCount === 0) return

    // KRITISCH: Prüfe, ob ALLE Queue-Items wirklich fertig sind (nicht nur Upload, auch Analyse)
    const allFinished = uploadQueue.queue.every(item => 
      ['completed', 'error', 'errorfinal'].includes(item.status)
    )

    // ZUSÄTZLICH: Prüfe, ob alle Analysen auch fertig sind
    const allAnalysesFinished = analysisQueue.queue.length === 0 || 
      analysisQueue.queue.every(item => 
        ['completed', 'error', 'errorfinal'].includes(item.status)
      )

    // Nur weiterleiten, wenn BEIDES fertig ist
    if (allFinished && allAnalysesFinished && !redirectRef.current) {
      console.log("🚀 ALLE UPLOADS UND ANALYSEN FERTIG. ZWINGE WEITERLEITUNG.")
      redirectRef.current = true 
      
      // State sofort beenden (stoppt Spinner)
      setIsAnalyzing(false)

      // Hard Redirect via window.location (zuverlässiger als router.push bei Race Conditions)
      setTimeout(() => {
        window.location.href = '/results'
      }, 500)
    }
  }, [isAnalyzing, uploadQueue.queue, analysisQueue.queue, uploadQueue.totalCount])

  const getCurrentStep = () => {
    if (!isCourseComplete) return 1
    if (!expectationText) return 2
    if (uploads.length === 0) return 3
    return 4
  }

  return (
    <section className="module-section">
      <div className="container">
        {/* Helper Component für Steps - hier angenommen, dass es existiert oder importiert wird */}
        {/* <ProcessStepper currentStep={getCurrentStep()} /> */} 
        {/* Falls ProcessStepper nicht importiert ist, einkommentieren oder entfernen */}

        <h2 className="section-title">Lass uns korrigieren</h2>
        <p className="section-description">
          Gib kurz die Eckdaten ein und lade die Unterlagen hoch. Den Rest erledigt KorrekturPilot.
        </p>

        {errorMessage && !isCourseComplete && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
            {errorMessage}
          </div>
        )}

        <div className="module-grid" style={{ marginBottom: 'var(--spacing-2xl)' }}>
          <div className="module-card" id="step-1-kursdaten">
            <h3>Schritt 1: Kursdaten</h3>
            <div style={{ marginTop: 'var(--spacing-lg)' }}>
              <CourseSelectionCard
                course={course}
                onChange={handleCourseChange}
                subjectOptions={SUBJECT_OPTIONS}
                gradeOptions={GRADE_OPTIONS}
                classOptions={CLASS_OPTIONS}
                blinkingField={blinkingField}
              />
            </div>
          </div>
        </div>

        <div className="process-grid" style={{ marginBottom: 'var(--spacing-2xl)' }}>
          <div 
            className="process-card"
            style={{ 
              opacity: isCourseComplete ? 1 : 0.5, 
              pointerEvents: isCourseComplete ? 'auto' : 'none',
              display: 'flex', flexDirection: 'column', height: '100%', position: 'relative'
            }}
            onClick={!isCourseComplete ? () => handleDisabledStepClick(2) : undefined}
          >
            {!isCourseComplete && (
              <div 
                className="absolute inset-0 z-10 cursor-not-allowed"
                onClick={e => { e.stopPropagation(); handleDisabledStepClick(2) }}
              />
            )}
            <h3>Schritt 2: Bewertungsmastab</h3>
            <p style={{ marginBottom: 'var(--spacing-lg)', minHeight: '4.5rem' }}>
              Lade hier den Erwartungshorizont oder die Musterlösung hoch, an der sich der KorrekturPilot orientieren soll.
            </p>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
              <UploadBox
                title="Musterlösung hochladen"
                description="PDF-Format"
                buttonLabel="Datei auswählen"
                onUpload={handleExpectationUpload}
                disabled={!isCourseComplete}
                onDisabledClick={handleDisabledUploadClick}
              />
              {expectationFileName && (
                <div style={{ marginTop: 'var(--spacing-lg)', padding: 'var(--spacing-md)', background: 'var(--color-success-light)', border: '1px solid var(--color-success)', borderRadius: 'var(--radius-lg)', color: 'var(--color-success-dark)' }}>
                  ✅ Erwartungshorizont erfolgreich hochgeladen: {expectationFileName}
                </div>
              )}
            </div>
          </div>

          <div 
            className="process-card"
            style={{ 
              opacity: isCourseComplete ? 1 : 0.5, 
              pointerEvents: isCourseComplete ? 'auto' : 'none',
              display: 'flex', flexDirection: 'column', height: '100%', position: 'relative'
            }}
            onClick={!isCourseComplete ? () => handleDisabledStepClick(3) : undefined}
          >
            {!isCourseComplete && (
              <div 
                className="absolute inset-0 z-10 cursor-not-allowed"
                onClick={e => { e.stopPropagation(); handleDisabledStepClick(3) }}
              />
            )}
            <h3>Schritt 3: Klausuren der Schüler</h3>
            <p style={{ marginBottom: 'var(--spacing-lg)', minHeight: '4.5rem' }}>
              Lade hier die gescannten Arbeiten hoch (max. 10 PDFs gleichzeitig).
            </p>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
              <UploadBox
                title="Schülerarbeiten hochladen"
                description="Drag & Drop oder Auswählen"
                buttonLabel="Dateien auswählen"
                allowMultiple
                onUpload={handleKlausurUpload}
                disabled={!isCourseComplete}
                onDisabledClick={handleDisabledUploadClick}
              />
              {uploads.length > 0 && uploadQueue.totalCount === 0 && (
                <div style={{ marginTop: 'var(--spacing-lg)' }}>
                  <UploadedFilesList files={uploads} onRemove={handleRemoveUpload} />
                </div>
              )}
              
              {uploadQueue.totalCount > 0 && (
                <div style={{ marginTop: 'var(--spacing-lg)', display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
                  <div
                    style={{
                      padding: 'var(--spacing-md)',
                      background: 'var(--color-info-light)',
                      border: '1px solid var(--color-primary)',
                      borderRadius: 'var(--radius-lg)',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: 'var(--spacing-xs)',
                      }}
                    >
                      <span
                        style={{
                          fontSize: '0.9375rem',
                          fontWeight: 600,
                          color: 'var(--color-gray-900)',
                        }}
                      >
                        Gesamt-Fortschritt
                      </span>
                      <span
                        style={{
                          fontSize: '0.9375rem',
                          fontWeight: 600,
                          color: 'var(--color-primary)',
                        }}
                      >
                        {uploadQueue.completedCount}/{uploadQueue.totalCount} Dateien fertig · {uploadQueue.totalProgress}%
                      </span>
                    </div>
                    <div
                      style={{
                        width: '100%',
                        height: '8px',
                        background: 'var(--color-gray-200)',
                        borderRadius: '9999px',
                        overflow: 'hidden',
                      }}
                    >
                      <div
                        style={{
                          width: `${uploadQueue.totalProgress}%`,
                          height: '100%',
                          background: 'var(--color-primary)',
                          borderRadius: '9999px',
                          transition: 'width 0.3s ease',
                        }}
                      />
                    </div>
                  </div>
                  
                  {/* HIER ENDETE DEIN CODE-SCHNIPSEL - HIER IST DER REST */}
                  <UploadProgressList
                    items={uploadQueue.queue}
                    onRetry={uploadQueue.retryItem}
                    onRemove={(id) => {
                      uploadQueue.removeItem(id);
                      setUploads((prev) => prev.filter((u) => u.id !== id));
                      // Also remove from session guard
                      processedFilesRef.current.delete(id);
                    }}
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Schritt 4: Start Button mit NOTFALL-KLICK */}
        <AnalysisStartSection
             // TRICK: Überschreibe Text bei 100%
             buttonText={
                uploadQueue.totalProgress >= 100 
                ? "Ergebnisse anzeigen (Klicken!)" 
                : undefined 
             }
             // TRICK: Bei Klick sofort weiterleiten
             onStart={() => {
                if (uploadQueue.totalProgress >= 100) {
                    window.location.href = '/results'
                } else {
                    handleStartAnalysis()
                }
             }}
             // Button NUR deaktivieren, wenn < 100% UND am arbeiten
             disabled={
               (!isCourseComplete || !expectationText || uploads.length === 0) || 
               (isAnalyzing && uploadQueue.totalProgress < 100)
             }
             // Spinner nur zeigen, wenn < 100%
             isAnalyzing={isAnalyzing && uploadQueue.totalProgress < 100}
             progress={uploadQueue.totalProgress as number} 
        />
      </div>
    </section>
  )
}
