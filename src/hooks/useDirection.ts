import { useTranslation } from 'react-i18next';

export type Direction = 'rtl' | 'ltr';

export const useDirection = () => {
  const { i18n } = useTranslation();
  const dir: Direction = i18n.dir();
  const isRtl = dir === 'rtl';
  const isLtr = dir === 'ltr';

  return { dir, isRtl, isLtr, language: i18n.language };
};
