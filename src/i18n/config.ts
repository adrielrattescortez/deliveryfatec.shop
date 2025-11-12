import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from '@/locales/en/translation.json';
import es from '@/locales/es/translation.json';
import it from '@/locales/it/translation.json';

const resources = {
  en: { translation: en },
  es: { translation: es },
  it: { translation: it },
};

// Função para obter idioma da URL - VERIFICA SE ESTÁ NO BROWSER
const getLanguageFromURL = () => {
  // ✅ Verifica se window existe antes de acessar
  if (typeof window === 'undefined') {
    return null;
  }
  
  try {
    const params = new URLSearchParams(window.location.search);
    const langParam = params.get('lang');
    if (langParam && ['en', 'es', 'it'].includes(langParam)) {
      return langParam;
    }
  } catch (error) {
    console.error('Error getting language from URL:', error);
  }
  return null;
};

// Prioridade: URL > localStorage > 'en'
// ✅ Verifica se localStorage existe antes de acessar
const getInitialLanguage = () => {
  const urlLang = getLanguageFromURL();
  if (urlLang) return urlLang;
  
  if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
    try {
      return localStorage.getItem('language') || 'en';
    } catch (error) {
      console.error('Error accessing localStorage:', error);
    }
  }
  
  return 'en';
};

const initialLanguage = getInitialLanguage();

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: initialLanguage,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
  });

// Sincronizar mudanças de idioma com URL e localStorage
// ✅ Verifica se está no browser antes de acessar
i18n.on('languageChanged', (lng) => {
  // Só acessa localStorage se estiver no browser
  if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
    try {
      localStorage.setItem('language', lng);
    } catch (error) {
      console.error('Error saving language to localStorage:', error);
    }
  }
  
  // Só atualiza URL se estiver no browser
  if (typeof window !== 'undefined') {
    try {
      const url = new URL(window.location.href);
      url.searchParams.set('lang', lng);
      window.history.replaceState({}, '', url.toString());
    } catch (error) {
      console.error('Error updating URL with language:', error);
    }
  }
});

export default i18n;
