import { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar, Clock, MapPin, AlertCircle, Check, MessageCircle, X as XIcon, List, Phone, User } from 'lucide-react';

const CARD_SHADOW = '0 1px 3px rgba(15,22,35,0.06), 0 4px 16px rgba(15,22,35,0.04)';
const CARD_BORDER = '1px solid rgba(15,22,35,0.06)';

type ShiftStatus = 'normal' | 'late' | 'absent' | 'upcoming' | 'off' | 'leave' | 'today';

interface PayrollInfo {
  status: 'confirmed' | 'pending';
  unit: 'hourly' | 'piece';
  quantity: string;
  amount: string;
  note?: string;
}

interface Shift {
  id: number;
  month: number;
  day: number;
  dayLabel: string;
  start: string;
  end: string;
  store: string;
  address?: string;
  jobTitle: string;
  company: string;
  status: ShiftStatus;
  clockIn?: string | null;
  clockOut?: string | null;
  clockInLocation?: string;
  clockOutLocation?: string;
  supervisor?: string;
  supervisorPhone?: string;
  payroll?: PayrollInfo;
}

const ALL_SHIFTS: Shift[] = [
  { id: 101, month: 6, day: 2,  dayLabel: '二', start: '10:00', end: '18:00', store: '銅鑼灣時代廣場', address: '香港銅鑼灣勿地臣街1號時代廣場3樓', jobTitle: '餐飲服務員',  company: '美食集團',       status: 'normal',   clockIn: '09:55', clockOut: '18:02', clockInLocation: '銅鑼灣時代廣場 3/F', clockOutLocation: '銅鑼灣時代廣場 3/F', supervisor: '陳大文（店長）', supervisorPhone: '+852 9876 5432', payroll: { status: 'confirmed', unit: 'hourly', quantity: '8小時', amount: 'HK$640' } },
  { id: 102, month: 6, day: 3,  dayLabel: '三', start: '10:00', end: '18:00', store: '銅鑼灣時代廣場', address: '香港銅鑼灣勿地臣街1號時代廣場3樓', jobTitle: '餐飲服務員',  company: '美食集團',       status: 'normal',   clockIn: '10:00', clockOut: '18:05', clockInLocation: '銅鑼灣時代廣場 3/F', clockOutLocation: '銅鑼灣時代廣場 3/F', supervisor: '陳大文（店長）', supervisorPhone: '+852 9876 5432', payroll: { status: 'confirmed', unit: 'hourly', quantity: '8小時', amount: 'HK$640' } },
  { id: 103, month: 6, day: 5,  dayLabel: '五', start: '10:00', end: '18:00', store: '銅鑼灣時代廣場', address: '香港銅鑼灣勿地臣街1號時代廣場3樓', jobTitle: '餐飲服務員',  company: '美食集團',       status: 'late',     clockIn: '10:35', clockOut: '18:00', clockInLocation: '銅鑼灣時代廣場 3/F', clockOutLocation: '銅鑼灣時代廣場 3/F', supervisor: '陳大文（店長）', supervisorPhone: '+852 9876 5432', payroll: { status: 'confirmed', unit: 'hourly', quantity: '7.5小時', amount: 'HK$576', note: '員工遲到35分鐘，工時按實際到崗時間計算。' } },
  { id: 104, month: 6, day: 7,  dayLabel: '日', start: '10:00', end: '18:00', store: '銅鑼灣時代廣場', address: '香港銅鑼灣勿地臣街1號時代廣場3樓', jobTitle: '餐飲服務員',  company: '美食集團',       status: 'normal',   clockIn: '09:58', clockOut: '18:10', clockInLocation: '銅鑼灣時代廣場 3/F', clockOutLocation: '銅鑼灣時代廣場 3/F', supervisor: '陳大文（店長）', supervisorPhone: '+852 9876 5432', payroll: { status: 'confirmed', unit: 'hourly', quantity: '8小時', amount: 'HK$640' } },
  { id: 105, month: 6, day: 9,  dayLabel: '二', start: '10:00', end: '18:00', store: '銅鑼灣時代廣場', address: '香港銅鑼灣勿地臣街1號時代廣場3樓', jobTitle: '餐飲服務員',  company: '美食集團',       status: 'normal',   clockIn: '09:52', clockOut: '18:00', supervisor: '陳大文（店長）', supervisorPhone: '+852 9876 5432', payroll: { status: 'confirmed', unit: 'hourly', quantity: '8小時', amount: 'HK$640' } },
  { id: 106, month: 6, day: 10, dayLabel: '三', start: '10:00', end: '18:00', store: '銅鑼灣時代廣場', address: '香港銅鑼灣勿地臣街1號時代廣場3樓', jobTitle: '餐飲服務員',  company: '美食集團',       status: 'absent',   clockIn: null, clockOut: null, supervisor: '陳大文（店長）', supervisorPhone: '+852 9876 5432' },
  { id: 107, month: 6, day: 12, dayLabel: '五', start: '14:00', end: '22:00', store: '灣仔會展中心',   address: '香港灣仔博覽道1號香港會議展覽中心', jobTitle: '展覽場地助理', company: 'HK Convention', status: 'normal',   clockIn: '13:58', clockOut: '22:05', clockInLocation: '灣仔會展中心 B2', clockOutLocation: '灣仔會展中心 B2', supervisor: '李美玲（主任）', supervisorPhone: '+852 2582 8888', payroll: { status: 'confirmed', unit: 'hourly', quantity: '8小時', amount: 'HK$720' } },
  { id: 108, month: 6, day: 14, dayLabel: '日', start: '10:00', end: '18:00', store: '銅鑼灣時代廣場', jobTitle: '餐飲服務員',  company: '美食集團',       status: 'leave', supervisor: '陳大文（店長）', supervisorPhone: '+852 9876 5432' },
  { id: 1,   month: 6, day: 15, dayLabel: '一', start: '10:00', end: '18:00', store: '銅鑼灣時代廣場', address: '香港銅鑼灣勿地臣街1號時代廣場3樓', jobTitle: '餐飲服務員',  company: '美食集團',       status: 'normal',   clockIn: '09:58', clockOut: '18:03', clockInLocation: '銅鑼灣時代廣場 3/F', clockOutLocation: '銅鑼灣時代廣場 3/F', supervisor: '陳大文（店長）', supervisorPhone: '+852 9876 5432', payroll: { status: 'confirmed', unit: 'hourly', quantity: '8小時', amount: 'HK$640' } },
  { id: 2,   month: 6, day: 16, dayLabel: '二', start: '10:00', end: '18:00', store: '銅鑼灣時代廣場', address: '香港銅鑼灣勿地臣街1號時代廣場3樓', jobTitle: '餐飲服務員',  company: '美食集團',       status: 'late',     clockIn: '10:22', clockOut: '18:00', clockInLocation: '銅鑼灣時代廣場 3/F', clockOutLocation: '銅鑼灣時代廣場 3/F', supervisor: '陳大文（店長）', supervisorPhone: '+852 9876 5432', payroll: { status: 'confirmed', unit: 'hourly', quantity: '7小時', amount: 'HK$560', note: '員工遲到22分鐘，按商戶政策扣除30分鐘並調整工時。' } },
  { id: 3,   month: 6, day: 18, dayLabel: '四', start: '10:00', end: '18:00', store: '銅鑼灣時代廣場', address: '香港銅鑼灣勿地臣街1號時代廣場3樓', jobTitle: '餐飲服務員',  company: '美食集團',       status: 'absent',   clockIn: null, clockOut: null, supervisor: '陳大文（店長）', supervisorPhone: '+852 9876 5432' },
  { id: 4,   month: 6, day: 19, dayLabel: '五', start: '10:00', end: '18:00', store: '銅鑼灣時代廣場', address: '香港銅鑼灣勿地臣街1號時代廣場3樓', jobTitle: '餐飲服務員',  company: '美食集團',       status: 'normal',   clockIn: '09:55', clockOut: '18:05', clockInLocation: '銅鑼灣時代廣場 3/F', clockOutLocation: '銅鑼灣時代廣場 3/F', supervisor: '陳大文（店長）', supervisorPhone: '+852 9876 5432', payroll: { status: 'pending', unit: 'hourly', quantity: '8小時', amount: 'HK$640' } },
  { id: 5,   month: 6, day: 20, dayLabel: '六', start: '10:00', end: '18:00', store: '銅鑼灣時代廣場', address: '香港銅鑼灣勿地臣街1號時代廣場3樓', jobTitle: '餐飲服務員',  company: '美食集團',       status: 'today',    clockIn: null, clockOut: null, supervisor: '陳大文（店長）', supervisorPhone: '+852 9876 5432' },
  { id: 51,  month: 6, day: 20, dayLabel: '六', start: '19:00', end: '23:00', store: '灣仔會展中心',   address: '香港灣仔博覽道1號香港會議展覽中心', jobTitle: '展覽場地助理', company: 'HK Convention', status: 'upcoming', clockIn: null, clockOut: null, supervisor: '李美玲（主任）', supervisorPhone: '+852 2582 8888' },
  { id: 6,   month: 6, day: 22, dayLabel: '一', start: '10:00', end: '18:00', store: '銅鑼灣時代廣場', jobTitle: '餐飲服務員',  company: '美食集團',       status: 'upcoming', supervisor: '陳大文（店長）', supervisorPhone: '+852 9876 5432' },
  { id: 7,   month: 6, day: 23, dayLabel: '二', start: '14:00', end: '22:00', store: '灣仔會展中心',   jobTitle: '展覽場地助理', company: 'HK Convention', status: 'upcoming', supervisor: '李美玲（主任）', supervisorPhone: '+852 2582 8888' },
  { id: 8,   month: 6, day: 25, dayLabel: '四', start: '10:00', end: '18:00', store: '銅鑼灣時代廣場', jobTitle: '餐飲服務員',  company: '美食集團',       status: 'upcoming', supervisor: '陳大文（店長）', supervisorPhone: '+852 9876 5432' },
  { id: 9,   month: 6, day: 26, dayLabel: '五', start: '10:00', end: '18:00', store: '銅鑼灣時代廣場', jobTitle: '餐飲服務員',  company: '美食集團',       status: 'leave' },
  { id: 10,  month: 6, day: 27, dayLabel: '六', start: '10:00', end: '18:00', store: '銅鑼灣時代廣場', jobTitle: '餐飲服務員',  company: '美食集團',       status: 'upcoming', supervisor: '陳大文（店長）', supervisorPhone: '+852 9876 5432' },
  { id: 11,  month: 6, day: 29, dayLabel: '一', start: '10:00', end: '18:00', store: '銅鑼灣時代廣場', jobTitle: '餐飲服務員',  company: '美食集團',       status: 'upcoming' },
  { id: 12,  month: 6, day: 30, dayLabel: '二', start: '10:00', end: '18:00', store: '銅鑼灣時代廣場', jobTitle: '餐飲服務員',  company: '美食集團',       status: 'upcoming' },
  { id: 13,  month: 7, day: 1,  dayLabel: '三', start: '10:00', end: '18:00', store: '銅鑼灣時代廣場', jobTitle: '餐飲服務員',  company: '美食集團',       status: 'upcoming' },
  { id: 14,  month: 7, day: 2,  dayLabel: '四', start: '14:00', end: '22:00', store: '灣仔會展中心',   jobTitle: '展覽場地助理', company: 'HK Convention', status: 'upcoming' },
  { id: 15,  month: 7, day: 4,  dayLabel: '六', start: '10:00', end: '18:00', store: '銅鑼灣時代廣場', jobTitle: '餐飲服務員',  company: '美食集團',       status: 'upcoming' },
];

const STATUS_CONFIG: Record<string, { label: string; shortLabel: string; bg: string; color: string; dotBg: string }> = {
  normal:   { label: '正常',      shortLabel: '正常', bg: '#DCFCE7', color: '#15803D', dotBg: '#15803D' },
  late:     { label: '遲到/早退', shortLabel: '遲到', bg: '#FEF3DC', color: '#D4891A', dotBg: '#D4891A' },
  absent:   { label: '缺勤',      shortLabel: '缺勤', bg: '#FEE2E2', color: '#D93025', dotBg: '#D93025' },
  upcoming: { label: '待出勤',    shortLabel: '待',   bg: '#EEF8FF', color: '#3B5BDB', dotBg: '#3B5BDB' },
  today:    { label: '今日',      shortLabel: '今日', bg: '#EEF8FF', color: '#3B5BDB', dotBg: '#3B5BDB' },
  leave:    { label: '休假中',    shortLabel: '假',   bg: '#EEF1F8', color: '#818CF8', dotBg: '#818CF8' },
  none:     { label: '休',        shortLabel: '休',   bg: '#F7F8FC', color: '#CBD1E1', dotBg: '#CBD1E1' },
};

function withSeq(shifts: Shift[]): Array<Shift & { seqInDay: number }> {
  const counter: Record<string, number> = {};
  return shifts.map((s) => {
    const key = `${s.month}-${s.day}`;
    counter[key] = (counter[key] ?? 0) + 1;
    return { ...s, seqInDay: counter[key] };
  });
}

function firstDOW(year: number, month0: number) {
  return (new Date(year, month0, 1).getDay() + 6) % 7;
}
function daysInMonth(year: number, month0: number) {
  return new Date(year, month0 + 1, 0).getDate();
}

// ── Shift list card ───────────────────────────────────────
function ShiftListCard({ shift, seqInDay, onDetail }: { shift: Shift; seqInDay: number; onDetail: (s: Shift) => void }) {
  const cfg = STATUS_CONFIG[shift.status];
  const showClocks = ['normal', 'late', 'absent', 'today'].includes(shift.status);
  const isLate = shift.status === 'late';
  return (
    <button onClick={() => onDetail(shift)} className="w-full rounded-2xl p-4 flex flex-col gap-3 text-left transition-all active:scale-[0.98]"
      style={{ background: '#FFFFFF', boxShadow: CARD_SHADOW, border: CARD_BORDER, cursor: 'pointer' }}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <p style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0F1623', margin: 0 }}>{shift.month}月{shift.day}日（{shift.dayLabel}）</p>
          <span className="rounded-full px-2 py-0.5" style={{ background: '#EEF8FF', color: '#3B5BDB', fontSize: '0.65rem', fontWeight: 700 }}>第{seqInDay}班</span>
        </div>
        <span className="rounded-full px-2.5 py-0.5" style={{ background: cfg.bg, color: cfg.color, fontSize: '0.7rem', fontWeight: 700 }}>{cfg.label}</span>
      </div>
      {/* Job info — no icon */}
      <div>
        <p style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0F1623', margin: 0 }}>{shift.jobTitle}</p>
        <div className="flex items-center gap-1.5 mt-0.5">
          <Clock size={11} style={{ color: '#9CA3AF' }} />
          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#6B7A99' }}>{shift.start} – {shift.end}</span>
          <span style={{ fontSize: '0.68rem', color: '#D1D5DB' }}>·</span>
          
        </div>
      </div>
      {/* Compact clock row */}
      {showClocks && (
        <div className="flex items-center gap-2 rounded-xl px-3 py-2" style={{ background: '#F7F8FC', border: CARD_BORDER }}>
          <span style={{ fontSize: '0.7rem', color: '#9CA3AF', fontWeight: 600 }}>上班</span>
          <span style={{ fontSize: '0.82rem', fontWeight: 800, color: shift.clockIn ? (isLate ? '#D4891A' : '#15803D') : '#CBD1E1' }}>{shift.clockIn ?? '--:--'}</span>
          <span style={{ flex: 1, textAlign: 'center', fontSize: '0.62rem', color: '#D1D5DB' }}>·</span>
          <span style={{ fontSize: '0.7rem', color: '#9CA3AF', fontWeight: 600 }}>下班</span>
          <span style={{ fontSize: '0.82rem', fontWeight: 800, color: shift.clockOut ? '#15803D' : '#CBD1E1' }}>{shift.clockOut ?? '--:--'}</span>
          {isLate && shift.clockIn && <span style={{ fontSize: '0.6rem', color: '#D4891A', fontWeight: 700, marginLeft: 2 }}>遲到</span>}
        </div>
      )}
    </button>
  );
}

// ── Shift detail page ─────────────────────────────────────
function ShiftDetailPage({ shift, onBack }: { shift: Shift; onBack: () => void }) {
  const cfg = STATUS_CONFIG[shift.status];
  const showClocks = ['normal', 'late', 'absent', 'today'].includes(shift.status);
  const isLate = shift.status === 'late';

  // Flat row component
  function R({ label, value, highlight, phone }: { label: string; value: string; highlight?: boolean; phone?: boolean }) {
    return (
      <div className="flex items-start justify-between py-3" style={{ borderBottom: '1px solid rgba(15,22,35,0.05)' }}>
        <span style={{ fontSize: '0.78rem', color: '#9CA3AF', flexShrink: 0, width: 80 }}>{label}</span>
        {phone
          ? <a href={`tel:${value}`} style={{ fontSize: '0.85rem', fontWeight: 600, color: '#3B5BDB', textDecoration: 'none', textAlign: 'right', flex: 1 }}>{value}</a>
          : <span style={{ fontSize: '0.85rem', fontWeight: highlight ? 700 : 600, color: highlight ? '#15803D' : '#0F1623', textAlign: 'right', flex: 1, marginLeft: 8 }}>{value}</span>}
      </div>
    );
  }
  function SectionLabel({ title, right }: { title: string; right?: React.ReactNode }) {
    return (
      null
    );
  }

  return (
    <div className="absolute inset-0 z-20 flex flex-col" style={{ background: '#FFFFFF' }}>
      <div className="shrink-0 flex items-center gap-3 px-4 py-3" style={{ background: '#FFFFFF', borderBottom: CARD_BORDER }}>
        <button onClick={onBack} className="flex items-center justify-center rounded-xl" style={{ width: 36, height: 36, background: '#EEF1F8', border: 'none', cursor: 'pointer' }}>
          <ChevronLeft size={18} style={{ color: '#0F1623' }} />
        </button>
        <div className="flex-1">
          <h2 style={{ fontSize: '0.98rem', fontWeight: 700, color: '#0F1623', margin: 0 }}>排班詳情</h2>
          <p style={{ fontSize: '0.72rem', color: '#9CA3AF', margin: '1px 0 0 0' }}>{shift.month}月{shift.day}日（{shift.dayLabel}）</p>
        </div>
        <span className="rounded-full px-2.5 py-1" style={{ background: cfg.bg, color: cfg.color, fontSize: '0.7rem', fontWeight: 700 }}>{cfg.label}</span>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-8" style={{ scrollbarWidth: 'none' }}>
        {/* Flat info list — all in one card-like block with section labels */}

        <SectionLabel title="崗位資訊" />
        <R label="崗位名稱" value={shift.jobTitle} />
        <R label="公司" value={shift.company} />
        <R label="門店" value={shift.store} />
        {shift.address && <R label="地址" value={shift.address} />}

        <SectionLabel title="班次資訊" />
        <R label="日期" value={`${shift.month}月${shift.day}日（${shift.dayLabel}）`} />
        <R label="班次時間" value={`${shift.start} – ${shift.end}`} />

        {shift.supervisor && <>
          <SectionLabel title="負責人" />
          <R label="姓名" value={shift.supervisor} />
          {shift.supervisorPhone && <R label="電話" value={shift.supervisorPhone} phone />}
        </>}

        {shift.payroll && <>
          <SectionLabel title="工時與薪酬"
            right={<span className="flex items-center gap-1 rounded-full px-2 py-0.5" style={{ background: shift.payroll.status === 'confirmed' ? '#DCFCE7' : '#FEF3DC', fontSize: '0.6rem', fontWeight: 700, color: shift.payroll.status === 'confirmed' ? '#15803D' : '#D4891A' }}>
              {shift.payroll.status === 'confirmed' ? <><Check size={8} style={{ color: '#15803D' }} />商戶確認</> : '待確認'}
            </span>}
          />
          <R label="計薪方式" value="按小時" />
          <R label="確認工時" value={shift.payroll.quantity} />
          <R label="確認薪資" value={shift.payroll.amount} highlight />
          {shift.payroll.note && (
            <div className="py-3" style={{ borderBottom: '1px solid rgba(15,22,35,0.05)' }}>
              <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#D4891A' }}>薪資說明　</span>
              <span style={{ fontSize: '0.82rem', color: '#92580A' }}>{shift.payroll.note}</span>
            </div>
          )}
        </>}

        {/* Clock records */}
        {showClocks && <>
          <SectionLabel title="打卡記錄" />
          {[
            { label: '上班打卡', time: shift.clockIn,  loc: shift.clockInLocation,  late: isLate && !!shift.clockIn },
            { label: '下班打卡', time: shift.clockOut, loc: shift.clockOutLocation, late: false },
          ].map(({ label, time, loc, late }) => (
            <div key={label}>
              <div className="flex items-center justify-between py-3" style={{ borderBottom: loc || time ? 'none' : '1px solid rgba(15,22,35,0.05)' }}>
                <span style={{ fontSize: '0.78rem', color: '#9CA3AF', width: 80 }}>{label}</span>
                <span style={{ fontSize: '0.88rem', fontWeight: 700, color: time ? (late ? '#D4891A' : '#15803D') : '#CBD1E1' }}>
                  {time ?? '未打卡'}{late ? '（遲到/早退）' : ''}
                </span>
              </div>
              {loc && (
                <div className="flex items-center gap-1.5 py-2" style={{ paddingLeft: 80, borderBottom: 'none' }}>
                  <MapPin size={11} style={{ color: '#9CA3AF' }} />
                  <span style={{ fontSize: '0.73rem', color: '#9CA3AF' }}>{loc}</span>
                </div>
              )}
              {time && (
                <div className="flex items-center justify-center rounded-xl mb-2" style={{ height: 64, background: '#F7F8FC', border: '1.5px dashed rgba(15,22,35,0.1)' }}>
                  <span style={{ fontSize: '0.7rem', color: '#CBD1E1' }}>打卡照片</span>
                </div>
              )}
              {!time && <div style={{ borderBottom: '1px solid rgba(15,22,35,0.05)', marginBottom: 0 }} />}
            </div>
          ))}
          {/* Supplement record */}
          <div className="flex items-center justify-between py-3" style={{ borderBottom: '1px solid rgba(15,22,35,0.05)' }}>
            <span style={{ fontSize: '0.78rem', color: '#9CA3AF', width: 80 }}>補打卡</span>
            <span style={{ fontSize: '0.82rem', color: '#CBD1E1' }}>暫無補打卡記錄</span>
          </div>
        </>}

        {/* Location guide — at bottom */}
        {shift.address && <>
          <SectionLabel title="前往地點指引" />
          
        </>}

      </div>
    </div>
  );
}

// ── Month calendar ────────────────────────────────────────
function MonthCalendar({ year, month0, shifts, selectedDay, onDayClick }: {
  year: number; month0: number; shifts: Shift[];
  selectedDay: { day: number } | null;
  onDayClick: (day: number, dayLabel: string) => void;
}) {
  const DAY_LABELS = ['一', '二', '三', '四', '五', '六', '日'];
  const total = daysInMonth(year, month0);
  const startDOW = firstDOW(year, month0);
  const shiftMap: Record<number, ShiftStatus> = {};
  shifts.forEach((s) => {
    const priority: Record<ShiftStatus, number> = { absent: 5, late: 4, today: 3, upcoming: 2, leave: 1, normal: 0, off: -1 };
    if (!shiftMap[s.day] || (priority[s.status] ?? 0) > (priority[shiftMap[s.day]] ?? 0)) shiftMap[s.day] = s.status;
  });
  const cells: Array<{ day: number | null; dayLabel: string }> = [];
  for (let i = 0; i < startDOW; i++) cells.push({ day: null, dayLabel: '' });
  for (let d = 1; d <= total; d++) cells.push({ day: d, dayLabel: DAY_LABELS[(startDOW + d - 1) % 7] });
  while (cells.length % 7 !== 0) cells.push({ day: null, dayLabel: '' });
  const isCurrentMonth = year === 2026 && month0 === 5;
  return (
    <div className="flex flex-col gap-2">
      <div className="grid" style={{ gridTemplateColumns: 'repeat(7, 1fr)', gap: 2 }}>
        {DAY_LABELS.map((d) => <div key={d} className="flex items-center justify-center" style={{ height: 28 }}><span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#9CA3AF' }}>{d}</span></div>)}
      </div>
      <div className="grid" style={{ gridTemplateColumns: 'repeat(7, 1fr)', gap: 5 }}>
        {cells.map((cell, i) => {
          if (!cell.day) return <div key={i} />;
          const isToday = isCurrentMonth && cell.day === 20;
          const isSelected = selectedDay?.day === cell.day;
          const status = shiftMap[cell.day];
          const cfg = status ? STATUS_CONFIG[status] : null;
          return (
            <button key={i} onClick={() => cell.day && onDayClick(cell.day, cell.dayLabel)}
              className="flex flex-col items-center rounded-xl transition-all active:scale-[0.88]"
              style={{ background: isToday ? '#3B5BDB' : isSelected ? '#EEF8FF' : 'transparent', border: isSelected && !isToday ? '1.5px solid rgba(59,91,219,0.3)' : '1.5px solid transparent', cursor: 'pointer', padding: '6px 0 5px', gap: 2 }}>
              <span style={{ fontSize: '0.88rem', fontWeight: isToday ? 800 : isSelected ? 700 : 500, color: isToday ? '#FFFFFF' : isSelected ? '#3B5BDB' : cfg ? '#0F1623' : '#9CA3AF', lineHeight: 1.25 }}>{cell.day}</span>
              {/* Colored dot below day number */}
              <div className="rounded-full" style={{ width: 5, height: 5, background: isToday ? 'rgba(255,255,255,0.8)' : cfg ? cfg.dotBg : 'transparent' }} />
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
        {[{ l: '需出勤', v: `${required}天`, c: '#0F1623' }, { l: '正常', v: `${normal}天`, c: '#15803D' }, { l: '遲到/早退', v: `${late}次`, c: '#D4891A' }, { l: '缺勤', v: `${absent}天`, c: '#D93025' }].map(({ l, v, c }) => (
          <div key={l} className="flex flex-col items-center gap-0.5">
            <span style={{ fontSize: '0.92rem', fontWeight: 800, color: c }}>{v}</span>
            <span style={{ fontSize: '0.62rem', color: '#9CA3AF' }}>{l}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Leave / OT sheet ──────────────────────────────────────
function RequestSheet({ title, children, onClose }: { title: string; children: React.ReactNode; onClose: () => void }) {
  return (
    <>
      <div className="absolute inset-0 z-40" style={{ background: 'rgba(15,22,35,0.45)', backdropFilter: 'blur(2px)' }} onClick={onClose} />
      <div className="absolute left-0 right-0 bottom-0 z-50 rounded-t-2xl px-5 py-6 flex flex-col gap-4" style={{ background: '#FFFFFF', boxShadow: '0 -8px 40px rgba(15,22,35,0.15)', maxHeight: '80vh', overflowY: 'auto' }}>
        <div className="flex items-center justify-between">
          <p style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0F1623', margin: 0 }}>{title}</p>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}><XIcon size={18} style={{ color: '#9CA3AF' }} /></button>
        </div>
        {children}
      </div>
    </>
  );
}

// ── Main component ────────────────────────────────────────
export function ShiftPage({ onSubPageChange }: { onSubPageChange?: (active: boolean) => void }) {
  const [monthOffset, setMonthOffset] = useState(0);
  const [selectedDay, setSelectedDay] = useState<{ day: number; dayLabel: string } | null>(null);
  const [detailShift, setDetailShift] = useState<Shift | null>(null);
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar');

  // Leave sheet
  const [showLeaveSheet, setShowLeaveSheet] = useState(false);
  const [leaveStart, setLeaveStart] = useState('');
  const [leaveEnd, setLeaveEnd]     = useState('');
  const [leaveReason, setLeaveReason] = useState('');
  const [leaveDone, setLeaveDone]   = useState(false);

  // Overtime sheet
  const [showOtSheet, setShowOtSheet] = useState(false);
  const [otDate, setOtDate]           = useState('');
  const [otStart, setOtStart]         = useState('');
  const [otEnd, setOtEnd]             = useState('');
  const [otReason, setOtReason]       = useState('');
  const [otDone, setOtDone]           = useState(false);

  const BASE = { year: 2026, month0: 5 };
  const totalMonths = BASE.year * 12 + BASE.month0 + monthOffset;
  const displayYear   = Math.floor(totalMonths / 12);
  const displayMonth0 = totalMonths % 12;
  const displayMonth1 = displayMonth0 + 1;
  const MONTH_NAMES = ['1月','2月','3月','4月','5月','6月','7月','8月','9月','10月','11月','12月'];
  const monthLabel = `${displayYear}年${MONTH_NAMES[displayMonth0]}`;

  const monthShifts = ALL_SHIFTS.filter((s) => s.month === displayMonth1);

  function handleDayClick(day: number, dayLabel: string) {
    setSelectedDay((prev) => (prev?.day === day ? null : { day, dayLabel }));
  }

  const rawList = selectedDay
    ? monthShifts.filter((s) => s.day === selectedDay.day)
    : monthShifts.filter((s) => s.status !== 'off');
  const displayList = withSeq(rawList);
  const listTitle = selectedDay
    ? `${displayMonth1}月${selectedDay.day}日（${selectedDay.dayLabel}）的排班`
    : `${MONTH_NAMES[displayMonth0]}排班`;

  function submitLeave() {
    if (!leaveStart || !leaveReason.trim()) return;
    setLeaveStart(''); setLeaveEnd(''); setLeaveReason(''); setLeaveDone(true);
  }
  function submitOt() {
    if (!otDate || !otStart || !otEnd || !otReason.trim()) return;
    setOtDate(''); setOtStart(''); setOtEnd(''); setOtReason(''); setOtDone(true);
  }

  return (
    <div className="size-full flex flex-col overflow-hidden" style={{ background: '#F7F8FC' }}>
      {/* Header */}
      <div className="shrink-0" style={{ background: '#FFFFFF', borderBottom: CARD_BORDER }}>
        <div className="px-4 pt-4 pb-1" style={{ paddingRight: 104 }}>
          <h1 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0F1623', margin: 0, letterSpacing: '-0.02em' }}>我的排班</h1>
        </div>
        {/* Month navigator + view toggle on same row */}
        <div className="flex items-center gap-2 px-4 py-2.5">
          <button onClick={() => { setMonthOffset((p) => p - 1); setSelectedDay(null); }} disabled={monthOffset <= -6}
            className="flex items-center justify-center rounded-xl transition-all"
            style={{ width: 30, height: 30, background: '#EEF1F8', border: CARD_BORDER, cursor: monthOffset <= -6 ? 'not-allowed' : 'pointer', opacity: monthOffset <= -6 ? 0.4 : 1, flexShrink: 0 }}>
            <ChevronLeft size={14} style={{ color: '#6B7A99' }} />
          </button>
          <p style={{ fontSize: '0.92rem', fontWeight: 700, color: '#0F1623', margin: 0, flex: 1, textAlign: 'center' }}>{monthLabel}</p>
          <button onClick={() => { setMonthOffset((p) => p + 1); setSelectedDay(null); }} disabled={monthOffset >= 6}
            className="flex items-center justify-center rounded-xl transition-all"
            style={{ width: 30, height: 30, background: '#EEF1F8', border: CARD_BORDER, cursor: monthOffset >= 6 ? 'not-allowed' : 'pointer', opacity: monthOffset >= 6 ? 0.4 : 1, flexShrink: 0 }}>
            <ChevronRight size={14} style={{ color: '#6B7A99' }} />
          </button>
          <div style={{ width: 1, height: 18, background: 'rgba(15,22,35,0.1)', flexShrink: 0 }} />
          {/* Calendar / List toggle */}
          <div className="flex rounded-xl p-0.5 shrink-0" style={{ background: '#EEF1F8' }}>
            {([['calendar', <Calendar key="c" size={12} />], ['list', <List key="l" size={12} />]] as const).map(([mode, icon]) => (
              <button key={mode} onClick={() => { setViewMode(mode); setSelectedDay(null); }}
                className="flex items-center justify-center rounded-lg px-2 py-1.5 transition-all"
                style={{ background: viewMode === mode ? '#FFFFFF' : 'transparent', border: 'none', cursor: 'pointer', color: viewMode === mode ? '#0F1623' : '#9CA3AF', boxShadow: viewMode === mode ? '0 1px 4px rgba(15,22,35,0.1)' : 'none' }}>
                {icon}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-4" style={{ scrollbarWidth: 'none' }}>

        {/* Leave / OT entry buttons */}
        <div className="flex gap-3">
          {[
            { label: '請假申請', color: '#3B5BDB', bg: '#EEF8FF', onClick: () => { setLeaveDone(false); setShowLeaveSheet(true); } },
            { label: '加班申請', color: '#15803D', bg: '#DCFCE7', onClick: () => { setOtDone(false); setShowOtSheet(true); } },
          ].map(({ label, color, bg, onClick }) => (
            null
          ))}
        </div>

        {viewMode === 'calendar' ? (
          <>
            {/* Status legend — dot + label */}
            <div className="flex items-center gap-3 flex-wrap">
              {[
                { color: '#15803D', label: '正常' },
                { color: '#D4891A', label: '遲到/早退' },
                { color: '#D93025', label: '缺勤' },
                { color: '#3B5BDB', label: '待/今日' },
                { color: '#818CF8', label: '假' },
              ].map(({ color, label }) => (
                <div key={label} className="flex items-center gap-1">
                  <div className="rounded-full shrink-0" style={{ width: 6, height: 6, background: color }} />
                  <span style={{ fontSize: '0.62rem', color: '#9CA3AF' }}>{label}</span>
                </div>
              ))}
            </div>
            <div className="rounded-2xl p-4" style={{ background: '#FFFFFF', boxShadow: CARD_SHADOW, border: CARD_BORDER }}>
              <MonthCalendar year={displayYear} month0={displayMonth0} shifts={monthShifts} selectedDay={selectedDay} onDayClick={handleDayClick} />
            </div>
            <MonthSummary label="本月總結" shifts={monthShifts} />
          </>
        ) : (
          <MonthSummary label="本月總結" shifts={monthShifts} />
        )}

        {/* Shift list */}
        <div className="flex flex-col gap-3">
          <h3 style={{ fontSize: '0.8rem', fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.08em', margin: 0 }}>{listTitle}</h3>
          {displayList.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-8">
              <div className="flex items-center justify-center rounded-2xl" style={{ width: 52, height: 52, background: '#EEF1F8' }}>
                <Calendar size={22} style={{ color: '#CBD1E1' }} />
              </div>
              <p style={{ fontSize: '0.86rem', color: '#9CA3AF', fontWeight: 600, margin: 0 }}>{selectedDay ? '此日無排班' : '本月暫無排班'}</p>
            </div>
          ) : (
            displayList.map((s) => <ShiftListCard key={s.id} shift={s} seqInDay={s.seqInDay} onDetail={(sh) => { setDetailShift(sh); onSubPageChange?.(true); }} />)
          )}
        </div>

        <div style={{ height: 16 }} />
      </div>

      {/* Shift detail overlay */}
      {detailShift && <ShiftDetailPage shift={detailShift} onBack={() => { setDetailShift(null); onSubPageChange?.(false); }} />}

      {/* Leave sheet */}
      {showLeaveSheet && (
        <RequestSheet title="請假申請" onClose={() => setShowLeaveSheet(false)}>
          {leaveDone ? (
            <div className="flex flex-col items-center gap-4 py-4">
              <div className="flex items-center justify-center rounded-full" style={{ width: 56, height: 56, background: '#EEF8FF' }}>
                <Check size={24} style={{ color: '#3B5BDB' }} />
              </div>
              <p style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0F1623', margin: 0 }}>請假申請已提交</p>
              <p style={{ fontSize: '0.8rem', color: '#6B7A99', margin: 0 }}>商戶審核後將以通知告知</p>
              <button onClick={() => setShowLeaveSheet(false)} className="w-full rounded-xl py-3" style={{ background: '#EEF1F8', border: 'none', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 600, color: '#6B7A99' }}>關閉</button>
            </div>
          ) : (
            <>
              <div className="flex gap-3">
                {[{ label: '開始日期', val: leaveStart, set: setLeaveStart }, { label: '結束日期', val: leaveEnd, set: setLeaveEnd }].map(({ label, val, set }) => (
                  <div key={label} className="flex flex-col gap-1.5 flex-1">
                    <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#6B7A99' }}>{label}{label === '開始日期' && <span style={{ color: '#D93025' }}> *</span>}</span>
                    <input type="date" value={val} onChange={(e) => set(e.target.value)} style={{ padding: '10px 12px', borderRadius: '0.75rem', border: '1.5px solid rgba(15,22,35,0.1)', fontSize: '0.88rem', color: '#0F1623', background: '#F7F8FC', outline: 'none', fontFamily: 'inherit', width: '100%', boxSizing: 'border-box' }} />
                  </div>
                ))}
              </div>
              <div className="flex flex-col gap-1.5">
                <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#6B7A99' }}>請假原因 <span style={{ color: '#D93025' }}>*</span></span>
                <textarea value={leaveReason} onChange={(e) => setLeaveReason(e.target.value)} placeholder="請填寫請假原因…" rows={3}
                  style={{ padding: '12px 14px', borderRadius: '0.75rem', border: '1.5px solid rgba(15,22,35,0.1)', fontSize: '0.9rem', color: '#0F1623', background: '#F7F8FC', outline: 'none', fontFamily: 'inherit', resize: 'none', width: '100%', boxSizing: 'border-box', lineHeight: 1.6 }} />
              </div>
              <button onClick={submitLeave} disabled={!leaveStart || !leaveReason.trim()}
                className="w-full rounded-xl py-3 transition-all active:scale-[0.98]"
                style={{ background: (leaveStart && leaveReason.trim()) ? '#3B5BDB' : '#EEF1F8', color: (leaveStart && leaveReason.trim()) ? '#FFFFFF' : '#9CA3AF', border: 'none', cursor: (leaveStart && leaveReason.trim()) ? 'pointer' : 'not-allowed', fontSize: '0.95rem', fontWeight: 700 }}>
                提交請假申請
              </button>
            </>
          )}
        </RequestSheet>
      )}

      {/* Overtime sheet */}
      {showOtSheet && (
        <RequestSheet title="加班申請" onClose={() => setShowOtSheet(false)}>
          {otDone ? (
            <div className="flex flex-col items-center gap-4 py-4">
              <div className="flex items-center justify-center rounded-full" style={{ width: 56, height: 56, background: '#DCFCE7' }}>
                <Check size={24} style={{ color: '#15803D' }} />
              </div>
              <p style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0F1623', margin: 0 }}>加班申請已提交</p>
              <p style={{ fontSize: '0.8rem', color: '#6B7A99', margin: 0 }}>商戶審核後將以通知告知</p>
              <button onClick={() => setShowOtSheet(false)} className="w-full rounded-xl py-3" style={{ background: '#EEF1F8', border: 'none', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 600, color: '#6B7A99' }}>關閉</button>
            </div>
          ) : (
            <>
              <div className="flex flex-col gap-1.5">
                <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#6B7A99' }}>加班日期 <span style={{ color: '#D93025' }}>*</span></span>
                <input type="date" value={otDate} onChange={(e) => setOtDate(e.target.value)} style={{ padding: '10px 12px', borderRadius: '0.75rem', border: '1.5px solid rgba(15,22,35,0.1)', fontSize: '0.88rem', color: '#0F1623', background: '#F7F8FC', outline: 'none', fontFamily: 'inherit', width: '100%', boxSizing: 'border-box' }} />
              </div>
              <div className="flex gap-3">
                {[{ label: '開始時間', val: otStart, set: setOtStart, ph: '18:00' }, { label: '結束時間', val: otEnd, set: setOtEnd, ph: '21:00' }].map(({ label, val, set, ph }) => (
                  <div key={label} className="flex flex-col gap-1.5 flex-1">
                    <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#6B7A99' }}>{label} <span style={{ color: '#D93025' }}>*</span></span>
                    <input type="time" value={val} onChange={(e) => set(e.target.value)} placeholder={ph} style={{ padding: '10px 12px', borderRadius: '0.75rem', border: '1.5px solid rgba(15,22,35,0.1)', fontSize: '0.88rem', color: '#0F1623', background: '#F7F8FC', outline: 'none', fontFamily: 'inherit', width: '100%', boxSizing: 'border-box' }} />
                  </div>
                ))}
              </div>
              <div className="flex flex-col gap-1.5">
                <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#6B7A99' }}>加班原因 <span style={{ color: '#D93025' }}>*</span></span>
                <textarea value={otReason} onChange={(e) => setOtReason(e.target.value)} placeholder="請填寫加班原因…" rows={3}
                  style={{ padding: '12px 14px', borderRadius: '0.75rem', border: '1.5px solid rgba(15,22,35,0.1)', fontSize: '0.9rem', color: '#0F1623', background: '#F7F8FC', outline: 'none', fontFamily: 'inherit', resize: 'none', width: '100%', boxSizing: 'border-box', lineHeight: 1.6 }} />
              </div>
              <button onClick={submitOt} disabled={!otDate || !otStart || !otEnd || !otReason.trim()}
                className="w-full rounded-xl py-3 transition-all active:scale-[0.98]"
                style={{ background: (otDate && otStart && otEnd && otReason.trim()) ? '#15803D' : '#EEF1F8', color: (otDate && otStart && otEnd && otReason.trim()) ? '#FFFFFF' : '#9CA3AF', border: 'none', cursor: (otDate && otStart && otEnd && otReason.trim()) ? 'pointer' : 'not-allowed', fontSize: '0.95rem', fontWeight: 700 }}>
                提交加班申請
              </button>
            </>
          )}
        </RequestSheet>
      )}
    </div>
  );
}
