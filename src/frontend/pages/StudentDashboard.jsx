import { useEffect, useState } from 'react';
import {
  AlertTriangle,
  Award,
  BookOpen,
  Calendar,
  Clock,
  FileText,
  User as UserIcon,
  CheckCircle2,
  XCircle,
  ArrowRight,
  ArrowLeft,
  Sparkles,
} from 'lucide-react';
import { motion } from 'motion/react';
import StatusBadge from '../components/StatusBadge.jsx';
import { useLanguage } from '../controllers/LanguageContext.jsx';

export default function StudentDashboard({ user, onNavigate, apiService }) {
  const { t, lang } = useLanguage();
  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const app = await apiService.student.getStatus();
        setApplication(app);
      } catch (err) {
        setError(err.message || 'Error occurred loading student enrollment stats');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [apiService]);

  if (loading) {
    return (
      <div className="p-8 text-center text-zinc-500 dark:text-zinc-400 font-medium font-sans">
        {lang === 'fa' ? 'در حال همگام‌سازی مشخصات کاربری شما...' : lang === 'ps' ? 'ستاسو د معلوماتو همغږي کول...' : 'Synchronizing credentials profile data...'}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome header banner */}
      <div className="bg-gradient-to-r from-blue-950 via-[#0a1838] to-[#040d21] text-white rounded-xl p-6 md:p-8 border border-blue-900/35 shadow-md relative overflow-hidden backdrop-blur-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg md:text-xl font-bold tracking-tight">
            {t('studentWelcome')} {user?.name}!
          </h2>
          <p className="text-zinc-400 text-xs md:text-sm mt-1 max-w-xl">
            {t('studentTriageDesc')}
          </p>
        </div>
        <button
          onClick={() => onNavigate('/')}
          className="px-3.5 py-2 text-xs text-zinc-200 hover:text-white bg-blue-900/40 hover:bg-blue-800/60 border border-blue-700/50 rounded-lg cursor-pointer flex items-center gap-1.5 transition-all font-bold whitespace-nowrap"
        >
          <ArrowLeft className={`w-3.5 h-3.5 ${lang === 'fa' || lang === 'ps' ? 'rotate-180' : ''}`} />
          {t('backToHome')}
        </button>
      </div>

      {/* Smooth Active Notification Banner on Status Update */}
      {application && application.status && application.status !== 'Pending' && (
        <motion.div
          initial={{ opacity: 0, y: -10, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className={`p-5 rounded-2xl border shadow-xl relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${
            application.status === 'Approved'
              ? 'bg-gradient-to-r from-emerald-950/90 via-emerald-900/90 to-teal-950/90 text-white border-emerald-500/30'
              : application.status === 'Rejected'
              ? 'bg-gradient-to-r from-rose-950/90 via-rose-900/90 to-red-950/90 text-white border-rose-500/30'
              : 'bg-gradient-to-r from-amber-950/90 via-amber-900/90 to-orange-950/90 text-white border-amber-500/30'
          }`}
        >
          <div className="flex items-start md:items-center gap-3.5">
            <div className={`p-3 rounded-xl border shrink-0 ${
              application.status === 'Approved'
                ? 'bg-emerald-500/20 border-emerald-400/30 text-emerald-300'
                : application.status === 'Rejected'
                ? 'bg-rose-500/20 border-rose-400/30 text-rose-300'
                : 'bg-amber-500/20 border-amber-400/30 text-amber-300'
            }`}>
              {application.status === 'Approved' ? (
                <CheckCircle2 className="w-6 h-6 animate-bounce" />
              ) : application.status === 'Rejected' ? (
                <XCircle className="w-6 h-6" />
              ) : (
                <AlertTriangle className="w-6 h-6" />
              )}
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                  application.status === 'Approved'
                    ? 'bg-emerald-500/30 text-emerald-200'
                    : application.status === 'Rejected'
                    ? 'bg-rose-500/30 text-rose-200'
                    : 'bg-amber-500/30 text-amber-200'
                }`}>
                  {application.status === 'Approved'
                    ? (lang === 'fa' ? 'کارت تایید گردید' : lang === 'ps' ? 'کارت تایید شو' : 'ID Card Approved')
                    : application.status === 'Rejected'
                    ? (lang === 'fa' ? 'کارت رد گردید' : lang === 'ps' ? 'کارت رد شو' : 'ID Card Rejected')
                    : (lang === 'fa' ? 'نیازمند اصلاح اسناد' : lang === 'ps' ? 'د اسنادو د سمون اړتیا' : 'Correction Needed')}
                </span>
                <Sparkles className="w-3.5 h-3.5 text-amber-300 opacity-80" />
              </div>

              <h4 className="text-sm font-extrabold text-white leading-snug">
                {application.status === 'Approved'
                  ? (lang === 'fa' ? '🎉 کارت هویت محصلی شما صادر شد!' : lang === 'ps' ? '🎉 ستاسو د محصلۍ کارت منظور شو!' : '🎉 Official Student ID Card Ready!')
                  : application.status === 'Rejected'
                  ? (lang === 'fa' ? '⚠️ درخواست کارت محصلی شما رد شد.' : lang === 'ps' ? '⚠️ ستاسو د کارت غوښتنه رد شوه.' : '⚠️ Application Status: Rejected')
                  : (lang === 'fa' ? '✏️ اسناد شما نیازمند بازبینی مجدد است.' : lang === 'ps' ? '✏️ ستاسو اسناد سمون ته اړتیا لري.' : '✏️ Action Required on Enrollment Form')}
              </h4>

              <p className="text-xs text-zinc-200/90 leading-relaxed">
                {application.status === 'Approved'
                  ? (lang === 'fa' ? `کارت محصلی رسمی شما (${application.studentCardId || 'صادر شده'}) تایید شده است. می‌توانید آن را مشاهده یا چاپ نمایید.` : lang === 'ps' ? `ستاسو کارت (${application.studentCardId || 'صادر شوی'}) تایید شوی دی.` : `Your Hariwa University Student Card (${application.studentCardId || 'Issued'}) has been approved.`)
                  : (application.adminNote || (lang === 'fa' ? 'جهت اطلاعات بیشتر به مدیریت مراجعه کنید.' : lang === 'ps' ? 'د نورو معلوماتو لپاره مدیریت ته مراجعه وکړئ.' : 'Please review administrative notes.'))}
              </p>
            </div>
          </div>

          <button
            onClick={() => onNavigate('/student/status')}
            className={`px-4 py-2 rounded-xl font-bold text-xs shadow-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 shrink-0 self-stretch md:self-auto ${
              application.status === 'Approved'
                ? 'bg-emerald-500 hover:bg-emerald-400 text-white'
                : application.status === 'Rejected'
                ? 'bg-rose-500 hover:bg-rose-400 text-white'
                : 'bg-amber-500 hover:bg-amber-400 text-white'
            }`}
          >
            <span>{lang === 'fa' ? 'مشاهده کارت هویت' : lang === 'ps' ? 'د هویت کارت لیدل' : 'View Official ID Card'}</span>
            <ArrowRight className="w-4 h-4 ltr:inline rtl:rotate-180" />
          </button>
        </motion.div>
      )}

      {/* Profile Overview */}
      <div className="grid lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 space-y-4 shadow-sm">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-black dark:text-white text-xs sm:text-sm tracking-tight">
                {lang === 'fa' ? 'وضعیت پذیرش شما' : lang === 'ps' ? 'ستاسو د شمولیت حالت' : 'Current Enrollment Status'}
              </h3>
              {application ? (
                <StatusBadge status={application.status} />
              ) : (
                <span className="text-xs bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 font-medium px-2.5 py-1 rounded-md border border-zinc-200 dark:border-zinc-800">
                  {lang === 'fa' ? 'فورم ارسال نشده' : lang === 'ps' ? 'فورم نه دی لیږل شوی' : 'Not Submitted'}
                </span>
              )}
            </div>

            {application ? (
              <div className="p-4 bg-zinc-100/40 dark:bg-blue-950/20 border border-zinc-200/50 dark:border-blue-900/30 rounded-lg space-y-3">
                <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 ${lang === 'fa' || lang === 'ps' ? 'flex-row-reverse' : ''}`}>
                  <span className="text-[10px] text-zinc-500 dark:text-zinc-400 font-black uppercase tracking-wider">
                    {t('officialNotes')}
                  </span>
                  <span className="text-[10px] text-zinc-400 dark:text-zinc-500 font-semibold font-mono">
                    {t('lastUpdated')}: {new Date(application.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-xs text-zinc-700 dark:text-zinc-300 italic leading-relaxed">
                  "{application.adminNote || (lang === 'fa' ? 'یادداشتی درج نشده است.' : lang === 'ps' ? 'کوم یادداښت نه دی ثبت شوی.' : 'No review comments logged yet.')}"
                </p>
              </div>
            ) : (
              <div className="p-6 text-center bg-amber-50/20 dark:bg-amber-950/10 border border-amber-200/40 dark:border-amber-900/20 rounded-lg space-y-3">
                <Clock className="w-8 h-8 text-amber-500 mx-auto" />
                <h4 className="font-bold text-amber-800 dark:text-amber-300 text-xs sm:text-sm">
                  {t('actionRequired')}
                </h4>
                <p className="text-zinc-600 dark:text-zinc-400 text-xs max-w-sm mx-auto leading-relaxed">
                  {t('formUncompleted')}
                </p>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <button
                onClick={() => onNavigate('/student/register-form')}
                className="flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg cursor-pointer shadow-sm transition-all text-center leading-none"
              >
                <FileText className="w-3.5 h-3.5" />
                {application ? (lang === 'fa' ? 'اصلاح و ارسال مجدد' : lang === 'ps' ? 'اصلاح او بیا لیږل' : 'Edit Profile & Resubmit') : t('goToForm')}
              </button>

              <button
                onClick={() => onNavigate('/student/status')}
                disabled={!application}
                className="flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-bold text-zinc-700 dark:text-zinc-300 bg-zinc-100/60 hover:bg-zinc-250/60 dark:bg-blue-950/30 dark:hover:bg-blue-950/50 border border-zinc-200 dark:border-blue-900/30 rounded-lg cursor-pointer disabled:opacity-40 disabled:pointer-events-none transition-all leading-none text-center"
              >
                <Award className="w-3.5 h-3.5 text-blue-500 dark:text-blue-400" />
                {t('menuStatus')}
              </button>

              <button
                onClick={() => onNavigate('/student/register-form')}
                className="flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-bold text-zinc-700 dark:text-zinc-300 bg-zinc-100/60 hover:bg-zinc-250/60 dark:bg-blue-950/30 dark:hover:bg-blue-950/50 border border-zinc-200 dark:border-blue-900/30 rounded-lg cursor-pointer transition-colors leading-none text-center"
              >
                <UserIcon className="w-3.5 h-3.5 text-blue-500 dark:text-blue-400" />
                {lang === 'fa' ? 'مشخصات حساب' : lang === 'ps' ? 'د حساب مشخصات' : 'Edit Account'}
              </button>
            </div>
          </div>

          {/* Quick Stats Grid */}
          {application && (
            <div className="glass-panel rounded-xl p-6 shadow-sm">
              <h3 className="font-bold text-black dark:text-white text-xs sm:text-sm tracking-tight mb-4">
                {lang === 'fa' ? 'مشخصات رشته انتخاب شده شما' : lang === 'ps' ? 'ستاسو د انتخاب شوې رشتې معلومات' : 'Assigned Curriculum Segment'}
              </h3>
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="p-3.5 bg-zinc-100/40 dark:bg-blue-950/10 border border-zinc-200/40 dark:border-blue-900/20 rounded-lg">
                  <span className="text-[10px] text-zinc-500 dark:text-zinc-400 font-bold uppercase block select-none">
                    {lang === 'fa' ? 'دانشکده' : lang === 'ps' ? 'پوهنځی' : 'FACULTY'}
                  </span>
                  <span className="text-xs font-bold text-black dark:text-white block mt-1">
                    {application.faculty}
                  </span>
                </div>
                <div className="p-3.5 bg-zinc-100/40 dark:bg-blue-950/10 border border-zinc-200/40 dark:border-blue-900/20 rounded-lg">
                  <span className="text-[10px] text-zinc-500 dark:text-zinc-400 font-bold uppercase block select-none">
                    {lang === 'fa' ? 'رشته و دیپارتمنت' : lang === 'ps' ? 'څانګه او ډیپارټمنټ' : 'DEPARTMENT'}
                  </span>
                  <span className="text-xs font-bold text-black dark:text-white block mt-1">
                    {application.department}
                  </span>
                </div>
                <div className="p-3.5 bg-zinc-100/40 dark:bg-blue-950/10 border border-zinc-200/40 dark:border-blue-900/20 rounded-lg col-span-2 lg:col-span-1">
                  <span className="text-[10px] text-zinc-500 dark:text-zinc-400 font-bold uppercase block select-none">
                    {lang === 'fa' ? 'سال پذیرش' : lang === 'ps' ? 'د منلو کال' : 'BATCH YEAR'}
                  </span>
                  <span className="text-xs font-bold text-black dark:text-white block mt-1">
                    {application.admissionYear}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Notifications sidebar */}
        <div className="lg:col-span-4 space-y-6">
          <div className="glass-panel rounded-xl p-6 space-y-4 shadow-sm">
            <h3 className="font-bold text-black dark:text-white text-xs sm:text-sm tracking-tight border-b border-zinc-200 dark:border-zinc-800/60 pb-2">
              {lang === 'fa' ? 'خبرنامه‌ها و اطلاعیه‌ها' : lang === 'ps' ? 'خبرتیاوې او اعلانات' : 'System Notifications'}
            </h3>
            <div className="space-y-3.5">
              {application?.status === 'Need Correction' && (
                <div className="p-3.5 bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/40 rounded-lg flex gap-3">
                  <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <h5 className="text-xs font-bold text-rose-700 dark:text-rose-350">{t('correctionNeeded')}</h5>
                    <p className="text-[11px] text-rose-600 dark:text-rose-200 leading-relaxed">
                      {t('correctionDesc')}
                    </p>
                  </div>
                </div>
              )}

              <div className="p-3.5 bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200/30 rounded-lg flex gap-3">
                <BookOpen className="w-4 h-4 text-blue-500 dark:text-blue-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h5 className="text-xs font-bold text-blue-700 dark:text-blue-400">{lang === 'fa' ? 'کتالوگ علمی دانشگاه ۲۰۲۶' : lang === 'ps' ? 'د ۲۰۲۶ علمي کتالوګ' : 'Academic Catalogs 2026'}</h5>
                  <p className="text-[11px] text-blue-600 dark:text-blue-300 leading-relaxed">
                    {lang === 'fa' 
                      ? 'کتابچه رهنمای معرفی مضامین سمستر اول و بورس‌ها هم اکنون از بخش پذیرش قابل دریافت است.' 
                      : lang === 'ps'
                      ? 'د لومړي سمستر د مضامینو او بورسونو پیژندنې لارښود کتابګوټی همدا اوس له پورټل څخه د ترلاسه کولو وړ دی.'
                      : 'ASU Course calendars and freshman guide brochures are now available.'}
                  </p>
                </div>
              </div>

              <div className="p-3.5 bg-zinc-100/40 dark:bg-blue-950/15 border border-zinc-200/40 dark:border-blue-900/25 rounded-lg flex gap-3">
                <Calendar className="w-4 h-4 text-zinc-500 dark:text-zinc-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h5 className="text-xs font-bold text-zinc-700 dark:text-zinc-200">{lang === 'fa' ? 'اعلام ضرب‌الاجل ثبت‌نام' : lang === 'ps' ? 'د نوم لیکنې وروستی چانس' : 'Deadline Notice'}</h5>
                  <p className="text-[11px] text-zinc-600 dark:text-zinc-400 leading-relaxed">
                    {lang === 'fa' 
                      ? 'آخرین مهلت تکمیل اسناد برای سمستر خزانی تا تاریخ ۱۵ جون ۲۰۲۶ می‌باشد.' 
                      : lang === 'ps'
                      ? 'د منی د سمستر نوم لیکنې د اسنادو د تصدیق لړۍ د جون په ۱۵مه پای ته رسیږي.'
                      : 'Fall semester registry closes final enrollment validation on June 15th, 2026.'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
