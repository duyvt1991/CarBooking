import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import translationVN from './locales/vn.json';
import translationJP from './locales/jp.json';

const resources = {
  vn: {
    translation: translationVN
  },
  jp: {
    translation: translationJP
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'vn',
    fallbackLng: 'vn',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
