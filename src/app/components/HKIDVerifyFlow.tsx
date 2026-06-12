import { useState, useEffect, useRef } from 'react';
import { ChevronLeft, Upload, Camera, CheckCircle2, XCircle, Shield, FileText, User, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

type Step = 'intro' | 'upload-id' | 'face-scan' | 'reviewing' | 'success' | 'fail';

interface HKIDVerifyFlowProps {
  onClose: () => void;
  onSuccess: () => void;
}

const CARD_SHADOW = '0 1px 3px rgba(15,22,35,0.06), 0 4px 16px rgba(15,22,35,0.04)';
const CARD_BORDER = '1px solid rgba(15,22,35,0.06)';

function StepDots({ step }: { step: Step }) {
  const steps: Step[] = ['upload-id', 'face-scan', 'reviewing'];
  const idx = steps.indexOf(step);
  return (
    <div className="flex items-center gap-1.5">
      {steps.map((_, i) => (
        <div
          key={i}
          style={{
            width: i === idx ? 18 : 6,
            height: 6,
            borderRadius: 3,
            background: i <= idx ? '#F5A623' : '#D1D5DB',
            transition: 'all 0.3s',
          }}
        />
      ))}
    </div>
  );
}

// ── Intro step ──────────────────────────────────────────
function IntroStep({ onStart }: { onStart: () => void }) {
  return (
    <div className="flex-1 flex flex-col px-5 py-6">
      {/* Icon */}
      <div className="flex flex-col items-center gap-4 py-6">
        <div className="relative">
          <div className="flex items-center justify-center rounded-3xl" style={{ width: 80, height: 80, background: '#FEF3DC', border: '3px solid rgba(245,166,35,0.25)' }}>
            <Shield size={36} style={{ color: '#F5A623' }} />
          </div>
          <div className="absolute -bottom-1 -right-1 flex items-center justify-center rounded-full" style={{ width: 26, height: 26, background: '#0F1623', border: '2.5px solid #FFFFFF' }}>
            <span style={{ fontSize: '0.6rem', color: '#F5A623', fontWeight: 800 }}>HK</span>
          </div>
        </div>
        <div className="text-center">
          <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0F1623', margin: '0 0 8px 0', letterSpacing: '-0.02em' }}>香港身份證認證</h2>
          <p style={{ fontSize: '0.85rem', color: '#6B7A99', lineHeight: 1.65, margin: 0 }}>
            申請工作前，需完成身份認證以確保平台安全，整個過程約需 2 分鐘。
          </p>
        </div>
      </div>

      {/* Steps preview */}
      <div className="flex flex-col gap-3 mb-6">
        {[
          { icon: <FileText size={16} style={{ color: '#F5A623' }} />, num: '01', title: '上傳香港身份證', desc: '拍攝或上傳 HKID 正面照片' },
          { icon: <Camera size={16} style={{ color: '#F5A623' }} />, num: '02', title: '人臉識別', desc: '自拍一張照片以核對身份' },
          { icon: <Shield size={16} style={{ color: '#F5A623' }} />, num: '03', title: '系統核驗', desc: '幾秒鐘完成，自動顯示結果' },
        ].map((item) => (
          <div key={item.num} className="flex items-start gap-3 rounded-2xl p-3.5" style={{ background: '#FFFFFF', boxShadow: CARD_SHADOW, border: CARD_BORDER }}>
            <div className="flex items-center justify-center rounded-xl shrink-0" style={{ width: 38, height: 38, background: '#FEF3DC' }}>
              {item.icon}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-0.5">
                <span style={{ fontSize: '0.65rem', fontWeight: 800, color: '#F5A623', letterSpacing: '0.08em' }}>{item.num}</span>
                <p style={{ fontSize: '0.88rem', fontWeight: 700, color: '#0F1623', margin: 0 }}>{item.title}</p>
              </div>
              <p style={{ fontSize: '0.78rem', color: '#9CA3AF', margin: 0 }}>{item.desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Privacy note */}
      <div className="flex items-start gap-2 rounded-xl px-3 py-2.5 mb-6" style={{ background: '#F7F8FC', border: '1px solid rgba(15,22,35,0.07)' }}>
        <Shield size={12} style={{ color: '#9CA3AF', flexShrink: 0, marginTop: 2 }} />
        <p style={{ fontSize: '0.75rem', color: '#9CA3AF', lineHeight: 1.6, margin: 0 }}>
          您的身份證資料將按香港《個人資料（私隱）條例》受到保護，僅用於身份核驗，不會用作其他用途。
        </p>
      </div>

      <button
        onClick={onStart}
        className="w-full rounded-xl py-4 transition-all active:scale-[0.98]"
        style={{ background: '#F5A623', border: 'none', cursor: 'pointer', fontSize: '1rem', fontWeight: 700, color: '#0F1623' }}
      >
        開始認證
      </button>
    </div>
  );
}

// ── Upload HKID step ────────────────────────────────────
function UploadIDStep({ onNext }: { onNext: () => void }) {
  const [uploaded, setUploaded] = useState(false);
  const [dragging, setDragging] = useState(false);

  function simulateUpload() {
    setUploaded(true);
  }

  return (
    <div className="flex-1 flex flex-col px-5 py-6">
      <div className="mb-6">
        <h2 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0F1623', margin: '0 0 6px 0' }}>上傳香港身份證</h2>
        <p style={{ fontSize: '0.82rem', color: '#6B7A99', margin: 0, lineHeight: 1.6 }}>
          請拍攝或上傳 HKID 正面清晰照片，確保四角完整、字跡清晰。
        </p>
      </div>

      {/* Upload zone */}
      {uploaded ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}
          className="rounded-2xl overflow-hidden mb-5"
          style={{ border: '2px solid #15803D', background: '#F0FDF4' }}
        >
          {/* Simulated HKID card preview */}
          <div className="flex flex-col items-center justify-center gap-3 py-10 px-6">
            <div
              className="flex items-center justify-center rounded-2xl"
              style={{ width: 56, height: 56, background: '#DCFCE7' }}
            >
              <CheckCircle2 size={28} style={{ color: '#15803D' }} />
            </div>
            <div className="text-center">
              <p style={{ fontSize: '0.92rem', fontWeight: 700, color: '#15803D', margin: '0 0 4px 0' }}>身份證上傳成功</p>
              <p style={{ fontSize: '0.75rem', color: '#166534' }}>HKID_front.jpg</p>
            </div>
          </div>
          <div className="px-4 pb-4">
            <button
              onClick={() => setUploaded(false)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.78rem', fontWeight: 600, color: '#6B7A99', textDecoration: 'underline' }}
            >
              重新上傳
            </button>
          </div>
        </motion.div>
      ) : (
        <button
          onClick={simulateUpload}
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => { e.preventDefault(); setDragging(false); simulateUpload(); }}
          className="w-full flex flex-col items-center justify-center gap-3 rounded-2xl py-10 mb-5 transition-all active:scale-[0.99]"
          style={{
            border: `2px dashed ${dragging ? '#F5A623' : 'rgba(15,22,35,0.15)'}`,
            background: dragging ? '#FFFBEB' : '#F7F8FC',
            cursor: 'pointer',
          }}
        >
          <div className="flex items-center justify-center rounded-2xl" style={{ width: 56, height: 56, background: '#FEF3DC' }}>
            <Upload size={24} style={{ color: '#D4891A' }} />
          </div>
          <div className="text-center px-4">
            <p style={{ fontSize: '0.92rem', fontWeight: 700, color: '#0F1623', margin: '0 0 4px 0' }}>點擊上傳身份證正面</p>
            <p style={{ fontSize: '0.75rem', color: '#9CA3AF', margin: 0 }}>支援 JPG、PNG，最大 10MB</p>
          </div>
          <div className="flex items-center gap-1.5 rounded-xl px-4 py-2" style={{ background: '#FEF3DC' }}>
            <Camera size={14} style={{ color: '#D4891A' }} />
            <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#D4891A' }}>拍攝或從相簿選取</span>
          </div>
        </button>
      )}

      {/* Tips */}
      <div className="rounded-xl px-3 py-3 mb-6 flex flex-col gap-2" style={{ background: '#FFFBEB', border: '1px solid rgba(245,166,35,0.25)' }}>
        <p style={{ fontSize: '0.72rem', fontWeight: 700, color: '#D4891A', margin: 0 }}>拍攝提示</p>
        {['確保身份證四角完整可見', '光線充足，避免反光或陰影', '字跡及照片需清晰可辨'].map((tip, i) => (
          <div key={i} className="flex items-center gap-2">
            <div style={{ width: 4, height: 4, borderRadius: '50%', background: '#F5A623', flexShrink: 0 }} />
            <span style={{ fontSize: '0.78rem', color: '#92580A' }}>{tip}</span>
          </div>
        ))}
      </div>

      <button
        onClick={onNext}
        disabled={!uploaded}
        className="w-full rounded-xl py-4 transition-all active:scale-[0.98]"
        style={{
          background: uploaded ? '#F5A623' : '#E5E7EB',
          border: 'none',
          cursor: uploaded ? 'pointer' : 'not-allowed',
          fontSize: '1rem',
          fontWeight: 700,
          color: uploaded ? '#0F1623' : '#9CA3AF',
        }}
      >
        下一步：人臉識別
      </button>
    </div>
  );
}

// ── Face scan step ──────────────────────────────────────
function FaceScanStep({ onNext }: { onNext: () => void }) {
  const [phase, setPhase] = useState<'idle' | 'camera' | 'captured'>('idle');
  const [countdown, setCountdown] = useState(3);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  function startCamera() {
    setPhase('camera');
    setCountdown(3);
    let c = 3;
    intervalRef.current = setInterval(() => {
      c -= 1;
      setCountdown(c);
      if (c <= 0) {
        clearInterval(intervalRef.current!);
        setPhase('captured');
      }
    }, 1000);
  }

  useEffect(() => () => { if (intervalRef.current) clearInterval(intervalRef.current); }, []);

  return (
    <div className="flex-1 flex flex-col px-5 py-6">
      <div className="mb-6">
        <h2 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0F1623', margin: '0 0 6px 0' }}>人臉識別</h2>
        <p style={{ fontSize: '0.82rem', color: '#6B7A99', margin: 0, lineHeight: 1.6 }}>
          請按下按鈕自拍一張照片，系統將與您的身份證相片核對。
        </p>
      </div>

      {/* Camera preview area */}
      <div className="flex flex-col items-center mb-6">
        {phase === 'idle' && (
          <div
            className="flex flex-col items-center justify-center gap-4 rounded-3xl"
            style={{ width: 220, height: 220, background: '#EEF1F8', border: '2px dashed rgba(15,22,35,0.15)' }}
          >
            <User size={48} style={{ color: '#CBD1E1' }} />
            <p style={{ fontSize: '0.78rem', color: '#9CA3AF', textAlign: 'center', margin: 0, padding: '0 20px' }}>請確保面部清晰可見，光線充足</p>
          </div>
        )}

        {phase === 'camera' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="relative">
            {/* Simulated camera feed */}
            <div
              className="flex flex-col items-center justify-center rounded-3xl overflow-hidden"
              style={{ width: 220, height: 220, background: '#1A2335', border: '3px solid #F5A623' }}
            >
              {/* Fake camera UI */}
              <div className="flex items-center justify-center" style={{ width: 80, height: 80, borderRadius: '50%', background: 'rgba(245,166,35,0.15)', border: '2px solid rgba(245,166,35,0.4)' }}>
                <User size={36} style={{ color: 'rgba(245,166,35,0.7)' }} />
              </div>
            </div>
            {/* Countdown overlay */}
            <div className="absolute inset-0 flex items-end justify-center pb-3">
              <div className="flex items-center justify-center rounded-full" style={{ width: 44, height: 44, background: '#F5A623' }}>
                <span style={{ fontSize: '1.3rem', fontWeight: 800, color: '#0F1623' }}>{countdown}</span>
              </div>
            </div>
            {/* Corner brackets */}
            {[['top-2 left-2', 'border-t-2 border-l-2'], ['top-2 right-2', 'border-t-2 border-r-2'], ['bottom-2 left-2', 'border-b-2 border-l-2'], ['bottom-2 right-2', 'border-b-2 border-r-2']].map(([pos, cls], i) => (
              <div key={i} className={`absolute ${pos} ${cls} border-orange-400`} style={{ width: 20, height: 20, borderColor: '#F5A623' }} />
            ))}
          </motion.div>
        )}

        {phase === 'captured' && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="relative">
            <div
              className="flex items-center justify-center rounded-3xl"
              style={{ width: 220, height: 220, background: '#1A2335', border: '3px solid #15803D' }}
            >
              <div className="flex items-center justify-center" style={{ width: 80, height: 80, borderRadius: '50%', background: 'rgba(21,128,61,0.2)', border: '2px solid rgba(21,128,61,0.5)' }}>
                <User size={36} style={{ color: 'rgba(21,128,61,0.9)' }} />
              </div>
            </div>
            <div className="absolute bottom-2 right-2 flex items-center justify-center rounded-full" style={{ width: 36, height: 36, background: '#15803D', border: '2.5px solid #FFFFFF' }}>
              <CheckCircle2 size={18} style={{ color: '#FFFFFF' }} />
            </div>
          </motion.div>
        )}

        {phase !== 'idle' && (
          <p style={{ fontSize: '0.75rem', color: phase === 'captured' ? '#15803D' : '#F5A623', marginTop: 12, fontWeight: 600 }}>
            {phase === 'camera' ? `${countdown} 秒後自動拍攝…` : '自拍照片已擷取'}
          </p>
        )}
      </div>

      {/* Tips */}
      {phase === 'idle' && (
        <div className="rounded-xl px-3 py-3 mb-4 flex flex-col gap-2" style={{ background: '#FFFBEB', border: '1px solid rgba(245,166,35,0.25)' }}>
          <p style={{ fontSize: '0.72rem', fontWeight: 700, color: '#D4891A', margin: 0 }}>拍攝提示</p>
          {['保持面部正對鏡頭，不要遮擋', '光線充足，避免逆光', '移除口罩、眼鏡等遮面物品'].map((tip, i) => (
            <div key={i} className="flex items-center gap-2">
              <div style={{ width: 4, height: 4, borderRadius: '50%', background: '#F5A623', flexShrink: 0 }} />
              <span style={{ fontSize: '0.78rem', color: '#92580A' }}>{tip}</span>
            </div>
          ))}
        </div>
      )}

      {phase === 'captured' && (
        <div className="flex items-center gap-2 mb-4">
          <button
            onClick={() => { setPhase('idle'); }}
            className="flex items-center gap-1.5 rounded-xl px-3 py-2"
            style={{ background: 'none', border: '1.5px solid rgba(15,22,35,0.12)', cursor: 'pointer' }}
          >
            <RefreshCw size={13} style={{ color: '#6B7A99' }} />
            <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#6B7A99' }}>重新拍攝</span>
          </button>
        </div>
      )}

      <div className="mt-auto flex flex-col gap-3">
        {phase === 'idle' && (
          <button
            onClick={startCamera}
            className="w-full rounded-xl py-4 flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
            style={{ background: '#F5A623', border: 'none', cursor: 'pointer', fontSize: '1rem', fontWeight: 700, color: '#0F1623' }}
          >
            <Camera size={18} />
            開啟相機拍攝
          </button>
        )}
        {phase === 'captured' && (
          <button
            onClick={onNext}
            className="w-full rounded-xl py-4 transition-all active:scale-[0.98]"
            style={{ background: '#F5A623', border: 'none', cursor: 'pointer', fontSize: '1rem', fontWeight: 700, color: '#0F1623' }}
          >
            提交驗證
          </button>
        )}
      </div>
    </div>
  );
}

// ── Reviewing step ──────────────────────────────────────
function ReviewingStep({ onDone }: { onDone: (success: boolean) => void }) {
  const [progress, setProgress] = useState(0);
  const [checkIndex, setCheckIndex] = useState(-1);

  const checks = ['核對身份證資料…', '比對人臉特徵…', '驗證香港居住資格…'];

  useEffect(() => {
    const start = Date.now();
    const duration = 3800;
    const tick = setInterval(() => {
      const elapsed = Date.now() - start;
      const pct = Math.min(elapsed / duration, 1);
      setProgress(pct);
      setCheckIndex(Math.floor(pct * checks.length));
      if (pct >= 1) {
        clearInterval(tick);
        setTimeout(() => onDone(true), 400); // 90% success in demo
      }
    }, 60);
    return () => clearInterval(tick);
  }, []);

  const r = 42;
  const circ = 2 * Math.PI * r;
  const strokeDash = circ * (1 - progress);

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-5 gap-8">
      {/* Circular progress */}
      <div className="relative flex items-center justify-center">
        <svg width={110} height={110} viewBox="0 0 110 110">
          <circle cx="55" cy="55" r={r} fill="none" stroke="#EEF1F8" strokeWidth="6" />
          <motion.circle
            cx="55" cy="55" r={r} fill="none" stroke="#F5A623" strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={circ}
            strokeDashoffset={strokeDash}
            style={{ transform: 'rotate(-90deg)', transformOrigin: '55px 55px' }}
          />
        </svg>
        <div className="absolute flex items-center justify-center rounded-full" style={{ width: 68, height: 68, background: '#FEF3DC' }}>
          <Shield size={28} style={{ color: '#F5A623' }} />
        </div>
      </div>

      <div className="text-center">
        <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0F1623', margin: '0 0 6px 0' }}>系統核驗中</h3>
        <p style={{ fontSize: '0.82rem', color: '#9CA3AF', margin: 0 }}>請稍候，這只需幾秒鐘</p>
      </div>

      {/* Animated checklist */}
      <div className="flex flex-col gap-3 w-full">
        {checks.map((check, i) => {
          const done = i < checkIndex;
          const active = i === checkIndex;
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: i <= checkIndex ? 1 : 0.3, x: 0 }}
              transition={{ delay: i * 0.3, duration: 0.3 }}
              className="flex items-center gap-3 rounded-xl px-4 py-3"
              style={{ background: done ? '#F0FDF4' : active ? '#FFFBEB' : '#F7F8FC', border: `1px solid ${done ? '#BBF7D0' : active ? 'rgba(245,166,35,0.25)' : 'rgba(15,22,35,0.06)'}` }}
            >
              <div className="flex items-center justify-center rounded-full shrink-0" style={{ width: 22, height: 22, background: done ? '#DCFCE7' : active ? '#FEF3DC' : '#EEF1F8' }}>
                {done
                  ? <CheckCircle2 size={13} style={{ color: '#15803D' }} />
                  : active
                    ? <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}>
                        <RefreshCw size={11} style={{ color: '#F5A623' }} />
                      </motion.div>
                    : <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#CBD1E1' }} />
                }
              </div>
              <span style={{ fontSize: '0.85rem', fontWeight: done ? 600 : 500, color: done ? '#15803D' : active ? '#D4891A' : '#9CA3AF' }}>
                {check}
              </span>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

// ── Result steps ────────────────────────────────────────
function SuccessStep({ onDone }: { onDone: () => void }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center px-5 gap-6">
      <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', stiffness: 260, damping: 18 }}>
        <div className="relative flex items-center justify-center">
          <div className="flex items-center justify-center rounded-full" style={{ width: 96, height: 96, background: '#DCFCE7', border: '4px solid rgba(21,128,61,0.2)' }}>
            <CheckCircle2 size={48} style={{ color: '#15803D' }} />
          </div>
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="text-center">
        <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0F1623', margin: '0 0 8px 0' }}>認證成功！</h2>
        <p style={{ fontSize: '0.85rem', color: '#6B7A99', lineHeight: 1.65, margin: 0 }}>
          您的香港身份已通過核驗，現可正常申請工作職位。
        </p>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
        className="w-full rounded-2xl px-5 py-4 flex flex-col gap-2.5"
        style={{ background: '#F0FDF4', border: '1.5px solid #BBF7D0' }}
      >
        {[
          { label: '認證狀態', value: '已通過' },
          { label: '認證類型', value: '香港身份證（HKID）' },
          { label: '有效期', value: '3 年（2029年6月）' },
        ].map(({ label, value }) => (
          <div key={label} className="flex items-center justify-between">
            <span style={{ fontSize: '0.78rem', color: '#9CA3AF' }}>{label}</span>
            <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#15803D' }}>{value}</span>
          </div>
        ))}
      </motion.div>

      <motion.button
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
        onClick={onDone}
        className="w-full rounded-xl py-4 transition-all active:scale-[0.98]"
        style={{ background: '#F5A623', border: 'none', cursor: 'pointer', fontSize: '1rem', fontWeight: 700, color: '#0F1623' }}
      >
        完成
      </motion.button>
    </div>
  );
}

function FailStep({ onRetry, onClose }: { onRetry: () => void; onClose: () => void }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center px-5 gap-6">
      <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', stiffness: 260, damping: 18 }}>
        <div className="flex items-center justify-center rounded-full" style={{ width: 96, height: 96, background: '#FEE2E2', border: '4px solid rgba(217,48,37,0.15)' }}>
          <XCircle size={48} style={{ color: '#D93025' }} />
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="text-center">
        <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0F1623', margin: '0 0 8px 0' }}>核驗未能通過</h2>
        <p style={{ fontSize: '0.85rem', color: '#6B7A99', lineHeight: 1.65, margin: 0 }}>
          照片比對失敗，可能因光線不足或身份證不清晰所致。請重試。
        </p>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
        className="w-full rounded-2xl px-4 py-3 flex flex-col gap-2"
        style={{ background: '#FEF2F2', border: '1px solid rgba(217,48,37,0.15)' }}
      >
        <p style={{ fontSize: '0.78rem', fontWeight: 700, color: '#D93025', margin: '0 0 4px 0' }}>常見失敗原因</p>
        {['身份證照片不夠清晰或有反光', '人臉照片與證件照片差異過大', '身份證四角未完整顯示'].map((r, i) => (
          <div key={i} className="flex items-center gap-2">
            <div style={{ width: 4, height: 4, borderRadius: '50%', background: '#D93025', flexShrink: 0 }} />
            <span style={{ fontSize: '0.78rem', color: '#991B1B' }}>{r}</span>
          </div>
        ))}
      </motion.div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.45 }} className="w-full flex flex-col gap-3">
        <button
          onClick={onRetry}
          className="w-full rounded-xl py-4 flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
          style={{ background: '#F5A623', border: 'none', cursor: 'pointer', fontSize: '1rem', fontWeight: 700, color: '#0F1623' }}
        >
          <RefreshCw size={16} />
          重新認證
        </button>
        <button
          onClick={onClose}
          className="w-full rounded-xl py-3"
          style={{ background: '#EEF1F8', border: 'none', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 600, color: '#6B7A99' }}
        >
          稍後再試
        </button>
      </motion.div>
    </div>
  );
}

// ── Main flow orchestrator ──────────────────────────────
export function HKIDVerifyFlow({ onClose, onSuccess }: HKIDVerifyFlowProps) {
  const [step, setStep] = useState<Step>('intro');

  const showBack = step === 'upload-id' || step === 'face-scan';
  const showDots = step === 'upload-id' || step === 'face-scan' || step === 'reviewing';

  function goBack() {
    if (step === 'upload-id') setStep('intro');
    if (step === 'face-scan') setStep('upload-id');
  }

  function handleDone(success: boolean) {
    setStep(success ? 'success' : 'fail');
  }

  function handleSuccess() {
    onSuccess();
    onClose();
  }

  function handleRetry() {
    setStep('intro');
  }

  return (
    <div className="size-full flex flex-col overflow-hidden" style={{ background: '#F7F8FC' }}>
      {/* Header */}
      {step !== 'reviewing' && step !== 'success' && step !== 'fail' && (
        <div
          className="shrink-0 flex items-center justify-between px-4 py-3"
          style={{ background: '#FFFFFF', borderBottom: '1px solid rgba(15,22,35,0.06)' }}
        >
          <button
            onClick={showBack ? goBack : onClose}
            className="flex items-center justify-center rounded-xl"
            style={{ width: 36, height: 36, background: '#EEF1F8', border: 'none', cursor: 'pointer' }}
          >
            <ChevronLeft size={18} style={{ color: '#0F1623' }} />
          </button>
          <div className="flex flex-col items-center gap-1">
            <h2 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0F1623', margin: 0 }}>HKID 身份認證</h2>
            {showDots && <StepDots step={step} />}
          </div>
          <div style={{ width: 36 }} />
        </div>
      )}

      {/* Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          className="flex-1 flex flex-col overflow-y-auto"
          style={{ scrollbarWidth: 'none' }}
          initial={{ opacity: 0, x: step === 'intro' ? 0 : 16 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -16 }}
          transition={{ duration: 0.2 }}
        >
          {step === 'intro' && <IntroStep onStart={() => setStep('upload-id')} />}
          {step === 'upload-id' && <UploadIDStep onNext={() => setStep('face-scan')} />}
          {step === 'face-scan' && <FaceScanStep onNext={() => setStep('reviewing')} />}
          {step === 'reviewing' && <ReviewingStep onDone={handleDone} />}
          {step === 'success' && <SuccessStep onDone={handleSuccess} />}
          {step === 'fail' && <FailStep onRetry={handleRetry} onClose={onClose} />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
