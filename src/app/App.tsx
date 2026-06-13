import { useState, useEffect, useRef } from 'react';
import { Briefcase, CalendarDays, MessageSquare, User, Map, ChevronRight, X, Minimize2, LogOut as ExitIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { WelcomePage } from './components/WelcomePage';
import { AuthPage } from './components/AuthPage';
import { HomePage } from './components/HomePage';
import { ProfilePage } from './components/ProfilePage';
import { ComingSoon } from './components/ComingSoon';
import { JobDetailPage } from './components/JobDetailPage';
import { HKIDVerifyFlow } from './components/HKIDVerifyFlow';
import { Language, translations } from './components/i18n';
import { jobs } from './components/jobData';

type Screen = 'welcome' | 'auth' | 'main';

interface UserData {
  name: string;
  phone: string;
  gender: string;
  age: number;
}

// ── Dev navigation button ──────────────────────────────
interface DevNavAction {
  group: string;
  label: string;
  sub?: string;
  action: () => void;
}

interface DevNavButtonProps {
  navKey: string; // changes on every navigation so temp-hide resets
  actions: DevNavAction[];
}

function DevNavButton({ navKey, actions }: DevNavButtonProps) {
  const [open, setOpen] = useState(false);
  const [tempHiddenKey, setTempHiddenKey] = useState<string | null>(null);
  const [dismissed, setDismissed] = useState(false);
  const prevKey = useRef(navKey);

  // Re-show after temp-hide when navigation changes
  useEffect(() => {
    if (tempHiddenKey !== null && navKey !== prevKey.current) {
      setTempHiddenKey(null);
    }
    prevKey.current = navKey;
  }, [navKey, tempHiddenKey]);

  if (dismissed) return null;
  if (tempHiddenKey === navKey) return null;

  // Group actions
  const groups = [...new Set(actions.map((a) => a.group))];

  return (
    <div style={{ position: 'absolute', bottom: 16, right: 12, zIndex: 200, userSelect: 'none' }}>
      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              style={{ position: 'fixed', inset: 0, zIndex: -1 }}
            />
            {/* Panel */}
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 12 }}
              transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
              style={{
                position: 'absolute',
                bottom: 48,
                right: 0,
                width: 220,
                background: 'rgba(15,22,35,0.93)',
                backdropFilter: 'blur(16px)',
                borderRadius: 16,
                overflow: 'hidden',
                boxShadow: '0 16px 48px rgba(15,22,35,0.4)',
                border: '1px solid rgba(255,255,255,0.1)',
              }}
            >
              {/* Header */}
              <div style={{ padding: '10px 14px 8px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                <p style={{ fontSize: '0.65rem', fontWeight: 800, color: '#F5A623', textTransform: 'uppercase', letterSpacing: '0.1em', margin: 0 }}>
                  Dev Navigator
                </p>
              </div>

              {/* Page list */}
              <div style={{ maxHeight: 380, overflowY: 'auto', scrollbarWidth: 'none' }}>
                {groups.map((group) => (
                  <div key={group}>
                    <p style={{ fontSize: '0.6rem', fontWeight: 700, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.08em', margin: 0, padding: '8px 14px 4px' }}>
                      {group}
                    </p>
                    {actions.filter((a) => a.group === group).map((a, i) => (
                      <button
                        key={i}
                        onClick={() => { a.action(); setOpen(false); }}
                        style={{
                          width: '100%', background: 'none', border: 'none', cursor: 'pointer',
                          padding: '7px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                          gap: 8, textAlign: 'left',
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.07)')}
                        onMouseLeave={(e) => (e.currentTarget.style.background = 'none')}
                      >
                        <div>
                          <p style={{ fontSize: '0.8rem', fontWeight: 600, color: '#FFFFFF', margin: 0, lineHeight: 1.3 }}>{a.label}</p>
                          {a.sub && <p style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.4)', margin: '1px 0 0 0' }}>{a.sub}</p>}
                        </div>
                        <ChevronRight size={12} style={{ color: 'rgba(255,255,255,0.3)', flexShrink: 0 }} />
                      </button>
                    ))}
                  </div>
                ))}
              </div>

              {/* Footer actions */}
              <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', display: 'flex' }}>
                <button
                  onClick={() => { setOpen(false); setTempHiddenKey(navKey); }}
                  style={{
                    flex: 1, background: 'none', border: 'none', cursor: 'pointer',
                    padding: '9px 12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
                    borderRight: '1px solid rgba(255,255,255,0.08)',
                  }}
                >
                  <Minimize2 size={11} style={{ color: 'rgba(255,255,255,0.5)' }} />
                  <span style={{ fontSize: '0.72rem', fontWeight: 600, color: 'rgba(255,255,255,0.5)' }}>暫時關閉</span>
                </button>
                <button
                  onClick={() => { setOpen(false); setDismissed(true); }}
                  style={{
                    flex: 1, background: 'none', border: 'none', cursor: 'pointer',
                    padding: '9px 12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
                  }}
                >
                  <ExitIcon size={11} style={{ color: 'rgba(239,68,68,0.7)' }} />
                  <span style={{ fontSize: '0.72rem', fontWeight: 600, color: 'rgba(239,68,68,0.7)' }}>退出</span>
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* FAB */}
      <motion.button
        onClick={() => setOpen((p) => !p)}
        whileTap={{ scale: 0.9 }}
        style={{
          width: 40, height: 40, borderRadius: '50%',
          background: open ? 'rgba(15,22,35,0.9)' : 'rgba(15,22,35,0.55)',
          backdropFilter: 'blur(12px)',
          border: '1.5px solid rgba(245,166,35,0.5)',
          cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 4px 16px rgba(15,22,35,0.3)',
          transition: 'background 0.2s',
        }}
      >
        <AnimatePresence mode="wait">
          {open
            ? <motion.div key="x" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.15 }}>
                <X size={16} style={{ color: '#F5A623' }} />
              </motion.div>
            : <motion.div key="m" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.15 }}>
                <Map size={15} style={{ color: '#F5A623' }} />
              </motion.div>
          }
        </AnimatePresence>
      </motion.button>
    </div>
  );
}

export default function App() {
  const [screen, setScreen] = useState<Screen>('welcome');
  const [lang, setLang] = useState<Language>('zh-HK');
  const [activeNav, setActiveNav] = useState(0);
  const [user, setUser] = useState<UserData | null>(null);
  const [selectedJobId, setSelectedJobId] = useState<number | null>(null);
  const [isVerified, setIsVerified] = useState(false);
  const [showVerifyFlow, setShowVerifyFlow] = useState(false);

  const t = translations[lang];

  function handleAuthSuccess(userData: UserData) {
    setUser(userData);
    setScreen('main');
  }

  function handleLogout() {
    setUser(null);
    setScreen('welcome');
    setActiveNav(0);
  }

  const navItems = [
    { icon: Briefcase, label: t.findJobs },
    { icon: CalendarDays, label: t.schedule },
    { icon: MessageSquare, label: t.messages },
    { icon: User, label: t.profile },
  ];

  const currentUser: UserData = user ?? {
    name: lang === 'en' ? 'Alex Chan' : '陳大文',
    phone: '+852 98765432',
    gender: lang === 'en' ? 'M' : '男',
    age: 26,
  };

  const navKey = `${screen}|${activeNav}|${selectedJobId ?? ''}|${showVerifyFlow}`;

  const devActions: DevNavAction[] = [
    // Base screens
    { group: '基礎頁面', label: '歡迎頁', action: () => { setScreen('welcome'); setSelectedJobId(null); setShowVerifyFlow(false); } },
    { group: '基礎頁面', label: '登入 / 註冊', action: () => { setScreen('auth'); setSelectedJobId(null); setShowVerifyFlow(false); } },
    // Main tabs
    { group: '主應用', label: '首頁職位', action: () => { setScreen('main'); setActiveNav(0); setSelectedJobId(null); setShowVerifyFlow(false); } },
    { group: '主應用', label: '排班', action: () => { setScreen('main'); setActiveNav(1); setSelectedJobId(null); setShowVerifyFlow(false); } },
    { group: '主應用', label: '消息', action: () => { setScreen('main'); setActiveNav(2); setSelectedJobId(null); setShowVerifyFlow(false); } },
    { group: '主應用', label: '個人中心', action: () => { setScreen('main'); setActiveNav(3); setSelectedJobId(null); setShowVerifyFlow(false); } },
    // Job detail
    ...jobs.slice(0, 4).map((j) => ({
      group: '職位詳情',
      label: j.title['zh-HK'],
      sub: j.company,
      action: () => { setScreen('main'); setActiveNav(0); setSelectedJobId(j.id); setShowVerifyFlow(false); },
    })),
    // Overlays
    { group: '認證流程', label: 'HKID 身份認證', sub: isVerified ? '目前已認證' : '目前未認證', action: () => { setScreen('main'); setShowVerifyFlow(true); } },
  ];

  return (
    <div className="size-full flex items-center justify-center" style={{ background: '#DDE3EF' }}>
      <div
        className="relative overflow-hidden"
        style={{
          width: '100%',
          maxWidth: 480,
          height: '100%',
          maxHeight: 900,
          borderRadius: 'clamp(0px, 2vw, 32px)',
          boxShadow: '0 24px 80px rgba(15,22,35,0.2)',
          background: '#F7F8FC',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <AnimatePresence mode="wait">
          {/* Welcome */}
          {screen === 'welcome' && (
            <motion.div
              key="welcome"
              className="absolute inset-0"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, scale: 0.97 }}
              transition={{ duration: 0.3 }}
            >
              <WelcomePage lang={lang} onGetStarted={() => setScreen('auth')} />
            </motion.div>
          )}

          {/* Auth */}
          {screen === 'auth' && (
            <motion.div
              key="auth"
              className="absolute inset-0"
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            >
              <AuthPage
                lang={lang}
                onLangChange={setLang}
                onSuccess={handleAuthSuccess}
              />
            </motion.div>
          )}

          {/* Main app */}
          {screen === 'main' && (
            <motion.div
              key="main"
              className="absolute inset-0 flex flex-col"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
            >
              {/* Tab content */}
              <div className="flex-1 overflow-hidden relative">
                <AnimatePresence mode="wait">
                  {activeNav === 0 && (
                    <motion.div key="jobs" className="absolute inset-0"
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.18 }}>
                      <HomePage lang={lang} onJobPress={(id) => setSelectedJobId(id)} />
                    </motion.div>
                  )}
                  {activeNav === 1 && (
                    <motion.div key="schedule" className="absolute inset-0"
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.18 }}>
                      <ComingSoon lang={lang} tab="schedule" />
                    </motion.div>
                  )}
                  {activeNav === 2 && (
                    <motion.div key="messages" className="absolute inset-0"
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.18 }}>
                      <ComingSoon lang={lang} tab="messages" />
                    </motion.div>
                  )}
                  {activeNav === 3 && (
                    <motion.div key="profile" className="absolute inset-0"
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.18 }}>
                      <ProfilePage
                        lang={lang}
                        onLangChange={setLang}
                        user={currentUser}
                        onLogout={handleLogout}
                        isVerified={isVerified}
                        onStartVerify={() => setShowVerifyFlow(true)}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Job detail overlay */}
              <AnimatePresence>
                {selectedJobId !== null && (() => {
                  const job = jobs.find((j) => j.id === selectedJobId);
                  if (!job) return null;
                  return (
                    <motion.div
                      key={`job-detail-${selectedJobId}`}
                      className="absolute inset-0 z-30"
                      initial={{ opacity: 0, x: 40 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 40 }}
                      transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                    >
                      <JobDetailPage
                      job={job}
                      lang={lang}
                      isVerified={isVerified}
                      onBack={() => setSelectedJobId(null)}
                      onStartVerify={() => setShowVerifyFlow(true)}
                    />
                    </motion.div>
                  );
                })()}
              </AnimatePresence>

              {/* HKID verify flow overlay */}
              <AnimatePresence>
                {showVerifyFlow && (
                  <motion.div
                    key="hkid-verify"
                    className="absolute inset-0 z-50"
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 40 }}
                    transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <HKIDVerifyFlow
                      onClose={() => setShowVerifyFlow(false)}
                      onSuccess={() => { setIsVerified(true); setShowVerifyFlow(false); }}
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Bottom nav */}
              <div
                className="shrink-0 flex items-center justify-around px-2 py-2"
                style={{ background: '#FFFFFF', borderTop: '1px solid rgba(15,22,35,0.06)', boxShadow: '0 -4px 24px rgba(15,22,35,0.06)' }}
              >
                {navItems.map((item, i) => {
                  const Icon = item.icon;
                  const isActive = activeNav === i;
                  return (
                    <button
                      key={i}
                      onClick={() => setActiveNav(i)}
                      className="flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl transition-all"
                      style={{ border: 'none', background: 'transparent', cursor: 'pointer', minWidth: 56 }}
                    >
                      <div
                        className="flex items-center justify-center rounded-xl transition-all"
                        style={{ width: 40, height: 28, background: isActive ? '#FEF3DC' : 'transparent' }}
                      >
                        <Icon size={19} style={{ color: isActive ? '#F5A623' : '#9CA3AF', strokeWidth: isActive ? 2.5 : 1.8 }} />
                      </div>
                      <span style={{ fontSize: '0.62rem', fontWeight: isActive ? 700 : 500, color: isActive ? '#F5A623' : '#9CA3AF', whiteSpace: 'nowrap' }}>
                        {item.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Dev navigator — always on top */}
        <DevNavButton navKey={navKey} actions={devActions} />
      </div>
    </div>
  );
}
