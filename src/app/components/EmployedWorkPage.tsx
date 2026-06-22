import { useState, useEffect } from 'react';
import { Camera, MapPin, CheckCircle2, Clock, AlertCircle, FileText, Calendar, ChevronRight, ChevronLeft, X as XIcon, Check, ChevronDown, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const CARD_SHADOW = '0 1px 3px rgba(15,22,35,0.06), 0 4px 16px rgba(15,22,35,0.04)';
const CARD_BORDER = '1px solid rgba(15,22,35,0.06)';

const TODAY_JOBS = [
  { id: 1, title: '餐飲服務員', company: '美食集團', store: '銅鑼灣時代廣場', logo: '美', logoColor: '#E5A00D', start: '10:00', end: '18:00' },
  { id: 2, title: '展覽場地助理', company: 'HK Convention & Exhibition', store: '灣仔會展中心', logo: 'H', logoColor: '#0F1623', start: '19:00', end: '23:00' },
];

type DayStatus = 'normal' | 'late' | 'absent' | 'off' | 'today' | 'upcoming' | 'leave';

interface WeekDay {
  dayLabel: string;
  dateNum: number;
  status: DayStatus;
  clockIn?: string | null;
  clockOut?: string | null;
  hasShift: boolean;
  scheduledStart?: string;
  scheduledEnd?: string;
}

const WEEK_DAYS: WeekDay[] = [
  { dayLabel: '一', dateNum: 15, status: 'normal', clockIn: '09:58', clockOut: '18:03', hasShift: true,  scheduledStart: '10:00', scheduledEnd: '18:00' },
  { dayLabel: '二', dateNum: 16, status: 'late',   clockIn: '10:22', clockOut: '18:00', hasShift: true,  scheduledStart: '10:00', scheduledEnd: '18:00' },
  { dayLabel: '三', dateNum: 17, status: 'off',    hasShift: false },
  { dayLabel: '四', dateNum: 18, status: 'absent', clockIn: null,    clockOut: null,    hasShift: true,  scheduledStart: '10:00', scheduledEnd: '18:00' },
  { dayLabel: '五', dateNum: 19, status: 'normal', clockIn: '09:55', clockOut: '18:05', hasShift: true,  scheduledStart: '10:00', scheduledEnd: '18:00' },
  { dayLabel: '六', dateNum: 20, status: 'today',  clockIn: null,    clockOut: null,    hasShift: true,  scheduledStart: '10:00', scheduledEnd: '18:00' },
  { dayLabel: '日', dateNum: 21, status: 'off',    hasShift: false },
];

const DAY_STATUS_CONFIG: Record<DayStatus, { label: string; bg: string; color: string }> = {
  normal:   { label: '正常', bg: '#DCFCE7', color: '#15803D' },
  late:     { label: '遲到/早退', bg: '#FEF3DC', color: '#D4891A' },
  absent:   { label: '缺勤', bg: '#FEE2E2', color: '#D93025' },
  off:      { label: '休',   bg: '#EEF1F8', color: '#6B7A99' },
  today:    { label: '今日', bg: '#EEF8FF', color: '#3B5BDB' },
  upcoming: { label: '待',   bg: '#EEF1F8', color: '#9CA3AF' },
  leave:    { label: '假',   bg: '#EEF1F8', color: '#818CF8' },
};

// Detailed shift data for the week — supports multiple shifts per day and job info
interface WeekShift {
  id: number;
  dateNum: number;
  dayLabel: string;
  seqInDay: number;
  status: DayStatus;
  clockIn: string | null;
  clockOut: string | null;
  scheduledStart: string;
  scheduledEnd: string;
  jobTitle: string;
  company: string;
  store: string;
}

const WEEK_SHIFTS: WeekShift[] = [
  { id: 1, dateNum: 15, dayLabel: '一', seqInDay: 1, status: 'normal', clockIn: '09:58', clockOut: '18:03', scheduledStart: '10:00', scheduledEnd: '18:00', jobTitle: '餐飲服務員', company: '美食集團', store: '銅鑼灣時代廣場' },
  { id: 2, dateNum: 16, dayLabel: '二', seqInDay: 1, status: 'late',   clockIn: '10:22', clockOut: '18:00', scheduledStart: '10:00', scheduledEnd: '18:00', jobTitle: '餐飲服務員', company: '美食集團', store: '銅鑼灣時代廣場' },
  { id: 3, dateNum: 18, dayLabel: '四', seqInDay: 1, status: 'absent', clockIn: null,    clockOut: null,    scheduledStart: '10:00', scheduledEnd: '18:00', jobTitle: '餐飲服務員', company: '美食集團', store: '銅鑼灣時代廣場' },
  { id: 4, dateNum: 19, dayLabel: '五', seqInDay: 1, status: 'normal', clockIn: '09:55', clockOut: '18:05', scheduledStart: '10:00', scheduledEnd: '18:00', jobTitle: '餐飲服務員', company: '美食集團', store: '銅鑼灣時代廣場' },
  { id: 5, dateNum: 20, dayLabel: '六', seqInDay: 1, status: 'today',  clockIn: null,    clockOut: null,    scheduledStart: '10:00', scheduledEnd: '18:00', jobTitle: '餐飲服務員', company: '美食集團', store: '銅鑼灣時代廣場' },
  { id: 6, dateNum: 20, dayLabel: '六', seqInDay: 2, status: 'upcoming', clockIn: null,  clockOut: null,    scheduledStart: '19:00', scheduledEnd: '23:00', jobTitle: '展覽場地助理', company: 'HK Convention', store: '灣仔會展中心' },
];

const SUPPLEMENT_RECORDS = [
  { id: 1, date: '6月10日（三）', reason: '手機沒電，忘記打卡',     status: 'approved' as const, at: '6月10日 20:15' },
  { id: 2, date: '6月3日（二）',  reason: '遲到/早退，交通意外延誤',      status: 'rejected' as const, at: '6月3日 19:30'  },
];

const LEAVE_HISTORY = [
  { id: 1, dateRange: '6月26日（五）',  reason: '家庭事務',  status: 'pending'  as const, at: '6月20日' },
  { id: 2, dateRange: '6月14日（日）',  reason: '私人事務',  status: 'approved' as const, at: '6月12日' },
  { id: 3, dateRange: '5月30日（六）',  reason: '身體不適',  status: 'rejected' as const, at: '5月28日' },
];

const OT_HISTORY = [
  { id: 1, date: '6月15日（一）', time: '18:00 – 21:00', reason: '業務需要',   status: 'approved' as const, at: '6月15日' },
  { id: 2, date: '6月8日（一）',  time: '18:00 – 19:30', reason: '交接工作',   status: 'pending'  as const, at: '6月8日'  },
];

const RECORD_STATUS = {
  approved: { label: '已通過', bg: '#DCFCE7', color: '#15803D' },
  rejected: { label: '已拒絕', bg: '#FEE2E2', color: '#D93025' },
  pending:  { label: '審核中', bg: '#FEF3DC', color: '#D4891A' },
};

type ClockState = 'idle' | 'in' | 'out';
type AttendanceView = 'main' | 'leave' | 'overtime';
type Sheet =
  | null
  | 'shift-select'
  | 'abnormal-list'
  | 'supplement-form'
  | 'supplement-done'
  | 'camera'
  | 'day-record';

function useLiveClock() {
  const [now, setNow] = useState(new Date());
  useEffect(() => { const id = setInterval(() => setNow(new Date()), 1000); return () => clearInterval(id); }, []);
  return now;
}
function pad(n: number) { return String(n).padStart(2, '0'); }

// ── Reusable record list ──────────────────────────────────
function SupplementRecordList() {
  return (
    <div className="flex flex-col gap-2">
      <p style={{ fontSize: '0.78rem', fontWeight: 700, color: '#9CA3AF', margin: 0, textTransform: 'uppercase', letterSpacing: '0.06em' }}>補打卡申請記錄</p>
      {SUPPLEMENT_RECORDS.map((r) => {
        const s = RECORD_STATUS[r.status];
        return (
          <div key={r.id} className="rounded-xl px-3.5 py-3 flex items-start gap-3" style={{ background: '#F7F8FC', border: CARD_BORDER }}>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <p style={{ fontSize: '0.82rem', fontWeight: 700, color: '#0F1623', margin: 0 }}>{r.date}</p>
                <span className="rounded-full px-2 py-0.5" style={{ background: s.bg, color: s.color, fontSize: '0.65rem', fontWeight: 700 }}>{s.label}</span>
              </div>
              <p style={{ fontSize: '0.73rem', color: '#9CA3AF', margin: 0 }}>{r.reason}</p>
            </div>
            <p style={{ fontSize: '0.65rem', color: '#CBD1E1', margin: 0, flexShrink: 0 }}>{r.at}</p>
          </div>
        );
      })}
    </div>
  );
}

function LeaveRecordList() {
  return (
    <div className="flex flex-col gap-2">
      <p style={{ fontSize: '0.78rem', fontWeight: 700, color: '#9CA3AF', margin: 0, textTransform: 'uppercase', letterSpacing: '0.06em' }}>請假申請記錄</p>
      {LEAVE_RECORDS.map((r) => {
        const s = RECORD_STATUS[r.status];
        return (
          <div key={r.id} className="rounded-xl px-3.5 py-3 flex items-start gap-3" style={{ background: '#F7F8FC', border: CARD_BORDER }}>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <p style={{ fontSize: '0.82rem', fontWeight: 700, color: '#0F1623', margin: 0 }}>{r.dateRange}</p>
                <span className="rounded-full px-2 py-0.5" style={{ background: s.bg, color: s.color, fontSize: '0.65rem', fontWeight: 700 }}>{s.label}</span>
              </div>
              <p style={{ fontSize: '0.73rem', color: '#9CA3AF', margin: 0 }}>{r.reason}</p>
            </div>
            <p style={{ fontSize: '0.65rem', color: '#CBD1E1', margin: 0, flexShrink: 0 }}>{r.at}</p>
          </div>
        );
      })}
    </div>
  );
}

// ── Sheet backdrop + slide-up wrapper ─────────────────────
// ── Day shift card (week attendance detail) ───────────────
// Same field layout as UnifiedShiftCard in ShiftPage, plus inline actions for abnormal shifts
function DayShiftCard({ shift, onConfirm, onSupplement }: {
  shift: WeekShift;
  onConfirm: (s: WeekShift) => void;
  onSupplement: (s: WeekShift) => void;
}) {
  const cfg = DAY_STATUS_CONFIG[shift.status];
  const showClocks = ['normal', 'late', 'absent', 'today'].includes(shift.status);
  const isLate = shift.status === 'late';
  const isAbnormal = shift.status === 'late' || shift.status === 'absent';

  return (
    <div className="rounded-2xl p-4 flex flex-col gap-3" style={{ background: '#FFFFFF', boxShadow: CARD_SHADOW, border: isAbnormal ? `1.5px solid ${cfg.color}30` : CARD_BORDER }}>
      {/* Date · Sequence · Status */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <p style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0F1623', margin: 0 }}>
            6月{shift.dateNum}日（週{shift.dayLabel}）
          </p>
          <span className="rounded-full px-2 py-0.5" style={{ background: '#EEF8FF', color: '#3B5BDB', fontSize: '0.65rem', fontWeight: 700 }}>
            第{shift.seqInDay}班
          </span>
        </div>
        <span className="rounded-full px-2.5 py-0.5" style={{ background: cfg.bg, color: cfg.color, fontSize: '0.7rem', fontWeight: 700 }}>
          {cfg.label}
        </span>
      </div>

      {/* Job / Company */}
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

      {/* Scheduled time */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5">
          <Clock size={12} style={{ color: '#9CA3AF' }} />
          <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#374151' }}>班次 {shift.scheduledStart} – {shift.scheduledEnd}</span>
        </div>
      </div>

      {/* Clock times */}
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

      {/* Upcoming / today notice */}
      {(shift.status === 'upcoming' || (shift.status === 'today' && !shift.clockIn)) && (
        <div className="flex items-center gap-2 rounded-xl px-3 py-2" style={{ background: '#EEF8FF', border: '1px solid rgba(59,91,219,0.15)' }}>
          <Clock size={12} style={{ color: '#3B5BDB' }} />
          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#3B5BDB' }}>
            {shift.status === 'today' ? '今日班次尚未打卡' : '待出勤'}
          </span>
        </div>
      )}

      {/* Inline actions for abnormal shifts */}
      {isAbnormal && (
        <div className="flex gap-2 pt-1">
          <button onClick={() => onConfirm(shift)}
            className="flex-1 rounded-xl py-2.5 transition-all active:scale-[0.97]"
            style={{ background: '#EEF1F8', border: 'none', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 700, color: '#6B7A99' }}>
            確認{isLate ? '遲到/早退' : '缺勤'}
          </button>
          <button onClick={() => onSupplement(shift)}
            className="flex-1 rounded-xl py-2.5 transition-all active:scale-[0.97]"
            style={{ background: '#F5A623', border: 'none', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 700, color: '#0F1623' }}>
            申請補打卡
          </button>
        </div>
      )}
    </div>
  );
}

function SheetOverlay({ onClose, children, zIndex = 50 }: { onClose: () => void; children: React.ReactNode; zIndex?: number }) {
  return (
    <>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="absolute inset-0" style={{ background: 'rgba(15,22,35,0.45)', backdropFilter: 'blur(2px)', zIndex: zIndex - 1 }}
        onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, y: 60 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 60 }}
        transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
        className="absolute left-0 right-0 bottom-0 rounded-t-2xl px-5 py-6 flex flex-col gap-4"
        style={{ background: '#FFFFFF', boxShadow: '0 -8px 40px rgba(15,22,35,0.15)', zIndex, maxHeight: '85vh', overflowY: 'auto' }}
      >
        {children}
      </motion.div>
    </>
  );
}

// ── Main component ────────────────────────────────────────
export function EmployedWorkPage() {
  const now = useLiveClock();
  const timeStr = `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;

  const [jobIdx, setJobIdx] = useState(0);
  const [clockState, setClockState] = useState<ClockState>('idle');
  const [clockInTime, setClockInTime] = useState<string | null>(null);
  const [clockOutTime, setClockOutTime] = useState<string | null>(null);

  const [sheet, setSheet] = useState<Sheet>(null);
  const [cameraFor, setCameraFor] = useState<'in' | 'out' | 'supplement'>('in');
  const [cameraStep, setCameraStep] = useState<'capturing' | 'flash' | 'done'>('capturing');
  const [locationOk, setLocationOk] = useState(false);

  const [supplementTargetDay, setSupplementTargetDay] = useState<WeekDay | null>(null);
  const [dayRecordTarget, setDayRecordTarget] = useState<WeekDay | null>(null);
  const [selectedWeekDateNum, setSelectedWeekDateNum] = useState<number | null>(null);
  const [supplementShiftTarget, setSupplementShiftTarget] = useState<WeekShift | null>(null);
  // Form-based supplement (no camera)
  const [supplementStartTime, setSupplementStartTime] = useState('');
  const [supplementEndTime, setSupplementEndTime] = useState('');
  const [supplementReason, setSupplementReason] = useState('');
  const [supplementPhotoName, setSupplementPhotoName] = useState<string | null>(null);
  // Sub-page navigation (leave / overtime full-page views)
  const [attendanceView, setAttendanceView] = useState<AttendanceView>('main');
  // Leave form
  const [leaveStartDate, setLeaveStartDate] = useState('');
  const [leaveEndDate, setLeaveEndDate] = useState('');
  const [leaveReason, setLeaveReason] = useState('');
  const [leavePhotoName, setLeavePhotoName] = useState<string | null>(null);
  const [leaveSubmitted, setLeaveSubmitted] = useState(false);
  // Overtime form
  const [otDate, setOtDate] = useState('');
  const [otStart, setOtStart] = useState('');
  const [otEnd, setOtEnd] = useState('');
  const [otReason, setOtReason] = useState('');
  const [otPhotoName, setOtPhotoName] = useState<string | null>(null);
  const [otSubmitted, setOtSubmitted] = useState(false);

  const currentJob = TODAY_JOBS[jobIdx];
  const hasMultipleJobs = TODAY_JOBS.length > 1;
  const abnormals = WEEK_DAYS.filter((d) => d.status === 'late' || d.status === 'absent');

  function openCamera(purpose: 'in' | 'out' | 'supplement') {
    setCameraFor(purpose);
    setCameraStep('capturing');
    setLocationOk(false);
    setSheet('camera');
    setTimeout(() => setLocationOk(true), 1200);
  }

  function handleCapture() {
    setCameraStep('flash');
    setTimeout(() => {
      setCameraStep('done');
      setTimeout(() => {
        if (cameraFor === 'in') { setClockState('in'); setClockInTime(`${pad(now.getHours())}:${pad(now.getMinutes())}`); }
        else { setClockState('out'); setClockOutTime(`${pad(now.getHours())}:${pad(now.getMinutes())}`); }
        setSheet(null);
      }, 800);
    }, 300);
  }

  function handleClockButton() {
    if (clockState === 'idle') openCamera('in');
    else if (clockState === 'in') openCamera('out');
  }

  // Week day circle click — toggles inline shift detail below the strip
  function handleWeekDayClick(day: WeekDay) {
    if (!day.hasShift) return;
    setSelectedWeekDateNum((prev) => prev === day.dateNum ? null : day.dateNum);
  }

  // Actions from inline DayShiftCard
  function handleShiftConfirm(_shift: WeekShift) {
    // User confirms the abnormal status — just collapse the inline view
    setSelectedWeekDateNum(null);
  }

  function handleShiftSupplement(shift: WeekShift) {
    setSupplementShiftTarget(shift);
    setSupplementTargetDay(WEEK_DAYS.find((d) => d.dateNum === shift.dateNum) ?? null);
    setSupplementStartTime(shift.scheduledStart);
    setSupplementEndTime(shift.scheduledEnd);
    setSupplementReason('');
    setSupplementPhotoName(null);
    setSheet('supplement-form');
  }

  function openAbnormalList() { setSheet('abnormal-list'); }

  function submitSupplement() {
    if (!supplementStartTime || !supplementEndTime || !supplementReason.trim()) return;
    setSupplementStartTime(''); setSupplementEndTime('');
    setSupplementReason(''); setSupplementPhotoName(null);
    setSheet('supplement-done');
  }

  function handleLeaveSubmit() {
    if (!leaveStartDate || !leaveReason.trim()) return;
    setLeaveSubmitted(true);
  }

  function handleOtSubmit() {
    if (!otDate || !otStart || !otEnd || !otReason.trim()) return;
    setOtSubmitted(true);
  }

  function openLeave() {
    setLeaveStartDate(''); setLeaveEndDate(''); setLeaveReason(''); setLeavePhotoName(null); setLeaveSubmitted(false);
    setAttendanceView('leave');
  }

  function openOvertime() {
    setOtDate(''); setOtStart(''); setOtEnd(''); setOtReason(''); setOtPhotoName(null); setOtSubmitted(false);
    setAttendanceView('overtime');
  }

  const btnCfg = {
    idle: { label: '上班打卡', bg: '#3B5BDB', icon: <Camera size={30} style={{ color: '#FFFFFF' }} /> },
    in:   { label: '下班打卡', bg: '#15803D', icon: <Camera size={30} style={{ color: '#FFFFFF' }} /> },
    out:  { label: '已完成',   bg: '#EEF1F8', icon: <CheckCircle2 size={30} style={{ color: '#9CA3AF' }} /> },
  }[clockState];

  return (
    <div className="size-full flex flex-col overflow-hidden" style={{ background: '#F7F8FC' }}>
      {/* Header */}
      <div className="shrink-0 px-4 pt-4 pb-3" style={{ background: '#FFFFFF', borderBottom: CARD_BORDER, paddingRight: 104 }}>
        <h1 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0F1623', margin: 0, letterSpacing: '-0.02em' }}>考勤打卡</h1>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-4" style={{ scrollbarWidth: 'none' }}>

        {/* Abnormal banner — collapsible strip above shift card */}
        {abnormals.length > 0 && (
          <button
            onClick={openAbnormalList}
            className="w-full flex items-center justify-between rounded-xl px-4 py-2.5 transition-all active:scale-[0.99]"
            style={{ background: '#FFFBEB', border: '1px solid rgba(245,166,35,0.28)', cursor: 'pointer' }}
          >
            <div className="flex items-center gap-2">
              <AlertCircle size={14} style={{ color: '#D4891A' }} />
              <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#92580A' }}>
                本週有 {abnormals.length} 天考勤異常
              </span>
            </div>
            <span style={{ fontSize: '0.75rem', color: '#D4891A', fontWeight: 600 }}>查看並處理 ›</span>
          </button>
        )}

        {/* Today shift card — compact, no logo */}
        <div className="rounded-2xl px-4 py-3 flex flex-col gap-2.5" style={{ background: '#FFFFFF', boxShadow: CARD_SHADOW, border: CARD_BORDER }}>
          {/* Title row */}
          <div className="flex items-center justify-between">
            <div>
              <p style={{ fontSize: '0.92rem', fontWeight: 700, color: '#0F1623', margin: 0 }}>{currentJob.title}</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <Clock size={11} style={{ color: '#9CA3AF' }} />
                <span style={{ fontSize: '0.75rem', color: '#6B7A99', fontWeight: 600 }}>{currentJob.start} – {currentJob.end}</span>
                <span style={{ fontSize: '0.68rem', color: '#CBD1E1' }}>·</span>
                <span style={{ fontSize: '0.75rem', color: '#9CA3AF' }}>{currentJob.store}</span>
              </div>
            </div>
            {hasMultipleJobs && (
              <button onClick={() => setSheet('shift-select')} className="flex items-center gap-1 rounded-lg px-2.5 py-1.5" style={{ background: '#EEF8FF', border: '1px solid rgba(59,91,219,0.15)', cursor: 'pointer' }}>
                <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#3B5BDB' }}>切換班次</span>
                <ChevronDown size={10} style={{ color: '#3B5BDB' }} />
              </button>
            )}
          </div>
          {/* Compact clock row */}
          <div className="flex items-center gap-2 rounded-xl px-3 py-2" style={{ background: '#F7F8FC', border: CARD_BORDER }}>
            <span style={{ fontSize: '0.72rem', color: '#9CA3AF', fontWeight: 600 }}>上班</span>
            <span style={{ fontSize: '0.85rem', fontWeight: 800, color: clockInTime ? '#15803D' : '#CBD1E1' }}>{clockInTime ?? '--:--'}</span>
            <span style={{ flex: 1, textAlign: 'center', fontSize: '0.65rem', color: '#D1D5DB' }}>·</span>
            <span style={{ fontSize: '0.72rem', color: '#9CA3AF', fontWeight: 600 }}>下班</span>
            <span style={{ fontSize: '0.85rem', fontWeight: 800, color: clockOutTime ? '#15803D' : '#CBD1E1' }}>{clockOutTime ?? '--:--'}</span>
          </div>
        </div>

        {/* Clock button */}
        <div className="flex flex-col items-center gap-3 py-1">
          <p style={{ fontSize: '1.85rem', fontWeight: 800, color: '#0F1623', letterSpacing: '-0.03em', margin: 0, fontVariantNumeric: 'tabular-nums' }}>{timeStr}</p>
          {clockState !== 'out' ? (
            <motion.button onClick={handleClockButton} whileTap={{ scale: 0.93 }} className="flex flex-col items-center gap-2" style={{ border: 'none', background: 'none', cursor: 'pointer' }}>
              <div className="flex items-center justify-center rounded-full" style={{ width: 84, height: 84, background: btnCfg.bg, boxShadow: `0 8px 28px ${btnCfg.bg}50` }}>
                {btnCfg.icon}
              </div>
              <span style={{ fontSize: '0.88rem', fontWeight: 700, color: '#0F1623' }}>{btnCfg.label}</span>
            </motion.button>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <div className="flex items-center justify-center rounded-full" style={{ width: 84, height: 84, background: '#EEF1F8' }}>
                <CheckCircle2 size={34} style={{ color: '#9CA3AF' }} />
              </div>
              <div className="flex items-center gap-1.5 rounded-full px-3 py-1.5" style={{ background: '#DCFCE7' }}>
                <Check size={12} style={{ color: '#15803D' }} />
                <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#15803D' }}>今日考勤完成</span>
              </div>
            </div>
          )}
          <div className="flex items-center gap-1.5">
            <MapPin size={11} style={{ color: '#9CA3AF' }} />
            <span style={{ fontSize: '0.7rem', color: '#9CA3AF' }}>{currentJob.store} · 範圍內</span>
          </div>
        </div>

        {/* ── 本週考勤 section ── */}
        <div className="flex flex-col gap-3">
          <h3 style={{ fontSize: '0.8rem', fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.08em', margin: 0 }}>本週考勤</h3>
          <div className="rounded-2xl p-4 flex flex-col gap-3" style={{ background: '#FFFFFF', boxShadow: CARD_SHADOW, border: CARD_BORDER }}>
            {/* Color legend */}
            <div className="flex items-center gap-3 flex-wrap">
              {[
                { color: '#15803D', label: '正常' },
                { color: '#D4891A', label: '遲到/早退' },
                { color: '#D93025', label: '缺勤' },
                { color: '#3B5BDB', label: '今日/待出勤' },
                { color: '#CBD1E1', label: '休' },
              ].map(({ color, label }) => (
                <div key={label} className="flex items-center gap-1">
                  <div className="rounded-full shrink-0" style={{ width: 6, height: 6, background: color }} />
                  <span style={{ fontSize: '0.62rem', color: '#9CA3AF' }}>{label}</span>
                </div>
              ))}
            </div>
            {/* Day circles — clickable, dot below */}
            <div className="flex justify-between">
              {WEEK_DAYS.map((d) => {
                const cfg = DAY_STATUS_CONFIG[d.status];
                const isToday = d.status === 'today';
                const isClickable = d.hasShift && (d.status === 'normal' || d.status === 'late' || d.status === 'absent');
                const dotColor = isToday ? '#3B5BDB'
                  : d.status === 'normal' ? '#15803D'
                  : d.status === 'late'   ? '#D4891A'
                  : d.status === 'absent' ? '#D93025'
                  : d.hasShift            ? '#3B5BDB'
                  : '#CBD1E1';
                return (
                  <button
                    key={d.dateNum}
                    onClick={() => handleWeekDayClick(d)}
                    disabled={!isClickable}
                    className="flex flex-col items-center gap-1 transition-all"
                    style={{ flex: 1, background: 'none', border: 'none', cursor: isClickable ? 'pointer' : 'default', padding: '2px 0' }}
                  >
                    <span style={{ fontSize: '0.66rem', fontWeight: 600, color: isToday ? '#3B5BDB' : '#9CA3AF' }}>{d.dayLabel}</span>
                    <motion.div
                      className="flex items-center justify-center rounded-full"
                      whileTap={isClickable ? { scale: 0.88 } : {}}
                      style={{ width: 30, height: 30, background: isToday ? '#3B5BDB' : '#F7F8FC', border: `1.5px solid ${isToday ? '#3B5BDB' : 'rgba(15,22,35,0.08)'}` }}
                    >
                      <span style={{ fontSize: '0.78rem', fontWeight: 700, color: isToday ? '#FFFFFF' : '#374151' }}>{d.dateNum}</span>
                    </motion.div>
                    {/* Colored dot below */}
                    <div className="rounded-full" style={{ width: 5, height: 5, background: d.hasShift ? dotColor : 'transparent' }} />
                  </button>
                );
              })}
            </div>
            <p style={{ fontSize: '0.68rem', color: '#9CA3AF', margin: 0, textAlign: 'center' }}>點擊日期查看當天排班</p>
            <div style={{ height: 1, background: 'rgba(15,22,35,0.05)' }} />
            {/* Weekly stats — derived from WEEK_DAYS mock data */}
            {(() => {
              const required = WEEK_DAYS.filter((d) => d.hasShift).length;
              const normal   = WEEK_DAYS.filter((d) => d.status === 'normal').length;
              const late     = WEEK_DAYS.filter((d) => d.status === 'late').length;
              const absent   = WEEK_DAYS.filter((d) => d.status === 'absent').length;
              return (
                <div className="flex justify-around">
                  {[
                    { label: '需出勤', value: `${required}天`, color: '#0F1623' },
                    { label: '正常',   value: `${normal}天`,   color: '#15803D' },
                    { label: '遲到/早退', value: `${late}次`, color: '#D4891A' },
                    { label: '缺勤',   value: `${absent}天`,   color: '#D93025' },
                  ].map(({ label, value, color }) => (
                    <div key={label} className="flex flex-col items-center gap-0.5">
                      <span style={{ fontSize: '0.95rem', fontWeight: 800, color }}>{value}</span>
                      <span style={{ fontSize: '0.63rem', color: '#9CA3AF' }}>{label}</span>
                    </div>
                  ))}
                </div>
              );
            })()}
          </div>
        </div>

        {/* ── Inline day shift detail (shown when a week circle is clicked) ── */}
        {selectedWeekDateNum !== null && (() => {
          const dayShifts = WEEK_SHIFTS.filter((s) => s.dateNum === selectedWeekDateNum);
          const day = WEEK_DAYS.find((d) => d.dateNum === selectedWeekDateNum);
          return (
            <motion.div
              key={selectedWeekDateNum}
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col gap-3"
            >
              <div className="flex items-center justify-between">
                <h3 style={{ fontSize: '0.8rem', fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.08em', margin: 0 }}>
                  6月{selectedWeekDateNum}日（週{day?.dayLabel}）的排班
                </h3>
                <button onClick={() => setSelectedWeekDateNum(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
                  <XIcon size={15} style={{ color: '#CBD1E1' }} />
                </button>
              </div>
              {dayShifts.length === 0 ? (
                <div className="flex items-center gap-2 rounded-2xl px-4 py-3" style={{ background: '#F7F8FC', border: CARD_BORDER }}>
                  <span style={{ fontSize: '0.85rem', color: '#9CA3AF' }}>此日無排班記錄</span>
                </div>
              ) : (
                dayShifts.map((s) => (
                  <DayShiftCard
                    key={s.id}
                    shift={s}
                    onConfirm={handleShiftConfirm}
                    onSupplement={handleShiftSupplement}
                  />
                ))
              )}
            </motion.div>
          );
        })()}

        {/* ── Leave & Overtime entry buttons — same row ── */}
        <div className="flex gap-3">
          {[
            { label: '請假申請', sub: '填寫請假日期', icon: <Calendar size={15} style={{ color: '#3B5BDB' }} />, iconBg: '#EEF8FF', fn: openLeave },
            { label: '加班申請', sub: '登記加班時間', icon: <Clock size={15} style={{ color: '#D4891A' }} />, iconBg: '#FEF3DC', fn: openOvertime },
          ].map(({ label, sub, icon, iconBg, fn }) => (
            <button key={label} onClick={fn} className="flex-1 flex items-center gap-2.5 rounded-2xl px-3.5 py-3 transition-all active:scale-[0.97]" style={{ background: '#FFFFFF', boxShadow: CARD_SHADOW, border: CARD_BORDER, cursor: 'pointer' }}>
              <div className="flex items-center justify-center rounded-xl shrink-0" style={{ width: 32, height: 32, background: iconBg }}>
                {icon}
              </div>
              <div className="text-left flex-1">
                <p style={{ fontSize: '0.82rem', fontWeight: 700, color: '#0F1623', margin: 0 }}>{label}</p>
                <p style={{ fontSize: '0.65rem', color: '#9CA3AF', margin: '1px 0 0 0' }}>{sub}</p>
              </div>
            </button>
          ))}
        </div>

        <div style={{ height: 16 }} />
      </div>

      {/* ══════════════════════════ SHEETS ══════════════════════════ */}

      {/* Shift select */}
      <AnimatePresence>
        {sheet === 'shift-select' && (
          <SheetOverlay onClose={() => setSheet(null)}>
            <div className="flex items-center justify-between">
              <p style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0F1623', margin: 0 }}>選擇今日班次</p>
              <button onClick={() => setSheet(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}><XIcon size={18} style={{ color: '#9CA3AF' }} /></button>
            </div>
            <div className="flex flex-col gap-2.5">
              {TODAY_JOBS.map((job, i) => (
                <button key={job.id} onClick={() => { setJobIdx(i); setClockState('idle'); setClockInTime(null); setClockOutTime(null); setSheet(null); }}
                  className="flex items-center gap-3 rounded-2xl p-4 text-left transition-all active:scale-[0.98]"
                  style={{ background: jobIdx === i ? '#EEF8FF' : '#F7F8FC', border: `1.5px solid ${jobIdx === i ? 'rgba(59,91,219,0.3)' : 'rgba(15,22,35,0.07)'}`, cursor: 'pointer' }}>
                  <div className="shrink-0 flex items-center justify-center rounded-xl" style={{ width: 40, height: 40, background: job.logoColor + '18' }}>
                    <span style={{ fontSize: '0.95rem', fontWeight: 800, color: job.logoColor }}>{job.logo}</span>
                  </div>
                  <div className="flex-1">
                    <p style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0F1623', margin: 0 }}>{job.title}</p>
                    <p style={{ fontSize: '0.75rem', color: '#9CA3AF', margin: '2px 0 0 0' }}>{job.store}</p>
                    <div className="flex items-center gap-1 mt-1"><Clock size={11} style={{ color: '#9CA3AF' }} /><span style={{ fontSize: '0.72rem', color: '#6B7A99', fontWeight: 600 }}>{job.start} – {job.end}</span></div>
                  </div>
                  {jobIdx === i && <div className="shrink-0 flex items-center justify-center rounded-full" style={{ width: 22, height: 22, background: '#3B5BDB' }}><Check size={12} style={{ color: '#FFFFFF' }} /></div>}
                </button>
              ))}
            </div>
          </SheetOverlay>
        )}
      </AnimatePresence>

      {/* Abnormal list sheet */}
      <AnimatePresence>
        {sheet === 'abnormal-list' && (
          <SheetOverlay onClose={() => setSheet(null)}>
            <div className="flex items-center justify-between">
              <div>
                <p style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0F1623', margin: 0 }}>考勤異常詳情</p>
                <p style={{ fontSize: '0.75rem', color: '#9CA3AF', margin: '2px 0 0 0' }}>本週 {abnormals.length} 天需要處理</p>
              </div>
              <button onClick={() => setSheet(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}><XIcon size={18} style={{ color: '#9CA3AF' }} /></button>
            </div>
            {abnormals.map((d) => {
              const cfg = DAY_STATUS_CONFIG[d.status];
              const isLate = d.status === 'late';
              const ws = WEEK_SHIFTS.find((s) => s.dateNum === d.dateNum);
              return (
                <div key={d.dateNum} className="rounded-2xl p-4 flex flex-col gap-3" style={{ background: '#F7F8FC', border: `1px solid ${d.status === 'absent' ? 'rgba(217,48,37,0.18)' : 'rgba(245,166,35,0.25)'}` }}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p style={{ fontSize: '0.88rem', fontWeight: 700, color: '#0F1623', margin: 0 }}>6月{d.dateNum}日（週{d.dayLabel}）</p>
                      <p style={{ fontSize: '0.73rem', color: cfg.color, margin: '3px 0 0 0', fontWeight: 600 }}>
                        {isLate ? `遲到/早退 — 打卡 ${d.clockIn}` : '缺勤 — 未有打卡記錄'}
                      </p>
                    </div>
                    <span className="rounded-full px-2.5 py-0.5" style={{ background: cfg.bg, color: cfg.color, fontSize: '0.68rem', fontWeight: 700 }}>{cfg.label}</span>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => setSheet(null)}
                      className="flex-1 rounded-xl py-2.5" style={{ background: '#EEF1F8', border: 'none', cursor: 'pointer', fontSize: '0.78rem', fontWeight: 700, color: '#6B7A99' }}>
                      確認{isLate ? '遲到/早退' : '缺勤'}
                    </button>
                    <button onClick={() => {
                      if (ws) handleShiftSupplement(ws);
                      else { setSupplementTargetDay(d); setSupplementStartTime(d.scheduledStart ?? ''); setSupplementEndTime(d.scheduledEnd ?? ''); setSupplementReason(''); setSupplementPhotoName(null); setSheet('supplement-form'); }
                    }} className="flex-1 rounded-xl py-2.5" style={{ background: '#F5A623', border: 'none', cursor: 'pointer', fontSize: '0.78rem', fontWeight: 700, color: '#0F1623' }}>
                      申請補打卡
                    </button>
                  </div>
                </div>
              );
            })}
            <div style={{ height: 1, background: 'rgba(15,22,35,0.07)' }} />
            <SupplementRecordList />
          </SheetOverlay>
        )}
      </AnimatePresence>

      {/* Supplement form — form-based, gallery photo option, no camera */}
      <AnimatePresence>
        {sheet === 'supplement-form' && (
          <SheetOverlay onClose={() => setSheet(null)}>
            <div className="flex items-center justify-between">
              <div>
                <p style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0F1623', margin: 0 }}>補打卡申請</p>
                {supplementTargetDay && <p style={{ fontSize: '0.75rem', color: '#9CA3AF', margin: '3px 0 0 0' }}>6月{supplementTargetDay.dateNum}日（週{supplementTargetDay.dayLabel}）</p>}
              </div>
              <button onClick={() => setSheet(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}><XIcon size={18} style={{ color: '#9CA3AF' }} /></button>
            </div>
            <div className="rounded-xl px-4 py-3 flex items-start gap-2" style={{ background: '#FEF3DC', border: '1px solid rgba(245,166,35,0.25)' }}>
              <AlertCircle size={13} style={{ color: '#D4891A', flexShrink: 0, marginTop: 1 }} />
              <p style={{ fontSize: '0.76rem', color: '#92580A', margin: 0, lineHeight: 1.55 }}>補打卡申請由商戶審核，通過後當天考勤將恢復正常。</p>
            </div>
            <div className="flex gap-3">
              {[{ label: '上班時間', val: supplementStartTime, set: setSupplementStartTime, ph: '09:00' },
                { label: '下班時間', val: supplementEndTime,   set: setSupplementEndTime,   ph: '18:00' }].map(({ label, val, set, ph }) => (
                <div key={label} className="flex flex-col gap-1.5 flex-1">
                  <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#6B7A99' }}>{label} <span style={{ color: '#D93025' }}>*</span></span>
                  <input type="time" value={val} onChange={(e) => set(e.target.value)} placeholder={ph}
                    style={{ padding: '10px 12px', borderRadius: '0.75rem', border: '1.5px solid rgba(15,22,35,0.1)', fontSize: '0.88rem', color: '#0F1623', background: '#F7F8FC', outline: 'none', fontFamily: 'inherit', width: '100%', boxSizing: 'border-box' }} />
                </div>
              ))}
            </div>
            <div className="flex flex-col gap-1.5">
              <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#6B7A99' }}>補打卡原因 <span style={{ color: '#D93025' }}>*</span></span>
              <textarea value={supplementReason} onChange={(e) => setSupplementReason(e.target.value)}
                placeholder="請說明當時情況，例如：手機沒電、忘記打卡等…" rows={3}
                style={{ padding: '12px 14px', borderRadius: '0.75rem', border: '1.5px solid rgba(15,22,35,0.1)', fontSize: '0.9rem', color: '#0F1623', background: '#F7F8FC', outline: 'none', fontFamily: 'inherit', resize: 'none', width: '100%', boxSizing: 'border-box', lineHeight: 1.6 }} />
            </div>
            <div className="flex flex-col gap-1.5">
              <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#6B7A99' }}>照片證明（選填）</span>
              {supplementPhotoName ? (
                <div className="flex items-center gap-2 rounded-xl px-3 py-2.5" style={{ background: '#DCFCE7', border: '1px solid rgba(21,128,61,0.2)' }}>
                  <Check size={13} style={{ color: '#15803D' }} />
                  <span style={{ fontSize: '0.8rem', color: '#15803D', flex: 1 }}>{supplementPhotoName}</span>
                  <button onClick={() => setSupplementPhotoName(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2 }}><XIcon size={14} style={{ color: '#9CA3AF' }} /></button>
                </div>
              ) : (
                <label className="flex items-center justify-center gap-2 rounded-xl py-2.5 cursor-pointer" style={{ background: '#F7F8FC', border: '1.5px dashed rgba(15,22,35,0.15)' }}>
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) setSupplementPhotoName(f.name); }} />
                  <Camera size={14} style={{ color: '#9CA3AF' }} />
                  <span style={{ fontSize: '0.82rem', color: '#9CA3AF', fontWeight: 600 }}>從相冊選擇照片</span>
                </label>
              )}
            </div>
            <button onClick={submitSupplement} disabled={!supplementStartTime || !supplementEndTime || !supplementReason.trim()}
              className="w-full rounded-xl py-3 transition-all active:scale-[0.98]"
              style={{ background: (supplementStartTime && supplementEndTime && supplementReason.trim()) ? '#F5A623' : '#EEF1F8', color: (supplementStartTime && supplementEndTime && supplementReason.trim()) ? '#0F1623' : '#9CA3AF', border: 'none', cursor: (supplementStartTime && supplementEndTime && supplementReason.trim()) ? 'pointer' : 'not-allowed', fontSize: '0.95rem', fontWeight: 700 }}>
              提交補打卡申請
            </button>
          </SheetOverlay>
        )}
      </AnimatePresence>

      {/* OLD supplement-day-pick (kept as dead code stub to avoid removing too many chars) */}
      <AnimatePresence>
        {sheet === 'supplement-day-pick' && (
          <SheetOverlay onClose={() => setSheet(null)}>
            <div className="flex items-center justify-between">
              <div>
                <p style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0F1623', margin: 0 }}>選擇需要補打卡的日期</p>
                <p style={{ fontSize: '0.75rem', color: '#9CA3AF', margin: '2px 0 0 0' }}>本週共有 {abnormals.length} 天異常記錄</p>
              </div>
              <button onClick={() => setSheet(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}><XIcon size={18} style={{ color: '#9CA3AF' }} /></button>
            </div>
            <div className="flex flex-col gap-2">
              {abnormals.map((d) => {
                const cfg = DAY_STATUS_CONFIG[d.status];
                return (
                  <button key={d.dateNum} onClick={() => { setSupplementTargetDay(d); setSheet('supplement-day-confirm'); }}
                    className="flex items-center gap-3 rounded-2xl p-4 text-left transition-all active:scale-[0.98]"
                    style={{ background: '#F7F8FC', border: `1px solid ${cfg.bg === '#FEE2E2' ? 'rgba(217,48,37,0.2)' : 'rgba(245,166,35,0.25)'}`, cursor: 'pointer' }}>
                    <div className="flex items-center justify-center rounded-full shrink-0" style={{ width: 38, height: 38, background: cfg.bg }}>
                      {d.status === 'late'   && <Clock size={16} style={{ color: cfg.color }} />}
                      {d.status === 'absent' && <XIcon size={15} style={{ color: cfg.color }} />}
                    </div>
                    <div className="flex-1">
                      <p style={{ fontSize: '0.88rem', fontWeight: 700, color: '#0F1623', margin: 0 }}>6月{d.dateNum}日（週{d.dayLabel}）</p>
                      <p style={{ fontSize: '0.73rem', color: cfg.color, margin: '3px 0 0 0', fontWeight: 600 }}>
                        {d.status === 'late' ? `遲到/早退 — 打卡時間 ${d.clockIn}` : '缺勤 — 未有打卡記錄'}
                      </p>
                    </div>
                    <ChevronRight size={14} style={{ color: '#CBD1E1' }} />
                  </button>
                );
              })}
            </div>
            <div style={{ height: 1, background: 'rgba(15,22,35,0.07)' }} />
            <SupplementRecordList />
          </SheetOverlay>
        )}
      </AnimatePresence>

      {/* All normal info */}
      <AnimatePresence>
        {sheet === 'all-normal-info' && (
          <SheetOverlay onClose={() => setSheet(null)}>
            <div className="flex items-center justify-between">
              <p style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0F1623', margin: 0 }}>補打卡申請</p>
              <button onClick={() => setSheet(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}><XIcon size={18} style={{ color: '#9CA3AF' }} /></button>
            </div>
            <div className="flex flex-col items-center gap-3 py-4">
              <div className="flex items-center justify-center rounded-full" style={{ width: 56, height: 56, background: '#DCFCE7' }}>
                <CheckCircle2 size={24} style={{ color: '#15803D' }} />
              </div>
              <div className="text-center">
                <p style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0F1623', margin: 0 }}>本週考勤均正常</p>
                <p style={{ fontSize: '0.8rem', color: '#6B7A99', margin: '6px 0 0 0' }}>暫不需要補打卡申請</p>
              </div>
            </div>
            <div style={{ height: 1, background: 'rgba(15,22,35,0.07)' }} />
            <SupplementRecordList />
          </SheetOverlay>
        )}
      </AnimatePresence>

      {/* Supplement day confirm */}
      <AnimatePresence>
        {sheet === 'supplement-day-confirm' && supplementTargetDay && (
          <SheetOverlay onClose={() => setSheet(null)}>
            {(() => {
              const d = supplementTargetDay;
              const cfg = DAY_STATUS_CONFIG[d.status];
              const isLate = d.status === 'late';
              return (
                <>
                  <div className="flex items-center justify-between">
                    <div>
                      <p style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0F1623', margin: 0 }}>6月{d.dateNum}日（週{d.dayLabel}）</p>
                      <span className="rounded-full px-2.5 py-0.5 mt-1 inline-block" style={{ background: cfg.bg, color: cfg.color, fontSize: '0.7rem', fontWeight: 700 }}>{cfg.label}</span>
                    </div>
                    <button onClick={() => setSheet(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}><XIcon size={18} style={{ color: '#9CA3AF' }} /></button>
                  </div>

                  {/* Day details */}
                  <div className="rounded-xl flex flex-col gap-2 p-4" style={{ background: '#F7F8FC', border: CARD_BORDER }}>
                    <div className="flex items-center justify-between">
                      <span style={{ fontSize: '0.75rem', color: '#9CA3AF' }}>原定班次</span>
                      <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#0F1623' }}>{d.scheduledStart} – {d.scheduledEnd}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span style={{ fontSize: '0.75rem', color: '#9CA3AF' }}>上班打卡</span>
                      <span style={{ fontSize: '0.82rem', fontWeight: 700, color: d.clockIn ? (isLate ? '#D4891A' : '#15803D') : '#D93025' }}>{d.clockIn ?? '未有記錄'}</span>
                    </div>
                    {d.clockOut && (
                      <div className="flex items-center justify-between">
                        <span style={{ fontSize: '0.75rem', color: '#9CA3AF' }}>下班打卡</span>
                        <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#15803D' }}>{d.clockOut}</span>
                      </div>
                    )}
                  </div>

                  {/* System detection notice */}
                  <div className="rounded-xl p-3.5 flex items-start gap-2" style={{ background: isLate ? '#FEF3DC' : '#FEE2E2', border: `1px solid ${isLate ? 'rgba(245,166,35,0.25)' : 'rgba(217,48,37,0.2)'}` }}>
                    <Info size={14} style={{ color: isLate ? '#D4891A' : '#D93025', flexShrink: 0, marginTop: 1 }} />
                    <p style={{ fontSize: '0.76rem', color: isLate ? '#92580A' : '#991B1B', margin: 0, lineHeight: 1.55 }}>
                      {isLate
                        ? `系統偵測到您於 ${d.clockIn} 到達，晚於班次開始時間（${d.scheduledStart}），記錄為「遲到/早退」。`
                        : `系統未偵測到當天打卡記錄，標記為「缺勤」。如當天有上班，請申請補打卡。`}
                    </p>
                  </div>

                  {/* Two action paths */}
                  <div className="flex flex-col gap-2">
                    <p style={{ fontSize: '0.75rem', color: '#9CA3AF', margin: 0, textAlign: 'center' }}>請選擇處理方式</p>
                    <button onClick={() => setSheet(null)}
                      className="w-full rounded-xl py-3 transition-all active:scale-[0.98]"
                      style={{ background: '#EEF1F8', border: 'none', cursor: 'pointer', fontSize: '0.88rem', fontWeight: 700, color: '#6B7A99' }}>
                      {isLate ? '確認，我確實遲到/早退了' : '確認，我當天確實缺勤'}
                    </button>
                    <button onClick={() => openCamera('supplement')}
                      className="w-full rounded-xl py-3 transition-all active:scale-[0.98]"
                      style={{ background: '#F5A623', border: 'none', cursor: 'pointer', fontSize: '0.88rem', fontWeight: 700, color: '#0F1623' }}>
                      {isLate ? '我並非遲到/早退，申請補打卡' : '我當天有上班，申請補打卡'}
                    </button>
                  </div>
                </>
              );
            })()}
          </SheetOverlay>
        )}
      </AnimatePresence>

      {/* Day record (normal days) */}
      <AnimatePresence>
        {sheet === 'day-record' && dayRecordTarget && (
          <SheetOverlay onClose={() => setSheet(null)}>
            {(() => {
              const d = dayRecordTarget;
              return (
                <>
                  <div className="flex items-center justify-between">
                    <div>
                      <p style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0F1623', margin: 0 }}>6月{d.dateNum}日（週{d.dayLabel}）</p>
                      <span className="rounded-full px-2.5 py-0.5 mt-1 inline-block" style={{ background: '#DCFCE7', color: '#15803D', fontSize: '0.7rem', fontWeight: 700 }}>考勤正常</span>
                    </div>
                    <button onClick={() => setSheet(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}><XIcon size={18} style={{ color: '#9CA3AF' }} /></button>
                  </div>
                  <div className="rounded-xl flex flex-col gap-3 p-4" style={{ background: '#F7F8FC', border: CARD_BORDER }}>
                    <div className="flex items-center justify-between">
                      <span style={{ fontSize: '0.78rem', color: '#9CA3AF' }}>原定班次</span>
                      <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0F1623' }}>{d.scheduledStart} – {d.scheduledEnd}</span>
                    </div>
                    <div style={{ height: 1, background: 'rgba(15,22,35,0.06)' }} />
                    <div className="flex gap-3">
                      <div className="flex-1 rounded-xl p-3 flex flex-col gap-0.5" style={{ background: '#DCFCE7', border: '1px solid rgba(21,128,61,0.2)' }}>
                        <span style={{ fontSize: '0.62rem', fontWeight: 700, color: '#15803D', textTransform: 'uppercase', letterSpacing: '0.05em' }}>上班</span>
                        <span style={{ fontSize: '1.05rem', fontWeight: 800, color: '#15803D' }}>{d.clockIn}</span>
                      </div>
                      <div className="flex-1 rounded-xl p-3 flex flex-col gap-0.5" style={{ background: '#DCFCE7', border: '1px solid rgba(21,128,61,0.2)' }}>
                        <span style={{ fontSize: '0.62rem', fontWeight: 700, color: '#15803D', textTransform: 'uppercase', letterSpacing: '0.05em' }}>下班</span>
                        <span style={{ fontSize: '1.05rem', fontWeight: 800, color: '#15803D' }}>{d.clockOut}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 rounded-xl px-4 py-3" style={{ background: '#DCFCE7', border: '1px solid rgba(21,128,61,0.2)' }}>
                    <Check size={14} style={{ color: '#15803D' }} />
                    <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#15803D' }}>打卡記錄正常，無需任何操作</span>
                  </div>
                  <button onClick={() => setSheet(null)} className="w-full rounded-xl py-3" style={{ background: '#EEF1F8', border: 'none', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 600, color: '#6B7A99' }}>
                    關閉
                  </button>
                </>
              );
            })()}
          </SheetOverlay>
        )}
      </AnimatePresence>

      {/* Camera */}
      <AnimatePresence>
        {sheet === 'camera' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}
            className="absolute inset-0 z-50 flex flex-col" style={{ background: '#000000' }}>
            <AnimatePresence>
              {cameraStep === 'flash' && (
                <motion.div initial={{ opacity: 0.8 }} animate={{ opacity: 0 }} transition={{ duration: 0.3 }}
                  className="absolute inset-0 z-10" style={{ background: '#FFFFFF' }} />
              )}
            </AnimatePresence>
            <div className="flex items-center justify-between px-5 pt-10 pb-4">
              <button onClick={() => setSheet(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 8 }}><XIcon size={20} style={{ color: 'rgba(255,255,255,0.7)' }} /></button>
              <p style={{ fontSize: '0.95rem', fontWeight: 700, color: '#FFFFFF', margin: 0 }}>{cameraFor === 'in' ? '上班打卡' : '下班打卡'}</p>
              <div style={{ width: 36 }} />
            </div>
            <div className="flex flex-col items-center pb-4">
              <p style={{ fontSize: '1.55rem', fontWeight: 800, color: '#FFFFFF', margin: 0, fontVariantNumeric: 'tabular-nums' }}>{timeStr}</p>
              <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', margin: '3px 0 0 0' }}>2026年6月20日 · 週六</p>
            </div>
            <div className="flex-1 flex items-center justify-center relative">
              <div className="relative" style={{ width: 200, height: 200 }}>
                {[{t:0,l:0,bt:'borderTop',bl:'borderLeft',br:'4px 0 0 0'},{t:0,r:0,bt:'borderTop',bl:'borderRight',br:'0 4px 0 0'},{b:0,l:0,bt:'borderBottom',bl:'borderLeft',br:'0 0 0 4px'},{b:0,r:0,bt:'borderBottom',bl:'borderRight',br:'0 0 4px 0'}].map((c,i) => (
                  <div key={i} style={{ position: 'absolute', top: (c as any).t, bottom: (c as any).b, left: (c as any).l, right: (c as any).r, width: 28, height: 28, [(c as any).bt]: '3px solid #3B5BDB', [(c as any).bl]: '3px solid #3B5BDB', borderRadius: (c as any).br }} />
                ))}
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                  {cameraStep === 'done'
                    ? <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex items-center justify-center rounded-full" style={{ width: 56, height: 56, background: '#15803D' }}><Check size={26} style={{ color: '#FFFFFF' }} /></motion.div>
                    : <><div className="flex items-center justify-center rounded-full" style={{ width: 56, height: 56, background: 'rgba(255,255,255,0.08)' }}><Camera size={24} style={{ color: 'rgba(255,255,255,0.4)' }} /></div><p style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)', margin: 0 }}>對準面部拍攝</p></>
                  }
                </div>
              </div>
            </div>
            <div className="flex justify-center pb-4">
              <div className="flex items-center gap-1.5 rounded-full px-4 py-2" style={{ background: 'rgba(255,255,255,0.12)' }}>
                <div className="rounded-full shrink-0" style={{ width: 6, height: 6, background: locationOk ? '#22C55E' : '#F5A623', boxShadow: locationOk ? '0 0 6px #22C55E' : '0 0 6px #F5A623' }} />
                <span style={{ fontSize: '0.73rem', color: 'rgba(255,255,255,0.8)' }}>{locationOk ? `📍 ${currentJob.store} · 範圍內` : '正在偵測位置…'}</span>
              </div>
            </div>
            <div className="flex flex-col items-center gap-4 pb-12">
              {cameraStep === 'done'
                ? <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center gap-2"><p style={{ fontSize: '0.88rem', fontWeight: 700, color: '#22C55E', margin: 0 }}>拍照成功！</p><p style={{ fontSize: '0.73rem', color: 'rgba(255,255,255,0.5)', margin: 0 }}>正在提交打卡資料…</p></motion.div>
                : <button onClick={handleCapture} disabled={!locationOk} style={{ border: 'none', background: 'none', cursor: locationOk ? 'pointer' : 'not-allowed', padding: 0 }}>
                    <div className="flex items-center justify-center rounded-full" style={{ width: 72, height: 72, background: locationOk ? '#FFFFFF' : 'rgba(255,255,255,0.3)', boxShadow: locationOk ? '0 0 0 4px rgba(255,255,255,0.25)' : 'none', transition: 'all 0.3s' }}>
                      <div className="rounded-full" style={{ width: 58, height: 58, background: locationOk ? '#3B5BDB' : 'rgba(255,255,255,0.2)' }} />
                    </div>
                  </button>
              }
              {!locationOk && cameraStep === 'capturing' && <p style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)', margin: 0 }}>偵測位置後才可打卡</p>}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Supplement reason */}
      <AnimatePresence>
        {sheet === 'supplement-reason' && (
          <SheetOverlay onClose={() => setSheet(null)}>
            <div className="flex items-center justify-between">
              <div>
                <p style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0F1623', margin: 0 }}>填寫補打卡說明</p>
                {supplementTargetDay && <p style={{ fontSize: '0.75rem', color: '#9CA3AF', margin: '3px 0 0 0' }}>6月{supplementTargetDay.dateNum}日（週{supplementTargetDay.dayLabel}）</p>}
              </div>
              <button onClick={() => setSheet(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}><XIcon size={18} style={{ color: '#9CA3AF' }} /></button>
            </div>
            <div className="rounded-xl px-4 py-3 flex items-start gap-2" style={{ background: '#FEF3DC', border: '1px solid rgba(245,166,35,0.25)' }}>
              <AlertCircle size={13} style={{ color: '#D4891A', flexShrink: 0, marginTop: 1 }} />
              <p style={{ fontSize: '0.76rem', color: '#92580A', margin: 0, lineHeight: 1.55 }}>補打卡申請需由商戶審核，審核通過後當天考勤將恢復正常。</p>
            </div>
            <div className="flex flex-col gap-1.5">
              <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#6B7A99' }}>補打卡詳細說明 <span style={{ color: '#D93025' }}>*</span></span>
              <textarea value={supplementReason} onChange={(e) => setSupplementReason(e.target.value)} placeholder="請詳細說明當時情況，例如：手機沒電、交通意外、忘記打卡等…" rows={4}
                style={{ padding: '12px 14px', borderRadius: '0.75rem', border: '1.5px solid rgba(15,22,35,0.1)', fontSize: '0.9rem', color: '#0F1623', background: '#F7F8FC', outline: 'none', fontFamily: 'inherit', resize: 'none', width: '100%', boxSizing: 'border-box', lineHeight: 1.6 }} />
            </div>
            <button onClick={submitSupplement} disabled={!supplementReason.trim()} className="w-full rounded-xl py-3 transition-all active:scale-[0.98]"
              style={{ background: supplementReason.trim() ? '#F5A623' : '#EEF1F8', color: supplementReason.trim() ? '#0F1623' : '#9CA3AF', border: 'none', cursor: supplementReason.trim() ? 'pointer' : 'not-allowed', fontSize: '0.95rem', fontWeight: 700 }}>
              提交補打卡申請
            </button>
          </SheetOverlay>
        )}
      </AnimatePresence>

      {/* Supplement done */}
      <AnimatePresence>
        {sheet === 'supplement-done' && (
          <SheetOverlay onClose={() => setSheet(null)}>
            <div className="flex flex-col items-center gap-4 py-4">
              <div className="flex items-center justify-center rounded-full" style={{ width: 64, height: 64, background: '#FEF3DC' }}>
                <FileText size={28} style={{ color: '#F5A623' }} />
              </div>
              <div className="text-center">
                <p style={{ fontSize: '1rem', fontWeight: 700, color: '#0F1623', margin: 0 }}>補打卡申請已提交</p>
                <p style={{ fontSize: '0.8rem', color: '#6B7A99', margin: '6px 0 0 0' }}>商戶審核中，結果將透過通知告知</p>
              </div>
            </div>
            <div style={{ height: 1, background: 'rgba(15,22,35,0.07)' }} />
            <SupplementRecordList />
            <button onClick={() => setSheet(null)} className="w-full rounded-xl py-3" style={{ background: '#EEF1F8', border: 'none', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 600, color: '#6B7A99' }}>關閉</button>
          </SheetOverlay>
        )}
      </AnimatePresence>

      {/* ── Leave full-page overlay ── */}
      <AnimatePresence>
        {attendanceView === 'leave' && (
          <motion.div
            initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-0 z-30 flex flex-col"
            style={{ background: '#F7F8FC' }}
          >
            {/* Header */}
            <div className="shrink-0 flex items-center gap-3 px-4 py-3" style={{ background: '#FFFFFF', borderBottom: CARD_BORDER }}>
              <button onClick={() => setAttendanceView('main')} className="flex items-center justify-center rounded-xl" style={{ width: 36, height: 36, background: '#EEF1F8', border: 'none', cursor: 'pointer' }}>
                <ChevronLeft size={18} style={{ color: '#0F1623' }} />
              </button>
              <h2 style={{ fontSize: '1rem', fontWeight: 700, color: '#0F1623', margin: 0 }}>請假申請</h2>
            </div>
            <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-4" style={{ scrollbarWidth: 'none' }}>
              {leaveSubmitted ? (
                <div className="flex flex-col items-center gap-4 py-8">
                  <div className="flex items-center justify-center rounded-full" style={{ width: 64, height: 64, background: '#EEF8FF' }}>
                    <CheckCircle2 size={28} style={{ color: '#3B5BDB' }} />
                  </div>
                  <div className="text-center">
                    <p style={{ fontSize: '1rem', fontWeight: 700, color: '#0F1623', margin: 0 }}>請假申請已提交</p>
                    <p style={{ fontSize: '0.82rem', color: '#6B7A99', margin: '6px 0 0 0' }}>請等待商戶審核，結果將透過通知告知</p>
                  </div>
                  <button onClick={() => setAttendanceView('main')} className="rounded-xl px-6 py-2.5" style={{ background: '#EEF1F8', border: 'none', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 600, color: '#6B7A99' }}>返回</button>
                </div>
              ) : (
                <div className="rounded-2xl p-4 flex flex-col gap-4" style={{ background: '#FFFFFF', boxShadow: CARD_SHADOW, border: CARD_BORDER }}>
                  <div className="flex gap-3">
                    {[{ label: '開始日期', val: leaveStartDate, set: setLeaveStartDate, req: true },
                      { label: '結束日期', val: leaveEndDate,   set: setLeaveEndDate,   req: false }]
                      .map(({ label, val, set, req }) => (
                        <div key={label} className="flex flex-col gap-1.5 flex-1">
                          <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#6B7A99' }}>{label}{req && <span style={{ color: '#D93025', marginLeft: 2 }}>*</span>}</span>
                          <input type="date" value={val} onChange={(e) => set(e.target.value)} style={{ padding: '10px 12px', borderRadius: '0.75rem', border: '1.5px solid rgba(15,22,35,0.1)', fontSize: '0.88rem', color: '#0F1623', background: '#F7F8FC', outline: 'none', fontFamily: 'inherit', width: '100%', boxSizing: 'border-box' }} />
                        </div>
                      ))}
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#6B7A99' }}>請假原因 <span style={{ color: '#D93025' }}>*</span></span>
                    <textarea value={leaveReason} onChange={(e) => setLeaveReason(e.target.value)} placeholder="請填寫請假原因…" rows={3}
                      style={{ padding: '12px 14px', borderRadius: '0.75rem', border: '1.5px solid rgba(15,22,35,0.1)', fontSize: '0.9rem', color: '#0F1623', background: '#F7F8FC', outline: 'none', fontFamily: 'inherit', resize: 'none', width: '100%', boxSizing: 'border-box', lineHeight: 1.6 }} />
                  </div>
                  {/* Optional photo */}
                  <div className="flex flex-col gap-1.5">
                    <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#6B7A99' }}>附加圖片（選填）</span>
                    {leavePhotoName ? (
                      <div className="flex items-center gap-2 rounded-xl px-3 py-2.5" style={{ background: '#DCFCE7', border: '1px solid rgba(21,128,61,0.2)' }}>
                        <Check size={13} style={{ color: '#15803D' }} />
                        <span style={{ fontSize: '0.8rem', color: '#15803D', flex: 1 }}>{leavePhotoName}</span>
                        <button onClick={() => setLeavePhotoName(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2 }}><XIcon size={14} style={{ color: '#9CA3AF' }} /></button>
                      </div>
                    ) : (
                      <label className="flex items-center justify-center gap-2 rounded-xl py-2.5 cursor-pointer" style={{ background: '#F7F8FC', border: '1.5px dashed rgba(15,22,35,0.15)' }}>
                        <input type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) setLeavePhotoName(f.name); }} />
                        <Camera size={14} style={{ color: '#9CA3AF' }} />
                        <span style={{ fontSize: '0.82rem', color: '#9CA3AF', fontWeight: 600 }}>從相冊選擇圖片</span>
                      </label>
                    )}
                  </div>
                  <button onClick={handleLeaveSubmit} disabled={!leaveStartDate || !leaveReason.trim()} className="w-full rounded-xl py-3 transition-all active:scale-[0.98]"
                    style={{ background: (leaveStartDate && leaveReason.trim()) ? '#3B5BDB' : '#EEF1F8', color: (leaveStartDate && leaveReason.trim()) ? '#FFFFFF' : '#9CA3AF', border: 'none', cursor: (leaveStartDate && leaveReason.trim()) ? 'pointer' : 'not-allowed', fontSize: '0.95rem', fontWeight: 700 }}>
                    提交請假申請
                  </button>
                </div>
              )}
              {/* History section */}
              <div className="flex flex-col gap-3">
                <h3 style={{ fontSize: '0.8rem', fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.08em', margin: 0 }}>過往請假記錄</h3>
                {LEAVE_HISTORY.map((r) => {
                  const s = RECORD_STATUS[r.status];
                  return (
                    <div key={r.id} className="rounded-2xl px-4 py-3 flex flex-col gap-1.5" style={{ background: '#FFFFFF', boxShadow: CARD_SHADOW, border: CARD_BORDER }}>
                      <div className="flex items-center justify-between">
                        <p style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0F1623', margin: 0 }}>{r.dateRange}</p>
                        <span className="rounded-full px-2.5 py-0.5" style={{ background: s.bg, color: s.color, fontSize: '0.7rem', fontWeight: 700 }}>{s.label}</span>
                      </div>
                      <p style={{ fontSize: '0.75rem', color: '#9CA3AF', margin: 0 }}>{r.reason}</p>
                      <p style={{ fontSize: '0.68rem', color: '#CBD1E1', margin: 0 }}>申請於 {r.at}</p>
                    </div>
                  );
                })}
              </div>
              <div style={{ height: 16 }} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Overtime full-page overlay ── */}
      <AnimatePresence>
        {attendanceView === 'overtime' && (
          <motion.div
            initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-0 z-30 flex flex-col"
            style={{ background: '#F7F8FC' }}
          >
            {/* Header */}
            <div className="shrink-0 flex items-center gap-3 px-4 py-3" style={{ background: '#FFFFFF', borderBottom: CARD_BORDER }}>
              <button onClick={() => setAttendanceView('main')} className="flex items-center justify-center rounded-xl" style={{ width: 36, height: 36, background: '#EEF1F8', border: 'none', cursor: 'pointer' }}>
                <ChevronLeft size={18} style={{ color: '#0F1623' }} />
              </button>
              <h2 style={{ fontSize: '1rem', fontWeight: 700, color: '#0F1623', margin: 0 }}>加班申請</h2>
            </div>
            <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-4" style={{ scrollbarWidth: 'none' }}>
              {otSubmitted ? (
                <div className="flex flex-col items-center gap-4 py-8">
                  <div className="flex items-center justify-center rounded-full" style={{ width: 64, height: 64, background: '#FEF3DC' }}>
                    <CheckCircle2 size={28} style={{ color: '#D4891A' }} />
                  </div>
                  <div className="text-center">
                    <p style={{ fontSize: '1rem', fontWeight: 700, color: '#0F1623', margin: 0 }}>加班申請已提交</p>
                    <p style={{ fontSize: '0.82rem', color: '#6B7A99', margin: '6px 0 0 0' }}>請等待商戶審核，結果將透過通知告知</p>
                  </div>
                  <button onClick={() => setAttendanceView('main')} className="rounded-xl px-6 py-2.5" style={{ background: '#EEF1F8', border: 'none', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 600, color: '#6B7A99' }}>返回</button>
                </div>
              ) : (
                <div className="rounded-2xl p-4 flex flex-col gap-4" style={{ background: '#FFFFFF', boxShadow: CARD_SHADOW, border: CARD_BORDER }}>
                  <div className="flex flex-col gap-1.5">
                    <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#6B7A99' }}>加班日期 <span style={{ color: '#D93025' }}>*</span></span>
                    <input type="date" value={otDate} onChange={(e) => setOtDate(e.target.value)} style={{ padding: '10px 12px', borderRadius: '0.75rem', border: '1.5px solid rgba(15,22,35,0.1)', fontSize: '0.88rem', color: '#0F1623', background: '#F7F8FC', outline: 'none', fontFamily: 'inherit', width: '100%', boxSizing: 'border-box' }} />
                  </div>
                  <div className="flex gap-3">
                    {[{ label: '開始時間', val: otStart, set: setOtStart }, { label: '結束時間', val: otEnd, set: setOtEnd }]
                      .map(({ label, val, set }) => (
                        <div key={label} className="flex flex-col gap-1.5 flex-1">
                          <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#6B7A99' }}>{label} <span style={{ color: '#D93025' }}>*</span></span>
                          <input type="time" value={val} onChange={(e) => set(e.target.value)} style={{ padding: '10px 12px', borderRadius: '0.75rem', border: '1.5px solid rgba(15,22,35,0.1)', fontSize: '0.88rem', color: '#0F1623', background: '#F7F8FC', outline: 'none', fontFamily: 'inherit', width: '100%', boxSizing: 'border-box' }} />
                        </div>
                      ))}
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#6B7A99' }}>加班原因 <span style={{ color: '#D93025' }}>*</span></span>
                    <textarea value={otReason} onChange={(e) => setOtReason(e.target.value)} placeholder="請填寫加班原因…" rows={3}
                      style={{ padding: '12px 14px', borderRadius: '0.75rem', border: '1.5px solid rgba(15,22,35,0.1)', fontSize: '0.9rem', color: '#0F1623', background: '#F7F8FC', outline: 'none', fontFamily: 'inherit', resize: 'none', width: '100%', boxSizing: 'border-box', lineHeight: 1.6 }} />
                  </div>
                  {/* Optional photo */}
                  <div className="flex flex-col gap-1.5">
                    <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#6B7A99' }}>附加圖片（選填）</span>
                    {otPhotoName ? (
                      <div className="flex items-center gap-2 rounded-xl px-3 py-2.5" style={{ background: '#DCFCE7', border: '1px solid rgba(21,128,61,0.2)' }}>
                        <Check size={13} style={{ color: '#15803D' }} />
                        <span style={{ fontSize: '0.8rem', color: '#15803D', flex: 1 }}>{otPhotoName}</span>
                        <button onClick={() => setOtPhotoName(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2 }}><XIcon size={14} style={{ color: '#9CA3AF' }} /></button>
                      </div>
                    ) : (
                      <label className="flex items-center justify-center gap-2 rounded-xl py-2.5 cursor-pointer" style={{ background: '#F7F8FC', border: '1.5px dashed rgba(15,22,35,0.15)' }}>
                        <input type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) setOtPhotoName(f.name); }} />
                        <Camera size={14} style={{ color: '#9CA3AF' }} />
                        <span style={{ fontSize: '0.82rem', color: '#9CA3AF', fontWeight: 600 }}>從相冊選擇圖片</span>
                      </label>
                    )}
                  </div>
                  <button onClick={handleOtSubmit} disabled={!otDate || !otStart || !otEnd || !otReason.trim()} className="w-full rounded-xl py-3 transition-all active:scale-[0.98]"
                    style={{ background: (otDate && otStart && otEnd && otReason.trim()) ? '#F5A623' : '#EEF1F8', color: (otDate && otStart && otEnd && otReason.trim()) ? '#0F1623' : '#9CA3AF', border: 'none', cursor: (otDate && otStart && otEnd && otReason.trim()) ? 'pointer' : 'not-allowed', fontSize: '0.95rem', fontWeight: 700 }}>
                    提交加班申請
                  </button>
                </div>
              )}
              {/* History section */}
              <div className="flex flex-col gap-3">
                <h3 style={{ fontSize: '0.8rem', fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.08em', margin: 0 }}>過往加班記錄</h3>
                {OT_HISTORY.map((r) => {
                  const s = RECORD_STATUS[r.status];
                  return (
                    <div key={r.id} className="rounded-2xl px-4 py-3 flex flex-col gap-1.5" style={{ background: '#FFFFFF', boxShadow: CARD_SHADOW, border: CARD_BORDER }}>
                      <div className="flex items-center justify-between">
                        <p style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0F1623', margin: 0 }}>{r.date}</p>
                        <span className="rounded-full px-2.5 py-0.5" style={{ background: s.bg, color: s.color, fontSize: '0.7rem', fontWeight: 700 }}>{s.label}</span>
                      </div>
                      <p style={{ fontSize: '0.78rem', color: '#6B7A99', margin: 0 }}>{r.time} · {r.reason}</p>
                      <p style={{ fontSize: '0.68rem', color: '#CBD1E1', margin: 0 }}>申請於 {r.at}</p>
                    </div>
                  );
                })}
              </div>
              <div style={{ height: 16 }} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
