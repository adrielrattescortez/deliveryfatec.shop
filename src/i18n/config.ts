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

// Função para obter idioma da URL
const getLanguageFromURL = () => {
  const params = new URLSearchParams(window.location.search);
  const langParam = params.get('lang');
  if (langParam && ['en', 'es', 'it'].includes(langParam)) {
    return langParam;
  }
  return null;
};

// Prioridade: URL > localStorage > 'en'
const initialLanguage = getLanguageFromURL() || localStorage.getItem('language') || 'en';

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
i18n.on('languageChanged', (lng) => {
  localStorage.setItem('language', lng);
  
  // Atualizar URL com o idioma
  const url = new URL(window.location.href);
  url.searchParams.set('lang', lng);
  window.history.replaceState({}, '', url.toString());
});

export default i18n;
