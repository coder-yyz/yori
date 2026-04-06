import 'src/global.css';

import { useEffect } from 'react';

import { usePathname } from 'src/routes/hooks';
import { Snackbar } from 'src/components/Snackbar';
import { LocalizationProvider } from 'src/locales';
import { themeConfig, ThemeProvider } from 'src/theme';
import { ProgressBar } from 'src/components/ProgressBar';
import { I18nProvider } from 'src/locales/i18n-provider';
import { MotionLazy } from 'src/components/Animate/motion-lazy';
import { AuthProvider as JwtAuthProvider } from 'src/auth/context/jwt';
import { SettingsDrawer, defaultSettings, SettingsProvider } from 'src/components/Settings';

// ----------------------------------------------------------------------

const AuthProvider = JwtAuthProvider;

// ----------------------------------------------------------------------

type AppProps = {
  children: React.ReactNode;
};

export default function App({ children }: AppProps) {
  useScrollToTop();

  return (
    <I18nProvider>
      <AuthProvider>
        <SettingsProvider defaultSettings={defaultSettings}>
          <LocalizationProvider>
            <ThemeProvider
              modeStorageKey={themeConfig.modeStorageKey}
              defaultMode={themeConfig.defaultMode}
            >
              <MotionLazy>
                <Snackbar />
                <ProgressBar />
                <SettingsDrawer defaultSettings={defaultSettings} />
                {children}
              </MotionLazy>
            </ThemeProvider>
          </LocalizationProvider>
        </SettingsProvider>
      </AuthProvider>
    </I18nProvider>
  );
}

// ----------------------------------------------------------------------

function useScrollToTop() {
  const pathname = usePathname();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}
