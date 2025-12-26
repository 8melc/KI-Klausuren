export const gradingSchema = {
  type: "object",
  properties: {
    tasks: {
      type: "array",
      items: {
        type: "object",
        properties: {
          id: { type: "string", description: "Aufgabennummer, z.B. '1.1'" },
          points: { type: "number", description: "Erreichte Punkte" },
          maxPoints: { type: "number", description: "Maximal mögliche Punkte" },
          analysis: { type: "string", description: "Detaillierte Analyse der Schülerantwort" },
          errors: { type: "string", description: "Konkrete Fehler oder Auslassungen" },
          suggestion: { type: "string", description: "Verbesserungsvorschlag für Schüler" }
        },
        required: ["id", "points", "maxPoints", "analysis"]
      }
    },
    totalPoints: { type: "number", description: "Gesamtpunktzahl" },
    maxPoints: { type: "number", description: "Maximal erreichbare Gesamtpunktzahl" },
    grade: { type: "string", description: "Note (z.B. '2+' oder '2.3')" },
    summary: { type: "string", description: "Verbales Gesamtfeedback (3-5 Sätze)" }
  },
  required: ["tasks", "totalPoints", "maxPoints", "grade", "summary"]
} as const;

export interface GradingResult {
  tasks: Array<{
    id: string;
    points: number;
    maxPoints: number;
    analysis: string;
    errors?: string;
    suggestion?: string;
  }>;
  totalPoints: number;
  maxPoints: number;
  grade: string;
  summary: string;
}
