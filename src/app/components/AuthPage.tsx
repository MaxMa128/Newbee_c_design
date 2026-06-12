import { useState, useEffect, useRef } from 'react';
import { ChevronLeft, Eye, EyeOff, Phone, Lock, Mail, CheckCircle2, X, Send } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Language, LANG_LABELS, LANG_NAMES, translations } from './i18n';

interface UserData {
  name: string;
  phone: string;
  gender: string;
  age: number;
}

interface AuthPageProps {
  lang: Language;
  onLangChange: (l: Language) => void;
  onSuccess: (user: UserData) => void;
}

type AuthStep = 'login' | 'register-phone' | 'register-setup';

// ── Legal modal ───────────────────────────────────────
function LegalModal({ title, onClose }: { title: string; onClose: () => void }) {
  return (
    <motion.div
      className="fixed inset-0 z-50 flex flex-col justify-end"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{ background: 'rgba(15,22,35,0.5)' }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        className="flex flex-col rounded-t-3xl overflow-hidden"
        style={{ background: '#FFFFFF', maxHeight: '80vh' }}
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
      >
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1 shrink-0">
          <div style={{ width: 40, height: 4, borderRadius: 2, background: '#E5E7EB' }} />
        </div>
        {/* Header */}
        <div
          className="flex items-center justify-between px-5 py-3 shrink-0"
          style={{ borderBottom: '1px solid rgba(15,22,35,0.06)' }}
        >
          <h2 style={{ fontSize: '1rem', fontWeight: 700, color: '#0F1623', margin: 0 }}>{title}</h2>
          <button
            onClick={onClose}
            style={{ background: '#EEF1F8', border: 'none', cursor: 'pointer', borderRadius: '0.75rem', width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <X size={15} style={{ color: '#6B7A99' }} />
          </button>
        </div>
        {/* Content */}
        <div className="flex-1 overflow-y-auto px-5 py-8" style={{ scrollbarWidth: 'none' }}>
          <p style={{ fontSize: '0.9rem', color: '#6B7A99', lineHeight: 1.8, textAlign: 'center', margin: 0 }}>
            待更新
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ── Shared components ─────────────────────────────────
function HexLogoSmall() {
  return (
    <svg width="36" height="41" viewBox="0 0 88 100" fill="none">
      <path d="M44 2L84 24V76L44 98L4 76V24L44 2Z" fill="#F5A623" />
      <ellipse cx="44" cy="52" rx="12" ry="18" fill="#0F1623" />
      <rect x="32" y="48" width="24" height="5" rx="2.5" fill="#F5A623" />
      <rect x="32" y="57" width="24" height="5" rx="2.5" fill="#F5A623" />
      <ellipse cx="44" cy="33" rx="9" ry="8" fill="#0F1623" />
      <line x1="38" y1="27" x2="32" y2="20" stroke="#0F1623" strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="31" cy="19" r="2.5" fill="#0F1623" />
      <line x1="50" y1="27" x2="56" y2="20" stroke="#0F1623" strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="57" cy="19" r="2.5" fill="#0F1623" />
      <ellipse cx="30" cy="43" rx="10" ry="6" fill="white" fillOpacity="0.85" transform="rotate(-20 30 43)" />
      <ellipse cx="58" cy="43" rx="10" ry="6" fill="white" fillOpacity="0.85" transform="rotate(20 58 43)" />
      <circle cx="40" cy="33" r="2" fill="#F5A623" />
      <circle cx="48" cy="33" r="2" fill="#F5A623" />
    </svg>
  );
}

function FieldInput({
  placeholder, value, onChange, type = 'text', prefix, suffix, error,
}: {
  placeholder: string; value: string; onChange: (v: string) => void;
  type?: string; prefix?: React.ReactNode; suffix?: React.ReactNode; error?: string;
}) {
  const [focused, setFocused] = useState(false);
  return (
    <div>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8, padding: '0 14px',
        borderRadius: '0.75rem',
        border: `1.5px solid ${error ? '#D93025' : focused ? '#F5A623' : 'rgba(15,22,35,0.1)'}`,
        background: focused ? '#FFFFFF' : '#F7F8FC',
        transition: 'border-color 0.15s, background 0.15s',
      }}>
        {prefix}
        <input
          type={type} value={value} placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
          // Remove number spinners via inline style
          style={{
            flex: 1, padding: '12px 0', border: 'none', background: 'transparent',
            fontSize: '0.9rem', color: '#0F1623', outline: 'none', fontFamily: 'inherit',
            MozAppearance: 'textfield',
            WebkitAppearance: 'none',
          } as React.CSSProperties}
        />
        {suffix}
      </div>
      {error && <p style={{ fontSize: '0.73rem', color: '#D93025', marginTop: 4, paddingLeft: 4 }}>{error}</p>}
    </div>
  );
}

function OptionalBadge({ lang }: { lang: Language }) {
  return (
    <span style={{ fontSize: '0.7rem', color: '#9CA3AF', fontWeight: 500, marginLeft: 4 }}>
      {lang === 'en' ? '(optional)' : '（選填）'}
    </span>
  );
}

export function AuthPage({ lang, onLangChange, onSuccess }: AuthPageProps) {
  const t = translations[lang];
  const [step, setStep] = useState<AuthStep>('login');
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [legalModal, setLegalModal] = useState<null | 'terms' | 'privacy'>(null);

  // Login state
  const [loginMode, setLoginMode] = useState<'password' | 'otp'>('password');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [otp, setOtp] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [loginErrors, setLoginErrors] = useState<Record<string, string>>({});

  // Register agreement
  const [regAgreed, setRegAgreed] = useState(false);

  // OTP countdown (shared)
  const [otpSent, setOtpSent] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Register phone step
  const [regPhone, setRegPhone] = useState('');
  const [regOtp, setRegOtp] = useState('');
  const [regOtpSent, setRegOtpSent] = useState(false);
  const [regCountdown, setRegCountdown] = useState(0);
  const regTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [regPhoneErrors, setRegPhoneErrors] = useState<Record<string, string>>({});

  // Register setup step
  const [regPassword, setRegPassword] = useState('');
  const [regConfirm, setRegConfirm] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regEmailCode, setRegEmailCode] = useState('');
  const [emailCodeSent, setEmailCodeSent] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);
  const [showRegPwd, setShowRegPwd] = useState(false);
  const [showRegConfirm, setShowRegConfirm] = useState(false);
  const [setupErrors, setSetupErrors] = useState<Record<string, string>>({});
  const [setupSuccess, setSetupSuccess] = useState(false);

  useEffect(() => () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (regTimerRef.current) clearInterval(regTimerRef.current);
  }, []);

  function startCountdown(setC: (n: number) => void, ref: React.MutableRefObject<ReturnType<typeof setInterval> | null>) {
    setC(60);
    ref.current = setInterval(() => {
      setC((c) => { if (c <= 1) { clearInterval(ref.current!); return 0; } return c - 1; });
    }, 1000);
  }

  // ── Login handlers ──
  function handleGetLoginOtp() {
    if (!phone || phone.length < 8) { setLoginErrors({ phone: t.errorPhone }); return; }
    setLoginErrors({});
    setOtpSent(true);
    startCountdown(setCountdown, timerRef);
  }

  function handleLogin() {
    const errs: Record<string, string> = {};
    if (!phone || phone.length < 8) errs.phone = t.errorPhone;
    if (loginMode === 'password' && (!password || password.length < 8)) errs.password = t.errorPassword;
    if (loginMode === 'otp' && !otp) errs.otp = t.errorOtp;
    if (!agreed) errs.agreed = t.errorAgree;
    if (Object.keys(errs).length) { setLoginErrors(errs); return; }
    setLoginErrors({});
    onSuccess({ name: lang === 'en' ? 'Alex Chan' : '陳大文', phone: `+852 ${phone}`, gender: lang === 'en' ? 'M' : '男', age: 28 });
  }

  // ── Register phone handlers ──
  function handleGetRegOtp() {
    if (!regPhone || regPhone.length < 8) { setRegPhoneErrors({ phone: t.errorPhone }); return; }
    setRegPhoneErrors({});
    setRegOtpSent(true);
    startCountdown(setRegCountdown, regTimerRef);
  }

  function handleRegPhoneNext() {
    const errs: Record<string, string> = {};
    if (!regPhone || regPhone.length < 8) errs.phone = t.errorPhone;
    if (!regOtp) errs.otp = t.errorOtp;
    if (!regAgreed) errs.agreed = t.errorAgree;
    if (Object.keys(errs).length) { setRegPhoneErrors(errs); return; }
    setRegPhoneErrors({});
    setStep('register-setup');
  }

  // ── Register setup handlers ──
  function handleSendEmailCode() {
    if (!regEmail || !regEmail.includes('@')) { setSetupErrors({ email: lang === 'en' ? 'Enter a valid email' : '請輸入有效電郵' }); return; }
    setSetupErrors({});
    setEmailCodeSent(true);
  }

  function handleVerifyEmail() {
    if (!regEmailCode || regEmailCode.length < 4) { setSetupErrors({ emailCode: lang === 'en' ? 'Enter the verification code' : '請輸入驗證碼' }); return; }
    setSetupErrors({});
    setEmailVerified(true);
  }

  function handleSetupComplete() {
    const errs: Record<string, string> = {};
    if (!regPassword || regPassword.length < 8) errs.password = t.errorPassword;
    if (regPassword !== regConfirm) errs.confirm = t.errorConfirm;
    if (Object.keys(errs).length) { setSetupErrors(errs); return; }
    setSetupErrors({});
    setSetupSuccess(true);
    setTimeout(() => {
      onSuccess({ name: lang === 'en' ? 'New User' : '新用戶', phone: `+852 ${regPhone}`, gender: lang === 'en' ? 'M' : '男', age: 25 });
    }, 1400);
  }

  const iconColor = '#9CA3AF';

  // ── Legal modal titles ──
  const legalTitles = {
    terms: lang === 'en' ? 'Terms of Service' : '服務條款',
    privacy: lang === 'en' ? 'Privacy Policy' : '隱私政策',
  };

  // ── Login screen ──────────────────────────────────────
  const LoginScreen = (
    <motion.div key="login" initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} transition={{ duration: 0.22 }}>
      <div className="flex flex-col items-center gap-2 py-8">
        <HexLogoSmall />
        <span style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0F1623', letterSpacing: '-0.02em' }}>
          New<span style={{ color: '#F5A623' }}>Bee</span>
        </span>
        <h1 style={{ fontSize: '1rem', fontWeight: 600, color: '#6B7A99', margin: 0 }}>{t.loginTitle}</h1>
      </div>

      <div className="flex flex-col gap-3.5">
        {/* Mode toggle */}
        <div className="flex rounded-xl p-1" style={{ background: '#EEF1F8' }}>
          {(['password', 'otp'] as const).map((mode) => (
            <button key={mode} onClick={() => setLoginMode(mode)}
              className="flex-1 rounded-lg py-2 transition-all"
              style={{ background: loginMode === mode ? '#FFFFFF' : 'transparent', border: 'none', cursor: 'pointer', fontSize: '0.85rem', fontWeight: loginMode === mode ? 700 : 500, color: loginMode === mode ? '#0F1623' : '#6B7A99', boxShadow: loginMode === mode ? '0 1px 4px rgba(15,22,35,0.08)' : 'none' }}>
              {mode === 'password' ? t.passwordLogin : t.otpLogin}
            </button>
          ))}
        </div>

        {/* Phone */}
        <FieldInput
          prefix={
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, borderRight: '1px solid rgba(15,22,35,0.1)', paddingRight: 10, flexShrink: 0 }}>
              <Phone size={13} color={iconColor} />
              <span style={{ fontSize: '0.88rem', fontWeight: 600, color: '#0F1623', whiteSpace: 'nowrap' }}>+852</span>
            </div>
          }
          placeholder={t.phonePlaceholder} value={phone} onChange={setPhone} type="tel" error={loginErrors.phone}
        />

        {/* Password or OTP */}
        <AnimatePresence mode="wait">
          {loginMode === 'password' ? (
            <motion.div key="pwd" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
              <FieldInput
                placeholder={t.passwordPlaceholder} value={password} onChange={setPassword}
                type={showPwd ? 'text' : 'password'}
                prefix={<Lock size={13} color={iconColor} />}
                suffix={<button onClick={() => setShowPwd((p) => !p)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: iconColor, padding: 0 }}>{showPwd ? <EyeOff size={13} /> : <Eye size={13} />}</button>}
                error={loginErrors.password}
              />
            </motion.div>
          ) : (
            <motion.div key="otp-login" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
              <div className="flex gap-2">
                <div style={{ flex: 1 }}>
                  <FieldInput
                    placeholder={t.otpPlaceholder} value={otp} onChange={setOtp}
                    type="text"
                    error={loginErrors.otp}
                  />
                </div>
                <button onClick={handleGetLoginOtp} disabled={otpSent && countdown > 0}
                  className="shrink-0 rounded-xl px-4 transition-all"
                  style={{ background: otpSent && countdown > 0 ? '#EEF1F8' : '#0F1623', color: otpSent && countdown > 0 ? '#9CA3AF' : '#FFFFFF', border: 'none', cursor: otpSent && countdown > 0 ? 'not-allowed' : 'pointer', fontSize: '0.78rem', fontWeight: 600, whiteSpace: 'nowrap' }}>
                  {otpSent && countdown > 0 ? `${countdown}${t.resendIn}` : t.getOtp}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Agreement */}
        <div>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
            <div
              onClick={() => setAgreed((a) => !a)}
              style={{ width: 18, height: 18, borderRadius: '5px', border: `1.5px solid ${agreed ? '#0F1623' : 'rgba(15,22,35,0.2)'}`, background: agreed ? '#0F1623' : '#FFFFFF', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', marginTop: 2 }}
            >
              {agreed && <span style={{ color: '#FFFFFF', fontSize: '0.65rem', fontWeight: 700, lineHeight: 1 }}>✓</span>}
            </div>
            <span style={{ fontSize: '0.78rem', color: '#6B7A99', lineHeight: 1.5 }}>
              {t.agreeTerms}{' '}
              <button onClick={(e) => { e.stopPropagation(); setLegalModal('terms'); }} style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', color: '#F5A623', fontWeight: 600, fontSize: '0.78rem', fontFamily: 'inherit' }}>
                {t.terms}
              </button>
              {' '}/{' '}
              <button onClick={(e) => { e.stopPropagation(); setLegalModal('privacy'); }} style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', color: '#F5A623', fontWeight: 600, fontSize: '0.78rem', fontFamily: 'inherit' }}>
                {t.privacy}
              </button>
            </span>
          </div>
          {loginErrors.agreed && <p style={{ fontSize: '0.73rem', color: '#D93025', marginTop: 4, paddingLeft: 28 }}>{loginErrors.agreed}</p>}
        </div>

        {/* Login CTA */}
        <button onClick={handleLogin} className="w-full rounded-xl py-3.5 transition-all active:scale-[0.98]"
          style={{ background: '#0F1623', color: '#FFFFFF', border: 'none', cursor: 'pointer', fontSize: '0.95rem', fontWeight: 700 }}>
          {t.loginBtn}
        </button>

        {/* Register link */}
        <button onClick={() => setStep('register-phone')}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#F5A623', fontSize: '0.85rem', fontWeight: 600, textAlign: 'center', padding: '2px 0' }}>
          {t.switchToRegister}
        </button>
      </div>
    </motion.div>
  );

  // ── Register: phone + OTP ─────────────────────────────
  const RegisterPhoneScreen = (
    <motion.div key="reg-phone" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} transition={{ duration: 0.22 }}>
      <div className="flex items-center gap-3 py-5">
        <button onClick={() => { setStep('login'); setRegPhoneErrors({}); setRegOtpSent(false); setRegCountdown(0); }}
          className="flex items-center justify-center rounded-xl"
          style={{ width: 36, height: 36, background: '#EEF1F8', border: 'none', cursor: 'pointer', flexShrink: 0 }}>
          <ChevronLeft size={18} style={{ color: '#0F1623' }} />
        </button>
        <h1 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0F1623', margin: 0 }}>
          {lang === 'en' ? 'Create Account' : '注冊帳號'}
        </h1>
      </div>

      <div className="rounded-xl p-3.5 mb-5" style={{ background: '#EEF1F8', border: '1px solid rgba(15,22,35,0.06)' }}>
        <p style={{ fontSize: '0.8rem', color: '#6B7A99', lineHeight: 1.5, margin: 0 }}>
          {lang === 'en'
            ? 'Enter your HK mobile number to receive a verification code and create your account.'
            : '請輸入香港手機號碼，我們將發送驗證碼以完成注冊。'}
        </p>
      </div>

      <div className="flex flex-col gap-3.5">
        <FieldInput
          prefix={
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, borderRight: '1px solid rgba(15,22,35,0.1)', paddingRight: 10, flexShrink: 0 }}>
              <Phone size={13} color={iconColor} />
              <span style={{ fontSize: '0.88rem', fontWeight: 600, color: '#0F1623', whiteSpace: 'nowrap' }}>+852</span>
            </div>
          }
          placeholder={t.phonePlaceholder} value={regPhone} onChange={setRegPhone} type="tel" error={regPhoneErrors.phone}
        />

        <div className="flex gap-2">
          <div style={{ flex: 1 }}>
            <FieldInput
              placeholder={t.otpPlaceholder} value={regOtp} onChange={setRegOtp}
              type="text"
              error={regPhoneErrors.otp}
            />
          </div>
          <button onClick={handleGetRegOtp} disabled={regOtpSent && regCountdown > 0}
            className="shrink-0 rounded-xl px-4 transition-all"
            style={{ background: regOtpSent && regCountdown > 0 ? '#EEF1F8' : '#0F1623', color: regOtpSent && regCountdown > 0 ? '#9CA3AF' : '#FFFFFF', border: 'none', cursor: regOtpSent && regCountdown > 0 ? 'not-allowed' : 'pointer', fontSize: '0.78rem', fontWeight: 600, whiteSpace: 'nowrap' }}>
            {regOtpSent && regCountdown > 0 ? `${regCountdown}${t.resendIn}` : t.getOtp}
          </button>
        </div>

        {regOtpSent && (
          <p style={{ fontSize: '0.73rem', color: '#9CA3AF', paddingLeft: 2 }}>
            {lang === 'en' ? 'Demo: enter any code to continue' : '演示：輸入任意驗證碼即可繼續'}
          </p>
        )}

        {/* Agreement */}
        <div>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
            <div
              onClick={() => setRegAgreed((a) => !a)}
              style={{ width: 18, height: 18, borderRadius: '5px', border: `1.5px solid ${regAgreed ? '#0F1623' : 'rgba(15,22,35,0.2)'}`, background: regAgreed ? '#0F1623' : '#FFFFFF', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', marginTop: 2 }}
            >
              {regAgreed && <span style={{ color: '#FFFFFF', fontSize: '0.65rem', fontWeight: 700, lineHeight: 1 }}>✓</span>}
            </div>
            <span style={{ fontSize: '0.78rem', color: '#6B7A99', lineHeight: 1.5 }}>
              {t.agreeTerms}{' '}
              <button onClick={(e) => { e.stopPropagation(); setLegalModal('terms'); }} style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', color: '#F5A623', fontWeight: 600, fontSize: '0.78rem', fontFamily: 'inherit' }}>
                {t.terms}
              </button>
              {' '}/{' '}
              <button onClick={(e) => { e.stopPropagation(); setLegalModal('privacy'); }} style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', color: '#F5A623', fontWeight: 600, fontSize: '0.78rem', fontFamily: 'inherit' }}>
                {t.privacy}
              </button>
            </span>
          </div>
          {regPhoneErrors.agreed && <p style={{ fontSize: '0.73rem', color: '#D93025', marginTop: 4, paddingLeft: 28 }}>{regPhoneErrors.agreed}</p>}
        </div>

        <button onClick={handleRegPhoneNext} className="w-full rounded-xl py-3.5 transition-all active:scale-[0.98]"
          style={{ background: '#0F1623', color: '#FFFFFF', border: 'none', cursor: 'pointer', fontSize: '0.95rem', fontWeight: 700, marginTop: 4 }}>
          {lang === 'en' ? 'Next' : '下一步'}
        </button>
      </div>
    </motion.div>
  );

  // ── Register: account setup ───────────────────────────
  const RegisterSetupScreen = (
    <motion.div key="reg-setup" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} transition={{ duration: 0.22 }}>
      <div className="flex items-center gap-3 py-5">
        <button onClick={() => { setStep('register-phone'); setSetupErrors({}); }}
          className="flex items-center justify-center rounded-xl"
          style={{ width: 36, height: 36, background: '#EEF1F8', border: 'none', cursor: 'pointer', flexShrink: 0 }}>
          <ChevronLeft size={18} style={{ color: '#0F1623' }} />
        </button>
        <h1 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0F1623', margin: 0 }}>
          {lang === 'en' ? 'Account Setup' : '帳號設定'}
        </h1>
      </div>

      {setupSuccess ? (
        <motion.div className="flex flex-col items-center gap-4 py-12" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
          <div className="flex items-center justify-center rounded-full" style={{ width: 72, height: 72, background: '#DCFCE7' }}>
            <CheckCircle2 size={40} style={{ color: '#15803D' }} />
          </div>
          <p style={{ fontSize: '1rem', fontWeight: 700, color: '#0F1623', textAlign: 'center' }}>
            {lang === 'en' ? 'Account Created!' : '注冊成功！'}
          </p>
          <p style={{ fontSize: '0.83rem', color: '#6B7A99', textAlign: 'center' }}>
            {lang === 'en' ? 'Taking you in...' : '正在進入...'}
          </p>
        </motion.div>
      ) : (
        <div className="flex flex-col gap-5">
          {/* Password section */}
          <div className="flex flex-col gap-2.5">
            <p style={{ fontSize: '0.78rem', fontWeight: 600, color: '#6B7A99', margin: 0 }}>{t.setPassword}</p>
            <FieldInput
              placeholder={t.setPasswordPlaceholder} value={regPassword} onChange={setRegPassword}
              type={showRegPwd ? 'text' : 'password'}
              prefix={<Lock size={13} color={iconColor} />}
              suffix={<button onClick={() => setShowRegPwd((p) => !p)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: iconColor, padding: 0 }}>{showRegPwd ? <EyeOff size={13} /> : <Eye size={13} />}</button>}
              error={setupErrors.password}
            />
            <FieldInput
              placeholder={t.confirmPasswordPlaceholder} value={regConfirm} onChange={setRegConfirm}
              type={showRegConfirm ? 'text' : 'password'}
              prefix={<Lock size={13} color={iconColor} />}
              suffix={<button onClick={() => setShowRegConfirm((p) => !p)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: iconColor, padding: 0 }}>{showRegConfirm ? <EyeOff size={13} /> : <Eye size={13} />}</button>}
              error={setupErrors.confirm}
            />
          </div>

          <div style={{ borderTop: '1px solid rgba(15,22,35,0.07)' }} />

          {/* Email section with verification */}
          <div className="flex flex-col gap-2.5">
            <p style={{ fontSize: '0.78rem', fontWeight: 600, color: '#6B7A99', margin: 0, display: 'flex', alignItems: 'center', gap: 4 }}>
              {t.emailRow}
              <OptionalBadge lang={lang} />
              {emailVerified && (
                <span style={{ marginLeft: 6, fontSize: '0.7rem', fontWeight: 700, color: '#15803D', background: '#DCFCE7', borderRadius: '0.375rem', padding: '1px 6px' }}>
                  {lang === 'en' ? 'Verified' : '已驗證'}
                </span>
              )}
            </p>

            {/* Email input + send code button */}
            <div className="flex gap-2">
              <div style={{ flex: 1 }}>
                <FieldInput
                  placeholder={t.emailPlaceholder} value={regEmail} onChange={(v) => { setRegEmail(v); setEmailVerified(false); setEmailCodeSent(false); setRegEmailCode(''); }}
                  type="email"
                  prefix={<Mail size={13} color={iconColor} />}
                  error={setupErrors.email}
                />
              </div>
              {!emailVerified && (
                <button
                  onClick={handleSendEmailCode}
                  disabled={!regEmail || emailCodeSent}
                  className="shrink-0 rounded-xl px-3 transition-all"
                  style={{
                    background: !regEmail || emailCodeSent ? '#EEF1F8' : '#0F1623',
                    color: !regEmail || emailCodeSent ? '#9CA3AF' : '#FFFFFF',
                    border: 'none', cursor: !regEmail || emailCodeSent ? 'not-allowed' : 'pointer',
                    fontSize: '0.75rem', fontWeight: 600, whiteSpace: 'nowrap',
                    display: 'flex', alignItems: 'center', gap: 4,
                  }}
                >
                  <Send size={12} />
                  {lang === 'en' ? 'Send' : '發送'}
                </button>
              )}
            </div>

            {/* Email verification code input */}
            <AnimatePresence>
              {emailCodeSent && !emailVerified && (
                <motion.div
                  className="flex gap-2"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <div style={{ flex: 1 }}>
                    <FieldInput
                      placeholder={lang === 'en' ? 'Email verification code' : '電郵驗證碼'}
                      value={regEmailCode}
                      onChange={setRegEmailCode}
                      type="text"
                      error={setupErrors.emailCode}
                    />
                  </div>
                  <button
                    onClick={handleVerifyEmail}
                    className="shrink-0 rounded-xl px-3 transition-all active:scale-95"
                    style={{ background: '#F5A623', color: '#0F1623', border: 'none', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 700, whiteSpace: 'nowrap' }}
                  >
                    {lang === 'en' ? 'Verify' : '驗證'}
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            {emailCodeSent && !emailVerified && (
              <p style={{ fontSize: '0.73rem', color: '#9CA3AF', paddingLeft: 2 }}>
                {lang === 'en' ? 'Demo: enter any code to verify' : '演示：輸入任意驗證碼即可驗證'}
              </p>
            )}
          </div>

          {/* Password hint — OTP sentence removed */}
          <div className="rounded-xl p-3" style={{ background: '#FFFBEB', border: '1px solid rgba(245,166,35,0.2)' }}>
            <p style={{ fontSize: '0.76rem', color: '#92580A', lineHeight: 1.6, margin: 0 }}>
              {lang === 'en'
                ? 'Password can be changed later in Profile → Account Settings.'
                : '密碼可在「個人 — 賬戶設定」中修改。'}
            </p>
          </div>

          <button onClick={handleSetupComplete} className="w-full rounded-xl py-3.5 transition-all active:scale-[0.98]"
            style={{ background: '#F5A623', color: '#0F1623', border: 'none', cursor: 'pointer', fontSize: '0.95rem', fontWeight: 700 }}>
            {t.finishRegister}
          </button>
        </div>
      )}
    </motion.div>
  );

  return (
    <div className="size-full flex flex-col overflow-hidden" style={{ background: '#F7F8FC' }}>
      {/* Spinner removal for number inputs (global within this component) */}
      <style>{`
        input[type=number]::-webkit-inner-spin-button,
        input[type=number]::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0; }
        input[type=number] { -moz-appearance: textfield; }
      `}</style>

      {/* Lang switcher — login step only */}
      <div className="flex justify-end px-5 pt-5 pb-1 relative shrink-0" style={{ visibility: step === 'login' ? 'visible' : 'hidden', pointerEvents: step === 'login' ? 'auto' : 'none' }}>
        <div className="relative">
          <button onClick={() => setShowLangMenu((p) => !p)}
            className="flex items-center gap-1.5 rounded-xl px-3 py-1.5"
            style={{ background: '#EEF1F8', border: 'none', cursor: 'pointer' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#0F1623' }}>{LANG_LABELS[lang]}</span>
            <span style={{ fontSize: '0.65rem', color: '#9CA3AF' }}>▾</span>
          </button>
          <AnimatePresence>
            {showLangMenu && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowLangMenu(false)} />
                <motion.div className="absolute right-0 top-full mt-1.5 rounded-xl overflow-hidden z-50"
                  initial={{ opacity: 0, scale: 0.95, y: -8 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: -8 }} transition={{ duration: 0.15 }}
                  style={{ background: '#FFFFFF', boxShadow: '0 8px 32px rgba(15,22,35,0.15)', minWidth: 140, border: '1px solid rgba(15,22,35,0.08)' }}>
                  {(['zh-HK', 'zh-CN', 'en'] as Language[]).map((l) => (
                    <button key={l} onClick={() => { onLangChange(l); setShowLangMenu(false); }}
                      className="w-full flex items-center justify-between px-4 py-2.5"
                      style={{ background: lang === l ? '#EEF1F8' : 'transparent', border: 'none', cursor: 'pointer', fontSize: '0.85rem', fontWeight: lang === l ? 700 : 500, color: lang === l ? '#0F1623' : '#6B7A99' }}>
                      <span>{LANG_NAMES[l]}</span>
                      {lang === l && <span style={{ fontSize: '0.7rem', color: '#F5A623', fontWeight: 700 }}>✓</span>}
                    </button>
                  ))}
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-y-auto px-5 pb-8" style={{ scrollbarWidth: 'none' }}>
        <AnimatePresence mode="wait">
          {step === 'login' && LoginScreen}
          {step === 'register-phone' && RegisterPhoneScreen}
          {step === 'register-setup' && RegisterSetupScreen}
        </AnimatePresence>
      </div>

      {/* Legal modals */}
      <AnimatePresence>
        {legalModal && (
          <LegalModal
            title={legalTitles[legalModal]}
            onClose={() => setLegalModal(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
