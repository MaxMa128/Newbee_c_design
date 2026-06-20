import { useState } from 'react';
import { Shield, Briefcase, Clock, Banknote, Check, X as XIcon, Bell, ChevronRight } from 'lucide-react';

const CARD_SHADOW = '0 1px 3px rgba(15,22,35,0.06), 0 4px 16px rgba(15,22,35,0.04)';
const CARD_BORDER = '1px solid rgba(15,22,35,0.06)';

type NotifCategory = 'system' | 'job' | 'attendance' | 'payroll';
type NotifType     = 'success' | 'fail' | 'info' | 'reminder';

export type NavTarget =
  | { type: 'jobs' }                          // seeking tab 0 — job feed
  | { type: 'job-history' }                   // seeking tab 1 — application history
  | { type: 'verify' }                        // open HKID verify flow
  | { type: 'shift' }                         // employed tab 1 — shift calendar
  | { type: 'attendance' }                    // employed tab 0 — clock-in
  | { type: 'wallet' }                        // profile → wallet (no specific entry)
  | { type: 'wallet-detail'; txId: number }   // profile → wallet → specific tx detail
  | { type: 'job-detail'; jobId: number };    // specific job detail overlay

interface Notification {
  id: number;
  category: NotifCategory;
  type: NotifType;
  title: string;
  body: string;
  time: string;
  group: 'today' | 'earlier';
  isRead: boolean;
  actionLabel?: string;
  navTarget?: NavTarget;
}

const CAT_CONFIG: Record<NotifCategory, { label: string; bg: string; color: string; icon: React.ReactNode }> = {
  system:     { label: '系統通知', bg: '#EEF1F8', color: '#6B7A99', icon: <Shield    size={15} /> },
  job:        { label: '崗位通知', bg: '#EEF8FF', color: '#3B5BDB', icon: <Briefcase size={15} /> },
  attendance: { label: '考勤排班', bg: '#FEF3DC', color: '#D4891A', icon: <Clock     size={15} /> },
  payroll:    { label: '薪資結算', bg: '#DCFCE7', color: '#15803D', icon: <Banknote  size={15} /> },
};

const TYPE_BADGE: Record<NotifType, { bg: string; icon: React.ReactNode } | null> = {
  success:  { bg: '#15803D', icon: <Check size={8} style={{ color: '#FFFFFF' }} /> },
  fail:     { bg: '#D93025', icon: <XIcon size={8} style={{ color: '#FFFFFF' }} /> },
  reminder: { bg: '#D4891A', icon: <Bell  size={8} style={{ color: '#FFFFFF' }} /> },
  info:     null,
};

const ALL_NOTIFICATIONS: Notification[] = [
  // ── 系統通知 ──
  {
    id: 1, category: 'system', type: 'success', group: 'earlier',
    title: '身份認證已通過',
    body: '你的身份認證已通過，現在可以申請職位。',
    time: '3天前', isRead: true, actionLabel: '前往搵工',
    navTarget: { type: 'jobs' },
  },
  {
    id: 2, category: 'system', type: 'fail', group: 'earlier',
    title: '身份認證未通過',
    body: '你的身份認證未通過，原因：上傳照片不清晰，請重新填寫並提交。',
    time: '7天前', isRead: true, actionLabel: '重新認證',
    navTarget: { type: 'verify' },
  },
  // ── 崗位通知 ──
  {
    id: 3, category: 'job', type: 'info', group: 'today',
    title: '申請已提交',
    body: '你已申請「展覽場地助理（灣仔會展中心）」職位，請等待商戶審核。',
    time: '今日 14:32', isRead: false, actionLabel: '查看申請詳情',
    navTarget: { type: 'job-history' },
  },
  {
    id: 4, category: 'job', type: 'success', group: 'earlier',
    title: '申請已通過',
    body: '你申請的「餐飲服務員（銅鑼灣時代廣場）」職位已通過，並已生成排班，請前往查看。',
    time: '2天前', isRead: true, actionLabel: '查看排班',
    navTarget: { type: 'shift' },
  },
  {
    id: 5, category: 'job', type: 'fail', group: 'earlier',
    title: '崗位已關閉',
    body: '你申請的「倉務員（荃灣倉庫）」崗位已關閉，可繼續申請其他職位。',
    time: '5天前', isRead: true, actionLabel: '查看詳情',
    navTarget: { type: 'job-history' },
  },
  // ── 考勤排班 ──
  {
    id: 6, category: 'attendance', type: 'info', group: 'today',
    title: '新排班通知',
    body: '你有新的工作排班（餐飲服務員），上班時間為 6月22日 10:00–18:00。如有問題，請提前聯繫商戶。',
    time: '今日 09:00', isRead: false, actionLabel: '查看排班詳情',
    navTarget: { type: 'shift' },
  },
  {
    id: 7, category: 'attendance', type: 'reminder', group: 'today',
    title: '打卡提醒',
    body: '你將在今日 10:00 前需要打卡上班，請提前到達銅鑼灣時代廣場並按時打卡。',
    time: '今日 08:30', isRead: false, actionLabel: '前往打卡',
    navTarget: { type: 'attendance' },
  },
  {
    id: 8, category: 'attendance', type: 'fail', group: 'earlier',
    title: '排班已取消',
    body: '你的「展覽場地助理」職位排班已取消，原因：商戶臨時更改活動安排。如有問題，請與商戶溝通。',
    time: '3天前', isRead: true, actionLabel: '查看職位詳情',
    navTarget: { type: 'job-detail', jobId: 1 },
  },
  {
    id: 9, category: 'attendance', type: 'success', group: 'earlier',
    title: '補打卡申請已通過',
    body: '你的補打卡申請（6月18日，餐飲服務員）已通過，當天考勤已恢復正常。如有異議，請聯繫商戶或平台客服。',
    time: '2天前', isRead: true, actionLabel: '查看排班',
    navTarget: { type: 'shift' },
  },
  // ── 薪資結算 ──
  {
    id: 10, category: 'payroll', type: 'success', group: 'today',
    title: '工時已確認',
    body: '你 6月19日（餐飲服務員）的工時已由商戶審核確認，薪資 HK$640 已計入待支付金額。',
    time: '今日 11:15', isRead: false, actionLabel: '查看帳單詳情',
    navTarget: { type: 'wallet-detail', txId: 1 },   // tx 1: 工資入帳 HK$640 (6月19日)
  },
  {
    id: 11, category: 'payroll', type: 'info', group: 'earlier',
    title: '出糧申請已提交',
    body: '你的出糧申請已提交，金額為 HK$720，請等待平台處理。',
    time: '2天前', isRead: true, actionLabel: '查看出糧詳情',
    navTarget: { type: 'wallet-detail', txId: 6 },   // tx 6: 出糧申請中 HK$720
  },
  {
    id: 12, category: 'payroll', type: 'success', group: 'earlier',
    title: '薪資已發放',
    body: '平台已確認發薪，金額 HK$640，錢包金額已更新。如有疑問，請聯繫平台客服。',
    time: '5天前', isRead: true, actionLabel: '查看帳單詳情',
    navTarget: { type: 'wallet-detail', txId: 2 },   // tx 2: 出糧確認 HK$640
  },
];

type TabKey = 'all' | NotifCategory;

const TABS: Array<{ key: TabKey; label: string }> = [
  { key: 'all',        label: '全部' },
  { key: 'system',     label: '系統' },
  { key: 'job',        label: '崗位' },
  { key: 'attendance', label: '考勤' },
  { key: 'payroll',    label: '薪資' },
];

// ── Notification card ────────────────────────────────────
function NotifCard({
  notif,
  showCategory,
  onMarkRead,
  onNavigate,
}: {
  notif: Notification;
  showCategory: boolean;
  onMarkRead: (id: number) => void;
  onNavigate?: (target: NavTarget) => void;
}) {
  const cat  = CAT_CONFIG[notif.category];
  const badge = TYPE_BADGE[notif.type];

  return (
    <div
      className="rounded-2xl px-4 py-3.5 flex gap-3 transition-all active:scale-[0.99]"
      style={{
        background: notif.isRead ? '#FFFFFF' : '#F5F8FF',
        boxShadow: CARD_SHADOW,
        border: notif.isRead ? CARD_BORDER : '1px solid rgba(59,91,219,0.12)',
        cursor: 'pointer',
      }}
      onClick={() => {
        if (!notif.isRead) onMarkRead(notif.id);
        if (notif.navTarget && onNavigate) onNavigate(notif.navTarget);
      }}
    >
      {/* Icon + type badge */}
      <div className="shrink-0 relative mt-0.5">
        <div
          className="flex items-center justify-center rounded-xl"
          style={{ width: 38, height: 38, background: cat.bg }}
        >
          <span style={{ color: cat.color }}>{cat.icon}</span>
        </div>
        {badge && (
          <div
            className="absolute flex items-center justify-center rounded-full"
            style={{ width: 14, height: 14, background: badge.bg, top: -3, right: -3, border: '1.5px solid #FFFFFF' }}
          >
            {badge.icon}
          </div>
        )}
        {!notif.isRead && (
          <div
            className="absolute rounded-full"
            style={{ width: 7, height: 7, background: '#3B5BDB', top: -2, left: -2, border: '1.5px solid #F5F8FF', boxShadow: '0 0 4px rgba(59,91,219,0.4)' }}
          />
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 flex flex-col gap-1">
        {/* Title row */}
        <div className="flex items-start justify-between gap-2">
          <p style={{ fontSize: '0.85rem', fontWeight: notif.isRead ? 600 : 700, color: '#0F1623', margin: 0, lineHeight: 1.3 }}>
            {notif.title}
          </p>
          <span style={{ fontSize: '0.62rem', color: '#CBD1E1', fontWeight: 500, flexShrink: 0, marginTop: 2 }}>
            {notif.time}
          </span>
        </div>

        {/* Body */}
        <p
          style={{ fontSize: '0.78rem', color: '#6B7A99', margin: 0, lineHeight: 1.55, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}
        >
          {notif.body}
        </p>

        {/* Footer: category chip + action */}
        <div className="flex items-center justify-between mt-0.5">
          {showCategory ? (
            <span className="rounded-full px-2 py-0.5" style={{ background: cat.bg, color: cat.color, fontSize: '0.62rem', fontWeight: 700 }}>
              {cat.label}
            </span>
          ) : (
            <div />
          )}
          {notif.actionLabel && (
            <div className="flex items-center gap-0.5">
              <span style={{ fontSize: '0.73rem', color: '#3B5BDB', fontWeight: 600 }}>{notif.actionLabel}</span>
              <ChevronRight size={11} style={{ color: '#3B5BDB' }} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Section header ────────────────────────────────────────
function SectionHeader({ label }: { label: string }) {
  return (
    <p style={{ fontSize: '0.72rem', fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.08em', margin: 0, padding: '4px 0 2px' }}>
      {label}
    </p>
  );
}

// ── Main component ────────────────────────────────────────
interface MessagesPageProps {
  onNavigate?: (target: NavTarget) => void;
}

export function MessagesPage({ onNavigate }: MessagesPageProps = {}) {
  const [activeTab, setActiveTab] = useState<TabKey>('all');
  const [notifications, setNotifications] = useState<Notification[]>(ALL_NOTIFICATIONS);

  function markRead(id: number) {
    setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, isRead: true } : n));
  }

  function markAllRead() {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  }

  const filtered = activeTab === 'all'
    ? notifications
    : notifications.filter((n) => n.category === activeTab);

  const todayList    = filtered.filter((n) => n.group === 'today');
  const earlierList  = filtered.filter((n) => n.group === 'earlier');

  const unreadCount = (key: TabKey) =>
    (key === 'all' ? notifications : notifications.filter((n) => n.category === key))
      .filter((n) => !n.isRead).length;

  const totalUnread = unreadCount('all');

  return (
    <div className="size-full flex flex-col overflow-hidden" style={{ background: '#F7F8FC' }}>
      {/* Header */}
      <div className="shrink-0 px-4 pt-4 pb-0" style={{ background: '#FFFFFF', borderBottom: CARD_BORDER }}>
        <div className="flex items-center gap-2 mb-3">
          <h1 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0F1623', margin: 0, letterSpacing: '-0.02em' }}>訊息中心</h1>
          {totalUnread > 0 && (
            <span className="flex items-center justify-center rounded-full" style={{ minWidth: 18, height: 18, background: '#3B5BDB', padding: '0 4px', fontSize: '0.6rem', fontWeight: 800, color: '#FFFFFF' }}>
              {totalUnread}
            </span>
          )}
          <div style={{ flex: 1 }} />
          <button
            onClick={markAllRead}
            style={{
              background: 'none', border: 'none', cursor: 'pointer', padding: '2px 0',
              fontSize: '0.75rem', fontWeight: 600, color: '#3B5BDB',
              visibility: totalUnread > 0 ? 'visible' : 'hidden',
            }}
          >
            全部已讀
          </button>
        </div>

        {/* Tab strip */}
        <div className="flex gap-1 overflow-x-auto pb-3" style={{ scrollbarWidth: 'none' }}>
          {TABS.map(({ key, label }) => {
            const count = unreadCount(key);
            const isActive = activeTab === key;
            return (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className="shrink-0 flex items-center gap-1 rounded-xl px-3.5 py-1.5 transition-all"
                style={{
                  background: isActive ? '#0F1623' : '#EEF1F8',
                  color: isActive ? '#FFFFFF' : '#6B7A99',
                  border: 'none', cursor: 'pointer',
                  fontSize: '0.78rem', fontWeight: 600,
                }}
              >
                {label}
                {count > 0 && (
                  <span
                    className="flex items-center justify-center rounded-full"
                    style={{ minWidth: 14, height: 14, background: isActive ? 'rgba(255,255,255,0.3)' : '#3B5BDB', padding: '0 3px', fontSize: '0.55rem', fontWeight: 800, color: '#FFFFFF' }}
                  >
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-4" style={{ scrollbarWidth: 'none' }}>

        {/* Today */}
        {todayList.length > 0 && (
          <div className="flex flex-col gap-2.5">
            <SectionHeader label="今日" />
            {todayList.map((n) => (
              <NotifCard key={n.id} notif={n} showCategory={activeTab === 'all'} onMarkRead={markRead} onNavigate={onNavigate} />
            ))}
          </div>
        )}

        {/* Earlier */}
        {earlierList.length > 0 && (
          <div className="flex flex-col gap-2.5">
            <SectionHeader label="更早" />
            {earlierList.map((n) => (
              <NotifCard key={n.id} notif={n} showCategory={activeTab === 'all'} onMarkRead={markRead} onNavigate={onNavigate} />
            ))}
          </div>
        )}

        {/* Empty state */}
        {filtered.length === 0 && (
          <div className="flex flex-col items-center gap-4 py-16">
            <div className="flex items-center justify-center rounded-2xl" style={{ width: 64, height: 64, background: '#EEF1F8' }}>
              <Bell size={26} style={{ color: '#CBD1E1' }} />
            </div>
            <div className="text-center">
              <p style={{ fontSize: '0.9rem', fontWeight: 600, color: '#9CA3AF', margin: 0 }}>暫無通知</p>
              <p style={{ fontSize: '0.78rem', color: '#CBD1E1', margin: '4px 0 0 0' }}>此類別暫時沒有新消息</p>
            </div>
          </div>
        )}

        <div style={{ height: 16 }} />
      </div>
    </div>
  );
}
