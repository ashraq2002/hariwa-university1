import { useEffect, useState } from 'react';
import {
  Users,
  Clock,
  CheckCircle,
  AlertOctagon,
  ArrowRight,
  ArrowLeft,
  Home,
  ShieldCheck,
  RefreshCw,
  TrendingUp,
  UserPlus,
  Bell,
  X,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useLanguage } from '../controllers/LanguageContext.jsx';

export default function AdminDashboard({ onNavigate, apiService }) {
  const { t, lang } = useLanguage();
  const [stats, setStats] = useState({
    totalStudents: 0,
    pendingStudents: 0,
    approvedStudents: 0,
    rejectedStudents: 0,
    correctionRequired: 0,
  });
  const [recentApps, setRecentApps] = useState([]);
  const [activeRegNotif, setActiveRegNotif] = useState(null);
  const [dismissedNotif, setDismissedNotif] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      // Fetch stats, registry signups, and notifications in parallel
      const [statsData, appsData, notifData] = await Promise.all([
        apiService.admin.getStats(),
        apiService.admin.getApplications(),
        apiService.notifications.getAll().catch(() => ({ notifications: [], unreadCount: 0 })),
      ]);

      setStats(statsData);
      
      const sorted = [...appsData].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      setRecentApps(sorted.slice(0, 4));

      // Find most recent registration or application notification for admin
      const regNotif = (notifData.notifications || []).find(
        (n) => n.type === 'registration' || n.type === 'application'
      );
      if (regNotif && !dismissedNotif) {
        setActiveRegNotif(regNotif);
      }
    } catch (err) {
      setError(err.message || 'Administrative secure handshake rejected.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [apiService]);

  if (loading) {
    return (
      <div className="p-8 text-center text-zinc-500 dark:text-zinc-400 font-medium flex items-center justify-center gap-2">
        <RefreshCw className="w-4 h-4 animate-spin text-blue-600 dark:text-blue-400" />
        <span>{lang === 'fa' ? 'در حال هماهنگ سازی آماره‌های سیستمی...' : lang === 'ps' ? 'د سيستمي احصائيو همغږي کول...' : 'Configuring metrics slate...'}</span>
      </div>
    );
  }

  const approvalRate = stats.totalStudents > 0 
    ? Math.round((stats.approvedStudents / stats.totalStudents) * 100) 
    : 0;

  return (
    <div className="space-y-6">
      {/* Admin Greeting header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between text-start gap-4 bg-zinc-950 dark:bg-black text-white rounded-2xl p-5 sm:p-6 border border-zinc-800 relative overflow-hidden shadow-sm">
        <div className="space-y-1.5 relative z-10 text-start flex-1 min-w-0">
          <div className="flex items-center gap-1.5 text-xs text-blue-400 font-bold uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4 shrink-0 text-blue-400" /> 
            <span className="truncate">{lang === 'fa' ? 'بخش کنترول و مدیریت سیستم پذیرش' : lang === 'ps' ? 'د منلو سیسټم کنټرول او مدیریت برخه' : 'SECURE ADMINISTRATIVE ROOT'}</span>
          </div>
          <h2 className="text-lg sm:text-xl md:text-2xl font-black tracking-tight leading-snug text-white">
            {lang === 'fa' ? 'میز پذیرش مرکزی پوهنتون هریوا' : lang === 'ps' ? 'د هریوا پوهنتون د منلو مرکز' : 'University Registry Controls'}
          </h2>
          <p className="text-zinc-400 text-xs leading-relaxed max-w-2xl">
            {lang === 'fa' 
              ? 'بررسی اسناد ارسالی داوطلبان کانکور، تایید مدارک شهادتنامه صادر شده یا تذکره هموطنان.' 
              : lang === 'ps'
              ? 'د کانکور داوطلبانو د اسنادو ارزونه، د شهادتنامو او تذکرو تصدیق کول.'
              : 'Review academic enrollment credentials index files, assign faculty streams, or verify Tazkira IDs.'}
          </p>
        </div>

        <div className="flex items-center gap-2 relative z-10 shrink-0 self-start sm:self-center flex-wrap">
          <button
            onClick={() => onNavigate('/')}
            className="px-3 py-2 text-xs text-zinc-300 hover:text-white bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-xl cursor-pointer flex items-center gap-1.5 transition-all font-bold whitespace-nowrap active:scale-95"
          >
            <ArrowLeft className={`w-3.5 h-3.5 ${lang === 'fa' || lang === 'ps' ? 'rotate-180' : ''}`} />
            {t('backToHome')}
          </button>
          <button
            onClick={loadData}
            className="px-3 py-2 text-xs text-zinc-300 hover:text-white bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-xl cursor-pointer flex items-center gap-1.5 transition-all font-bold whitespace-nowrap active:scale-95"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            {t('reloadSet')}
          </button>
        </div>
      </div>

      {/* Active User Registration / Application Smooth Alert Banner */}
      <AnimatePresence>
        {activeRegNotif && !dismissedNotif && (
          <motion.div
            initial={{ opacity: 0, y: -12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.98 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="p-4 rounded-xl bg-gradient-to-r from-blue-900/90 via-indigo-900/90 to-blue-950/90 text-white border border-blue-500/30 shadow-lg relative overflow-hidden flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
          >
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-blue-500/20 border border-blue-400/30 text-blue-300 shrink-0">
                <UserPlus className="w-5 h-5 animate-pulse" />
              </div>
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-full bg-blue-500/30 text-blue-200 text-[10px] font-extrabold uppercase tracking-wider">
                    {lang === 'fa' ? 'اعلان جدید سیستمی' : lang === 'ps' ? 'نوی سیسټم خبرتیا' : 'Active Admin Stream'}
                  </span>
                  <span className="text-[10px] text-blue-300 font-mono">
                    {new Date(activeRegNotif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <h4 className="text-xs sm:text-sm font-bold text-white leading-tight">
                  {activeRegNotif.title}
                </h4>
                <p className="text-xs text-blue-100/80 leading-relaxed">
                  {activeRegNotif.message}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
              <button
                onClick={() => onNavigate('/admin/students')}
                className="px-3 py-1.5 rounded-lg bg-blue-500 hover:bg-blue-400 text-white font-bold text-xs shadow-md transition-all cursor-pointer flex items-center gap-1"
              >
                <span>{lang === 'fa' ? 'مشاهده فهرست محصلین' : lang === 'ps' ? 'د محصلینو لست لیدل' : 'Inspect Student Registry'}</span>
                <ArrowRight className="w-3.5 h-3.5 ltr:inline rtl:rotate-180" />
              </button>
              <button
                onClick={() => setDismissedNotif(true)}
                className="p-1.5 rounded-lg text-blue-200 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                title="Dismiss"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {error && (
        <div className="p-4 bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/30 rounded-lg text-rose-750 dark:text-rose-400 text-xs font-semibold">
          {error}
        </div>
      )}

      {/* Stats Cards Grid (Bento) */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {/* Total App card */}
        <div className="glass-panel hover:bg-white/95 dark:hover:bg-[#070e22]/75 p-4 sm:p-5 rounded-xl flex flex-col justify-between hover:border-zinc-300 dark:hover:border-blue-700/45 transition-colors shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-zinc-400 dark:text-zinc-500 font-bold uppercase tracking-wider select-none">
              {lang === 'fa' ? 'کل ثبت‌نامی‌ها' : lang === 'ps' ? 'ټول نوم لیکنې' : 'TOTAL SIGNUPS'}
            </span>
            <div className="p-1.5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-zinc-600 dark:text-zinc-400">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-black tracking-tight text-black dark:text-white">{stats.totalStudents}</h3>
            <span className="text-[10px] text-zinc-500 dark:text-zinc-400 font-semibold mt-1 block">{lang === 'fa' ? 'دوسیه شمولیت فعال' : lang === 'ps' ? 'فعاله عریضه/دوسيه' : 'Active Profiles'}</span>
          </div>
        </div>

        {/* Pending card */}
        <div className="glass-panel p-4 sm:p-5 rounded-xl flex flex-col justify-between border-l-4 border-l-amber-500 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-amber-600 dark:text-amber-500 font-bold uppercase tracking-wider select-none">
              {lang === 'fa' ? 'در انتظار بررسی' : lang === 'ps' ? 'ارزونې ته چمتو' : 'AWAITING TRIAGE'}
            </span>
            <div className="p-1.5 bg-amber-50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/30 rounded-lg text-amber-600 dark:text-amber-400">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-black tracking-tight text-black dark:text-white">{stats.pendingStudents}</h3>
            <span className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold mt-1 block">{lang === 'fa' ? 'در صف بررسی نمرات' : lang === 'ps' ? 'ارزونې په کتار کې' : 'Review In Queue'}</span>
          </div>
        </div>

        {/* Approved card */}
        <div className="glass-panel p-4 sm:p-5 rounded-xl flex flex-col justify-between border-l-4 border-l-emerald-500 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-emerald-600 dark:text-emerald-500 font-bold uppercase tracking-wider select-none">
              {lang === 'fa' ? 'پذیرفته شدگان' : lang === 'ps' ? 'منل شوي' : 'VERIFIED MEMBERS'}
            </span>
            <div className="p-1.5 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 rounded-lg text-emerald-600 dark:text-emerald-400">
              <CheckCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-black tracking-tight text-black dark:text-white">{stats.approvedStudents}</h3>
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold mt-1 block">{lang === 'fa' ? 'ثبت و صادر شده' : lang === 'ps' ? 'ثبت او صادر شوی' : 'Admitted & Ready'}</span>
          </div>
        </div>

        {/* Correction Required */}
        <div className="glass-panel p-4 sm:p-5 rounded-xl flex flex-col justify-between border-l-4 border-l-blue-600 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-blue-600 dark:text-blue-400 font-bold uppercase tracking-wider select-none">
              {lang === 'fa' ? 'نیازمند اصلاح' : lang === 'ps' ? 'سمون ته اړتیا لري' : 'PENDING FIXES'}
            </span>
            <div className="p-1.5 bg-blue-50 dark:bg-blue-950/20 border border-blue-200/50 rounded-lg text-blue-600 dark:text-blue-400">
              <AlertOctagon className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-black tracking-tight text-black dark:text-white">{stats.correctionRequired}</h3>
            <span className="text-[10px] text-blue-600 dark:text-blue-400 font-semibold mt-1 block">{lang === 'fa' ? 'نشاندار شده توسط بورد' : lang === 'ps' ? 'د بورد لخوا په نښه شوی' : 'Student Flagged'}</span>
          </div>
        </div>

        {/* Rejected card */}
        <div className="glass-panel p-4 sm:p-5 rounded-xl flex flex-col justify-between border-l-4 border-l-rose-500 shadow-sm col-span-2 md:col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-rose-600 dark:text-rose-500 font-bold uppercase tracking-wider select-none">
              {lang === 'fa' ? 'ردهای پذیرش' : lang === 'ps' ? 'رد شوې عریضې' : 'REJECT ADMISSIONS'}
            </span>
            <div className="p-1.5 bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/30 rounded-lg text-rose-600 dark:text-rose-400">
              <AlertOctagon className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-black tracking-tight text-black dark:text-white">{stats.rejectedStudents}</h3>
            <span className="text-[10px] text-rose-600 dark:text-rose-400 font-semibold mt-1 block">{lang === 'fa' ? 'خارج شده از سیستم' : lang === 'ps' ? 'له سیستم څخه وتلی' : 'Revoked Access'}</span>
          </div>
        </div>
      </div>

      {/* Middle dashboard widgets */}
      <div className="grid md:grid-cols-12 gap-6">
        {/* Recent Applications Lists previews */}
        <div className="md:col-span-8 glass-panel rounded-xl p-5 sm:p-6 space-y-4 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-bold text-black dark:text-white text-xs sm:text-sm tracking-tight">{lang === 'fa' ? 'ثبت‌نامی‌های اخیر دانشگاه' : lang === 'ps' ? 'وروستي نوم لیکل شوي' : 'Recent Registry Signups'}</h3>
              <p className="text-zinc-500 dark:text-zinc-400 text-xs">{lang === 'fa' ? 'درخواست‌های جدید داوطلبان کانکور به ترتیب تاریخ:' : lang === 'ps' ? 'د غوښتونکو نوي اسناد د نېټې له مخې:' : 'Verify submissions chronologically below.'}</p>
            </div>
            <button
              onClick={() => onNavigate('/admin/students')}
              className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:text-blue-750 transition-colors cursor-pointer self-start sm:self-auto"
            >
              {lang === 'fa' ? 'مشاهده تمام دوسیه‌ها ←' : lang === 'ps' ? 'ټول اسناد لیدل ←' : 'Full Registry →'}
            </button>
          </div>

          <div className="divide-y divide-zinc-200 dark:divide-zinc-800">
            {recentApps.length > 0 ? (
              recentApps.map((app) => (
                <div
                  key={app.id}
                  onClick={() => onNavigate(`/admin/students/${app.id}`)}
                  className="py-3.5 flex items-center justify-between gap-4 cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-900/60 rounded-lg px-2.5 transition-colors group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-lg bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-300 flex items-center justify-center font-bold text-xs select-none uppercase shrink-0">
                      {app.fullName.split(' ').slice(0, 2).map((n) => n[0]).join('') || 'U'}
                    </div>

                    <div className="min-w-0">
                      <h4 className="text-xs font-bold text-black dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors truncate">
                        {app.fullName}
                      </h4>
                      <p className="text-[11px] text-zinc-500 dark:text-zinc-400 truncate max-w-[120px] xs:max-w-[180px] sm:max-w-xs mt-0.5">
                        {app.faculty} — {app.department}
                      </p>
                    </div>
                  </div>

                  <div className="text-end shrink-0 flex flex-col items-end">
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold border ${
                        app.status === 'Approved'
                          ? 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 border-emerald-100'
                          : app.status === 'Pending'
                          ? 'bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-400 border-amber-100'
                          : app.status === 'Need Correction'
                          ? 'bg-blue-50/50 dark:bg-blue-950/20 text-blue-700 dark:text-blue-400 border-blue-200/30'
                          : 'bg-rose-50 dark:bg-rose-950/20 text-rose-700 dark:text-rose-400 border-rose-100'
                      }`}
                    >
                      {app.status}
                    </span>
                    <span className="text-[9px] block text-zinc-400 dark:text-zinc-500 mt-1 font-mono">
                      {new Date(app.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-8 text-center text-zinc-500 dark:text-zinc-400 font-medium text-xs">
                {lang === 'fa' ? 'هیچ دوسیه‌ای تا کنون ثبت نگردیده است.' : lang === 'ps' ? 'تر اوسه هیڅ عریضه نه ده ثبت شوې.' : 'No university signup records logged currently.'}
              </div>
            )}
          </div>
        </div>

        {/* Analytics Card */}
        <div className="md:col-span-4 glass-panel rounded-xl p-6 flex flex-col justify-between shadow-sm">
          <div className="space-y-4">
            <h3 className="font-bold text-black dark:text-white text-xs sm:text-sm tracking-tight border-b border-zinc-200 dark:border-zinc-800 pb-2">
              {lang === 'fa' ? 'کانال راندمان و شاخص پذیرش دانشگاه' : lang === 'ps' ? 'د پوهنتون منلو سرعت شاخص' : 'Admissions Efficiency KPI'}
            </h3>

            <div className="space-y-4">
              <div className="text-center py-4 bg-blue-50/30 dark:bg-blue-950/10 border border-blue-200/30 rounded-xl relative overflow-hidden">
                <TrendingUp className="w-16 h-16 text-blue-500/10 absolute -bottom-3 -right-2 transform rotate-12" />
                <span className="text-2xl font-black text-blue-600 dark:text-blue-400">{approvalRate}%</span>
                <span className="text-[10px] font-black text-blue-600 dark:text-blue-500 block uppercase select-none mt-1">
                  {lang === 'fa' ? 'میزان تاییدات اسناد کل' : lang === 'ps' ? 'د ټولو اسنادو د قبلیدو کچه' : 'Overall Approval Rate'}
                </span>
              </div>

              <div className="space-y-3 text-xs font-semibold">
                <div className="flex items-center justify-between text-zinc-600 dark:text-zinc-400">
                  <span>{lang === 'fa' ? 'بار کاری تیم پذیرش کریکولم:' : lang === 'ps' ? 'کاري بار او د کار کیفیت:' : 'Authorized staff load:'}</span>
                  <span className="font-bold text-black dark:text-white">{lang === 'fa' ? 'عالی و پایدار' : lang === 'ps' ? 'عالي او باثباته' : 'Excellent'}</span>
                </div>
                <div className="flex items-center justify-between text-zinc-600 dark:text-zinc-400">
                  <span>{lang === 'fa' ? 'میانگین زمان بررسی اسناد:' : lang === 'ps' ? 'د اسنادو د کتلو منځنی وخت:' : 'Average triage latency:'}</span>
                  <span className="font-black text-blue-600 dark:text-blue-400">&lt; ۲۴ {lang === 'fa' ? 'ساعت' : lang === 'ps' ? 'ساعتونه' : 'hours'}</span>
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={() => onNavigate('/admin/students')}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-4 rounded-lg text-xs transition-colors mt-6 flex items-center justify-center gap-1.5 leading-none shadow-sm cursor-pointer"
          >
            {lang === 'fa' ? 'ورود به بخش تصحیح و تایید اسناد' : lang === 'ps' ? 'د اسنادو کتلو او تصدیق خونې ته ننوتل' : 'Go to Triage Queue'}
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
