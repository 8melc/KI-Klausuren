'use client';

import { KlausurAnalyse } from './openai';
import type { CourseInfo } from '@/types/results';

export async function downloadAnalysisDoc(
  klausurName: string,
  analysis: KlausurAnalyse,
  courseInfo?: CourseInfo,
) {
  try {
    const response = await fetch('/api/generate-doc', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        klausurName,
        analysis,
        courseInfo,
      }),
    });

    if (!response.ok) {
      throw new Error('Download fehlgeschlagen');
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${klausurName.replace(/[^a-zA-Z0-9_-]+/g, '_')}_Bewertung.docx`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error('DOC download error:', error);
    alert('Fehler beim Herunterladen des Word-Dokuments');
    throw error; // Fehler weiterwerfen, damit UI darauf reagieren kann
  }
}
