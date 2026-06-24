import { useState, useEffect } from 'react';
import {
  ChevronLeft, ChevronRight, Settings, Wallet, FileText, Shield, Phone, MessageSquare, Languages,
  LogOut, Plus, Minus, AlertCircle, Eye, X, Camera, GraduationCap,
  Briefcase, Award, Upload, Check, Trash2, Headphones, MessageCircle,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Language, LANG_LABELS, LANG_NAMES, translations } from './i18n';
import { JobHistoryView } from './JobHistoryView';

interface UserData {
  name: string;
  phone: string;
  gender: string;
  age: number;
}

type ProfileView = 'main' | 'settings' | 'wallet' | 'payout' | 'job-history' | 'edit-profile' | 'resume-preview';

interface ProfilePageProps {
  lang: Language;
  onLangChange: (l: Language) => void;
  user: UserData;
  onLogout: () => void;
  isVerified?: boolean;
  onStartVerify?: () => void;
  editData: ProfileEditData;
  onEditDataChange: (d: ProfileEditData) => void;
  forceEditProfile?: boolean;
  onForceConsumed?: () => void;
  onEditSaved?: () => void;
  forceWalletTxId?: number | null;
  onForceWalletConsumed?: () => void;
  onSubPageChange?: (active: boolean) => void;
}

export interface EducationEntry {
  id: string;
  startDate: string;
  endDate: string;
  degree: string;
  school: string;
  major: string;
}

export interface WorkEntry {
  id: string;
  company: string;
  position: string;
  industry: string;
  startDate: string;
  endDate: string;
  isCurrent: boolean;
  description: string;
}

export interface CertEntry {
  id: string;
  type: string;
  name: string;
  uploaded: boolean;
}

export interface ProfileEditData {
  name: string;
  gender: string;
  birthday: string;
  languages: string[];
  languageOther: string;
  bio: string;
  education: EducationEntry[];
  workExperience: WorkEntry[];
  certificates: CertEntry[];
}

const CARD_SHADOW = '0 1px 3px rgba(15,22,35,0.06), 0 4px 16px rgba(15,22,35,0.04)';
const CARD_BORDER = '1px solid rgba(15,22,35,0.06)';

// status: 'pending' = 申請中, 'credited' = 已入賬, 'paid' = 已出糧
const walletTxns = [
  {
    id: 1, type: 'in' as const, status: 'credited' as const, amount: 640,
    desc: { 'zh-HK': '工資入帳', 'zh-CN': '工资入账', en: 'Wage Deposit' },
    job: { 'zh-HK': '餐飲服務員', 'zh-CN': '餐饮服务员', en: 'F&B Server' },
    company: '美食集團', store: '銅鑼灣時代廣場', date: '2026-06-19',
    attendanceDate: '2026年6月19日（五）', shiftStart: '10:00', shiftEnd: '18:00',
    clockIn: '09:55', clockOut: '18:05', hours: 8, ratePerHour: 80,
    payrollNote: '正常出勤，按實際工時計算。',
  },
  {
    id: 2, type: 'out' as const, status: 'paid' as const, amount: 640,
    desc: { 'zh-HK': '出糧確認', 'zh-CN': '出粮确认', en: 'Payout Confirmed' },
    job: { 'zh-HK': 'NewBee 平台', 'zh-CN': 'NewBee 平台', en: 'NewBee Platform' },
    company: 'NewBee Hong Kong Ltd.', store: '', date: '2026-06-19',
  },
  {
    id: 3, type: 'in' as const, status: 'pending' as const, amount: 952,
    desc: { 'zh-HK': '工資待入帳', 'zh-CN': '工资待入账', en: 'Wage Pending' },
    job: { 'zh-HK': '倉務員', 'zh-CN': '仓务员', en: 'Warehouse Picker' },
    company: 'SF Express 順豐速運', store: '荃灣倉庫', date: '2026-06-17',
    attendanceDate: '2026年6月17日（三）', shiftStart: '08:00', shiftEnd: '16:00',
    clockIn: '08:02', clockOut: '16:05', hours: 8, ratePerHour: 119,
    payrollNote: '商戶確認工時和薪資中…',
  },
  {
    id: 4, type: 'in' as const, status: 'credited' as const, amount: 720,
    desc: { 'zh-HK': '工資入帳', 'zh-CN': '工资入账', en: 'Wage Deposit' },
    job: { 'zh-HK': '展覽場地助理', 'zh-CN': '展览场地助理', en: 'Exhibition Assistant' },
    company: 'HK Convention & Exhibition Centre', store: '灣仔會展中心', date: '2026-06-14',
    attendanceDate: '2026年6月12日（五）', shiftStart: '14:00', shiftEnd: '22:00',
    clockIn: '13:58', clockOut: '22:05', hours: 8, ratePerHour: 90,
    payrollNote: '正常出勤，按實際工時計算。',
  },
  {
    id: 5, type: 'out' as const, status: 'paid' as const, amount: 2280,
    desc: { 'zh-HK': '出糧確認', 'zh-CN': '出粮确认', en: 'Payout Confirmed' },
    job: { 'zh-HK': 'NewBee 平台', 'zh-CN': 'NewBee 平台', en: 'NewBee Platform' },
    company: 'NewBee Hong Kong Ltd.', store: '', date: '2026-06-12',
  },
  {
    id: 6, type: 'out' as const, status: 'pending' as const, amount: 720,
    desc: { 'zh-HK': '出糧申請中', 'zh-CN': '出粮申请中', en: 'Payout Requested' },
    job: { 'zh-HK': 'NewBee 平台', 'zh-CN': 'NewBee 平台', en: 'NewBee Platform' },
    company: 'NewBee Hong Kong Ltd.', store: '', date: '2026-06-10',
  },
];


const DEGREE_OPTIONS = ['中學', '大專/高職', '大學本科', '碩士', '博士', '其他'];
const INDUSTRY_OPTIONS = ['飲食餐飲', '零售', '物流倉務', '保安', '展覽活動', '建築裝修', 'IT科技', '金融', '教育', '醫療', '其他'];
const LANG_OPTIONS = ['粵語', '普通話', '英語', '其他'];
const GENDER_OPTIONS = ['男', '女', '其他'];
const CERT_SUGGESTIONS = ['電工證', '駕駛執照', '急救證', '食物衛生證', '保安員牌照', '地盤安全卡', '升降機操作證'];

// ── Shared primitives ──────────────────────────────────

function SubPageHeader({ title, onBack }: { title: string; onBack: () => void }) {
  return (
    <div
      className="flex items-center gap-3 px-4 py-3 shrink-0"
      style={{ borderBottom: '1px solid rgba(15,22,35,0.06)', background: '#FFFFFF' }}
    >
      <button
        onClick={onBack}
        className="flex items-center justify-center rounded-xl transition-colors"
        style={{ width: 36, height: 36, background: '#EEF1F8', border: 'none', cursor: 'pointer' }}
      >
        <ChevronLeft size={18} style={{ color: '#0F1623' }} />
      </button>
      <h2 style={{ fontSize: '1rem', fontWeight: 700, color: '#0F1623', margin: 0 }}>{title}</h2>
    </div>
  );
}

function SectionLabel({ text }: { text: string }) {
  return (
    <p style={{ fontSize: '0.72rem', fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 10px 0' }}>
      {text}
    </p>
  );
}

function SettingsRow({ label, value, action, onAction, isDestructive }: {
  label: string; value?: string; action: string; onAction?: () => void; isDestructive?: boolean;
}) {
  return (
    <div className="flex items-center justify-between py-3.5 px-4" style={{ borderBottom: '1px solid rgba(15,22,35,0.05)' }}>
      <div>
        <p style={{ fontSize: '0.85rem', fontWeight: 600, color: '#0F1623', margin: 0 }}>{label}</p>
        {value && <p style={{ fontSize: '0.78rem', color: '#6B7A99', margin: '2px 0 0 0' }}>{value}</p>}
      </div>
      <button onClick={onAction} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.82rem', fontWeight: 600, color: isDestructive ? '#D93025' : '#F5A623', padding: '4px 0' }}>
        {action}
      </button>
    </div>
  );
}

function RequiredLabel({ text, optional }: { text: string; optional?: boolean }) {
  return (
    <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#6B7A99' }}>
      {text}{!optional && <span style={{ color: '#D93025', marginLeft: 2 }}>*</span>}
    </span>
  );
}

function StyledInput({ label, value, onChange, type = 'text', placeholder, required }: {
  label?: string; value: string; onChange: (v: string) => void; type?: string; placeholder?: string; required?: boolean;
}) {
  const [focused, setFocused] = useState(false);
  return (
    <div className="flex flex-col gap-1.5">
      {label && <RequiredLabel text={label} optional={!required} />}
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          padding: '12px 14px', borderRadius: '0.75rem',
          border: `1.5px solid ${focused ? '#F5A623' : 'rgba(15,22,35,0.1)'}`,
          fontSize: '0.9rem', color: '#0F1623',
          background: focused ? '#FFFFFF' : '#F7F8FC',
          outline: 'none', fontFamily: 'inherit',
          transition: 'border-color 0.15s, background 0.15s',
          width: '100%', boxSizing: 'border-box',
        }}
      />
    </div>
  );
}

function StyledTextarea({ label, value, onChange, placeholder, rows = 3, required }: {
  label?: string; value: string; onChange: (v: string) => void; placeholder?: string; rows?: number; required?: boolean;
}) {
  const [focused, setFocused] = useState(false);
  return (
    <div className="flex flex-col gap-1.5">
      {label && <RequiredLabel text={label} optional={!required} />}
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          padding: '12px 14px', borderRadius: '0.75rem',
          border: `1.5px solid ${focused ? '#F5A623' : 'rgba(15,22,35,0.1)'}`,
          fontSize: '0.9rem', color: '#0F1623',
          background: focused ? '#FFFFFF' : '#F7F8FC',
          outline: 'none', fontFamily: 'inherit', resize: 'none',
          transition: 'border-color 0.15s, background 0.15s',
          width: '100%', boxSizing: 'border-box', lineHeight: 1.6,
        }}
      />
    </div>
  );
}

function StyledSelect({ label, value, onChange, options, placeholder }: {
  label?: string; value: string; onChange: (v: string) => void; options: string[]; placeholder?: string;
}) {
  const [focused, setFocused] = useState(false);
  return (
    <div className="flex flex-col gap-1.5">
      {label && <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#6B7A99' }}>{label}</span>}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          padding: '12px 14px', borderRadius: '0.75rem',
          border: `1.5px solid ${focused ? '#F5A623' : 'rgba(15,22,35,0.1)'}`,
          fontSize: '0.9rem', color: value ? '#0F1623' : '#9CA3AF',
          background: focused ? '#FFFFFF' : '#F7F8FC',
          outline: 'none', fontFamily: 'inherit',
          width: '100%', appearance: 'none', cursor: 'pointer',
        }}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );
}

function PillToggle({ label, selected, onToggle }: { label: string; selected: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      style={{
        padding: '7px 14px', borderRadius: '2rem',
        border: `1.5px solid ${selected ? '#F5A623' : 'rgba(15,22,35,0.1)'}`,
        background: selected ? '#FEF3DC' : '#F7F8FC',
        color: selected ? '#D4891A' : '#6B7A99',
        fontSize: '0.85rem', fontWeight: selected ? 700 : 500,
        cursor: 'pointer', transition: 'all 0.15s',
      }}
    >
      {label}
    </button>
  );
}

function MultiSelectDropdown({ label, options, selected, onToggle, placeholder }: {
  label: string; options: string[]; selected: string[]; onToggle: (v: string) => void; placeholder: string;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="flex flex-col gap-1.5">
      <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#6B7A99' }}>{label}</span>
      <div className="relative">
        <button
          onClick={() => setOpen((p) => !p)}
          className="w-full flex items-center justify-between rounded-xl px-4 py-3"
          style={{ background: '#F7F8FC', border: `1.5px solid ${open ? '#F5A623' : 'rgba(15,22,35,0.1)'}`, cursor: 'pointer', textAlign: 'left' }}
        >
          <span style={{ fontSize: '0.87rem', color: selected.length > 0 ? '#0F1623' : '#9CA3AF' }}>
            {selected.length > 0 ? selected.join(' · ') : placeholder}
          </span>
          <ChevronRight size={16} style={{ color: '#9CA3AF', transform: open ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }} />
        </button>
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.15 }}
              className="absolute left-0 right-0 top-full mt-1.5 rounded-xl overflow-hidden z-20"
              style={{ background: '#FFFFFF', boxShadow: '0 8px 32px rgba(15,22,35,0.12)', border: '1px solid rgba(15,22,35,0.08)', maxHeight: 220, overflowY: 'auto' }}
            >
              {options.map((opt) => (
                <button
                  key={opt} onClick={() => onToggle(opt)}
                  className="w-full flex items-center justify-between px-4 py-2.5"
                  style={{ background: selected.includes(opt) ? '#EEF1F8' : 'transparent', border: 'none', cursor: 'pointer', fontSize: '0.85rem', color: '#0F1623', textAlign: 'left' }}
                >
                  <span>{opt}</span>
                  {selected.includes(opt) && <span style={{ color: '#F5A623', fontWeight: 700, fontSize: '0.75rem' }}>✓</span>}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// ── Edit profile header (with preview button) ──────────

function EditProfileHeader({ onBack, onPreview }: { onBack: () => void; onPreview: () => void }) {
  return (
    <div
      className="flex items-center justify-between px-4 py-3 shrink-0"
      style={{ borderBottom: '1px solid rgba(15,22,35,0.06)', background: '#FFFFFF' }}
    >
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          className="flex items-center justify-center rounded-xl"
          style={{ width: 36, height: 36, background: '#EEF1F8', border: 'none', cursor: 'pointer' }}
        >
          <ChevronLeft size={18} style={{ color: '#0F1623' }} />
        </button>
        <h2 style={{ fontSize: '1rem', fontWeight: 700, color: '#0F1623', margin: 0 }}>編輯個人資料</h2>
      </div>
      <button
        onClick={onPreview}
        className="flex items-center gap-1.5 rounded-xl px-3 py-2 transition-all active:scale-95"
        style={{ background: '#0F1623', border: 'none', cursor: 'pointer' }}
      >
        <Eye size={13} style={{ color: '#FFFFFF' }} />
        <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#FFFFFF' }}>預覽簡歷</span>
      </button>
    </div>
  );
}

// ── Form section card ──────────────────────────────────

function SectionCard({ icon, title, children }: { icon: React.ReactNode; title: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <div className="flex items-center justify-center rounded-lg" style={{ width: 28, height: 28, background: '#EEF1F8' }}>
          {icon}
        </div>
        <span style={{ fontSize: '0.88rem', fontWeight: 700, color: '#0F1623' }}>{title}</span>
      </div>
      <div className="rounded-2xl p-4 flex flex-col gap-4" style={{ background: '#FFFFFF', boxShadow: CARD_SHADOW, border: CARD_BORDER }}>
        {children}
      </div>
    </div>
  );
}

// ── Education entry ─────────────────────────────────────

function EducationEntryCard({ entry, onChange, onRemove }: {
  entry: EducationEntry;
  onChange: (updated: EducationEntry) => void;
  onRemove: () => void;
}) {
  const [expanded, setExpanded] = useState(!entry.school);
  const [justSaved, setJustSaved] = useState(false);
  const u = (k: keyof EducationEntry) => (v: string) => onChange({ ...entry, [k]: v });

  const summary = [entry.degree, entry.school, entry.major].filter(Boolean).join(' · ') || '點擊展開填寫';

  function handleSave() {
    setJustSaved(true);
    setTimeout(() => {
      setJustSaved(false);
      setExpanded(false);
    }, 600);
  }

  return (
    <div className="rounded-xl overflow-hidden" style={{ border: `1.5px solid ${expanded ? '#F5A623' : 'rgba(15,22,35,0.08)'}`, transition: 'border-color 0.2s' }}>
      <div
        role="button"
        tabIndex={0}
        onClick={() => setExpanded((p) => !p)}
        onKeyDown={(e) => e.key === 'Enter' && setExpanded((p) => !p)}
        className="w-full flex items-center justify-between px-4 py-3"
        style={{ background: expanded ? '#FFFBEB' : '#FFFFFF', cursor: 'pointer' }}
      >
        <div className="flex-1">
          <p style={{ fontSize: '0.85rem', fontWeight: 600, color: '#0F1623', margin: 0 }}>{summary}</p>
          {(entry.startDate || entry.endDate) && (
            <p style={{ fontSize: '0.75rem', color: '#9CA3AF', margin: '2px 0 0 0' }}>
              {entry.startDate}{entry.startDate && entry.endDate ? ' – ' : ''}{entry.endDate}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button onClick={(e) => { e.stopPropagation(); onRemove(); }} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
            <Trash2 size={14} style={{ color: '#D93025' }} />
          </button>
          <ChevronRight size={15} style={{ color: '#9CA3AF', transform: expanded ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }} />
        </div>
      </div>
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }}
            style={{ overflow: 'hidden' }}
          >
            <div className="flex flex-col gap-3 px-4 pb-4 pt-2">
              <div className="grid grid-cols-2 gap-3">
                <StyledInput label="開始年月" value={entry.startDate} onChange={u('startDate')} placeholder="2018-09" />
                <StyledInput label="結束年月" value={entry.endDate} onChange={u('endDate')} placeholder="2022-06" />
              </div>
              <StyledSelect label="學歷" value={entry.degree} onChange={u('degree')} options={DEGREE_OPTIONS} placeholder="選擇學歷" />
              <StyledInput label="學校名稱" value={entry.school} onChange={u('school')} placeholder="例：香港大學" />
              <StyledInput label="主修專業" value={entry.major} onChange={u('major')} placeholder="例：工商管理" />
              <button
                onClick={handleSave}
                className="w-full rounded-xl py-2.5 transition-all active:scale-[0.98]"
                style={{ background: justSaved ? '#DCFCE7' : '#F5A623', border: 'none', cursor: 'pointer', fontSize: '0.88rem', fontWeight: 700, color: justSaved ? '#15803D' : '#0F1623' }}
              >
                {justSaved ? '✓ 已儲存' : '儲存'}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Work entry ──────────────────────────────────────────

function WorkEntryCard({ entry, onChange, onRemove }: {
  entry: WorkEntry;
  onChange: (updated: WorkEntry) => void;
  onRemove: () => void;
}) {
  const [expanded, setExpanded] = useState(!entry.company);
  const [justSaved, setJustSaved] = useState(false);
  const u = (k: keyof WorkEntry) => (v: string | boolean) => onChange({ ...entry, [k]: v });

  const summary = [entry.position, entry.company].filter(Boolean).join(' @ ') || '點擊展開填寫';
  const dateRange = [entry.startDate, entry.isCurrent ? '至今' : entry.endDate].filter(Boolean).join(' – ');

  function handleSave() {
    setJustSaved(true);
    setTimeout(() => {
      setJustSaved(false);
      setExpanded(false);
    }, 600);
  }

  return (
    <div className="rounded-xl overflow-hidden" style={{ border: `1.5px solid ${expanded ? '#F5A623' : 'rgba(15,22,35,0.08)'}`, transition: 'border-color 0.2s' }}>
      <div
        role="button"
        tabIndex={0}
        onClick={() => setExpanded((p) => !p)}
        onKeyDown={(e) => e.key === 'Enter' && setExpanded((p) => !p)}
        className="w-full flex items-center justify-between px-4 py-3"
        style={{ background: expanded ? '#FFFBEB' : '#FFFFFF', cursor: 'pointer' }}
      >
        <div className="flex-1">
          <p style={{ fontSize: '0.85rem', fontWeight: 600, color: '#0F1623', margin: 0 }}>{summary}</p>
          {dateRange && <p style={{ fontSize: '0.75rem', color: '#9CA3AF', margin: '2px 0 0 0' }}>{dateRange}</p>}
        </div>
        <div className="flex items-center gap-2">
          <button onClick={(e) => { e.stopPropagation(); onRemove(); }} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
            <Trash2 size={14} style={{ color: '#D93025' }} />
          </button>
          <ChevronRight size={15} style={{ color: '#9CA3AF', transform: expanded ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }} />
        </div>
      </div>
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }}
            style={{ overflow: 'hidden' }}
          >
            <div className="flex flex-col gap-3 px-4 pb-4 pt-2">
              <StyledInput label="公司名稱" value={entry.company} onChange={u('company') as (v: string) => void} placeholder="例：大家樂集團" />
              <StyledInput label="職位" value={entry.position} onChange={u('position') as (v: string) => void} placeholder="例：餐飲服務員" />
              <div className="grid grid-cols-2 gap-3">
                <StyledInput label="開始年月" value={entry.startDate} onChange={u('startDate') as (v: string) => void} placeholder="2023-01" />
                {entry.isCurrent
                  ? <div className="flex flex-col gap-1.5">
                      <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#6B7A99' }}>結束年月</span>
                      <div className="flex items-center px-3 py-3 rounded-xl" style={{ background: '#EEF1F8', border: '1.5px solid rgba(15,22,35,0.1)' }}>
                        <span style={{ fontSize: '0.85rem', color: '#6B7A99' }}>至今</span>
                      </div>
                    </div>
                  : <StyledInput label="結束年月" value={entry.endDate} onChange={u('endDate') as (v: string) => void} placeholder="2025-06" />
                }
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <div
                  onClick={() => u('isCurrent')(!entry.isCurrent)}
                  className="flex items-center justify-center rounded-md transition-all"
                  style={{ width: 18, height: 18, background: entry.isCurrent ? '#F5A623' : 'transparent', border: `2px solid ${entry.isCurrent ? '#F5A623' : 'rgba(15,22,35,0.2)'}` }}
                >
                  {entry.isCurrent && <Check size={11} style={{ color: '#FFFFFF' }} />}
                </div>
                <span style={{ fontSize: '0.85rem', color: '#6B7A99' }}>目前在職</span>
              </label>
              <StyledTextarea label="工作描述" value={entry.description} onChange={u('description') as (v: string) => void} placeholder="簡述主要職責及成就…" rows={3} />
              <button
                onClick={handleSave}
                className="w-full rounded-xl py-2.5 transition-all active:scale-[0.98]"
                style={{ background: justSaved ? '#DCFCE7' : '#F5A623', border: 'none', cursor: 'pointer', fontSize: '0.88rem', fontWeight: 700, color: justSaved ? '#15803D' : '#0F1623' }}
              >
                {justSaved ? '✓ 已儲存' : '儲存'}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Certificate entry ───────────────────────────────────

function CertEntryCard({ entry, onChange, onRemove }: {
  entry: CertEntry;
  onChange: (updated: CertEntry) => void;
  onRemove: () => void;
}) {
  const [expanded, setExpanded] = useState(!entry.uploaded);
  const u = (k: keyof CertEntry) => (v: string | boolean) => onChange({ ...entry, [k]: v });

  function handleUpload() {
    // Simulate file pick → mark as uploaded and collapse
    onChange({ ...entry, uploaded: true });
    setExpanded(false);
  }

  const displayName = entry.type || entry.name || '未命名證書';

  return (
    <div className="rounded-xl overflow-hidden" style={{ border: `1.5px solid ${expanded ? '#F5A623' : 'rgba(15,22,35,0.08)'}`, transition: 'border-color 0.2s' }}>
      {/* Header row — always visible */}
      <div
        role="button"
        tabIndex={0}
        onClick={() => setExpanded((p) => !p)}
        onKeyDown={(e) => e.key === 'Enter' && setExpanded((p) => !p)}
        className="flex items-center gap-3 px-3 py-3"
        style={{ background: expanded ? '#FFFBEB' : '#FFFFFF', cursor: 'pointer' }}
      >
        <div className="flex items-center justify-center rounded-xl shrink-0" style={{ width: 36, height: 36, background: entry.uploaded ? '#DCFCE7' : '#EEF1F8' }}>
          {entry.uploaded
            ? <Check size={15} style={{ color: '#15803D' }} />
            : <Award size={15} style={{ color: '#9CA3AF' }} />
          }
        </div>
        <div className="flex-1 min-w-0">
          <p style={{ fontSize: '0.85rem', fontWeight: 600, color: '#0F1623', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {displayName}
          </p>
          <p style={{ fontSize: '0.72rem', color: entry.uploaded ? '#15803D' : '#9CA3AF', margin: '2px 0 0 0', fontWeight: 600 }}>
            {entry.uploaded ? '✓ 文件已上傳' : '尚未上傳文件'}
          </p>
        </div>
        {/* Delete button — clearly separated, full tap target */}
        <button
          onClick={(e) => { e.stopPropagation(); onRemove(); }}
          className="flex items-center justify-center rounded-lg shrink-0"
          style={{ width: 32, height: 32, background: '#FEE2E2', border: 'none', cursor: 'pointer' }}
        >
          <Trash2 size={13} style={{ color: '#D93025' }} />
        </button>
        <ChevronRight size={15} style={{ color: '#9CA3AF', flexShrink: 0, transform: expanded ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }} />
      </div>

      {/* Expanded form */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }}
            style={{ overflow: 'hidden' }}
          >
            <div className="flex flex-col gap-3 px-3 pb-4 pt-1">
              <input
                value={entry.type}
                onChange={(e) => u('type')(e.target.value)}
                placeholder="證書類型（如：電工證）"
                style={{ padding: '8px 12px', borderRadius: '0.6rem', border: '1.5px solid rgba(15,22,35,0.1)', fontSize: '0.85rem', color: '#0F1623', background: '#F7F8FC', outline: 'none', fontFamily: 'inherit', width: '100%', boxSizing: 'border-box' as const }}
              />
              <input
                value={entry.name}
                onChange={(e) => u('name')(e.target.value)}
                placeholder="備注（選填，如：香港電業工人牌）"
                style={{ padding: '8px 12px', borderRadius: '0.6rem', border: '1.5px solid rgba(15,22,35,0.1)', fontSize: '0.85rem', color: '#0F1623', background: '#F7F8FC', outline: 'none', fontFamily: 'inherit', width: '100%', boxSizing: 'border-box' as const }}
              />

              {/* Upload zone */}
              {entry.uploaded ? (
                <div className="flex items-center gap-3 rounded-xl px-3 py-3" style={{ background: '#F0FDF4', border: '1.5px solid #BBF7D0' }}>
                  <div className="flex items-center justify-center rounded-lg shrink-0" style={{ width: 32, height: 32, background: '#DCFCE7' }}>
                    <Check size={15} style={{ color: '#15803D' }} />
                  </div>
                  <div className="flex-1">
                    <p style={{ fontSize: '0.82rem', fontWeight: 700, color: '#15803D', margin: 0 }}>文件已上傳</p>
                    <p style={{ fontSize: '0.72rem', color: '#166534', margin: '2px 0 0 0' }}>cert_document.pdf</p>
                  </div>
                  <button
                    onClick={() => { onChange({ ...entry, uploaded: false }); setExpanded(true); }}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600, color: '#6B7A99', padding: '4px 6px' }}
                  >
                    重新上傳
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleUpload}
                  className="w-full flex flex-col items-center justify-center gap-2 rounded-xl py-5 transition-all active:scale-[0.98]"
                  style={{ border: '1.5px dashed #F5A623', background: '#FFFBEB', cursor: 'pointer' }}
                >
                  <div className="flex items-center justify-center rounded-full" style={{ width: 36, height: 36, background: '#FEF3DC' }}>
                    <Upload size={16} style={{ color: '#D4891A' }} />
                  </div>
                  <div className="text-center">
                    <p style={{ fontSize: '0.85rem', fontWeight: 700, color: '#D4891A', margin: 0 }}>點擊上傳證書圖片或PDF</p>
                    <p style={{ fontSize: '0.73rem', color: '#92580A', margin: '3px 0 0 0' }}>支援 JPG、PNG、PDF，最大 10MB</p>
                  </div>
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Edit Profile View ───────────────────────────────────

function EditProfileView({
  data, onChange, onBack, onPreview, onSaveComplete,
}: {
  data: ProfileEditData;
  onChange: (d: ProfileEditData) => void;
  onBack: () => void;
  onPreview: () => void;
  onSaveComplete?: () => void;
}) {
  const [saved, setSaved] = useState(false);
  const set = (k: keyof ProfileEditData) => (v: ProfileEditData[keyof ProfileEditData]) => onChange({ ...data, [k]: v });

  function toggleLang(l: string) {
    const prev = data.languages;
    set('languages')(prev.includes(l) ? prev.filter((x) => x !== l) : [...prev, l]);
  }

  function addEducation() {
    set('education')([...data.education, { id: Date.now().toString(), startDate: '', endDate: '', degree: '', school: '', major: '' }]);
  }
  function updateEducation(id: string, updated: EducationEntry) {
    set('education')(data.education.map((e) => e.id === id ? updated : e));
  }
  function removeEducation(id: string) {
    set('education')(data.education.filter((e) => e.id !== id));
  }

  function addWork() {
    set('workExperience')([...data.workExperience, { id: Date.now().toString(), company: '', position: '', industry: '', startDate: '', endDate: '', isCurrent: false, description: '' }]);
  }
  function updateWork(id: string, updated: WorkEntry) {
    set('workExperience')(data.workExperience.map((w) => w.id === id ? updated : w));
  }
  function removeWork(id: string) {
    set('workExperience')(data.workExperience.filter((w) => w.id !== id));
  }

  function addCert(type = '') {
    set('certificates')([...data.certificates, { id: Date.now().toString(), type, name: '', uploaded: false }]);
  }
  function updateCert(id: string, updated: CertEntry) {
    set('certificates')(data.certificates.map((c) => c.id === id ? updated : c));
  }
  function removeCert(id: string) {
    set('certificates')(data.certificates.filter((c) => c.id !== id));
  }

  function handleSave() {
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      onSaveComplete?.();
    }, 1200);
  }

  const initials = data.name.charAt(0).toUpperCase() || '?';

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <EditProfileHeader onBack={onBack} onPreview={onPreview} />

      <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-5" style={{ scrollbarWidth: 'none' }}>

        {/* Avatar */}
        <div className="flex flex-col items-center gap-2 py-2">
          <div className="relative">
            <div
              className="flex items-center justify-center rounded-full"
              style={{ width: 72, height: 72, background: '#FEF3DC', border: '2.5px solid #F5A62340' }}
            >
              <span style={{ fontSize: '1.8rem', fontWeight: 800, color: '#D4891A' }}>{initials}</span>
            </div>
            <button
              className="absolute bottom-0 right-0 flex items-center justify-center rounded-full"
              style={{ width: 24, height: 24, background: '#0F1623', border: '2px solid #FFFFFF', cursor: 'pointer' }}
            >
              <Camera size={11} style={{ color: '#FFFFFF' }} />
            </button>
          </div>
          <span style={{ fontSize: '0.78rem', color: '#9CA3AF' }}>點擊更換頭像</span>
        </div>

        {/* Personal info */}
        <SectionCard icon={<FileText size={14} style={{ color: '#6B7A99' }} />} title="個人資料">
          <StyledInput label="姓名" required value={data.name} onChange={set('name') as (v: string) => void} placeholder="請輸入姓名" />

          <div>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#6B7A99', display: 'block', marginBottom: 10 }}>性別（選填）</span>
            <div className="flex gap-2 flex-wrap">
              {GENDER_OPTIONS.map((g) => (
                <PillToggle key={g} label={g} selected={data.gender === g} onToggle={() => set('gender')(data.gender === g ? '' : g)} />
              ))}
              {data.gender && data.gender !== '' && !GENDER_OPTIONS.includes(data.gender) && (
                <PillToggle label={data.gender} selected onToggle={() => set('gender')('')} />
              )}
            </div>
          </div>

          <StyledInput label="生日（選填）" value={data.birthday} onChange={set('birthday') as (v: string) => void} type="date" placeholder="" />
        </SectionCard>

        {/* Languages */}
        <SectionCard icon={<Phone size={14} style={{ color: '#6B7A99' }} />} title="語言能力">
          <div>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#6B7A99', display: 'block', marginBottom: 10 }}>常用語言<span style={{ color: '#D93025', marginLeft: 2 }}>*</span></span>
            <div className="flex gap-2 flex-wrap">
              {LANG_OPTIONS.map((l) => (
                <PillToggle key={l} label={l} selected={data.languages.includes(l)} onToggle={() => toggleLang(l)} />
              ))}
            </div>
          </div>
          {data.languages.includes('其他') && (
            <StyledInput
              label="其他語言（請填寫）"
              value={data.languageOther}
              onChange={set('languageOther') as (v: string) => void}
              placeholder="例：日語、韓語"
            />
          )}
        </SectionCard>

        {/* Bio */}
        <SectionCard icon={<Award size={14} style={{ color: '#6B7A99' }} />} title={<>個人優勢介紹<span style={{ color: '#D93025', marginLeft: 2 }}>*</span></>}>
          <StyledTextarea
            value={data.bio}
            onChange={set('bio') as (v: string) => void}
            placeholder="介紹你的核心優勢、工作態度或特別技能，讓僱主快速了解你…"
            rows={4}
          />
        </SectionCard>

        {/* Education */}
        <SectionCard icon={<GraduationCap size={14} style={{ color: '#6B7A99' }} />} title={<>教育背景<span style={{ color: '#D93025', marginLeft: 2 }}>*</span></>}>
          {data.education.length === 0 && (
            <p style={{ fontSize: '0.82rem', color: '#9CA3AF', textAlign: 'center', margin: '4px 0' }}>尚未添加教育經歷</p>
          )}
          {data.education.map((e) => (
            <EducationEntryCard key={e.id} entry={e} onChange={(u) => updateEducation(e.id, u)} onRemove={() => removeEducation(e.id)} />
          ))}
          <button
            onClick={addEducation}
            className="flex items-center justify-center gap-2 w-full rounded-xl py-2.5 transition-all"
            style={{ border: '1.5px dashed rgba(15,22,35,0.15)', background: 'transparent', cursor: 'pointer' }}
          >
            <Plus size={14} style={{ color: '#6B7A99' }} />
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#6B7A99' }}>新增教育背景</span>
          </button>
        </SectionCard>

        {/* Work experience */}
        <SectionCard icon={<Briefcase size={14} style={{ color: '#6B7A99' }} />} title={<>工作經歷<span style={{ color: '#D93025', marginLeft: 2 }}>*</span></>}>
          {data.workExperience.length === 0 && (
            <p style={{ fontSize: '0.82rem', color: '#9CA3AF', textAlign: 'center', margin: '4px 0' }}>尚未添加工作經歷</p>
          )}
          {data.workExperience.map((w) => (
            <WorkEntryCard key={w.id} entry={w} onChange={(u) => updateWork(w.id, u)} onRemove={() => removeWork(w.id)} />
          ))}
          <button
            onClick={addWork}
            className="flex items-center justify-center gap-2 w-full rounded-xl py-2.5 transition-all"
            style={{ border: '1.5px dashed rgba(15,22,35,0.15)', background: 'transparent', cursor: 'pointer' }}
          >
            <Plus size={14} style={{ color: '#6B7A99' }} />
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#6B7A99' }}>新增工作經歷</span>
          </button>
        </SectionCard>

        {/* Certificates */}
        <SectionCard icon={<Award size={14} style={{ color: '#F5A623' }} />} title="技能證書">
          {/* Suggestions */}
          <div>
            <span style={{ fontSize: '0.78rem', fontWeight: 600, color: '#9CA3AF', display: 'block', marginBottom: 8 }}>常見證書快速添加</span>
            <div className="flex flex-wrap gap-2">
              {CERT_SUGGESTIONS.filter((s) => !data.certificates.find((c) => c.type === s)).map((s) => (
                <button
                  key={s} onClick={() => addCert(s)}
                  className="flex items-center gap-1 rounded-lg px-2.5 py-1.5 transition-all"
                  style={{ background: '#FEF3DC', border: '1px solid #F5A62340', cursor: 'pointer' }}
                >
                  <Plus size={11} style={{ color: '#D4891A' }} />
                  <span style={{ fontSize: '0.78rem', fontWeight: 600, color: '#D4891A' }}>{s}</span>
                </button>
              ))}
            </div>
          </div>

          {data.certificates.length > 0 && (
            <div className="flex flex-col gap-2">
              {data.certificates.map((c) => (
                <CertEntryCard key={c.id} entry={c} onChange={(u) => updateCert(c.id, u)} onRemove={() => removeCert(c.id)} />
              ))}
            </div>
          )}

          <button
            onClick={() => addCert()}
            className="flex items-center justify-center gap-2 w-full rounded-xl py-2.5"
            style={{ border: '1.5px dashed rgba(15,22,35,0.15)', background: 'transparent', cursor: 'pointer' }}
          >
            <Plus size={14} style={{ color: '#6B7A99' }} />
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#6B7A99' }}>新增其他證書</span>
          </button>
        </SectionCard>

        <div className="h-2" />
      </div>

      {/* Save bar */}
      <div className="shrink-0 px-4 py-3" style={{ background: '#FFFFFF', borderTop: '1px solid rgba(15,22,35,0.06)' }}>
        <button
          onClick={handleSave}
          className="w-full rounded-xl py-3 transition-all active:scale-[0.98]"
          style={{ background: saved ? '#15803D' : '#F5A623', color: saved ? '#FFFFFF' : '#0F1623', border: 'none', cursor: 'pointer', fontSize: '0.95rem', fontWeight: 700 }}
        >
          {saved ? '✓ 已儲存' : '儲存資料'}
        </button>
      </div>
    </div>
  );
}

// ── Resume Preview View ─────────────────────────────────

function ResumeSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#0F1623' }}>{title}</span>
        <div style={{ flex: 1, height: 1, background: 'rgba(15,22,35,0.08)' }} />
      </div>
      {children}
    </div>
  );
}

function ResumePreviewView({ data, user, onBack }: { data: ProfileEditData; user: UserData; onBack: () => void }) {
  const initials = data.name.charAt(0).toUpperCase() || '?';
  const displayLangs = [...data.languages.filter((l) => l !== '其他'), ...(data.languages.includes('其他') && data.languageOther ? [data.languageOther] : [])];

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Single header */}
      <div className="flex items-center justify-between px-4 py-3 shrink-0" style={{ borderBottom: '1px solid rgba(15,22,35,0.06)', background: '#FFFFFF' }}>
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="flex items-center justify-center rounded-xl" style={{ width: 36, height: 36, background: '#EEF1F8', border: 'none', cursor: 'pointer' }}>
            <ChevronLeft size={18} style={{ color: '#0F1623' }} />
          </button>
          <h2 style={{ fontSize: '1rem', fontWeight: 700, color: '#0F1623', margin: 0 }}>簡歷預覽</h2>
        </div>
        <div className="rounded-lg px-2.5 py-1" style={{ background: '#EEF1F8' }}>
          <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#6B7A99' }}>僅供預覽</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4" style={{ scrollbarWidth: 'none', background: '#F7F8FC' }}>
        {/* Resume card */}
        <div className="rounded-2xl overflow-hidden" style={{ background: '#FFFFFF', boxShadow: '0 4px 24px rgba(15,22,35,0.08)', border: CARD_BORDER }}>
          {/* Minimal header — light style */}
          <div className="px-5 pt-5 pb-4" style={{ borderBottom: '1px solid rgba(15,22,35,0.06)' }}>
            <div className="flex items-center gap-4">
              <div className="flex items-center justify-center rounded-2xl shrink-0" style={{ width: 56, height: 56, background: '#FEF3DC', border: '2px solid rgba(245,166,35,0.3)' }}>
                <span style={{ fontSize: '1.4rem', fontWeight: 800, color: '#D4891A' }}>{initials}</span>
              </div>
              <div>
                <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0F1623', margin: 0 }}>{data.name || '（未填寫姓名）'}</h2>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  {data.gender && <span style={{ fontSize: '0.78rem', color: '#6B7A99' }}>{data.gender}</span>}
                  {data.birthday && <><span style={{ color: '#D1D5DB', fontSize: '0.7rem' }}>·</span><span style={{ fontSize: '0.78rem', color: '#6B7A99' }}>{data.birthday}</span></>}
                  <span style={{ color: '#D1D5DB', fontSize: '0.7rem' }}>·</span>
                  <span style={{ fontSize: '0.78rem', color: '#6B7A99' }}>{user.phone}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="px-5 py-5 flex flex-col gap-5">
            {/* Languages */}
            {displayLangs.length > 0 && (
              <ResumeSection title="語言能力">
                <div className="flex flex-wrap gap-2">
                  {displayLangs.map((l) => (
                    <span key={l} className="rounded-lg px-2.5 py-1" style={{ background: '#EEF1F8', fontSize: '0.82rem', fontWeight: 600, color: '#0F1623' }}>{l}</span>
                  ))}
                </div>
              </ResumeSection>
            )}

            {/* Bio */}
            {data.bio && (
              <ResumeSection title="個人優勢">
                <p style={{ fontSize: '0.85rem', color: '#374151', lineHeight: 1.7, margin: 0 }}>{data.bio}</p>
              </ResumeSection>
            )}

            {/* Education */}
            {data.education.length > 0 && (
              <ResumeSection title="教育背景">
                <div className="flex flex-col gap-3">
                  {data.education.map((e) => (
                    <div key={e.id} className="flex items-start gap-3">
                      <div className="flex items-center justify-center rounded-lg shrink-0 mt-0.5" style={{ width: 28, height: 28, background: '#EEF1F8' }}>
                        <GraduationCap size={13} style={{ color: '#6B7A99' }} />
                      </div>
                      <div>
                        <p style={{ fontSize: '0.88rem', fontWeight: 700, color: '#0F1623', margin: 0 }}>
                          {e.school || '（未填學校）'}
                          {e.degree && <span style={{ fontWeight: 500, color: '#6B7A99' }}> · {e.degree}</span>}
                        </p>
                        {e.major && <p style={{ fontSize: '0.8rem', color: '#6B7A99', margin: '2px 0 0 0' }}>{e.major}</p>}
                        {(e.startDate || e.endDate) && (
                          <p style={{ fontSize: '0.75rem', color: '#9CA3AF', margin: '2px 0 0 0' }}>
                            {e.startDate}{e.startDate && e.endDate ? ' – ' : ''}{e.endDate}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </ResumeSection>
            )}

            {/* Work experience */}
            {data.workExperience.length > 0 && (
              <ResumeSection title="工作經歷">
                <div className="flex flex-col gap-4">
                  {data.workExperience.map((w) => (
                    <div key={w.id} className="flex items-start gap-3">
                      <div className="flex items-center justify-center rounded-lg shrink-0 mt-0.5" style={{ width: 28, height: 28, background: '#EEF1F8' }}>
                        <Briefcase size={13} style={{ color: '#6B7A99' }} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p style={{ fontSize: '0.88rem', fontWeight: 700, color: '#0F1623', margin: 0 }}>
                              {w.position || '（未填職位）'}
                            </p>
                            <p style={{ fontSize: '0.8rem', color: '#6B7A99', margin: '2px 0 0 0' }}>
                              {w.company}{w.industry ? ` · ${w.industry}` : ''}
                            </p>
                          </div>
                          <span style={{ fontSize: '0.73rem', color: '#9CA3AF', whiteSpace: 'nowrap', marginTop: 2 }}>
                            {w.startDate}{w.startDate ? ' – ' : ''}{w.isCurrent ? '至今' : w.endDate}
                          </span>
                        </div>
                        {w.description && (
                          <p style={{ fontSize: '0.82rem', color: '#374151', lineHeight: 1.6, margin: '6px 0 0 0' }}>{w.description}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </ResumeSection>
            )}

            {/* Certificates */}
            {data.certificates.length > 0 && (
              <ResumeSection title="技能證書">
                <div className="flex flex-col gap-2">
                  {data.certificates.map((c) => (
                    <div key={c.id} className="flex items-center gap-3 rounded-xl px-3 py-2.5" style={{ background: '#F7F8FC', border: '1px solid rgba(15,22,35,0.06)' }}>
                      <div className="flex items-center justify-center rounded-lg" style={{ width: 28, height: 28, background: c.uploaded ? '#DCFCE7' : '#EEF1F8' }}>
                        <Award size={13} style={{ color: c.uploaded ? '#15803D' : '#9CA3AF' }} />
                      </div>
                      <div className="flex-1">
                        <p style={{ fontSize: '0.85rem', fontWeight: 600, color: '#0F1623', margin: 0 }}>{c.type || '未命名證書'}</p>
                        {c.name && <p style={{ fontSize: '0.75rem', color: '#9CA3AF', margin: '1px 0 0 0' }}>{c.name}</p>}
                      </div>
                      {c.uploaded && (
                        <span className="rounded-md px-2 py-0.5" style={{ background: '#DCFCE7', fontSize: '0.7rem', fontWeight: 700, color: '#15803D' }}>已上傳</span>
                      )}
                    </div>
                  ))}
                </div>
              </ResumeSection>
            )}

            {/* Empty state hint */}
            {!data.bio && data.education.length === 0 && data.workExperience.length === 0 && data.certificates.length === 0 && (
              <div className="py-8 flex flex-col items-center gap-2">
                <p style={{ fontSize: '0.88rem', color: '#9CA3AF', textAlign: 'center' }}>資料尚未填寫完整</p>
                <p style={{ fontSize: '0.78rem', color: '#C4C9D6', textAlign: 'center' }}>返回填寫更多資料，讓僱主更了解你</p>
              </div>
            )}
          </div>
        </div>

        <p style={{ fontSize: '0.72rem', color: '#C4C9D6', textAlign: 'center', marginTop: 16 }}>此簡歷將供招聘方查閱，請確保資料真實準確</p>
        <div className="h-4" />
      </div>
    </div>
  );
}

// ── Sub-views ──────────────────────────────────────────

// ── Email verification section ──────────────────────────
type EmailStep = 'idle' | 'sending' | 'otp' | 'verified';

function EmailVerifySection() {
  const [email, setEmail] = useState('');
  const [step, setStep] = useState<EmailStep>('idle');
  const [otp, setOtp] = useState('');
  const [otpError, setOtpError] = useState(false);
  const [countdown, setCountdown] = useState(0);

  function sendOtp() {
    if (!email.includes('@')) return;
    setStep('sending');
    setTimeout(() => { setStep('otp'); setCountdown(60); }, 800);
  }

  function verifyOtp() {
    if (otp === '1234' || otp.length === 4) { setStep('verified'); setOtpError(false); }
    else setOtpError(true);
  }

  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  if (step === 'verified') {
    return (
      <div className="px-4 py-3" style={{ borderBottom: '1px solid rgba(15,22,35,0.05)' }}>
        <p style={{ fontSize: '0.85rem', fontWeight: 600, color: '#0F1623', marginBottom: 8 }}>電子郵件</p>
        <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl" style={{ background: '#F0FDF4', border: '1.5px solid #BBF7D0' }}>
          <Check size={14} style={{ color: '#15803D', flexShrink: 0 }} />
          <span style={{ fontSize: '0.85rem', color: '#15803D', flex: 1 }}>{email}</span>
          <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#15803D' }}>已驗證</span>
        </div>
      </div>
    );
  }

  if (step === 'otp' || step === 'sending') {
    return (
      <div className="px-4 py-3 flex flex-col gap-2" style={{ borderBottom: '1px solid rgba(15,22,35,0.05)' }}>
        <p style={{ fontSize: '0.85rem', fontWeight: 600, color: '#0F1623' }}>電子郵件</p>
        <p style={{ fontSize: '0.78rem', color: '#6B7A99', margin: 0 }}>驗證碼已發送至 <span style={{ color: '#0F1623', fontWeight: 600 }}>{email}</span></p>
        <div className="flex gap-2">
          <input
            value={otp} onChange={(e) => { setOtp(e.target.value.slice(0, 6)); setOtpError(false); }}
            placeholder="輸入驗證碼"
            style={{ flex: 1, padding: '8px 12px', borderRadius: '0.6rem', border: `1.5px solid ${otpError ? '#D93025' : 'rgba(15,22,35,0.1)'}`, fontSize: '0.85rem', background: '#F7F8FC', outline: 'none', fontFamily: 'inherit', color: '#0F1623' }}
          />
          <button onClick={verifyOtp} style={{ background: '#F5A623', border: 'none', cursor: 'pointer', color: '#0F1623', fontSize: '0.82rem', fontWeight: 700, borderRadius: '0.6rem', padding: '8px 14px', whiteSpace: 'nowrap' }}>確認</button>
        </div>
        {otpError && <p style={{ fontSize: '0.75rem', color: '#D93025', margin: 0 }}>驗證碼不正確，請重試</p>}
        <button onClick={() => { setStep('idle'); setOtp(''); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9CA3AF', fontSize: '0.75rem', textAlign: 'left', padding: 0 }}>重新輸入電郵地址</button>
      </div>
    );
  }

  return (
    <div className="px-4 py-3" style={{ borderBottom: '1px solid rgba(15,22,35,0.05)' }}>
      <p style={{ fontSize: '0.85rem', fontWeight: 600, color: '#0F1623', marginBottom: 8 }}>電子郵件</p>
      <div className="flex gap-2">
        <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="請輸入電郵地址" style={{ flex: 1, padding: '8px 12px', borderRadius: '0.6rem', border: '1.5px solid rgba(15,22,35,0.1)', fontSize: '0.85rem', background: '#F7F8FC', outline: 'none', fontFamily: 'inherit', color: '#0F1623' }} />
        <button onClick={sendOtp} disabled={!email.includes('@')} style={{ background: 'none', border: 'none', cursor: email.includes('@') ? 'pointer' : 'not-allowed', color: email.includes('@') ? '#F5A623' : '#C4C9D6', fontSize: '0.82rem', fontWeight: 600, whiteSpace: 'nowrap' }}>發送驗證碼</button>
      </div>
    </div>
  );
}

// ── Change phone modal (2-step) ──────────────────────────
type PhoneStep = 'verify-old' | 'verify-old-otp' | 'enter-new' | 'verify-new-otp' | 'done';

function ChangePhoneModal({ currentPhone, onClose }: { currentPhone: string; onClose: () => void }) {
  const [step, setStep] = useState<PhoneStep>('verify-old');
  const [oldPhone, setOldPhone] = useState('');
  const [oldOtp, setOldOtp] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newOtp, setNewOtp] = useState('');
  const [error, setError] = useState('');

  function sendOldOtp() {
    if (!oldPhone) { setError('請輸入原有電話號碼'); return; }
    setError(''); setStep('verify-old-otp');
  }
  function confirmOldOtp() {
    if (!oldOtp) { setError('請輸入驗證碼'); return; }
    setError(''); setStep('enter-new');
  }
  function sendNewOtp() {
    if (!newPhone) { setError('請輸入新電話號碼'); return; }
    setError(''); setStep('verify-new-otp');
  }
  function confirmNewOtp() {
    if (!newOtp) { setError('請輸入驗證碼'); return; }
    setError(''); setStep('done');
  }

  const stepLabel = { 'verify-old': '第一步：驗證原有電話', 'verify-old-otp': '第一步：驗證原有電話', 'enter-new': '第二步：設定新電話號碼', 'verify-new-otp': '第二步：設定新電話號碼', done: '完成' };

  return (
    <>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 z-40" style={{ background: 'rgba(15,22,35,0.45)', backdropFilter: 'blur(2px)' }} onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, y: 60 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 60 }}
        transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
        className="absolute left-0 right-0 bottom-0 z-50 rounded-t-2xl flex flex-col gap-4 px-5 py-6"
        style={{ background: '#FFFFFF', boxShadow: '0 -8px 40px rgba(15,22,35,0.15)' }}
      >
        <div className="flex items-center justify-between">
          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0F1623', margin: 0 }}>更改電話號碼</h3>
            <p style={{ fontSize: '0.75rem', color: '#9CA3AF', margin: '4px 0 0 0' }}>{stepLabel[step]}</p>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}><X size={18} style={{ color: '#9CA3AF' }} /></button>
        </div>

        {/* Step indicator */}
        <div className="flex gap-1.5">
          {[0, 1].map((i) => {
            const active = (i === 0 && ['verify-old', 'verify-old-otp'].includes(step)) || (i === 1 && ['enter-new', 'verify-new-otp', 'done'].includes(step));
            return <div key={i} style={{ flex: 1, height: 3, borderRadius: 2, background: active ? '#F5A623' : '#EEF1F8', transition: 'background 0.3s' }} />;
          })}
        </div>

        {step === 'done' ? (
          <div className="flex flex-col items-center gap-3 py-4">
            <div className="flex items-center justify-center rounded-full" style={{ width: 56, height: 56, background: '#DCFCE7' }}>
              <Check size={24} style={{ color: '#15803D' }} />
            </div>
            <p style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0F1623' }}>電話號碼已更新</p>
            <p style={{ fontSize: '0.82rem', color: '#6B7A99' }}>新號碼：{newPhone}</p>
            <button onClick={onClose} className="w-full rounded-xl py-3 mt-2" style={{ background: '#F5A623', border: 'none', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 700, color: '#0F1623' }}>完成</button>
          </div>
        ) : step === 'verify-old' ? (
          <div className="flex flex-col gap-3">
            <p style={{ fontSize: '0.82rem', color: '#6B7A99' }}>請輸入您目前綁定的電話號碼（{currentPhone.replace(/(\d{4})\d+(\d{4})/, '$1****$2')}），我們將發送驗證碼確認身份。</p>
            <StyledInput label="原有電話號碼" value={oldPhone} onChange={setOldPhone} placeholder={currentPhone.replace(/(\d{4})\d+(\d{4})/, '$1****$2')} type="tel" />
            {error && <p style={{ fontSize: '0.75rem', color: '#D93025' }}>{error}</p>}
            <button onClick={sendOldOtp} className="w-full rounded-xl py-3" style={{ background: '#F5A623', border: 'none', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 700, color: '#0F1623' }}>發送驗證碼</button>
          </div>
        ) : step === 'verify-old-otp' ? (
          <div className="flex flex-col gap-3">
            <p style={{ fontSize: '0.82rem', color: '#6B7A99' }}>驗證碼已發送至 <span style={{ color: '#0F1623', fontWeight: 600 }}>{oldPhone}</span></p>
            <StyledInput label="驗證碼" value={oldOtp} onChange={setOldOtp} placeholder="輸入4位驗證碼" />
            {error && <p style={{ fontSize: '0.75rem', color: '#D93025' }}>{error}</p>}
            <button onClick={confirmOldOtp} className="w-full rounded-xl py-3" style={{ background: '#F5A623', border: 'none', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 700, color: '#0F1623' }}>確認身份</button>
          </div>
        ) : step === 'enter-new' ? (
          <div className="flex flex-col gap-3">
            <p style={{ fontSize: '0.82rem', color: '#6B7A99' }}>身份已驗證。請輸入新的電話號碼，我們將發送驗證碼完成更換。</p>
            <StyledInput label="新電話號碼" value={newPhone} onChange={setNewPhone} placeholder="例：9876 5432" type="tel" />
            {error && <p style={{ fontSize: '0.75rem', color: '#D93025' }}>{error}</p>}
            <button onClick={sendNewOtp} className="w-full rounded-xl py-3" style={{ background: '#F5A623', border: 'none', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 700, color: '#0F1623' }}>發送驗證碼</button>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            <p style={{ fontSize: '0.82rem', color: '#6B7A99' }}>驗證碼已發送至 <span style={{ color: '#0F1623', fontWeight: 600 }}>{newPhone}</span></p>
            <StyledInput label="驗證碼" value={newOtp} onChange={setNewOtp} placeholder="輸入4位驗證碼" />
            {error && <p style={{ fontSize: '0.75rem', color: '#D93025' }}>{error}</p>}
            <button onClick={confirmNewOtp} className="w-full rounded-xl py-3" style={{ background: '#F5A623', border: 'none', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 700, color: '#0F1623' }}>完成更換</button>
          </div>
        )}
      </motion.div>
    </>
  );
}

// ── Change password modal (2-step) ──────────────────────
type PwStep = 'verify-old' | 'set-new' | 'done';

function ChangePasswordModal({ onClose }: { onClose: () => void }) {
  const [step, setStep] = useState<PwStep>('verify-old');
  const [oldPw, setOldPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [error, setError] = useState('');
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);

  function confirmOldPw() {
    if (oldPw.length < 6) { setError('請輸入正確的現有密碼'); return; }
    setError(''); setStep('set-new');
  }
  function saveNewPw() {
    if (newPw.length < 6) { setError('新密碼至少需要6位字符'); return; }
    if (newPw !== confirmPw) { setError('兩次輸入的密碼不一致'); return; }
    setError(''); setStep('done');
  }

  return (
    <>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 z-40" style={{ background: 'rgba(15,22,35,0.45)', backdropFilter: 'blur(2px)' }} onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, y: 60 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 60 }}
        transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
        className="absolute left-0 right-0 bottom-0 z-50 rounded-t-2xl flex flex-col gap-4 px-5 py-6"
        style={{ background: '#FFFFFF', boxShadow: '0 -8px 40px rgba(15,22,35,0.15)' }}
      >
        <div className="flex items-center justify-between">
          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0F1623', margin: 0 }}>重設密碼</h3>
            <p style={{ fontSize: '0.75rem', color: '#9CA3AF', margin: '4px 0 0 0' }}>{step === 'verify-old' ? '第一步：確認現有密碼' : step === 'set-new' ? '第二步：設定新密碼' : '完成'}</p>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}><X size={18} style={{ color: '#9CA3AF' }} /></button>
        </div>

        <div className="flex gap-1.5">
          {[0, 1].map((i) => {
            const active = (i === 0 && step === 'verify-old') || (i === 1 && ['set-new', 'done'].includes(step));
            return <div key={i} style={{ flex: 1, height: 3, borderRadius: 2, background: active ? '#F5A623' : '#EEF1F8', transition: 'background 0.3s' }} />;
          })}
        </div>

        {step === 'done' ? (
          <div className="flex flex-col items-center gap-3 py-4">
            <div className="flex items-center justify-center rounded-full" style={{ width: 56, height: 56, background: '#DCFCE7' }}>
              <Check size={24} style={{ color: '#15803D' }} />
            </div>
            <p style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0F1623' }}>密碼已成功更新</p>
            <button onClick={onClose} className="w-full rounded-xl py-3 mt-2" style={{ background: '#F5A623', border: 'none', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 700, color: '#0F1623' }}>完成</button>
          </div>
        ) : step === 'verify-old' ? (
          <div className="flex flex-col gap-3">
            <p style={{ fontSize: '0.82rem', color: '#6B7A99' }}>請先輸入您的現有密碼以確認身份。</p>
            <div className="relative">
              <StyledInput label="現有密碼" value={oldPw} onChange={setOldPw} type={showOld ? 'text' : 'password'} placeholder="輸入現有密碼" />
              <button onClick={() => setShowOld((p) => !p)} style={{ position: 'absolute', right: 12, bottom: 12, background: 'none', border: 'none', cursor: 'pointer' }}>
                <Eye size={16} style={{ color: '#9CA3AF' }} />
              </button>
            </div>
            {error && <p style={{ fontSize: '0.75rem', color: '#D93025' }}>{error}</p>}
            <button onClick={confirmOldPw} className="w-full rounded-xl py-3" style={{ background: '#F5A623', border: 'none', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 700, color: '#0F1623' }}>下一步</button>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            <p style={{ fontSize: '0.82rem', color: '#6B7A99' }}>請設定您的新密碼（至少6位字符）。</p>
            <div className="relative">
              <StyledInput label="新密碼" value={newPw} onChange={setNewPw} type={showNew ? 'text' : 'password'} placeholder="輸入新密碼" />
              <button onClick={() => setShowNew((p) => !p)} style={{ position: 'absolute', right: 12, bottom: 12, background: 'none', border: 'none', cursor: 'pointer' }}>
                <Eye size={16} style={{ color: '#9CA3AF' }} />
              </button>
            </div>
            <StyledInput label="確認新密碼" value={confirmPw} onChange={setConfirmPw} type="password" placeholder="再次輸入新密碼" />
            {error && <p style={{ fontSize: '0.75rem', color: '#D93025' }}>{error}</p>}
            <button onClick={saveNewPw} className="w-full rounded-xl py-3" style={{ background: '#F5A623', border: 'none', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 700, color: '#0F1623' }}>儲存新密碼</button>
          </div>
        )}
      </motion.div>
    </>
  );
}

function SettingsView({ lang, user, t }: { lang: Language; user: UserData; t: ReturnType<typeof translations[Language]> }) {
  const [whatsapp, setWhatsapp] = useState('');
  const [showPhoneModal, setShowPhoneModal] = useState(false);
  const [showPwModal, setShowPwModal] = useState(false);
  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="flex-1 overflow-y-auto px-4 py-4" style={{ scrollbarWidth: 'none' }}>
        <div className="mb-5">
          <SectionLabel text={t.contactInfo} />
          <div style={{ background: '#FFFFFF', borderRadius: '1rem', boxShadow: CARD_SHADOW, border: CARD_BORDER, overflow: 'hidden' }}>
            <SettingsRow label={t.phoneRow} value={user.phone} action={t.changePhone} onAction={() => setShowPhoneModal(true)} />
            <EmailVerifySection />
            <div className="px-4 py-3">
              <p style={{ fontSize: '0.85rem', fontWeight: 600, color: '#0F1623', marginBottom: 8 }}>WhatsApp</p>
              <div className="flex gap-2">
                <input value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} placeholder={t.whatsappPlaceholder} style={{ flex: 1, padding: '8px 12px', borderRadius: '0.6rem', border: '1.5px solid rgba(15,22,35,0.1)', fontSize: '0.85rem', background: '#F7F8FC', outline: 'none', fontFamily: 'inherit', color: '#0F1623' }} />
                <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#F5A623', fontSize: '0.82rem', fontWeight: 600, whiteSpace: 'nowrap' }}>{t.bindAction}</button>
              </div>
            </div>
          </div>
        </div>
        <div className="mb-6">
          <SectionLabel text={t.passwordSettings} />
          <div style={{ background: '#FFFFFF', borderRadius: '1rem', boxShadow: CARD_SHADOW, border: CARD_BORDER, overflow: 'hidden' }}>
            <SettingsRow label={t.passwordSettings} value="••••••••" action={t.resetPassword} onAction={() => setShowPwModal(true)} />
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showPhoneModal && <ChangePhoneModal currentPhone={user.phone} onClose={() => setShowPhoneModal(false)} />}
      </AnimatePresence>
      <AnimatePresence>
        {showPwModal && <ChangePasswordModal onClose={() => setShowPwModal(false)} />}
      </AnimatePresence>
    </div>
  );
}

type TxFilter = 'all' | 'pending' | 'credited' | 'paid';

const FEEDBACK_EMAIL = 'support@newbee.hk';

function WalletView({ lang, t, onPayoutPress, initialTxId }: { lang: Language; t: ReturnType<typeof translations[Language]>; onPayoutPress: () => void; initialTxId?: number | null }) {
  const pendingBalance = 2899;
  const totalPaid = 22899;
  const [filter, setFilter] = useState<TxFilter>('all');
  const [showFeedback, setShowFeedback] = useState(false);
  const [copied, setCopied] = useState(false);
  const [selectedTxId, setSelectedTxId] = useState<number | null>(initialTxId ?? null);

  const filterTabs: { key: TxFilter; label: string }[] = [
    { key: 'all', label: '全部' },
    { key: 'pending', label: '申請中' },
    { key: 'credited', label: '已入賬' },
    { key: 'paid', label: '已出糧' },
  ];

  const filtered = filter === 'all' ? walletTxns : walletTxns.filter((tx) => tx.status === filter);

  const statusMeta: Record<string, { label: string; bg: string; color: string }> = {
    pending: { label: '申請中', bg: '#FEF3DC', color: '#D4891A' },
    credited: { label: '已入賬', bg: '#DCFCE7', color: '#15803D' },
    paid: { label: '已出糧', bg: '#EEF1F8', color: '#6B7A99' },
  };

  function handleCopy() {
    navigator.clipboard.writeText(FEEDBACK_EMAIL).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }).catch(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <>
      <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-4" style={{ scrollbarWidth: 'none' }}>
        {/* Balance card */}
        <div className="rounded-2xl p-5" style={{ background: '#FFFFFF', boxShadow: CARD_SHADOW, border: CARD_BORDER }}>
          <div className="flex items-start justify-between gap-4 mb-4">
            <div>
              <p style={{ fontSize: '0.72rem', color: '#9CA3AF', fontWeight: 600, marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.06em' }}>待支付餘額</p>
              <span style={{ fontSize: '1.9rem', fontWeight: 800, color: '#0F1623', letterSpacing: '-0.03em' }}>
                HK${pendingBalance.toLocaleString()}
              </span>
            </div>
            <button
              onClick={onPayoutPress}
              className="rounded-xl px-4 py-2 transition-all active:scale-95 shrink-0"
              style={{ background: '#F5A623', color: '#0F1623', border: 'none', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 700, marginTop: 18 }}
            >
              {t.applyPayout}
            </button>
          </div>
          <div style={{ height: 1, background: 'rgba(15,22,35,0.06)', marginBottom: 12 }} />
          <div className="flex items-center justify-between">
            <p style={{ fontSize: '0.72rem', color: '#9CA3AF', fontWeight: 600 }}>累計已出糧</p>
            <span style={{ fontSize: '1rem', fontWeight: 700, color: '#15803D' }}>
              HK${totalPaid.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2">
          {filterTabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className="rounded-xl px-3 py-1.5 transition-all"
              style={{
                background: filter === tab.key ? '#0F1623' : '#FFFFFF',
                color: filter === tab.key ? '#FFFFFF' : '#6B7A99',
                border: filter === tab.key ? 'none' : `1.5px solid rgba(15,22,35,0.1)`,
                fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer',
                boxShadow: filter === tab.key ? '0 2px 8px rgba(15,22,35,0.2)' : CARD_SHADOW,
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Transaction list */}
        <div className="flex flex-col gap-2.5">
          {filtered.length === 0 && (
            <div className="py-10 flex flex-col items-center gap-2">
              <p style={{ fontSize: '0.88rem', color: '#9CA3AF' }}>暫無相關記錄</p>
            </div>
          )}
          {filtered.map((tx) => {
            const meta = statusMeta[tx.status];
            const amtColor = tx.status === 'pending' ? '#D4891A' : tx.type === 'in' ? '#15803D' : '#D93025';
            return (
              <button
                key={tx.id}
                onClick={() => setSelectedTxId(tx.id)}
                className="w-full rounded-2xl p-4 text-left transition-all active:scale-[0.98]"
                style={{ background: '#FFFFFF', boxShadow: CARD_SHADOW, border: CARD_BORDER, cursor: 'pointer' }}
              >
                <div className="flex items-start gap-3">
                  <div className="shrink-0 flex items-center justify-center rounded-xl" style={{ width: 36, height: 36, background: tx.status === 'pending' ? '#FEF3DC' : tx.type === 'in' ? '#DCFCE7' : '#FEE2E2' }}>
                    {tx.status === 'pending' ? <AlertCircle size={15} style={{ color: '#D4891A' }} /> : tx.type === 'in' ? <Plus size={16} style={{ color: '#15803D' }} /> : <Minus size={16} style={{ color: '#D93025' }} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0F1623' }}>{tx.desc[lang]}</span>
                      <span style={{ fontSize: '0.95rem', fontWeight: 700, color: amtColor, whiteSpace: 'nowrap' }}>
                        {tx.type === 'in' ? '+' : '−'}HK${tx.amount.toLocaleString()}
                      </span>
                    </div>
                    <p style={{ fontSize: '0.78rem', color: '#6B7A99', margin: '3px 0 0 0' }}>
                      {tx.job[lang]}{tx.company ? ` · ${tx.company}` : ''}
                    </p>
                    <div className="flex items-center justify-between mt-1.5">
                      <p style={{ fontSize: '0.73rem', color: '#9CA3AF' }}>{tx.date}</p>
                      <span className="rounded-md px-2 py-0.5" style={{ background: meta.bg, color: meta.color, fontSize: '0.7rem', fontWeight: 700 }}>{meta.label}</span>
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Feedback button */}
        <div className="flex justify-center py-2">
          <button
            onClick={() => setShowFeedback(true)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#F5A623', fontSize: '0.85rem', fontWeight: 600 }}
          >
            <div className="flex items-center gap-1.5">
              <AlertCircle size={14} />
              {t.abnormalFeedback}
            </div>
          </button>
        </div>
        <div className="h-2" />
      </div>

      {/* ── Transaction detail overlay ── */}
      <AnimatePresence>
        {selectedTxId !== null && (() => {
          const tx = walletTxns.find((x) => x.id === selectedTxId);
          if (!tx) return null;
          const meta = statusMeta[tx.status];
          const amtColor = tx.status === 'pending' ? '#D4891A' : tx.type === 'in' ? '#15803D' : '#D93025';
          const isWage = tx.type === 'in';

          return (
            <motion.div
              initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 40 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              className="absolute inset-0 z-20 flex flex-col"
              style={{ background: '#F7F8FC' }}
            >
              <SubPageHeader
                title={tx.desc[lang]}
                onBack={() => setSelectedTxId(null)}
              />
              <div className="flex-1 overflow-y-auto px-4 py-5 flex flex-col gap-4" style={{ scrollbarWidth: 'none' }}>

                {/* Amount hero */}
                <div className="rounded-2xl p-5 flex flex-col items-center gap-2" style={{ background: '#FFFFFF', boxShadow: CARD_SHADOW, border: CARD_BORDER }}>
                  <span style={{ fontSize: '2.2rem', fontWeight: 900, color: amtColor, letterSpacing: '-0.03em' }}>
                    {tx.type === 'in' ? '+' : '−'}HK${tx.amount.toLocaleString()}
                  </span>
                  <span className="rounded-full px-3 py-1" style={{ background: meta.bg, color: meta.color, fontSize: '0.75rem', fontWeight: 700 }}>
                    {meta.label}
                  </span>
                  <p style={{ fontSize: '0.8rem', color: '#9CA3AF', margin: 0 }}>{tx.date}</p>
                </div>

                {/* Job info (wage entries) */}
                {isWage && (tx as any).store !== undefined && (
                  <div className="flex flex-col gap-0" style={{ background: '#FFFFFF', borderRadius: '1rem', boxShadow: CARD_SHADOW, border: CARD_BORDER, overflow: 'hidden' }}>
                    <div className="px-4 py-2.5" style={{ borderBottom: '1px solid rgba(15,22,35,0.04)', background: '#F7F8FC' }}>
                      <p style={{ fontSize: '0.7rem', fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.07em', margin: 0 }}>崗位資訊</p>
                    </div>
                    {[
                      { label: '崗位名',  value: tx.job[lang] },
                      { label: '公司',    value: tx.company },
                      { label: '門店',    value: (tx as any).store || '—' },
                    ].map(({ label, value }) => (
                      <div key={label} className="flex items-center justify-between px-4 py-3" style={{ borderBottom: '1px solid rgba(15,22,35,0.04)' }}>
                        <span style={{ fontSize: '0.82rem', color: '#9CA3AF' }}>{label}</span>
                        <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#0F1623', textAlign: 'right', maxWidth: '60%' }}>{value}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Attendance record (wage entries) */}
                {isWage && (tx as any).attendanceDate && (
                  <div className="flex flex-col gap-0" style={{ background: '#FFFFFF', borderRadius: '1rem', boxShadow: CARD_SHADOW, border: CARD_BORDER, overflow: 'hidden' }}>
                    <div className="px-4 py-2.5" style={{ borderBottom: '1px solid rgba(15,22,35,0.04)', background: '#F7F8FC' }}>
                      <p style={{ fontSize: '0.7rem', fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.07em', margin: 0 }}>出勤記錄</p>
                    </div>
                    {[
                      { label: '出勤日期', value: (tx as any).attendanceDate },
                      { label: '班次時間', value: `${(tx as any).shiftStart} – ${(tx as any).shiftEnd}` },
                      { label: '上班打卡', value: (tx as any).clockIn },
                      { label: '下班打卡', value: (tx as any).clockOut },
                      { label: '實際工時', value: `${(tx as any).hours}小時` },
                    ].map(({ label, value }) => (
                      <div key={label} className="flex items-center justify-between px-4 py-3" style={{ borderBottom: '1px solid rgba(15,22,35,0.04)' }}>
                        <span style={{ fontSize: '0.82rem', color: '#9CA3AF' }}>{label}</span>
                        <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#0F1623' }}>{value}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Payroll breakdown */}
                {isWage && (tx as any).ratePerHour && (
                  <div className="flex flex-col gap-0" style={{ background: '#FFFFFF', borderRadius: '1rem', boxShadow: CARD_SHADOW, border: CARD_BORDER, overflow: 'hidden' }}>
                    <div className="px-4 py-2.5" style={{ borderBottom: '1px solid rgba(15,22,35,0.04)', background: '#F7F8FC' }}>
                      <p style={{ fontSize: '0.7rem', fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.07em', margin: 0 }}>薪資明細</p>
                    </div>
                    {[
                      { label: '計薪方式', value: `HK$${(tx as any).ratePerHour}/小時` },
                      { label: '確認工時', value: `${(tx as any).hours}小時` },
                      { label: '確認薪資', value: `HK$${tx.amount.toLocaleString()}`, bold: true, green: true },
                    ].map(({ label, value, bold, green }) => (
                      <div key={label} className="flex items-center justify-between px-4 py-3" style={{ borderBottom: '1px solid rgba(15,22,35,0.04)' }}>
                        <span style={{ fontSize: '0.82rem', color: '#9CA3AF' }}>{label}</span>
                        <span style={{ fontSize: '0.9rem', fontWeight: bold ? 800 : 600, color: green ? '#15803D' : '#0F1623' }}>{value}</span>
                      </div>
                    ))}
                    {(tx as any).payrollNote && (
                      <div className="px-4 py-3 flex flex-col gap-1">
                        <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#D4891A', textTransform: 'uppercase', letterSpacing: '0.05em' }}>薪資說明</span>
                        <span style={{ fontSize: '0.82rem', color: '#92580A', lineHeight: 1.6 }}>{(tx as any).payrollNote}</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Payout info (out type) */}
                {!isWage && (
                  <div className="flex flex-col gap-0" style={{ background: '#FFFFFF', borderRadius: '1rem', boxShadow: CARD_SHADOW, border: CARD_BORDER, overflow: 'hidden' }}>
                    <div className="px-4 py-2.5" style={{ borderBottom: '1px solid rgba(15,22,35,0.04)', background: '#F7F8FC' }}>
                      <p style={{ fontSize: '0.7rem', fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.07em', margin: 0 }}>出糧資訊</p>
                    </div>
                    {[
                      { label: '出糧平台', value: tx.company || 'NewBee Hong Kong Ltd.' },
                      { label: '出糧日期', value: tx.date },
                      { label: '出糧金額', value: `HK$${tx.amount.toLocaleString()}` },
                    ].map(({ label, value }) => (
                      <div key={label} className="flex items-center justify-between px-4 py-3" style={{ borderBottom: '1px solid rgba(15,22,35,0.04)' }}>
                        <span style={{ fontSize: '0.82rem', color: '#9CA3AF' }}>{label}</span>
                        <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#0F1623' }}>{value}</span>
                      </div>
                    ))}
                  </div>
                )}

              </div>
            </motion.div>
          );
        })()}
      </AnimatePresence>

      {/* Feedback modal */}
      <AnimatePresence>
        {showFeedback && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 z-40"
              style={{ background: 'rgba(15,22,35,0.4)', backdropFilter: 'blur(2px)' }}
              onClick={() => setShowFeedback(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: 40, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 40, scale: 0.96 }}
              transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
              className="absolute left-4 right-4 bottom-8 z-50 rounded-2xl p-6 flex flex-col gap-4"
              style={{ background: '#FFFFFF', boxShadow: '0 16px 48px rgba(15,22,35,0.18)', border: CARD_BORDER }}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center justify-center rounded-xl" style={{ width: 40, height: 40, background: '#FEF3DC' }}>
                  <AlertCircle size={18} style={{ color: '#D4891A' }} />
                </div>
                <button onClick={() => setShowFeedback(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
                  <X size={18} style={{ color: '#9CA3AF' }} />
                </button>
              </div>

              <div>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0F1623', margin: '0 0 6px 0' }}>異常反饋</h3>
                <p style={{ fontSize: '0.85rem', color: '#6B7A99', lineHeight: 1.6, margin: 0 }}>
                  如有出糧異常或帳單問題，請聯繫平台進行反饋，我們將盡快為你跟進處理。
                </p>
              </div>

              <div className="rounded-xl p-4 flex items-center justify-between gap-3" style={{ background: '#F7F8FC', border: '1.5px solid rgba(15,22,35,0.08)' }}>
                <div>
                  <p style={{ fontSize: '0.72rem', fontWeight: 600, color: '#9CA3AF', margin: '0 0 3px 0' }}>聯絡電郵</p>
                  <p style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0F1623', margin: 0 }}>{FEEDBACK_EMAIL}</p>
                </div>
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1.5 rounded-xl px-3 py-2 transition-all active:scale-95"
                  style={{ background: copied ? '#DCFCE7' : '#0F1623', border: 'none', cursor: 'pointer', flexShrink: 0 }}
                >
                  {copied
                    ? <Check size={13} style={{ color: '#15803D' }} />
                    : <Upload size={13} style={{ color: '#FFFFFF', transform: 'rotate(90deg)' }} />
                  }
                  <span style={{ fontSize: '0.8rem', fontWeight: 700, color: copied ? '#15803D' : '#FFFFFF' }}>
                    {copied ? '已複製' : '複製'}
                  </span>
                </button>
              </div>

              <button
                onClick={() => setShowFeedback(false)}
                className="w-full rounded-xl py-3 transition-all active:scale-[0.98]"
                style={{ background: '#EEF1F8', border: 'none', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 600, color: '#6B7A99' }}
              >
                關閉
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

function PayoutView({ lang, t, onBack }: { lang: Language; t: ReturnType<typeof translations[Language]>; onBack: () => void }) {
  const PENDING_BALANCE = 2899;
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState<'cash' | 'bank' | 'fps'>('cash');
  const [bankDetails, setBankDetails] = useState('');
  const [fpsAccount, setFpsAccount] = useState('');
  const [notes, setNotes] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const amountNum = parseFloat(amount) || 0;
  const amountError = amountNum > 0 && amountNum > PENDING_BALANCE;

  if (submitted) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-6 px-6">
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex items-center justify-center rounded-full" style={{ width: 80, height: 80, background: '#DCFCE7' }}>
          <span style={{ fontSize: '2.5rem' }}>✓</span>
        </motion.div>
        <p style={{ fontSize: '1rem', fontWeight: 700, color: '#0F1623', textAlign: 'center' }}>{t.payoutSuccess}</p>
        <button onClick={onBack} className="rounded-xl px-8 py-2.5" style={{ background: '#F5A623', color: '#0F1623', border: 'none', cursor: 'pointer', fontWeight: 700 }}>
          {lang === 'en' ? 'Back to Wallet' : lang === 'zh-CN' ? '返回钱包' : '返回錢包'}
        </button>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-4" style={{ scrollbarWidth: 'none' }}>
      <div className="rounded-2xl p-4 flex flex-col gap-4" style={{ background: '#FFFFFF', boxShadow: CARD_SHADOW, border: CARD_BORDER }}>
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#6B7A99' }}>{t.payoutAmount}</span>
            <span style={{ fontSize: '0.75rem', color: '#9CA3AF' }}>
              可出糧：<span style={{ fontWeight: 700, color: '#0F1623' }}>HK${PENDING_BALANCE.toLocaleString()}</span>
            </span>
          </div>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="HK$ 0"
            style={{
              padding: '12px 14px', borderRadius: '0.75rem',
              border: `1.5px solid ${amountError ? '#D93025' : 'rgba(15,22,35,0.1)'}`,
              fontSize: '0.9rem', color: '#0F1623',
              background: amountError ? '#FEF2F2' : '#F7F8FC',
              outline: 'none', fontFamily: 'inherit',
              width: '100%', boxSizing: 'border-box' as const,
            }}
          />
          {amountError && (
            <div className="flex items-center gap-1.5">
              <AlertCircle size={13} style={{ color: '#D93025', flexShrink: 0 }} />
              <span style={{ fontSize: '0.78rem', color: '#D93025' }}>
                申請金額不能超過待支付餘額 HK${PENDING_BALANCE.toLocaleString()}
              </span>
            </div>
          )}
        </div>
        <div>
          <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#6B7A99', display: 'block', marginBottom: 10 }}>{t.paymentMethod}</span>
          <div className="flex flex-col gap-2.5">
            {/* Cash & Bank Transfer */}
            <div className="flex gap-4">
              {(['cash', 'bank'] as const).map((m) => (
                <label key={m} className="flex items-center gap-2 cursor-pointer">
                  <div onClick={() => setMethod(m)} className="flex items-center justify-center rounded-full transition-all" style={{ width: 18, height: 18, border: `2px solid ${method === m ? '#F5A623' : 'rgba(15,22,35,0.2)'}`, background: method === m ? '#F5A623' : 'transparent', flexShrink: 0 }}>
                    {method === m && <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#FFFFFF' }} />}
                  </div>
                  <span style={{ fontSize: '0.88rem', fontWeight: 600, color: '#0F1623' }}>{m === 'cash' ? t.cash : t.bankTransfer}</span>
                </label>
              ))}
            </div>
            {/* FPS option */}
            <label className="flex items-center gap-2 cursor-pointer rounded-xl px-3 py-2.5 transition-all" style={{ background: method === 'fps' ? '#F0FFF4' : '#F7F8FC', border: `1.5px solid ${method === 'fps' ? 'rgba(21,128,61,0.3)' : 'rgba(15,22,35,0.07)'}` }} onClick={() => setMethod('fps')}>
              <div className="flex items-center justify-center rounded-full transition-all shrink-0" style={{ width: 18, height: 18, border: `2px solid ${method === 'fps' ? '#F5A623' : 'rgba(15,22,35,0.2)'}`, background: method === 'fps' ? '#F5A623' : 'transparent' }}>
                {method === 'fps' && <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#FFFFFF' }} />}
              </div>
              <div className="flex items-center gap-2 flex-1">
                <div className="flex items-center justify-center rounded-md" style={{ width: 28, height: 18, background: '#0AA66E', flexShrink: 0 }}>
                  <span style={{ fontSize: '0.5rem', fontWeight: 900, color: '#FFFFFF', letterSpacing: '-0.02em' }}>轉</span>
                </div>
                <span style={{ fontSize: '0.88rem', fontWeight: 600, color: '#0F1623' }}>轉速達（FPS）</span>
              </div>
            </label>
          </div>
        </div>
        {method === 'bank' && <StyledInput label={t.bankDetails} value={bankDetails} onChange={setBankDetails} placeholder={t.bankDetailsPlaceholder} />}
        {method === 'fps' && (
          <StyledInput
            label="轉速達帳戶"
            required
            value={fpsAccount}
            onChange={setFpsAccount}
            placeholder="請輸入手機號碼、身分證號碼或電郵地址"
          />
        )}
        <StyledInput label={t.notesLabel} value={notes} onChange={setNotes} placeholder={t.notesPlaceholder} />
      </div>
      <div className="flex gap-3">
        <button onClick={onBack} className="flex-1 rounded-xl py-3" style={{ background: '#EEF1F8', color: '#6B7A99', border: 'none', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 600 }}>{t.cancelBtn}</button>
        <button
          onClick={() => { const fpsOk = method !== 'fps' || !!fpsAccount.trim(); if (!amountError && amountNum > 0 && fpsOk) setSubmitted(true); }}
          className="rounded-xl py-3 transition-all active:scale-[0.98]"
          style={{ flex: 2, background: (amountError || amountNum === 0 || (method === 'fps' && !fpsAccount.trim())) ? '#E5E7EB' : '#F5A623', color: (amountError || amountNum === 0 || (method === 'fps' && !fpsAccount.trim())) ? '#9CA3AF' : '#0F1623', border: 'none', cursor: (amountError || amountNum === 0 || (method === 'fps' && !fpsAccount.trim())) ? 'not-allowed' : 'pointer', fontSize: '0.9rem', fontWeight: 700 }}
        >
          {t.submitRequest}
        </button>
      </div>
    </div>
  );
}


// ── Main profile view ──────────────────────────────────

function MainProfileView({ lang, user, t, editData, onNavigate, onLogout, onLangChange, isVerified, onStartVerify }: {
  lang: Language; user: UserData; t: ReturnType<typeof translations[Language]>;
  editData: ProfileEditData; onNavigate: (v: ProfileView) => void; onLogout: () => void;
  onLangChange: (l: Language) => void; isVerified?: boolean; onStartVerify?: () => void;
}) {
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [showCsSheet, setShowCsSheet] = useState(false);
  const initials = editData.name.charAt(0).toUpperCase() || user.name.charAt(0).toUpperCase();
  const displayLangs = [...editData.languages.filter((l) => l !== '其他'), ...(editData.languages.includes('其他') && editData.languageOther ? [editData.languageOther] : [])];
  const topEdu = editData.education[0];

  return (
    <>
    <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-4" style={{ scrollbarWidth: 'none' }}>
      {/* User card */}
      <div className="rounded-2xl p-4" style={{ background: '#FFFFFF', boxShadow: CARD_SHADOW, border: CARD_BORDER }}>
        <div className="flex items-start gap-3">
          <div className="shrink-0 flex items-center justify-center rounded-2xl" style={{ width: 56, height: 56, background: '#FEF3DC', border: '2px solid #F5A62340' }}>
            <span style={{ fontSize: '1.4rem', fontWeight: 800, color: '#D4891A' }}>{initials}</span>
          </div>
          <div className="flex-1">
            <h2 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0F1623', margin: 0 }}>{editData.name || user.name}</h2>
            <p style={{ fontSize: '0.82rem', color: '#6B7A99', margin: '3px 0 0 0' }}>
              {editData.gender && `${editData.gender} · `}{user.age}{lang === 'en' ? ' yrs' : '歲'}
            </p>
          </div>
          {/* Redesigned 更新 button */}
          <button
            onClick={() => onNavigate('edit-profile')}
            className="flex items-center gap-1.5 rounded-xl px-3 py-2 transition-all active:scale-95"
            style={{ background: '#F5A623', border: 'none', cursor: 'pointer', flexShrink: 0 }}
          >
            <FileText size={13} style={{ color: '#0F1623' }} />
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#0F1623' }}>更新資料</span>
          </button>
        </div>

        <div className="mt-4 pt-4 flex flex-col gap-2" style={{ borderTop: '1px solid rgba(15,22,35,0.06)' }}>
          {/* HKID status row */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Shield size={13} style={{ color: isVerified ? '#15803D' : '#9CA3AF', flexShrink: 0 }} />
              <span style={{ fontSize: '0.78rem', color: isVerified ? '#15803D' : '#9CA3AF', fontWeight: 600 }}>
                {isVerified ? '香港身份證已認證' : '香港身份證未認證'}
              </span>
            </div>
            <button
              onClick={onStartVerify}
              style={{
                background: isVerified ? '#EEF1F8' : '#FEF3DC',
                border: 'none', cursor: 'pointer', borderRadius: '0.5rem', padding: '3px 8px',
                fontSize: '0.7rem', fontWeight: 700, color: isVerified ? '#6B7A99' : '#D4891A',
              }}
            >
              {isVerified ? '更新認證' : '立即認證'}
            </button>
          </div>
          {topEdu && (
            <div className="flex items-center gap-2">
              <GraduationCap size={13} style={{ color: '#6B7A99', flexShrink: 0 }} />
              <span style={{ fontSize: '0.78rem', color: '#6B7A99' }}>
                {[topEdu.degree, topEdu.school].filter(Boolean).join(' · ') || '教育背景'}
              </span>
            </div>
          )}
          {displayLangs.length > 0 && (
            <div className="flex items-center gap-2">
              <MessageSquare size={13} style={{ color: '#6B7A99', flexShrink: 0 }} />
              <span style={{ fontSize: '0.78rem', color: '#6B7A99' }}>{displayLangs.join('、')}</span>
            </div>
          )}
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 gap-3">
        <button onClick={() => onNavigate('job-history')} className="rounded-2xl p-4 text-left transition-all active:scale-[0.98]" style={{ background: '#FFFFFF', boxShadow: CARD_SHADOW, border: CARD_BORDER, cursor: 'pointer' }}>
          <div className="flex items-center gap-1.5 mb-1"><FileText size={13} style={{ color: '#6B7A99' }} /><span style={{ fontSize: '0.75rem', color: '#6B7A99', fontWeight: 600 }}>{t.jobHistory}</span></div>
          <span style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0F1623', letterSpacing: '-0.02em' }}>68</span>
        </button>
        <button onClick={() => onNavigate('wallet')} className="rounded-2xl p-4 text-left transition-all active:scale-[0.98]" style={{ background: '#FFFFFF', boxShadow: CARD_SHADOW, border: CARD_BORDER, cursor: 'pointer' }}>
          <div className="flex items-center gap-1.5 mb-1"><Wallet size={13} style={{ color: '#6B7A99' }} /><span style={{ fontSize: '0.75rem', color: '#6B7A99', fontWeight: 600 }}>{t.myWallet}</span></div>
          <span style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0F1623', letterSpacing: '-0.02em' }}>HK$22,899</span>
        </button>
      </div>

      {/* Settings quick link */}
      <button onClick={() => onNavigate('settings')} className="rounded-2xl p-4 flex items-center justify-between transition-all active:scale-[0.99]" style={{ background: '#FFFFFF', boxShadow: CARD_SHADOW, border: CARD_BORDER, cursor: 'pointer' }}>
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center rounded-xl" style={{ width: 36, height: 36, background: '#EEF1F8' }}>
            <Settings size={16} style={{ color: '#6B7A99' }} />
          </div>
          <span style={{ fontSize: '0.88rem', fontWeight: 600, color: '#0F1623' }}>{t.accountSettings}</span>
        </div>
        <ChevronRight size={16} style={{ color: '#9CA3AF' }} />
      </button>

      {/* Language switcher */}
      <div className="relative rounded-2xl" style={{ background: '#FFFFFF', boxShadow: CARD_SHADOW, border: CARD_BORDER }}>
        <button
          onClick={() => setShowLangMenu((p) => !p)}
          className="w-full p-4 flex items-center justify-between transition-all active:scale-[0.99]"
          style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}
        >
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center rounded-xl" style={{ width: 36, height: 36, background: '#EEF1F8' }}>
              <Languages size={16} style={{ color: '#6B7A99' }} />
            </div>
            <span style={{ fontSize: '0.88rem', fontWeight: 600, color: '#0F1623' }}>
              {lang === 'en' ? 'Language' : lang === 'zh-CN' ? '语言设置' : '語言設定'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#F5A623' }}>{LANG_LABELS[lang]}</span>
            <ChevronRight size={16} style={{ color: '#9CA3AF', transform: showLangMenu ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s' }} />
          </div>
        </button>
        <AnimatePresence>
          {showLangMenu && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowLangMenu(false)} />
              <motion.div
                className="absolute left-4 right-4 z-50 rounded-xl overflow-hidden"
                style={{ top: '100%', marginTop: 6, background: '#FFFFFF', boxShadow: '0 8px 32px rgba(15,22,35,0.15)', border: '1px solid rgba(15,22,35,0.08)' }}
                initial={{ opacity: 0, scale: 0.97, y: -6 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.97, y: -6 }}
                transition={{ duration: 0.15 }}
              >
                {(['zh-HK', 'zh-CN', 'en'] as Language[]).map((l) => (
                  <button
                    key={l}
                    onClick={() => { onLangChange(l); setShowLangMenu(false); }}
                    className="w-full flex items-center justify-between px-4 py-3"
                    style={{ background: lang === l ? '#EEF1F8' : 'transparent', border: 'none', cursor: 'pointer', fontSize: '0.88rem', fontWeight: lang === l ? 700 : 500, color: lang === l ? '#0F1623' : '#6B7A99', borderBottom: '1px solid rgba(15,22,35,0.05)' }}
                  >
                    <span>{LANG_NAMES[l]}</span>
                    {lang === l && <span style={{ fontSize: '0.75rem', color: '#F5A623', fontWeight: 700 }}>✓</span>}
                  </button>
                ))}
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>

      {/* Contact support row */}
      <button
        onClick={() => setShowCsSheet(true)}
        className="w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all active:scale-[0.98]"
        style={{ background: '#FFFFFF', boxShadow: CARD_SHADOW, border: CARD_BORDER, cursor: 'pointer' }}
      >
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center rounded-xl" style={{ width: 36, height: 36, background: '#EEF8FF' }}>
            <Headphones size={16} style={{ color: '#3B5BDB' }} />
          </div>
          <span style={{ fontSize: '0.88rem', fontWeight: 600, color: '#0F1623' }}>聯繫平台客服</span>
        </div>
        <ChevronRight size={16} style={{ color: '#9CA3AF' }} />
      </button>

      {/* Logout */}
      <button onClick={onLogout} className="w-full rounded-xl py-3 transition-all active:scale-[0.98]" style={{ background: 'transparent', border: '1.5px solid rgba(15,22,35,0.12)', color: '#6B7A99', cursor: 'pointer', fontSize: '0.88rem', fontWeight: 600 }}>
        <div className="flex items-center justify-center gap-2"><LogOut size={15} />{t.logout}</div>
      </button>
      <div className="h-2" />
    </div>

    {/* ── Customer service sheet ── */}
    <AnimatePresence>
      {showCsSheet && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 z-40"
            style={{ background: 'rgba(15,22,35,0.45)', backdropFilter: 'blur(2px)' }}
            onClick={() => setShowCsSheet(false)}
          />
          <motion.div
            initial={{ opacity: 0, y: 60 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 60 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="absolute left-0 right-0 bottom-0 z-50 rounded-t-2xl px-5 py-6 flex flex-col gap-5"
            style={{ background: '#FFFFFF', boxShadow: '0 -8px 40px rgba(15,22,35,0.15)', maxHeight: '80vh', overflowY: 'auto' }}
          >
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center rounded-xl shrink-0" style={{ width: 40, height: 40, background: '#EEF8FF' }}>
                  <Headphones size={18} style={{ color: '#3B5BDB' }} />
                </div>
                <div>
                  <p style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0F1623', margin: 0 }}>聯繫平台客服</p>
                  <p style={{ fontSize: '0.75rem', color: '#9CA3AF', margin: '2px 0 0 0' }}>NewBee Hong Kong Ltd.</p>
                </div>
              </div>
              <button onClick={() => setShowCsSheet(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
                <X size={18} style={{ color: '#9CA3AF' }} />
              </button>
            </div>

            {/* WhatsApp QR */}
            <div className="rounded-2xl p-4 flex flex-col items-center gap-3" style={{ background: '#F7F8FC', border: CARD_BORDER }}>
              <p style={{ fontSize: '0.8rem', fontWeight: 700, color: '#0F1623', margin: 0, alignSelf: 'flex-start' }}>WhatsApp 客服</p>
              <div style={{ borderRadius: 12, overflow: 'hidden', boxShadow: '0 2px 12px rgba(15,22,35,0.1)' }}>
                {/* QR code placeholder SVG */}
                <svg width="140" height="140" viewBox="0 0 100 100" style={{ display: 'block', background: '#FFFFFF' }}>
                  {/* TL finder */}
                  <rect x="4"  y="4"  width="26" height="26" rx="3" fill="#0F1623"/>
                  <rect x="8"  y="8"  width="18" height="18" rx="1" fill="#fff"/>
                  <rect x="12" y="12" width="10" height="10" rx="1" fill="#0F1623"/>
                  {/* TR finder */}
                  <rect x="70" y="4"  width="26" height="26" rx="3" fill="#0F1623"/>
                  <rect x="74" y="8"  width="18" height="18" rx="1" fill="#fff"/>
                  <rect x="78" y="12" width="10" height="10" rx="1" fill="#0F1623"/>
                  {/* BL finder */}
                  <rect x="4"  y="70" width="26" height="26" rx="3" fill="#0F1623"/>
                  <rect x="8"  y="74" width="18" height="18" rx="1" fill="#fff"/>
                  <rect x="12" y="78" width="10" height="10" rx="1" fill="#0F1623"/>
                  {/* BR alignment */}
                  <rect x="70" y="70" width="10" height="10" rx="1" fill="#0F1623"/>
                  {/* Data modules */}
                  {([
                    [36,4],[40,4],[48,4],[56,4],[64,4],
                    [36,8],[44,8],[52,8],[60,8],[64,8],
                    [40,12],[48,12],[56,12],[64,12],
                    [36,16],[40,16],[52,16],[60,16],
                    [36,20],[44,20],[48,20],[56,20],[64,20],
                    [4,36],[8,36],[16,36],[24,36],[28,36],
                    [4,40],[12,40],[20,40],[28,40],
                    [4,44],[8,44],[16,44],[24,44],[28,44],
                    [4,48],[12,48],[20,48],
                    [4,52],[8,52],[16,52],[24,52],[28,52],
                    [36,36],[40,36],[44,36],[48,36],[52,36],[56,36],[60,36],[64,36],[68,36],[72,36],[76,36],[80,36],[84,36],[88,36],[92,36],[96,36],
                    [36,40],[48,40],[56,40],[64,40],[72,40],[80,40],[88,40],[96,40],
                    [36,44],[40,44],[44,44],[52,44],[60,44],[68,44],[76,44],[84,44],[92,44],
                    [36,48],[44,48],[52,48],[64,48],[72,48],[80,48],[88,48],[96,48],
                    [36,52],[40,52],[48,52],[56,52],[64,52],[76,52],[84,52],[92,52],
                    [36,56],[44,56],[52,56],[60,56],[72,56],[80,56],[88,56],[96,56],
                    [36,60],[40,60],[48,60],[56,60],[64,60],[76,60],[84,60],[92,60],
                    [36,64],[44,64],[52,64],[60,64],[68,64],[76,64],[88,64],[96,64],
                    [36,68],[40,68],[48,68],[56,68],[64,68],[80,68],[88,68],[92,68],
                    [36,72],[44,72],[52,72],[60,72],[80,72],[88,72],[96,72],
                    [36,76],[48,76],[60,76],[68,76],[84,76],[92,76],
                    [36,80],[40,80],[48,80],[56,80],[64,80],[76,80],[88,80],[96,80],
                    [36,84],[44,84],[52,84],[68,84],[80,84],[92,84],
                    [36,88],[40,88],[52,88],[60,88],[72,88],[80,88],[88,88],
                    [36,92],[48,92],[56,92],[64,92],[76,92],[84,92],[92,92],
                    [36,96],[40,96],[52,96],[60,96],[72,96],[80,96],[88,96],
                  ] as [number, number][]).map(([x, y], i) => (
                    <rect key={i} x={x} y={y} width="4" height="4" fill="#0F1623"/>
                  ))}
                </svg>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center justify-center rounded-lg" style={{ width: 26, height: 26, background: '#25D366' }}>
                  <MessageCircle size={13} style={{ color: '#FFFFFF' }} />
                </div>
                <p style={{ fontSize: '0.78rem', color: '#6B7A99', margin: 0 }}>掃描 QR Code 添加 WhatsApp 客服</p>
              </div>
            </div>

            {/* Email + hours */}
            <div className="rounded-2xl flex flex-col" style={{ background: '#F7F8FC', border: CARD_BORDER, overflow: 'hidden' }}>
              {[
                { label: '客服電郵', value: 'support@newbee.hk', blue: true },
                { label: '服務時間', value: '週一至週五 09:00–18:00', blue: false },
              ].map(({ label, value, blue }, i) => (
                <div key={label} className="flex items-center justify-between px-4 py-3" style={{ borderTop: i > 0 ? '1px solid rgba(15,22,35,0.06)' : 'none' }}>
                  <span style={{ fontSize: '0.8rem', color: '#9CA3AF' }}>{label}</span>
                  <span style={{ fontSize: '0.85rem', fontWeight: 600, color: blue ? '#3B5BDB' : '#374151' }}>{value}</span>
                </div>
              ))}
            </div>

            <p style={{ fontSize: '0.72rem', color: '#CBD1E1', textAlign: 'center', margin: 0 }}>
              如屬緊急情況，可透過 WhatsApp 即時聯繫
            </p>
          </motion.div>
        </>
      )}
    </AnimatePresence>
    </>
  );
}

// ── ProfilePage orchestrator ───────────────────────────

export function initEditData(user: UserData): ProfileEditData {
  return {
    name: user.name,
    gender: user.gender || '',
    birthday: '',
    languages: ['粵語', '普通話', '英語'],
    languageOther: '',
    bio: '',
    education: [],
    workExperience: [],
    certificates: [],
  };
}

export function ProfilePage({
  lang, onLangChange, user, onLogout, isVerified, onStartVerify,
  editData, onEditDataChange,
  forceEditProfile, onForceConsumed, onEditSaved,
  forceWalletTxId, onForceWalletConsumed,
  onSubPageChange,
  onViewJob,
}: ProfilePageProps & { onViewJob?: (jobId: number) => void }) {
  const t = translations[lang];
  const [stack, setStack] = useState<ProfileView[]>(['main']);
  const [deepLinkTxId, setDeepLinkTxId] = useState<number | null>(null);

  const current = stack[stack.length - 1];
  const push = (v: ProfileView) => { setStack((s) => [...s, v]); onSubPageChange?.(true); };
  const pop  = () => {
    setStack((s) => {
      const next = s.length > 1 ? s.slice(0, -1) : s;
      if (next.length === 1) onSubPageChange?.(false);
      return next;
    });
  };

  useEffect(() => {
    if (forceEditProfile) {
      setStack(['main', 'edit-profile']); onSubPageChange?.(true);
      onForceConsumed?.();
    }
  }, [forceEditProfile]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (forceWalletTxId != null) {
      setDeepLinkTxId(forceWalletTxId);
      setStack(['main', 'wallet']); onSubPageChange?.(true);
      onForceWalletConsumed?.();
    }
  }, [forceWalletTxId]); // eslint-disable-line react-hooks/exhaustive-deps

  const titles: Record<ProfileView, string> = {
    main: t.personalCenter,
    settings: t.accountSettings,
    wallet: t.myWallet,
    payout: t.payoutTitle,
    'job-history': t.jobHistoryTitle,
    'edit-profile': '編輯個人資料',
    'resume-preview': '簡歷預覽',
  };

  const isCustomHeader = current === 'edit-profile' || current === 'resume-preview';

  return (
    <div className="size-full flex flex-col overflow-hidden relative" style={{ background: '#F7F8FC' }}>
      {/* Header */}
      {current === 'main' ? (
        <div className="flex items-center px-4 py-4 shrink-0" style={{ background: '#FFFFFF', borderBottom: '1px solid rgba(15,22,35,0.06)' }}>
          <h1 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0F1623', margin: 0 }}>{t.personalCenter}</h1>
        </div>
      ) : !isCustomHeader ? (
        <SubPageHeader title={titles[current]} onBack={pop} />
      ) : null}

      {/* Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={current}
          className="flex-1 flex flex-col overflow-hidden"
          initial={{ opacity: 0, x: current === 'main' ? -16 : 16 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: current === 'main' ? -16 : 16 }}
          transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
        >
          {current === 'main' && (
            <MainProfileView lang={lang} user={user} t={t} editData={editData} onNavigate={push} onLogout={onLogout} onLangChange={onLangChange} isVerified={isVerified} onStartVerify={onStartVerify} />
          )}
          {current === 'settings' && (
            <SettingsView lang={lang} user={user} t={t} />
          )}
          {current === 'wallet' && (
            <WalletView lang={lang} t={t} onPayoutPress={() => push('payout')} initialTxId={deepLinkTxId} />
          )}
          {current === 'payout' && (
            <PayoutView lang={lang} t={t} onBack={pop} />
          )}
          {current === 'job-history' && (
            <JobHistoryView lang={lang} onViewJob={onViewJob} />
          )}
          {current === 'edit-profile' && (
            <EditProfileView
              data={editData}
              onChange={onEditDataChange}
              onBack={pop}
              onPreview={() => push('resume-preview')}
              onSaveComplete={() => { pop(); onEditSaved?.(); }}
            />
          )}
          {current === 'resume-preview' && (
            <ResumePreviewView data={editData} user={user} onBack={pop} />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
