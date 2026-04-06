import 'src/global.css';

import { useEffect } from 'react';

import { AuthProvider as JwtAuthProvider } from 'src/auth/context/jwt';
import { MotionLazy } from 'src/components/Animate/motion-lazy';
import { ProgressBar } from 'src/components/ProgressBar';
import { SettingsDrawer, defaultSettings, SettingsProvider } from 'src/components/Settings';
import { Snackbar } from 'src/components/Snackbar';
import { LocalizationProvider } from 'src/locales';
import { I18nProvider } from 'src/locales/i18n-provider';
import { usePathname } from 'src/routes/hooks';
import { themeConfig, ThemeProvider } from 'src/theme';

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
