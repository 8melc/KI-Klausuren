import Link from 'next/link';

const features = [
  {
    title: 'Handschrift-OCR',
    text: 'Google Gemini liest Scans und PDFs zuverlässig aus – auch bei Schnellschriften.',
  },
  {
    title: 'Erwartungshorizont hochladen',
    text: 'Der hochgeladene Erwartungshorizont dient als Bewertungsgrundlage und sorgt für Fairness.',
  },
  {
    title: 'Automatische Bepunktung',
    text: 'Teilpunkte, Plausibilitätschecks und konsistente Bewertung für jede Aufgabe.',
  },
  {
    title: 'DOCX-Feedback',
    text: 'Fertiges Word-Dokument mit Kommentaren, Punktespiegel und Hinweisen für Schüler:innen.',
  },
  {
    title: 'Batch-Korrektur',
    text: 'Korrigieren Sie bis zu 10 Klausuren gleichzeitig in 4–6 Minuten Durchlaufzeit.',
  },
];

const steps = [
  {
    title: 'Erwartungshorizont bereitstellen',
    text: 'PDF hochladen – wird als Referenz für alle Korrekturen genutzt.',
    accent: 'Erwartung',
  },
  {
    title: 'Klausuren scannen & hochladen',
    text: 'PDFs oder Scans (handschriftlich) der Klasse hochladen – bis zu 10 auf einmal.',
    accent: 'Upload',
  },
  {
    title: 'KI bewertet & vergleicht',
    text: 'OCR → Analyse → Punktevergabe pro Aufgabe inkl. Erwartungshorizont-Abgleich.',
    accent: 'Analyse',
  },
  {
    title: 'DOCX-Export senden',
    text: 'Download als Word mit Kommentaren, Punktespiegel und individueller Rückmeldung.',
    accent: 'Export',
  },
];

const faqs = [
  {
    q: 'Für welche Fächer funktioniert das?',
    a: 'Alle textbasierten Fächer (Deutsch, Geschichte, Biologie, Politik, Fremdsprachen). Multiple-Choice ist ebenfalls möglich.',
  },
  {
    q: 'Wie läuft die kostenlose Testklausur?',
    a: 'Einmalig Erwartungshorizont + eine Klausur hochladen, Ergebnis als DOCX erhalten. Danach können Credits gebucht werden.',
  },
  {
    q: 'Wie steht es um Datenschutz?',
    a: 'Die Daten werden nur für die Korrektur genutzt. Keine öffentliche Speicherung, keine Weitergabe. On-Demand-Löschung möglich.',
  },
  {
    q: 'Wie lange dauert eine Korrektur?',
    a: '4–6 Minuten für bis zu 10 Klausuren, abhängig von Scan-Qualität und Umfang.',
  },
  {
    q: 'Was kostet KorrekturPilot nach dem Test?',
    a: '25er Credit-Paket für 7,90 €. Jeder Credit = eine korrigierte Klausur.',
  },
  {
    q: 'Brauche ich technische Vorkenntnisse?',
    a: 'Nein. Upload → Start → DOCX laden. Keine weiteren Tools nötig.',
  },
];

export default function Home() {
  return (
    <div className="relative min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 text-slate-900">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(30,58,138,0.12),_transparent_45%)]"
        aria-hidden
      />

      <div className="mx-auto max-w-6xl px-6 pb-20 pt-14">
        <section className="grid gap-12 rounded-3xl border border-slate-200/70 bg-white/85 p-8 shadow-xl shadow-blue-100/40 backdrop-blur lg:grid-cols-2 lg:p-12">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-4 py-2 text-xs font-semibold text-blue-900 ring-1 ring-blue-100">
              <span className="h-2 w-2 rounded-full bg-green-500" aria-hidden />
              1 kostenlose Testklausur · danach 25 Credits für 7,90 €
            </div>
            <div>
              <h1 className="text-4xl font-semibold leading-tight text-slate-900 sm:text-5xl">
                Korrigieren Sie eine Klasse in Minuten statt Stunden.
              </h1>
              <p className="mt-4 text-lg text-slate-700">
                KorrekturPilot automatisiert die komplette Klausurkorrektur: Handschrift-OCR,
                Bewertung nach Erwartungshorizont, Teilpunkte, DOCX-Feedback. Damit Sie Zeit für
                pädagogisches Feedback gewinnen.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/expectation"
                className="rounded-full bg-blue-700 px-6 py-3 text-base font-semibold text-white shadow-lg shadow-blue-200 transition hover:bg-blue-800"
              >
                Jetzt kostenlos testen
              </Link>
              <Link
                href="#example"
                className="rounded-full border border-slate-200 px-6 py-3 text-base font-semibold text-slate-800 hover:border-blue-200 hover:text-blue-700"
              >
                Beispielklausur ansehen
              </Link>
              <Link
                href="#steps"
                className="rounded-full border border-transparent px-6 py-3 text-base font-semibold text-blue-700 hover:text-blue-800"
              >
                Step-by-Step
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              {[{ label: 'Zeitersparnis', value: '-75%' }, { label: 'Fairness', value: 'konstant' }, { label: 'Durchlauf', value: '4–6 Min' }, { label: 'Batch', value: '10 PDFs' }].map((item) => (
                <div key={item.label} className="rounded-xl border border-slate-200 bg-slate-50/80 px-4 py-3 text-center">
                  <p className="text-xl font-semibold text-blue-700">{item.value}</p>
                  <p className="text-xs text-slate-600">{item.label}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="space-y-4">
            <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-700 p-[1px] shadow-lg shadow-blue-200">
              <div className="rounded-[1.1rem] bg-white/95 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-blue-700">Ablauf</p>
                    <p className="text-lg font-semibold text-slate-900">Korrektur in 4 Schritten</p>
                  </div>
                  <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-800">4–6 Min</span>
                </div>
                <div className="mt-4 space-y-3">
                  {steps.map((step, index) => (
                    <div key={step.title} className="flex gap-3 rounded-xl border border-slate-100 bg-slate-50/70 p-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-700 text-base font-semibold text-white shadow-sm shadow-blue-200">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-semibold text-slate-900">{step.title}</p>
                          <span className="rounded-full bg-blue-50 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-blue-700">
                            {step.accent}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600">{step.text}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-2xl border border-blue-100 bg-blue-50/70 p-4 shadow-inner">
                <p className="text-sm font-semibold text-blue-900">Dokumenten-Output</p>
                <p className="text-xs text-blue-800">Word (.docx) mit Kommentaren, Punktespiegel, Feedback</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white/70 p-4 shadow-inner">
                <p className="text-sm font-semibold text-slate-900">Batch-Korrektur</p>
                <p className="text-xs text-slate-600">Bis zu 10 Klausuren parallel laden und abschließen</p>
              </div>
            </div>
          </div>
        </section>

        <section id="problem" className="mt-16 grid gap-6 rounded-3xl border border-slate-200/70 bg-white/85 p-8 shadow-lg shadow-blue-100/40 lg:grid-cols-2 lg:p-12">
          <div className="space-y-4">
            <p className="text-sm font-semibold uppercase tracking-wide text-blue-700">Problem</p>
            <h2 className="text-3xl font-semibold text-slate-900">Korrigieren frisst Abende – und bleibt subjektiv.</h2>
            <p className="text-base text-slate-700">
              Handschriftliche Klassenarbeiten kosten pro Schüler:in 10–20 Minuten. Bei 25–30
              Schüler:innen summiert sich das auf Stunden – mit Fehleranfälligkeit und Uneinheitlichkeit.
              Allgemeine KI-Tools helfen nur begrenzt, weil sie nicht auf Erwartungshorizonte ausgelegt sind.
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              {['Zeitverlust pro Klasse', 'Inkonstante Bewertung', 'Subjektive Abzüge', 'Fehleranfällige Nacharbeit'].map((item) => (
                <div key={item} className="rounded-xl border border-slate-200 bg-slate-50/60 px-4 py-3 text-sm font-semibold text-slate-800">
                  • {item}
                </div>
              ))}
            </div>
          </div>
          <div className="space-y-4">
            <p className="text-sm font-semibold uppercase tracking-wide text-green-700">Lösung</p>
            <h3 className="text-2xl font-semibold text-slate-900">KorrekturPilot automatisiert den kompletten Ablauf.</h3>
            <ul className="space-y-3 text-slate-700">
              <li className="flex gap-3">
                <span className="mt-1 h-5 w-5 rounded-full bg-green-100 text-center text-green-700">✓</span>
                Handschrift-OCR + Erwartungshorizont-Abgleich für faire, neutrale Bewertungen
              </li>
              <li className="flex gap-3">
                <span className="mt-1 h-5 w-5 rounded-full bg-green-100 text-center text-green-700">✓</span>
                Teilpunkte, Punktespiegel, Feedback und Export als professionelles DOCX
              </li>
              <li className="flex gap-3">
                <span className="mt-1 h-5 w-5 rounded-full bg-green-100 text-center text-green-700">✓</span>
                Batch-Korrektur von bis zu 10 Klausuren in 4–6 Minuten
              </li>
              <li className="flex gap-3">
                <span className="mt-1 h-5 w-5 rounded-full bg-green-100 text-center text-green-700">✓</span>
                Fokus verschiebt sich von Fehler-Suche zu pädagogischem Feedback
              </li>
            </ul>
            <div className="mt-4 flex flex-wrap gap-3">
              <Link
                href="/upload"
                className="rounded-full bg-blue-700 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-200 transition hover:bg-blue-800"
              >
                Kostenlos starten
              </Link>
              <Link
                href="#pricing"
                className="rounded-full border border-slate-200 px-5 py-3 text-sm font-semibold text-blue-700 hover:border-blue-200"
              >
                Preise ansehen
              </Link>
            </div>
          </div>
        </section>

        <section id="features" className="mt-16 space-y-8">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-blue-700">Funktionen</p>
              <h2 className="text-3xl font-semibold text-slate-900">Entwickelt für Lehrkräfte – nicht für KI-Bastler.</h2>
              <p className="mt-2 text-slate-700">Alles, was Sie für schnelle, faire Korrekturen brauchen – ohne Setup-Aufwand.</p>
            </div>
            <Link
              href="/expectation"
              className="hidden rounded-full border border-blue-100 px-4 py-2 text-sm font-semibold text-blue-700 hover:border-blue-200 hover:bg-blue-50 md:inline-flex"
            >
              Erwartungshorizont hochladen
            </Link>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="group rounded-2xl border border-slate-200 bg-white/85 p-6 shadow-sm shadow-blue-50 transition hover:-translate-y-1 hover:border-blue-200 hover:shadow-lg hover:shadow-blue-100/50"
              >
                <div className="mb-4 inline-flex rounded-xl bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-800">
                  {feature.title}
                </div>
                <p className="text-sm text-slate-700">{feature.text}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="steps" className="mt-16 rounded-3xl border border-slate-200/70 bg-white/85 p-8 shadow-lg shadow-blue-100/40 lg:p-12">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-blue-700">Ablauf</p>
              <h2 className="text-3xl font-semibold text-slate-900">In 4 Schritten zur fertigen DOCX-Korrektur.</h2>
              <p className="mt-2 text-slate-700">Upload → Analyse → Bepunktung → Export. Keine technischen Vorkenntnisse nötig.</p>
            </div>
            <Link
              href="/upload"
              className="rounded-full bg-blue-700 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-200 transition hover:bg-blue-800"
            >
              Jetzt ausprobieren
            </Link>
          </div>
          <div className="mt-8 grid gap-6 lg:grid-cols-2">
            {steps.map((step, index) => (
              <div key={step.title} className="flex gap-4 rounded-2xl border border-slate-200 bg-slate-50/60 p-5 shadow-sm">
                <div className="mt-1 h-10 w-10 rounded-full bg-blue-700 text-center text-lg font-semibold text-white shadow-sm shadow-blue-200">
                  {index + 1}
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <p className="text-lg font-semibold text-slate-900">{step.title}</p>
                    <span className="rounded-full bg-blue-50 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-blue-700">
                      {step.accent}
                    </span>
                  </div>
                  <p className="text-sm text-slate-700">{step.text}</p>
                  <div className="h-24 rounded-xl border border-dashed border-blue-100 bg-gradient-to-br from-slate-100 to-blue-50 grid place-items-center text-xs font-semibold text-blue-700">
                    Platzhalter für Schritt-Visual ({step.accent})
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section id="example" className="mt-16 grid gap-8 rounded-3xl border border-slate-200/70 bg-white/85 p-8 shadow-lg shadow-blue-100/40 lg:grid-cols-[1.3fr_1fr] lg:p-12">
          <div className="space-y-4">
            <p className="text-sm font-semibold uppercase tracking-wide text-blue-700">Beispiel</p>
            <h2 className="text-3xl font-semibold text-slate-900">Wie sieht das Ergebnis aus?</h2>
            <p className="text-slate-700">
              Sie erhalten ein sauberes Word-Dokument mit Punktespiegel, kommentierten Aufgaben und kurzer
              Rückmeldung an die Klasse. Ideal zum direkten Versand oder Ausdruck.
            </p>
            <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-blue-700 text-center text-lg font-semibold text-white">DOCX</div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">Feedback.docx</p>
                    <p className="text-xs text-slate-600">Exportiert am 10. März · 4 Seiten</p>
                  </div>
                </div>
                <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700">Korrektur fertig</span>
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-800">
                  <p className="font-semibold text-blue-700">Aufgabe 1 · 9/10</p>
                  <p className="text-xs text-slate-600">Teilpunkte für korrekte Argumentation, fehlende Quellenangabe markiert.</p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-800">
                  <p className="font-semibold text-blue-700">Aufgabe 2 · 7/8</p>
                  <p className="text-xs text-slate-600">Knapper Erwartungshorizont-Abgleich, Hinweise zu Struktur ergänzt.</p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-800">
                  <p className="font-semibold text-blue-700">Punktespiegel</p>
                  <p className="text-xs text-slate-600">Gesamt 23/26 · Note 1- · Kommentare pro Teilaufgabe im Dokument.</p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-800">
                  <p className="font-semibold text-blue-700">Klassenfeedback</p>
                  <p className="text-xs text-slate-600">Stärken hervorgehoben, nächste Übungsschritte vorgeschlagen.</p>
                </div>
              </div>
            </div>
          </div>
          <div className="space-y-4">
            <div className="rounded-2xl border border-blue-100 bg-blue-50/70 p-6 shadow-inner">
              <p className="text-sm font-semibold text-blue-900">OCR → Analyse → DOCX</p>
              <p className="mt-2 text-sm text-blue-800">Handschrift wird lesbar, Erwartungshorizont wird angewendet, Feedback wird strukturiert ausgeliefert.</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white/85 p-6">
              <p className="text-sm font-semibold text-slate-900">Warum DOCX?</p>
              <ul className="mt-2 space-y-2 text-sm text-slate-700">
                <li>• Direkt editierbar und personalisierbar</li>
                <li>• Kompatibel mit Schulservern und Mailversand</li>
                <li>• Saubere Formatierung für Ausdruck und Weitergabe</li>
              </ul>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-6">
              <p className="text-sm font-semibold text-slate-900">Zeitbedarf</p>
              <p className="text-2xl font-semibold text-blue-700">4–6 Minuten</p>
              <p className="text-sm text-slate-600">Für bis zu 10 Klausuren gleichzeitig.</p>
            </div>
          </div>
        </section>

        <section id="pricing" className="mt-16 grid gap-6 rounded-3xl border border-slate-200/70 bg-white/85 p-8 shadow-lg shadow-blue-100/40 lg:grid-cols-3 lg:p-12">
          <div className="lg:col-span-1">
            <p className="text-sm font-semibold uppercase tracking-wide text-blue-700">Pricing</p>
            <h2 className="text-3xl font-semibold text-slate-900">Sofort starten, fair bezahlen.</h2>
            <p className="mt-2 text-slate-700">Eine kostenlose Testklausur. Danach Credits buchen, wenn es passt.</p>
            <div className="mt-6 inline-flex items-center gap-2 rounded-full bg-green-50 px-4 py-2 text-xs font-semibold text-green-700 ring-1 ring-green-100">
              Keine Abo-Falle · On-Demand Credits
            </div>
          </div>
          <div className="lg:col-span-2 grid gap-6 md:grid-cols-2">
            <div className="flex flex-col justify-between rounded-2xl border border-blue-200 bg-blue-700 text-white shadow-xl shadow-blue-200">
              <div className="space-y-3 p-8">
                <p className="text-sm font-semibold uppercase tracking-wide">Testen</p>
                <h3 className="text-2xl font-semibold">1 kostenlose Klausur</h3>
                <p className="text-sm text-blue-50">Volle Funktionalität, keine Zahlungsdaten erforderlich.</p>
                <ul className="space-y-2 text-sm text-blue-50/90">
                  <li>• Erwartungshorizont-Upload</li>
                  <li>• Handschrift-OCR</li>
                  <li>• DOCX-Feedback</li>
                </ul>
              </div>
              <Link
                href="/expectation"
                className="m-6 rounded-full bg-white px-5 py-3 text-center text-sm font-semibold text-blue-700 shadow-md shadow-blue-200 transition hover:scale-[1.01]"
              >
                Jetzt gratis testen
              </Link>
            </div>
            <div className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white/90 shadow-xl shadow-blue-100/40">
              <div className="space-y-3 p-8">
                <p className="text-sm font-semibold uppercase tracking-wide text-blue-700">Danach</p>
                <h3 className="text-2xl font-semibold text-slate-900">25 Credits · 7,90 €</h3>
                <p className="text-sm text-slate-700">1 Credit = 1 korrigierte Klausur. Ideal für eine komplette Klasse.</p>
                <ul className="space-y-2 text-sm text-slate-700">
                  <li>• Batch-Korrektur bis 10 PDFs</li>
                  <li>• Erwartungshorizont als Grundlage</li>
                  <li>• Export als DOCX</li>
                  <li>• Fairness &amp; Konsistenz gesichert</li>
                </ul>
              </div>
              <Link
                href="/upload"
                className="m-6 rounded-full bg-blue-700 px-5 py-3 text-center text-sm font-semibold text-white shadow-lg shadow-blue-200 transition hover:bg-blue-800"
              >
                Credits sichern
              </Link>
            </div>
          </div>
        </section>

        <section id="faq" className="mt-16 rounded-3xl border border-slate-200/70 bg-white/85 p-8 shadow-lg shadow-blue-100/40 lg:p-12">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-blue-700">FAQ</p>
              <h2 className="text-3xl font-semibold text-slate-900">Häufige Fragen.</h2>
              <p className="mt-2 text-slate-700">Alles Wichtige zu Einsatz, Kosten und Datenschutz.</p>
            </div>
            <Link
              href="/results"
              className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-blue-700 hover:border-blue-200"
            >
              Beispielergebnisse ansehen
            </Link>
          </div>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {faqs.map((item) => (
              <details key={item.q} className="group rounded-2xl border border-slate-200 bg-white/75 p-4 shadow-sm">
                <summary className="flex cursor-pointer items-center justify-between gap-3 text-sm font-semibold text-slate-900">
                  {item.q}
                  <span className="rounded-full bg-blue-50 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-blue-700">Mehr</span>
                </summary>
                <p className="mt-2 text-sm text-slate-700">{item.a}</p>
              </details>
            ))}
          </div>
        </section>

        <section className="mt-16 rounded-3xl border border-blue-200 bg-gradient-to-r from-blue-700 to-indigo-700 p-[1px] shadow-2xl shadow-blue-200">
          <div className="rounded-[1.4rem] bg-white/95 px-8 py-10 lg:px-12 lg:py-12">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-wide text-blue-700">Bereit?</p>
                <h2 className="text-3xl font-semibold text-slate-900">Starten Sie die kostenlose Testklausur.</h2>
                <p className="mt-2 text-slate-700">Weniger Korrekturzeit, mehr pädagogisches Feedback – ab heute.</p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Link
                  href="/expectation"
                  className="rounded-full bg-blue-700 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-200 transition hover:bg-blue-800"
                >
                  Jetzt kostenlos testen
                </Link>
                <Link
                  href="#steps"
                  className="rounded-full border border-slate-200 px-6 py-3 text-sm font-semibold text-blue-700 hover:border-blue-200"
                >
                  Ablauf ansehen
                </Link>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
