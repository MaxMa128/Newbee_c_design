import { MapPin, Clock } from 'lucide-react';
import { Language, translations } from './i18n';
import { Job, formatTime, getSalaryStr, SETTLEMENT_LABELS } from './jobData';

interface JobCardProps {
  job: Job;
  lang: Language;
  onClick?: () => void;
}

export function JobCard({ job, lang, onClick }: JobCardProps) {
  const t = translations[lang];
  const salaryStr = getSalaryStr(job, t);
  const settlementLabel = SETTLEMENT_LABELS[job.salarySettlement][lang];

  return (
    <div
      onClick={onClick}
      className="bg-card rounded-2xl p-4 transition-all duration-150 hover:shadow-md active:scale-[0.99]"
      style={{
        boxShadow: '0 1px 3px rgba(15,22,35,0.06), 0 4px 16px rgba(15,22,35,0.04)',
        border: '1px solid rgba(15,22,35,0.06)',
        cursor: 'pointer',
      }}
    >
      {/* Tags row — jobType + urgent + settlement period */}
      <div className="flex flex-wrap gap-1.5 mb-3">
        {job.isUrgent && (
          <span className="rounded-md px-2 py-0.5" style={{ fontSize: '0.7rem', fontWeight: 700, background: '#FEF3DC', color: '#D4891A', border: '1px solid rgba(245,166,35,0.25)' }}>
            {t.urgentTag}
          </span>
        )}
        <span className="rounded-md px-2 py-0.5" style={{ fontSize: '0.7rem', fontWeight: 700, background: '#EEF1F8', color: '#1A2B4A', border: '1px solid rgba(15,22,35,0.08)' }}>
          {job.jobType === 'full-time' ? t.fullTimeTag : job.jobType === 'part-time' ? t.partTimeTag : t.casualTag}
        </span>
        <span className="rounded-md px-2 py-0.5" style={{ fontSize: '0.7rem', fontWeight: 700, background: '#F0F4FF', color: '#3B5BDB', border: '1px solid rgba(59,91,219,0.15)' }}>
          {settlementLabel}
        </span>
      </div>

      {/* Header: logo + title + salary */}
      <div className="flex items-start gap-3">
        <div
          className="shrink-0 flex items-center justify-center rounded-xl"
          style={{ width: 44, height: 44, background: job.logoColor + '16', border: `1.5px solid ${job.logoColor}22` }}
        >
          <span style={{ fontSize: '1rem', fontWeight: 800, color: job.logoColor }}>{job.logo}</span>
        </div>

        <div className="flex-1 min-w-0">
          <h3 style={{ fontSize: '0.98rem', fontWeight: 700, color: '#0F1623', lineHeight: 1.3, margin: 0, letterSpacing: '-0.01em' }}>
            {job.title[lang]}
          </h3>
          <p style={{ fontSize: '0.78rem', color: '#6B7A99', fontWeight: 500, margin: '2px 0 0' }}>
            {job.company}
          </p>
        </div>

        {/* Salary — top right */}
        <div className="shrink-0 text-right">
          <span style={{ fontSize: '1rem', fontWeight: 800, color: '#0F1623', letterSpacing: '-0.02em', whiteSpace: 'nowrap' }}>
            {salaryStr}
          </span>
        </div>
      </div>

      {/* Location + time */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-3">
        <div className="flex items-center gap-1.5">
          <MapPin size={12} style={{ color: '#9CA3AF', flexShrink: 0 }} />
          <span style={{ fontSize: '0.74rem', color: '#6B7A99' }}>
            {job.district[lang]} · {job.mtr[lang]}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <Clock size={12} style={{ color: '#9CA3AF', flexShrink: 0 }} />
          <span style={{ fontSize: '0.74rem', color: '#9CA3AF' }}>
            {formatTime(job.postedMinutes, lang)}
          </span>
        </div>
      </div>

      {/* Work sites — horizontal scroll with count + right-fade hint */}
      <div className="flex items-center justify-between mt-3 mb-1.5">
        <span style={{ fontSize: '0.65rem', fontWeight: 600, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          工作網點
        </span>
        <span style={{ fontSize: '0.65rem', fontWeight: 600, color: '#9CA3AF' }}>
          共 {job.workSites.length} 個
          {job.workSites.length > 2 ? '　← 右滑查看更多' : ''}
        </span>
      </div>
      <div style={{ position: 'relative' }}>
        <div
          className="flex gap-2"
          style={{ overflowX: 'auto', scrollbarWidth: 'none', paddingBottom: 2 }}
        >
        {job.workSites.map((site) => {
          const shift = site.shifts[0];
          const isFull = site.remainingRegular === 0;
          const slots = shift?.slots ?? [];
          const SHOW = 2; // max slots before collapsing
          const extra = slots.length - SHOW;
          return (
            <div
              key={site.id}
              className="shrink-0 rounded-xl px-3 py-2.5 flex flex-col gap-1.5"
              style={{
                background: isFull ? '#F7F8FC' : '#FFFFFF',
                border: `1px solid ${isFull ? 'rgba(15,22,35,0.07)' : 'rgba(15,22,35,0.1)'}`,
                minWidth: shift?.type === 'fixed' ? 158 : 170,
                maxWidth: 200,
                boxShadow: isFull ? 'none' : '0 1px 4px rgba(15,22,35,0.06)',
              }}
            >
              {/* Site name */}
              <p style={{ fontSize: '0.74rem', fontWeight: 700, color: isFull ? '#9CA3AF' : '#0F1623', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {site.name[lang]}
              </p>
              {/* Shift display — three formats */}
              {shift && shift.type === 'fixed' && slots[0] && (
                <p style={{ fontSize: '0.68rem', color: '#6B7A99', margin: 0 }}>
                  {slots[0].day}　{slots[0].start}–{slots[0].end}
                </p>
              )}
              {shift && shift.type !== 'fixed' && slots.length > 0 && (
                <div className="flex flex-col gap-1">
                  {slots.slice(0, SHOW).map((sl, i) => (
                    <div key={i} className="flex items-center gap-1">
                      <span style={{ fontSize: '0.62rem', fontWeight: 600, color: '#9CA3AF', flexShrink: 0 }}>{sl.day}</span>
                      <span style={{ fontSize: '0.62rem', color: '#6B7A99', flexShrink: 0 }}>{sl.start}–{sl.end}</span>
                    </div>
                  ))}
                  {extra > 0 && (
                    <span style={{ fontSize: '0.6rem', fontWeight: 600, color: '#3B5BDB' }}>+{extra} 更多班次</span>
                  )}
                </div>
              )}
              {/* Meal / shuttle — only when available */}
              {(site.hasMeal || site.hasShuttle) && (
                <div className="flex items-center gap-1.5">
                  {site.hasMeal && (
                    <span style={{ fontSize: '0.6rem', fontWeight: 600, color: '#15803D' }}>有飯鐘</span>
                  )}
                  {site.hasMeal && site.hasShuttle && (
                    <span style={{ fontSize: '0.58rem', color: '#D1D5DB' }}>·</span>
                  )}
                  {site.hasShuttle && (
                    <span style={{ fontSize: '0.6rem', fontWeight: 600, color: '#3B5BDB' }}>有班車</span>
                  )}
                </div>
              )}
              {/* Headcount row — remaining colored, total in gray */}
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-0.5">
                  <span style={{ fontSize: '0.62rem', color: '#6B7A99' }}>正</span>
                  <span style={{ fontSize: '0.7rem', fontWeight: 800, color: site.remainingRegular === 0 ? '#D93025' : '#15803D' }}>
                    {site.remainingRegular}
                  </span>
                  <span style={{ fontSize: '0.6rem', color: '#D1D5DB' }}>/</span>
                  <span style={{ fontSize: '0.65rem', fontWeight: 500, color: '#9CA3AF' }}>
                    {site.headcountRegular}
                  </span>
                </div>
                <span style={{ fontSize: '0.6rem', color: '#D1D5DB' }}>·</span>
                <div className="flex items-center gap-0.5">
                  <span style={{ fontSize: '0.62rem', color: '#9CA3AF' }}>候</span>
                  <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#D4891A' }}>
                    {site.remainingStandby}
                  </span>
                  <span style={{ fontSize: '0.6rem', color: '#D1D5DB' }}>/</span>
                  <span style={{ fontSize: '0.65rem', fontWeight: 500, color: '#9CA3AF' }}>
                    {site.headcountStandby}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
        </div>
        {/* Right-edge gradient fade — signals more content to scroll */}
        {job.workSites.length > 2 && (
          <div style={{
            position: 'absolute', top: 0, right: 0, bottom: 2, width: 40, pointerEvents: 'none',
            background: 'linear-gradient(to right, transparent, #FFFFFF)',
          }} />
        )}
      </div>
    </div>
  );
}
