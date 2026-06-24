import { useState } from 'react';
import { ChevronLeft, ChevronRight, Share2, MapPin, FileText, Award, Building2, CheckCircle2, Clock, Check, Shield, AlertCircle, GraduationCap, Briefcase, X as XIcon, Users } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Language, translations } from './i18n';
import { Job, formatTime } from './jobData';
import { ProfileEditData } from './ProfilePage';

type ApplyStatus = 'idle' | 'standby' | 'applied' | 'reviewing' | 'scheduled' | 'rejected';

const CARD_SHADOW = '0 1px 3px rgba(15,22,35,0.06), 0 4px 16px rgba(15,22,35,0.04)';
const CARD_BORDER = '1px solid rgba(15,22,35,0.06)';

interface JobDetailPageProps {
  job: Job;
  lang: Language;
  isVerified: boolean;
  onBack: () => void;
  onStartVerify: () => void;
  readOnly?: boolean;
  editData?: ProfileEditData;
  onNeedEditProfile?: () => void;
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
  idle:      { label: '', bg: '', color: '', desc: '' },
  standby:   { label: '候選中', bg: '#EEF1FF', color: '#3B5BDB', desc: '已加入候補名單，如有空缺將優先通知您' },
  applied:   { label: '已申請', bg: '#FEF3DC', color: '#D4891A', desc: '申請已提交，等待審核' },
  reviewing: { label: '審核中', bg: '#EEF1F8', color: '#3B5BDB', desc: '人事部正在審核您的申請' },
  scheduled: { label: '已安排', bg: '#DCFCE7', color: '#15803D', desc: '恭喜！您的申請已通過，詳情請留意通知' },
  rejected:  { label: '未獲取錄', bg: '#FEE2E2', color: '#D93025', desc: '很遺憾此次未獲取錄，可繼續申請其他職位' },
};

export function JobDetailPage({ job, lang, isVerified, onBack, onStartVerify, readOnly = false, editData, onNeedEditProfile }: JobDetailPageProps) {
  const t = translations[lang];
  const [applyStatus, setApplyStatus] = useState<ApplyStatus>('idle');
  const [showCopied, setShowCopied] = useState(false);
  const [showApplyConfirm, setShowApplyConfirm] = useState(false);
  const [showVerifyPrompt, setShowVerifyPrompt] = useState(false);
  const [showResumePreview, setShowResumePreview] = useState(false);
  const [showStandbyRules, setShowStandbyRules] = useState(false);

  const [selectedSiteId, setSelectedSiteId] = useState<number | null>(
    job.workSites.length === 1 ? job.workSites[0].id : null
  );
  const [showSitePicker, setShowSitePicker] = useState(false);

  const salaryStr = job.salaryMax && job.salaryMax !== job.salary
    ? `HK$${job.salary.toLocaleString()}–${job.salaryMax.toLocaleString()}${t[job.salaryPeriod === 'hourly' ? 'hourlyUnit' : 'monthlyUnit']}`
    : `HK$${job.salary.toLocaleString()}${t[job.salaryPeriod === 'hourly' ? 'hourlyUnit' : 'monthlyUnit']}`;

  const jobTypeLabel = job.jobType === 'full-time' ? t.fullTimeTag : job.jobType === 'part-time' ? t.partTimeTag : t.casualTag;

  const totalHeadcount = job.workSites.reduce((s, ws) => s + ws.headcountRegular + ws.headcountStandby, 0);
  const totalRemaining = job.workSites.reduce((s, ws) => s + ws.remainingRegular + ws.remainingStandby, 0);
  const selectedSite = selectedSiteId ? job.workSites.find((s) => s.id === selectedSiteId) ?? null : null;

  const SETTLEMENT_LABEL: Record<string, string> = { daily: '日結', weekly: '週結', monthly: '月結' };

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
    if (!isVerified) { setShowVerifyPrompt(true); return; }
    if (job.workSites.length > 1 && !selectedSiteId) { setShowSitePicker(true); return; }
    if (totalRemaining === 0) { setShowStandbyRules(true); return; }
    setShowResumePreview(true);
  }

  function handleStandbyConfirmed() {
    setShowStandbyRules(false);
    setShowResumePreview(true);
  }

  function handleResumeConfirmed() {
    setShowResumePreview(false);
    setShowApplyConfirm(true);
  }

  function confirmApply() {
    setShowApplyConfirm(false);
    if (totalRemaining === 0) {
      setApplyStatus('standby');
    } else {
      setApplyStatus('applied');
      setTimeout(() => setApplyStatus('reviewing'), 1500);
    }
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
            <span className="rounded-md px-2 py-0.5" style={{ fontSize: '0.7rem', fontWeight: 600, background: '#F0F4FF', color: '#3B5BDB', border: '1px solid rgba(59,91,219,0.15)' }}>
              {job.workCategory}
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

          {/* Salary + settlement + headcount strip */}
          <div className="flex flex-col gap-3 pt-3" style={{ borderTop: '1px solid rgba(15,22,35,0.05)' }}>
            {/* Salary row */}
            <div className="flex items-end justify-between">
              <div>
                <p style={{ fontSize: '0.68rem', fontWeight: 600, color: '#9CA3AF', margin: '0 0 2px 0', textTransform: 'uppercase', letterSpacing: '0.06em' }}>薪酬</p>
                <span style={{ fontSize: '1.3rem', fontWeight: 800, color: '#0F1623', letterSpacing: '-0.02em' }}>{salaryStr}</span>
              </div>
              <span className="rounded-md px-2 py-0.5 mb-1" style={{ fontSize: '0.7rem', fontWeight: 700, background: '#EEF1F8', color: '#6B7A99', border: '1px solid rgba(15,22,35,0.08)' }}>
                {SETTLEMENT_LABEL[job.salarySettlement]}
              </span>
            </div>
            {/* Headcount detail row */}
            <div className="rounded-xl px-3 py-2.5 flex gap-0" style={{ background: '#F7F8FC', border: '1px solid rgba(15,22,35,0.06)' }}>
              {[
                { label: '總招募', value: `${totalHeadcount}人`, valueColor: '#0F1623' },
                { label: '正式招募', value: `${job.workSites.reduce((s, ws) => s + ws.headcountRegular, 0)}人`, valueColor: '#0F1623' },
                { label: '正式剩餘', value: `${job.workSites.reduce((s, ws) => s + ws.remainingRegular, 0)}人`, valueColor: job.workSites.reduce((s, ws) => s + ws.remainingRegular, 0) === 0 ? '#D93025' : '#15803D' },
                { label: '候補招募', value: `${job.workSites.reduce((s, ws) => s + ws.headcountStandby, 0)}人`, valueColor: '#0F1623' },
                { label: '候補剩餘', value: `${job.workSites.reduce((s, ws) => s + ws.remainingStandby, 0)}人`, valueColor: '#D4891A' },
              ].map(({ label, value, valueColor }, i, arr) => (
                <div key={label} className="flex-1 flex flex-col items-center" style={{ borderRight: i < arr.length - 1 ? '1px solid rgba(15,22,35,0.07)' : 'none' }}>
                  <span style={{ fontSize: '0.88rem', fontWeight: 800, color: valueColor }}>{value}</span>
                  <span style={{ fontSize: '0.58rem', color: '#9CA3AF', marginTop: 1 }}>{label}</span>
                </div>
              ))}
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

        {/* Work sites */}
        <div className="flex flex-col gap-3">
          <h3 style={{ fontSize: '0.82rem', fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.08em', margin: 0 }}>工作網點</h3>
          {job.workSites.map((site) => {
            const isSelected = selectedSiteId === site.id;
            const isFull = site.remainingRegular === 0;
            const siteShift = site.shifts[0];
            return (
              <button
                key={site.id}
                onClick={() => setSelectedSiteId(isSelected ? null : site.id)}
                className="w-full text-left rounded-2xl overflow-hidden transition-all active:scale-[0.98]"
                style={{
                  background: '#FFFFFF',
                  boxShadow: isSelected ? '0 2px 12px rgba(59,91,219,0.15)' : '0 1px 3px rgba(15,22,35,0.06), 0 4px 16px rgba(15,22,35,0.04)',
                  border: isSelected ? '1.5px solid rgba(59,91,219,0.4)' : '1px solid rgba(15,22,35,0.06)',
                  cursor: 'pointer',
                }}
              >
                {/* Site header */}
                <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: '1px solid rgba(15,22,35,0.05)' }}>
                  <div className="flex items-center gap-2">
                    <Building2 size={14} style={{ color: isSelected ? '#3B5BDB' : '#9CA3AF' }} />
                    <span style={{ fontSize: '0.88rem', fontWeight: 700, color: '#0F1623' }}>{site.name[lang]}</span>
                    {job.workSites.length > 1 && isSelected && (
                      <span className="rounded-full px-2 py-0.5" style={{ background: '#EEF8FF', color: '#3B5BDB', fontSize: '0.62rem', fontWeight: 700 }}>已選</span>
                    )}
                  </div>
                  {isFull
                    ? <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#D93025' }}>已滿</span>
                    : <span style={{ fontSize: '0.72rem', color: '#9CA3AF' }}>{isSelected ? '▲' : '▼'}</span>}
                </div>

                {/* Site detail grid */}
                <div className="px-4 py-3 grid gap-y-2.5" style={{ gridTemplateColumns: '1fr 1fr' }}>
                  {/* Address */}
                  <div className="col-span-2 flex items-start gap-1.5">
                    <MapPin size={12} style={{ color: '#9CA3AF', flexShrink: 0, marginTop: 2 }} />
                    <span style={{ fontSize: '0.75rem', color: '#6B7A99', lineHeight: 1.4 }}>{site.address[lang]}　{site.mtr[lang]}</span>
                  </div>
                  {/* Shift */}
                  {siteShift && (
                    <div className="col-span-2 flex items-center gap-1.5">
                      <Clock size={12} style={{ color: '#9CA3AF', flexShrink: 0 }} />
                      <span style={{ fontSize: '0.78rem', fontWeight: 600, color: '#374151' }}>{siteShift.label[lang]}</span>
                    </div>
                  )}
                  {/* Salary */}
                  <div className="flex flex-col gap-0.5">
                    <span style={{ fontSize: '0.65rem', color: '#9CA3AF' }}>薪資</span>
                    <span style={{ fontSize: '0.88rem', fontWeight: 800, color: '#0F1623' }}>
                      HK${site.salary}{job.salaryPeriod === 'hourly' ? '/時' : '/月'}
                    </span>
                  </div>
                  {/* OT salary */}
                  {site.salaryOT ? (
                    <div className="flex flex-col gap-0.5">
                      <span style={{ fontSize: '0.65rem', color: '#9CA3AF' }}>加班薪資</span>
                      <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#374151' }}>HK${site.salaryOT}/時</span>
                    </div>
                  ) : <div />}
                  {/* Meal + shuttle — badge style, no emoji */}
                  <div className="flex items-center gap-2 col-span-2">
                    {[
                      { label: '有飯鐘', has: site.hasMeal },
                      { label: '有直達班車', has: site.hasShuttle },
                    ].filter(({ has }) => has).map(({ label }) => (
                      <div key={label} className="flex items-center gap-1.5 rounded-lg px-2.5 py-1"
                        style={{ background: '#DCFCE7', border: '1px solid rgba(21,128,61,0.2)' }}>
                        <div className="rounded-full shrink-0" style={{ width: 6, height: 6, background: '#15803D' }} />
                        <span style={{ fontSize: '0.7rem', fontWeight: 600, color: '#15803D' }}>
                          {label}
                        </span>
                      </div>
                    ))}
                  </div>
                  {/* Headcount — color-coded remaining vs total */}
                  <div className="col-span-2 rounded-xl px-3 py-2 flex gap-4" style={{ background: '#F7F8FC', border: '1px solid rgba(15,22,35,0.06)' }}>
                    {[
                      { label: '正式招募', count: site.headcountRegular, remaining: site.remainingRegular, remainColor: site.remainingRegular === 0 ? '#D93025' : '#15803D' },
                      { label: '候補招募', count: site.headcountStandby, remaining: site.remainingStandby, remainColor: '#D4891A' },
                    ].map(({ label, count, remaining, remainColor }) => (
                      <div key={label} className="flex-1">
                        <p style={{ fontSize: '0.62rem', color: '#9CA3AF', margin: '0 0 3px' }}>{label}</p>
                        <div className="flex items-baseline gap-1">
                          <span style={{ fontSize: '0.88rem', fontWeight: 800, color: remainColor }}>剩{remaining}</span>
                          <span style={{ fontSize: '0.72rem', color: '#CBD1E1' }}>/</span>
                          <span style={{ fontSize: '0.78rem', fontWeight: 600, color: '#9CA3AF' }}>共{count}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </button>
            );
          })}
        </div>


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
                <div className="flex items-center gap-2 flex-wrap">
                  <div className="flex items-center gap-1">
                    <Building2 size={12} style={{ color: '#9CA3AF' }} />
                    <span style={{ fontSize: '0.75rem', color: '#9CA3AF' }}>{job.companySize}</span>
                  </div>
                  <span style={{ color: '#D1D5DB', fontSize: '0.7rem' }}>·</span>
                  <span style={{ fontSize: '0.75rem', color: '#9CA3AF' }}>{job.companyIndustry}</span>
                </div>
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
        {readOnly && (
          <div className="flex-1 rounded-xl py-3 flex items-center justify-center gap-2" style={{ background: '#EEF1F8' }}>
            <FileText size={14} style={{ color: '#9CA3AF' }} />
            <span style={{ fontSize: '0.88rem', fontWeight: 600, color: '#9CA3AF' }}>僅供查閱，無法操作</span>
          </div>
        )}
        {!readOnly && (() => {
          const isFull = totalRemaining === 0;

          if (applyStatus === 'idle' && isFull) {
            return (
              <>
                <button
                  onClick={handleApply}
                  className="flex-1 rounded-xl py-3.5 transition-all active:scale-[0.98]"
                  style={{ background: '#F5A623', border: 'none', cursor: 'pointer', fontSize: '0.88rem', fontWeight: 700, color: '#0F1623' }}
                >
                  申請候補
                </button>
                <div
                  className="flex-1 rounded-xl py-3.5 flex items-center justify-center"
                  style={{ background: '#EEF1F8', border: 'none', cursor: 'not-allowed' }}
                >
                  <span style={{ fontSize: '0.88rem', fontWeight: 700, color: '#9CA3AF' }}>正式岗已滿</span>
                </div>
              </>
            );
          }

          if (applyStatus === 'idle') {
            const needSite = job.workSites.length > 1 && !selectedSiteId;
            return (
              <button
                onClick={handleApply}
                className="flex-1 rounded-xl py-3.5 transition-all active:scale-[0.98]"
                style={{ background: '#F5A623', border: 'none', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 700, color: '#0F1623' }}
              >
                {needSite ? '選擇網點並申請' : '立即申請'}
              </button>
            );
          }

          return (
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
          );
        })()}
      </div>

      {/* Resume preview sheet — shown before apply confirm when verified */}
      <AnimatePresence>
        {showResumePreview && editData && (() => {
          const initials = (editData.name || '?').charAt(0).toUpperCase();
          const displayLangs = [...editData.languages.filter((l) => l !== '其他'), ...(editData.languages.includes('其他') && editData.languageOther ? [editData.languageOther] : [])];
          const isIncomplete = !editData.name || editData.languages.length === 0 || !editData.bio || editData.workExperience.length === 0 || editData.education.length === 0;
          const missingFields = [
            !editData.name && '姓名',
            editData.languages.length === 0 && '語言能力',
            !editData.bio && '個人優勢介紹',
            editData.education.length === 0 && '教育背景',
            editData.workExperience.length === 0 && '工作經歷',
          ].filter(Boolean) as string[];

          return (
            <>
              <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="absolute inset-0 z-40"
                style={{ background: 'rgba(15,22,35,0.45)', backdropFilter: 'blur(2px)' }}
                onClick={() => setShowResumePreview(false)}
              />
              <motion.div
                initial={{ opacity: 0, y: 60 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 60 }}
                transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                className="absolute left-0 right-0 bottom-0 z-50 rounded-t-2xl px-5 py-6 flex flex-col gap-4"
                style={{ background: '#FFFFFF', boxShadow: '0 -8px 40px rgba(15,22,35,0.15)' }}
              >
                {/* Header */}
                <div className="flex items-center justify-between">
                  <p style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0F1623', margin: 0 }}>確認當前簡歷</p>
                  <button onClick={() => setShowResumePreview(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
                    <XIcon size={18} style={{ color: '#9CA3AF' }} />
                  </button>
                </div>

                {/* Resume card */}
                <div className="rounded-2xl p-4 flex flex-col gap-3" style={{ background: '#F7F8FC', border: '1px solid rgba(15,22,35,0.07)' }}>
                  {/* Avatar + name */}
                  <div className="flex items-center gap-3">
                    <div className="shrink-0 flex items-center justify-center rounded-2xl" style={{ width: 44, height: 44, background: '#FEF3DC', border: '2px solid rgba(245,166,35,0.3)' }}>
                      <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#D4891A' }}>{initials}</span>
                    </div>
                    <div className="flex-1">
                      <p style={{ fontSize: '0.92rem', fontWeight: 700, color: '#0F1623', margin: 0 }}>{editData.name || '（未填姓名）'}</p>
                      {(editData.gender || editData.birthday) && (
                        <p style={{ fontSize: '0.75rem', color: '#6B7A99', margin: '2px 0 0 0' }}>
                          {[editData.gender, editData.birthday].filter(Boolean).join(' · ')}
                        </p>
                      )}
                    </div>
                    <span
                      className="rounded-lg px-2.5 py-1 shrink-0"
                      style={{
                        background: isIncomplete ? '#FEF3DC' : '#DCFCE7',
                        color: isIncomplete ? '#D4891A' : '#15803D',
                        fontSize: '0.7rem', fontWeight: 700,
                      }}
                    >
                      {isIncomplete ? '資料未完善' : '資料完整'}
                    </span>
                  </div>

                  <div style={{ height: 1, background: 'rgba(15,22,35,0.06)' }} />

                  {/* Info rows */}
                  <div className="flex flex-col gap-2">
                    {/* Languages */}
                    {displayLangs.length > 0 && (
                      <div className="flex items-center gap-2">
                        <div className="flex items-center justify-center rounded-lg shrink-0" style={{ width: 22, height: 22, background: '#EEF1F8' }}>
                          <Award size={11} style={{ color: '#6B7A99' }} />
                        </div>
                        <span style={{ fontSize: '0.78rem', color: '#374151' }}>{displayLangs.join(' · ')}</span>
                      </div>
                    )}
                    {/* Work experience */}
                    <div className="flex items-center gap-2">
                      <div className="flex items-center justify-center rounded-lg shrink-0" style={{ width: 22, height: 22, background: '#EEF1F8' }}>
                        <Briefcase size={11} style={{ color: '#6B7A99' }} />
                      </div>
                      <span style={{ fontSize: '0.78rem', color: editData.workExperience.length === 0 ? '#C4C9D6' : '#374151' }}>
                        {editData.workExperience.length === 0 ? '尚未填寫工作經歷' : `${editData.workExperience.length} 項工作經歷`}
                      </span>
                    </div>
                    {/* Education */}
                    <div className="flex items-center gap-2">
                      <div className="flex items-center justify-center rounded-lg shrink-0" style={{ width: 22, height: 22, background: '#EEF1F8' }}>
                        <GraduationCap size={11} style={{ color: '#6B7A99' }} />
                      </div>
                      <span style={{ fontSize: '0.78rem', color: editData.education.length === 0 ? '#C4C9D6' : '#374151' }}>
                        {editData.education.length === 0 ? '尚未填寫教育背景' : editData.education[0]?.school || '已填寫教育背景'}
                      </span>
                    </div>
                    {/* Bio */}
                    <div className="flex items-start gap-2">
                      <div className="flex items-center justify-center rounded-lg shrink-0 mt-0.5" style={{ width: 22, height: 22, background: '#EEF1F8' }}>
                        <FileText size={11} style={{ color: '#6B7A99' }} />
                      </div>
                      <span style={{ fontSize: '0.78rem', color: !editData.bio ? '#C4C9D6' : '#374151', lineHeight: 1.5 }}>
                        {!editData.bio ? '尚未填寫個人優勢' : editData.bio.length > 50 ? editData.bio.slice(0, 50) + '…' : editData.bio}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Incomplete warning */}
                {isIncomplete && (
                  <div className="rounded-xl px-4 py-3 flex flex-col gap-2" style={{ background: '#FEE2E2', border: '1px solid rgba(217,48,37,0.2)' }}>
                    <div className="flex items-start gap-2">
                      <AlertCircle size={14} style={{ color: '#D93025', flexShrink: 0, marginTop: 1 }} />
                      <p style={{ fontSize: '0.78rem', color: '#991B1B', lineHeight: 1.65, margin: 0 }}>
                        必填資料未完善，請先補充以下資料才可投遞：
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-1.5 pl-5">
                      {missingFields.map((f) => (
                        <span key={f} className="rounded-md px-2 py-0.5" style={{ fontSize: '0.72rem', fontWeight: 700, background: '#FEE2E2', color: '#D93025', border: '1px solid rgba(217,48,37,0.25)' }}>{f}</span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Action buttons */}
                <div className="flex gap-3">
                  {isIncomplete ? (
                    <button
                      onClick={() => { setShowResumePreview(false); onNeedEditProfile?.(); }}
                      className="flex-1 rounded-xl py-3 transition-all active:scale-[0.98]"
                      style={{ background: '#F5A623', border: 'none', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 700, color: '#0F1623' }}
                    >
                      前往完善必填資料
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={() => { setShowResumePreview(false); onNeedEditProfile?.(); }}
                        className="rounded-xl py-3 px-4"
                        style={{ background: '#EEF1F8', border: 'none', cursor: 'pointer', fontSize: '0.82rem', fontWeight: 600, color: '#6B7A99', whiteSpace: 'nowrap' }}
                      >
                        修改資料
                      </button>
                      <button
                        onClick={handleResumeConfirmed}
                        className="flex-1 rounded-xl py-3 transition-all active:scale-[0.98]"
                        style={{ background: '#F5A623', border: 'none', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 700, color: '#0F1623' }}
                      >
                        確認以此簡歷投遞
                      </button>
                    </>
                  )}
                </div>
              </motion.div>
            </>
          );
        })()}
      </AnimatePresence>

      {/* Site picker sheet — when multiple sites and none selected */}
      <AnimatePresence>
        {showSitePicker && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 z-40" style={{ background: 'rgba(15,22,35,0.45)', backdropFilter: 'blur(2px)' }}
              onClick={() => setShowSitePicker(false)} />
            <motion.div
              initial={{ opacity: 0, y: 60 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 60 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              className="absolute left-0 right-0 bottom-0 z-50 rounded-t-2xl px-5 py-6 flex flex-col gap-4"
              style={{ background: '#FFFFFF', boxShadow: '0 -8px 40px rgba(15,22,35,0.15)' }}
            >
              <div className="flex items-center justify-between">
                <p style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0F1623', margin: 0 }}>選擇工作網點</p>
                <button onClick={() => setShowSitePicker(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
                  <XIcon size={18} style={{ color: '#9CA3AF' }} />
                </button>
              </div>
              <div className="flex flex-col gap-2.5">
                {job.workSites.map((site) => {
                  const isFull = site.remainingRegular === 0;
                  return (
                    <button key={site.id} onClick={() => { setSelectedSiteId(site.id); setShowSitePicker(false); setTimeout(() => setShowResumePreview(true), 100); }}
                      className="flex items-center gap-3 rounded-2xl p-4 text-left transition-all active:scale-[0.98]"
                      style={{ background: isFull ? '#F7F8FC' : '#FFFFFF', border: `1.5px solid ${isFull ? 'rgba(15,22,35,0.07)' : 'rgba(15,22,35,0.1)'}`, cursor: isFull ? 'not-allowed' : 'pointer' }}
                      disabled={isFull}
                    >
                      <div className="flex-1">
                        <p style={{ fontSize: '0.9rem', fontWeight: 700, color: isFull ? '#9CA3AF' : '#0F1623', margin: 0 }}>{site.name[lang]}</p>
                        <p style={{ fontSize: '0.75rem', color: '#9CA3AF', margin: '3px 0 0' }}>{site.shifts[0]?.label[lang]}</p>
                        <div className="flex items-center gap-3 mt-1.5">
                          <span style={{ fontSize: '0.72rem', fontWeight: 600, color: site.remainingRegular === 0 ? '#D93025' : '#15803D' }}>
                            正式 剩{site.remainingRegular}/{site.headcountRegular}
                          </span>
                          <span style={{ fontSize: '0.72rem', color: '#9CA3AF' }}>候補 剩{site.remainingStandby}/{site.headcountStandby}</span>
                        </div>
                      </div>
                      {isFull
                        ? <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#D93025' }}>已滿</span>
                        : <ChevronRight size={16} style={{ color: '#CBD1E1' }} />}
                    </button>
                  );
                })}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Standby rules sheet — shown before confirming waitlist when job is full */}
      <AnimatePresence>
        {showStandbyRules && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 z-40"
              style={{ background: 'rgba(15,22,35,0.45)', backdropFilter: 'blur(2px)' }}
              onClick={() => setShowStandbyRules(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: 60 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 60 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              className="absolute left-0 right-0 bottom-0 z-50 rounded-t-2xl px-5 py-6 flex flex-col gap-4"
              style={{ background: '#FFFFFF', boxShadow: '0 -8px 40px rgba(15,22,35,0.15)' }}
            >
              {/* Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center rounded-2xl shrink-0" style={{ width: 44, height: 44, background: '#FEF3DC' }}>
                    <Clock size={20} style={{ color: '#F5A623' }} />
                  </div>
                  <div>
                    <p style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0F1623', margin: 0 }}>候補申請說明</p>
                    <p style={{ fontSize: '0.75rem', color: '#9CA3AF', margin: '2px 0 0 0' }}>此職位名額已滿，可申請候補</p>
                  </div>
                </div>
                <button onClick={() => setShowStandbyRules(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
                  <XIcon size={18} style={{ color: '#9CA3AF' }} />
                </button>
              </div>

              {/* Rules card */}
              <div className="rounded-xl flex flex-col gap-3 p-4" style={{ background: '#F7F8FC', border: '1px solid rgba(15,22,35,0.07)' }}>
                {[
                  { icon: '📋', title: '候補名單排隊', desc: '按申請先後順序進入候補名單，名額空缺時優先聯繫排前的候補者。' },
                  { icon: '🔔', title: '有空缺即通知', desc: '一旦有原申請者退出或新增名額，NewBee 將第一時間以通知聯繫您。' },
                  { icon: '⏳', title: '候補期限', desc: '候補資格保留至活動結束前 24 小時，逾時自動失效。' },
                  { icon: '✏️', title: '可隨時撤回', desc: '未獲確認前，您可在「我的申請」中隨時取消候補。' },
                ].map(({ icon, title, desc }) => (
                  <div key={title} className="flex items-start gap-3">
                    <span style={{ fontSize: '1.1rem', flexShrink: 0, marginTop: 1 }}>{icon}</span>
                    <div>
                      <p style={{ fontSize: '0.82rem', fontWeight: 700, color: '#0F1623', margin: 0 }}>{title}</p>
                      <p style={{ fontSize: '0.75rem', color: '#6B7A99', margin: '3px 0 0 0', lineHeight: 1.55 }}>{desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowStandbyRules(false)}
                  className="flex-1 rounded-xl py-3"
                  style={{ background: '#EEF1F8', border: 'none', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 600, color: '#6B7A99' }}
                >
                  取消
                </button>
                <button
                  onClick={handleStandbyConfirmed}
                  className="rounded-xl py-3 transition-all active:scale-[0.98]"
                  style={{ flex: 2, background: '#F5A623', border: 'none', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 700, color: '#0F1623' }}
                >
                  了解，繼續申請候補
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

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
                  <p style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0F1623', margin: 0 }}>先確認一下身份</p>
                  <p style={{ fontSize: '0.78rem', color: '#9CA3AF', margin: '3px 0 0 0' }}>申請工作前完成簡單確認，只需約 2 分鐘</p>
                </div>
              </div>

              {/* Info card */}
              <div className="rounded-xl px-4 py-3 flex flex-col gap-2" style={{ background: '#FFFBEB', border: '1px solid rgba(245,166,35,0.25)' }}>
                <div className="flex items-center gap-2">
                  <AlertCircle size={13} style={{ color: '#D4891A' }} />
                  <p style={{ fontSize: '0.78rem', fontWeight: 600, color: '#D4891A', margin: 0 }}>點解要確認？</p>
                </div>
                <p style={{ fontSize: '0.78rem', color: '#92580A', lineHeight: 1.65, margin: 0 }}>
                  為保障僱主同求職者雙方，NewBee 需要確認每位申請者的身份。資料受香港私隱法例保護。
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
                  立即確認身份
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
                  <p style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0F1623', margin: 0 }}>
                    {totalRemaining === 0 ? '確認申請候補？' : '確認申請此職位？'}
                  </p>
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
                  <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#0F1623' }}>
                    {selectedSite ? selectedSite.name[lang] : job.district[lang]}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span style={{ fontSize: '0.78rem', color: '#9CA3AF' }}>日期</span>
                  <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#0F1623' }}>{job.date[lang]}</span>
                </div>
              </div>
              <p style={{ fontSize: '0.78rem', color: '#9CA3AF', textAlign: 'center', margin: 0 }}>
                {job.remainingSpots === 0
                  ? '候補申請提交後，如有空缺將優先聯繫您'
                  : '申請後平台將審核您的資料，結果將透過通知告知'}
              </p>
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
                  {job.remainingSpots === 0 ? '確認候補' : '確認申請'}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
