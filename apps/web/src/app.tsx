import { useState, useCallback } from 'react';
import { useT, useLocale } from './lib/i18n';
import { useThemeMode } from './lib/theme';
import type { ThemeMode } from './lib/theme';

type Page = 'org' | 'form' | 'profile';

// Simple tab bar config
const TABS: { id: Page; labelKey: string; icon: string }[] = [
  { id: 'org', labelKey: 'org.title', icon: '🏢' },
  { id: 'form', labelKey: 'form.title', icon: '📋' },
  { id: 'profile', labelKey: 'profile.title', icon: '👤' },
];

function OrgPage() {
  const t = useT();
  const [searchText, setSearchText] = useState('');
  const [deptName, setDeptName] = useState('');
  const [memberName, setMemberName] = useState('');

  return (
    <div>
      <h1 className="page-title">{t('org.title')}</h1>

      <div className="card">
        <label className="form-label">{t('org.searchPlaceholder')}</label>
        <input className="form-input" value={searchText} onChange={e => setSearchText(e.target.value)} placeholder={t('org.searchPlaceholder')} />
        <div style={{ marginTop: 12 }}>
          <button className="btn btn--primary btn--block" onClick={() => searchText.trim() && alert(t('org.searchBtn') + ': ' + searchText)}>
            {t('org.searchBtn')}
          </button>
        </div>
      </div>

      <div className="card">
        <div className="section-title">{t('org.addDepartment')}</div>
        <input className="form-input" value={deptName} onChange={e => setDeptName(e.target.value)} placeholder={t('org.namePlaceholder')} />
        <div style={{ marginTop: 12 }}>
          <button className="btn btn--primary btn--block" onClick={() => {
            if (!deptName.trim()) return;
            alert(t('org.addDepartment') + ': ' + deptName);
            setDeptName('');
          }}>{t('org.submit')}</button>
        </div>
      </div>

      <div className="card">
        <div className="section-title">{t('org.addMember')}</div>
        <input className="form-input" value={memberName} onChange={e => setMemberName(e.target.value)} placeholder={t('org.namePlaceholder')} />
        <div style={{ marginTop: 12 }}>
          <button className="btn btn--primary btn--block" onClick={() => {
            if (!memberName.trim()) return;
            alert(t('org.addMember') + ': ' + memberName);
            setMemberName('');
          }}>{t('org.submit')}</button>
        </div>
      </div>
    </div>
  );
}

function FormPage() {
  const t = useT();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [remark, setRemark] = useState('');

  const handleReset = () => { setName(''); setPhone(''); setEmail(''); setRemark(''); };

  return (
    <div>
      <h1 className="page-title">{t('form.title')}</h1>
      <div className="card">
        <div className="form-group">
          <label className="form-label">{t('form.name')}</label>
          <input className="form-input" value={name} onChange={e => setName(e.target.value)} placeholder={t('form.namePlaceholder')} />
        </div>
        <div className="form-group">
          <label className="form-label">{t('form.phone')}</label>
          <input className="form-input" type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder={t('form.phonePlaceholder')} />
        </div>
        <div className="form-group">
          <label className="form-label">{t('form.email')}</label>
          <input className="form-input" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder={t('form.emailPlaceholder')} />
        </div>
        <div className="form-group">
          <label className="form-label">{t('form.remark')}</label>
          <textarea className="form-input" value={remark} onChange={e => setRemark(e.target.value)} placeholder={t('form.remarkPlaceholder')} />
        </div>
        <div className="btn-row">
          <button className="btn btn--primary" onClick={() => alert(t('form.submitSuccess'))}>{t('form.submit')}</button>
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

  const themeOptions: { key: ThemeMode; label: string }[] = [
    { key: 'light', label: t('theme.light') },
    { key: 'dark', label: t('theme.dark') },
    { key: 'system', label: t('theme.system') },
  ];

  return (
    <div>
      <h1 className="page-title">{t('profile.title')}</h1>

      <div className="card">
        <div className="section-title">{t('settings.language')}</div>
        <div className="option-row">
          <button className={`option-btn ${locale === 'zh-CN' ? 'option-btn--active' : ''}`} onClick={() => setLocale('zh-CN')}>
            {t('language.zhCN')}
          </button>
          <button className={`option-btn ${locale === 'en-US' ? 'option-btn--active' : ''}`} onClick={() => setLocale('en-US')}>
            {t('language.enUS')}
          </button>
        </div>

        <div className="section-title section-mt">{t('settings.theme')}</div>
        <div className="option-row">
          {themeOptions.map(opt => (
            <button key={opt.key} className={`option-btn ${themeMode === opt.key ? 'option-btn--active' : ''}`} onClick={() => setMode(opt.key)}>
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
        onClick={() => { if (confirm(t('profile.logoutConfirm'))) alert(t('settings.logout')); }}>
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
