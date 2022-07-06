import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import zhTranslate from '../../assets/translate/zh.json';
import enTranslate from '../../assets/translate/en.json';


export const LANGUAGE_ZH = 'zh';
export const LANGUAGE_EN = 'en';

const getDefaultLanguage = () => {
  const language = window.navigator.language;
  if (new RegExp(LANGUAGE_ZH).test(language)) return LANGUAGE_ZH;
  if (new RegExp(LANGUAGE_EN).test(language)) return LANGUAGE_EN;
  return LANGUAGE_EN;
};

export const initI18n = () => {
	i18n
  .use(initReactI18next)
  .init({
    resources: {
      [LANGUAGE_EN]: {
				translation: enTranslate,
			},
      [LANGUAGE_ZH]: {
				translation: zhTranslate,
			}
    },
    lng: getDefaultLanguage(),
    fallbackLng: LANGUAGE_EN,

    interpolation: {
      escapeValue: false 
    }
  });
};