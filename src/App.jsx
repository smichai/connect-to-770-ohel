import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Trash2, 
  Clock, 
  ShieldCheck 
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

  const [submitterName, setSubmitterName] = useState('');
  const [submitterPhone, setSubmitterPhone] = useState('');
  const [personalRequest, setPersonalRequest] = useState('');

  const [submittedData, setSubmittedData] = useState(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
          note: personalRequest.trim()
        });
      }

      const newSubmission = {
        id: `770-${Math.floor(1000 + Math.random() * 9000)}`,
        submitterName: submitterName.trim() || validNames[0].name,
        submitterPhone: submitterPhone.trim(),
        personalRequest: personalRequest.trim(),
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
      setPersonalRequest('');

    } catch (err) {
      console.error("Submission Error:", err);
      alert('אירעה שגיאה בשמירת השמות. נסה שנית.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getWhatsAppShareUrl = () => {
    const text = encodeURIComponent(
      `🍯 *אוהל להתחבר - ערב ראש השנה*\n` +
      `רשמתי את שמי ושם משפחתי להזכרה על הציון הקדוש של הרבי מליובאוויטש בערב ראש השנה!\n\n` +
      `גם אתם יכולים להעביר שמות בחינם לברכה והצלחה בקישור:\n` +
      `${window.location.origin}\n\n` +
      `*כתיבה וחתימה טובה לשנה טובה ומתוקה!* 🍯`
    );
    return `https://wa.me/?text=${text}`;
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
          className="w-full h-full object-cover object-center opacity-35 filter contrast-110 brightness-75 scale-105" 
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#050505]/80 via-[#050505]/70 to-[#050505]/85" />
      </div>

      {/* Main Completely Centered Layout */}
      <div className="relative z-10 max-w-xl w-full text-center space-y-6 py-8 px-2 mx-auto flex flex-col items-center justify-center my-auto">
        
        {/* Floating Bottom Right Mechanical Split-Flap Clock - Shifted Slightly Left & Centered Header */}
        <div className="fixed bottom-4 right-8 sm:right-12 z-40 flex flex-col items-center text-center drop-shadow-2xl">
          <div className="inline-flex items-center justify-center gap-1.5 text-[11px] sm:text-xs text-amber-200/90 font-semibold mb-1.5 drop-shadow-md text-center mx-auto">
            <Clock size={14} className="text-[#E5B54F]" />
            <span>נותרו עד 12:00 ניו יורק:</span>
          </div>
          
          {/* Ordered Units in LTR (Left: שעות | Middle: דקות | Right: שניות) */}
          <div className="flex items-center gap-2 sm:gap-2.5 justify-center" style={{ direction: 'ltr' }}>
            
            {/* שעות - Left */}
            <div className="flex flex-col items-center gap-0.5">
              <div className="flex gap-0.5" style={{ direction: 'ltr' }}>
                <div className="relative w-6 h-8 bg-gradient-to-b from-[#333338] via-[#222226] to-[#141416] text-white font-sans font-bold text-sm rounded border border-slate-600/70 shadow-lg flex items-center justify-center overflow-hidden">
                  <div className="absolute inset-x-0 top-1/2 h-[1px] bg-black/90 z-10 border-b border-white/10" />
                  <span className="relative z-0 drop-shadow-sm">{Math.floor(timeLeft.hours / 10)}</span>
                </div>
                <div className="relative w-6 h-8 bg-gradient-to-b from-[#333338] via-[#222226] to-[#141416] text-white font-sans font-bold text-sm rounded border border-slate-600/70 shadow-lg flex items-center justify-center overflow-hidden">
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
                <div className="relative w-6 h-8 bg-gradient-to-b from-[#333338] via-[#222226] to-[#141416] text-white font-sans font-bold text-sm rounded border border-slate-600/70 shadow-lg flex items-center justify-center overflow-hidden">
                  <div className="absolute inset-x-0 top-1/2 h-[1px] bg-black/90 z-10 border-b border-white/10" />
                  <span className="relative z-0 drop-shadow-sm">{Math.floor(timeLeft.minutes / 10)}</span>
                </div>
                <div className="relative w-6 h-8 bg-gradient-to-b from-[#333338] via-[#222226] to-[#141416] text-white font-sans font-bold text-sm rounded border border-slate-600/70 shadow-lg flex items-center justify-center overflow-hidden">
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
                <div className="relative w-6 h-8 bg-gradient-to-b from-[#333338] via-[#222226] to-[#141416] text-white font-sans font-bold text-sm rounded border border-slate-600/70 shadow-lg flex items-center justify-center overflow-hidden">
                  <div className="absolute inset-x-0 top-1/2 h-[1px] bg-black/90 z-10 border-b border-white/10" />
                  <span className="relative z-0 drop-shadow-sm">{Math.floor(timeLeft.seconds / 10)}</span>
                </div>
                <div className="relative w-6 h-8 bg-gradient-to-b from-[#333338] via-[#222226] to-[#141416] text-white font-sans font-bold text-sm rounded border border-slate-600/70 shadow-lg flex items-center justify-center overflow-hidden">
                  <div className="absolute inset-x-0 top-1/2 h-[1px] bg-black/90 z-10 border-b border-white/10" />
                  <span className="relative z-0 drop-shadow-sm">{timeLeft.seconds % 10}</span>
                </div>
              </div>
              <span className="text-[10px] text-amber-200/90 font-bold">שניות</span>
            </div>

          </div>
        </div>

        {/* Main Header - 100% Centered */}
        <div className="w-full text-center space-y-1 mx-auto flex flex-col items-center justify-center">
          <h1 className="font-heading font-black text-2xl min-[400px]:text-3xl sm:text-4xl md:text-5xl text-white tracking-tight drop-shadow-lg text-center mx-auto">
            שליחת שמות לאוהל הקדוש
          </h1>
        </div>

        {/* Announcement Text Paragraph - 100% Centered */}
        <div className="text-sm sm:text-base text-slate-100 leading-relaxed text-center space-y-3 px-2 mx-auto max-w-lg">
          <p className="drop-shadow-md font-normal text-center mx-auto">
            בהתאם למנהג הרבי לבקר באוהל הק׳ בערב ראש השנה, ערוץ <strong className="text-[#E5B54F] font-bold">להתחבר ל-770</strong> נותן שירות מיוחד לאלו שלא מוכנים לוותר על מנהג החסידים מדורי דורות, אך אינם יכולים לבצע זאת בפועל מפאת המרחק הגשמי.
          </p>
          <p className="text-amber-200 font-semibold text-base sm:text-lg drop-shadow-md text-center mx-auto">
            כיתבו את שמכם ושם אמכם בטופס, וצוות הערוץ ידאג להזכיר אתכם על הציון הק׳ לברכה והצלחה.
          </p>
        </div>

        {/* Form - Sleek, Frameless, Completely Centered */}
        <form onSubmit={handleSubmit} className="w-full max-w-lg mx-auto space-y-5 pt-2 text-center flex flex-col items-center">
          
          <div className="w-full space-y-4">
            {namesList.map((item, index) => (
              <div key={item.id} className="w-full space-y-2 text-center relative bg-black/30 border border-slate-800/80 p-3.5 rounded-2xl">
                <div className="flex items-center justify-between text-xs sm:text-sm px-1 font-bold text-[#E5B54F]">
                  <span className="mx-auto text-center">שם להזכרה #{index + 1}</span>
                  {namesList.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveNameRow(item.id)}
                      className="text-rose-400 hover:text-rose-300 text-xs font-normal absolute left-3 top-3"
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
                    className="w-full bg-black/50 border border-slate-700/80 focus:border-[#E5B54F] rounded-xl px-4 py-3 text-sm text-white placeholder-slate-400 text-center focus:outline-none backdrop-blur-md transition-all shadow-lg"
                  />
                  <input
                    type="text"
                    required
                    placeholder="שם האם (בן/בת)"
                    value={item.motherName}
                    onChange={(e) => handleNameChange(item.id, 'motherName', e.target.value)}
                    className="w-full bg-black/50 border border-slate-700/80 focus:border-[#E5B54F] rounded-xl px-4 py-3 text-sm text-white placeholder-slate-400 text-center focus:outline-none backdrop-blur-md transition-all shadow-lg"
                  />
                </div>

                {/* Free Text Input for Request Type */}
                <div className="pt-1 w-full">
                  <input
                    type="text"
                    placeholder="סוג בקשה (לדוגמה: רפואה / זיווג / פרנסה / ברכה...)"
                    value={item.requestType}
                    onChange={(e) => handleNameChange(item.id, 'requestType', e.target.value)}
                    className="w-full bg-black/50 border border-slate-700/80 focus:border-[#E5B54F] rounded-xl px-4 py-2.5 text-xs sm:text-sm text-amber-200 placeholder-slate-400 text-center focus:outline-none backdrop-blur-md transition-all"
                  />
                </div>

              </div>
            ))}

            <button
              type="button"
              onClick={handleAddNameRow}
              className="text-[11px] sm:text-xs text-[#E5B54F] hover:underline flex items-center justify-center gap-1 mx-auto font-medium py-1.5 px-4 rounded-full border border-amber-500/30 bg-black/40 backdrop-blur-md shadow-sm transition-all hover:bg-amber-500/10"
            >
              <Plus size={13} />
              <span>הוסף שם נוסף (בן/בת משפחה)</span>
            </button>
          </div>

          <div className="w-full space-y-3.5 pt-1 text-center">
            <textarea
              rows={2}
              placeholder="בקשת ברכה מפורטת / פ״ן (אופציונלי)"
              value={personalRequest}
              onChange={(e) => setPersonalRequest(e.target.value)}
              className="w-full bg-black/40 border border-slate-700/80 focus:border-[#E5B54F] rounded-xl p-4 text-sm sm:text-base text-white placeholder-slate-400 focus:outline-none resize-none text-center backdrop-blur-md transition-all shadow-lg"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-4 rounded-xl bg-[#E5B54F] hover:bg-[#d4a33d] disabled:opacity-50 text-slate-950 font-black text-lg sm:text-xl shadow-2xl transition-all cursor-pointer mt-3 text-center"
          >
            {isSubmitting ? 'שומר ב-Firebase...' : 'שלח שמות לאוהל הקדוש 🍯'}
          </button>

        </form>

        {/* WhatsApp Channel Invitation Box - Compact & Sleek */}
        <a
          href="https://whatsapp.com/channel/0029VayCzKY9mrGXUlgKji0m"
          target="_blank"
          rel="noopener noreferrer"
          className="max-w-sm w-full mx-auto p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/40 hover:border-emerald-400 backdrop-blur-md flex items-center justify-between gap-3 text-right transition-all group shadow-lg hover:bg-emerald-900/50 mt-1"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 text-base font-bold flex-shrink-0 group-hover:scale-105 transition-transform">
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
            className="text-[11px] text-slate-500 hover:text-amber-300 transition flex items-center justify-center gap-1 mt-2 mx-auto"
          >
            <ShieldCheck size={12} />
            <span>כניסת צוות ניהול (Admin)</span>
          </button>
        </div>

      </div>

      {/* Confirmation Modal */}
      {showSuccessModal && submittedData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md" dir="rtl">
          <div className="bg-[#121620] border border-[#E5B54F]/40 max-w-sm w-full rounded-3xl p-6 text-center space-y-4 shadow-2xl">
            
            <div className="w-12 h-12 rounded-full bg-[#E5B54F]/20 text-[#E5B54F] mx-auto flex items-center justify-center text-xl font-bold">
              ✓
            </div>

            <div className="space-y-1">
              <span className="text-[10px] font-mono text-[#E5B54F]">אישור מס׳ {submittedData.id}</span>
              <h3 className="font-bold text-lg text-white">
                השמות נרשמו בהצלחה ב-Database
              </h3>
              <p className="text-xs text-slate-300">
                צוות ערוץ <strong className="text-[#E5B54F]">להתחבר ל-770</strong> ידאג להזכיר את השמות על הציון הקדוש.
              </p>
            </div>

            <div className="bg-black/60 rounded-xl p-3 text-right space-y-1 text-xs border border-slate-800">
              {submittedData.names.map((n, i) => (
                <div key={i} className="text-slate-200">
                  • <strong>{n.name}</strong> ({n.motherName}) <span className="text-[10px] text-amber-200/70">[{n.requestType || 'ברכה'}]</span>
                </div>
              ))}
            </div>

            <div className="space-y-2 pt-2">
              <a
                href={getWhatsAppShareUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl transition-colors"
              >
                שתף ב-WhatsApp
              </a>

              <button
                onClick={() => setShowSuccessModal(false)}
                className="w-full py-2 bg-slate-800 text-[#E5B54F] text-xs rounded-xl"
              >
                סגור
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
