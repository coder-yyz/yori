import 'src/global.css';

import { lazy, Suspense, useEffect } from 'react';

import { usePathname } from 'src/routes/hooks';

import { LocalizationProvider } from 'src/locales';
import { themeConfig, ThemeProvider } from 'src/theme';
import { I18nProvider } from 'src/locales/i18n-provider';

import { Snackbar } from 'src/components/Snackbar';
import { ProgressBar } from 'src/components/ProgressBar';
import { MotionLazy } from 'src/components/Animate/motion-lazy';
import { defaultSettings, SettingsProvider } from 'src/components/Settings';

import { AuthProvider as JwtAuthProvider } from 'src/auth/context/jwt';

const SettingsDrawer = lazy(() =>
  import('src/components/Settings/drawer/settings-drawer').then((m) => ({
    default: m.SettingsDrawer,
  }))
);

const AuthProvider = JwtAuthProvider;

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
                <Suspense fallback={null}>
                  <SettingsDrawer defaultSettings={defaultSettings} />
                </Suspense>
                {children}
              </MotionLazy>
            </ThemeProvider>
          </LocalizationProvider>
        </SettingsProvider>
      </AuthProvider>
    </I18nProvider>
  );
}

function useScrollToTop() {
  const pathname = usePathname();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}
