import { useState, useEffect } from 'react';
import { FileDown, FileText, Landmark, ShieldCheck, Upload, User, Phone, MapPin, Compass, AlertCircle, RefreshCw } from 'lucide-react';
import { useLanguage } from '../controllers/LanguageContext.jsx';

export default function RegistrationForm({ apiService, onNavigate }) {
  const { t, lang } = useLanguage();
  const [fullName, setFullName] = useState('');
  const [fatherName, setFatherName] = useState('');
  const [phone, setPhone] = useState('');
  const [faculty, setFaculty] = useState('Computer Science');
  const [department, setDepartment] = useState('Software Engineering');
  const [admissionYear, setAdmissionYear] = useState('2026');
  const [address, setAddress] = useState('');
  const [photo, setPhoto] = useState('');
  const [tazkira, setTazkira] = useState('');
  const [certificate, setCertificate] = useState('');

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Faculties options
  const facultyDepartments = {
    'Dentistry': ['Dental Surgery', 'Orthodontics & Prosthodontics'],
    'Computer Science': ['Software Engineering', 'Database & Info Systems'],
    'Law Faculty': ['Public & International Law', 'Private Law & Judiciary'],
    'Business Management': ['Business Administration', 'Finance & Accounting'],
  };

  const localizedFacultyNames = {
    'Dentistry': lang === 'fa' ? 'طب دندان (ستوماتولوژی)' : lang === 'ps' ? 'د غاښونو طب (ستوماتولوژي)' : 'Dentistry',
    'Computer Science': lang === 'fa' ? 'کمپیوتر ساینس' : lang === 'ps' ? 'کمپیوټر ساینس' : 'Computer Science',
    'Law Faculty': lang === 'fa' ? 'حقوق و علوم سیاسی' : lang === 'ps' ? 'حقوق او سیاسي علوم' : 'Law Faculty',
    'Business Management': lang === 'fa' ? 'اداره و تجارت' : lang === 'ps' ? 'سوداګري او اداره' : 'Business Management',
  };

  const localizedDeptNames = {
    'Dental Surgery': lang === 'fa' ? 'دیپارتمنت جراحی دهان و دندان' : lang === 'ps' ? 'د خولې او غاښونو د جراحي څانګه' : 'Dental Surgery',
    'Orthodontics & Prosthodontics': lang === 'fa' ? 'دیپارتمنت ارتودنسی و پروتز دهان' : lang === 'ps' ? 'د ارتوډونسي او پروتز څانګه' : 'Orthodontics & Prosthodontics',
    'Software Engineering': lang === 'fa' ? 'دیپارتمنت مهندسی نرم‌افزار (سافت‌ویر)' : lang === 'ps' ? 'د سافټویر انجینرۍ څانګه' : 'Software Engineering',
    'Database & Info Systems': lang === 'fa' ? 'دیپارتمنت پایگاه داده و سیستم‌های معلوماتی' : lang === 'ps' ? 'د ډیټابیس او معلوماتي سیسټمونو څانګه' : 'Database & Info Systems',
    'Public & International Law': lang === 'fa' ? 'دیپارتمنت حقوق عامه و بین‌الملل' : lang === 'ps' ? 'د عامه او بین المللي حقوقو څانګه' : 'Public & International Law',
    'Private Law & Judiciary': lang === 'fa' ? 'دیپارتمنت حقوق خصوصی و قضا' : lang === 'ps' ? 'د خصوصي حقوقو او قضا څانګه' : 'Private Law & Judiciary',
    'Business Administration': lang === 'fa' ? 'دیپارتمنت اداره و مدیریت تجارت (BBA)' : lang === 'ps' ? 'د سوداګرۍ د ادارې او مدیریت څانګه' : 'Business Administration',
    'Finance & Accounting': lang === 'fa' ? 'دیپارتمنت مالی، بانکداری و محاسبات' : lang === 'ps' ? 'د مالي او محاسباتي چارو څانګه' : 'Finance & Accounting',
  };

  useEffect(() => {
    async function loadExistingApplication() {
      try {
        setFetching(true);
        const app = await apiService.student.getStatus();
        if (app) {
          setFullName(app.fullName || '');
          setFatherName(app.fatherName || '');
          setPhone(app.phone || '');
          setFaculty(app.faculty || 'Computer Science');
          setDepartment(app.department || 'Software Engineering');
          setAdmissionYear(app.admissionYear || '2026');
          setAddress(app.address || '');
          setPhoto(app.photo || '');
          setTazkira(app.tazkira || '');
          setCertificate(app.certificate || '');
        }
      } catch (err) {
        // Safe to ignore if doesn't exist yet
      } finally {
        setFetching(false);
      }
    }
    loadExistingApplication();
  }, [apiService]);

  const handleFacultyChange = (newFaculty) => {
    setFaculty(newFaculty);
    const availableDeps = facultyDepartments[newFaculty] || [];
    setDepartment(availableDeps[0] || '');
  };

  const handleFileUpload = (e, type) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result;
      if (type === 'photo') setPhoto(base64String);
      else if (type === 'tazkira') setTazkira(base64String);
      else setCertificate(base64String);
    };
    reader.readAsDataURL(file);
  };

  const handleUrlFill = (type, textValue) => {
    if (type === 'photo') setPhoto(textValue);
    else if (type === 'tazkira') setTazkira(textValue);
    else setCertificate(textValue);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!fullName || !fatherName || !phone || !address || !faculty || !department || !admissionYear) {
      setError(
        lang === 'fa' 
          ? 'لطفاً تمام فیلدهای متنی ستاره‌دار را پر کنید.' 
          : lang === 'ps' 
          ? 'مهرباني وکړئ د ستوري لرونکي ټول متن ساحې ډکې کړئ.' 
          : 'Please fully fill out all mandatory textual profile parameters.'
      );
      return;
    }

    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      await apiService.student.submitForm({
        fullName,
        fatherName,
        phone,
        faculty,
        department,
        admissionYear,
        address,
        photo,
        tazkira,
        certificate,
      });
      setSuccess(
        lang === 'fa' 
          ? 'فورم شمولیت دانشگاه شما با موفقیت ثبت گردید! در حال هماهنگ‌سازی با داشبورد...' 
          : lang === 'ps'
          ? 'ستاسو د پوهنتون د نوم لیکنې فورمه په بریالیتوب سره ثبت شوه! د ډشبورډ سره همغږي کیږي...'
          : 'Your university enrollment record was submitted successfully! Redirecting...'
      );
      setTimeout(() => {
        onNavigate('/student/dashboard');
      }, 1500);
    } catch (err) {
      setError(err.message || 'Workflow register transaction failure.');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="p-8 text-center text-slate-500 font-medium flex items-center justify-center gap-2">
        <RefreshCw className="w-4 h-4 animate-spin text-indigo-600" />
        <span>{lang === 'fa' ? 'در حال بازیابی مشخصات دوسیه ثبت شده...' : lang === 'ps' ? 'د ثبت شوې دوسیې د معلوماتو د ترلاسه کولو په حال کې...' : 'Loading existing registration form profile...'}</span>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="glass-panel rounded-2xl p-6 md:p-8 space-y-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-zinc-50 tracking-tight">{t('formTitle')}</h2>
          <p className="text-slate-500 dark:text-slate-400 text-xs mt-1">
            {t('formSub')}
          </p>
        </div>

        {error && (
          <div className="bg-rose-50 border border-rose-200 p-4 rounded-xl text-rose-700 font-semibold text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="bg-teal-50 border border-teal-200 p-4 rounded-xl text-teal-800 font-semibold text-xs flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{success}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Section 1: Personal Family details */}
          <div className="space-y-4 border-b border-slate-100 dark:border-slate-800/40 pb-6">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 select-none flex items-center gap-1.5">
              <User className="w-3.5 h-3.5" /> {lang === 'fa' ? '۱. معلومات هویت شخصی و فامیلی' : lang === 'ps' ? '۱. شخصي او کورنۍ هویت معلومات' : '1. Personal & Family Profile'}
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">{t('fullName')} *</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Salim Noori"
                  className="w-full px-3.5 py-2.5 bg-slate-50/50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80 rounded-xl text-slate-950 dark:text-zinc-100 text-xs focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">{t('fatherName')} *</label>
                <input
                  type="text"
                  required
                  value={fatherName}
                  onChange={(e) => setFatherName(e.target.value)}
                  placeholder="e.g. Mohammad Noori"
                  className="w-full px-3.5 py-2.5 bg-slate-50/50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80 rounded-xl text-slate-950 dark:text-zinc-100 text-xs focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">{t('phone')} *</label>
                <div className="relative">
                  <Phone className={`absolute ${lang === 'fa' || lang === 'ps' ? 'right-3' : 'left-3'} top-3 text-slate-400 dark:text-slate-500 w-3.5 h-3.5`} />
                  <input
                     type="tel"
                     required
                     value={phone}
                     onChange={(e) => setPhone(e.target.value)}
                     placeholder="e.g. +93 78 123 4567"
                     className={`w-full ${lang === 'fa' || lang === 'ps' ? 'pr-9 pl-3.5' : 'pl-9 pr-3.5'} py-2.5 bg-slate-50/50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80 rounded-xl text-slate-950 dark:text-zinc-100 text-xs focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors`}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">{t('address')} *</label>
                <div className="relative">
                  <MapPin className={`absolute ${lang === 'fa' || lang === 'ps' ? 'right-3' : 'left-3'} top-3 text-slate-400 dark:text-slate-500 w-3.5 h-3.5`} />
                  <input
                    type="text"
                    required
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="e.g. Karte Seh, District 6, Kabul"
                    className={`w-full ${lang === 'fa' || lang === 'ps' ? 'pr-9 pl-3.5' : 'pl-9 pr-3.5'} py-2.5 bg-slate-50/50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80 rounded-xl text-slate-950 dark:text-zinc-100 text-xs focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors`}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Faculty streams list */}
          <div className="space-y-4 border-b border-slate-100 dark:border-slate-800/40 pb-6">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 select-none flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5" /> {lang === 'fa' ? '۲. تعیین رشته و دانشکده مورد نظر' : lang === 'ps' ? '۲. د غوښتل شوې پوهنځي او څانګې ټاکل' : '2. Desired Stream Allocation'}
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">{t('faculty')} *</label>
                <select
                  value={faculty}
                  onChange={(e) => handleFacultyChange(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-800/80 rounded-xl text-slate-950 dark:text-slate-100 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 cursor-pointer transition-colors"
                >
                  {Object.keys(facultyDepartments).map((fac) => (
                    <option key={fac} value={fac} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">
                      {localizedFacultyNames[fac] || fac}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">{t('department')} *</label>
                <select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-800/80 rounded-xl text-slate-950 dark:text-slate-100 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 cursor-pointer transition-colors"
                >
                  {(facultyDepartments[faculty] || []).map((dep) => (
                    <option key={dep} value={dep} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">
                      {localizedDeptNames[dep] || dep}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1 sm:col-span-2 lg:col-span-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">{t('admissionYear')} *</label>
                <select
                  value={admissionYear}
                  onChange={(e) => setAdmissionYear(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-800/80 rounded-xl text-slate-950 dark:text-slate-100 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 cursor-pointer transition-colors"
                >
                  <option value="2025" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">{lang === 'fa' ? '۱۴۰۴ (بهاری / خزانی)' : lang === 'ps' ? '۱۴۰۴ (بهارنی / منی تحصیلي دوره)' : '2025 (Spring / Fall)'}</option>
                  <option value="2026" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">{lang === 'fa' ? '۱۴۰۵ (ورودی جدید)' : lang === 'ps' ? '۱۴۰۵ (نوی راغلی سمستر)' : '2026 (Incoming Batch)'}</option>
                  <option value="2027" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">{lang === 'fa' ? '۱۴۰۶ (تاخیری مکتوب)' : lang === 'ps' ? '۱۴۰۶ (وروسته شوی مکتوب)' : '2027 (Deferred Batch)'}</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 3: Document Upload blocks */}
          <div className="space-y-6">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 select-none flex items-center gap-1.5 font-sans">
              <Landmark className="w-3.5 h-3.5" /> {lang === 'fa' ? '۳. مدارک تایید هویت و فراغت' : lang === 'ps' ? '۳. د هویت او فراغت د تایید اسناد' : '3. VERIFICATION DOCUMENTS'}
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Photo Upload Card */}
              <div className="glass-panel rounded-2xl p-4 shadow-sm flex flex-col justify-between space-y-4">
                <div>
                  <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">{t('photoLabel')}</h4>
                  <p className="text-[10px] text-slate-400 dark:text-slate-400/80 leading-normal">
                    {lang === 'fa' 
                      ? 'عکس پرسونلی با زمینه سفید و وضوح کاملاً واضح.' 
                      : lang === 'ps'
                      ? 'د سپین شالید سره شخصي عکس چې په بشپړ ډول روښانه وي.'
                      : 'Plain light background photo for student registry badges.'}
                  </p>
                </div>

                <div className="space-y-3">
                  {photo ? (
                    <div className="relative group border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden h-24 bg-white dark:bg-slate-900/60 flex items-center justify-center">
                      <img
                        src={photo.startsWith('data:') || photo.startsWith('http') ? photo : 'https://placehold.co/120'}
                        alt="Preview"
                        className="h-24 object-contain"
                      />
                      <button
                        type="button"
                        onClick={() => setPhoto('')}
                        className="absolute right-1 top-1 bg-rose-600 text-white p-1 rounded text-[9px] font-bold block cursor-pointer hover:bg-rose-500 shadow leading-none"
                      >
                        {lang === 'fa' || lang === 'ps' ? 'حذف' : 'Delete'}
                      </button>
                    </div>
                  ) : (
                    <div className="border-2 border-dashed border-slate-200 dark:border-slate-700/80 rounded-xl p-4 text-center hover:bg-slate-50 dark:hover:bg-slate-800/15 transition-colors relative cursor-pointer group">
                      <Upload className="w-5 h-5 text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors mx-auto mb-1.5" />
                      <span className="text-[11px] font-bold text-slate-600 dark:text-slate-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors block">
                        {lang === 'fa' ? 'آپلود فایل عکس' : lang === 'ps' ? 'د عکس اسناد پورته کول' : 'Upload Photo'}
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileUpload(e, 'photo')}
                        className="absolute inset-0 opacity-0 cursor-pointer"
                      />
                    </div>
                  )}

                  <div className="space-y-1">
                    <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 block uppercase select-none">{lang === 'fa' ? 'یا درج لینک آدرس عکس:' : lang === 'ps' ? 'یا د عکس ادرس لینک ولیکئ:' : 'Or Paste Web URL link:'}</span>
                    <input
                      type="text"
                      placeholder="e.g. Photo link or detail descriptor"
                      value={photo.startsWith('data:') ? 'Base64 Scanned Image Buffer' : photo}
                      onChange={(e) => handleUrlFill('photo', e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-lg text-[10px] text-slate-700 dark:text-zinc-200 placeholder-slate-400 dark:placeholder-slate-600 font-semibold focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                    />
                  </div>
                </div>
              </div>

              {/* Tazkira Upload Card */}
              <div className="glass-panel rounded-2xl p-4 shadow-sm flex flex-col justify-between space-y-4">
                <div>
                  <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">{t('tazkiraLabel')}</h4>
                  <p className="text-[10px] text-slate-400 dark:text-slate-400/80 leading-normal">
                    {lang === 'fa' 
                      ? 'اسکن باکیفیت هر دو طرف تذکره الکترونیکی یا کاغذی.' 
                      : lang === 'ps'
                      ? 'د کاغذي یا برېښنایي تذکرې د دواړو خواوو روښانه سکین.'
                      : 'Scanned image or visual text of Tazkira registration.'}
                  </p>
                </div>

                <div className="space-y-3">
                  {tazkira ? (
                    <div className="relative group border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden h-24 bg-white dark:bg-slate-900/60 flex items-center justify-center">
                      {tazkira.startsWith('data:') ? (
                        <div className="text-center p-2 text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                          <FileText className="w-6 h-6 text-indigo-500 mx-auto mb-0.5" />
                          Base64 Image Uploaded
                        </div>
                      ) : (
                        <div className="text-center p-3 text-[11px] text-indigo-700 dark:text-indigo-300 font-semibold bg-indigo-50 dark:bg-indigo-950/30 w-full h-full flex items-center justify-center">
                          {tazkira}
                        </div>
                      )}
                      <button
                        type="button"
                        onClick={() => setTazkira('')}
                        className="absolute right-1 top-1 bg-rose-600 text-white p-1 rounded text-[9px] font-bold block cursor-pointer hover:bg-rose-500 shadow leading-none"
                      >
                        {lang === 'fa' || lang === 'ps' ? 'حذف' : 'Delete'}
                      </button>
                    </div>
                  ) : (
                    <div className="border-2 border-dashed border-slate-200 dark:border-slate-700/80 rounded-xl p-4 text-center hover:bg-slate-50 dark:hover:bg-slate-800/15 transition-colors relative cursor-pointer group">
                      <Upload className="w-5 h-5 text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors mx-auto mb-1.5" />
                      <span className="text-[11px] font-bold text-slate-600 dark:text-slate-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors block">
                        {lang === 'fa' ? 'آپلود اسکن تذکره' : lang === 'ps' ? 'د تذکرې سکین پورته کړئ' : 'Upload Tazkira'}
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileUpload(e, 'tazkira')}
                        className="absolute inset-0 opacity-0 cursor-pointer"
                      />
                    </div>
                  )}

                  <div className="space-y-1">
                    <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 block uppercase select-none">{lang === 'fa' ? 'یا درج شماره جلد و صفحه:' : lang === 'ps' ? 'یا د کتاب د ټوک او پاڼې شمیره ولیکئ:' : 'Or Paste details:'}</span>
                    <input
                      type="text"
                      placeholder="e.g. Page No 89, Volume IV, Kabul"
                      value={tazkira.startsWith('data:') ? 'Base64 Scanned Image Buffer' : tazkira}
                      onChange={(e) => handleUrlFill('tazkira', e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-lg text-[10px] text-slate-700 dark:text-zinc-200 placeholder-slate-400 dark:placeholder-slate-600 font-semibold focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                    />
                  </div>
                </div>
              </div>

              {/* Diploma Upload Card */}
              <div className="glass-panel rounded-2xl p-4 shadow-sm flex flex-col justify-between space-y-4 sm:col-span-2 lg:col-span-1">
                <div>
                  <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">{t('certLabel')}</h4>
                  <p className="text-[10px] text-slate-400 dark:text-slate-400/80 leading-normal">
                    {lang === 'fa' 
                      ? 'اسکن رسمی شهادتنامه یا نمرات سه ساله مکتب.' 
                      : lang === 'ps'
                      ? 'د ښوونځي د شهادتنامې یا د ۳ کلن نمرو رسمي کتنې پاڼه.'
                      : '12th-grade official graduation statement verification.'}
                  </p>
                </div>

                <div className="space-y-3">
                  {certificate ? (
                    <div className="relative group border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden h-24 bg-white dark:bg-slate-900/60 flex items-center justify-center">
                      {certificate.startsWith('data:') ? (
                        <div className="text-center p-2 text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                          <FileText className="w-6 h-6 text-indigo-500 mx-auto mb-0.5" />
                          Base64 Image Uploaded
                        </div>
                      ) : (
                        <div className="text-center p-3 text-[11px] text-indigo-700 dark:text-indigo-300 font-semibold bg-indigo-50 dark:bg-indigo-950/30 w-full h-full flex items-center justify-center">
                          {certificate}
                        </div>
                      )}
                      <button
                        type="button"
                        onClick={() => setCertificate('')}
                        className="absolute right-1 top-1 bg-rose-600 text-white p-1 rounded text-[9px] font-bold block cursor-pointer hover:bg-rose-500 shadow leading-none"
                      >
                        {lang === 'fa' || lang === 'ps' ? 'حذف' : 'Delete'}
                      </button>
                    </div>
                  ) : (
                    <div className="border-2 border-dashed border-slate-200 dark:border-slate-700/80 rounded-xl p-4 text-center hover:bg-slate-50 dark:hover:bg-slate-800/15 transition-colors relative cursor-pointer group">
                      <Upload className="w-5 h-5 text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors mx-auto mb-1.5" />
                      <span className="text-[11px] font-bold text-slate-600 dark:text-slate-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors block">
                        {lang === 'fa' ? 'آپلود شهادتنامه مکتب' : lang === 'ps' ? 'د ښوونځي د شهادتنامې اسناد' : 'Upload Diploma'}
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileUpload(e, 'certificate')}
                        className="absolute inset-0 opacity-0 cursor-pointer"
                      />
                    </div>
                  )}

                  <div className="space-y-1">
                    <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 block uppercase select-none">{lang === 'fa' ? 'یا شماره مکتوب شهادتنامه:' : lang === 'ps' ? 'یا د شهادتنامې د مکتوب شمیره:' : 'Or Paste transcript detail:'}</span>
                    <input
                      type="text"
                      placeholder="e.g. Roll No #298319, Kabul Lycee"
                      value={certificate.startsWith('data:') ? 'Base64 Scanned Image Buffer' : certificate}
                      onChange={(e) => handleUrlFill('certificate', e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-lg text-[10px] text-slate-700 dark:text-zinc-200 placeholder-slate-400 dark:placeholder-slate-600 font-semibold focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Form Actions Footer */}
          <div className="flex items-center justify-end gap-3 pt-6 border-t border-slate-100">
            <button
              type="button"
              onClick={() => onNavigate('/student/dashboard')}
              className="px-4 py-2.5 text-xs font-bold text-slate-600 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl cursor-pointer"
            >
              {lang === 'fa' ? 'لغو و خروج' : lang === 'ps' ? 'لغوه او بیرته تګ' : 'Cancel & Return'}
            </button>
            <button
              type="submit"
              disabled={loading}
              className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-350 text-white px-6 py-2.5 text-xs font-bold rounded-xl leading-none transition-all active:scale-95 cursor-pointer flex items-center gap-1.5 hover:shadow-lg hover:shadow-indigo-600/10"
            >
              <FileDown className="w-4 h-4" />
              {loading ? (lang === 'fa' ? 'در حال ارسال اسناد...' : lang === 'ps' ? 'د معلوماتو د استولو په حال کې...' : 'Submitting details...') : t('submitForm')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
