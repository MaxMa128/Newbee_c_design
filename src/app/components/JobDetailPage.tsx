import { useState } from 'react';
import { ChevronLeft, Share2, MapPin, Users, FileText, Award, Building2, CheckCircle2, Clock, Check, Shield, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Language, translations } from './i18n';
import { Job, formatTime } from './jobData';

type ApplyStatus = 'idle' | 'applied' | 'reviewing' | 'scheduled' | 'rejected';

const CARD_SHADOW = '0 1px 3px rgba(15,22,35,0.06), 0 4px 16px rgba(15,22,35,0.04)';
const CARD_BORDER = '1px solid rgba(15,22,35,0.06)';

interface JobDetailPageProps {
  job: Job;
  lang: Language;
  isVerified: boolean;
  onBack: () => void;
  onStartVerify: () => void;
}

function InfoRow({ icon, label, value, sub }: { icon: React.ReactNode; label: string; value: string; sub?: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex items-center justify-center rounded-lg shrink-0 mt-0.5" style={{ width: 30, height: 30, background: '#EEF1F8' }}>
        {icon}
      </div>
      <div className="flex-1">
        <p style={{ fontSize: '0.72rem', fontWeight: 600, color: '#9CA3AF', margin: 0, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</p>
        <p style={{ fontSize: '0.88rem', fontWeight: 600, color: '#0F1623', margin: '2px 0 0 0' }}>{value}</p>
        {sub && <p style={{ fontSize: '0.75rem', color: '#9CA3AF', margin: '1px 0 0 0' }}>{sub}</p>}
      </div>
    </div>
  );
}

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-3">
      <h3 style={{ fontSize: '0.82rem', fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.08em', margin: 0 }}>{title}</h3>
      <div className="rounded-2xl p-4 flex flex-col gap-4" style={{ background: '#FFFFFF', boxShadow: CARD_SHADOW, border: CARD_BORDER }}>
        {children}
      </div>
    </div>
  );
}

const applyStatusConfig: Record<ApplyStatus, { label: string; bg: string; color: string; desc: string }> = {
  idle: { label: '', bg: '', color: '', desc: '' },
  applied: { label: '已申請', bg: '#FEF3DC', color: '#D4891A', desc: '申請已提交，等待審核' },
  reviewing: { label: '審核中', bg: '#EEF1F8', color: '#3B5BDB', desc: '人事部正在審核您的申請' },
  scheduled: { label: '已安排', bg: '#DCFCE7', color: '#15803D', desc: '恭喜！您的申請已通過，詳情請留意通知' },
  rejected: { label: '未獲取錄', bg: '#FEE2E2', color: '#D93025', desc: '很遺憾此次未獲取錄，可繼續申請其他職位' },
};

export function JobDetailPage({ job, lang, isVerified, onBack, onStartVerify }: JobDetailPageProps) {
  const t = translations[lang];
  const [applyStatus, setApplyStatus] = useState<ApplyStatus>('idle');
  const [showCopied, setShowCopied] = useState(false);
  const [showApplyConfirm, setShowApplyConfirm] = useState(false);
  const [showVerifyPrompt, setShowVerifyPrompt] = useState(false);

  const salaryStr = job.salaryMax
    ? `HK$${job.salary}–${job.salaryMax}${t[job.salaryPeriod === 'hourly' ? 'hourlyUnit' : job.salaryPeriod === 'daily' ? 'dailyUnit' : 'monthlyUnit']}`
    : `HK$${job.salary.toLocaleString()}${t[job.salaryPeriod === 'hourly' ? 'hourlyUnit' : job.salaryPeriod === 'daily' ? 'dailyUnit' : 'monthlyUnit']}`;

  const jobTypeLabel = job.jobType === 'full-time' ? t.fullTimeTag : job.jobType === 'part-time' ? t.partTimeTag : t.casualTag;

  function handleShare() {
    const url = `https://newbee.hk/jobs/${job.id}`;
    navigator.clipboard.writeText(url).catch(() => {});
    setShowCopied(true);
    setTimeout(() => setShowCopied(false), 3000);
  }

  function handleMapPress() {
    const url = `https://maps.google.com/?q=${job.lat},${job.lng}`;
    window.open(url, '_blank');
  }

  function handleApply() {
    if (applyStatus !== 'idle') return;
    if (!isVerified) {
      setShowVerifyPrompt(true);
      return;
    }
    setShowApplyConfirm(true);
  }

  function confirmApply() {
    setShowApplyConfirm(false);
    setApplyStatus('applied');
    // Simulate progression to "reviewing" after 1.5s
    setTimeout(() => setApplyStatus('reviewing'), 1500);
  }

  const statusCfg = applyStatus !== 'idle' ? applyStatusConfig[applyStatus] : null;

  return (
    <div className="size-full flex flex-col overflow-hidden" style={{ background: '#F7F8FC' }}>
      {/* Header */}
      <div
        className="shrink-0 flex items-center justify-between px-4 py-3"
        style={{ background: '#FFFFFF', borderBottom: '1px solid rgba(15,22,35,0.06)' }}
      >
        <button
          onClick={onBack}
          className="flex items-center justify-center rounded-xl"
          style={{ width: 36, height: 36, background: '#EEF1F8', border: 'none', cursor: 'pointer' }}
        >
          <ChevronLeft size={18} style={{ color: '#0F1623' }} />
        </button>
        <h2 style={{ fontSize: '1rem', fontWeight: 700, color: '#0F1623', margin: 0 }}>職位詳情</h2>
        <button
          onClick={handleShare}
          className="flex items-center justify-center rounded-xl relative"
          style={{ width: 36, height: 36, background: '#EEF1F8', border: 'none', cursor: 'pointer' }}
        >
          <Share2 size={16} style={{ color: '#0F1623' }} />
        </button>
      </div>

      {/* Copy toast */}
      <AnimatePresence>
        {showCopied && (
          <motion.div
            initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="absolute left-4 right-4 z-50 flex items-center gap-2.5 rounded-xl px-4 py-3"
            style={{ top: 64, background: '#0F1623', boxShadow: '0 8px 24px rgba(15,22,35,0.25)' }}
          >
            <Check size={15} style={{ color: '#F5A623', flexShrink: 0 }} />
            <div>
              <p style={{ fontSize: '0.85rem', fontWeight: 700, color: '#FFFFFF', margin: 0 }}>已複製分享連結</p>
              <p style={{ fontSize: '0.75rem', color: '#9CA3AF', margin: '2px 0 0 0' }}>可貼上並分享到其他平台</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-4" style={{ scrollbarWidth: 'none' }}>

        {/* Hero card */}
        <div className="rounded-2xl p-4" style={{ background: '#FFFFFF', boxShadow: CARD_SHADOW, border: CARD_BORDER }}>
          {/* Tags */}
          <div className="flex flex-wrap gap-1.5 mb-3">
            {job.isUrgent && (
              <span className="rounded-md px-2 py-0.5" style={{ fontSize: '0.7rem', fontWeight: 700, background: '#FEF3DC', color: '#D4891A', border: '1px solid rgba(245,166,35,0.25)' }}>
                {t.urgentTag}
              </span>
            )}
            <span className="rounded-md px-2 py-0.5" style={{ fontSize: '0.7rem', fontWeight: 700, background: '#EEF1F8', color: '#1A2B4A', border: '1px solid rgba(15,22,35,0.08)' }}>
              {jobTypeLabel}
            </span>
            {job.isDailyPay && (
              <span className="rounded-md px-2 py-0.5" style={{ fontSize: '0.7rem', fontWeight: 700, background: '#DCFCE7', color: '#15803D', border: '1px solid rgba(21,128,61,0.18)' }}>
                {t.dailyPayTag}
              </span>
            )}
            <span className="rounded-md px-2 py-0.5" style={{ fontSize: '0.7rem', fontWeight: 600, background: '#EEF1F8', color: '#6B7A99', border: '1px solid rgba(15,22,35,0.08)' }}>
              {job.category[lang]}
            </span>
          </div>

          {/* Logo + title */}
          <div className="flex items-center gap-3 mb-4">
            <div
              className="shrink-0 flex items-center justify-center rounded-2xl"
              style={{ width: 52, height: 52, background: job.logoColor + '16', border: `2px solid ${job.logoColor}22` }}
            >
              <span style={{ fontSize: '1.2rem', fontWeight: 800, color: job.logoColor }}>{job.logo}</span>
            </div>
            <div className="flex-1 min-w-0">
              <h1 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0F1623', margin: 0, letterSpacing: '-0.02em' }}>
                {job.title[lang]}
              </h1>
              <p style={{ fontSize: '0.8rem', color: '#6B7A99', margin: '3px 0 0 0' }}>{job.company} · {job.store[lang]}</p>
            </div>
          </div>

          {/* Salary + meta strip */}
          <div className="flex items-center justify-between pt-3" style={{ borderTop: '1px solid rgba(15,22,35,0.05)' }}>
            <div>
              <p style={{ fontSize: '0.68rem', fontWeight: 600, color: '#9CA3AF', margin: '0 0 2px 0', textTransform: 'uppercase', letterSpacing: '0.06em' }}>薪酬</p>
              <span style={{ fontSize: '1.3rem', fontWeight: 800, color: '#0F1623', letterSpacing: '-0.02em' }}>{salaryStr}</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p style={{ fontSize: '0.68rem', fontWeight: 600, color: '#9CA3AF', margin: '0 0 2px 0', textTransform: 'uppercase', letterSpacing: '0.06em' }}>招募</p>
                <span style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0F1623' }}>{job.headcount}人</span>
              </div>
              <div className="text-right">
                <p style={{ fontSize: '0.68rem', fontWeight: 600, color: '#9CA3AF', margin: '0 0 2px 0', textTransform: 'uppercase', letterSpacing: '0.06em' }}>餘額</p>
                <span style={{ fontSize: '0.95rem', fontWeight: 700, color: job.remainingSpots <= 2 ? '#D93025' : '#15803D' }}>
                  {job.remainingSpots}人
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Apply status banner */}
        <AnimatePresence>
          {statusCfg && (
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.25 }}
              className="rounded-2xl px-4 py-3 flex items-center gap-3"
              style={{ background: statusCfg.bg, border: `1px solid ${statusCfg.color}30` }}
            >
              <div className="flex items-center justify-center rounded-full shrink-0" style={{ width: 32, height: 32, background: statusCfg.color + '20' }}>
                <CheckCircle2 size={16} style={{ color: statusCfg.color }} />
              </div>
              <div className="flex-1">
                <p style={{ fontSize: '0.85rem', fontWeight: 700, color: statusCfg.color, margin: 0 }}>{statusCfg.label}</p>
                <p style={{ fontSize: '0.75rem', color: statusCfg.color + 'CC', margin: '2px 0 0 0' }}>{statusCfg.desc}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Job info */}
        <SectionCard title="崗位資訊">
          <InfoRow
            icon={<FileText size={14} style={{ color: '#6B7A99' }} />}
            label="工作日期"
            value={job.date[lang]}
            sub={formatTime(job.postedMinutes, lang) + '發布'}
          />
          <div style={{ height: 1, background: 'rgba(15,22,35,0.05)' }} />

          {/* Requirements */}
          <div>
            <div className="flex items-center gap-2 mb-2.5">
              <div className="flex items-center justify-center rounded-lg" style={{ width: 30, height: 30, background: '#EEF1F8' }}>
                <Users size={14} style={{ color: '#6B7A99' }} />
              </div>
              <p style={{ fontSize: '0.72rem', fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.06em', margin: 0 }}>工作要求</p>
            </div>
            <div className="flex flex-col gap-2 pl-10">
              {job.requirements[lang].map((req, i) => (
                <div key={i} className="flex items-start gap-2">
                  <div className="flex items-center justify-center rounded-full shrink-0 mt-0.5" style={{ width: 16, height: 16, background: '#FEF3DC' }}>
                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#F5A623' }} />
                  </div>
                  <span style={{ fontSize: '0.85rem', color: '#374151', lineHeight: 1.5 }}>{req}</span>
                </div>
              ))}
            </div>
          </div>

          <div style={{ height: 1, background: 'rgba(15,22,35,0.05)' }} />

          {/* Cert requirements */}
          <div>
            <div className="flex items-center gap-2 mb-2.5">
              <div className="flex items-center justify-center rounded-lg" style={{ width: 30, height: 30, background: '#EEF1F8' }}>
                <Award size={14} style={{ color: '#6B7A99' }} />
              </div>
              <p style={{ fontSize: '0.72rem', fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.06em', margin: 0 }}>證書要求</p>
            </div>
            <div className="flex flex-col gap-2 pl-10">
              {job.certRequirements[lang].map((cert, i) => (
                <div key={i} className="flex items-start gap-2">
                  <div className="flex items-center justify-center rounded-full shrink-0 mt-0.5" style={{ width: 16, height: 16, background: cert.includes('必須') || cert.includes('mandatory') ? '#FEE2E2' : '#DCFCE7' }}>
                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: cert.includes('必須') || cert.includes('mandatory') ? '#D93025' : '#15803D' }} />
                  </div>
                  <span style={{ fontSize: '0.85rem', color: '#374151', lineHeight: 1.5 }}>{cert}</span>
                </div>
              ))}
            </div>
          </div>
        </SectionCard>

        {/* Store info */}
        <SectionCard title="門店資訊">
          <InfoRow
            icon={<MapPin size={14} style={{ color: '#6B7A99' }} />}
            label="詳細地址"
            value={job.address[lang]}
            sub={`${job.district[lang]} · ${job.mtr[lang]}`}
          />
          {/* Map module */}
          <button
            onClick={handleMapPress}
            className="w-full rounded-xl overflow-hidden transition-all active:scale-[0.98]"
            style={{ border: 'none', padding: 0, cursor: 'pointer', position: 'relative' }}
          >
            {/* Static map placeholder */}
            <div
              className="w-full flex flex-col items-center justify-center gap-2"
              style={{
                height: 120,
                background: 'linear-gradient(135deg, #E8EEFF 0%, #DDE7F8 100%)',
                borderRadius: '0.75rem',
                border: '1.5px solid rgba(59,91,219,0.15)',
              }}
            >
              {/* Simple map grid lines */}
              <svg width="100%" height="100%" style={{ position: 'absolute', top: 0, left: 0, opacity: 0.3 }} viewBox="0 0 320 120" preserveAspectRatio="none">
                <line x1="0" y1="40" x2="320" y2="40" stroke="#3B5BDB" strokeWidth="0.8" />
                <line x1="0" y1="80" x2="320" y2="80" stroke="#3B5BDB" strokeWidth="0.8" />
                <line x1="80" y1="0" x2="80" y2="120" stroke="#3B5BDB" strokeWidth="0.8" />
                <line x1="160" y1="0" x2="160" y2="120" stroke="#3B5BDB" strokeWidth="0.8" />
                <line x1="240" y1="0" x2="240" y2="120" stroke="#3B5BDB" strokeWidth="0.8" />
              </svg>
              <div className="relative flex flex-col items-center gap-1.5">
                <div className="flex items-center justify-center rounded-full" style={{ width: 36, height: 36, background: '#FFFFFF', boxShadow: '0 2px 8px rgba(59,91,219,0.25)' }}>
                  <MapPin size={18} style={{ color: '#D93025' }} />
                </div>
                <div className="flex items-center gap-1.5 rounded-full px-3 py-1" style={{ background: '#FFFFFF', boxShadow: '0 2px 8px rgba(15,22,35,0.1)' }}>
                  <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#0F1623' }}>點擊查看地圖</span>
                </div>
              </div>
            </div>
          </button>
        </SectionCard>

        {/* Company info */}
        <SectionCard title="公司資訊">
          <div className="flex items-center gap-3">
            <div
              className="shrink-0 flex items-center justify-center rounded-2xl"
              style={{ width: 52, height: 52, background: job.logoColor + '16', border: `2px solid ${job.logoColor}22` }}
            >
              <span style={{ fontSize: '1.25rem', fontWeight: 800, color: job.logoColor }}>{job.logo}</span>
            </div>
            <div className="flex-1">
              <p style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0F1623', margin: 0 }}>{job.company}</p>
              <div className="flex items-center gap-2 mt-1">
                <div className="flex items-center gap-1">
                  <Building2 size={12} style={{ color: '#9CA3AF' }} />
                  <span style={{ fontSize: '0.75rem', color: '#9CA3AF' }}>{job.companySize}</span>
                </div>
                <span style={{ color: '#D1D5DB', fontSize: '0.7rem' }}>·</span>
                <span style={{ fontSize: '0.75rem', color: '#9CA3AF' }}>{job.category[lang]}</span>
              </div>
            </div>
          </div>
          <div style={{ height: 1, background: 'rgba(15,22,35,0.05)' }} />
          <p style={{ fontSize: '0.85rem', color: '#374151', lineHeight: 1.7, margin: 0 }}>
            {job.companyIntro[lang]}
          </p>
        </SectionCard>

        <div style={{ height: 80 }} />
      </div>

      {/* Bottom action bar */}
      <div
        className="shrink-0 px-4 py-3 flex gap-3"
        style={{ background: '#FFFFFF', borderTop: '1px solid rgba(15,22,35,0.06)', boxShadow: '0 -4px 20px rgba(15,22,35,0.06)' }}
      >
        {applyStatus === 'idle' ? (
          <button
            onClick={handleApply}
            className="flex-1 rounded-xl py-3.5 transition-all active:scale-[0.98]"
            style={{ background: '#F5A623', border: 'none', cursor: 'pointer', fontSize: '0.95rem', fontWeight: 700, color: '#0F1623' }}
          >
            立即申請
          </button>
        ) : (
          <div
            className="flex-1 rounded-xl py-3.5 flex items-center justify-center gap-2"
            style={{ background: applyStatusConfig[applyStatus].bg, border: `1.5px solid ${applyStatusConfig[applyStatus].color}30` }}
          >
            {applyStatus === 'reviewing' && (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1.2, ease: 'linear' }}
              >
                <Clock size={16} style={{ color: applyStatusConfig[applyStatus].color }} />
              </motion.div>
            )}
            {applyStatus === 'scheduled' && <CheckCircle2 size={16} style={{ color: '#15803D' }} />}
            <span style={{ fontSize: '0.92rem', fontWeight: 700, color: applyStatusConfig[applyStatus].color }}>
              {applyStatusConfig[applyStatus].label}
            </span>
          </div>
        )}
      </div>

      {/* Verify prompt sheet — shown when unverified user tries to apply */}
      <AnimatePresence>
        {showVerifyPrompt && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 z-40"
              style={{ background: 'rgba(15,22,35,0.45)', backdropFilter: 'blur(2px)' }}
              onClick={() => setShowVerifyPrompt(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: 60 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 60 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              className="absolute left-0 right-0 bottom-0 z-50 rounded-t-2xl px-5 py-6 flex flex-col gap-4"
              style={{ background: '#FFFFFF', boxShadow: '0 -8px 40px rgba(15,22,35,0.15)' }}
            >
              {/* Icon + title */}
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center rounded-2xl shrink-0" style={{ width: 48, height: 48, background: '#FEF3DC' }}>
                  <Shield size={22} style={{ color: '#F5A623' }} />
                </div>
                <div>
                  <p style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0F1623', margin: 0 }}>需要完成身份認證</p>
                  <p style={{ fontSize: '0.78rem', color: '#9CA3AF', margin: '3px 0 0 0' }}>申請工作前必須驗證香港身份證</p>
                </div>
              </div>

              {/* Info card */}
              <div className="rounded-xl px-4 py-3 flex flex-col gap-2" style={{ background: '#FFFBEB', border: '1px solid rgba(245,166,35,0.25)' }}>
                <div className="flex items-center gap-2">
                  <AlertCircle size={13} style={{ color: '#D4891A' }} />
                  <p style={{ fontSize: '0.78rem', fontWeight: 600, color: '#D4891A', margin: 0 }}>為什麼需要認證？</p>
                </div>
                <p style={{ fontSize: '0.78rem', color: '#92580A', lineHeight: 1.65, margin: 0 }}>
                  為確保平台安全及保障僱主及求職者雙方利益，NewBee 要求所有用戶在申請工作前完成香港身份證實名認證。
                </p>
              </div>

              {/* Steps preview */}
              <div className="flex items-center gap-2 justify-center">
                {['上傳HKID', '人臉識別', '核驗完成'].map((s, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className="flex flex-col items-center gap-1">
                      <div className="flex items-center justify-center rounded-full" style={{ width: 28, height: 28, background: '#EEF1F8' }}>
                        <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#6B7A99' }}>{i + 1}</span>
                      </div>
                      <span style={{ fontSize: '0.68rem', fontWeight: 600, color: '#9CA3AF', whiteSpace: 'nowrap' }}>{s}</span>
                    </div>
                    {i < 2 && <div style={{ width: 24, height: 1, background: '#D1D5DB', marginBottom: 14 }} />}
                  </div>
                ))}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowVerifyPrompt(false)}
                  className="flex-1 rounded-xl py-3"
                  style={{ background: '#EEF1F8', border: 'none', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 600, color: '#6B7A99' }}
                >
                  稍後再說
                </button>
                <button
                  onClick={() => { setShowVerifyPrompt(false); onStartVerify(); }}
                  className="rounded-xl py-3 transition-all active:scale-[0.98]"
                  style={{ flex: 2, background: '#F5A623', border: 'none', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 700, color: '#0F1623' }}
                >
                  立即認證身份
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Apply confirm sheet */}
      <AnimatePresence>
        {showApplyConfirm && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 z-40"
              style={{ background: 'rgba(15,22,35,0.45)', backdropFilter: 'blur(2px)' }}
              onClick={() => setShowApplyConfirm(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: 60 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 60 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              className="absolute left-0 right-0 bottom-0 z-50 rounded-t-2xl px-5 py-6 flex flex-col gap-4"
              style={{ background: '#FFFFFF', boxShadow: '0 -8px 40px rgba(15,22,35,0.15)' }}
            >
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center rounded-2xl" style={{ width: 48, height: 48, background: job.logoColor + '16' }}>
                  <span style={{ fontSize: '1.1rem', fontWeight: 800, color: job.logoColor }}>{job.logo}</span>
                </div>
                <div>
                  <p style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0F1623', margin: 0 }}>確認申請此職位？</p>
                  <p style={{ fontSize: '0.78rem', color: '#6B7A99', margin: '3px 0 0 0' }}>{job.title[lang]} · {job.company}</p>
                </div>
              </div>
              <div className="rounded-xl px-4 py-3" style={{ background: '#F7F8FC', border: '1px solid rgba(15,22,35,0.07)' }}>
                <div className="flex items-center justify-between mb-1.5">
                  <span style={{ fontSize: '0.78rem', color: '#9CA3AF' }}>薪酬</span>
                  <span style={{ fontSize: '0.88rem', fontWeight: 700, color: '#0F1623' }}>{salaryStr}</span>
                </div>
                <div className="flex items-center justify-between mb-1.5">
                  <span style={{ fontSize: '0.78rem', color: '#9CA3AF' }}>地點</span>
                  <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#0F1623' }}>{job.district[lang]} · {job.store[lang]}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span style={{ fontSize: '0.78rem', color: '#9CA3AF' }}>日期</span>
                  <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#0F1623' }}>{job.date[lang]}</span>
                </div>
              </div>
              <p style={{ fontSize: '0.78rem', color: '#9CA3AF', textAlign: 'center', margin: 0 }}>申請後平台將審核您的資料，結果將透過通知告知</p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowApplyConfirm(false)}
                  className="flex-1 rounded-xl py-3"
                  style={{ background: '#EEF1F8', border: 'none', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 600, color: '#6B7A99' }}
                >
                  取消
                </button>
                <button
                  onClick={confirmApply}
                  className="rounded-xl py-3 transition-all active:scale-[0.98]"
                  style={{ flex: 2, background: '#F5A623', border: 'none', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 700, color: '#0F1623' }}
                >
                  確認申請
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
