import React, { useState, useEffect } from 'react';
import { 
  subscribeToNames, 
  deleteSubmission, 
  updateSubmissionStatus 
} from '../firebase';
import { 
  Lock, 
  LogOut, 
  Search, 
  Download, 
  Printer, 
  Trash2, 
  CheckCircle, 
  Clock, 
  RefreshCw, 
  ArrowRight,
  ShieldAlert,
  FileText
} from 'lucide-react';

const DEFAULT_PIN = "327548723";

export default function AdminDashboard({ onBackToSite }) {
  const [pinInput, setPinInput] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return sessionStorage.getItem('admin_authenticated') === 'true';
  });
  const [pinError, setPinError] = useState('');
  const [names, setNames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  
  // Filtering & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Firebase Realtime Listener
  useEffect(() => {
    if (!isAuthenticated) return;

    setLoading(true);
    const unsubscribe = subscribeToNames(
      (data) => {
        setNames(data);
        setLoading(false);
        setErrorMsg('');
      },
      (err) => {
        console.error(err);
        setErrorMsg('שגיאה בטעינת הנתונים מ-Firestore. ודא שמסד הנתונים הופעל ב-Firebase.');
        setLoading(false);
      }
    );

    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, [isAuthenticated]);

  // Handle Login
  const handleLogin = (e) => {
    e.preventDefault();
    if (pinInput.trim() === DEFAULT_PIN) {
      setIsAuthenticated(true);
      sessionStorage.setItem('admin_authenticated', 'true');
      setPinError('');
    } else {
      setPinError('קוד גישה שגוי, נסה שוב');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('admin_authenticated');
    setPinInput('');
  };

  // Toggle status
  const handleToggleStatus = async (id, currentStatus) => {
    const nextStatus = currentStatus === 'processed' ? 'new' : 'processed';
    await updateSubmissionStatus(id, nextStatus);
  };

  // Delete item
  const handleDelete = async (id, fullName) => {
    if (window.confirm(`האם למחוק את השם "${fullName}" מהרשימה?`)) {
      await deleteSubmission(id);
    }
  };

  // CSV Export
  const exportToCSV = () => {
    if (names.length === 0) return alert('אין שמות לייצוא');

    const headers = ['תאריך', 'שם מלא', 'שם האם', 'סוג הבקשה', 'הערות נוספות', 'סטטוס'];
    const rows = filteredNames.map(item => [
      item.formattedDate || new Date(item.createdAtDate).toLocaleString('he-IL'),
      item.fullName || '',
      item.motherName || '',
      item.requestType || '',
      `"${(item.note || '').replace(/"/g, '""')}"`,
      item.status === 'processed' ? 'נקרא' : 'חדש'
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `שמות_לאוהל_770_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Print view formatted for Ohel
  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return alert('אנא אפשר חלונות קופצים (Popups) כדי להדפיס.');

    const htmlContent = `
      <!DOCTYPE html>
      <html dir="rtl" lang="he">
      <head>
        <meta charset="UTF-8">
        <title>רשימת שמות לברכה באוהל הקדוש - 770</title>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 20px; color: #111; line-height: 1.5; }
          h1 { text-align: center; margin-bottom: 5px; font-size: 24px; color: #000; }
          p.sub { text-align: center; margin-bottom: 20px; font-size: 14px; color: #555; }
          table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 13px; }
          th, td { border: 1px solid #333; padding: 8px 10px; text-align: right; }
          th { background-color: #f0f0f0; font-weight: bold; }
          tr:nth-child(even) { background-color: #fafafa; }
          .category-tag { font-weight: bold; display: inline-block; padding: 2px 6px; border-radius: 4px; background: #eee; font-size: 11px; }
          @media print {
            body { padding: 0; }
            button { display: none; }
          }
        </style>
      </head>
      <body>
        <h1>ב"ה | רשימת שמות לאוהל הקדוש - 770</h1>
        <p class="sub">סה"כ שמות ברשימה: ${filteredNames.length} | תאריך הדפסה: ${new Date().toLocaleString('he-IL')}</p>
        
        <table>
          <thead>
            <tr>
              <th style="width: 5%;">#</th>
              <th style="width: 25%;">שם מלא (בן / בת) שם האם</th>
              <th style="width: 15%;">סוג הבקשה</th>
              <th style="width: 40%;">הערות נוספות / בקשה מפורטת</th>
              <th style="width: 15%;">תאריך שליחה</th>
            </tr>
          </thead>
          <tbody>
            ${filteredNames.map((item, index) => `
              <tr>
                <td>${index + 1}</td>
                <td><strong>${item.fullName}</strong> ${item.motherName ? `בת/בן <strong>${item.motherName}</strong>` : ''}</td>
                <td><span class="category-tag">${item.requestType || 'כללי'}</span></td>
                <td>${item.note || '-'}</td>
                <td>${item.formattedDate || ''}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        
        <script>
          window.onload = function() { window.print(); }
        </script>
      </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  // Filter Logic
  const filteredNames = names.filter(item => {
    const matchesSearch = 
      (item.fullName || '').includes(searchQuery) || 
      (item.motherName || '').includes(searchQuery) ||
      (item.note || '').includes(searchQuery);

    const matchesCategory = selectedCategory === 'all' || item.requestType === selectedCategory;
    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'new' && item.status !== 'processed') ||
      (statusFilter === 'processed' && item.status === 'processed');

    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Calculate statistics
  const totalCount = names.length;
  const newCount = names.filter(n => n.status !== 'processed').length;
  const refuahCount = names.filter(n => n.requestType === 'רפואה').length;
  const zivugCount = names.filter(n => n.requestType === 'זיווג').length;
  const parnasahCount = names.filter(n => n.requestType === 'פרנסה').length;

  // Render PIN Gate Screen if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#050505] text-white flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-[#111116] border border-[#E5B54F]/30 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6 text-center">
          <div className="w-16 h-16 rounded-full bg-[#E5B54F]/10 border border-[#E5B54F]/40 flex items-center justify-center mx-auto text-[#E5B54F]">
            <Lock size={32} />
          </div>
          
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">כניסה למערכת הניהול</h2>
            <p className="text-slate-400 text-sm">הזן קוד גישה לצפייה בשמות שנשלחו לאוהל</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4 text-right">
            <div>
              <label className="block text-xs text-amber-200/80 mb-1.5 font-semibold">קוד גישה (PIN):</label>
              <input 
                type="password"
                value={pinInput}
                onChange={(e) => setPinInput(e.target.value)}
                placeholder="הזן קוד..."
                className="w-full bg-slate-900/80 border border-slate-700 focus:border-[#E5B54F] text-center text-xl tracking-widest font-mono text-white rounded-xl py-3 px-4 outline-none transition"
                autoFocus
              />
            </div>

            {pinError && (
              <p className="text-red-400 text-xs bg-red-950/40 border border-red-800/50 rounded-lg p-2.5 flex items-center gap-1.5 justify-center">
                <ShieldAlert size={14} />
                <span>{pinError}</span>
              </p>
            )}

            <button 
              type="submit"
              className="w-full bg-gradient-to-r from-[#E5B54F] via-[#D4A038] to-[#C28C28] text-black font-bold py-3 rounded-xl hover:brightness-110 active:scale-[0.99] transition shadow-lg flex items-center justify-center gap-2"
            >
              <span>כניסה למערכת</span>
            </button>
          </form>

          <div className="pt-2 border-t border-slate-800 flex justify-end items-center text-xs text-slate-500">
            <button onClick={onBackToSite} className="text-[#E5B54F] hover:underline flex items-center gap-1">
              <span>חזרה לאתר</span>
              <ArrowRight size={12} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-slate-100 flex flex-col font-sans" dir="rtl">
      
      {/* Top Navbar */}
      <header className="bg-[#111116] border-b border-[#E5B54F]/20 px-4 sm:px-8 py-4 sticky top-0 z-30 flex items-center justify-between shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#E5B54F]/10 border border-[#E5B54F]/40 flex items-center justify-center text-[#E5B54F]">
            <FileText size={20} />
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-bold text-white leading-tight">ניהול שמות - 770 האוהל הקדוש</h1>
            <p className="text-xs text-slate-400">מערכת ריכוז ובקרה בזמן אמת (Firebase Firestore)</p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <button 
            onClick={onBackToSite}
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs sm:text-sm px-3.5 py-2 rounded-xl border border-slate-600/60 transition flex items-center gap-1.5"
          >
            <span>לאתר הראשי</span>
            <ArrowRight size={14} />
          </button>
          <button 
            onClick={handleLogout}
            className="bg-red-950/40 hover:bg-red-900/60 text-red-300 text-xs sm:text-sm px-3.5 py-2 rounded-xl border border-red-800/50 transition flex items-center gap-1.5"
          >
            <LogOut size={14} />
            <span className="hidden sm:inline">יציאה</span>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 space-y-6">
        
        {/* Error Alert if Firestore setup is missing */}
        {errorMsg && (
          <div className="bg-red-950/60 border border-red-700/60 text-red-200 rounded-2xl p-4 flex items-start gap-3">
            <ShieldAlert size={20} className="text-red-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-sm">שגיאה בחיבור ל-Firebase Firestore</h4>
              <p className="text-xs text-red-300 mt-1">{errorMsg}</p>
            </div>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          <div className="bg-[#111116] border border-amber-500/20 rounded-2xl p-4 flex flex-col justify-between">
            <span className="text-xs text-slate-400 font-semibold">סה"כ שמות</span>
            <div className="flex items-baseline justify-between mt-2">
              <span className="text-2xl sm:text-3xl font-extrabold text-[#E5B54F]">{totalCount}</span>
              <span className="text-xs bg-amber-500/10 text-amber-300 px-2 py-0.5 rounded-full border border-amber-500/20">רשומים</span>
            </div>
          </div>

          <div className="bg-[#111116] border border-blue-500/20 rounded-2xl p-4 flex flex-col justify-between">
            <span className="text-xs text-slate-400 font-semibold">טרם נקראו (חדשים)</span>
            <div className="flex items-baseline justify-between mt-2">
              <span className="text-2xl sm:text-3xl font-extrabold text-blue-400">{newCount}</span>
              <span className="text-xs bg-blue-500/10 text-blue-300 px-2 py-0.5 rounded-full border border-blue-500/20">ממתינים</span>
            </div>
          </div>

          <div className="bg-[#111116] border border-emerald-500/20 rounded-2xl p-4 flex flex-col justify-between">
            <span className="text-xs text-slate-400 font-semibold">בקשות לרפואה</span>
            <div className="flex items-baseline justify-between mt-2">
              <span className="text-2xl sm:text-3xl font-extrabold text-emerald-400">{refuahCount}</span>
              <span className="text-xs bg-emerald-500/10 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/20">רפואה</span>
            </div>
          </div>

          <div className="bg-[#111116] border border-purple-500/20 rounded-2xl p-4 flex flex-col justify-between">
            <span className="text-xs text-slate-400 font-semibold">זיווג / פרנסה</span>
            <div className="flex items-baseline justify-between mt-2">
              <span className="text-2xl sm:text-3xl font-extrabold text-purple-400">{zivugCount + parnasahCount}</span>
              <span className="text-xs bg-purple-500/10 text-purple-300 px-2 py-0.5 rounded-full border border-purple-500/20">ברכה</span>
            </div>
          </div>
        </div>

        {/* Toolbar: Search, Filters & Action Buttons */}
        <div className="bg-[#111116] border border-[#E5B54F]/20 rounded-2xl p-4 flex flex-col md:flex-row gap-4 items-center justify-between shadow-lg">
          
          {/* Search & Category Filter */}
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto items-center">
            
            {/* Search Input */}
            <div className="relative w-full sm:w-64">
              <Search size={16} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="חפש שם / שם אם / הערה..."
                className="w-full bg-slate-900 border border-slate-700 focus:border-[#E5B54F] text-xs text-slate-200 rounded-xl py-2.5 pr-9 pl-3 outline-none"
              />
            </div>

            {/* Category Filter */}
            <select 
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full sm:w-auto bg-slate-900 border border-slate-700 text-xs text-amber-200/90 rounded-xl py-2.5 px-3 outline-none focus:border-[#E5B54F]"
            >
              <option value="all">כל הקטגוריות</option>
              <option value="ברכה ואיחול">ברכה ואיחול</option>
              <option value="רפואה">רפואה</option>
              <option value="זיווג">זיווג</option>
              <option value="פרנסה">פרנסה</option>
              <option value="נחת מהילדים">נחת מהילדים</option>
              <option value="כללי">כללי</option>
            </select>

            {/* Status Filter */}
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full sm:w-auto bg-slate-900 border border-slate-700 text-xs text-slate-300 rounded-xl py-2.5 px-3 outline-none focus:border-[#E5B54F]"
            >
              <option value="all">כל הסטטוסים</option>
              <option value="new">חדשים בלבד</option>
              <option value="processed">נקראו בלבד</option>
            </select>
          </div>

          {/* Action Buttons: Export & Print */}
          <div className="flex items-center gap-2.5 w-full md:w-auto justify-end">
            <button 
              onClick={exportToCSV}
              className="flex-1 md:flex-none bg-slate-800 hover:bg-slate-700 text-amber-300 text-xs font-semibold px-4 py-2.5 rounded-xl border border-amber-500/30 transition flex items-center justify-center gap-2"
            >
              <Download size={15} />
              <span>יצוא ל-Excel (CSV)</span>
            </button>

            <button 
              onClick={handlePrint}
              className="flex-1 md:flex-none bg-gradient-to-r from-[#E5B54F] via-[#D4A038] to-[#C28C28] text-black text-xs font-bold px-4 py-2.5 rounded-xl hover:brightness-110 transition flex items-center justify-center gap-2 shadow-md"
            >
              <Printer size={15} />
              <span>הדפסה מרוכזת לאוהל</span>
            </button>
          </div>

        </div>

        {/* Data Table Container */}
        <div className="bg-[#111116] border border-[#E5B54F]/20 rounded-2xl overflow-hidden shadow-2xl">
          {loading ? (
            <div className="py-16 text-center text-slate-400 space-y-3">
              <RefreshCw size={28} className="animate-spin text-[#E5B54F] mx-auto" />
              <p className="text-sm">טוען שמות בזמן אמת מ-Firestore...</p>
            </div>
          ) : filteredNames.length === 0 ? (
            <div className="py-16 text-center text-slate-500 space-y-2">
              <FileText size={36} className="mx-auto text-slate-600" />
              <p className="text-base font-semibold text-slate-400">לא נמצאו שמות מתאימים</p>
              <p className="text-xs text-slate-500">נסה לשנות את מסנני החיפוש או המתן לשמות חדשים</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs sm:text-sm">
                <thead>
                  <tr className="bg-slate-900/80 border-b border-slate-800 text-amber-200/90 text-xs font-semibold">
                    <th className="py-3.5 px-4 w-12">#</th>
                    <th className="py-3.5 px-4">שם מלא</th>
                    <th className="py-3.5 px-4">שם האם</th>
                    <th className="py-3.5 px-4">סוג הבקשה</th>
                    <th className="py-3.5 px-4">הערה / פרטים</th>
                    <th className="py-3.5 px-4">תאריך שליחה</th>
                    <th className="py-3.5 px-4">סטטוס</th>
                    <th className="py-3.5 px-4 text-center">פעולות</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredNames.map((item, index) => {
                    const isProcessed = item.status === 'processed';
                    return (
                      <tr 
                        key={item.id} 
                        className={`hover:bg-slate-800/30 transition ${isProcessed ? 'opacity-60 bg-slate-950/40' : ''}`}
                      >
                        <td className="py-3.5 px-4 text-slate-500 font-mono">{index + 1}</td>
                        <td className="py-3.5 px-4 font-bold text-white">{item.fullName}</td>
                        <td className="py-3.5 px-4 text-amber-200/90">{item.motherName ? `בת/בן ${item.motherName}` : '-'}</td>
                        <td className="py-3.5 px-4">
                          <span className="inline-block bg-[#E5B54F]/10 border border-[#E5B54F]/30 text-[#E5B54F] text-[11px] font-semibold px-2.5 py-0.5 rounded-full">
                            {item.requestType || 'כללי'}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-slate-300 max-w-xs truncate" title={item.note}>
                          {item.note || '-'}
                        </td>
                        <td className="py-3.5 px-4 text-slate-400 text-xs dir-ltr text-right font-mono">
                          {item.formattedDate || (item.createdAtDate ? new Date(item.createdAtDate).toLocaleString('he-IL') : '-')}
                        </td>
                        <td className="py-3.5 px-4">
                          {isProcessed ? (
                            <span className="inline-flex items-center gap-1 text-emerald-400 text-xs font-semibold bg-emerald-950/40 border border-emerald-800/50 px-2 py-0.5 rounded-md">
                              <CheckCircle size={12} />
                              <span>נקרא</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-blue-400 text-xs font-semibold bg-blue-950/40 border border-blue-800/50 px-2 py-0.5 rounded-md">
                              <Clock size={12} />
                              <span>חדש</span>
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => handleToggleStatus(item.id, item.status)}
                              title={isProcessed ? "סמן כחדש" : "סמן כנקרא"}
                              className={`p-1.5 rounded-lg border transition ${
                                isProcessed 
                                  ? 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white' 
                                  : 'bg-emerald-950/50 border-emerald-700/60 text-emerald-300 hover:bg-emerald-900'
                              }`}
                            >
                              <CheckCircle size={14} />
                            </button>
                            <button
                              onClick={() => handleDelete(item.id, item.fullName)}
                              title="מחק שם"
                              className="p-1.5 rounded-lg bg-red-950/40 border border-red-800/50 text-red-400 hover:bg-red-900 hover:text-white transition"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          <div className="bg-slate-900/90 border-t border-slate-800 p-3 px-4 text-xs text-slate-400 flex items-center justify-between">
            <span>מציג {filteredNames.length} רשומות מתוך {names.length}</span>
            <span className="text-[#E5B54F]">770 - האוהל הקדוש ניו יורק</span>
          </div>
        </div>

      </main>
    </div>
  );
}
