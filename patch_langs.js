import fs from 'fs';
import path from 'path';

function addKeys(langFile, newKeys) {
  const filePath = path.join(process.cwd(), 'public/locales', langFile);
  const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  let modified = false;
  for (const [k, v] of Object.entries(newKeys)) {
    if (!data[k]) {
      data[k] = v;
      modified = true;
    } else if (data[k] === 'Back to Home' || data[k] === 'Incoming Live Diagnostic') {
      data[k] = v;
      modified = true;
    }
  }
  
  if (modified) {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    console.log(`Updated ${langFile}`);
  }
}

addKeys('fr.json', {
  'back_to_home': 'Retour à l\'accueil',
  'incoming_diagnostic': 'Appel vidéo entrant',
  'accept': 'Accepter',
  'reject': 'Refuser',
  'from': 'de'
});

addKeys('ar.json', {
  'back_to_home': 'العودة للرئيسية',
  'incoming_diagnostic': 'مكالمة فيديو واردة',
  'accept': 'قبول',
  'reject': 'رفض',
  'from': 'من'
});
