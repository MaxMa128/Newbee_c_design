import { useState } from 'react';
import { X, Check } from 'lucide-react';
import { Language, translations } from './i18n';
import { WORK_CATEGORIES } from './jobData';

interface FilterSheetProps {
  lang: Language;
  onClose: () => void;
  onApply: (filters: FilterState) => void;
  current: FilterState;
}

export interface FilterState {
  category: string;
  district: string;
}

export const defaultFilters: FilterState = {
  category: '',
  district: '',
};

// Grouped districts
const HK_DISTRICTS = {
  'zh-HK': {
    '香港島': ['中西區', '灣仔區', '東區', '南區'],
    '九龍': ['油尖旺區', '深水埗區', '九龍城區', '黃大仙區', '觀塘區'],
    '新界': ['荃灣區', '屯門區', '元朗區', '北區', '大埔區', '西貢區', '沙田區', '葵青區', '離島區'],
  },
  'zh-CN': {
    '香港岛': ['中西区', '湾仔区', '东区', '南区'],
    '九龙': ['油尖旺区', '深水埗区', '九龙城区', '黄大仙区', '观塘区'],
    '新界': ['荃湾区', '屯门区', '元朗区', '北区', '大埔区', '西贡区', '沙田区', '葵青区', '离岛区'],
  },
  en: {
    'HK Island': ['Central & Western', 'Wan Chai', 'Eastern', 'Southern'],
    'Kowloon': ['Yau Tsim Mong', 'Sham Shui Po', 'Kowloon City', 'Wong Tai Sin', 'Kwun Tong'],
    'New Territories': ['Tsuen Wan', 'Tuen Mun', 'Yuen Long', 'North', 'Tai Po', 'Sai Kung', 'Sha Tin', 'Kwai Tsing', 'Islands'],
  },
};

export function FilterSheet({ lang, onClose, onApply, current }: FilterSheetProps) {
  const t = translations[lang];
  const [f, setF] = useState<FilterState>(current);

  const groups = HK_DISTRICTS[lang] as Record<string, string[]>;

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col justify-end"
      style={{ background: 'rgba(15,22,35,0.5)' }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="rounded-t-3xl bg-card flex flex-col max-h-[88vh]"
        style={{ boxShadow: '0 -8px 40px rgba(15,22,35,0.15)', background: '#FFFFFF' }}
      >
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1 shrink-0">
          <div className="w-10 h-1 rounded-full" style={{ background: '#E5E7EB' }} />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 shrink-0">
          <h2 style={{ fontSize: '1rem', fontWeight: 700, color: '#0F1623' }}>{t.filterTitle}</h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full"
            style={{ background: '#EEF1F8', color: '#6B7A99', border: 'none', cursor: 'pointer' }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-5 pb-4 flex flex-col gap-6" style={{ scrollbarWidth: 'none' }}>

          {/* 工作種類 */}
          <section>
            <div className="flex items-center justify-between mb-3">
              <p style={{ fontSize: '0.8rem', fontWeight: 700, color: '#0F1623', margin: 0 }}>工作種類</p>
              {f.category && (
                <button onClick={() => setF({ ...f, category: '' })} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.75rem', color: '#F5A623', fontWeight: 600 }}>
                  清除
                </button>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {WORK_CATEGORIES.map((cat) => {
                const active = f.category === cat;
                return (
                  <button
                    key={cat}
                    onClick={() => setF({ ...f, category: active ? '' : cat })}
                    className="flex items-center gap-1.5 rounded-xl px-3 py-2 transition-all"
                    style={{
                      background: active ? '#0F1623' : '#EEF1F8',
                      color: active ? '#FFFFFF' : '#6B7A99',
                      fontSize: '0.8rem', fontWeight: 600, border: 'none', cursor: 'pointer',
                    }}
                  >
                    {active && <Check size={11} style={{ flexShrink: 0 }} />}
                    {cat}
                  </button>
                );
              })}
            </div>
          </section>

          {/* 地區 */}
          <section>
            <div className="flex items-center justify-between mb-3">
              <p style={{ fontSize: '0.8rem', fontWeight: 700, color: '#0F1623', margin: 0 }}>地區</p>
              {f.district && (
                <button onClick={() => setF({ ...f, district: '' })} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.75rem', color: '#F5A623', fontWeight: 600 }}>
                  清除
                </button>
              )}
            </div>
            <div className="flex flex-col gap-4">
              {Object.entries(groups).map(([region, dists]) => (
                <div key={region}>
                  <p style={{ fontSize: '0.7rem', fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 8px 0' }}>{region}</p>
                  <div className="grid grid-cols-3 gap-2">
                    {dists.map((d) => {
                      const active = f.district === d;
                      return (
                        <button
                          key={d}
                          onClick={() => setF({ ...f, district: active ? '' : d })}
                          className="rounded-xl py-2 transition-all"
                          style={{
                            background: active ? '#0F1623' : '#EEF1F8',
                            color: active ? '#FFFFFF' : '#6B7A99',
                            fontSize: '0.75rem', fontWeight: active ? 700 : 600,
                            border: 'none', cursor: 'pointer',
                          }}
                        >
                          {d}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className="flex gap-3 px-5 py-4 shrink-0" style={{ borderTop: '1px solid rgba(15,22,35,0.06)' }}>
          <button
            onClick={() => setF(defaultFilters)}
            className="flex-1 rounded-xl py-3"
            style={{ background: '#EEF1F8', color: '#6B7A99', fontSize: '0.9rem', fontWeight: 600, border: 'none', cursor: 'pointer' }}
          >
            {t.reset}
          </button>
          <button
            onClick={() => { onApply(f); onClose(); }}
            style={{ flex: 2, background: '#F5A623', color: '#0F1623', fontSize: '0.9rem', fontWeight: 700, border: 'none', cursor: 'pointer', borderRadius: '0.75rem' }}
          >
            {t.confirm}
          </button>
        </div>
      </div>
    </div>
  );
}
