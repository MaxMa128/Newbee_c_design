import { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar, Clock, MapPin, AlertCircle, Check, MessageCircle, X as XIcon } from 'lucide-react';

const CARD_SHADOW = '0 1px 3px rgba(15,22,35,0.06), 0 4px 16px rgba(15,22,35,0.04)';
const CARD_BORDER = '1px solid rgba(15,22,35,0.06)';

type ShiftStatus = 'normal' | 'late' | 'absent' | 'upcoming' | 'off' | 'leave' | 'today';

interface PayrollInfo {
  status: 'confirmed' | 'pending';
  unit: 'hourly' | 'piece';   // 工時 or 件數
  quantity: string;            // e.g. "8小時" or "32件"
  amount: string;              // e.g. "HK$640"
  note?: string;               // merchant's remark, e.g. reason for adjusted hours
}

interface Shift {
  id: number;
  month: number;      // 1-indexed (6 = June)
  day: number;
  dayLabel: string;
  start: string;
  end: string;
  store: string;
  jobTitle: string;
  company: string;
  status: ShiftStatus;
  clockIn?: string | null;
  clockOut?: string | null;
  payroll?: PayrollInfo;       // only on completed shifts
}

const ALL_SHIFTS: Shift[] = [
  // Jun 1–7
  { id: 101, month: 6, day: 2,  dayLabel: '二', start: '10:00', end: '18:00', store: '銅鑼灣時代廣場', jobTitle: '餐飲服務員',  company: '美食集團',         status: 'normal',   clockIn: '09:55', clockOut: '18:02', payroll: { status: 'confirmed', unit: 'hourly', quantity: '8小時',   amount: 'HK$640' } },
  { id: 102, month: 6, day: 3,  dayLabel: '三', start: '10:00', end: '18:00', store: '銅鑼灣時代廣場', jobTitle: '餐飲服務員',  company: '美食集團',         status: 'normal',   clockIn: '10:00', clockOut: '18:05', payroll: { status: 'confirmed', unit: 'hourly', quantity: '8小時',   amount: 'HK$640' } },
  { id: 103, month: 6, day: 5,  dayLabel: '五', start: '10:00', end: '18:00', store: '銅鑼灣時代廣場', jobTitle: '餐飲服務員',  company: '美食集團',         status: 'late',     clockIn: '10:35', clockOut: '18:00', payroll: { status: 'confirmed', unit: 'hourly', quantity: '7.5小時', amount: 'HK$576', note: '員工遲到35分鐘，工時按實際到崗時間計算。' } },
  { id: 104, month: 6, day: 7,  dayLabel: '日', start: '10:00', end: '18:00', store: '銅鑼灣時代廣場', jobTitle: '餐飲服務員',  company: '美食集團',         status: 'normal',   clockIn: '09:58', clockOut: '18:10', payroll: { status: 'confirmed', unit: 'hourly', quantity: '8小時',   amount: 'HK$640' } },
  // Jun 8–14
  { id: 105, month: 6, day: 9,  dayLabel: '二', start: '10:00', end: '18:00', store: '銅鑼灣時代廣場', jobTitle: '餐飲服務員',  company: '美食集團',         status: 'normal',   clockIn: '09:52', clockOut: '18:00', payroll: { status: 'confirmed', unit: 'hourly', quantity: '8小時',   amount: 'HK$640' } },
  { id: 106, month: 6, day: 10, dayLabel: '三', start: '10:00', end: '18:00', store: '銅鑼灣時代廣場', jobTitle: '餐飲服務員',  company: '美食集團',         status: 'absent',   clockIn: null,    clockOut: null },
  { id: 107, month: 6, day: 12, dayLabel: '五', start: '14:00', end: '22:00', store: '灣仔會展中心',   jobTitle: '展覽場地助理', company: 'HK Convention',   status: 'normal',   clockIn: '13:58', clockOut: '22:05', payroll: { status: 'confirmed', unit: 'hourly', quantity: '8小時',   amount: 'HK$720' } },
  { id: 108, month: 6, day: 14, dayLabel: '日', start: '10:00', end: '18:00', store: '銅鑼灣時代廣場', jobTitle: '餐飲服務員',  company: '美食集團',         status: 'leave' },
  // Jun 15–21
  { id: 1,   month: 6, day: 15, dayLabel: '一', start: '10:00', end: '18:00', store: '銅鑼灣時代廣場', jobTitle: '餐飲服務員',  company: '美食集團',         status: 'normal',   clockIn: '09:58', clockOut: '18:03', payroll: { status: 'confirmed', unit: 'hourly', quantity: '8小時',   amount: 'HK$640' } },
  { id: 2,   month: 6, day: 16, dayLabel: '二', start: '10:00', end: '18:00', store: '銅鑼灣時代廣場', jobTitle: '餐飲服務員',  company: '美食集團',         status: 'late',     clockIn: '10:22', clockOut: '18:00', payroll: { status: 'confirmed', unit: 'hourly', quantity: '7小時',   amount: 'HK$560', note: '員工遲到22分鐘，按商戶政策扣除30分鐘並調整工時。' } },
  { id: 3,   month: 6, day: 18, dayLabel: '四', start: '10:00', end: '18:00', store: '銅鑼灣時代廣場', jobTitle: '餐飲服務員',  company: '美食集團',         status: 'absent',   clockIn: null,    clockOut: null },
  { id: 4,   month: 6, day: 19, dayLabel: '五', start: '10:00', end: '18:00', store: '銅鑼灣時代廣場', jobTitle: '餐飲服務員',  company: '美食集團',         status: 'normal',   clockIn: '09:55', clockOut: '18:05', payroll: { status: 'pending',   unit: 'hourly', quantity: '8小時',   amount: 'HK$640' } },
  { id: 5,   month: 6, day: 20, dayLabel: '六', start: '10:00', end: '18:00', store: '銅鑼灣時代廣場', jobTitle: '餐飲服務員',  company: '美食集團',         status: 'today',    clockIn: null,    clockOut: null },
  { id: 51,  month: 6, day: 20, dayLabel: '六', start: '19:00', end: '23:00', store: '灣仔會展中心',   jobTitle: '展覽場地助理', company: 'HK Convention',   status: 'upcoming', clockIn: null,    clockOut: null },
  // Jun 22–28
  { id: 6,   month: 6, day: 22, dayLabel: '一', start: '10:00', end: '18:00', store: '銅鑼灣時代廣場', jobTitle: '餐飲服務員',  company: '美食集團',         status: 'upcoming' },
  { id: 7,   month: 6, day: 23, dayLabel: '二', start: '14:00', end: '22:00', store: '灣仔會展中心',   jobTitle: '展覽場地助理', company: 'HK Convention',   status: 'upcoming' },
  { id: 8,   month: 6, day: 25, dayLabel: '四', start: '10:00', end: '18:00', store: '銅鑼灣時代廣場', jobTitle: '餐飲服務員',  company: '美食集團',         status: 'upcoming' },
  { id: 9,   month: 6, day: 26, dayLabel: '五', start: '10:00', end: '18:00', store: '銅鑼灣時代廣場', jobTitle: '餐飲服務員',  company: '美食集團',         status: 'leave' },
  { id: 10,  month: 6, day: 27, dayLabel: '六', start: '10:00', end: '18:00', store: '銅鑼灣時代廣場', jobTitle: '餐飲服務員',  company: '美食集團',         status: 'upcoming' },
  // Jun 29–Jul 5
  { id: 11,  month: 6, day: 29, dayLabel: '一', start: '10:00', end: '18:00', store: '銅鑼灣時代廣場', jobTitle: '餐飲服務員',  company: '美食集團',         status: 'upcoming' },
  { id: 12,  month: 6, day: 30, dayLabel: '二', start: '10:00', end: '18:00', store: '銅鑼灣時代廣場', jobTitle: '餐飲服務員',  company: '美食集團',         status: 'upcoming' },
  { id: 13,  month: 7, day: 1,  dayLabel: '三', start: '10:00', end: '18:00', store: '銅鑼灣時代廣場', jobTitle: '餐飲服務員',  company: '美食集團',         status: 'upcoming' },
  { id: 14,  month: 7, day: 2,  dayLabel: '四', start: '14:00', end: '22:00', store: '灣仔會展中心',   jobTitle: '展覽場地助理', company: 'HK Convention',   status: 'upcoming' },
  { id: 15,  month: 7, day: 4,  dayLabel: '六', start: '10:00', end: '18:00', store: '銅鑼灣時代廣場', jobTitle: '餐飲服務員',  company: '美食集團',         status: 'upcoming' },
];

const STATUS_CONFIG: Record<string, { label: string; shortLabel: string; bg: string; color: string; dotBg: string }> = {
  normal:   { label: '正常',       shortLabel: '正常', bg: '#DCFCE7', color: '#15803D', dotBg: '#15803D' },
  late:     { label: '遲到/早退',  shortLabel: '遲到', bg: '#FEF3DC', color: '#D4891A', dotBg: '#D4891A' },
  absent:   { label: '缺勤',       shortLabel: '缺勤', bg: '#FEE2E2', color: '#D93025', dotBg: '#D93025' },
  upcoming: { label: '待出勤',     shortLabel: '待',   bg: '#EEF8FF', color: '#3B5BDB', dotBg: '#3B5BDB' },
  today:    { label: '今日',       shortLabel: '今日', bg: '#EEF8FF', color: '#3B5BDB', dotBg: '#3B5BDB' },
  leave:    { label: '休假中',     shortLabel: '假',   bg: '#EEF1F8', color: '#818CF8', dotBg: '#818CF8' },
  none:     { label: '休',         shortLabel: '休',   bg: '#F7F8FC', color: '#CBD1E1', dotBg: '#CBD1E1' },
};

// ── Helpers ───────────────────────────────────────────────
// ── WhatsApp QR Code placeholder ─────────────────────────
function QRCodePlaceholder() {
  const f = '#0F1623';
  return (
    <svg width="128" height="128" viewBox="0 0 100 100" style={{ borderRadius: 8, background: '#FFFFFF', padding: 4, display: 'block' }}>
      {/* TL finder pattern */}
      <rect x="4"  y="4"  width="26" height="26" rx="3" fill={f}/>
      <rect x="8"  y="8"  width="18" height="18" rx="1" fill="#fff"/>
      <rect x="12" y="12" width="10" height="10" rx="1" fill={f}/>
      {/* TR finder pattern */}
      <rect x="70" y="4"  width="26" height="26" rx="3" fill={f}/>
      <rect x="74" y="8"  width="18" height="18" rx="1" fill="#fff"/>
      <rect x="78" y="12" width="10" height="10" rx="1" fill={f}/>
      {/* BL finder pattern */}
      <rect x="4"  y="70" width="26" height="26" rx="3" fill={f}/>
      <rect x="8"  y="74" width="18" height="18" rx="1" fill="#fff"/>
      <rect x="12" y="78" width="10" height="10" rx="1" fill={f}/>
      {/* Timing + data modules */}
      {[36,40,44,48,52,56,60].map((x, i) => i % 2 === 0 && <rect key={x} x={x} y={34} width="4" height="4" fill={f}/>)}
      {[36,40,44,48,52,56,60].map((y, i) => i % 2 === 0 && <rect key={y} x={34} y={y} width="4" height="4" fill={f}/>)}
      {/* BR alignment + data */}
      <rect x="70" y="70" width="10" height="10" rx="1" fill={f}/>
      <rect x="74" y="74" width="2"  height="2"  fill="#fff"/>
      {[
        [36,4],[44,4],[52,4],[60,4],[66,4],
        [40,8],[48,8],[56,8],[66,8],
        [36,12],[44,12],[60,12],[66,12],
        [40,16],[48,16],[56,16],
        [36,20],[44,20],[52,20],[60,20],[66,20],
        [36,26],[48,26],[56,26],[66,26],
        [4,36],[8,36],[16,36],[24,36],[28,36],
        [4,40],[12,40],[20,40],[28,40],
        [4,44],[8,44],[16,44],[24,44],[28,44],
        [4,48],[12,48],[20,48],
        [4,52],[8,52],[16,52],[24,52],[28,52],
        [4,56],[12,56],[20,56],[28,56],
        [4,60],[8,60],[16,60],[24,60],[28,60],
        [36,36],[40,36],[44,36],[48,36],[52,36],[56,36],[60,36],[64,36],[68,36],[72,36],[76,36],[80,36],[84,36],[88,36],[92,36],
        [36,40],[48,40],[56,40],[64,40],[72,40],[80,40],[88,40],
        [36,44],[40,44],[44,44],[52,44],[60,44],[68,44],[76,44],[84,44],[92,44],
        [36,48],[44,48],[52,48],[64,48],[72,48],[80,48],[88,48],
        [36,52],[40,52],[48,52],[56,52],[64,52],[76,52],[84,52],[92,52],
        [36,56],[44,56],[52,56],[60,56],[72,56],[80,56],[88,56],
        [36,60],[40,60],[48,60],[56,60],[64,60],[76,60],[84,60],[92,60],
        [36,64],[44,64],[52,64],[60,64],[68,64],[76,64],[88,64],
        [36,68],[40,68],[48,68],[56,68],[64,68],[80,68],[88,68],[92,68],
        [36,72],[44,72],[52,72],[60,72],[72,72],[80,72],
        [36,76],[48,76],[60,76],[68,76],[84,76],[92,76],
        [36,80],[40,80],[48,80],[56,80],[64,80],[76,80],[88,80],
        [36,84],[44,84],[52,84],[68,84],[80,84],[92,84],
        [36,88],[40,88],[52,88],[60,88],[72,88],[80,88],[88,88],
        [36,92],[48,92],[56,92],[64,92],[76,92],[84,92],[92,92],
      ].map(([x, y], i) => <rect key={i} x={x} y={y} width="4" height="4" fill={f}/>)}
    </svg>
  );
}

// ── Contact / dispute bottom sheet ────────────────────────
function ContactSheet({ onClose }: { onClose: () => void }) {
  return (
    <>
      <div
        className="absolute inset-0 z-40"
        style={{ background: 'rgba(15,22,35,0.45)', backdropFilter: 'blur(2px)' }}
        onClick={onClose}
      />
      <div
        className="absolute left-0 right-0 bottom-0 z-50 rounded-t-2xl px-5 py-6 flex flex-col gap-5"
        style={{ background: '#FFFFFF', boxShadow: '0 -8px 40px rgba(15,22,35,0.15)', maxHeight: '80vh', overflowY: 'auto' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <p style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0F1623', margin: 0 }}>請聯繫商戶或平台客服</p>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
            <XIcon size={18} style={{ color: '#9CA3AF' }} />
          </button>
        </div>

        {/* Merchant contact */}
        <div className="rounded-2xl p-4 flex flex-col gap-2" style={{ background: '#F7F8FC', border: '1px solid rgba(15,22,35,0.07)' }}>
          <p style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0F1623', margin: 0 }}>聯繫商戶</p>
          <p style={{ fontSize: '0.8rem', color: '#6B7A99', margin: 0, lineHeight: 1.6 }}>
            如對工時計算或薪資金額有疑問，請直接聯繫您的商戶管理人員，說明具體問題並索取書面確認。
          </p>
        </div>

        {/* Platform CS */}
        <div className="flex flex-col gap-3">
          <p style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0F1623', margin: 0 }}>NewBee 平台客服</p>

          {/* WhatsApp QR */}
          <div className="rounded-2xl p-4 flex flex-col items-center gap-3" style={{ background: '#F7F8FC', border: '1px solid rgba(15,22,35,0.07)' }}>
            <div style={{ borderRadius: 12, overflow: 'hidden', boxShadow: '0 2px 12px rgba(15,22,35,0.1)' }}>
              <QRCodePlaceholder />
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center rounded-lg" style={{ width: 28, height: 28, background: '#25D366' }}>
                <MessageCircle size={14} style={{ color: '#FFFFFF' }} />
              </div>
              <p style={{ fontSize: '0.8rem', color: '#6B7A99', margin: 0 }}>掃描 QR Code 添加 WhatsApp 客服</p>
            </div>
          </div>

          {/* Email + hours */}
          <div className="rounded-2xl px-4 py-3 flex flex-col gap-2" style={{ background: '#F7F8FC', border: '1px solid rgba(15,22,35,0.07)' }}>
            <div className="flex items-center justify-between">
              <span style={{ fontSize: '0.78rem', color: '#9CA3AF' }}>電郵</span>
              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#3B5BDB' }}>support@newbee.hk</span>
            </div>
            <div style={{ height: 1, background: 'rgba(15,22,35,0.06)' }} />
            <div className="flex items-center justify-between">
              <span style={{ fontSize: '0.78rem', color: '#9CA3AF' }}>服務時間</span>
              <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#374151' }}>週一至週五 09:00–18:00</span>
            </div>
          </div>
        </div>

        <p style={{ fontSize: '0.72rem', color: '#CBD1E1', textAlign: 'center', margin: 0 }}>
          如屬緊急情況，可透過 WhatsApp 即時聯繫
        </p>
      </div>
    </>
  );
}

function withSeq(shifts: Shift[]): Array<Shift & { seqInDay: number }> {
  const counter: Record<string, number> = {};
  return shifts.map((s) => {
    const key = `${s.month}-${s.day}`;
    counter[key] = (counter[key] ?? 0) + 1;
    return { ...s, seqInDay: counter[key] };
  });
}

// Gets 0-indexed day-of-week (Mon=0 … Sun=6) for the 1st of a month
function firstDOW(year: number, month0: number): number {
  const dow = new Date(year, month0, 1).getDay(); // Sun=0
  return (dow + 6) % 7; // Mon=0
}
function daysInMonth(year: number, month0: number): number {
  return new Date(year, month0 + 1, 0).getDate();
}

// ── Unified shift card (month-only view) ──────────────────
function UnifiedShiftCard({ shift, seqInDay, onDayClick, onDispute }: {
  shift: Shift;
  seqInDay: number;
  onDayClick?: (day: number, month: number, dayLabel: string) => void;
  onDispute?: () => void;
}) {
  const cfg = STATUS_CONFIG[shift.status];
  const showClocks = ['normal', 'late', 'absent', 'today'].includes(shift.status);
  const isLate = shift.status === 'late';

  return (
    <div
      className="rounded-2xl p-4 flex flex-col gap-3"
      style={{ background: '#FFFFFF', boxShadow: CARD_SHADOW, border: CARD_BORDER, cursor: onDayClick ? 'pointer' : 'default' }}
      onClick={onDayClick ? () => onDayClick(shift.day, shift.month, shift.dayLabel) : undefined}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <p style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0F1623', margin: 0 }}>
            {shift.month}月{shift.day}日（{shift.dayLabel}）
          </p>
          <span className="rounded-full px-2 py-0.5" style={{ background: '#EEF8FF', color: '#3B5BDB', fontSize: '0.65rem', fontWeight: 700 }}>
            第{seqInDay}班
          </span>
        </div>
        <span className="rounded-full px-2.5 py-0.5" style={{ background: cfg.bg, color: cfg.color, fontSize: '0.7rem', fontWeight: 700 }}>
          {cfg.label}
        </span>
      </div>
      <div className="flex items-center gap-2">
        <div className="flex items-center justify-center rounded-lg shrink-0" style={{ width: 30, height: 30, background: '#EEF8FF' }}>
          <Calendar size={13} style={{ color: '#3B5BDB' }} />
        </div>
        <div>
          <p style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0F1623', margin: 0 }}>{shift.jobTitle}</p>
          <p style={{ fontSize: '0.72rem', color: '#9CA3AF', margin: '1px 0 0 0' }}>{shift.company} · {shift.store}</p>
        </div>
      </div>
      <div style={{ height: 1, background: 'rgba(15,22,35,0.05)' }} />
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5">
          <Clock size={12} style={{ color: '#9CA3AF' }} />
          <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#374151' }}>班次 {shift.start} – {shift.end}</span>
        </div>
        <div className="flex items-center gap-1">
          <MapPin size={11} style={{ color: '#CBD1E1' }} />
          <span style={{ fontSize: '0.72rem', color: '#9CA3AF' }}>{shift.store}</span>
        </div>
      </div>
      {showClocks && (
        <div className="flex gap-2">
          {[
            { label: '上班打卡', time: shift.clockIn,  late: isLate && !!shift.clockIn },
            { label: '下班打卡', time: shift.clockOut, late: false },
          ].map(({ label, time, late }) => (
            <div key={label} className="flex-1 rounded-xl p-2.5 flex flex-col gap-0.5"
              style={{ background: time ? (late ? '#FEF3DC' : '#DCFCE7') : '#F7F8FC', border: `1px solid ${time ? (late ? 'rgba(245,166,35,0.25)' : 'rgba(21,128,61,0.2)') : 'rgba(15,22,35,0.07)'}` }}>
              <span style={{ fontSize: '0.6rem', fontWeight: 700, color: time ? (late ? '#D4891A' : '#15803D') : '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</span>
              <span style={{ fontSize: '0.95rem', fontWeight: 800, color: time ? (late ? '#D4891A' : '#15803D') : '#CBD1E1' }}>{time ?? '--:--'}</span>
              {late && <span style={{ fontSize: '0.6rem', color: '#D4891A', fontWeight: 600 }}>遲到/早退</span>}
            </div>
          ))}
        </div>
      )}
      {shift.status === 'leave' && (
        <div className="flex items-center gap-2 rounded-xl px-3 py-2" style={{ background: '#EEF1F8', border: '1px solid rgba(129,140,248,0.2)' }}>
          <Check size={12} style={{ color: '#818CF8' }} />
          <span style={{ fontSize: '0.76rem', fontWeight: 600, color: '#6B7A99' }}>休假申請已批准</span>
        </div>
      )}
      {(shift.status === 'upcoming' || (shift.status === 'today' && !shift.clockIn)) && (
        <div className="flex items-center gap-2 rounded-xl px-3 py-2" style={{ background: '#EEF8FF', border: '1px solid rgba(59,91,219,0.15)' }}>
          <Clock size={12} style={{ color: '#3B5BDB' }} />
          <span style={{ fontSize: '0.76rem', fontWeight: 600, color: '#3B5BDB' }}>
            {shift.status === 'today' ? '今日班次尚未打卡' : '待出勤'}
          </span>
        </div>
      )}
      {shift.status === 'absent' && (
        <div className="flex items-center gap-2 rounded-xl px-3 py-2" style={{ background: '#FEE2E2', border: '1px solid rgba(217,48,37,0.2)' }}>
          <AlertCircle size={12} style={{ color: '#D93025' }} />
          <span style={{ fontSize: '0.76rem', fontWeight: 600, color: '#D93025' }}>缺勤 — 如需補打卡請前往「考勤打卡」</span>
        </div>
      )}

      {/* ── Payroll section (completed shifts only) ── */}
      {shift.payroll && (
        <>
          <div style={{ height: 1, background: 'rgba(15,22,35,0.05)' }} />
          {shift.payroll.status === 'confirmed' ? (
            <div className="flex flex-col gap-2">
              {/* Header + status badge */}
              <div className="flex items-center justify-between">
                <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.05em' }}>工時 / 薪資確認</span>
                <span className="flex items-center gap-1 rounded-full px-2 py-0.5" style={{ background: '#DCFCE7', fontSize: '0.65rem', fontWeight: 700, color: '#15803D' }}>
                  <Check size={10} style={{ color: '#15803D' }} />商戶確認
                </span>
              </div>
              {/* Figures */}
              <div className="flex gap-2.5">
                <div className="flex-1 rounded-xl px-3 py-2.5 flex flex-col gap-0.5" style={{ background: '#F7F8FC', border: '1px solid rgba(15,22,35,0.07)' }}>
                  <span style={{ fontSize: '0.62rem', fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{shift.payroll.unit === 'hourly' ? '工時' : '件數'}</span>
                  <span style={{ fontSize: '1rem', fontWeight: 800, color: '#0F1623' }}>{shift.payroll.quantity}</span>
                </div>
                <div className="flex-1 rounded-xl px-3 py-2.5 flex flex-col gap-0.5" style={{ background: '#F7F8FC', border: '1px solid rgba(15,22,35,0.07)' }}>
                  <span style={{ fontSize: '0.62rem', fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.05em' }}>確認薪資</span>
                  <span style={{ fontSize: '1rem', fontWeight: 800, color: '#15803D' }}>{shift.payroll.amount}</span>
                </div>
              </div>
              {/* Merchant note / salary remark */}
              {shift.payroll.note && (
                <div className="rounded-xl px-3 py-2.5 flex flex-col gap-0.5" style={{ background: '#FFFBEB', border: '1px solid rgba(245,166,35,0.2)' }}>
                  <span style={{ fontSize: '0.62rem', fontWeight: 700, color: '#D4891A', textTransform: 'uppercase', letterSpacing: '0.05em' }}>薪資說明</span>
                  <span style={{ fontSize: '0.78rem', color: '#92580A', lineHeight: 1.55 }}>{shift.payroll.note}</span>
                </div>
              )}
              {/* Dispute link */}
              {onDispute && (
                <button
                  onClick={(e) => { e.stopPropagation(); onDispute(); }}
                  className="flex items-center justify-center gap-1.5 rounded-xl py-2 transition-all active:scale-[0.97]"
                  style={{ background: 'none', border: '1px solid rgba(15,22,35,0.1)', cursor: 'pointer', width: '100%' }}
                >
                  <span style={{ fontSize: '0.75rem', color: '#6B7A99', fontWeight: 600 }}>對以上工時或薪資有異議？</span>
                </button>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-3 rounded-xl px-4 py-3" style={{ background: '#FFFBEB', border: '1px solid rgba(245,166,35,0.2)' }}>
              <div className="flex flex-col gap-0.5 flex-1">
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#92580A' }}>商戶確認工時和薪資中…</span>
                <span style={{ fontSize: '0.73rem', color: '#D4891A' }}>確認後將以通知告知</span>
              </div>
              <Clock size={16} style={{ color: '#D4891A', flexShrink: 0 }} />
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ── Dynamic month calendar ────────────────────────────────
function MonthCalendar({ year, month0, shifts, selectedDay, onDayClick }: {
  year: number;
  month0: number;           // 0-indexed (0=Jan, 5=June)
  shifts: Shift[];
  selectedDay: { day: number } | null;
  onDayClick: (day: number, dayLabel: string) => void;
}) {
  const DAY_LABELS = ['一', '二', '三', '四', '五', '六', '日'];
  const total = daysInMonth(year, month0);
  const startDOW = firstDOW(year, month0);          // Mon=0
  const shiftMap: Record<number, ShiftStatus> = {};
  shifts.forEach((s) => {
    // For days with multiple shifts, prefer abnormal status
    const existing = shiftMap[s.day];
    const priority: Record<ShiftStatus, number> = { absent: 5, late: 4, today: 3, upcoming: 2, leave: 1, normal: 0, off: -1 };
    if (!existing || (priority[s.status] ?? 0) > (priority[existing] ?? 0)) {
      shiftMap[s.day] = s.status;
    }
  });

  const cells: Array<{ day: number | null; dayLabel: string }> = [];
  for (let i = 0; i < startDOW; i++) cells.push({ day: null, dayLabel: '' });
  for (let d = 1; d <= total; d++) cells.push({ day: d, dayLabel: DAY_LABELS[(startDOW + d - 1) % 7] });
  while (cells.length % 7 !== 0) cells.push({ day: null, dayLabel: '' });

  const isCurrentMonth = year === 2026 && month0 === 5; // June 2026

  return (
    <div className="flex flex-col gap-2">
      <div className="grid" style={{ gridTemplateColumns: 'repeat(7, 1fr)', gap: 2 }}>
        {DAY_LABELS.map((d) => (
          <div key={d} className="flex items-center justify-center" style={{ height: 22 }}>
            <span style={{ fontSize: '0.66rem', fontWeight: 700, color: '#9CA3AF' }}>{d}</span>
          </div>
        ))}
      </div>
      <div className="grid" style={{ gridTemplateColumns: 'repeat(7, 1fr)', gap: 4 }}>
        {cells.map((cell, i) => {
          if (!cell.day) return <div key={i} />;
          const isToday = isCurrentMonth && cell.day === 20;
          const isSelected = selectedDay?.day === cell.day;
          const status = shiftMap[cell.day];
          const cfg = status ? STATUS_CONFIG[status] : null;
          return (
            <button key={i} onClick={() => cell.day && onDayClick(cell.day, cell.dayLabel)}
              className="flex flex-col items-center rounded-xl transition-all active:scale-[0.88]"
              style={{ background: isToday ? '#3B5BDB' : isSelected ? '#EEF8FF' : 'transparent', border: isSelected && !isToday ? '1.5px solid rgba(59,91,219,0.3)' : '1.5px solid transparent', cursor: 'pointer', padding: '4px 0 3px', gap: 1 }}
            >
              <span style={{ fontSize: '0.75rem', fontWeight: isToday ? 800 : isSelected ? 700 : 500, color: isToday ? '#FFFFFF' : isSelected ? '#3B5BDB' : cfg ? '#0F1623' : '#9CA3AF', lineHeight: 1.2 }}>
                {cell.day}
              </span>
              <span style={{ fontSize: '0.46rem', fontWeight: 700, lineHeight: 1, color: isToday ? 'rgba(255,255,255,0.85)' : cfg ? cfg.color : 'transparent', letterSpacing: '-0.01em' }}>
                {cfg ? (isToday ? '今日' : cfg.shortLabel) : '·'}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ── Month summary ─────────────────────────────────────────
function MonthSummary({ label, shifts }: { label: string; shifts: Shift[] }) {
  const required = shifts.filter((s) => s.status !== 'off').length;
  const normal   = shifts.filter((s) => s.status === 'normal').length;
  const late     = shifts.filter((s) => s.status === 'late').length;
  const absent   = shifts.filter((s) => s.status === 'absent').length;
  return (
    <div className="rounded-2xl px-4 py-3 flex flex-col gap-2" style={{ background: '#FFFFFF', boxShadow: CARD_SHADOW, border: CARD_BORDER }}>
      <p style={{ fontSize: '0.72rem', fontWeight: 700, color: '#9CA3AF', margin: 0, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</p>
      <div className="flex justify-around">
        {[
          { l: '需出勤',    v: `${required}天`, c: '#0F1623' },
          { l: '正常',      v: `${normal}天`,   c: '#15803D' },
          { l: '遲到/早退', v: `${late}次`,     c: '#D4891A' },
          { l: '缺勤',      v: `${absent}天`,   c: '#D93025' },
        ].map(({ l, v, c }) => (
          <div key={l} className="flex flex-col items-center gap-0.5">
            <span style={{ fontSize: '0.92rem', fontWeight: 800, color: c }}>{v}</span>
            <span style={{ fontSize: '0.62rem', color: '#9CA3AF' }}>{l}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────
export function ShiftPage() {
  // monthOffset: 0 = June 2026 (base), -1 = May 2026, +1 = July 2026
  const [monthOffset, setMonthOffset] = useState(0);
  const [selectedDay, setSelectedDay] = useState<{ day: number; dayLabel: string } | null>(null);
  const [showContactSheet, setShowContactSheet] = useState(false);

  // Compute displayed year/month
  const BASE = { year: 2026, month0: 5 }; // June 2026
  const totalMonths = BASE.year * 12 + BASE.month0 + monthOffset;
  const displayYear  = Math.floor(totalMonths / 12);
  const displayMonth0 = totalMonths % 12;        // 0-indexed
  const displayMonth1 = displayMonth0 + 1;       // 1-indexed (matches Shift.month)

  const MONTH_NAMES = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'];
  const monthLabel = `${displayYear}年${MONTH_NAMES[displayMonth0]}`;

  // Shifts for the displayed month
  const monthShifts = ALL_SHIFTS.filter((s) => s.month === displayMonth1);

  function handleDayClick(day: number, dayLabel: string) {
    if (selectedDay?.day === day) setSelectedDay(null); // toggle off
    else setSelectedDay({ day, dayLabel });
  }

  // Shifts to show in list: if day selected → filter, else all month
  const rawList = selectedDay
    ? monthShifts.filter((s) => s.day === selectedDay.day)
    : monthShifts.filter((s) => s.status !== 'off');
  const displayList = withSeq(rawList);
  const listTitle = selectedDay
    ? `${displayMonth1}月${selectedDay.day}日（${selectedDay.dayLabel}）的排班`
    : `${MONTH_NAMES[displayMonth0]}排班`;

  return (
    <div className="size-full flex flex-col overflow-hidden" style={{ background: '#F7F8FC' }}>
      {/* Header: title + month navigation */}
      <div className="shrink-0" style={{ background: '#FFFFFF', borderBottom: CARD_BORDER }}>
        {/* Title row */}
        <div className="px-4 pt-4 pb-1" style={{ paddingRight: 104 }}>
          <h1 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0F1623', margin: 0, letterSpacing: '-0.02em' }}>我的排班</h1>
        </div>
        {/* Month navigator — centered */}
        <div className="flex items-center justify-center gap-3 pb-3 px-4">
          <button
            onClick={() => { setMonthOffset((p) => p - 1); setSelectedDay(null); }}
            disabled={monthOffset <= -6}
            className="flex items-center justify-center rounded-xl transition-all"
            style={{ width: 32, height: 32, background: '#EEF1F8', border: CARD_BORDER, cursor: monthOffset <= -6 ? 'not-allowed' : 'pointer', opacity: monthOffset <= -6 ? 0.4 : 1 }}
          >
            <ChevronLeft size={15} style={{ color: '#6B7A99' }} />
          </button>
          <p style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0F1623', margin: 0, minWidth: 96, textAlign: 'center' }}>{monthLabel}</p>
          <button
            onClick={() => { setMonthOffset((p) => p + 1); setSelectedDay(null); }}
            disabled={monthOffset >= 6}
            className="flex items-center justify-center rounded-xl transition-all"
            style={{ width: 32, height: 32, background: '#EEF1F8', border: CARD_BORDER, cursor: monthOffset >= 6 ? 'not-allowed' : 'pointer', opacity: monthOffset >= 6 ? 0.4 : 1 }}
          >
            <ChevronRight size={15} style={{ color: '#6B7A99' }} />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-4" style={{ scrollbarWidth: 'none' }}>

        {/* Status legend */}
        <div className="flex items-center gap-3 flex-wrap">
          {[{ color: '#15803D', label: '正常' }, { color: '#D4891A', label: '遲到' }, { color: '#D93025', label: '缺勤' }, { color: '#3B5BDB', label: '待/今日' }, { color: '#818CF8', label: '假' }].map(({ color, label }) => (
            <span key={label} style={{ fontSize: '0.65rem', fontWeight: 700, color }}>{label}</span>
          ))}
        </div>

        {/* Month calendar */}
        <div className="rounded-2xl p-4" style={{ background: '#FFFFFF', boxShadow: CARD_SHADOW, border: CARD_BORDER }}>
          <MonthCalendar
            year={displayYear}
            month0={displayMonth0}
            shifts={monthShifts}
            selectedDay={selectedDay}
            onDayClick={handleDayClick}
          />
        </div>

        {/* Monthly summary */}
        <MonthSummary label="本月總結" shifts={monthShifts} />

        {/* Shift list */}
        <div className="flex flex-col gap-3">
          <h3 style={{ fontSize: '0.8rem', fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.08em', margin: 0 }}>
            {listTitle}
          </h3>
          {displayList.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-8">
              <div className="flex items-center justify-center rounded-2xl" style={{ width: 52, height: 52, background: '#EEF1F8' }}>
                <Calendar size={22} style={{ color: '#CBD1E1' }} />
              </div>
              <p style={{ fontSize: '0.86rem', color: '#9CA3AF', fontWeight: 600, margin: 0 }}>
                {selectedDay ? '此日無排班' : '本月暫無排班'}
              </p>
            </div>
          ) : (
            displayList.map((s) => (
              <UnifiedShiftCard
                key={s.id}
                shift={s}
                seqInDay={s.seqInDay}
                onDayClick={selectedDay ? undefined : (d, m, dl) => handleDayClick(d, dl)}
                onDispute={s.payroll?.status === 'confirmed' ? () => setShowContactSheet(true) : undefined}
              />
            ))
          )}
        </div>

        <div style={{ height: 16 }} />
      </div>

      {/* Contact / dispute sheet */}
      {showContactSheet && (
        <div className="absolute inset-0 z-50">
          <ContactSheet onClose={() => setShowContactSheet(false)} />
        </div>
      )}
    </div>
  );
}
