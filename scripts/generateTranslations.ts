import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const API_KEY = process.env.VITE_GOOGLE_TRANSLATE_API_KEY;
const TARGET_LANGS = ['es', 'fr', 'pt', 'de', 'ar', 'hi', 'bn', 'zh', 'ja', 'id', 'tr', 'vi', 'ko', 'ru', 'it', 'pl', 'th', 'tl'];

const stringsToTranslate = {
  "welcome_title": "Every identity, every strength, every piece of you is a star in your sky.",
  "welcome_subtitle": "Let's create your constellation.",
  "start_button": "Start",
  "my_constellations": "My Constellations",
  "selection_title": "Choose your stars",
  "selection_desc": "Select the qualities and identities that resonate with you today.",
  "selection_instruction": "Tap stars to add parts of who you are.",
  "selection_box_instruction": "Choose a star and name a strength, identity, or quality that shines in you.",
  "placeholder_word": "Type a word…",
  "add_button": "Add",
  "view_constellation": "View My Constellation",
  "stars_labeled": "stars labeled",
  "reflection_text_1": "Every star is a part of who you are.",
  "reflection_text_2": "Together they create a constellation that is uniquely yours.",
  "back": "Back",
  "complete": "Complete",
  "reflection_title": "Your Identity Constellation",
  "save": "Save",
  "create_another": "Create Another",
  "history_title": "Saved Constellations",
  "view": "View",
  "delete": "Delete",
  "not_found": "Oops! Page not found",
  "go_home": "Return to Home",
  "prompt_1": "What part of you shines here?",
  "prompt_2": "Add a word that represents you.",
  "prompt_3": "What strength lives in this star?",
  "prompt_4": "Name something that makes you you.",
  "prompt_5": "What quality lights up your sky?",
  "prompt_6": "What part of your story belongs here?",
  "prompt_7": "What strength has carried you forward?",
  "prompt_8": "What word describes a piece of your identity?",
  "prompt_9": "What part of yourself are you proud of?",
  "prompt_10": "What inner light does this star hold?",
  "suggest_1": "courage",
  "suggest_2": "creative",
  "suggest_3": "soft",
  "suggest_4": "queer",
  "suggest_5": "survivor",
  "suggest_6": "resilient",
  "suggest_7": "friend",
  "suggest_8": "kind",
  "suggest_9": "dreamer",
  "suggest_10": "curious"
};

async function translateText(text: string, targetLang: string) {
  const url = `https://translation.googleapis.com/language/translate/v2?key=${API_KEY}`;
  try {
    const response = await fetch(url, {
      method: 'POST',
      body: JSON.stringify({
        q: text,
        target: targetLang
      })
    });
    const data: any = await response.json();
    if (data.error) {
      console.error(`API Error: ${data.error.message}`);
      throw new Error(data.error.message);
    }
    return data.data.translations[0].translatedText;
  } catch (err: any) {
    console.error(`Failed to translate "${text}" to ${targetLang}: ${err.message}`);
    throw err;
  }
}

async function generate() {
  const baseDir = path.join(__dirname, '../src/i18n/locales');
  
  // Save English first
  fs.writeFileSync(path.join(baseDir, 'en.json'), JSON.stringify(stringsToTranslate, null, 2));

  for (const lang of TARGET_LANGS) {
    console.log(`Translating to ${lang}...`);
    const translated: any = {};
    for (const [key, value] of Object.entries(stringsToTranslate)) {
      translated[key] = await translateText(value, lang);
    }
    fs.writeFileSync(path.join(baseDir, `${lang}.json`), JSON.stringify(translated, null, 2));
  }
}

generate().catch(console.error);
