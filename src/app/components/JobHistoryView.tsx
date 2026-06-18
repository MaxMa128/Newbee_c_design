import { useState } from 'react';
import { ChevronRight } from 'lucide-react';
import { motion } from 'motion/react';
import { Language, translations } from './i18n';

export type HistoryStatus = 'approved' | 'pending' | 'closed' | 'standby';

const CARD_SHADOW = '0 1px 3px rgba(15,22,35,0.06), 0 4px 16px rgba(15,22,35,0.04)';
const CARD_BORDER = '1px solid rgba(15,22,35,0.06)';

export const jobHistoryItems: Array<{
  id: number;
  jobId: number;
  title: Record<string, string>;
  company: string;
  district: Record<string, string>;
  date: string;
  status: HistoryStatus;
}> = [
  { id: 1, jobId: 1,  title: { 'zh-HK': '展覽助理', 'zh-CN': '展览助理', en: 'Exhibition Assistant' },      company: 'HKCEC',          district: { 'zh-HK': '灣仔',  'zh-CN': '湾仔',  en: 'Wan Chai' },       date: '2026-06-12', status: 'approved' },
  { id: 2, jobId: 4,  title: { 'zh-HK': '倉務員',   'zh-CN': '仓务员',   en: 'Warehouse Picker' },           company: 'SF Express',     district: { 'zh-HK': '荃灣',  'zh-CN': '荃湾',  en: 'Tsuen Wan' },      date: '2026-05-28', status: 'closed' },
  { id: 3, jobId: 3,  title: { 'zh-HK': '店舖理貨員', 'zh-CN': '店铺理货员', en: 'Stock Replenisher' },      company: '零售連鎖',        district: { 'zh-HK': '沙田',  'zh-CN': '沙田',  en: 'Sha Tin' },        date: '2026-06-14', status: 'standby' },
  { id: 4, jobId: 2,  title: { 'zh-HK': '餐飲服務員', 'zh-CN': '餐饮服务员', en: 'Restaurant Server' },      company: '美食集團',        district: { 'zh-HK': '銅鑼灣', 'zh-CN': '铜锣湾', en: 'Causeway Bay' },  date: '2026-05-15', status: 'pending' },
  { id: 5, jobId: 6,  title: { 'zh-HK': '保安員',   'zh-CN': '保安员',   en: 'Security Guard' },             company: 'Galaxy Security', district: { 'zh-HK': '將軍澳', 'zh-CN': '将军澳', en: 'Tseung Kwan O' }, date: '2026-05-01', status: 'approved' },
  { id: 6, jobId: 5,  title: { 'zh-HK': '零售店員', 'zh-CN': '零售店员', en: 'Retail Assistant' },           company: 'Uniqlo',         district: { 'zh-HK': '觀塘',  'zh-CN': '观塘',  en: 'Kwun Tong' },      date: '2026-04-18', status: 'pending' },
  { id: 7, jobId: 8,  title: { 'zh-HK': '派傳單推廣員', 'zh-CN': '派传单推广员', en: 'Promoter' },           company: 'MediaLink',      district: { 'zh-HK': '深水埗', 'zh-CN': '深水埗', en: 'Sham Shui Po' },  date: '2026-04-05', status: 'closed' },
];

export const historyStatusMeta: Record<HistoryStatus, { label: string; bg: string; color: string }> = {
  approved: { label: '已通過', bg: '#DCFCE7', color: '#15803D' },
  pending:  { label: '申請中', bg: '#FEF3DC', color: '#D4891A' },
  closed:   { label: '已關閉', bg: '#EEF1F8', color: '#6B7A99' },
  standby:  { label: '候選中', bg: '#EEF1FF', color: '#3B5BDB' },
};

type JobFilter = HistoryStatus | null;

interface JobHistoryViewProps {
  lang: Language;
  onViewJob?: (jobId: number) => void;
}

export function JobHistoryView({ lang, onViewJob }: JobHistoryViewProps) {
  const t = translations[lang];
  const [filter, setFilter] = useState<JobFilter>(null);

  const tabs: { key: HistoryStatus; label: string }[] = [
    { key: 'approved', label: '已通過' },
    { key: 'pending',  label: '申請中' },
    { key: 'standby',  label: '候選中' },
    { key: 'closed',   label: '已關閉' },
  ];

  const filtered = filter ? jobHistoryItems.filter((item) => item.status === filter) : jobHistoryItems;

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Tabs */}
      <div className="flex gap-2 px-4 pt-4 pb-2 shrink-0 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
        <button
          onClick={() => setFilter(null)}
          className="shrink-0 rounded-xl px-3 py-1.5"
          style={{
            background: filter === null ? '#0F1623' : '#FFFFFF',
            color: filter === null ? '#FFFFFF' : '#6B7A99',
            border: filter === null ? 'none' : '1.5px solid rgba(15,22,35,0.1)',
            fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer',
            boxShadow: filter === null ? '0 2px 8px rgba(15,22,35,0.2)' : CARD_SHADOW,
          }}
        >
          全部
        </button>
        {tabs.map((tab) => {
          const active = filter === tab.key;
          const meta = historyStatusMeta[tab.key];
          const count = jobHistoryItems.filter((i) => i.status === tab.key).length;
          return (
            <button
              key={tab.key}
              onClick={() => setFilter(active ? null : tab.key)}
              className="shrink-0 rounded-xl px-3 py-1.5"
              style={{
                background: active ? '#0F1623' : '#FFFFFF',
                color: active ? '#FFFFFF' : '#6B7A99',
                border: active ? 'none' : '1.5px solid rgba(15,22,35,0.1)',
                fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer',
                boxShadow: active ? '0 2px 8px rgba(15,22,35,0.2)' : CARD_SHADOW,
              }}
            >
              {tab.label}
              {!active && count > 0 && (
                <span style={{ marginLeft: 4, fontSize: '0.68rem', fontWeight: 700, color: meta.color }}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-2 flex flex-col gap-3" style={{ scrollbarWidth: 'none' }}>
        <p style={{ fontSize: '0.73rem', color: '#9CA3AF', fontWeight: 600 }}>
          {filtered.length} {t.jobRecordCount}
        </p>
        {filtered.length === 0 && (
          <div className="py-10 flex flex-col items-center gap-2">
            <p style={{ fontSize: '0.88rem', color: '#9CA3AF' }}>暫無相關記錄</p>
          </div>
        )}
        {filtered.map((item, i) => {
          const meta = historyStatusMeta[item.status];
          return (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.22, delay: i * 0.05 }}
              onClick={() => onViewJob?.(item.jobId)}
              className="rounded-2xl p-4 transition-all active:scale-[0.99]"
              style={{ background: '#FFFFFF', boxShadow: CARD_SHADOW, border: CARD_BORDER, cursor: 'pointer' }}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0F1623', margin: 0 }}>{item.title[lang]}</h3>
                  <p style={{ fontSize: '0.78rem', color: '#6B7A99', margin: '3px 0 0 0' }}>{item.company} · {item.district[lang]}</p>
                  <p style={{ fontSize: '0.73rem', color: '#9CA3AF', margin: '3px 0 0 0' }}>{item.date}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="rounded-lg px-2.5 py-1" style={{ background: meta.bg, color: meta.color, fontSize: '0.72rem', fontWeight: 700 }}>
                    {meta.label}
                  </span>
                  <ChevronRight size={14} style={{ color: '#CBD1E1' }} />
                </div>
              </div>
            </motion.div>
          );
        })}
        <div className="h-2" />
      </div>
    </div>
  );
}
