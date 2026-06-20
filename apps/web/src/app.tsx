import { useState, useCallback, useMemo, useEffect } from 'react';
import {
  useContactFormController,
  useOrganizationController,
  useProfileSettingsController,
} from '@repo/features';
import type { ThemeMode } from '@repo/types/theme';
import { useT, useLocale } from './lib/i18n';
import { useThemeMode } from './lib/theme';
import { webFeedback } from './lib/feedback';
import { apiClient } from './lib/api-client';

type Page = 'org' | 'form' | 'profile';

const TABS: { id: Page; labelKey: string; icon: string }[] = [
  { id: 'org', labelKey: 'org.title', icon: '🏢' },
  { id: 'form', labelKey: 'form.title', icon: '📋' },
  { id: 'profile', labelKey: 'profile.title', icon: '👤' },
];

// ---- Organization Data ----
interface OrgDepartment {
  id: string;
  name: string;
  parentId: string | null;
  memberCount: number;
}
interface OrgMember {
  id: string;
  name: string;
  departmentId: string;
  role: string;
  avatar: string;
}

function buildTree(deps: OrgDepartment[]): OrgDepartment[] {
  const map = new Map<string, OrgDepartment & { children: OrgDepartment[] }>();
  for (const d of deps) map.set(d.id, { ...d, children: [] });
  const roots: (OrgDepartment & { children: OrgDepartment[] })[] = [];
  for (const d of map.values()) {
    if (d.parentId && map.has(d.parentId)) map.get(d.parentId)!.children.push(d);
    else roots.push(d);
  }
  return roots;
}

// ---- Organization Page ----

function OrgPage() {
  const t = useT();
  const [deps, setDeps] = useState<OrgDepartment[]>([]);
  const [members, setMembers] = useState<OrgMember[]>([]);
  const [loading, setLoading] = useState(true);
  const tree = useMemo(() => buildTree(deps), [deps]);

  useEffect(() => {
    Promise.all([
      apiClient.get<OrgDepartment[]>('/api/org/departments'),
      apiClient.get<OrgMember[]>('/api/org/members'),
    ])
      .then(([d, m]) => {
        if (Array.isArray(d)) setDeps(d);
        if (Array.isArray(m)) setMembers(m);
      })
      .catch(() => {
        // 联调时后端未启动或无 mock 时静默失败
      })
      .finally(() => setLoading(false));
  }, []);

  const [expanded, setExpanded] = useState<Set<string>>(() => new Set());

  // Auto-expand all departments on load
  useEffect(() => {
    if (deps.length > 0) setExpanded(new Set(deps.map((d) => d.id)));
  }, [deps]);
  const [selectedDept, setSelectedDept] = useState<string | null>(null);
  const [searchText, setSearchText] = useState('');
  const { draft, setDeptName, setMemberName, handleSearch, handleAddDepartment, handleAddMember } =
    useOrganizationController({ platform: 'web', feedback: webFeedback, t });

  const toggleDept = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const filteredMembers = useMemo(() => {
    let list = selectedDept ? members.filter((m) => m.departmentId === selectedDept) : members;
    if (searchText.trim()) {
      const kw = searchText.toLowerCase();
      list = list.filter(
        (m) => m.name.toLowerCase().includes(kw) || m.role.toLowerCase().includes(kw),
      );
    }
    return list;
  }, [members, selectedDept, searchText]);

  const deptById = (id: string) => deps.find((d) => d.id === id);

  const renderTree = (nodes: (OrgDepartment & { children?: OrgDepartment[] })[], depth = 0) => (
    <ul className="dept-tree">
      {nodes.map((n) => {
        const isOpen = expanded.has(n.id);
        const children = (n as any).children as OrgDepartment[] | undefined;
        const hasChildren = children && children.length > 0;
        return (
          <li key={n.id} className="dept-node">
            <button
              className={`dept-node__toggle ${selectedDept === n.id ? 'dept-node__toggle--active' : ''}`}
              onClick={() => setSelectedDept(n.id)}
            >
              <span
                className={`dept-node__arrow ${isOpen && hasChildren ? 'dept-node__arrow--open' : ''}`}
                onClick={(e) => {
                  e.stopPropagation();
                  toggleDept(n.id);
                }}
              >
                {hasChildren ? '▶' : '•'}
              </span>
              <span>{n.name}</span>
              <span className="dept-node__count">{n.memberCount}</span>
            </button>
            {hasChildren && isOpen && (
              <div className="dept-children">{renderTree(children!, depth + 1)}</div>
            )}
          </li>
        );
      })}
    </ul>
  );

  return (
    <div>
      <h1 className="page-title">{t('org.title')}</h1>

      {/* Search */}
      <div className="card">
        <div className="form-row">
          <div className="form-group" style={{ flex: 1 }}>
            <input
              className="form-input"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              placeholder={t('org.searchPlaceholder')}
              onKeyDown={(e) => {
                if (e.key === 'Enter') void handleSearch();
              }}
            />
          </div>
          <button className="btn btn--primary" onClick={() => void handleSearch()}>
            {t('org.searchBtn')}
          </button>
        </div>
      </div>

      {/* Department Tree + Member List */}
      <div className="org-layout">
        <div className="card org-sidebar">
          <div className="section-title">{t('org.department')}</div>
          {renderTree(tree)}
        </div>

        <div className="org-main card">
          <div className="section-title">
            {selectedDept ? deptById(selectedDept)?.name : t('org.member')}
          </div>
          {filteredMembers.length === 0 ? (
            <p
              style={{
                fontSize: 14,
                color: 'var(--color-text-tertiary)',
                textAlign: 'center',
                padding: 24,
              }}
            >
              {t(searchText.trim() ? 'common.noData' : 'org.searchPlaceholder')}
            </p>
          ) : (
            <div className="member-list">
              {filteredMembers.map((m) => (
                <div key={m.id} className="member-row">
                  <img className="member-avatar" src={m.avatar} alt={m.name} />
                  <div>
                    <div className="member-name">{m.name}</div>
                    <div className="member-role">{m.role}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Add Department / Member */}
      <div className="card" style={{ marginTop: 20 }}>
        <div className="section-title">{t('org.addDepartment')}</div>
        <div className="form-row">
          <div className="form-group" style={{ flex: 1 }}>
            <input
              className="form-input"
              value={draft.deptName}
              onChange={(e) => setDeptName(e.target.value)}
              placeholder={t('org.namePlaceholder')}
              onKeyDown={(e) => {
                if (e.key === 'Enter') void handleAddDepartment();
              }}
            />
          </div>
          <button className="btn btn--primary" onClick={() => void handleAddDepartment()}>
            {t('org.submit')}
          </button>
        </div>

        <div className="section-title section-mt">{t('org.addMember')}</div>
        <div className="form-row">
          <div className="form-group" style={{ flex: 1 }}>
            <input
              className="form-input"
              value={draft.memberName}
              onChange={(e) => setMemberName(e.target.value)}
              placeholder={t('org.namePlaceholder')}
              onKeyDown={(e) => {
                if (e.key === 'Enter') void handleAddMember();
              }}
            />
          </div>
          <button className="btn btn--primary" onClick={() => void handleAddMember()}>
            {t('org.submit')}
          </button>
        </div>
      </div>
    </div>
  );
}

function FormPage() {
  const t = useT();
  const { draft, setName, setPhone, setEmail, setRemark, handleReset, handleSubmit } =
    useContactFormController({
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
          <input
            className="form-input"
            value={draft.name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t('form.namePlaceholder')}
          />
        </div>
        <div className="form-group">
          <label className="form-label">{t('form.phone')}</label>
          <input
            className="form-input"
            type="tel"
            value={draft.phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder={t('form.phonePlaceholder')}
          />
        </div>
        <div className="form-group">
          <label className="form-label">{t('form.email')}</label>
          <input
            className="form-input"
            type="email"
            value={draft.email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={t('form.emailPlaceholder')}
          />
        </div>
        <div className="form-group">
          <label className="form-label">{t('form.remark')}</label>
          <textarea
            className="form-input"
            value={draft.remark}
            onChange={(e) => setRemark(e.target.value)}
            placeholder={t('form.remarkPlaceholder')}
          />
        </div>
        <div className="btn-row">
          <button className="btn btn--primary" onClick={() => void handleSubmit()}>
            {t('form.submit')}
          </button>
          <button className="btn btn--secondary" onClick={handleReset}>
            {t('form.reset')}
          </button>
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
            <button
              key={opt.key}
              className={`option-btn ${themeMode === opt.key ? 'option-btn--active' : ''}`}
              onClick={() => void setMode(opt.key)}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div className="card">
        <div className="section-title">{t('profile.about')}</div>
        <p style={{ fontSize: 14, color: 'var(--color-text-secondary)' }}>
          {t('profile.aboutInfo')}
        </p>
      </div>

      <button
        className="btn btn--danger btn--block"
        style={{ marginTop: 8 }}
        onClick={() => void handleLogout()}
      >
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
          {TABS.map((tab) => (
            <button
              key={tab.id}
              className={`top-nav__link ${page === tab.id ? 'top-nav__link--active' : ''}`}
              onClick={() => navigate(tab.id)}
            >
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
        {TABS.map((tab) => (
          <button
            key={tab.id}
            className={`tab-btn ${page === tab.id ? 'tab-btn--active' : ''}`}
            onClick={() => navigate(tab.id)}
          >
            <span className="tab-icon">{tab.icon}</span>
            <span>{t(tab.labelKey)}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}
