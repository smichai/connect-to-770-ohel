import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Trash2, 
  Clock, 
  ShieldCheck,
  ChevronRight,
  ChevronLeft,
  X,
  Minimize2
} from 'lucide-react';
import confetti from 'canvas-confetti';
import ohelImage from './assets/ohel-queue.jpg';
import AdminDashboard from './components/AdminDashboard';
import { addNameSubmission } from './firebase';

export default function App() {
  const [currentView, setCurrentView] = useState(() => {
    return window.location.hash === '#admin' ? 'admin' : 'landing';
  });

  const [namesList, setNamesList] = useState([
    { id: '1', name: '', motherName: '', requestType: '' }
  ]);

  const [submittedData, setSubmittedData] = useState(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Clock Widget Visibility & Minimized states
  const [isClockVisible, setIsClockVisible] = useState(true);
  const [isClockMinimized, setIsClockMinimized] = useState(false);

  // Listen to hash changes (e.g. #admin)
  useEffect(() => {
    const handleHashChange = () => {
      if (window.location.hash === '#admin') {
        setCurrentView('admin');
      } else if (window.location.hash === '' || window.location.hash === '#home') {
        setCurrentView('landing');
      }
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Real live countdown timer to NY 12:00 PM deadline
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const updateTimer = () => {
      const nyDateString = new Date().toLocaleString("en-US", { timeZone: "America/New_York" });
      const nyCurrent = new Date(nyDateString);
      let target = new Date(nyCurrent);
      target.setHours(12, 0, 0, 0);

      if (nyCurrent > target) {
        target.setDate(target.getDate() + 1);
      }

      const diff = target.getTime() - nyCurrent.getTime();
      if (diff > 0) {
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff / (1000 * 60)) % 60);
        const seconds = Math.floor((diff / 1000) % 60);
        setTimeLeft({ hours, minutes, seconds });
      }
    };
    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleAddNameRow = () => {
    setNamesList([
      ...namesList,
      { id: Date.now().toString(), name: '', motherName: '', requestType: '' }
    ]);
  };

  const handleRemoveNameRow = (id) => {
    if (namesList.length === 1) return;
    setNamesList(namesList.filter((item) => item.id !== id));
  };

  const handleNameChange = (id, field, value) => {
    setNamesList(
      namesList.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validNames = namesList.filter((n) => n.name.trim() !== '' && n.motherName.trim() !== '');
    if (validNames.length === 0) {
      alert('אנא מלא לפחות שם אחד ושם האם');
      return;
    }

    setIsSubmitting(true);

    try {
      for (const item of validNames) {
        await addNameSubmission({
          fullName: item.name.trim(),
          motherName: item.motherName.trim(),
          requestType: item.requestType.trim() || 'ברכה ואיחול',
          note: item.requestType.trim()
        });
      }

      const newSubmission = {
        id: `770-${Math.floor(1000 + Math.random() * 9000)}`,
        names: validNames,
        date: new Date().toISOString()
      };

      setSubmittedData(newSubmission);
      setShowSuccessModal(true);

      if (window.confetti) {
        confetti({
          particleCount: 90,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#E5B54F', '#F59E0B', '#FFFFFF']
        });
      }

      setNamesList([{ id: '1', name: '', motherName: '', requestType: '' }]);

    } catch (err) {
      console.error("Submission Error:", err);
      alert('אירעה שגיאה בשמירת השמות. נסה שנית.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (currentView === 'admin') {
    return (
      <AdminDashboard 
        onBackToSite={() => {
          window.location.hash = '';
          setCurrentView('landing');
        }} 
      />
    );
  }

  return (
    <div className="min-h-screen w-full bg-[#050505] text-slate-100 flex flex-col items-center justify-center p-4 sm:p-6 relative font-sans selection:bg-[#E5B54F] selection:text-black overflow-x-hidden" dir="rtl">
      
      {/* Background Image of Ohel Queue - Opacity 35% */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <img 
          src={ohelImage} 
          alt="תור האוהל הקדוש" 
          className="w-full h-full object-cover object-center opacity-30 filter contrast-110 brightness-75 scale-105" 
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#050505]/85 via-[#050505]/75 to-[#050505]/90" />
      </div>

      {/* Apple-Style Ambient Moving Glow Orbs in Background */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-gradient-to-tr from-[#E5B54F]/15 via-amber-500/10 to-transparent rounded-full blur-[100px] animate-pulse duration-[7000ms]" />
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[350px] bg-gradient-to-bl from-amber-600/10 via-[#E5B54F]/10 to-transparent rounded-full blur-[90px] animate-pulse duration-[10000ms]" />
      </div>

      {/* Main Completely Centered Layout wrapped in Apple Liquid Glass Card */}
      <div className="relative z-10 max-w-2xl w-full text-center space-y-6 py-8 px-4 sm:px-8 mx-auto flex flex-col items-center justify-center my-auto bg-black/40 backdrop-blur-2xl border border-white/15 rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.8)] shadow-[#E5B54F]/5 relative overflow-hidden transition-all">
        
        {/* Apple Glass Highlight Top Edge */}
        <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/35 to-transparent pointer-events-none" />

        {/* Floating Bottom Right Apple Watch / VisionOS Translucent Glass Clock */}
        {isClockVisible && !isClockMinimized && (
          <div className="fixed bottom-4 right-3 sm:right-8 z-40 flex flex-col items-center text-center bg-black/50 backdrop-blur-2xl border border-white/20 p-3 rounded-2xl shadow-[0_15px_40px_rgba(0,0,0,0.85)] shadow-[#E5B54F]/10 hover:border-[#E5B54F]/40 transition-all duration-300 max-w-[260px] w-full relative overflow-hidden">
            {/* Top Apple Glass Sheen Edge */}
            <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/40 to-transparent pointer-events-none" />

            {/* Top Header & Actions */}
            <div className="w-full flex items-center justify-between gap-1 mb-2 px-0.5">
              <div className="inline-flex items-center gap-1.5 text-[11px] sm:text-xs text-amber-200/90 font-semibold drop-shadow-md text-right">
                <Clock size={13} className="text-[#E5B54F]" />
                <span>נותרו עד 12:00 ניו יורק:</span>
              </div>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setIsClockMinimized(true)}
                  className="text-slate-400 hover:text-amber-300 p-1 rounded-lg hover:bg-white/10 transition-colors"
                  title="קפל לצד"
                >
                  <ChevronRight size={15} />
                </button>
                <button
                  type="button"
                  onClick={() => setIsClockVisible(false)}
                  className="text-slate-400 hover:text-rose-400 p-1 rounded-lg hover:bg-white/10 transition-colors"
                  title="סגור"
                >
                  <X size={15} />
                </button>
              </div>
            </div>
            
            {/* Ordered Units in LTR (Left: שעות | Middle: דקות | Right: שניות) */}
            <div className="flex items-center gap-2 sm:gap-2.5 justify-center w-full pt-0.5" style={{ direction: 'ltr' }}>
              
              {/* שעות - Left */}
              <div className="flex flex-col items-center gap-0.5">
                <div className="flex gap-0.5" style={{ direction: 'ltr' }}>
                  <div className="relative w-6 h-8 bg-black/60 backdrop-blur-md text-white font-sans font-bold text-sm rounded-lg border border-white/15 shadow-lg flex items-center justify-center overflow-hidden">
                    <div className="absolute inset-x-0 top-1/2 h-[1px] bg-black/90 z-10 border-b border-white/10" />
                    <span className="relative z-0 drop-shadow-sm">{Math.floor(timeLeft.hours / 10)}</span>
                  </div>
                  <div className="relative w-6 h-8 bg-black/60 backdrop-blur-md text-white font-sans font-bold text-sm rounded-lg border border-white/15 shadow-lg flex items-center justify-center overflow-hidden">
                    <div className="absolute inset-x-0 top-1/2 h-[1px] bg-black/90 z-10 border-b border-white/10" />
                    <span className="relative z-0 drop-shadow-sm">{timeLeft.hours % 10}</span>
                  </div>
                </div>
                <span className="text-[10px] text-amber-200/90 font-bold">שעות</span>
              </div>

              <span className="text-[#E5B54F] font-bold text-sm pb-3 animate-pulse">:</span>

              {/* דקות - Middle */}
              <div className="flex flex-col items-center gap-0.5">
                <div className="flex gap-0.5" style={{ direction: 'ltr' }}>
                  <div className="relative w-6 h-8 bg-black/60 backdrop-blur-md text-white font-sans font-bold text-sm rounded-lg border border-white/15 shadow-lg flex items-center justify-center overflow-hidden">
                    <div className="absolute inset-x-0 top-1/2 h-[1px] bg-black/90 z-10 border-b border-white/10" />
                    <span className="relative z-0 drop-shadow-sm">{Math.floor(timeLeft.minutes / 10)}</span>
                  </div>
                  <div className="relative w-6 h-8 bg-black/60 backdrop-blur-md text-white font-sans font-bold text-sm rounded-lg border border-white/15 shadow-lg flex items-center justify-center overflow-hidden">
                    <div className="absolute inset-x-0 top-1/2 h-[1px] bg-black/90 z-10 border-b border-white/10" />
                    <span className="relative z-0 drop-shadow-sm">{timeLeft.minutes % 10}</span>
                  </div>
                </div>
                <span className="text-[10px] text-amber-200/90 font-bold">דקות</span>
              </div>

              <span className="text-[#E5B54F] font-bold text-sm pb-3 animate-pulse">:</span>

              {/* שניות - Right */}
              <div className="flex flex-col items-center gap-0.5">
                <div className="flex gap-0.5" style={{ direction: 'ltr' }}>
                  <div className="relative w-6 h-8 bg-black/60 backdrop-blur-md text-white font-sans font-bold text-sm rounded-lg border border-white/15 shadow-lg flex items-center justify-center overflow-hidden">
                    <div className="absolute inset-x-0 top-1/2 h-[1px] bg-black/90 z-10 border-b border-white/10" />
                    <span className="relative z-0 drop-shadow-sm">{Math.floor(timeLeft.seconds / 10)}</span>
                  </div>
                  <div className="relative w-6 h-8 bg-black/60 backdrop-blur-md text-white font-sans font-bold text-sm rounded-lg border border-white/15 shadow-lg flex items-center justify-center overflow-hidden">
                    <div className="absolute inset-x-0 top-1/2 h-[1px] bg-black/90 z-10 border-b border-white/10" />
                    <span className="relative z-0 drop-shadow-sm">{timeLeft.seconds % 10}</span>
                  </div>
                </div>
                <span className="text-[10px] text-amber-200/90 font-bold">שניות</span>
              </div>

            </div>
          </div>
        )}

        {/* Minimized Side Badge */}
        {isClockVisible && isClockMinimized && (
          <div className="fixed bottom-4 right-3 z-40">
            <button
              type="button"
              onClick={() => setIsClockMinimized(false)}
              className="bg-black/50 backdrop-blur-2xl border border-[#E5B54F]/50 text-amber-200 hover:text-white px-3.5 py-2 rounded-full shadow-2xl flex items-center gap-2 text-xs font-bold transition-all hover:scale-105 group"
              title="פתח שעון"
            >
              <Clock size={14} className="text-[#E5B54F] group-hover:rotate-12 transition-transform" />
              <span style={{ direction: 'ltr' }}>
                {String(timeLeft.hours).padStart(2, '0')}:{String(timeLeft.minutes).padStart(2, '0')}:{String(timeLeft.seconds).padStart(2, '0')}
              </span>
              <ChevronLeft size={14} className="text-[#E5B54F]" />
            </button>
          </div>
        )}

        {/* Closed Button Trigger */}
        {!isClockVisible && (
          <div className="fixed bottom-4 right-3 z-40">
            <button
              type="button"
              onClick={() => {
                setIsClockVisible(true);
                setIsClockMinimized(false);
              }}
              className="bg-black/40 backdrop-blur-md border border-white/20 text-slate-400 hover:text-amber-200 p-2.5 rounded-full shadow-xl transition-all hover:scale-110"
              title="הצג שעון"
            >
              <Clock size={16} />
            </button>
          </div>
        )}


        {/* Main Header - Always Forced on ONE Single Line */}
        <div className="w-full text-center space-y-1 mx-auto flex flex-col items-center justify-center pt-2">
          <h1 className="font-heading font-black text-lg min-[360px]:text-xl min-[440px]:text-2xl sm:text-3xl md:text-4xl text-white tracking-tight drop-shadow-xl text-center mx-auto whitespace-nowrap">
            שליחת פ״נ ערב ראש השנה לאוהל
          </h1>
        </div>

        {/* Announcement Text Paragraph - 100% Centered */}
        <div className="text-sm sm:text-base text-slate-200 leading-relaxed text-center space-y-3 px-2 mx-auto max-w-lg">
          <p className="drop-shadow-md font-normal text-center mx-auto">
            בהתאם למנהג הרבי לבקר באוהל הק׳ בערב ראש השנה, ערוץ <strong className="text-[#E5B54F] font-bold">להתחבר ל-770</strong> נותן שירות מיוחד לאלו שלא מוכנים לוותר על מנהג החסידים מדורי דורות, אך אינם יכולים לבצע זאת בפועל מפאת המרחק הגשמי.
          </p>
          <p className="text-amber-200 font-semibold text-base sm:text-lg drop-shadow-md text-center mx-auto">
            כיתבו את שמכם ושם אמכם בטופס, וצוות הערוץ ידאג להזכיר אתכם על הציון הק׳ לברכה והצלחה.
          </p>
        </div>

        {/* Form - Apple Liquid Glass Containers */}
        <form onSubmit={handleSubmit} className="w-full max-w-lg mx-auto space-y-5 pt-2 text-center flex flex-col items-center">
          
          <div className="w-full space-y-4">
            {namesList.map((item, index) => (
              <div key={item.id} className="w-full space-y-3 text-center relative bg-white/[0.03] backdrop-blur-xl border border-white/10 p-4 rounded-2xl shadow-lg transition-all duration-300 hover:border-[#E5B54F]/30 hover:bg-white/[0.05]">
                <div className="flex items-center justify-between text-xs sm:text-sm px-1 font-bold text-[#E5B54F]">
                  <span className="mx-auto text-center">שם להזכרה #{index + 1}</span>
                  {namesList.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveNameRow(item.id)}
                      className="text-rose-400 hover:text-rose-300 text-xs font-normal absolute left-3 top-3.5 transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
                  <input
                    type="text"
                    required
                    placeholder="שם פרטי ומשפחה"
                    value={item.name}
                    onChange={(e) => handleNameChange(item.id, 'name', e.target.value)}
                    className="w-full bg-black/50 border border-white/10 focus:border-[#E5B54F] focus:ring-2 focus:ring-[#E5B54F]/30 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-400 text-center focus:outline-none backdrop-blur-md transition-all shadow-inner"
                  />
                  <input
                    type="text"
                    required
                    placeholder="שם האם (בן/בת)"
                    value={item.motherName}
                    onChange={(e) => handleNameChange(item.id, 'motherName', e.target.value)}
                    className="w-full bg-black/50 border border-white/10 focus:border-[#E5B54F] focus:ring-2 focus:ring-[#E5B54F]/30 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-400 text-center focus:outline-none backdrop-blur-md transition-all shadow-inner"
                  />
                </div>

                {/* Free Text Input for Request / Blessing */}
                <div className="pt-0.5 w-full">
                  <input
                    type="text"
                    placeholder="בקשת ברכה מפורטת / פ״ן / סוג הבקשה..."
                    value={item.requestType}
                    onChange={(e) => handleNameChange(item.id, 'requestType', e.target.value)}
                    className="w-full bg-black/50 border border-white/10 focus:border-[#E5B54F] focus:ring-2 focus:ring-[#E5B54F]/30 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-amber-200 placeholder-slate-400 text-center focus:outline-none backdrop-blur-md transition-all shadow-inner"
                  />
                </div>

              </div>
            ))}

            {/* Add Name Button - Apple Style Translucent Link */}
            <button
              type="button"
              onClick={handleAddNameRow}
              className="text-white hover:text-[#E5B54F] underline underline-offset-4 decoration-[#E5B54F]/70 font-medium text-xs sm:text-sm transition-colors cursor-pointer bg-transparent border-none py-1.5 px-2 flex items-center justify-center gap-1.5 mx-auto"
            >
              <Plus size={15} className="text-[#E5B54F]" />
              <span>הוסף שם נוסף (בן/בת משפחה)</span>
            </button>
          </div>

          {/* Apple Premium Shimmer Gold CTA Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#F3C86B] via-[#E5B54F] to-[#C99632] hover:brightness-110 active:scale-[0.99] disabled:opacity-50 text-slate-950 font-black text-lg sm:text-xl shadow-[0_10px_30px_rgba(229,181,79,0.3)] hover:shadow-[0_12px_40px_rgba(229,181,79,0.45)] transition-all cursor-pointer mt-2 text-center relative overflow-hidden"
          >
            {isSubmitting ? 'שומר...' : 'שלח פ״ן לאוהל הקדוש 🍯'}
          </button>

        </form>

        {/* WhatsApp Channel Invitation Box - Apple Translucent Card */}
        <a
          href="https://whatsapp.com/channel/0029VayCzKY9mrGXUlgKji0m"
          target="_blank"
          rel="noopener noreferrer"
          className="max-w-sm w-full mx-auto p-3.5 rounded-2xl bg-emerald-950/30 border border-emerald-500/30 hover:border-emerald-400/60 backdrop-blur-xl flex items-center justify-between gap-3 text-right transition-all duration-300 group shadow-lg hover:bg-emerald-900/40 mt-1"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 text-base font-bold flex-shrink-0 group-hover:scale-110 transition-transform">
              💬
            </div>
            <div className="text-right">
              <div className="text-xs font-bold text-white group-hover:text-emerald-300 transition-colors">
                לעקוב אחרי ערוץ להתחבר ל-770 ב-WhatsApp?
              </div>
              <div className="text-[10px] text-emerald-200/80 font-medium">
                לחצו כאן להצטרפות לערוץ
              </div>
            </div>
          </div>
          <span className="text-emerald-400 text-[11px] font-bold bg-emerald-500/20 px-2.5 py-1 rounded-full border border-emerald-500/30 whitespace-nowrap">
            הצטרף ➔
          </span>
        </a>

        {/* Footer info & Admin link */}
        <div className="pt-2 text-center w-full flex flex-col justify-center items-center gap-2 mx-auto">
          <span className="text-xs sm:text-sm text-amber-200/90 font-bold text-center mx-auto">
            כתיבה וחתימה טובה לשנה טובה ומתוקה! 🍯
          </span>
          
          {/* Admin Link Button */}
          <button 
            onClick={() => {
              window.location.hash = '#admin';
              setCurrentView('admin');
            }}
            className="text-[11px] text-slate-400 hover:text-amber-300 transition flex items-center justify-center gap-1 mt-2 mx-auto"
          >
            <ShieldCheck size={12} />
            <span>כניסת צוות ניהול (Admin)</span>
          </button>
        </div>

      </div>

      {/* Simple Beautiful Apple Glass Confirmation Modal */}
      {showSuccessModal && submittedData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-3xl" dir="rtl">
          <div className="bg-[#0d0d12]/90 backdrop-blur-2xl border border-white/20 max-w-sm w-full rounded-3xl p-6 sm:p-8 text-center space-y-5 shadow-[0_25px_60px_rgba(0,0,0,0.9)] shadow-[#E5B54F]/10 relative overflow-hidden">
            
            <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-[#E5B54F]/60 to-transparent" />

            <div className="space-y-2">
              <span className="text-xs font-mono text-[#E5B54F] font-bold tracking-widest block">
                אישור מס׳ {submittedData.id}
              </span>
              <h3 className="font-heading font-black text-xl sm:text-2xl text-white leading-snug">
                המכתב יכנס בערב ראש השנה לאוהל הקדוש 🍯
              </h3>
            </div>

            <button
              onClick={() => setShowSuccessModal(false)}
              className="w-full py-3.5 bg-gradient-to-r from-[#F3C86B] via-[#E5B54F] to-[#C99632] hover:brightness-110 text-slate-950 font-black text-base rounded-2xl shadow-lg transition-all"
            >
              סגור
            </button>

          </div>
        </div>
      )}

    </div>
  );
}
