#!/usr/bin/env node

/**
 * Performance-Analyse für Batch-Läufe
 * 
 * Verwendung:
 * 1. Terminal-Output in eine Datei kopieren (z.B. terminal-output.txt)
 * 2. node analyze-performance.js < terminal-output.txt
 * 
 * Oder:
 * node analyze-performance.js terminal-output.txt
 */

const fs = require('fs');

// Lese Input (entweder Datei oder stdin)
let input = '';
if (process.argv[2]) {
  input = fs.readFileSync(process.argv[2], 'utf-8');
} else {
  input = fs.readFileSync(0, 'utf-8');
}

const lines = input.split('\n');

// Regex-Patterns
const patterns = {
  uploadUrl: /POST \/api\/upload-url|Starte Handschrift-Extraktion/i,
  extractStart: /POST \/api\/extract-klausur|Starte Handschrift-Extraktion/i,
  extractComplete: /POST \/api\/extract-klausur.*200.*in (\d+\.?\d*)s/i,
  analyzeStart: /POST \/api\/analyze/i,
  analyzeComplete: /\s+POST \/api\/analyze.*200.*in (\d+\.?\d*)s/i,
  timestamp: /(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z|\d{2}:\d{2}:\d{2})/,
};

// Sammle Events
const events = [];
const extractTimes = [];
const analyzeTimes = [];

let firstTimestamp = null;
let lastTimestamp = null;

lines.forEach((line, index) => {
  // Timestamp extrahieren
  const timestampMatch = line.match(patterns.timestamp);
  const timestamp = timestampMatch ? timestampMatch[1] : null;
  
  // Upload-URL Start
  if (patterns.uploadUrl.test(line)) {
    if (!firstTimestamp && timestamp) firstTimestamp = timestamp;
    events.push({ type: 'upload-start', line: index + 1, timestamp, raw: line });
  }
  
  // Extract Start
  if (patterns.extractStart.test(line) && !patterns.extractComplete.test(line)) {
    events.push({ type: 'extract-start', line: index + 1, timestamp, raw: line });
  }
  
  // Extract Complete mit Timing
  const extractMatch = line.match(patterns.extractComplete);
  if (extractMatch) {
    const duration = parseFloat(extractMatch[1]);
    extractTimes.push(duration);
    events.push({ 
      type: 'extract-complete', 
      line: index + 1, 
      timestamp, 
      duration,
      raw: line 
    });
    if (timestamp) lastTimestamp = timestamp;
  }
  
  // Analyze Start
  if (patterns.analyzeStart.test(line) && !patterns.analyzeComplete.test(line)) {
    events.push({ type: 'analyze-start', line: index + 1, timestamp, raw: line });
  }
  
  // Analyze Complete mit Timing
  const analyzeMatch = line.match(patterns.analyzeComplete);
  if (analyzeMatch) {
    const duration = parseFloat(analyzeMatch[1]);
    analyzeTimes.push(duration);
    events.push({ 
      type: 'analyze-complete', 
      line: index + 1, 
      timestamp, 
      duration,
      raw: line 
    });
    if (timestamp) lastTimestamp = timestamp;
  }
});

// Berechne Gesamtdauer
let totalDuration = null;
if (firstTimestamp && lastTimestamp) {
  // Versuche Timestamps zu parsen
  try {
    const start = new Date(firstTimestamp);
    const end = new Date(lastTimestamp);
    if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
      totalDuration = (end - start) / 1000; // in Sekunden
    }
  } catch (e) {
    // Fallback: Nutze Summe der gemessenen Zeiten
    totalDuration = extractTimes.reduce((a, b) => a + b, 0) + 
                    analyzeTimes.reduce((a, b) => a + b, 0);
  }
}

// Fallback: Summe aller gemessenen Zeiten
if (!totalDuration || isNaN(totalDuration)) {
  totalDuration = extractTimes.reduce((a, b) => a + b, 0) + 
                  analyzeTimes.reduce((a, b) => a + b, 0);
}

// Statistiken
const numKlausuren = Math.max(extractTimes.length, analyzeTimes.length);
const avgPerKlausur = totalDuration / numKlausuren;

const extractStats = {
  count: extractTimes.length,
  total: extractTimes.reduce((a, b) => a + b, 0),
  avg: extractTimes.length > 0 ? extractTimes.reduce((a, b) => a + b, 0) / extractTimes.length : 0,
  min: extractTimes.length > 0 ? Math.min(...extractTimes) : 0,
  max: extractTimes.length > 0 ? Math.max(...extractTimes) : 0,
};

const analyzeStats = {
  count: analyzeTimes.length,
  total: analyzeTimes.reduce((a, b) => a + b, 0),
  avg: analyzeTimes.length > 0 ? analyzeTimes.reduce((a, b) => a + b, 0) / analyzeTimes.length : 0,
  min: analyzeTimes.length > 0 ? Math.min(...analyzeTimes) : 0,
  max: analyzeTimes.length > 0 ? Math.max(...analyzeTimes) : 0,
};

// Kombinierte Durchläufe (Extract + Analyze pro Klausur)
const combinedTimes = [];
const minLength = Math.min(extractTimes.length, analyzeTimes.length);
for (let i = 0; i < minLength; i++) {
  combinedTimes.push(extractTimes[i] + analyzeTimes[i]);
}

// Output
console.log('\n═══════════════════════════════════════════════════════════');
console.log('📊 PERFORMANCE-ANALYSE: BATCH-LAUF (16 KLAUSUREN)');
console.log('═══════════════════════════════════════════════════════════\n');

console.log('📈 GESAMTSTATISTIKEN:');
console.log(`   Anzahl Klausuren: ${numKlausuren}`);
console.log(`   Gesamtdauer: ${totalDuration.toFixed(1)}s (${(totalDuration / 60).toFixed(1)} Min)`);
console.log(`   Durchschnitt pro Klausur: ${avgPerKlausur.toFixed(1)}s\n`);

if (combinedTimes.length > 0) {
  console.log('⚡ DURCHLAUF-GESCHWINDIGKEIT:');
  console.log(`   Schnellster Durchlauf: ${Math.min(...combinedTimes).toFixed(1)}s`);
  console.log(`   Langsamster Durchlauf: ${Math.max(...combinedTimes).toFixed(1)}s`);
  console.log(`   Durchschnitt: ${(combinedTimes.reduce((a, b) => a + b, 0) / combinedTimes.length).toFixed(1)}s\n`);
}

console.log('🔍 FLASCHENHALS-ANALYSE:\n');

console.log('   Extraktion (extract-klausur):');
console.log(`      Anzahl: ${extractStats.count}`);
console.log(`      Gesamt: ${extractStats.total.toFixed(1)}s`);
console.log(`      Durchschnitt: ${extractStats.avg.toFixed(1)}s`);
console.log(`      Min: ${extractStats.min.toFixed(1)}s | Max: ${extractStats.max.toFixed(1)}s\n`);

console.log('   Analyse (analyze):');
console.log(`      Anzahl: ${analyzeStats.count}`);
console.log(`      Gesamt: ${analyzeStats.total.toFixed(1)}s`);
console.log(`      Durchschnitt: ${analyzeStats.avg.toFixed(1)}s`);
console.log(`      Min: ${analyzeStats.min.toFixed(1)}s | Max: ${analyzeStats.max.toFixed(1)}s\n`);

// Flaschenhals-Identifikation
const extractAvg = extractStats.avg;
const analyzeAvg = analyzeStats.avg;
const bottleneck = extractAvg > analyzeAvg ? 'Extraktion' : 'Analyse';
const ratio = extractAvg > analyzeAvg ? (extractAvg / analyzeAvg).toFixed(1) : (analyzeAvg / extractAvg).toFixed(1);

console.log('   🎯 FLASCHENHALS:');
console.log(`      ${bottleneck} ist der Hauptfaktor (${ratio}x langsamer)\n`);

// Zeitverteilung
const extractPercentage = (extractStats.total / totalDuration * 100).toFixed(1);
const analyzePercentage = (analyzeStats.total / totalDuration * 100).toFixed(1);

console.log('   Zeitverteilung:');
console.log(`      Extraktion: ${extractPercentage}%`);
console.log(`      Analyse: ${analyzePercentage}%\n`);

console.log('═══════════════════════════════════════════════════════════\n');

// Detaillierte Liste (optional)
if (process.argv.includes('--verbose')) {
  console.log('📋 DETAILLIERTE EREIGNISSE:\n');
  events.forEach((event, i) => {
    console.log(`${i + 1}. [${event.type}] Zeile ${event.line}${event.duration ? ` - ${event.duration.toFixed(1)}s` : ''}`);
  });
}

