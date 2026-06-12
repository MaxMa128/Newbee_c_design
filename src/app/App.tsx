import { useState } from 'react';
import { Briefcase, CalendarDays, MessageSquare, User } from 'lucide-react';
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
      </div>
    </div>
  );
}
