'use client';

import { KlausurAnalyse } from '@/lib/openai';
import { getGradeInfo, getPerformanceLevel, gradeColor } from '@/lib/grades';
import { downloadAnalysisDoc } from '@/lib/downloadDoc';
import { mapToParsedAnalysis } from '@/types/analysis';
import { renderTeacherResultSection } from '@/lib/renderers/teacher-renderer';

interface ResultCardProps {
  analysis: KlausurAnalyse;
  klausurName?: string;
  anchorId?: string;
  courseInfo?: {
    subject?: string;
    gradeLevel?: string;
    className?: string;
    schoolYear?: string;
  };
}

export default function ResultCard({ analysis, klausurName, anchorId, courseInfo }: ResultCardProps) {
  const name = klausurName || 'Klausur';
  const percentage = analysis.prozent;
  const gradeLevel = courseInfo?.gradeLevel ? parseInt(courseInfo.gradeLevel, 10) || 10 : 10;
  const gradeInfo = getGradeInfo({ prozent: percentage, gradeLevel });
  const grade = gradeInfo.label;
  const performanceLevel = getPerformanceLevel(percentage);

  // Konvertiere zu ParsedAnalysis und rendere für Lehrer
  const parsedAnalysis = mapToParsedAnalysis(analysis, grade);
  const teacherView = renderTeacherResultSection(parsedAnalysis);

  const handleDownload = () => {
    downloadAnalysisDoc(name, analysis, courseInfo ? {
      subject: courseInfo.subject || '',
      gradeLevel: courseInfo.gradeLevel || '',
      className: courseInfo.className || '',
      schoolYear: courseInfo.schoolYear || '',
    } : undefined);
  };

  return (
    <article className="teacher-card" id={anchorId}>
      <header className="teacher-card__header">
        <div>
          <p className="teacher-card__label">Schüler/in</p>
          <h3 className="teacher-card__student">{name}</h3>
          <p className="teacher-card__note">Bewertung auf Basis des Erwartungshorizonts</p>
        </div>
        <div className="teacher-card__grade-box">
          <span className={`grade-badge grade-badge-large ${gradeInfo.badgeClass}`}>{grade}</span>
          <p className="teacher-card__points">
            {teacherView.overall.points} Punkte
          </p>
          <p className="teacher-card__percentage">{teacherView.overall.percentage.toFixed(1)}%</p>
        </div>
      </header>

      <section className="teacher-card__summary">
        <h4>Zusammenfassung</h4>
        {teacherView.summary.strengths.length > 0 && (
          <div className="summary-section summary-section--strengths">
            <h5 className="summary-section__title">Stärken</h5>
            <ul className="teacher-task-list">
              {teacherView.summary.strengths.map((strength, idx) => (
                <li key={idx}>{strength}</li>
              ))}
            </ul>
          </div>
        )}
        {teacherView.summary.developmentAreas.length > 0 && (
          <div className="summary-section summary-section--development">
            <h5 className="summary-section__title">Entwicklungsbereiche</h5>
            <ul className="teacher-task-list">
              {teacherView.summary.developmentAreas.map((area, idx) => (
                <li key={idx}>{area}</li>
              ))}
            </ul>
          </div>
        )}
        {teacherView.summary.overallSummary && (
          <p style={{ marginTop: 'var(--spacing-md)' }}>{teacherView.summary.overallSummary}</p>
        )}
      </section>

      <section className="teacher-card__tasks">
        <h4>Detailanalyse der Aufgaben</h4>
        {teacherView.tasks.map((task, index) => (
          <div className="teacher-task-card" key={`${task.taskId}-${index}`}>
            <div className="teacher-task-card__header">
              <div>
                <p className="teacher-task-card__label">Aufgabe</p>
                <p className="teacher-task-card__title">{task.taskTitle}</p>
              </div>
              <div className="teacher-task-card__score">
                <span>{task.points.split('/')[0]}</span>
                <small>von {task.points.split('/')[1]}</small>
              </div>
            </div>
            <div className="teacher-task-card__body">
              {task.benoetigtManuelleKorrektur && task.warnung && (
                <div className="bg-yellow-100 border-l-4 border-yellow-500 p-4 mb-4 rounded">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-yellow-500" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-yellow-700 font-medium">{task.warnung}</p>
                    </div>
                  </div>
                </div>
              )}
              {task.correctAspects.length > 0 && (
                <div className="teacher-task-section teacher-task-section--neutral">
                  <p className="teacher-task-section__title">Korrekte Aspekte</p>
                  <ul className="teacher-task-list">
                    {task.correctAspects.map((aspect, idx) => (
                      <li key={idx}>{aspect}</li>
                    ))}
                  </ul>
                </div>
              )}
              {task.deductions.length > 0 && (
                <div className="teacher-task-section teacher-task-section--neutral">
                  <p className="teacher-task-section__title">Punkteabzug</p>
                  <ul className="teacher-task-list">
                    {task.deductions.map((deduction, idx) => (
                      <li key={idx}>{deduction}</li>
                    ))}
                  </ul>
                </div>
              )}
              {task.improvementHints.length > 0 && (
                <div className="teacher-task-section teacher-task-section--neutral">
                  <p className="teacher-task-section__title">Hinweis für Förderung</p>
                  <ul className="teacher-task-list">
                    {task.improvementHints.map((hint, idx) => (
                      <li key={idx}>{hint}</li>
                    ))}
                  </ul>
                </div>
              )}
              {task.corrections.length > 0 && (
                <div className="teacher-task-section teacher-task-section--corrections">
                  <p className="teacher-task-section__title">Korrekturen</p>
                  <ul className="teacher-task-list">
                    {task.corrections.map((correction, idx) => (
                      <li key={idx}>{correction}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        ))}
      </section>

      <button
        type="button"
        className="primary-button teacher-card__download"
        onClick={handleDownload}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
        </svg>
        <span>Bericht herunterladen</span>
      </button>
    </article>
  );
}
