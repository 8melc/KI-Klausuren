import type { StoredResultEntry } from '@/types/results';
import type { KlausurAnalyse } from './openai';

/**
 * DSGVO-konforme Demo-Daten für Beispielansicht
 * Alle Namen sind anonyme Platzhalter - keine echten Personennamen!
 */

export const DEMO_CORRECTIONS: StoredResultEntry[] = [
  {
    id: 'demo_bio_001',
    studentName: 'Demo-Klausur 1',
    status: 'Bereit',
    fileName: 'demo_biologie_klausur.pdf',
    expectationHorizonUrl: '/demo/demo_bio_001_erwartungshorizont.pdf',
    course: {
      subject: 'Biologie',
      gradeLevel: '9',
      className: '9a',
      schoolYear: '2025/26',
    },
    analysis: {
      gesamtpunkte: 50,
      erreichtePunkte: 42,
      prozent: 84,
      zusammenfassung: 'Die Arbeit zeigt ein gutes Verständnis der Fotosynthese. Die Unterscheidung zwischen Licht- und Dunkelreaktion ist klar dargestellt. Bei der Zellatmung fehlen einige Details zum Citratzyklus. Die chemische Notation könnte präziser sein (z.B. CO₂ statt "Kohlendioxid" ausschreiben). Zusammenhänge zwischen Fotosynthese und Zellatmung sollten deutlicher herausgestellt werden. Bei Diagrammen sollten Achsenbeschriftungen nicht vergessen werden.',
      aufgaben: [
        {
          aufgabe: '1',
          maxPunkte: 15,
          erreichtePunkte: 13,
          kommentar: 'DAS WAR RICHTIG: • Du hast die Grundstruktur der Fotosynthese klar erkannt. • Du hast die Trennung von Licht- und Dunkelreaktion korrekt dargestellt. • Du zeigst ein gutes Verständnis für die grundlegenden Prozesse.\n\nHIER GAB ES ABZÜGE: • Du hast die chemische Reaktionsgleichung nicht angegeben. • Du könntest die genauen Orte der Reaktionen (Thylakoidmembranen, Stroma) noch präziser beschreiben.\n\nVERBESSERUNGSTIPP: • Du solltest beim nächsten Mal die vollständige Reaktionsgleichung (6 CO₂ + 6 H₂O + Lichtenergie → C₆H₁₂O₆ + 6 O₂) ergänzen. • Du solltest die räumliche Zuordnung der Reaktionsschritte deutlicher darstellen.',
          korrekturen: [
            'Die chemische Reaktionsgleichung sollte vollständig angegeben werden.',
            'Die genauen Orte der Reaktionen (Thylakoidmembranen für Lichtreaktion, Stroma für Dunkelreaktion) sollten präziser beschrieben werden.',
          ],
        },
        {
          aufgabe: '2',
          maxPunkte: 20,
          erreichtePunkte: 16,
          kommentar: 'DAS WAR RICHTIG: • Du hast die drei Phasen der Zellatmung (Glykolyse, Citratzyklus, Atmungskette) korrekt benannt. • Du hast die grundlegende Funktion (Glucoseabbau zu CO₂ und Wasser) gut verstanden.\n\nHIER GAB ES ABZÜGE: • Du hast Details zum Citratzyklus nicht angegeben. • Du hast die Frage, was mit Pyruvat passiert, nicht beantwortet. • Du hast die ATP-Ausbeute nicht quantifiziert.\n\nVERBESSERUNGSTIPP: • Du solltest beim Citratzyklus erklären, dass Pyruvat zu Acetyl-CoA umgewandelt wird und dann in den Citratzyklus eintritt. • Du solltest die Gesamt-ATP-Ausbeute pro Glucose-Molekül (ca. 32 ATP) erwähnen.',
          korrekturen: [
            'Die Umwandlung von Pyruvat zu Acetyl-CoA vor dem Citratzyklus fehlt.',
            'Die Gesamt-ATP-Ausbeute pro Glucose-Molekül (ca. 32 ATP) sollte quantifiziert werden.',
          ],
        },
        {
          aufgabe: '3',
          maxPunkte: 15,
          erreichtePunkte: 13,
          kommentar: 'DAS WAR RICHTIG: • Du hast alle Strukturen im Diagramm korrekt benannt. • Du hast die Zuordnung der Komponenten richtig gemacht.\n\nHIER GAB ES ABZÜGE: • Du hast die Achsenbeschriftungen in deinem Diagramm vergessen. • Du hast die Interpretation des Diagramms ohne Beschriftungen erschwert.\n\nVERBESSERUNGSTIPP: • Du solltest beim nächsten Mal alle Achsen beschriften, zum Beispiel "Zeit in Minuten" auf der x-Achse und "O₂-Konzentration" auf der y-Achse.',
          korrekturen: [
            'Die Achsenbeschriftungen fehlen und sollten ergänzt werden.',
          ],
        },
      ],
    },
  },
  {
    id: 'demo_ges_002',
    studentName: 'Demo-Klausur 2',
    status: 'Bereit',
    fileName: 'demo_geschichte_klausur.pdf',
    expectationHorizonUrl: '/demo/demo_ges_002_erwartungshorizont.pdf',
    course: {
      subject: 'Geschichte',
      gradeLevel: '11',
      className: '11b',
      schoolYear: '2025/26',
    },
    analysis: {
      gesamtpunkte: 40,
      erreichtePunkte: 28,
      prozent: 70,
      zusammenfassung: 'Die Arbeit zeigt Grundwissen zur Weimarer Republik. Die Darstellung der politischen Krisen ist nachvollziehbar, könnte aber durch konkrete Beispiele gestärkt werden. Quellenangaben sollten vollständig und einheitlich zitiert werden. Historische Ereignisse sollten chronologisch eingeordnet werden. Die eigene Argumentation sollte klarer von der Quellenwiedergabe getrennt werden.',
      aufgaben: [
        {
          aufgabe: '1',
          maxPunkte: 12,
          erreichtePunkte: 9,
          kommentar: 'DAS WAR RICHTIG: • Du hast den Grundzusammenhang zwischen dem Ende des Ersten Weltkriegs und der Entstehung der Weimarer Republik erkannt. • Du hast die Verbindung zur Niederlage Deutschlands und der Abdankung des Kaisers korrekt hergestellt.\n\nHIER GAB ES ABZÜGE: • Du hast konkrete Daten nicht angegeben (9.11.1918). • Du hast die Person, die die Republik ausrief (Scheidemann), nicht genannt. • Du hast den Versailler Vertrag nicht erwähnt, obwohl er die junge Demokratie belastete.\n\nVERBESSERUNGSTIPP: • Du solltest beim nächsten Mal konkrete Daten (9. November 1918) und wichtige Personen (Scheidemann) nennen. • Du solltest den Versailler Vertrag als Belastung für die junge Demokratie erwähnen.',
          korrekturen: [
            'Das genaue Datum der Novemberrevolution (9.11.1918) fehlt.',
            'Die Person, die die Republik ausrief (Scheidemann), sollte genannt werden.',
            'Der Versailler Vertrag als Belastung für die junge Demokratie fehlt.',
          ],
        },
        {
          aufgabe: '2',
          maxPunkte: 15,
          erreichtePunkte: 11,
          kommentar: 'DAS WAR RICHTIG: • Du hast die Inflation von 1923 als Problem erkannt. • Du hast die grundlegende Aussage, dass das Geld nichts mehr wert war, korrekt formuliert.\n\nHIER GAB ES ABZÜGE: • Du hast die Ursachenkette (Ruhrbesetzung → Passiver Widerstand → Geldentwertung) nicht dargestellt. • Du hast den Hitler-Putsch in München nicht erwähnt. • Du hast die Lösung (Rentenmark) nicht genannt.\n\nVERBESSERUNGSTIPP: • Du solltest beim nächsten Mal die Ursachenkette vollständig darstellen: Ruhrbesetzung führte zum Passiven Widerstand, der wiederum die Hyperinflation verursachte. • Du solltest den Hitler-Putsch als weiteres Krisenereignis erwähnen. • Du solltest die Rentenmark als Stabilisierungsmaßnahme nennen.',
          korrekturen: [
            'Die Ursachenkette (Ruhrbesetzung → Passiver Widerstand → Hyperinflation) fehlt.',
            'Der Hitler-Putsch in München wurde nicht erwähnt.',
            'Die Rentenmark als Stabilisierungsmaßnahme fehlt.',
          ],
        },
        {
          aufgabe: '3',
          maxPunkte: 13,
          erreichtePunkte: 8,
          kommentar: 'DAS WAR RICHTIG: • Du hast die grundlegende Aussage, dass viele Menschen unzufrieden waren, korrekt aus der Quelle abgeleitet.\n\nHIER GAB ES ABZÜGE: • Du hast die Quellenanalyse-Methode nicht angewendet. • Du hast Autor, Datum und Adressat nicht genannt. • Du hast die historische Einordnung (Krisenjahr 1923) nicht vorgenommen. • Du hast deine Interpretation zu oberflächlich gehalten.\n\nVERBESSERUNGSTIPP: • Du solltest beim nächsten Mal die Quellenanalyse-Methode anwenden: Wer ist der Autor? Wann wurde die Quelle verfasst? An wen richtet sie sich? • Du solltest dann die Quelle in den historischen Kontext (Krisenjahr 1923) einordnen.',
          korrekturen: [
            'Die Quellenanalyse-Methode (Autor, Datum, Adressat) wurde nicht angewendet.',
            'Die historische Einordnung (Krisenjahr 1923) fehlt.',
            'Die Interpretation bleibt zu oberflächlich und sollte vertieft werden.',
          ],
        },
      ],
    },
  },
  {
    id: 'demo_deu_003',
    studentName: 'Demo-Klausur 3',
    status: 'Bereit',
    fileName: 'demo_deutsch_klausur.pdf',
    expectationHorizonUrl: '/demo/demo_deu_003_erwartungshorizont.pdf',
    course: {
      subject: 'Deutsch',
      gradeLevel: '8',
      className: '8c',
      schoolYear: '2025/26',
    },
    analysis: {
      gesamtpunkte: 50,
      erreichtePunkte: 48,
      prozent: 96,
      zusammenfassung: 'Hervorragende Arbeit! Die Inhaltsangabe ist präzise und gut strukturiert. Die Textanalyse zeigt tiefes Textverständnis. Kleine Abzüge nur bei der Rechtschreibung ("dass" vs. "das" nochmals üben) und bei der Zitierweise (Zitate noch konsequenter mit Seitenzahlen belegen).',
      aufgaben: [
        {
          aufgabe: '1',
          maxPunkte: 20,
          erreichtePunkte: 19,
          kommentar: 'DAS WAR RICHTIG: • Du hast eine klar strukturierte und sachlich formulierte Inhaltsangabe geschrieben. • Du hast alle Hauptpersonen und die zentrale Handlung erwähnt. • Du hast den Text im Präsens verfasst.\n\nHIER GAB ES ABZÜGE: • Du hast einen kleinen Rechtschreibfehler gemacht: "das" statt "dass" nach Komma (Konjunktion).\n\nVERBESSERUNGSTIPP: • Du solltest auf "dass" nach Komma achten (Konjunktion), nicht "das" (Artikel). • Du kannst dir merken: "Es ist wichtig, dass..." ist richtig, nicht "Es ist wichtig, das...".',
          korrekturen: [
            'Rechtschreibfehler: "das" statt "dass" nach Komma (Konjunktion vs. Artikel).',
          ],
        },
        {
          aufgabe: '2',
          maxPunkte: 15,
          erreichtePunkte: 15,
          kommentar: 'DAS WAR RICHTIG: • Du hast alle sprachlichen Mittel (Metaphern, Personifikationen, Vergleiche) erkannt und mit Zeilenangaben belegt. • Du hast eine präzise Wirkungsbeschreibung geschrieben, die tiefes Textverständnis zeigt.\n\nHIER GAB ES ABZÜGE:\n\nVERBESSERUNGSTIPP: • Du hast alles perfekt gemacht! Weiter so!',
          korrekturen: [],
        },
        {
          aufgabe: '3',
          maxPunkte: 15,
          erreichtePunkte: 14,
          kommentar: 'DAS WAR RICHTIG: • Du hast deine eigene Meinung überzeugend argumentiert. • Du hast Textbezüge verwendet und deine Argumentation ist schlüssig.\n\nHIER GAB ES ABZÜGE: • Du hast bei einem Zitat die Seitenangabe vergessen. • Du solltest für eine vollständige Belegung alle Zitate mit Seitenzahlen versehen.\n\nVERBESSERUNGSTIPP: • Du solltest beim nächsten Mal alle Zitate konsequent mit Seitenzahlen belegen, zum Beispiel "vgl. S. 23" oder "Z. 45-47".',
          korrekturen: [
            'Ein Zitat hat keine Seitenangabe und sollte ergänzt werden.',
          ],
        },
      ],
    },
  },
];

/**
 * Prüft, ob die angegebenen Daten Demo-Daten sind
 */
export function isDemoData(entry: StoredResultEntry): boolean {
  return entry.id.startsWith('demo_') || entry.studentName.startsWith('Demo-Klausur') || entry.studentName.startsWith('Klausur 0');
}

/**
 * Prüft, ob ein Eintrag Demo-Daten ist (anhand des IDs)
 */
export function isDemoId(id: string): boolean {
  return id.startsWith('demo_');
}






