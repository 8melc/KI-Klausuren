const { GoogleGenerativeAI } = require('@google/generative-ai');
const fs = require('fs');
const path = require('path');

// Lese .env.local manuell
function loadEnv() {
  try {
    const envPath = path.join(__dirname, '.env.local');
    const envFile = fs.readFileSync(envPath, 'utf8');
    const envVars = {};
    
    envFile.split('\n').forEach(line => {
      const match = line.match(/^([^=]+)=(.*)$/);
      if (match) {
        envVars[match[1].trim()] = match[2].trim();
      }
    });
    
    Object.assign(process.env, envVars);
  } catch (error) {
    console.error('⚠️  Warnung: .env.local nicht gefunden');
  }
}

loadEnv();

if (!process.env.GOOGLE_AI_KEY) {
  console.error('❌ FEHLER: GOOGLE_AI_KEY nicht in .env.local gefunden!');
  console.error('💡 Stelle sicher, dass GOOGLE_AI_KEY=... in .env.local steht');
  process.exit(1);
}

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_KEY);

async function testModels() {
  console.log('🔍 Teste verfügbare Gemini Models...\n');
  console.log('API Key:', process.env.GOOGLE_AI_KEY.substring(0, 10) + '...\n');

  const modelsToTest = [
    'gemini-1.5-flash',
    'gemini-1.5-flash-8b',
    'gemini-1.5-pro',
    'gemini-2.0-flash-exp',
    'gemini-pro',
  ];

  for (const modelName of modelsToTest) {
    try {
      console.log(`📝 Teste: ${modelName}...`);
      const model = genAI.getGenerativeModel({ model: modelName });
      
      const result = await model.generateContent([
        'Antworte nur mit "OK" wenn du funktionierst.'
      ]);

      const response = result.response.text();
      console.log(`✅ ${modelName} funktioniert! Antwort: ${response.substring(0, 50)}`);
      console.log('---');
    } catch (error) {
      if (error.status === 404) {
        console.log(`❌ ${modelName} - Model nicht gefunden (404)`);
      } else if (error.status === 429) {
        console.log(`⚠️  ${modelName} - Rate Limit erreicht (429)`);
      } else {
        console.log(`❌ ${modelName} - Fehler: ${error.message}`);
      }
      console.log('---');
    }
  }

  console.log('\n✨ Test abgeschlossen!');
}

async function listModels() {
  try {
    // Hinweis: listModels() existiert möglicherweise nicht direkt
    // Wir testen stattdessen die Models manuell
    console.log('ℹ️  Hinweis: listModels() API existiert nicht direkt.\n');
    console.log('📋 Teste stattdessen bekannte Model-Namen...\n');
    
    await testModels();
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.log('\n💡 Fallback: Teste Models manuell...\n');
    await testModels();
  }
}

listModels();

