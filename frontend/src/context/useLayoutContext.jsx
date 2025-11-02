import useToggle from '@/hooks/useToggle';
import { toggleDocumentAttribute } from '@/utils/layout';
import { createContext, useContext, useMemo, useState } from 'react';


const ThemeContext = createContext(undefined);
const useLayoutContext = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useLayoutContext can only be used within LayoutProvider');
  }
  return context;
};
const storageThemeKey = 'EDUVERSE_THEME_KEY';
const themeKey = 'data-bs-theme';

const LayoutProvider = ({ children }) => {
  const getSavedTheme = () => {
    const foundTheme = localStorage.getItem(storageThemeKey);
    const preferredTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';

    if (foundTheme) {
      if (foundTheme === 'auto') {
        toggleDocumentAttribute(themeKey, preferredTheme);
        return preferredTheme;
      }

      toggleDocumentAttribute(themeKey, foundTheme);

      return foundTheme == 'dark' ? 'dark' : 'light';
    } else {
      localStorage.setItem(storageThemeKey, preferredTheme);
      return preferredTheme;
    }
  };

  const INIT_STATE = { theme: getSavedTheme() };
  const [settings, setSettings] = useState(INIT_STATE);
  const { isTrue, toggle } = useToggle();

  // update settings
  const updateSettings = _newSettings => setSettings({
    ...settings,
    ..._newSettings
  });

  // update theme mode
  const changeTheme = newTheme => {
    const foundTheme = localStorage.getItem(themeKey);

    if (foundTheme !== newTheme) {
      toggleDocumentAttribute(themeKey, newTheme);
      localStorage.setItem(storageThemeKey, newTheme);
      updateSettings({
        ...settings,
        theme: newTheme
      });
    }
  };

  const appMenuControl = { open: isTrue, toggle: toggle };

  return (
    <ThemeContext.Provider value={useMemo(() => ({
      ...settings,
      theme: settings.theme,
      changeTheme,
      appMenuControl
    }), [settings, isTrue])}>
      {children}
    </ThemeContext.Provider>
  );
};

export { LayoutProvider, useLayoutContext };
