import { useState, useCallback } from 'react';
import { useContactFormController, useOrganizationController, useProfileSettingsController } from '@repo/features';
import type { ThemeMode } from '@repo/types/theme';
import { useT, useLocale } from './lib/i18n';
import { useThemeMode } from './lib/theme';
import { webFeedback } from './lib/feedback';

type Page = 'org' | 'form' | 'profile';

// Simple tab bar config
const TABS: { id: Page; labelKey: string; icon: string }[] = [
  { id: 'org', labelKey: 'org.title', icon: '🏢' },
  { id: 'form', labelKey: 'form.title', icon: '📋' },
  { id: 'profile', labelKey: 'profile.title', icon: '👤' },
];

function OrgPage() {
  const t = useT();
  const { draft, setSearchText, setDeptName, setMemberName, handleSearch, handleAddDepartment, handleAddMember } =
    useOrganizationController({
      platform: 'web',
      feedback: webFeedback,
      t,
    });

  return (
    <div>
      <h1 className="page-title">{t('org.title')}</h1>

      <div className="card">
        <label className="form-label">{t('org.searchPlaceholder')}</label>
        <input className="form-input" value={draft.searchText} onChange={e => setSearchText(e.target.value)} placeholder={t('org.searchPlaceholder')} />
        <div style={{ marginTop: 12 }}>
          <button className="btn btn--primary btn--block" onClick={() => void handleSearch()}>
            {t('org.searchBtn')}
          </button>
        </div>
      </div>

      <div className="card">
        <div className="section-title">{t('org.addDepartment')}</div>
        <input className="form-input" value={draft.deptName} onChange={e => setDeptName(e.target.value)} placeholder={t('org.namePlaceholder')} />
        <div style={{ marginTop: 12 }}>
          <button className="btn btn--primary btn--block" onClick={() => void handleAddDepartment()}>{t('org.submit')}</button>
        </div>
      </div>

      <div className="card">
        <div className="section-title">{t('org.addMember')}</div>
        <input className="form-input" value={draft.memberName} onChange={e => setMemberName(e.target.value)} placeholder={t('org.namePlaceholder')} />
        <div style={{ marginTop: 12 }}>
          <button className="btn btn--primary btn--block" onClick={() => void handleAddMember()}>{t('org.submit')}</button>
        </div>
      </div>
    </div>
  );
}

function FormPage() {
  const t = useT();
  const { draft, setName, setPhone, setEmail, setRemark, handleReset, handleSubmit } = useContactFormController({
    platform: 'web',
    feedback: webFeedback,
    t,
  });

  return (
    <div>
      <h1 className="page-title">{t('form.title')}</h1>
      <div className="card">
        <div className="form-group">
          <label className="form-label">{t('form.name')}</label>
          <input className="form-input" value={draft.name} onChange={e => setName(e.target.value)} placeholder={t('form.namePlaceholder')} />
        </div>
        <div className="form-group">
          <label className="form-label">{t('form.phone')}</label>
          <input className="form-input" type="tel" value={draft.phone} onChange={e => setPhone(e.target.value)} placeholder={t('form.phonePlaceholder')} />
        </div>
        <div className="form-group">
          <label className="form-label">{t('form.email')}</label>
          <input className="form-input" type="email" value={draft.email} onChange={e => setEmail(e.target.value)} placeholder={t('form.emailPlaceholder')} />
        </div>
        <div className="form-group">
          <label className="form-label">{t('form.remark')}</label>
          <textarea className="form-input" value={draft.remark} onChange={e => setRemark(e.target.value)} placeholder={t('form.remarkPlaceholder')} />
        </div>
        <div className="btn-row">
          <button className="btn btn--primary" onClick={() => void handleSubmit()}>{t('form.submit')}</button>
          <button className="btn btn--secondary" onClick={handleReset}>{t('form.reset')}</button>
        </div>
      </div>
    </div>
  );
}

function ProfilePage() {
  const t = useT();
  const { locale, setLocale } = useLocale();
  const { mode: themeMode, setMode } = useThemeMode();
  const { languageOptions, themeOptions, handleLogout } = useProfileSettingsController({
    feedback: webFeedback,
    t,
  });

  return (
    <div>
      <h1 className="page-title">{t('profile.title')}</h1>

      <div className="card">
        <div className="section-title">{t('settings.language')}</div>
        <div className="option-row">
          {languageOptions.map((option) => (
            <button
              key={option.key}
              className={`option-btn ${locale === option.key ? 'option-btn--active' : ''}`}
              onClick={() => void setLocale(option.key)}
            >
              {option.label}
            </button>
          ))}
        </div>

        <div className="section-title section-mt">{t('settings.theme')}</div>
        <div className="option-row">
          {themeOptions.map((opt: { key: ThemeMode; label: string }) => (
            <button key={opt.key} className={`option-btn ${themeMode === opt.key ? 'option-btn--active' : ''}`} onClick={() => void setMode(opt.key)}>
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div className="card">
        <div className="section-title">{t('profile.about')}</div>
        <p style={{ fontSize: 14, color: 'var(--color-text-secondary)' }}>{t('profile.aboutInfo')}</p>
      </div>

      <button className="btn btn--danger btn--block" style={{ marginTop: 8 }}
        onClick={() => void handleLogout()}>
        {t('settings.logout')}
      </button>
    </div>
  );
}

export function App() {
  const t = useT();
  const { resolved: themeResolved } = useThemeMode();
  const [page, setPage] = useState<Page>(() => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash.replace('#/', '');
      if (hash === 'form' || hash === 'profile') return hash;
    }
    return 'org';
  });

  const navigate = useCallback((p: Page) => {
    setPage(p);
    window.location.hash = '#/' + (p === 'org' ? '' : p);
  }, []);

  return (
    <div className={`app-layout ${themeResolved === 'dark' ? 'theme-dark' : ''}`}>
      {/* Top Nav (desktop) */}
      <nav className="top-nav">
        <span className="top-nav__brand">BenchApp</span>
        <div className="top-nav__links">
          {TABS.map(tab => (
            <button key={tab.id} className={`top-nav__link ${page === tab.id ? 'top-nav__link--active' : ''}`} onClick={() => navigate(tab.id)}>
              {tab.icon} {t(tab.labelKey)}
            </button>
          ))}
        </div>
      </nav>

      {/* Page Content */}
      <main className="main-content">
        {page === 'org' && <OrgPage />}
        {page === 'form' && <FormPage />}
        {page === 'profile' && <ProfilePage />}
      </main>

      {/* Bottom Tab Bar (mobile) */}
      <nav className="bottom-tabs">
        {TABS.map(tab => (
          <button key={tab.id} className={`tab-btn ${page === tab.id ? 'tab-btn--active' : ''}`} onClick={() => navigate(tab.id)}>
            <span className="tab-icon">{tab.icon}</span>
            <span>{t(tab.labelKey)}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}
