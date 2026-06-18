import { Language, translations } from './i18n';
import { JobHistoryView } from './JobHistoryView';

interface JobHistoryPageProps {
  lang: Language;
  onViewJob?: (jobId: number) => void;
}

export function JobHistoryPage({ lang, onViewJob }: JobHistoryPageProps) {
  const t = translations[lang];
  return (
    <div className="size-full flex flex-col overflow-hidden" style={{ background: '#F7F8FC' }}>
      <div
        className="shrink-0 px-4 py-4"
        style={{ background: '#FFFFFF', borderBottom: '1px solid rgba(15,22,35,0.06)' }}
      >
        <h1 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0F1623', margin: 0 }}>
          {t.jobHistoryTitle}
        </h1>
      </div>
      <JobHistoryView lang={lang} onViewJob={onViewJob} />
    </div>
  );
}
