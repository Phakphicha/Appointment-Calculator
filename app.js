function initEasyMedCal() {
    // -------------------------------------------------------------
    // Initialization & Theme Handling
    // -------------------------------------------------------------
    const themeToggle = document.getElementById('themeToggle');
    const htmlElement = document.documentElement;
    
    // Check local storage for theme, otherwise default to light
    try {
        if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
            htmlElement.classList.add('dark');
        } else {
            htmlElement.classList.remove('dark');
        }
    } catch (e) {
        htmlElement.classList.remove('dark');
    }

    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            if (htmlElement.classList.contains('dark')) {
                htmlElement.classList.remove('dark');
                try { localStorage.theme = 'light'; } catch (e) {}
            } else {
                htmlElement.classList.add('dark');
                try { localStorage.theme = 'dark'; } catch (e) {}
            }
        });
    }

    // -------------------------------------------------------------
    //Translations & i18n Engine
    // -------------------------------------------------------------
    // Translations are defined in js/i18n.js (loaded before app.js)
    const translations = window.EMC_TRANSLATIONS || { TH: {}, EN: {} };

    try {
        window.currentLang = localStorage.getItem('lang') || 'TH';
    } catch (e) {
        window.currentLang = 'TH';
    }

    function setLanguage(lang) {
        window.currentLang = lang;
        try { localStorage.setItem('lang', lang); } catch (e) {}

        document.querySelectorAll('.btnLangTH').forEach(btn => {
            btn.className = lang === 'TH'
                ? "btnLangTH px-3 py-1.5 rounded-full text-xs font-bold transition bg-[#24917d] text-white"
                : "btnLangTH px-3 py-1.5 rounded-full text-xs font-bold transition text-white/70 hover:text-white";
        });
        document.querySelectorAll('.btnLangEN').forEach(btn => {
            btn.className = lang === 'EN'
                ? "btnLangEN px-3 py-1.5 rounded-full text-xs font-bold transition bg-[#24917d] text-white"
                : "btnLangEN px-3 py-1.5 rounded-full text-xs font-bold transition text-white/70 hover:text-white";
        });

        document.documentElement.lang = lang === 'EN' ? 'en' : 'th';
        document.title = translations[lang].title_main;

        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            if (translations[lang][key] !== undefined) {
                el.innerHTML = translations[lang][key];
            }
        });

        document.querySelectorAll('[data-i18n-ph]').forEach(el => {
            const key = el.getAttribute('data-i18n-ph');
            if (translations[lang][key] !== undefined) {
                el.placeholder = translations[lang][key];
            }
        });
        document.querySelectorAll('input[placeholder="พ.ศ."], input[data-i18n-ph="ph_year"]').forEach(inp => {
            inp.placeholder = lang === 'EN' ? 'C.E. / B.E.' : 'พ.ศ.';
        });
        document.querySelectorAll('input[placeholder="วัน"], input[data-i18n-ph="ph_day"]').forEach(inp => {
            inp.placeholder = lang === 'EN' ? 'Day' : 'วัน';
        });

        const monthNames = lang === 'EN' 
            ? ['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
            : ['', 'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
        const monthSelectIds = ['diffStartMonth', 'diffMonth', 'medDailyStartMonth', 'medDailyEndMonth', 'medWeeklyStartMonth', 'medWeeklyEndMonth', 'ageMonth', 'vaccineMonth', 'tblBaseMonth', 'contraMonth'];
        monthSelectIds.forEach(id => {
            const sel = document.getElementById(id);
            if (sel) {
                Array.from(sel.options).forEach(opt => {
                    if (opt.value === "") {
                        opt.textContent = lang === 'EN' ? 'Month' : 'เดือน';
                    } else {
                        const idx = parseInt(opt.value);
                        if (idx >= 1 && idx <= 12) opt.textContent = monthNames[idx];
                    }
                });
            }
        });

        const dailyDoseMapEN = { "": "-- Select Dosage --", "0.25": "1/4 pill", "0.5": "1/2 pill", "1": "1 pill", "1.5": "1.5 pills", "2": "2 pills", "2.5": "2.5 pills", "custom": "Custom..." };
        const dailyDoseMapTH = { "": "--เลือกขนาดยา--", "0.25": "1/4 เม็ด", "0.5": "1/2 เม็ด", "1": "1 เม็ด", "1.5": "1.5 เม็ด", "2": "2 เม็ด", "2.5": "2.5 เม็ด", "custom": "กำหนดเอง..." };
        ['medDoseDropdown', 'tblDoseDropdown', 'tblCustomDaysDoseDropdown'].forEach(id => {
            const sel = document.getElementById(id);
            if (sel) {
                const map = lang === 'EN' ? dailyDoseMapEN : dailyDoseMapTH;
                Array.from(sel.options).forEach(opt => { if (map[opt.value]) opt.textContent = map[opt.value]; });
            }
        });

        const weeklyDoseMapEN = { "": "-- Select Dosage --", "1": "1 pill / wk", "2": "2 pills / wk", "3": "3 pills / wk", "4": "4 pills / wk", "5": "5 pills / wk", "6": "6 pills / wk", "7": "7 pills / wk", "8": "8 pills / wk", "custom": "Custom..." };
        const weeklyDoseMapTH = { "": "--เลือกจำนวนเม็ด--", "1": "1 เม็ด / สัปดาห์", "2": "2 เม็ด / สัปดาห์", "3": "3 เม็ด / สัปดาห์", "4": "4 เม็ด / สัปดาห์", "5": "5 เม็ด/สัปดาห์", "6": "6 เม็ด/สัปดาห์", "7": "7 เม็ด/สัปดาห์", "8": "8 เม็ด/สัปดาห์", "custom": "กำหนดเอง..." };
        ['medWeeklyDose', 'tblWeeklyDoseDropdown', 'tblCustomDaysWeeklyDoseDropdown'].forEach(id => {
            const sel = document.getElementById(id);
            if (sel) {
                const map = lang === 'EN' ? weeklyDoseMapEN : weeklyDoseMapTH;
                Array.from(sel.options).forEach(opt => { if (map[opt.value]) opt.textContent = map[opt.value]; });
            }
        });

        const vacTypeEN = { "": "-- Select Vaccine --", "HBV": "Hepatitis B (HBV)", "HPV": "HPV", "HAV": "Hepatitis A (HAV)", "VZV": "Varicella / Chickenpox (VZV)", "RZV": "Shingles / Zoster (RZV)", "MMR": "MMR", "DENGUE": "Dengue", "RABIES": "Rabies", "PNEUMO": "Pneumococcal (PCV20 / PCV15 / PPSV23)", "TDAP": "Tetanus-Diphtheria-Pertussis (Td / Tdap)" };
        const vacTypeTH = { "": "-- เลือกวัคซีน --", "HBV": "ไวรัสตับอักเสบบี (HBV)", "HPV": "เอชพีวี (HPV)", "HAV": "ไวรัสตับอักเสบเอ (HAV)", "VZV": "อีสุกอีใส (VZV)", "RZV": "งูสวัด (RZV)", "MMR": "หัด คางทูม หัดเยอรมัน (MMR)", "DENGUE": "ไข้เลือดออก (Dengue)", "RABIES": "โรคพิษสุนัขบ้า (Rabies)", "PNEUMO": "นิวโมค็อกคัส (PCV20 / PCV15 / PPSV23)", "TDAP": "คอตีบ-บาดทะยัก-ไอกรน (Td / Tdap)" };
        const vacSel = document.getElementById('vaccineType');
        if (vacSel) {
            const map = lang === 'EN' ? vacTypeEN : vacTypeTH;
            Array.from(vacSel.options).forEach(opt => { if (map[opt.value]) opt.textContent = map[opt.value]; });
        }

        const ageUnitSel = document.getElementById('oselAgeUnit');
        if (ageUnitSel) {
            Array.from(ageUnitSel.options).forEach(opt => {
                if (opt.value === 'months') opt.textContent = lang === 'EN' ? 'months' : 'เดือน';
                if (opt.value === 'years') opt.textContent = lang === 'EN' ? 'years' : 'ปี';
            });
        }

        const dialSel = document.getElementById('renalDialysis');
        if (dialSel) {
            const dialMap = lang === 'EN' 
                ? { "none": "Not on Dialysis", "hd": "Hemodialysis", "capd": "CAPD", "esrd": "ESRD not on dialysis" }
                : { "none": "Not on Dialysis (ไม่ได้ฟอกไต)", "hd": "Hemodialysis (ฟอกเลือด)", "capd": "CAPD (ล้างไตทางช่องท้อง)", "esrd": "ESRD not on dialysis" };
            Array.from(dialSel.options).forEach(opt => { if (dialMap[opt.value]) opt.textContent = dialMap[opt.value]; });
        }

        document.querySelectorAll('[data-i18n-manual]').forEach(el => {
            const idx = el.getAttribute('data-i18n-manual');
            const mKey = 'manual_' + idx;
            if (translations[lang][mKey]) el.innerHTML = translations[lang][mKey];
        });

        const yearInputIds = ['diffStartYear', 'diffYear', 'medDailyStartYear', 'medDailyEndYear', 'medWeeklyStartYear', 'medWeeklyEndYear', 'ageYear', 'vaccineYear', 'tblBaseYear', 'contraYear'];
        yearInputIds.forEach(id => {
            const inp = document.getElementById(id);
            if (inp && inp.value && !isNaN(parseInt(inp.value))) {
                const val = parseInt(inp.value);
                if (lang === 'EN' && val > 2400) {
                    inp.value = val - 543;
                } else if (lang === 'TH' && val > 0 && val <= 2400) {
                    inp.value = val + 543;
                }
            }
        });

        const currentYearDisplay = lang === 'EN' ? new Date().getFullYear() : (new Date().getFullYear() + 543);
        const yearSpan = document.getElementById('currentYearBE');
        if (yearSpan) yearSpan.textContent = currentYearDisplay;

        if (typeof populateVaccineDoses === 'function') populateVaccineDoses();

        if (typeof calculateDateDiff === 'function') calculateDateDiff();
        if (typeof calculateMedDaysFromDates === 'function') calculateMedDaysFromDates();
        if (typeof calculateWeeklyMedication === 'function') calculateWeeklyMedication();
        if (typeof calculateApptDays === 'function') calculateApptDays();
        if (typeof calculateApptWeeks === 'function') calculateApptWeeks();
        if (typeof calculateAge === 'function') calculateAge();
        if (typeof calculateVaccine === 'function') calculateVaccine();
        if (typeof generateTable === 'function') generateTable();
        if (typeof calculateTblCustom === 'function') calculateTblCustom();
        if (typeof calculateOseltamivir === 'function') calculateOseltamivir();
        if (typeof calculateRenalOseltamivir === 'function') calculateRenalOseltamivir();
        if (typeof calculateContraceptive === 'function') calculateContraceptive();
        if (typeof renderQuickGlanceWidget === 'function') renderQuickGlanceWidget();
        if (typeof updatePresetLabels === 'function') updatePresetLabels();
    }

    // Set current year in Footer on startup
    const currentYearBE = window.currentLang === 'EN' ? new Date().getFullYear() : (new Date().getFullYear() + 543);
    const yearSpan = document.getElementById('currentYearBE');
    if (yearSpan) yearSpan.textContent = currentYearBE;

    // -------------------------------------------------------------
    // Utilities
    // -------------------------------------------------------------
    
    // Pure calculation helpers live in js/core.js (window.EMCCore) so they can be unit-tested.
    const {
        toCEYear,       // convert B.E. (>2400) or C.E. year to C.E.
        getToday,       // today's date at midnight
        parseDateStr,   // parse YYYY-MM-DD from native date picker (local time)
        toISODate,      // Date -> YYYY-MM-DD for native input[type=date]
        daysBetween,
        calcAge,
        ceilPills,
        dispensedPillsPerDay,
        calcTotalPills,
        countWeekdayOccurrences,
        getThaiHolidayInfo,
        findNearestWorkingDay,
        calcOseltamivirDose,
        cockcroftGault,
        ckdEpi2021,
        getCkdStage,
        renalOseltamivirRecommendation,
        calcContraceptiveNextDate
    } = window.EMCCore;

    // Format Date to Thai/EN string (e.g. วันจันทร์ที่ 15 มีนาคม 2569 or Monday, March 15, 2026)
    function formatThaiDate(date) {
        if (!date || isNaN(date)) return '-';
        if (window.currentLang === 'EN') {
            return new Intl.DateTimeFormat('en-US', { 
                weekday: 'long',
                day: 'numeric', 
                month: 'long', 
                year: 'numeric' 
            }).format(date);
        }
        return new Intl.DateTimeFormat('th-TH', { 
            weekday: 'long',
            day: 'numeric', 
            month: 'long', 
            year: 'numeric' 
        }).format(date);
    }

    // Format Date to short Thai/EN string (e.g. 15 มี.ค. 69 or Mar 15, 2026)
    function formatThaiDateShort(date) {
        if (!date || isNaN(date)) return '-';
        if (window.currentLang === 'EN') {
            return new Intl.DateTimeFormat('en-US', { 
                day: 'numeric', 
                month: 'short', 
                year: 'numeric' 
            }).format(date);
        }
        return new Intl.DateTimeFormat('th-TH', { 
            day: 'numeric', 
            month: 'short', 
            year: '2-digit' 
        }).format(date);
    }

    // Format Date to short Thai/EN string with day (e.g. วันพุธที่ 15 ก.ค. 69 or Wed, Jul 15, 2026)
    function formatThaiDateShortWithDay(date) {
        if (!date || isNaN(date)) return '-';
        if (window.currentLang === 'EN') {
            const dayName = new Intl.DateTimeFormat('en-US', { weekday: 'short' }).format(date);
            const shortDate = new Intl.DateTimeFormat('en-US', { day: 'numeric', month: 'short', year: 'numeric' }).format(date);
            return `${dayName}, ${shortDate}`;
        }
        const dayName = new Intl.DateTimeFormat('th-TH', { weekday: 'long' }).format(date);
        const shortDate = new Intl.DateTimeFormat('th-TH', { day: 'numeric', month: 'short', year: '2-digit' }).format(date);
        return `${dayName}ที่ ${shortDate}`;
    }

    // Render vaccine dose in 2-line mobile-friendly layout
    function renderVaccineDose(label, dateStr) {
        return `<div class="flex flex-col mb-3 w-full border-b border-[#24917d]/20 pb-2 last:border-0 last:pb-0 last:mb-0">
            <div class="text-left text-sm md:text-base font-medium text-textdark">- ${label} :</div>
            <div class="text-center mt-1 text-base md:text-lg font-bold text-textdark">${dateStr}</div>
        </div>`;
    }

    // Helper to sync native date picker -> 3 fields
    function syncDateToFields(dateObj, dayInput, monthInput, yearInput) {
        if (dateObj && !isNaN(dateObj)) {
            dayInput.value = dateObj.getDate();
            monthInput.value = dateObj.getMonth() + 1;
            yearInput.value = window.currentLang === 'EN' ? dateObj.getFullYear() : (dateObj.getFullYear() + 543);
        }
    }

    // -------------------------------------------------------------
    // 1. Date Difference Calculator
    // -------------------------------------------------------------
    const diffDayInput = document.getElementById('diffDay');
    const diffMonthInput = document.getElementById('diffMonth');
    const diffYearInput = document.getElementById('diffYear');
    const diffStartDatePicker = document.getElementById('diffStartDatePicker');
    const diffStartDayInput = document.getElementById('diffStartDay');
    const diffStartMonthInput = document.getElementById('diffStartMonth');
    const diffStartYearInput = document.getElementById('diffStartYear');
    
    const diffDatePicker = document.getElementById('diffDatePicker');
    const dateDiffResult = document.getElementById('dateDiffResult');
    const medDaysInput = document.getElementById('medDays');
    const diffWeekendWarning = document.getElementById('diffWeekendWarning');
    const diffWeekendText = document.getElementById('diffWeekendText');
    const btnDiffToFri = document.getElementById('btnDiffToFri');
    const btnDiffToMon = document.getElementById('btnDiffToMon');
    
    // Initialize with today's date
    const todayDiff = getToday();
    if (diffStartDayInput) {
        syncDateToFields(todayDiff, diffStartDayInput, diffStartMonthInput, diffStartYearInput);
        if (diffStartDatePicker) diffStartDatePicker.value = toISODate(todayDiff);
    }

    function calculateDateDiff() {
        const sd = diffStartDayInput ? parseInt(diffStartDayInput.value) : NaN;
        const sm = diffStartMonthInput ? parseInt(diffStartMonthInput.value) : NaN;
        const syBE = diffStartYearInput ? parseInt(diffStartYearInput.value) : NaN;
        
        const d = parseInt(diffDayInput.value);
        const m = parseInt(diffMonthInput.value);
        const yBE = parseInt(diffYearInput.value);

        if (!isNaN(d) && !isNaN(m) && !isNaN(yBE)) {
            const startDate = (!isNaN(sd) && !isNaN(sm) && !isNaN(syBE)) ? new Date(toCEYear(syBE), sm - 1, sd) : getToday();
            const targetDate = new Date(toCEYear(yBE), m - 1, d);
            
            // Sync to the hidden date picker
            if (diffStartDatePicker) diffStartDatePicker.value = toISODate(startDate);
            diffDatePicker.value = toISODate(targetDate);
            
            const diffDays = Math.abs(daysBetween(startDate, targetDate));
            dateDiffResult.textContent = `${diffDays} ${window.currentLang === 'EN' ? 'Days' : 'วัน'}`;
            
            if (typeof checkWeekendAndWarn === 'function') {
                checkWeekendAndWarn(targetDate, diffWeekendWarning, diffWeekendText, btnDiffToFri, btnDiffToMon, (shiftDays) => {
                    const shifted = new Date(targetDate);
                    shifted.setDate(shifted.getDate() + shiftDays);
                    syncDateToFields(shifted, diffDayInput, diffMonthInput, diffYearInput);
                    calculateDateDiff();
                });
            }

            // Auto-fill Med Days
            medDaysInput.value = diffDays;
            medDaysInput.dispatchEvent(new Event('input'));
            
            // Auto-fill Weekly Medication End Date & Start Date
            const wPicker = document.getElementById('medWeeklyEndPicker');
            const wsPicker = document.getElementById('medWeeklyStartPicker');
            if (wPicker) {
                wPicker.value = toISODate(targetDate);
                wPicker.dispatchEvent(new Event('change'));
            }
            if (wsPicker) {
                wsPicker.value = toISODate(startDate);
                wsPicker.dispatchEvent(new Event('change'));
            }
            
            // Auto-fill Daily Medication End Date & Start Date
            const dPicker = document.getElementById('medDailyEndPicker');
            const dsPicker = document.getElementById('medDailyStartPicker');
            if (dPicker) {
                dPicker.value = toISODate(targetDate);
                dPicker.dispatchEvent(new Event('change'));
            }
            if (dsPicker) {
                dsPicker.value = toISODate(startDate);
                dsPicker.dispatchEvent(new Event('change'));
            }
        } else {
            dateDiffResult.textContent = `- ${window.currentLang === 'EN' ? 'Days' : 'วัน'}`;
            diffDatePicker.value = '';
            if (diffWeekendWarning) diffWeekendWarning.classList.add('hidden');
        }
    }

    diffDayInput.addEventListener('input', calculateDateDiff);
    diffMonthInput.addEventListener('change', calculateDateDiff);
    diffYearInput.addEventListener('input', calculateDateDiff);
    
    if (diffStartDayInput) {
        [diffStartDayInput, diffStartMonthInput, diffStartYearInput].forEach(el => {
            el.addEventListener('input', calculateDateDiff);
            el.addEventListener('change', calculateDateDiff);
        });
        if (diffStartDatePicker) {
            diffStartDatePicker.addEventListener('change', (e) => {
                const d = parseDateStr(e.target.value);
                syncDateToFields(d, diffStartDayInput, diffStartMonthInput, diffStartYearInput);
                calculateDateDiff();
            });
        }
    }
    
    // Reverse sync: Date Picker -> Fields
    diffDatePicker.addEventListener('change', (e) => {
        const d = parseDateStr(e.target.value);
        syncDateToFields(d, diffDayInput, diffMonthInput, diffYearInput);
        calculateDateDiff();
    });

    // -------------------------------------------------------------
    // 2. Medication Calculator
    // -------------------------------------------------------------
    const medDailyStartDay = document.getElementById('medDailyStartDay');
    const medDailyStartMonth = document.getElementById('medDailyStartMonth');
    const medDailyStartYear = document.getElementById('medDailyStartYear');
    const medDailyStartPicker = document.getElementById('medDailyStartPicker');
    
    const medDailyEndDay = document.getElementById('medDailyEndDay');
    const medDailyEndMonth = document.getElementById('medDailyEndMonth');
    const medDailyEndYear = document.getElementById('medDailyEndYear');
    const medDailyEndPicker = document.getElementById('medDailyEndPicker');

    // Initialize daily start with today's date
    const todayDaily = getToday();
    if (medDailyStartDay) {
        syncDateToFields(todayDaily, medDailyStartDay, medDailyStartMonth, medDailyStartYear);
        if (medDailyStartPicker) medDailyStartPicker.value = toISODate(todayDaily);
    }

    function calculateMedDaysFromDates() {
        const sd = parseInt(medDailyStartDay.value);
        const sm = parseInt(medDailyStartMonth.value);
        const syBE = parseInt(medDailyStartYear.value);
        
        const ed = parseInt(medDailyEndDay.value);
        const em = parseInt(medDailyEndMonth.value);
        const eyBE = parseInt(medDailyEndYear.value);
        
        if (!isNaN(sd) && !isNaN(sm) && !isNaN(syBE) && !isNaN(ed) && !isNaN(em) && !isNaN(eyBE)) {
            const startDate = new Date(toCEYear(syBE), sm - 1, sd);
            const endDate = new Date(toCEYear(eyBE), em - 1, ed);
            
            if (medDailyStartPicker) medDailyStartPicker.value = toISODate(startDate);
            if (medDailyEndPicker) medDailyEndPicker.value = toISODate(endDate);
            
            const totalDays = daysBetween(startDate, endDate);
            if (totalDays >= 0) {
                medDaysInput.value = totalDays;
                medDaysInput.dispatchEvent(new Event('input'));
            }
        }
    }

    if (medDailyStartDay) {
        [medDailyStartDay, medDailyStartMonth, medDailyStartYear].forEach(el => {
            el.addEventListener('input', calculateMedDaysFromDates);
            el.addEventListener('change', calculateMedDaysFromDates);
        });
        [medDailyEndDay, medDailyEndMonth, medDailyEndYear].forEach(el => {
            el.addEventListener('input', calculateMedDaysFromDates);
            el.addEventListener('change', calculateMedDaysFromDates);
        });

        if (medDailyStartPicker) {
            medDailyStartPicker.addEventListener('change', (e) => {
                const d = parseDateStr(e.target.value);
                syncDateToFields(d, medDailyStartDay, medDailyStartMonth, medDailyStartYear);
                calculateMedDaysFromDates();
            });
        }

        if (medDailyEndPicker) {
            medDailyEndPicker.addEventListener('change', (e) => {
                const d = parseDateStr(e.target.value);
                syncDateToFields(d, medDailyEndDay, medDailyEndMonth, medDailyEndYear);
                calculateMedDaysFromDates();
            });
        }
    }

    const medDoseDropdown = document.getElementById('medDoseDropdown');
    const medDoseCustom = document.getElementById('medDoseCustom');
    const medResult = document.getElementById('medResult');

    function calculateMedication() {
        const days = parseFloat(medDaysInput.value);
        let dose = medDoseDropdown.value;

        if (dose === 'custom') {
            dose = parseFloat(medDoseCustom.value);
        } else {
            dose = parseFloat(dose);
        }

        const totalPills = calcTotalPills(days, dose);
        if (totalPills !== null) {
            const isEN = window.currentLang === 'EN';
            const unit = isEN ? 'pills' : 'เม็ด';
            const perDay = dispensedPillsPerDay(dose);
            if (perDay !== dose) {
                // Non-splittable dose (e.g. 1.1) was rounded up to whole tablets per day
                const note = isEN
                    ? `(Rounded up to ${perDay} pills/day — ${dose} pill cannot be split)`
                    : `(ปัดเป็น ${perDay} เม็ด/วัน เพราะแบ่งเม็ดยา ${dose} เม็ดไม่ได้)`;
                medResult.innerHTML = `${totalPills} ${unit}<br><span class="text-sm font-normal text-textdark/70">${note}</span>`;
            } else {
                medResult.textContent = `${totalPills} ${unit}`;
            }
        } else {
            medResult.textContent = `- ${window.currentLang === 'EN' ? 'pills' : 'เม็ด'}`;
        }
    }

    medDaysInput.addEventListener('input', calculateMedication);
    medDoseDropdown.addEventListener('change', (e) => {
        if (e.target.value === 'custom') {
            medDoseCustom.classList.remove('hidden');
        } else {
            medDoseCustom.classList.add('hidden');
        }
        calculateMedication();
    });
    medDoseCustom.addEventListener('input', calculateMedication);

    // -------------------------------------------------------------
    // Helper: Thai Public Holidays & Weekend Detection + Shift
    // -------------------------------------------------------------
    // Holiday data: js/data/thai-holidays.js | logic: getThaiHolidayInfo / findNearestWorkingDay in js/core.js

    function checkWeekendAndWarn(dateObj, warningEl, textEl, toFriBtn, toMonBtn, onShiftCallback) {
        if (!dateObj || isNaN(dateObj)) {
            if (warningEl) warningEl.classList.add('hidden');
            return;
        }
        const info = getThaiHolidayInfo(dateObj);
        const dayOfWeek = dateObj.getDay(); // 0 = Sunday, 6 = Saturday

        if (info.isNonWorking) {
            if (warningEl) warningEl.classList.remove('hidden');
            const isSat = dayOfWeek === 6;
            const lang = window.currentLang || 'TH';

            if (textEl) {
                if (info.isHoliday) {
                    const hName = lang === 'EN' ? info.nameEN : info.nameTH;
                    const prefix = translations[lang].holiday_prefix || (lang === 'EN' ? 'Public Holiday: ' : 'ตรงกับวันหยุดราชการ: ');
                    textEl.textContent = `${prefix}${hName}`;
                } else {
                    textEl.textContent = isSat 
                        ? (translations[lang].weekend_sat_warn || 'ตรงกับวันเสาร์ (วันหยุดตรวจ)') 
                        : (translations[lang].weekend_sun_warn || 'ตรงกับวันอาทิตย์ (วันหยุดตรวจ)');
                }
            }

            const prevWork = findNearestWorkingDay(dateObj, -1);
            const nextWork = findNearestWorkingDay(dateObj, 1);

            const fmtBtnDate = (d) => {
                const wd = new Intl.DateTimeFormat(lang === 'EN' ? 'en-US' : 'th-TH', { weekday: 'short' }).format(d);
                const dm = new Intl.DateTimeFormat(lang === 'EN' ? 'en-US' : 'th-TH', { day: 'numeric', month: 'short' }).format(d);
                return lang === 'EN' ? `Shift to ${wd}, ${dm}` : `เลื่อนเป็น ${wd} ${dm}`;
            };

            if (toFriBtn) {
                const span = toFriBtn.querySelector('span');
                if (span) span.textContent = fmtBtnDate(prevWork.date);
                toFriBtn.onclick = (e) => {
                    e.preventDefault();
                    onShiftCallback(prevWork.diffDays);
                };
            }
            if (toMonBtn) {
                const span = toMonBtn.querySelector('span');
                if (span) span.textContent = fmtBtnDate(nextWork.date);
                toMonBtn.onclick = (e) => {
                    e.preventDefault();
                    onShiftCallback(nextWork.diffDays);
                };
            }
        } else {
            if (warningEl) warningEl.classList.add('hidden');
        }
    }

    // Update preset chip highlights
    function updatePresetHighlight(type, val) {
        if (type === 'day') {
            document.querySelectorAll('.btn-preset-day').forEach(b => {
                if (parseInt(b.getAttribute('data-days')) === val) {
                    b.classList.remove('bg-[#24917d]/15', 'text-[#163333]');
                    b.classList.add('bg-[#24917d]', 'text-white', 'shadow-sm');
                } else {
                    b.classList.add('bg-[#24917d]/15', 'text-[#163333]');
                    b.classList.remove('bg-[#24917d]', 'text-white', 'shadow-sm');
                }
            });
        } else if (type === 'week') {
            document.querySelectorAll('.btn-preset-week').forEach(b => {
                if (parseInt(b.getAttribute('data-weeks')) === val) {
                    b.classList.remove('bg-[#24917d]/15', 'text-[#163333]');
                    b.classList.add('bg-[#24917d]', 'text-white', 'shadow-sm');
                } else {
                    b.classList.add('bg-[#24917d]/15', 'text-[#163333]');
                    b.classList.remove('bg-[#24917d]', 'text-white', 'shadow-sm');
                }
            });
        }
    }

    // -------------------------------------------------------------
    // 3. Next Appointment by Days
    // -------------------------------------------------------------
    const apptDaysInput = document.getElementById('apptDays');
    const apptDaysResult = document.getElementById('apptDaysResult');
    const apptDaysResultPicker = document.getElementById('apptDaysResultPicker');
    const apptDaysWeekendWarning = document.getElementById('apptDaysWeekendWarning');
    const apptDaysWeekendText = document.getElementById('apptDaysWeekendText');
    const btnApptDaysToFri = document.getElementById('btnApptDaysToFri');
    const btnApptDaysToMon = document.getElementById('btnApptDaysToMon');

    function calculateApptDays() {
        const days = parseInt(apptDaysInput.value);
        if (!isNaN(days) && days > 0) {
            const nextDate = getToday();
            nextDate.setDate(nextDate.getDate() + days);
            apptDaysResult.textContent = formatThaiDateShortWithDay(nextDate);
            apptDaysResultPicker.value = toISODate(nextDate);
            checkWeekendAndWarn(nextDate, apptDaysWeekendWarning, apptDaysWeekendText, btnApptDaysToFri, btnApptDaysToMon, (diff) => {
                const newDays = days + diff;
                if (newDays > 0) {
                    apptDaysInput.value = newDays;
                    calculateApptDays();
                }
            });
            updatePresetHighlight('day', days);
        } else {
            apptDaysResult.textContent = '-';
            apptDaysResultPicker.value = '';
            if (apptDaysWeekendWarning) apptDaysWeekendWarning.classList.add('hidden');
            updatePresetHighlight('day', null);
        }
    }
    if (apptDaysInput) {
        apptDaysInput.addEventListener('input', calculateApptDays);
    }

    // Day presets click events
    document.querySelectorAll('.btn-preset-day').forEach(btn => {
        btn.addEventListener('click', () => {
            const d = parseInt(btn.getAttribute('data-days'));
            if (!isNaN(d)) {
                apptDaysInput.value = d;
                calculateApptDays();
            }
        });
    });

    // -------------------------------------------------------------
    // 4. Next Appointment by Weeks
    // -------------------------------------------------------------
    const apptWeeksInput = document.getElementById('apptWeeks');
    const apptWeeksResult = document.getElementById('apptWeeksResult');
    const apptWeeksResultPicker = document.getElementById('apptWeeksResultPicker');
    const apptWeeksWeekendWarning = document.getElementById('apptWeeksWeekendWarning');
    const apptWeeksWeekendText = document.getElementById('apptWeeksWeekendText');
    const btnApptWeeksToFri = document.getElementById('btnApptWeeksToFri');
    const btnApptWeeksToMon = document.getElementById('btnApptWeeksToMon');

    function calculateApptWeeks() {
        const weeks = parseInt(apptWeeksInput.value);
        if (!isNaN(weeks) && weeks > 0) {
            const nextDate = getToday();
            nextDate.setDate(nextDate.getDate() + (weeks * 7));
            apptWeeksResult.textContent = formatThaiDateShortWithDay(nextDate);
            apptWeeksResultPicker.value = toISODate(nextDate);
            checkWeekendAndWarn(nextDate, apptWeeksWeekendWarning, apptWeeksWeekendText, btnApptWeeksToFri, btnApptWeeksToMon, (diff) => {
                const totalDays = (weeks * 7) + diff;
                if (apptDaysInput) {
                    apptDaysInput.value = totalDays;
                    calculateApptDays();
                    const sec = document.getElementById('section-appt-days');
                    if (sec) sec.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            });
            updatePresetHighlight('week', weeks);
        } else {
            apptWeeksResult.textContent = '-';
            apptWeeksResultPicker.value = '';
            if (apptWeeksWeekendWarning) apptWeeksWeekendWarning.classList.add('hidden');
            updatePresetHighlight('week', null);
        }
    }
    if (apptWeeksInput) {
        apptWeeksInput.addEventListener('input', calculateApptWeeks);
    }

    // Week presets click events
    document.querySelectorAll('.btn-preset-week').forEach(btn => {
        btn.addEventListener('click', () => {
            const w = parseInt(btn.getAttribute('data-weeks'));
            if (!isNaN(w)) {
                apptWeeksInput.value = w;
                calculateApptWeeks();
            }
        });
    });

    // -------------------------------------------------------------
    // Quick Glance Appointment Summary Widget
    // -------------------------------------------------------------
    function renderQuickGlanceWidget() {
        const grid = document.getElementById('quickGlanceGrid');
        const todayLabel = document.getElementById('quickGlanceTodayLabel');
        if (!grid) return;

        const today = getToday();
        const lang = window.currentLang || 'TH';
        if (todayLabel) {
            todayLabel.textContent = `${translations[lang].quick_glance_today || 'อิงจากวันนี้: '} ${formatThaiDateShort(today)}`;
        }

        const presets = [
            { labelKey: 'qg_1w', defaultLabel: '1 สัปดาห์ (7 วัน)', days: 7 },
            { labelKey: 'qg_2w', defaultLabel: '2 สัปดาห์ (14 วัน)', days: 14 },
            { labelKey: 'qg_4w', defaultLabel: '4 สัปดาห์ (28 วัน)', days: 28 },
            { labelKey: 'qg_1m', defaultLabel: '1 เดือน (30 วัน)', days: 30 },
            { labelKey: 'qg_2m', defaultLabel: '2 เดือน (60 วัน)', days: 60 },
            { labelKey: 'qg_3m', defaultLabel: '3 เดือน (90 วัน)', days: 90 },
        ];

        grid.innerHTML = '';
        presets.forEach(p => {
            const targetDate = new Date(today);
            targetDate.setDate(today.getDate() + p.days);
            const hInfo = getThaiHolidayInfo(targetDate);
            const isNonWorking = hInfo.isNonWorking;
            
            const card = document.createElement('div');
            card.className = `p-3 rounded-xl border transition-all text-center flex flex-col justify-between cursor-pointer hover:shadow-md hover:border-[#24917d] ${
                isNonWorking ? 'bg-amber-50/80 border-amber-200 text-amber-950' : 'bg-white border-gray-100 text-textdark'
            }`;
            
            card.addEventListener('click', () => {
                if (apptDaysInput) {
                    apptDaysInput.value = p.days;
                    calculateApptDays();
                    const targetSec = document.getElementById('section-appt-days');
                    if (targetSec) targetSec.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            });

            const dayName = new Intl.DateTimeFormat(lang === 'EN' ? 'en-US' : 'th-TH', { weekday: 'short' }).format(targetDate);
            const dateStr = new Intl.DateTimeFormat(lang === 'EN' ? 'en-US' : 'th-TH', { 
                day: 'numeric', 
                month: 'short', 
                year: lang === 'EN' ? 'numeric' : '2-digit' 
            }).format(targetDate);

            const labelText = (translations[lang] && translations[lang][p.labelKey]) ? translations[lang][p.labelKey] : p.defaultLabel;
            let statusSuffix = '';
            if (hInfo.isHoliday) {
                const hName = lang === 'EN' ? hInfo.nameEN : hInfo.nameTH;
                statusSuffix = ` (${hName})`;
            } else if (hInfo.isWeekend) {
                statusSuffix = lang === 'EN' ? ' (Weekend)' : ' (หยุด)';
            }

            card.innerHTML = `
                <div class="text-[11px] sm:text-xs font-bold text-[#1a5b4b] mb-1 truncate" title="${labelText}">${labelText}</div>
                <div class="text-xs sm:text-sm font-bold text-textdark">${dateStr}</div>
                <div class="mt-1 flex items-center justify-center">
                    <span class="inline-block text-[10px] px-2 py-0.5 rounded-full font-bold truncate max-w-full ${
                        isNonWorking ? 'bg-amber-200/70 text-amber-900' : 'bg-[#24917d]/15 text-[#163333]'
                    }" title="${dayName}${statusSuffix}">${dayName}${statusSuffix}</span>
                </div>
            `;
            grid.appendChild(card);
        });
    }

    // Function to update preset button labels on language change
    function updatePresetLabels() {
        const lang = window.currentLang || 'TH';
        document.querySelectorAll('.btn-preset-day').forEach(btn => {
            const days = parseInt(btn.getAttribute('data-days'));
            if (lang === 'EN') {
                if (days === 7) btn.textContent = '7 Days';
                else if (days === 14) btn.textContent = '14 Days';
                else if (days === 28) btn.textContent = '28 Days (4 Wks)';
                else if (days === 30) btn.textContent = '30 Days (1 Mo)';
                else if (days === 60) btn.textContent = '60 Days (2 Mos)';
                else if (days === 90) btn.textContent = '90 Days (3 Mos)';
            } else {
                if (days === 7) btn.textContent = '7 วัน';
                else if (days === 14) btn.textContent = '14 วัน';
                else if (days === 28) btn.textContent = '28 วัน (4 สัปดาห์)';
                else if (days === 30) btn.textContent = '30 วัน (1 เดือน)';
                else if (days === 60) btn.textContent = '60 วัน (2 เดือน)';
                else if (days === 90) btn.textContent = '90 วัน (3 เดือน)';
            }
        });

        document.querySelectorAll('.btn-preset-week').forEach(btn => {
            const weeks = parseInt(btn.getAttribute('data-weeks'));
            if (lang === 'EN') {
                btn.textContent = `${weeks} ${weeks === 1 ? 'Week' : 'Weeks'}`;
            } else {
                btn.textContent = `${weeks} สัปดาห์`;
            }
        });
    }

    // -------------------------------------------------------------
    // 7. Weekly Medication Calculator
    // -------------------------------------------------------------
    const medWeeklyStartPicker = document.getElementById('medWeeklyStartPicker');
    const medWeeklyStartDay = document.getElementById('medWeeklyStartDay');
    const medWeeklyStartMonth = document.getElementById('medWeeklyStartMonth');
    const medWeeklyStartYear = document.getElementById('medWeeklyStartYear');
    
    const medWeeklyEndPicker = document.getElementById('medWeeklyEndPicker');
    const medWeeklyEndDay = document.getElementById('medWeeklyEndDay');
    const medWeeklyEndMonth = document.getElementById('medWeeklyEndMonth');
    const medWeeklyEndYear = document.getElementById('medWeeklyEndYear');
    
    const medWeeklyDose = document.getElementById('medWeeklyDose');
    const medWeeklyDoseCustom = document.getElementById('medWeeklyDoseCustom');
    const medWeeklyDuration = document.getElementById('medWeeklyDuration');
    const medWeeklyResult = document.getElementById('medWeeklyResult');

    // Initialize with today's date
    const todayForWeekly = getToday();
    syncDateToFields(todayForWeekly, medWeeklyStartDay, medWeeklyStartMonth, medWeeklyStartYear);
    medWeeklyStartPicker.value = toISODate(todayForWeekly);

    function calculateWeeklyMedication() {
        const sd = parseInt(medWeeklyStartDay.value);
        const sm = parseInt(medWeeklyStartMonth.value);
        const syBE = parseInt(medWeeklyStartYear.value);
        
        const ed = parseInt(medWeeklyEndDay.value);
        const em = parseInt(medWeeklyEndMonth.value);
        const eyBE = parseInt(medWeeklyEndYear.value);

        const doseSelection = medWeeklyDose.value;
        let dosage = 0;
        
        if (doseSelection === 'custom') {
            medWeeklyDoseCustom.classList.remove('hidden');
            dosage = parseFloat(medWeeklyDoseCustom.value);
        } else {
            medWeeklyDoseCustom.classList.add('hidden');
            dosage = parseFloat(doseSelection);
        }

        if (!isNaN(sd) && !isNaN(sm) && !isNaN(syBE) && !isNaN(ed) && !isNaN(em) && !isNaN(eyBE) && !isNaN(dosage) && dosage > 0) {
            const startDate = new Date(toCEYear(syBE), sm - 1, sd);
            const endDate = new Date(toCEYear(eyBE), em - 1, ed);
            
            medWeeklyStartPicker.value = toISODate(startDate);
            medWeeklyEndPicker.value = toISODate(endDate);

            const totalDays = daysBetween(startDate, endDate);
            if (totalDays >= 0) {
                const totalWeeks = Math.ceil(totalDays / 7);
                
                const checkedDays = Array.from(document.querySelectorAll('.med-weekly-day:checked')).map(cb => parseInt(cb.value));
                let totalPills = 0;

                const dayUnit = window.currentLang === 'EN' ? 'Days' : 'วัน';
                const pillUnit = window.currentLang === 'EN' ? 'pills' : 'เม็ด';

                if (checkedDays.length > 0) {
                    let pillsPerDose = dosage / checkedDays.length;
                    const occurrences = countWeekdayOccurrences(startDate, endDate, checkedDays);
                    totalPills = occurrences * pillsPerDose;
                    const occNote = window.currentLang === 'EN' ? `(Taking meds ${occurrences} days total)` : `(ทานยาทั้งหมด ${occurrences} วัน)`;
                    medWeeklyDuration.innerHTML = `${totalDays} ${dayUnit} <br><span class="text-sm font-normal text-textdark/70">${occNote}</span>`;
                    
                    const exactPills = Number.isInteger(totalPills) ? totalPills : parseFloat(totalPills.toFixed(2));
                    const roundedPills = ceilPills(totalPills);
                    
                    if (roundedPills !== exactPills) {
                        const exactNote = window.currentLang === 'EN' ? `(Exact: ${exactPills} pills)` : `(จำนวนจริง: ${exactPills} เม็ด)`;
                        medWeeklyResult.innerHTML = `${roundedPills} ${pillUnit} <br><span class="text-base font-normal text-textdark/70">${exactNote}</span>`;
                    } else {
                        medWeeklyResult.textContent = `${exactPills} ${pillUnit}`;
                    }
                } else {
                    totalPills = totalWeeks * dosage;
                    const wkNote = window.currentLang === 'EN' ? `(approx. ${totalWeeks} weeks)` : `(ประมาณ ${totalWeeks} สัปดาห์)`;
                    medWeeklyDuration.innerHTML = `${totalDays} ${dayUnit} <br><span class="text-sm font-normal text-textdark/70">${wkNote}</span>`;
                    medWeeklyResult.textContent = `${totalPills} ${pillUnit}`;
                }
            } else {
                medWeeklyDuration.textContent = '-';
                medWeeklyResult.textContent = `- ${window.currentLang === 'EN' ? 'pills' : 'เม็ด'}`;
            }
        } else {
            medWeeklyDuration.textContent = '-';
            medWeeklyResult.textContent = `- ${window.currentLang === 'EN' ? 'pills' : 'เม็ด'}`;
        }
    }

    [medWeeklyStartDay, medWeeklyStartMonth, medWeeklyStartYear].forEach(el => {
        el.addEventListener('input', calculateWeeklyMedication);
        el.addEventListener('change', calculateWeeklyMedication);
    });
    [medWeeklyEndDay, medWeeklyEndMonth, medWeeklyEndYear].forEach(el => {
        el.addEventListener('input', calculateWeeklyMedication);
        el.addEventListener('change', calculateWeeklyMedication);
    });
    medWeeklyDose.addEventListener('change', calculateWeeklyMedication);
    medWeeklyDoseCustom.addEventListener('input', calculateWeeklyMedication);
    document.querySelectorAll('.med-weekly-day').forEach(cb => cb.addEventListener('change', calculateWeeklyMedication));

    medWeeklyStartPicker.addEventListener('change', (e) => {
        const d = parseDateStr(e.target.value);
        syncDateToFields(d, medWeeklyStartDay, medWeeklyStartMonth, medWeeklyStartYear);
        calculateWeeklyMedication();
    });

    medWeeklyEndPicker.addEventListener('change', (e) => {
        const d = parseDateStr(e.target.value);
        syncDateToFields(d, medWeeklyEndDay, medWeeklyEndMonth, medWeeklyEndYear);
        calculateWeeklyMedication();
    });

    // -------------------------------------------------------------
    // 5. Age Calculator
    // -------------------------------------------------------------
    const ageDayInput = document.getElementById('ageDay');
    const ageMonthInput = document.getElementById('ageMonth');
    const ageYearInput = document.getElementById('ageYear');
    const ageResult = document.getElementById('ageResult');

    function calculateAge() {
        const d = parseInt(ageDayInput.value);
        const m = parseInt(ageMonthInput.value);
        const yBE = parseInt(ageYearInput.value);

        if (!isNaN(d) && !isNaN(m) && !isNaN(yBE)) {
            const yCE = toCEYear(yBE);
            // Note: Month is 0-indexed in Date constructor
            const birthDate = new Date(yCE, m - 1, d);
            const age = calcAge(birthDate, getToday());

            if (!age) {
                ageResult.textContent = window.currentLang === 'EN' ? "Birth date cannot be in the future" : "วันเกิดต้องไม่เกินปัจจุบัน";
                return;
            }
            const { years: ageY, months: ageM, days: ageD } = age;

            const yrStr = window.currentLang === 'EN' ? 'Years' : 'ปี';
            const moStr = window.currentLang === 'EN' ? 'Months' : 'เดือน';
            const dyStr = window.currentLang === 'EN' ? 'Days' : 'วัน';
            ageResult.textContent = `${ageY} ${yrStr} ${ageM} ${moStr} ${ageD} ${dyStr}`;
        } else {
            ageResult.textContent = '-';
        }
    }

    ageDayInput.addEventListener('input', calculateAge);
    ageMonthInput.addEventListener('change', calculateAge);
    ageYearInput.addEventListener('input', calculateAge);

    // -------------------------------------------------------------
    // 6. Year Converter
    // -------------------------------------------------------------
    const yearBEInput = document.getElementById('yearBE');
    const yearCEInput = document.getElementById('yearCE');

    yearBEInput.addEventListener('input', (e) => {
        const be = parseInt(e.target.value);
        if (!isNaN(be)) {
            yearCEInput.value = be - 543;
        } else {
            yearCEInput.value = '';
        }
    });

    yearCEInput.addEventListener('input', (e) => {
        const ce = parseInt(e.target.value);
        if (!isNaN(ce)) {
            yearBEInput.value = ce + 543;
        } else {
            yearBEInput.value = '';
        }
    });

    // -------------------------------------------------------------
    // 7. Vaccine Appointment Calculator
    // -------------------------------------------------------------
    const vaccineType = document.getElementById('vaccineType');
    const vaccineDose = document.getElementById('vaccineDose');
    
    // New 3-field inputs + DatePicker
    const vaccineDay = document.getElementById('vaccineDay');
    const vaccineMonth = document.getElementById('vaccineMonth');
    const vaccineYear = document.getElementById('vaccineYear');
    const vaccineDatePicker = document.getElementById('vaccineDatePicker');
    
    const vaccineResult = document.getElementById('vaccineResult');
    const vaccineResultPicker = document.getElementById('vaccineResultPicker');
    const vaccineNote = document.getElementById('vaccineNote');

    const vaccineDateLabel = document.getElementById('vaccineDateLabel');

    // Initialize with today's date
    const todayVaccine = getToday();
    if (vaccineDay) {
        syncDateToFields(todayVaccine, vaccineDay, vaccineMonth, vaccineYear);
        if (vaccineDatePicker) vaccineDatePicker.value = toISODate(todayVaccine);
    }

    function updateVaccineDateLabel() {
        if (!vaccineDateLabel) return;
        const type = vaccineType.value;
        const selDose = vaccineDose.value;
        const isEn = window.currentLang === 'EN';
        if (type === 'RABIES') {
            vaccineDateLabel.textContent = isEn ? 'Start Date (Day 0) / Latest Dose (CE/BE)' : 'วันที่เริ่มฉีด (Day 0) / ฉีดเข็มล่าสุด (พ.ศ.)';
        } else if (type === 'PNEUMO' && (selDose === 'PPSV23_PREV_GEN' || selDose === 'PPSV23_PREV_IMM')) {
            vaccineDateLabel.textContent = isEn ? 'Date of PPSV23 Dose (CE/BE)' : 'วันที่ฉีด PPSV23 เข็มล่าสุด (พ.ศ.)';
        } else if (type === 'PNEUMO' && selDose === 'PCV20') {
            vaccineDateLabel.textContent = isEn ? 'Date of PCV20 Dose (CE/BE)' : 'วันที่ฉีด PCV20 (พ.ศ.)';
        } else if (type === 'TDAP' && selDose === 'BOOST_10Y') {
            vaccineDateLabel.textContent = isEn ? 'Date of Latest Td/Tdap Booster (CE/BE)' : 'วันที่ฉีดเข็มกระตุ้นล่าสุด (พ.ศ.)';
        } else if (type === 'TDAP' && selDose === 'PREG') {
            vaccineDateLabel.textContent = isEn ? 'Current Visit / LMP Date (CE/BE)' : 'วันที่มารับบริการ / ตรวจครรภ์ (พ.ศ.)';
        } else {
            vaccineDateLabel.textContent = isEn ? 'Latest Dose Date (CE/BE)' : 'วันที่ฉีดเข็มล่าสุด (พ.ศ.)';
        }
    }

    function populateVaccineDoses() {
        const type = vaccineType.value;
        const currentVal = vaccineDose.value;
        const isEn = window.currentLang === 'EN';
        vaccineDose.innerHTML = isEn ? '<option value="">-- Select Dose --</option>' : '<option value="">-- เลือกเข็ม --</option>';
        
        const rulesTH = {
            'HBV': [ { val: '1', text: 'เข็ม 1' }, { val: '2', text: 'เข็ม 2' } ],
            'HPV': [ { val: '1', text: 'เข็ม 1' }, { val: '2', text: 'เข็ม 2' } ],
            'HAV': [ { val: '1', text: 'เข็ม 1' } ],
            'VZV': [ { val: '1', text: 'เข็ม 1' } ],
            'RZV': [ { val: '1', text: 'เข็ม 1' } ],
            'MMR': [ { val: '1', text: 'เข็ม 1' } ],
            'DENGUE': [ { val: '1', text: 'เข็ม 1' } ],
            'RABIES': [
                { val: '0', text: 'ผู้ไม่เคยฉีดมาก่อน: สูตรเข้ากล้าม IM 5 เข็ม (Day 0, 3, 7, 14, 28)' },
                { val: '0_ID', text: 'ผู้ไม่เคยฉีดมาก่อน: สูตรในผิวหนัง 2-site ID 4 ครั้ง (Day 0, 3, 7, 28)' },
                { val: '1', text: 'ผู้เคยฉีดมาก่อน: ฉีดกระตุ้น Booster 2 เข็ม (Day 0, 3)' },
                { val: '1_ID_1DAY', text: 'ผู้เคยฉีดมาก่อน: ฉีดกระตุ้น ID 4 จุดวันเดียว (Day 0: 4-site ID)' }
            ],
            'PNEUMO': [
                { val: 'PCV20', text: 'สูตร PCV20 เข็มเดียว (จบชุดการฉีด)' },
                { val: 'PCV15_GEN', text: 'เข็ม 1: PCV15 / PCV13 (กลุ่มเสี่ยงทั่วไป เช่น อายุ ≥65 ปี หรือโรคเรื้อรัง)' },
                { val: 'PCV15_IMM', text: 'เข็ม 1: PCV15 / PCV13 (กลุ่มภูมิคุ้มกันบกพร่อง / ไม่มีม้าม / CSF leak)' },
                { val: 'PPSV23_PREV_GEN', text: 'เคยได้รับ PPSV23 มาก่อน (กลุ่มเสี่ยงทั่วไป ต้องการต่อ PCV20)' },
                { val: 'PPSV23_PREV_IMM', text: 'เคยได้รับ PPSV23 มาก่อน (กลุ่มภูมิคุ้มกันบกพร่อง ต้องการต่อ PCV20)' }
            ],
            'TDAP': [
                { val: '1', text: 'เข็ม 1 (ผู้ไม่เคยได้รับมาก่อน / ไม่ทราบประวัติ)' },
                { val: '2', text: 'เข็ม 2 (ผู้ที่ฉีดเข็ม 1 มาแล้ว)' },
                { val: 'BOOST_10Y', text: 'เข็มกระตุ้น (ทุก 10 ปี)' },
                { val: 'PREG', text: 'หญิงตั้งครรภ์ (Tdap แนะนำช่วงอายุครรภ์ 20–32 สัปดาห์)' }
            ]
        };
        const rulesEN = {
            'HBV': [ { val: '1', text: 'Dose 1' }, { val: '2', text: 'Dose 2' } ],
            'HPV': [ { val: '1', text: 'Dose 1' }, { val: '2', text: 'Dose 2' } ],
            'HAV': [ { val: '1', text: 'Dose 1' } ],
            'VZV': [ { val: '1', text: 'Dose 1' } ],
            'RZV': [ { val: '1', text: 'Dose 1' } ],
            'MMR': [ { val: '1', text: 'Dose 1' } ],
            'DENGUE': [ { val: '1', text: 'Dose 1' } ],
            'RABIES': [
                { val: '0', text: 'Never vaccinated: IM 5 doses (Day 0, 3, 7, 14, 28)' },
                { val: '0_ID', text: 'Never vaccinated: 2-site ID 4 visits (Day 0, 3, 7, 28)' },
                { val: '1', text: 'Previously vaccinated: Booster 2 doses (Day 0, 3)' },
                { val: '1_ID_1DAY', text: 'Previously vaccinated: 4-site ID single day (Day 0)' }
            ],
            'PNEUMO': [
                { val: 'PCV20', text: 'PCV20 single dose regimen (Complete series)' },
                { val: 'PCV15_GEN', text: 'Dose 1: PCV15 / PCV13 (General risk, age ≥65 or chronic conditions)' },
                { val: 'PCV15_IMM', text: 'Dose 1: PCV15 / PCV13 (Immunocompromised / Asplenia / CSF leak)' },
                { val: 'PPSV23_PREV_GEN', text: 'Previously received PPSV23 (General risk, next PCV20)' },
                { val: 'PPSV23_PREV_IMM', text: 'Previously received PPSV23 (Immunocompromised, next PCV20)' }
            ],
            'TDAP': [
                { val: '1', text: 'Dose 1 (Unvaccinated / Unknown history)' },
                { val: '2', text: 'Dose 2 (Already had Dose 1)' },
                { val: 'BOOST_10Y', text: 'Booster (Every 10 years)' },
                { val: 'PREG', text: 'Pregnant women (Tdap at GA 20–32 weeks)' }
            ]
        };

        const activeRules = isEn ? rulesEN : rulesTH;

        if (type && activeRules[type]) {
            vaccineDose.disabled = false;
            activeRules[type].forEach(d => {
                const opt = document.createElement('option');
                opt.value = d.val;
                opt.textContent = d.text;
                vaccineDose.appendChild(opt);
            });
            if (currentVal) vaccineDose.value = currentVal;
            updateVaccineDateLabel();
        } else {
            vaccineDose.disabled = true;
            if (vaccineDateLabel) vaccineDateLabel.textContent = isEn ? 'Latest Dose Date (CE/BE)' : 'วันที่ฉีดเข็มล่าสุด (พ.ศ.)';
        }
        if (typeof calculateVaccine === 'function') calculateVaccine();
    }

    vaccineType.addEventListener('change', populateVaccineDoses);
    vaccineDose.addEventListener('change', () => {
        updateVaccineDateLabel();
        calculateVaccine();
    });

    function calculateVaccine() {
        const type = vaccineType.value;
        const dose = vaccineDose.value;
        
        const d = parseInt(vaccineDay.value);
        const m = parseInt(vaccineMonth.value);
        const yBE = parseInt(vaccineYear.value);

        vaccineNote.classList.add('hidden');
        vaccineNote.textContent = '';

        if (type && dose && !isNaN(d) && !isNaN(m) && !isNaN(yBE)) {
            const yCE = toCEYear(yBE);
            const vDate = new Date(yCE, m - 1, d);
            
            // Sync hidden date picker
            vaccineDatePicker.value = toISODate(vDate);

            const nextAppt = new Date(vDate);
            let resultHTML = '';
            let pickerDate = nextAppt;
            const isEn = window.currentLang === 'EN';
            
            switch (type) {
                case 'RABIES':
                    if (dose === '0') {
                        const dose2 = new Date(vDate); dose2.setDate(dose2.getDate() + 3);
                        const dose3 = new Date(vDate); dose3.setDate(dose3.getDate() + 7);
                        const dose4 = new Date(vDate); dose4.setDate(dose4.getDate() + 14);
                        const dose5 = new Date(vDate); dose5.setDate(dose5.getDate() + 28);
                        resultHTML = renderVaccineDose(isEn ? 'Dose 1 (Day 0)' : 'เข็ม 1 (Day 0)', formatThaiDateShortWithDay(vDate)) +
                                     renderVaccineDose(isEn ? 'Dose 2 (Day 3)' : 'เข็ม 2 (Day 3)', formatThaiDateShortWithDay(dose2)) +
                                     renderVaccineDose(isEn ? 'Dose 3 (Day 7)' : 'เข็ม 3 (Day 7)', formatThaiDateShortWithDay(dose3)) +
                                     renderVaccineDose(isEn ? 'Dose 4 (Day 14)' : 'เข็ม 4 (Day 14)', formatThaiDateShortWithDay(dose4)) +
                                     renderVaccineDose(isEn ? 'Dose 5 (Day 28)' : 'เข็ม 5 (Day 28)', formatThaiDateShortWithDay(dose5));
                        pickerDate = dose2;
                        vaccineNote.textContent = isEn 
                            ? 'IM Essen regimen: Day 0, 3, 7, 14, 28 (0.5 or 1.0 mL per dose in Deltoid, never gluteal). Evaluate RIG for Category III exposure.' 
                            : 'สูตรเข้ากล้ามเนื้อ IM (Essen regimen): Day 0, 3, 7, 14, 28 (ฉีดเข้ากล้ามเนื้อต้นแขน Deltoid ห้ามฉีดเข้าสะโพก) และประเมินการให้ RIG ในผู้สัมผัส Category III';
                    } else if (dose === '0_ID') {
                        const dose2 = new Date(vDate); dose2.setDate(dose2.getDate() + 3);
                        const dose3 = new Date(vDate); dose3.setDate(dose3.getDate() + 7);
                        const dose4 = new Date(vDate); dose4.setDate(dose4.getDate() + 28);
                        resultHTML = renderVaccineDose(isEn ? 'Visit 1: 2-site ID (Day 0)' : 'ครั้งที่ 1: ฉีด 2 จุด (Day 0)', formatThaiDateShortWithDay(vDate)) +
                                     renderVaccineDose(isEn ? 'Visit 2: 2-site ID (Day 3)' : 'ครั้งที่ 2: ฉีด 2 จุด (Day 3)', formatThaiDateShortWithDay(dose2)) +
                                     renderVaccineDose(isEn ? 'Visit 3: 2-site ID (Day 7)' : 'ครั้งที่ 3: ฉีด 2 จุด (Day 7)', formatThaiDateShortWithDay(dose3)) +
                                     renderVaccineDose(isEn ? 'Visit 4: 2-site ID (Day 28)' : 'ครั้งที่ 4: ฉีด 2 จุด (Day 28)', formatThaiDateShortWithDay(dose4));
                        pickerDate = dose2;
                        vaccineNote.textContent = isEn 
                            ? 'Updated Thai Red Cross ID regimen: 2-site ID (0.1 mL each deltoid) on Day 0, 3, 7, 28. Evaluate RIG for Category III exposure.' 
                            : 'สูตรในผิวหนัง 2-site ID (สภากาชาดไทย): ฉีดจุดละ 0.1 mL ที่ต้นแขน 2 ข้างใน Day 0, 3, 7, 28 และประเมิน RIG ในผู้สัมผัส Category III';
                    } else if (dose === '1') {
                        const dose2 = new Date(vDate); dose2.setDate(dose2.getDate() + 3);
                        resultHTML = renderVaccineDose(isEn ? 'Dose 1 (Day 0)' : 'เข็ม 1 (Day 0)', formatThaiDateShortWithDay(vDate)) +
                                     renderVaccineDose(isEn ? 'Dose 2 (Day 3)' : 'เข็ม 2 (Day 3)', formatThaiDateShortWithDay(dose2));
                        pickerDate = dose2;
                        vaccineNote.textContent = isEn 
                            ? 'Booster 2 doses (Day 0, 3) IM (1 dose) or 1-site ID (0.1 mL) without RIG if previously documented complete rabies vaccination.' 
                            : 'ฉีดกระตุ้น 2 ครั้ง (Day 0, 3) แบบ IM 1 จุด หรือ ID 0.1 mL 1 จุด โดยไม่ต้องให้ RIG หากเคยได้รับวัคซีนครบชุดมาก่อน';
                    } else if (dose === '1_ID_1DAY') {
                        resultHTML = renderVaccineDose(isEn ? 'Single Visit: 4-site ID (Day 0)' : 'ฉีดครั้งเดียว: 4 จุดในผิวหนัง (Day 0)', formatThaiDateShortWithDay(vDate));
                        pickerDate = vDate;
                        vaccineNote.textContent = isEn 
                            ? 'Alternative Booster: 4-site ID (0.1 mL each at 4 separate sites: left/right deltoid and suprascapular/thigh) on Day 0 in single visit.' 
                            : 'สูตรกระตุ้นทางเลือก: ฉีดในผิวหนัง 4 จุด จุดละ 0.1 mL ในวันเดียวกัน (Day 0) ต้นแขนซ้าย/ขวา และสะบักหรือหน้าขา โดยไม่ต้องให้ RIG';
                    }
                    break;
                case 'HBV':
                    if (dose === '1') {
                        const dose2 = new Date(vDate); dose2.setMonth(dose2.getMonth() + 1);
                        const dose3 = new Date(vDate); dose3.setMonth(dose3.getMonth() + 6);
                        resultHTML = renderVaccineDose(isEn ? 'Dose 2' : 'เข็ม 2', formatThaiDateShortWithDay(dose2)) +
                                     renderVaccineDose(isEn ? 'Dose 3' : 'เข็ม 3', formatThaiDateShortWithDay(dose3));
                        pickerDate = dose2;
                        vaccineNote.textContent = isEn 
                            ? 'Standard schedule: 0, 1, 6 months (Deltoid IM). For hemodialysis patients: consider 40 mcg dose and check Anti-HBs 1-2 months after series.' 
                            : 'สูตรมาตรฐาน: 0, 1, 6 เดือน (ฉีดเข้ากล้ามต้นแขน Deltoid) / สำหรับผู้ป่วยฟอกไตพิจารณาขนาด 40 mcg และตรวจ Anti-HBs หลังครบชุด 1-2 เดือน';
                    } else if (dose === '2') {
                        nextAppt.setMonth(nextAppt.getMonth() + 5); 
                        resultHTML = renderVaccineDose(isEn ? 'Dose 3' : 'เข็ม 3', formatThaiDateShortWithDay(nextAppt));
                        pickerDate = nextAppt;
                        vaccineNote.textContent = isEn 
                            ? 'Dose 3 is given 6 months after Dose 1 (~5 months after Dose 2).' 
                            : 'เข็ม 3 ฉีดห่างจากเข็ม 1 เป็นเวลา 6 เดือน (ห่างจากเข็ม 2 ประมาณ 5 เดือน)';
                    }
                    break;
                case 'HPV':
                    if (dose === '1') {
                        const dose2 = new Date(vDate); dose2.setMonth(dose2.getMonth() + 2);
                        const dose3 = new Date(vDate); dose3.setMonth(dose3.getMonth() + 6);
                        resultHTML = renderVaccineDose(isEn ? 'Dose 2' : 'เข็ม 2', formatThaiDateShortWithDay(dose2)) +
                                     renderVaccineDose(isEn ? 'Dose 3' : 'เข็ม 3', formatThaiDateShortWithDay(dose3));
                        pickerDate = dose2;
                        vaccineNote.textContent = isEn 
                            ? '3-dose schedule (0, 1-2, 6 mos) for age ≥15 years or immunocompromised. (Age 9-14 years: 2 doses at 0 and 6-12 mos).' 
                            : 'สูตร 3 เข็ม (0, 1-2, 6 เดือน) สำหรับอายุ ≥15 ปี หรือผู้มีภูมิคุ้มกันบกพร่อง (หากอายุ 9-14 ปี ฉีด 2 เข็มที่ 0 และ 6-12 เดือน)';
                    } else if (dose === '2') {
                        nextAppt.setMonth(nextAppt.getMonth() + 4);
                        resultHTML = renderVaccineDose(isEn ? 'Dose 3' : 'เข็ม 3', formatThaiDateShortWithDay(nextAppt));
                        pickerDate = nextAppt;
                        vaccineNote.textContent = isEn 
                            ? 'Dose 3 is given at least 6 months after Dose 1 (~4 months after Dose 2).' 
                            : 'เข็ม 3 ฉีดห่างจากเข็ม 1 อย่างน้อย 6 เดือน (ห่างจากเข็ม 2 ประมาณ 4 เดือน)';
                    }
                    break;
                case 'HAV':
                    if (dose === '1') {
                        nextAppt.setMonth(nextAppt.getMonth() + 6);
                        resultHTML = renderVaccineDose(isEn ? 'Dose 2' : 'เข็ม 2', formatThaiDateShortWithDay(nextAppt));
                        pickerDate = nextAppt;
                        vaccineNote.textContent = isEn 
                            ? 'Dose 2 is recommended 6–12 months after Dose 1.' 
                            : 'เข็ม 2 แนะนำฉีดห่างจากเข็ม 1 ในช่วง 6–12 เดือน';
                    }
                    break;
                case 'VZV':
                    if (dose === '1') {
                        nextAppt.setDate(nextAppt.getDate() + 28);
                        resultHTML = renderVaccineDose(isEn ? 'Dose 2' : 'เข็ม 2', formatThaiDateShortWithDay(nextAppt));
                        pickerDate = nextAppt;
                        vaccineNote.textContent = isEn 
                            ? 'Dose 2 is at least 4 weeks (recommended 4–8 weeks) after Dose 1. Contraindicated in pregnancy and severe immunocompromised.' 
                            : 'เข็ม 2 ฉีดห่างจากเข็ม 1 อย่างน้อย 4 สัปดาห์ (แนะนำ 4–8 สัปดาห์) ห้ามใช้ในหญิงตั้งครรภ์และผู้มีภาวะภูมิคุ้มกันบกพร่องรุนแรง';
                    }
                    break;
                case 'MMR':
                    if (dose === '1') {
                        nextAppt.setDate(nextAppt.getDate() + 28);
                        resultHTML = renderVaccineDose(isEn ? 'Dose 2' : 'เข็ม 2', formatThaiDateShortWithDay(nextAppt));
                        pickerDate = nextAppt;
                        vaccineNote.textContent = isEn 
                            ? 'Dose 2 is at least 4 weeks after Dose 1. Contraindicated in pregnancy; avoid pregnancy for at least 1 month after dose.' 
                            : 'เข็ม 2 ฉีดห่างจากเข็ม 1 อย่างน้อย 4 สัปดาห์ ห้ามใช้ในหญิงตั้งครรภ์ และต้องคุมกำเนิดอย่างน้อย 1 เดือนหลังฉีด';
                    }
                    break;
                case 'RZV':
                    if (dose === '1') {
                        const dose2Min = new Date(vDate); dose2Min.setMonth(dose2Min.getMonth() + 2);
                        const dose2Max = new Date(vDate); dose2Max.setMonth(dose2Max.getMonth() + 6);
                        resultHTML = renderVaccineDose(isEn ? 'Dose 2 (Earliest: 2 mos)' : 'เข็ม 2 (เร็วสุด 2 เดือน)', formatThaiDateShortWithDay(dose2Min)) +
                                     renderVaccineDose(isEn ? 'Dose 2 (Latest: 6 mos)' : 'เข็ม 2 (ไม่เกิน 6 เดือน)', formatThaiDateShortWithDay(dose2Max));
                        pickerDate = dose2Min;
                        vaccineNote.textContent = isEn 
                            ? 'Dose 2 is given 2–6 months after Dose 1. For immunocompromised, interval can be shortened to 1–2 months (minimum 4 weeks).' 
                            : 'เข็ม 2 แนะนำฉีดห่าง 2–6 เดือนหลังเข็ม 1 (สำหรับผู้มีภูมิคุ้มกันบกพร่องสามารถร่นระยะห่างเป็น 1–2 เดือนได้ โดยไม่น้อยกว่า 4 สัปดาห์)';
                    }
                    break;
                case 'DENGUE':
                    if (dose === '1') {
                        nextAppt.setMonth(nextAppt.getMonth() + 3);
                        resultHTML = renderVaccineDose(isEn ? 'Dose 2' : 'เข็ม 2', formatThaiDateShortWithDay(nextAppt));
                        pickerDate = nextAppt;
                        vaccineNote.textContent = isEn 
                            ? 'Dose 2 is exactly 3 months after Dose 1 (Subcutaneous SC injection. Do NOT administer early. Contraindicated in pregnancy & breastfeeding).' 
                            : 'เข็ม 2 ฉีดห่างจากเข็ม 1 = 3 เดือน (ฉีดเข้าใต้ผิวหนัง SC ห้ามฉีดก่อนกำหนดนัดเด็ดขาด ห้ามใช้ในหญิงตั้งครรภ์และหญิงให้นมบุตร)';
                    }
                    break;
                case 'PNEUMO':
                    if (dose === 'PCV20') {
                        resultHTML = renderVaccineDose(
                            isEn ? 'PCV20 Series' : 'ชุดวัคซีน PCV20', 
                            isEn ? 'Completed (Single dose - No booster needed)' : 'เสร็จสิ้นสมบูรณ์ (ฉีดเข็มเดียว ไม่ต้องกระตุ้นซ้ำ)'
                        );
                        pickerDate = vDate;
                        vaccineNote.textContent = isEn 
                            ? 'PCV20 single dose confers complete protection against 20 serotypes without needing PPSV23.' 
                            : 'วัคซีน PCV20 ฉีดเพียง 1 เข็ม ให้ภูมิคุ้มกันครอบคลุม 20 สายพันธุ์ โดยไม่ต้องฉีด PPSV23 ตามอีก';
                    } else if (dose === 'PCV15_GEN') {
                        const dose2 = new Date(vDate);
                        dose2.setFullYear(dose2.getFullYear() + 1);
                        resultHTML = renderVaccineDose(isEn ? 'Dose 2 (PPSV23)' : 'เข็ม 2 (PPSV23)', formatThaiDateShortWithDay(dose2));
                        pickerDate = dose2;
                        vaccineNote.textContent = isEn 
                            ? 'General risk (age ≥65 or chronic conditions): Administer PPSV23 at least 1 year after PCV15 / PCV13.' 
                            : 'กลุ่มเสี่ยงทั่วไป (อายุ ≥65 ปี หรือผู้มีโรคประจำตัวเรื้อรัง): ฉีด PPSV23 ห่างจาก PCV15 / PCV13 อย่างน้อย 1 ปี';
                    } else if (dose === 'PCV15_IMM') {
                        const dose2 = new Date(vDate);
                        dose2.setDate(dose2.getDate() + 56); // 8 weeks = 56 days
                        resultHTML = renderVaccineDose(isEn ? 'Dose 2 (PPSV23)' : 'เข็ม 2 (PPSV23)', formatThaiDateShortWithDay(dose2));
                        pickerDate = dose2;
                        vaccineNote.textContent = isEn 
                            ? 'Immunocompromised, asplenia, CSF leak, or cochlear implant: Administer PPSV23 at least 8 weeks after PCV15 / PCV13.' 
                            : 'กลุ่มภูมิคุ้มกันบกพร่อง / ไม่มีม้าม / น้ำไขสันหลังรั่ว / ผ่าตัดฝังประสาทหูเทียม: ฉีด PPSV23 ห่างจาก PCV15 / PCV13 อย่างน้อย 8 สัปดาห์';
                    } else if (dose === 'PPSV23_PREV_GEN') {
                        const nextDose = new Date(vDate);
                        nextDose.setFullYear(nextDose.getFullYear() + 1);
                        resultHTML = renderVaccineDose(isEn ? 'Next Dose (PCV20)' : 'เข็มถัดไป (PCV20)', formatThaiDateShortWithDay(nextDose));
                        pickerDate = nextDose;
                        vaccineNote.textContent = isEn 
                            ? 'Previously received PPSV23 (General risk): Administer PCV20 at least 1 year after the last PPSV23 dose.' 
                            : 'เคยได้รับ PPSV23 มาก่อน (กลุ่มเสี่ยงทั่วไป): ฉีด PCV20 ห่างจากเข็ม PPSV23 ล่าสุดอย่างน้อย 1 ปี';
                    } else if (dose === 'PPSV23_PREV_IMM') {
                        const nextDose = new Date(vDate);
                        nextDose.setFullYear(nextDose.getFullYear() + 5);
                        resultHTML = renderVaccineDose(isEn ? 'Next Dose (PCV20)' : 'เข็มถัดไป (PCV20)', formatThaiDateShortWithDay(nextDose));
                        pickerDate = nextDose;
                        vaccineNote.textContent = isEn 
                            ? 'Previously received PPSV23 (Immunocompromised): Administer PCV20 at least 5 years after the last PPSV23 dose.' 
                            : 'เคยได้รับ PPSV23 มาก่อน (กลุ่มภูมิคุ้มกันบกพร่อง): ฉีด PCV20 ห่างจากเข็ม PPSV23 ล่าสุดอย่างน้อย 5 ปี';
                    }
                    break;
                case 'TDAP':
                    if (dose === '1') {
                        const dose2 = new Date(vDate); dose2.setMonth(dose2.getMonth() + 1);
                        const dose3 = new Date(vDate); dose3.setMonth(dose3.getMonth() + 6);
                        resultHTML = renderVaccineDose(isEn ? 'Dose 2 (Td/Tdap)' : 'เข็ม 2 (Td/Tdap)', formatThaiDateShortWithDay(dose2)) +
                                     renderVaccineDose(isEn ? 'Dose 3 (Td/Tdap)' : 'เข็ม 3 (Td/Tdap)', formatThaiDateShortWithDay(dose3));
                        pickerDate = dose2;
                        vaccineNote.textContent = isEn 
                            ? 'Catch-up series (0, 1, 6 months): Tdap should replace 1 dose of Td, then booster every 10 years.' 
                            : 'สูตรเริ่มใหม่ (เดือนที่ 0, 1, 6): ควรให้ Tdap 1 เข็มทดแทน Td จากนั้นกระตุ้น Td/Tdap ทุก 10 ปี';
                    } else if (dose === '2') {
                        nextAppt.setMonth(nextAppt.getMonth() + 5);
                        resultHTML = renderVaccineDose(isEn ? 'Dose 3 (Td/Tdap)' : 'เข็ม 3 (Td/Tdap)', formatThaiDateShortWithDay(nextAppt));
                        pickerDate = nextAppt;
                        vaccineNote.textContent = isEn 
                            ? 'Dose 3 is given at least 6 months after Dose 1 (~5 months after Dose 2).' 
                            : 'เข็ม 3 ฉีดห่างจากเข็ม 1 อย่างน้อย 6 เดือน (ห่างจากเข็ม 2 ประมาณ 5 เดือน)';
                    } else if (dose === 'BOOST_10Y') {
                        const nextBooster = new Date(vDate);
                        nextBooster.setFullYear(nextBooster.getFullYear() + 10);
                        resultHTML = renderVaccineDose(isEn ? 'Next Booster (Td/Tdap)' : 'กระตุ้นเข็มถัดไป (Td/Tdap)', formatThaiDateShortWithDay(nextBooster));
                        pickerDate = nextBooster;
                        vaccineNote.textContent = isEn 
                            ? 'Booster every 10 years with Td or Tdap (adults should receive at least 1 lifetime dose of Tdap).' 
                            : 'ฉีดกระตุ้นทุก 10 ปีด้วย Td หรือ Tdap (ผู้ใหญ่ควรได้รับ Tdap อย่างน้อย 1 ครั้งในชีวิต)';
                    } else if (dose === 'PREG') {
                        resultHTML = renderVaccineDose(
                            isEn ? 'Recommended Timing' : 'ช่วงเวลาที่แนะนำ', 
                            isEn ? 'Gestational Age 20 – 32 weeks' : 'อายุครรภ์ 20 – 32 สัปดาห์'
                        );
                        pickerDate = vDate;
                        vaccineNote.textContent = isEn 
                            ? 'Administer 1 dose of Tdap during EVERY pregnancy, ideally between GA 20–32 weeks (or anytime prior to delivery).' 
                            : 'แนะนำฉีด Tdap 1 เข็มทุกการตั้งครรภ์ ในช่วงอายุครรภ์ 20–32 สัปดาห์ (หรือจนถึงก่อนคลอด) เพื่อส่งผ่านแอนติบอดีป้องกันไอกรนสู่ทารก';
                    }
                    break;
            }
            
            if (resultHTML) {
                vaccineResult.innerHTML = `<div class="w-full">${resultHTML}</div>`;
            } else {
                vaccineResult.innerHTML = renderVaccineDose(isEn ? 'Next Dose' : 'เข็มถัดไป', formatThaiDateShortWithDay(nextAppt));
            }
            
            vaccineResultPicker.value = toISODate(pickerDate);
            if (vaccineNote.textContent) vaccineNote.classList.remove('hidden');
        } else {
            vaccineResult.textContent = '-';
            vaccineDatePicker.value = '';
            vaccineResultPicker.value = '';
        }
    }

    vaccineDose.addEventListener('change', calculateVaccine);
    
    vaccineDay.addEventListener('input', calculateVaccine);
    vaccineMonth.addEventListener('change', calculateVaccine);
    vaccineYear.addEventListener('input', calculateVaccine);
    
    // Reverse sync: Date Picker -> Fields
    vaccineDatePicker.addEventListener('change', (e) => {
        const d = parseDateStr(e.target.value);
        syncDateToFields(d, vaccineDay, vaccineMonth, vaccineYear);
        calculateVaccine();
    });

    // ----------------------------------------
    // 8. Appointment & Medication Table
    // ----------------------------------------
    const tblBaseDay = document.getElementById('tblBaseDay');
    const tblBaseMonth = document.getElementById('tblBaseMonth');
    const tblBaseYear = document.getElementById('tblBaseYear');
    const tblDoseDropdown = document.getElementById('tblDoseDropdown');
    const tblDoseCustom = document.getElementById('tblDoseCustom');
    const tblBody = document.getElementById('tblBody');
    
    const tblWeeklyDoseCustom = document.getElementById('tblWeeklyDoseCustom');

    const tblCustomDays = document.getElementById('tblCustomDays');
    const tblCustomDateResult = document.getElementById('tblCustomDateResult');
    const tblCustomDaysDoseDropdown = document.getElementById('tblCustomDaysDoseDropdown');
    const tblCustomDaysDoseCustom = document.getElementById('tblCustomDaysDoseCustom');
    const tblCustomDaysWeeklyDoseDropdown = document.getElementById('tblCustomDaysWeeklyDoseDropdown');
    const tblCustomDaysWeeklyDoseCustom = document.getElementById('tblCustomDaysWeeklyDoseCustom');
    const tblCustomPillResult = document.getElementById('tblCustomPillResult');
    const tblCustomWeeklyPillResult = document.getElementById('tblCustomWeeklyPillResult');

    // Initialize with today's date
    if (tblBaseDay) {
        const tblToday = getToday();
        syncDateToFields(tblToday, tblBaseDay, tblBaseMonth, tblBaseYear);

        function getTblBaseDate() {
            const d = parseInt(tblBaseDay.value);
            const m = parseInt(tblBaseMonth.value);
            const yBE = parseInt(tblBaseYear.value);
            if (isNaN(d) || isNaN(m) || isNaN(yBE)) return null;
            return new Date(toCEYear(yBE), m - 1, d);
        }

        function getTblDose() {
            let dose = tblDoseDropdown.value;
            if (dose === 'custom') {
                dose = tblDoseCustom.value;
            }
            return parseFloat(dose);
        }

        const tblWeeklyDoseDropdown = document.getElementById('tblWeeklyDoseDropdown');

        function getTblWeeklyDose() {
            if (!tblWeeklyDoseDropdown) return NaN;
            let dose = tblWeeklyDoseDropdown.value;
            if (dose === 'custom') {
                dose = tblWeeklyDoseCustom ? tblWeeklyDoseCustom.value : '';
            }
            return parseFloat(dose);
        }

        function getTblCustomDaysDose() {
            if (!tblCustomDaysDoseDropdown) return NaN;
            let dose = tblCustomDaysDoseDropdown.value;
            if (dose === 'custom') {
                dose = tblCustomDaysDoseCustom ? tblCustomDaysDoseCustom.value : '';
            }
            return parseFloat(dose);
        }

        function getTblCustomDaysWeeklyDose() {
            if (!tblCustomDaysWeeklyDoseDropdown) return NaN;
            let dose = tblCustomDaysWeeklyDoseDropdown.value;
            if (dose === 'custom') {
                dose = tblCustomDaysWeeklyDoseCustom ? tblCustomDaysWeeklyDoseCustom.value : '';
            }
            return parseFloat(dose);
        }

        function generateTable() {
            const baseDate = getTblBaseDate();
            const dose = getTblDose();
            const weeklyDose = getTblWeeklyDose();

            if (!baseDate || ((isNaN(dose) || dose <= 0) && (isNaN(weeklyDose) || weeklyDose <= 0))) {
                const errText = window.currentLang === 'EN' ? 'Please fill in date and dosage completely' : 'กรุณากรอกวันที่และขนาดยาให้ครบถ้วน';
                tblBody.innerHTML = `<tr><td colspan="4" class="px-6 py-4 text-center text-gray-500">${errText}</td></tr>`;
                return;
            }

            let html = '';
            const wkStr = window.currentLang === 'EN' ? 'Weeks' : 'สัปดาห์';
            const dyStr = window.currentLang === 'EN' ? 'days' : 'วัน';

            for (let week = 1; week <= 24; week++) {
                const days = week * 7;
                const targetDate = new Date(baseDate);
                targetDate.setDate(targetDate.getDate() + days);
                
                const pills = (!isNaN(dose) && dose > 0) ? calcTotalPills(days, dose) : '-';
                const weeklyPills = (!isNaN(weeklyDose) && weeklyDose > 0) ? ceilPills(weeklyDose * week) : '-';
                
                const hInfo = getThaiHolidayInfo(targetDate);
                let holidayBadge = '';
                if (hInfo.isHoliday) {
                    const hLabel = window.currentLang === 'EN' ? hInfo.nameEN : hInfo.nameTH;
                    holidayBadge = `<span class="inline-block mt-0.5 px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-100 text-amber-800 border border-amber-300">${hLabel}</span>`;
                } else if (hInfo.isWeekend) {
                    const wLabel = window.currentLang === 'EN' ? 'Weekend' : 'เสาร์-อาทิตย์';
                    holidayBadge = `<span class="inline-block mt-0.5 px-1.5 py-0.5 rounded text-[9px] font-semibold bg-gray-100 text-gray-600">${wLabel}</span>`;
                }

                // Zebra striping classes
                const bgClass = week % 2 === 0 ? 'bg-panelbg/5' : 'bg-white';

                html += `
                    <tr class="border-b border-gray-200 hover:bg-resultbg/50 transition ${bgClass}">
                        <td class="px-1 md:px-6 py-2 md:py-3 text-center font-medium"><div class="flex flex-col items-center whitespace-nowrap"><span>${week} ${wkStr}</span><span class="text-[10px] md:text-xs text-gray-500">(${days} ${dyStr})</span></div></td>
                        <td class="px-1 md:px-6 py-2 md:py-3 text-center whitespace-nowrap"><div class="flex flex-col items-center"><span>${formatThaiDateShort(targetDate)}</span>${holidayBadge}</div></td>
                        <td class="px-1 md:px-6 py-2 md:py-3 text-center font-bold text-cardouter text-base md:text-lg">${pills}</td>
                        <td class="px-1 md:px-6 py-2 md:py-3 text-center font-bold text-blue-700 text-base md:text-lg">${weeklyPills}</td>
                    </tr>
                `;
            }
            tblBody.innerHTML = html;
            calculateTblCustom();
        }

        function calculateTblCustom() {
            const baseDate = getTblBaseDate();
            const dose = getTblCustomDaysDose();
            const weeklyDose = getTblCustomDaysWeeklyDose();
            const days = parseInt(tblCustomDays.value);
            const pillStr = window.currentLang === 'EN' ? 'pills' : 'เม็ด';

            if (baseDate && !isNaN(days) && days > 0) {
                const targetDate = new Date(baseDate);
                targetDate.setDate(targetDate.getDate() + days);
                tblCustomDateResult.textContent = formatThaiDateShort(targetDate);
                
                if (!isNaN(dose) && dose > 0) {
                    const pills = calcTotalPills(days, dose);
                    tblCustomPillResult.textContent = `${pills} ${pillStr}`;
                } else {
                    tblCustomPillResult.textContent = `- ${pillStr}`;
                }

                if (tblCustomWeeklyPillResult) {
                    if (!isNaN(weeklyDose) && weeklyDose > 0) {
                        const weeklyPills = ceilPills(weeklyDose * (days / 7));
                        tblCustomWeeklyPillResult.textContent = `${weeklyPills} ${pillStr}`;
                    } else {
                        tblCustomWeeklyPillResult.textContent = `- ${pillStr}`;
                    }
                }
            } else {
                tblCustomDateResult.textContent = '-';
                tblCustomPillResult.textContent = `- ${pillStr}`;
                if (tblCustomWeeklyPillResult) tblCustomWeeklyPillResult.textContent = `- ${pillStr}`;
            }
        }

        tblDoseDropdown.addEventListener('change', (e) => {
            if (e.target.value === 'custom') {
                tblDoseCustom.classList.remove('hidden');
            } else {
                tblDoseCustom.classList.add('hidden');
                tblDoseCustom.value = '';
            }
            generateTable();
        });
        tblDoseCustom.addEventListener('input', generateTable);

        if (tblWeeklyDoseDropdown) {
            tblWeeklyDoseDropdown.addEventListener('change', (e) => {
                if (e.target.value === 'custom') {
                    if (tblWeeklyDoseCustom) tblWeeklyDoseCustom.classList.remove('hidden');
                } else {
                    if (tblWeeklyDoseCustom) {
                        tblWeeklyDoseCustom.classList.add('hidden');
                        tblWeeklyDoseCustom.value = '';
                    }
                }
                generateTable();
            });
        }
        if (tblWeeklyDoseCustom) tblWeeklyDoseCustom.addEventListener('input', generateTable);

        if (tblCustomDaysDoseDropdown) {
            tblCustomDaysDoseDropdown.addEventListener('change', (e) => {
                if (e.target.value === 'custom') {
                    if (tblCustomDaysDoseCustom) tblCustomDaysDoseCustom.classList.remove('hidden');
                } else {
                    if (tblCustomDaysDoseCustom) {
                        tblCustomDaysDoseCustom.classList.add('hidden');
                        tblCustomDaysDoseCustom.value = '';
                    }
                }
                calculateTblCustom();
            });
        }
        if (tblCustomDaysDoseCustom) tblCustomDaysDoseCustom.addEventListener('input', calculateTblCustom);

        if (tblCustomDaysWeeklyDoseDropdown) {
            tblCustomDaysWeeklyDoseDropdown.addEventListener('change', (e) => {
                if (e.target.value === 'custom') {
                    if (tblCustomDaysWeeklyDoseCustom) tblCustomDaysWeeklyDoseCustom.classList.remove('hidden');
                } else {
                    if (tblCustomDaysWeeklyDoseCustom) {
                        tblCustomDaysWeeklyDoseCustom.classList.add('hidden');
                        tblCustomDaysWeeklyDoseCustom.value = '';
                    }
                }
                calculateTblCustom();
            });
        }
        if (tblCustomDaysWeeklyDoseCustom) tblCustomDaysWeeklyDoseCustom.addEventListener('input', calculateTblCustom);

        tblBaseDay.addEventListener('input', generateTable);
        tblBaseMonth.addEventListener('change', generateTable);
        tblBaseYear.addEventListener('input', generateTable);
        tblCustomDays.addEventListener('input', calculateTblCustom);

        // Initial generate
        generateTable();
    }

    // -------------------------------------------------------------
    // 9. User Manual Modal
    // -------------------------------------------------------------
    const manualModal = document.getElementById('manualModal');
    const btnOpenManuals = document.querySelectorAll('.btnOpenManual');
    const btnCloseManualTop = document.getElementById('btnCloseManualTop');
    const btnCloseManualBottom = document.getElementById('btnCloseManualBottom');

    function openManual() {
        if (manualModal) {
            manualModal.classList.remove('hidden');
            document.body.style.overflow = 'hidden'; // prevent background scroll
        }
    }

    function closeManual() {
        if (manualModal) {
            manualModal.classList.add('hidden');
            document.body.style.overflow = ''; // restore scroll
        }
    }

    if (btnOpenManuals.length > 0) {
        btnOpenManuals.forEach(btn => btn.addEventListener('click', openManual));
    }
    if (btnCloseManualTop) btnCloseManualTop.addEventListener('click', closeManual);
    if (btnCloseManualBottom) btnCloseManualBottom.addEventListener('click', closeManual);

    if (manualModal) {
        manualModal.addEventListener('click', (e) => {
            if (e.target === manualModal) closeManual();
        });
    }

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            if (manualModal && !manualModal.classList.contains('hidden')) {
                closeManual();
            }
            if (typeof closeCoffee === 'function' && document.getElementById('coffeeModal') && !document.getElementById('coffeeModal').classList.contains('hidden')) {
                closeCoffee();
            }
        }
    });

    // -------------------------------------------------------------
    // 10. Hamburger Mobile Menu
    // -------------------------------------------------------------
    const btnHamburger = document.getElementById('btnHamburger');
    const mobileMenu = document.getElementById('mobileMenu');
    const hamburgerIcon = document.getElementById('hamburgerIcon');
    const mobileNavLinks = document.querySelectorAll('.mobile-nav-link');

    function toggleMobileMenu() {
        if (!mobileMenu || !hamburgerIcon) return;
        const isHidden = mobileMenu.classList.contains('hidden');
        if (isHidden) {
            mobileMenu.classList.remove('hidden');
            hamburgerIcon.classList.remove('ph-list');
            hamburgerIcon.classList.add('ph-x');
        } else {
            closeMobileMenu();
        }
    }

    function closeMobileMenu() {
        if (!mobileMenu || !hamburgerIcon) return;
        mobileMenu.classList.add('hidden');
        hamburgerIcon.classList.remove('ph-x');
        hamburgerIcon.classList.add('ph-list');
    }

    if (btnHamburger) {
        btnHamburger.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleMobileMenu();
        });
    }

    if (mobileNavLinks.length > 0) {
        mobileNavLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                const href = link.getAttribute('href');
                if (href && href.startsWith('#')) {
                    e.preventDefault();
                    closeMobileMenu();
                    const targetEl = document.querySelector(href);
                    if (targetEl) {
                        setTimeout(() => {
                            targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
                        }, 50);
                    }
                } else {
                    closeMobileMenu();
                }
            });
        });
    }

    document.addEventListener('click', (e) => {
        if (mobileMenu && !mobileMenu.classList.contains('hidden') && e.target !== btnHamburger && !btnHamburger.contains(e.target) && !mobileMenu.contains(e.target)) {
            closeMobileMenu();
        }
    });

    // -------------------------------------------------------------
    // 11. Coffee Modal
    // -------------------------------------------------------------
    const coffeeModal = document.getElementById('coffeeModal');
    const btnOpenCoffees = document.querySelectorAll('.btnOpenCoffee');
    const btnCloseCoffeeTop = document.getElementById('btnCloseCoffeeTop');

    function openCoffee() {
        if (coffeeModal) {
            coffeeModal.classList.remove('hidden');
            document.body.style.overflow = 'hidden'; // prevent background scroll
        }
    }

    // Exposed to the global scope for the escape key listener above
    window.closeCoffee = function() {
        if (coffeeModal) {
            coffeeModal.classList.add('hidden');
            document.body.style.overflow = ''; // restore scroll
        }
    }

    if (btnOpenCoffees.length > 0) {
        btnOpenCoffees.forEach(btn => btn.addEventListener('click', openCoffee));
    }
    if (btnCloseCoffeeTop) btnCloseCoffeeTop.addEventListener('click', closeCoffee);

    if (coffeeModal) {
        coffeeModal.addEventListener('click', (e) => {
            if (e.target === coffeeModal) closeCoffee();
        });
    }

    // -------------------------------------------------------------
    // 12. Oseltamivir Calculator
    // -------------------------------------------------------------
    const oselIndications = document.querySelectorAll('input[name="oselIndication"]');
    const oselAge = document.getElementById('oselAge');
    const oselAgeUnit = document.getElementById('oselAgeUnit');
    const oselWeight = document.getElementById('oselWeight');
    
    const oselAlert = document.getElementById('oselAlert');
    const oselDoseResult = document.getElementById('oselDoseResult');
    const oselVolumeResult = document.getElementById('oselVolumeResult');
    const oselFrequencyResult = document.getElementById('oselFrequencyResult');
    const oselBottlesResult = document.getElementById('oselBottlesResult');

    function calculateOseltamivir() {
        if (!oselAge || !oselWeight || !oselDoseResult) return;

        let indication = 'treatment';
        oselIndications.forEach(radio => {
            if (radio.checked) indication = radio.value;
        });

        const ageVal = parseFloat(oselAge.value);
        const ageUnit = oselAgeUnit.value;
        const weight = parseFloat(oselWeight.value);

        if (isNaN(ageVal) || ageVal < 0) {
            resetOseltamivir();
            return;
        }

        // Convert age to months for easy comparison
        const ageInMonths = ageUnit === 'years' ? ageVal * 12 : ageVal;
        const result = calcOseltamivirDose({ indication, ageInMonths, weight });

        if (!result) {
            resetOseltamivir();
            return;
        }

        if (result.notRecommended) {
            oselAlert.classList.remove('hidden');
            oselDoseResult.textContent = '-';
            oselVolumeResult.textContent = '-';
            if(oselFrequencyResult) oselFrequencyResult.textContent = '-';
            oselBottlesResult.textContent = '-';
        } else {
            oselAlert.classList.add('hidden');
            const { dose, volumeMl: volume, frequency, bottles } = result;

            // Format numbers to 1 decimal place if needed
            const formattedDose = Number.isInteger(dose) ? dose.toFixed(1) : dose.toFixed(1);
            const formattedVolume = Number.isInteger(volume) ? volume.toFixed(1) : volume.toFixed(1);
            const freqText = frequency === 2 ? (window.currentLang === 'EN' ? 'Twice daily' : 'วันละ 2 ครั้ง') : (window.currentLang === 'EN' ? 'Once daily' : 'วันละ 1 ครั้ง');

            oselDoseResult.textContent = formattedDose;
            oselVolumeResult.textContent = formattedVolume;
            if(oselFrequencyResult) oselFrequencyResult.textContent = freqText;
            oselBottlesResult.textContent = bottles;
        }
    }

    function resetOseltamivir() {
        if (oselAlert) oselAlert.classList.add('hidden');
        if (oselDoseResult) {
            oselDoseResult.textContent = '-';
            oselVolumeResult.textContent = '-';
            if(oselFrequencyResult) oselFrequencyResult.textContent = '-';
            oselBottlesResult.textContent = '-';
        }
    }

    if (oselIndications.length > 0) {
        oselIndications.forEach(radio => radio.addEventListener('change', calculateOseltamivir));
    }
    if (oselAge) oselAge.addEventListener('input', calculateOseltamivir);
    if (oselAgeUnit) oselAgeUnit.addEventListener('change', calculateOseltamivir);
    if (oselWeight) oselWeight.addEventListener('input', calculateOseltamivir);

    // -------------------------------------------------------------
    // 13. Renal Dose Adjustment Calculator
    // -------------------------------------------------------------
    const renalAge = document.getElementById('renalAge');
    const renalWeight = document.getElementById('renalWeight');
    const renalGenders = document.querySelectorAll('input[name="renalGender"]');
    const renalSCr = document.getElementById('renalSCr');
    const renalIndications = document.querySelectorAll('input[name="renalIndication"]');
    const renalDialysis = document.getElementById('renalDialysis');
    
    const renalCrClResult = document.getElementById('renalCrClResult');
    const renalEgfrResult = document.getElementById('renalEgfrResult');
    const renalEgfrStage = document.getElementById('renalEgfrStage');
    const renalDoseResult = document.getElementById('renalDoseResult');

    function calculateRenalOseltamivir() {
        if (!renalAge || !renalWeight || !renalSCr || !renalCrClResult || !renalDoseResult) return;

        const age = parseFloat(renalAge.value);
        const weight = parseFloat(renalWeight.value);
        const scr = parseFloat(renalSCr.value);

        let gender = 'male';
        renalGenders.forEach(radio => { if (radio.checked) gender = radio.value; });

        let indication = 'treatment';
        renalIndications.forEach(radio => { if (radio.checked) indication = radio.value; });

        const dialysis = renalDialysis.value;

        const crcl = cockcroftGault({ age, weight, scr, gender });
        const egfr = ckdEpi2021({ age, scr, gender });

        // Reset if inputs are missing or invalid
        if (crcl === null || egfr === null) {
            renalCrClResult.innerHTML = `- <span class="text-base sm:text-lg">mL/min</span>`;
            if (renalEgfrResult) renalEgfrResult.innerHTML = `- <span class="text-base sm:text-lg">mL/min/1.73m²</span>`;
            if (renalEgfrStage) renalEgfrStage.textContent = '';
            renalDoseResult.textContent = '-';
            renalDoseResult.className = "font-bold text-gray-400 text-lg md:text-xl text-center";
            return;
        }

        // 1. CrCl (Cockcroft-Gault) & eGFR (CKD-EPI 2021)
        renalCrClResult.innerHTML = `${crcl.toFixed(1)} <span class="text-base sm:text-lg">mL/min</span>`;
        if (renalEgfrResult) {
            renalEgfrResult.innerHTML = `${egfr.toFixed(1)} <span class="text-base sm:text-lg">mL/min/1.73m²</span>`;
        }
        if (renalEgfrStage) {
            const st = getCkdStage(egfr);
            const isEn = (window.currentLang || 'TH') === 'EN';
            renalEgfrStage.textContent = `Stage: ${st.stage} (${isEn ? st.descEN : st.descTH})`;
        }

        // 2. Determine Dose
        const { text: recommendation, notRecommended: isNotRecommended } =
            renalOseltamivirRecommendation({ crcl, indication, dialysis });

        renalDoseResult.textContent = recommendation;
        
        if (isNotRecommended) {
            renalDoseResult.className = "font-bold text-red-600 text-lg md:text-xl text-center";
        } else {
            renalDoseResult.className = "font-bold text-blue-700 text-lg md:text-xl text-center";
        }
    }

    if (renalAge) renalAge.addEventListener('input', calculateRenalOseltamivir);
    if (renalWeight) renalWeight.addEventListener('input', calculateRenalOseltamivir);
    if (renalSCr) renalSCr.addEventListener('input', calculateRenalOseltamivir);
    if (renalDialysis) renalDialysis.addEventListener('change', calculateRenalOseltamivir);

    if (renalGenders.length > 0) {
        renalGenders.forEach(radio => radio.addEventListener('change', calculateRenalOseltamivir));
    }
    if (renalIndications.length > 0) {
        renalIndications.forEach(radio => radio.addEventListener('change', calculateRenalOseltamivir));
    }

    // -------------------------------------------------------------
    // 14. Contraceptive Injection Calculator
    // -------------------------------------------------------------
    const contraDay = document.getElementById('contraDay');
    const contraMonth = document.getElementById('contraMonth');
    const contraYear = document.getElementById('contraYear');
    const contraDatePicker = document.getElementById('contraDatePicker');
    const contraResult = document.getElementById('contraResult');
    const contraResultPicker = document.getElementById('contraResultPicker');
    const contraTypes = document.getElementsByName('contraType');
    const contraWeekendWarning = document.getElementById('contraWeekendWarning');
    const contraWeekendText = document.getElementById('contraWeekendText');
    const btnContraToFri = document.getElementById('btnContraToFri');
    const btnContraToMon = document.getElementById('btnContraToMon');
    let contraShiftOffset = 0;

    // Initialize with today's date
    const todayContra = getToday();
    if (contraDay) {
        syncDateToFields(todayContra, contraDay, contraMonth, contraYear);
        if (contraDatePicker) contraDatePicker.value = toISODate(todayContra);
    }

    function calculateContraceptive(keepShift) {
        if (!contraDay || !contraMonth || !contraYear || !contraResult) return;
        if (!keepShift) contraShiftOffset = 0;

        const cd = parseInt(contraDay.value);
        const cm = parseInt(contraMonth.value);
        const cyBE = parseInt(contraYear.value);

        if (isNaN(cd) || isNaN(cm) || isNaN(cyBE)) {
            contraResult.textContent = '-';
            if (contraDatePicker) contraDatePicker.value = '';
            if (contraResultPicker) contraResultPicker.value = '';
            if (contraWeekendWarning) contraWeekendWarning.classList.add('hidden');
            return;
        }

        const baseDate = new Date(toCEYear(cyBE), cm - 1, cd);
        if (isNaN(baseDate.getTime())) {
            contraResult.textContent = '-';
            if (contraWeekendWarning) contraWeekendWarning.classList.add('hidden');
            return;
        }

        if (contraDatePicker) contraDatePicker.value = toISODate(baseDate);

        let selectedType = '1month';
        const checkedRadio = document.querySelector('input[name="contraType"]:checked');
        if (checkedRadio) selectedType = checkedRadio.value;

        const nextAppt = calcContraceptiveNextDate(baseDate, selectedType, contraShiftOffset);

        contraResult.textContent = formatThaiDateShortWithDay(nextAppt);
        if (contraResultPicker) contraResultPicker.value = toISODate(nextAppt);

        checkWeekendAndWarn(nextAppt, contraWeekendWarning, contraWeekendText, btnContraToFri, btnContraToMon, (diff) => {
            contraShiftOffset += diff;
            calculateContraceptive(true);
        });
    }

    if (contraDay) contraDay.addEventListener('input', () => calculateContraceptive(false));
    if (contraMonth) contraMonth.addEventListener('change', () => calculateContraceptive(false));
    if (contraYear) contraYear.addEventListener('input', () => calculateContraceptive(false));

    if (contraDatePicker) {
        contraDatePicker.addEventListener('change', (e) => {
            const d = parseDateStr(e.target.value);
            if (d) {
                syncDateToFields(d, contraDay, contraMonth, contraYear);
                calculateContraceptive(false);
            }
        });
    }

    if (contraTypes.length > 0) {
        contraTypes.forEach(radio => radio.addEventListener('change', () => calculateContraceptive(false)));
    }

    // Initial calculation on load
    calculateContraceptive();

    // -------------------------------------------------------------
    // 15. Language Button Listeners
    // -------------------------------------------------------------
    document.querySelectorAll('.btnLangTH').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            setLanguage('TH');
        });
    });
    document.querySelectorAll('.btnLangEN').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            setLanguage('EN');
        });
    });

    // -------------------------------------------------------------
    // 16. Copy Result & Reset Calculator Features + Toast Notification
    // -------------------------------------------------------------
    let toastTimeout = null;
    function showToast(msg) {
        let toast = document.getElementById('emc-toast');
        if (!toast) {
            toast = document.createElement('div');
            toast.id = 'emc-toast';
            toast.className = 'fixed bottom-6 left-1/2 -translate-x-1/2 z-[120] bg-[#102727] text-white px-4 py-2.5 rounded-full shadow-xl border border-white/20 text-xs sm:text-sm font-bold flex items-center gap-2 transition-all duration-200 opacity-0 pointer-events-none translate-y-2';
            document.body.appendChild(toast);
        }
        toast.innerHTML = `<i class="ph-fill ph-check-circle text-emerald-400 text-lg"></i> <span>${msg}</span>`;
        toast.classList.remove('opacity-0', 'translate-y-2');
        toast.classList.add('opacity-100', 'translate-y-0');
        if (toastTimeout) clearTimeout(toastTimeout);
        toastTimeout = setTimeout(() => {
            toast.classList.remove('opacity-100', 'translate-y-0');
            toast.classList.add('opacity-0', 'translate-y-2');
        }, 2000);
    }

    function copyTextToClipboard(text, btnEl) {
        if (!text || text.trim() === '-' || text.includes(': -')) return;
        const doFeedback = () => {
            const lang = window.currentLang || 'TH';
            showToast(translations[lang].toast_copied || 'คัดลอกผลลัพธ์แล้ว');
            if (btnEl) {
                const labelSpan = btnEl.querySelector('[data-i18n="btn_copy"]');
                const iconEl = btnEl.querySelector('i');
                if (labelSpan) labelSpan.textContent = translations[lang].btn_copied || 'คัดลอกแล้ว!';
                if (iconEl) iconEl.className = 'ph-bold ph-check text-emerald-700 text-sm';
                btnEl.classList.add('bg-emerald-50', 'border-emerald-400', 'text-emerald-800');
                setTimeout(() => {
                    const curLang = window.currentLang || 'TH';
                    if (labelSpan) labelSpan.textContent = translations[curLang].btn_copy || 'คัดลอกผลลัพธ์';
                    if (iconEl) iconEl.className = 'ph-bold ph-copy text-sm';
                    btnEl.classList.remove('bg-emerald-50', 'border-emerald-400', 'text-emerald-800');
                }, 1600);
            }
        };

        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(text).then(doFeedback).catch(() => {
                fallbackCopy(text);
                doFeedback();
            });
        } else {
            fallbackCopy(text);
            doFeedback();
        }
    }

    function fallbackCopy(text) {
        const ta = document.createElement('textarea');
        ta.value = text;
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.select();
        try { document.execCommand('copy'); } catch (e) {}
        document.body.removeChild(ta);
    }

    // Helper to format ISO YYYYMMDD for ICS and Google Calendar
    function formatCalDate(d) {
        if (!d || isNaN(d)) return '';
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${y}${m}${day}`;
    }

    // Open Google Calendar event creation URL
    function openGoogleCalendar(title, dateObj, details) {
        if (!dateObj || isNaN(dateObj)) return;
        const dt = formatCalDate(dateObj);
        const nextD = new Date(dateObj);
        nextD.setDate(nextD.getDate() + 1);
        const dtEnd = formatCalDate(nextD);
        const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&dates=${dt}/${dtEnd}&details=${encodeURIComponent(details || '')}&sf=true&output=xml`;
        window.open(url, '_blank');
    }

    // Download an .ics file for Apple/Outlook/Google Calendar
    function downloadICS(title, dateObj, details) {
        if (!dateObj || isNaN(dateObj)) return;
        const dt = formatCalDate(dateObj);
        const nextD = new Date(dateObj);
        nextD.setDate(nextD.getDate() + 1);
        const dtEnd = formatCalDate(nextD);
        const icsData = [
            'BEGIN:VCALENDAR',
            'VERSION:2.0',
            'PRODID:-//EasyMedCal//Medical Appointment//TH',
            'CALSCALE:GREGORIAN',
            'BEGIN:VEVENT',
            `SUMMARY:${title}`,
            `DESCRIPTION:${(details || '').replace(/\n/g, '\\n')}`,
            `DTSTART;VALUE=DATE:${dt}`,
            `DTEND;VALUE=DATE:${dtEnd}`,
            'STATUS:CONFIRMED',
            'END:VEVENT',
            'END:VCALENDAR'
        ].join('\r\n');

        const blob = new Blob([icsData], { type: 'text/calendar;charset=utf-8' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `appointment-${dt}.ics`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(link.href);
    }

    function initCopyAndResetFeatures() {
        const lang = window.currentLang || 'TH';
        const copyLabel = translations[lang].btn_copy || 'คัดลอกผลลัพธ์';
        const resetLabel = translations[lang].btn_reset || 'ล้างค่า';

        const cardConfigs = [
            {
                sectionId: 'section-date-diff',
                getCopyText: () => {
                    const res = dateDiffResult ? dateDiffResult.textContent.trim() : '-';
                    if (res.startsWith('-')) return '';
                    return window.currentLang === 'EN' ? `Appointment Interval: ${res}` : `ระยะห่างวันนัด: ${res}`;
                },
                onReset: () => {
                    const t = getToday();
                    syncDateToFields(t, diffStartDayInput, diffStartMonthInput, diffStartYearInput);
                    if (diffStartDatePicker) diffStartDatePicker.value = toISODate(t);
                    diffDayInput.value = '';
                    diffMonthInput.value = '';
                    diffYearInput.value = '';
                    calculateDateDiff();
                }
            },
            {
                sectionId: 'section-medication',
                getCopyText: () => {
                    const res = medResult ? medResult.textContent.trim() : '-';
                    if (res.startsWith('-')) return '';
                    const days = medDaysInput ? medDaysInput.value : '';
                    return window.currentLang === 'EN'
                        ? `Daily Medication (${days} days): Dispense ${res}`
                        : `คำนวณยารายวัน (${days} วัน): จ่ายยา ${res}`;
                },
                onReset: () => {
                    const t = getToday();
                    syncDateToFields(t, medDailyStartDay, medDailyStartMonth, medDailyStartYear);
                    if (medDailyStartPicker) medDailyStartPicker.value = toISODate(t);
                    medDailyEndDay.value = '';
                    medDailyEndMonth.value = '1';
                    medDailyEndYear.value = '';
                    if (medDailyEndPicker) medDailyEndPicker.value = '';
                    medDaysInput.value = '';
                    medDoseDropdown.value = '';
                    medDoseCustom.value = '';
                    medDoseCustom.classList.add('hidden');
                    calculateMedication();
                }
            },
            {
                sectionId: 'section-medication-weekly',
                getCopyText: () => {
                    const res = medWeeklyResult ? medWeeklyResult.innerText.replace(/\s+/g, ' ').trim() : '-';
                    if (res.startsWith('-')) return '';
                    const dur = medWeeklyDuration ? medWeeklyDuration.innerText.replace(/\s+/g, ' ').trim() : '';
                    return window.currentLang === 'EN'
                        ? `Weekly Medication (${dur}): Dispense ${res}`
                        : `คำนวณยารายสัปดาห์ (${dur}): จ่ายยา ${res}`;
                },
                onReset: () => {
                    const t = getToday();
                    syncDateToFields(t, medWeeklyStartDay, medWeeklyStartMonth, medWeeklyStartYear);
                    if (medWeeklyStartPicker) medWeeklyStartPicker.value = toISODate(t);
                    medWeeklyEndDay.value = '';
                    medWeeklyEndMonth.value = '1';
                    medWeeklyEndYear.value = '';
                    if (medWeeklyEndPicker) medWeeklyEndPicker.value = '';
                    medWeeklyDose.value = '';
                    medWeeklyDoseCustom.value = '';
                    medWeeklyDoseCustom.classList.add('hidden');
                    document.querySelectorAll('.med-weekly-day').forEach(cb => { cb.checked = false; });
                    calculateWeeklyMedication();
                }
            },
            {
                sectionId: 'section-appt-days',
                getCopyText: () => {
                    const res = apptDaysResult ? apptDaysResult.textContent.trim() : '-';
                    if (res === '-') return '';
                    const days = apptDaysInput ? apptDaysInput.value : '';
                    return window.currentLang === 'EN'
                        ? `Next Appointment (${days} days): ${res}`
                        : `วันนัดหมาย (${days} วัน): ${res}`;
                },
                getCalEvent: () => {
                    if (!apptDaysResultPicker || !apptDaysResultPicker.value) return null;
                    const d = parseDateStr(apptDaysResultPicker.value);
                    const isEn = (window.currentLang || 'TH') === 'EN';
                    const days = apptDaysInput ? apptDaysInput.value : '';
                    return {
                        title: isEn ? 'Medical Appointment' : 'นัดหมายแพทย์/โรงพยาบาล',
                        date: d,
                        details: isEn ? `Follow-up appointment (+${days} days)` : `นัดตรวจติดตามอาการ (+${days} วัน)`
                    };
                },
                onReset: () => {
                    apptDaysInput.value = '';
                    calculateApptDays();
                }
            },
            {
                sectionId: 'section-appt-weeks',
                getCopyText: () => {
                    const res = apptWeeksResult ? apptWeeksResult.textContent.trim() : '-';
                    if (res === '-') return '';
                    const wks = apptWeeksInput ? apptWeeksInput.value : '';
                    return window.currentLang === 'EN'
                        ? `Next Appointment (${wks} weeks): ${res}`
                        : `วันนัดหมาย (${wks} สัปดาห์): ${res}`;
                },
                getCalEvent: () => {
                    if (!apptWeeksResultPicker || !apptWeeksResultPicker.value) return null;
                    const d = parseDateStr(apptWeeksResultPicker.value);
                    const isEn = (window.currentLang || 'TH') === 'EN';
                    const wks = apptWeeksInput ? apptWeeksInput.value : '';
                    return {
                        title: isEn ? 'Medical Appointment' : 'นัดหมายแพทย์/โรงพยาบาล',
                        date: d,
                        details: isEn ? `Follow-up appointment (+${wks} weeks)` : `นัดตรวจติดตามอาการ (+${wks} สัปดาห์)`
                    };
                },
                onReset: () => {
                    apptWeeksInput.value = '';
                    calculateApptWeeks();
                }
            },
            {
                sectionId: 'section-age',
                getCopyText: () => {
                    const res = ageResult ? ageResult.textContent.trim() : '-';
                    if (res === '-') return '';
                    return window.currentLang === 'EN' ? `Age: ${res}` : `อายุ: ${res}`;
                },
                onReset: () => {
                    ageDayInput.value = '';
                    ageMonthInput.value = '';
                    ageYearInput.value = '';
                    calculateAge();
                }
            },
            {
                sectionId: 'section-year',
                getCopyText: () => {
                    const be = yearBEInput ? yearBEInput.value : '';
                    const ce = yearCEInput ? yearCEInput.value : '';
                    if (!be && !ce) return '';
                    return `พ.ศ. ${be} / ค.ศ. ${ce}`;
                },
                onReset: () => {
                    yearBEInput.value = '';
                    yearCEInput.value = '';
                }
            },
            {
                sectionId: 'section-vaccine',
                getCopyText: () => {
                    const res = vaccineResult ? vaccineResult.innerText.replace(/\n+/g, ' ').trim() : '-';
                    if (res === '-') return '';
                    const vName = vaccineType && vaccineType.selectedOptions[0] ? vaccineType.selectedOptions[0].textContent : '';
                    return window.currentLang === 'EN'
                        ? `Vaccine Schedule (${vName}): ${res}`
                        : `นัดฉีดวัคซีน (${vName}): ${res}`;
                },
                getCalEvent: () => {
                    if (!vaccineResultPicker || !vaccineResultPicker.value) return null;
                    const d = parseDateStr(vaccineResultPicker.value);
                    const isEn = (window.currentLang || 'TH') === 'EN';
                    const vName = vaccineType && vaccineType.selectedOptions[0] ? vaccineType.selectedOptions[0].textContent : '';
                    const cleanRes = vaccineResult ? vaccineResult.innerText.replace(/\n+/g, ' ').trim() : '';
                    return {
                        title: isEn ? `Vaccination: ${vName}` : `นัดฉีดวัคซีน: ${vName}`,
                        date: d,
                        details: `${vName}\n${cleanRes}`
                    };
                },
                onReset: () => {
                    vaccineType.value = '';
                    populateVaccineDoses();
                    vaccineDay.value = '';
                    vaccineMonth.value = '';
                    vaccineYear.value = '';
                    calculateVaccine();
                }
            },
            {
                sectionId: 'section-appt-table',
                getCopyText: () => {
                    const dt = tblCustomDateResult ? tblCustomDateResult.textContent.trim() : '-';
                    if (dt === '-') return '';
                    const d = tblCustomDays ? tblCustomDays.value : '';
                    const daily = tblCustomPillResult ? tblCustomPillResult.textContent.trim() : '-';
                    const weekly = tblCustomWeeklyPillResult ? tblCustomWeeklyPillResult.textContent.trim() : '-';
                    return window.currentLang === 'EN'
                        ? `Appointment (${d} days): ${dt} | Daily: ${daily} | Weekly: ${weekly}`
                        : `นัด ${d} วัน (${dt}) | ยารายวัน: ${daily} | ยารายสัปดาห์: ${weekly}`;
                },
                onReset: () => {
                    const t = getToday();
                    syncDateToFields(t, tblBaseDay, tblBaseMonth, tblBaseYear);
                    tblDoseDropdown.value = '1';
                    tblDoseCustom.value = '';
                    tblDoseCustom.classList.add('hidden');
                    if (document.getElementById('tblWeeklyDoseDropdown')) {
                        document.getElementById('tblWeeklyDoseDropdown').value = '';
                    }
                    if (tblWeeklyDoseCustom) {
                        tblWeeklyDoseCustom.value = '';
                        tblWeeklyDoseCustom.classList.add('hidden');
                    }
                    if (tblCustomDays) tblCustomDays.value = '';
                    if (typeof generateTable === 'function') generateTable();
                }
            },
            {
                sectionId: 'section-oseltamivir',
                getCopyText: () => {
                    const dose = oselDoseResult ? oselDoseResult.textContent.trim() : '-';
                    if (dose === '-') return '';
                    const vol = oselVolumeResult ? oselVolumeResult.textContent.trim() : '-';
                    const freq = oselFrequencyResult ? oselFrequencyResult.textContent.trim() : '-';
                    const btl = oselBottlesResult ? oselBottlesResult.textContent.trim() : '-';
                    return `Oseltamivir: ${dose} mg (${vol} mL) ${freq} - Total ${btl} bottle(s)`;
                },
                onReset: () => {
                    if (oselAge) oselAge.value = '';
                    if (oselWeight) oselWeight.value = '';
                    if (oselAgeUnit) oselAgeUnit.value = 'years';
                    if (oselIndications[0]) oselIndications[0].checked = true;
                    calculateOseltamivir();
                }
            },
            {
                sectionId: 'section-renal-osel',
                getCopyText: () => {
                    const crcl = renalCrClResult ? renalCrClResult.innerText.trim() : '-';
                    const egfr = renalEgfrResult ? renalEgfrResult.innerText.trim() : '-';
                    const rec = renalDoseResult ? renalDoseResult.textContent.trim() : '-';
                    if (rec === '-') return '';
                    return `Kidney Function: CrCl ${crcl}, eGFR ${egfr} | Oseltamivir Dose: ${rec}`;
                },
                onReset: () => {
                    if (renalAge) renalAge.value = '';
                    if (renalWeight) renalWeight.value = '';
                    if (renalSCr) renalSCr.value = '';
                    if (renalDialysis) renalDialysis.value = 'none';
                    if (renalGenders[0]) renalGenders[0].checked = true;
                    if (renalIndications[0]) renalIndications[0].checked = true;
                    calculateRenalOseltamivir();
                }
            },
            {
                sectionId: 'section-contraceptive',
                getCopyText: () => {
                    const res = contraResult ? contraResult.textContent.trim() : '-';
                    if (res === '-') return '';
                    const checkedRadio = document.querySelector('input[name="contraType"]:checked');
                    const is1M = !checkedRadio || checkedRadio.value === '1month';
                    const typeStr = window.currentLang === 'EN'
                        ? (is1M ? '1-Month (28d)' : '3-Month (84d)')
                        : (is1M ? '1 เดือน (28 วัน)' : '3 เดือน (84 วัน)');
                    return window.currentLang === 'EN'
                        ? `Next Contraceptive Injection (${typeStr}): ${res}`
                        : `วันนัดฉีดยาคุม (${typeStr}): ${res}`;
                },
                getCalEvent: () => {
                    if (!contraResultPicker || !contraResultPicker.value) return null;
                    const d = parseDateStr(contraResultPicker.value);
                    const isEn = (window.currentLang || 'TH') === 'EN';
                    const checkedRadio = document.querySelector('input[name="contraType"]:checked');
                    const is1M = !checkedRadio || checkedRadio.value === '1month';
                    const typeStr = isEn
                        ? (is1M ? '1-Month (28d)' : '3-Month (84d)')
                        : (is1M ? 'ยาคุมชนิด 1 เดือน (28 วัน)' : 'ยาคุมชนิด 3 เดือน (84 วัน)');
                    return {
                        title: isEn ? `Contraceptive Injection (${typeStr})` : `นัดฉีดยาคุมกำเนิด (${typeStr})`,
                        date: d,
                        details: isEn ? `Next DMPA injection appointment (${typeStr})` : `วันนัดรับการฉีดยาคุมกำเนิดรอบถัดไป (${typeStr})`
                    };
                },
                onReset: () => {
                    const t = getToday();
                    syncDateToFields(t, contraDay, contraMonth, contraYear);
                    if (contraDatePicker) contraDatePicker.value = toISODate(t);
                    if (contraTypes[0]) contraTypes[0].checked = true;
                    calculateContraceptive();
                }
            }
        ];

        cardConfigs.forEach(cfg => {
            const sec = document.getElementById(cfg.sectionId);
            if (!sec) return;

            // 1. Add Reset button in card header
            const headerBar = sec.querySelector('.bg-cardinner');
            if (headerBar && !headerBar.querySelector('.btn-card-reset')) {
                headerBar.classList.add('relative', 'pr-12');
                const resetBtn = document.createElement('button');
                resetBtn.type = 'button';
                resetBtn.className = 'btn-card-reset absolute right-3 top-1/2 -translate-y-1/2 inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold text-textdark/70 hover:text-textdark bg-black/5 hover:bg-black/10 transition';
                resetBtn.title = resetLabel;
                resetBtn.innerHTML = `<i class="ph-bold ph-arrow-counter-clockwise text-sm"></i> <span data-i18n="btn_reset" class="hidden sm:inline">${resetLabel}</span>`;
                resetBtn.addEventListener('click', () => {
                    cfg.onReset();
                    const curLang = window.currentLang || 'TH';
                    showToast(translations[curLang].toast_reset || 'ล้างข้อมูลเรียบร้อยแล้ว');
                });
                headerBar.appendChild(resetBtn);
            }

            // 2. Add Action Buttons (Copy, Calendar, ICS) in result box
            const resultBoxes = sec.querySelectorAll('.bg-resultbg');
            const targetResultBox = resultBoxes.length > 0 ? resultBoxes[resultBoxes.length - 1] : null;
            if (targetResultBox && !targetResultBox.querySelector('.btn-card-copy')) {
                const actionWrap = document.createElement('div');
                actionWrap.className = 'mt-3 pt-2 border-t border-black/10 flex flex-wrap justify-center items-center gap-2 w-full';
                
                // Copy Button
                const copyBtn = document.createElement('button');
                copyBtn.type = 'button';
                copyBtn.className = 'btn-card-copy inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-white/85 hover:bg-white text-textdark shadow-sm border border-black/10 transition';
                copyBtn.innerHTML = `<i class="ph-bold ph-copy text-sm"></i> <span data-i18n="btn_copy">${copyLabel}</span>`;
                copyBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const text = cfg.getCopyText();
                    if (text) {
                        copyTextToClipboard(text, copyBtn);
                    }
                });
                actionWrap.appendChild(copyBtn);

                // Calendar & ICS Buttons (if this card produces an appointment date)
                if (typeof cfg.getCalEvent === 'function') {
                    const addCalLabel = translations[lang].btn_add_cal || 'ลงปฏิทิน';
                    const icsLabel = translations[lang].btn_ics || 'ไฟล์ .ics';

                    // Google Calendar Button
                    const calBtn = document.createElement('button');
                    calBtn.type = 'button';
                    calBtn.className = 'btn-card-cal inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#1a5b4b]/10 hover:bg-[#1a5b4b]/20 text-[#1a5b4b] shadow-sm border border-[#1a5b4b]/20 transition';
                    calBtn.innerHTML = `<i class="ph-bold ph-calendar-plus text-sm"></i> <span data-i18n="btn_add_cal">${addCalLabel}</span>`;
                    calBtn.addEventListener('click', (e) => {
                        e.stopPropagation();
                        const ev = cfg.getCalEvent();
                        if (ev && ev.date) {
                            openGoogleCalendar(ev.title, ev.date, ev.details);
                        } else {
                            showToast(window.currentLang === 'EN' ? 'No appointment date set' : 'ยังไม่ได้ระบุวันนัดหมาย');
                        }
                    });
                    actionWrap.appendChild(calBtn);

                    // .ICS Download Button
                    const icsBtn = document.createElement('button');
                    icsBtn.type = 'button';
                    icsBtn.className = 'btn-card-ics inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#1a5b4b]/10 hover:bg-[#1a5b4b]/20 text-[#1a5b4b] shadow-sm border border-[#1a5b4b]/20 transition';
                    icsBtn.innerHTML = `<i class="ph-bold ph-download-simple text-sm"></i> <span data-i18n="btn_ics">${icsLabel}</span>`;
                    icsBtn.addEventListener('click', (e) => {
                        e.stopPropagation();
                        const ev = cfg.getCalEvent();
                        if (ev && ev.date) {
                            downloadICS(ev.title, ev.date, ev.details);
                            showToast(window.currentLang === 'EN' ? 'Downloaded .ics file' : 'ดาวน์โหลดไฟล์ปฏิทิน (.ics) แล้ว');
                        } else {
                            showToast(window.currentLang === 'EN' ? 'No appointment date set' : 'ยังไม่ได้ระบุวันนัดหมาย');
                        }
                    });
                    actionWrap.appendChild(icsBtn);
                }

                targetResultBox.appendChild(actionWrap);
            }
        });
    }

    // Initial render for Quick Glance, Presets & Copy/Reset Controls
    if (window.currentLang === 'EN') {
        setLanguage('EN');
    } else {
        renderQuickGlanceWidget();
        updatePresetLabels();
    }
    initCopyAndResetFeatures();

}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initEasyMedCal);
} else {
    initEasyMedCal();
}
