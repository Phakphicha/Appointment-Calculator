document.addEventListener('DOMContentLoaded', () => {
    // -------------------------------------------------------------
    // Initialization & Theme Handling
    // -------------------------------------------------------------
    const themeToggle = document.getElementById('themeToggle');
    const htmlElement = document.documentElement;
    
    // Check local storage for theme, otherwise default to light
    if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        htmlElement.classList.add('dark');
    } else {
        htmlElement.classList.remove('dark');
    }

    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            if (htmlElement.classList.contains('dark')) {
                htmlElement.classList.remove('dark');
                localStorage.theme = 'light';
            } else {
                htmlElement.classList.add('dark');
                localStorage.theme = 'dark';
            }
        });
    }

    // Set current year in Footer
    const currentYearBE = new Date().getFullYear() + 543;
    const yearSpan = document.getElementById('currentYearBE');
    if (yearSpan) yearSpan.textContent = currentYearBE;

    // -------------------------------------------------------------
    // Utilities
    // -------------------------------------------------------------
    
    // Format Date to Thai Buddhist Era string (e.g. วันจันทร์ที่ 15 มีนาคม 2569)
    function formatThaiDate(date) {
        if (!date || isNaN(date)) return '-';
        return new Intl.DateTimeFormat('th-TH', { 
            weekday: 'long',
            day: 'numeric', 
            month: 'long', 
            year: 'numeric' 
        }).format(date);
    }

    // Format Date to short Thai Buddhist Era string (e.g. 15 มี.ค. 69)
    function formatThaiDateShort(date) {
        if (!date || isNaN(date)) return '-';
        return new Intl.DateTimeFormat('th-TH', { 
            day: 'numeric', 
            month: 'short', 
            year: '2-digit' 
        }).format(date);
    }

    // Format Date to short Thai Buddhist Era string with day (e.g. วันพุธที่ 15 ก.ค. 69)
    function formatThaiDateShortWithDay(date) {
        if (!date || isNaN(date)) return '-';
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

    // Get today's date at midnight for accurate day difference calculations
    function getToday() {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return today;
    }

    // Parse input date (which is usually in YYYY-MM-DD from CE datepicker)
    function parseDateStr(dateStr) {
        if (!dateStr) return null;
        const d = new Date(dateStr);
        d.setHours(0, 0, 0, 0);
        return d;
    }

    // Format Date to YYYY-MM-DD for native input[type=date]
    function toISODate(date) {
        if (!date || isNaN(date)) return '';
        const y = date.getFullYear();
        const m = String(date.getMonth() + 1).padStart(2, '0');
        const d = String(date.getDate()).padStart(2, '0');
        return `${y}-${m}-${d}`;
    }

    // Helper to sync native date picker -> 3 fields
    function syncDateToFields(dateObj, dayInput, monthInput, yearInput) {
        if (dateObj && !isNaN(dateObj)) {
            dayInput.value = dateObj.getDate();
            monthInput.value = dateObj.getMonth() + 1;
            yearInput.value = dateObj.getFullYear() + 543; // to BE
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
            const startDate = (!isNaN(sd) && !isNaN(sm) && !isNaN(syBE)) ? new Date(syBE - 543, sm - 1, sd) : getToday();
            const targetDate = new Date(yBE - 543, m - 1, d);
            
            // Sync to the hidden date picker
            if (diffStartDatePicker) diffStartDatePicker.value = toISODate(startDate);
            diffDatePicker.value = toISODate(targetDate);
            
            const diffTime = Math.abs(targetDate - startDate);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            dateDiffResult.textContent = `${diffDays} วัน`;
            
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
            dateDiffResult.textContent = '- วัน';
            diffDatePicker.value = '';
        }
    }

    diffDayInput.addEventListener('input', calculateDateDiff);
    diffMonthInput.addEventListener('change', calculateDateDiff);
    diffYearInput.addEventListener('input', calculateDateDiff);
    
    if (diffStartDayInput) {
        [diffStartDayInput, diffStartMonthInput, diffStartYearInput].forEach(el => el.addEventListener('input', calculateDateDiff));
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
            const startDate = new Date(syBE - 543, sm - 1, sd);
            const endDate = new Date(eyBE - 543, em - 1, ed);
            
            if (medDailyStartPicker) medDailyStartPicker.value = toISODate(startDate);
            if (medDailyEndPicker) medDailyEndPicker.value = toISODate(endDate);
            
            const diffTime = endDate - startDate;
            if (diffTime >= 0) {
                const totalDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                medDaysInput.value = totalDays;
                medDaysInput.dispatchEvent(new Event('input'));
            }
        }
    }

    if (medDailyStartDay) {
        [medDailyStartDay, medDailyStartMonth, medDailyStartYear].forEach(el => el.addEventListener('input', calculateMedDaysFromDates));
        [medDailyEndDay, medDailyEndMonth, medDailyEndYear].forEach(el => el.addEventListener('input', calculateMedDaysFromDates));

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

        if (!isNaN(days) && !isNaN(dose) && days > 0 && dose > 0) {
            const totalPills = Math.ceil(days * dose);
            medResult.textContent = `${totalPills} เม็ด`;
        } else {
            medResult.textContent = '- เม็ด';
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
    // 3. Next Appointment by Days
    // -------------------------------------------------------------
    const apptDaysInput = document.getElementById('apptDays');
    const apptDaysResult = document.getElementById('apptDaysResult');
    const apptDaysResultPicker = document.getElementById('apptDaysResultPicker');

    apptDaysInput.addEventListener('input', (e) => {
        const days = parseInt(e.target.value);
        if (!isNaN(days) && days > 0) {
            const nextDate = getToday();
            nextDate.setDate(nextDate.getDate() + days);
            apptDaysResult.textContent = formatThaiDateShortWithDay(nextDate);
            apptDaysResultPicker.value = toISODate(nextDate);
        } else {
            apptDaysResult.textContent = '-';
            apptDaysResultPicker.value = '';
        }
    });

    // -------------------------------------------------------------
    // 4. Next Appointment by Weeks
    // -------------------------------------------------------------
    const apptWeeksInput = document.getElementById('apptWeeks');
    const apptWeeksResult = document.getElementById('apptWeeksResult');
    const apptWeeksResultPicker = document.getElementById('apptWeeksResultPicker');

    apptWeeksInput.addEventListener('input', (e) => {
        const weeks = parseInt(e.target.value);
        if (!isNaN(weeks) && weeks > 0) {
            const nextDate = getToday();
            nextDate.setDate(nextDate.getDate() + (weeks * 7));
            apptWeeksResult.textContent = formatThaiDateShortWithDay(nextDate);
            apptWeeksResultPicker.value = toISODate(nextDate);
        } else {
            apptWeeksResult.textContent = '-';
            apptWeeksResultPicker.value = '';
        }
    });

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
            const startDate = new Date(syBE - 543, sm - 1, sd);
            const endDate = new Date(eyBE - 543, em - 1, ed);
            
            medWeeklyStartPicker.value = toISODate(startDate);
            medWeeklyEndPicker.value = toISODate(endDate);

            const diffTime = endDate - startDate;
            if (diffTime >= 0) {
                const totalDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                const totalWeeks = Math.ceil(totalDays / 7);
                
                const checkedDays = Array.from(document.querySelectorAll('.med-weekly-day:checked')).map(cb => parseInt(cb.value));
                let totalPills = 0;

                if (checkedDays.length > 0) {
                    let pillsPerDose = dosage / checkedDays.length;
                    let occurrences = 0;
                    
                    for (let i = 0; i <= totalDays; i++) {
                        let current = new Date(startDate);
                        current.setDate(startDate.getDate() + i);
                        if (checkedDays.includes(current.getDay())) {
                            occurrences++;
                        }
                    }
                    totalPills = occurrences * pillsPerDose;
                    medWeeklyDuration.innerHTML = `${totalDays} วัน <br><span class="text-sm font-normal text-textdark/70">(ทานยาทั้งหมด ${occurrences} วัน)</span>`;
                    
                    const exactPills = Number.isInteger(totalPills) ? totalPills : parseFloat(totalPills.toFixed(2));
                    const roundedPills = Math.ceil(totalPills);
                    
                    if (roundedPills !== exactPills) {
                        medWeeklyResult.innerHTML = `${roundedPills} เม็ด <br><span class="text-base font-normal text-textdark/70">(จำนวนจริง: ${exactPills} เม็ด)</span>`;
                    } else {
                        medWeeklyResult.textContent = `${exactPills} เม็ด`;
                    }
                } else {
                    totalPills = totalWeeks * dosage;
                    medWeeklyDuration.innerHTML = `${totalDays} วัน <br><span class="text-sm font-normal text-textdark/70">(ประมาณ ${totalWeeks} สัปดาห์)</span>`;
                    medWeeklyResult.textContent = `${totalPills} เม็ด`;
                }
            } else {
                medWeeklyDuration.textContent = '-';
                medWeeklyResult.textContent = '- เม็ด';
            }
        } else {
            medWeeklyDuration.textContent = '-';
            medWeeklyResult.textContent = '- เม็ด';
        }
    }

    [medWeeklyStartDay, medWeeklyStartMonth, medWeeklyStartYear].forEach(el => el.addEventListener('input', calculateWeeklyMedication));
    [medWeeklyEndDay, medWeeklyEndMonth, medWeeklyEndYear].forEach(el => el.addEventListener('input', calculateWeeklyMedication));
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
            const yCE = yBE - 543;
            // Note: Month is 0-indexed in Date constructor
            const birthDate = new Date(yCE, m - 1, d);
            const today = new Date();

            if (birthDate > today) {
                ageResult.textContent = "วันเกิดต้องไม่เกินปัจจุบัน";
                return;
            }

            let ageY = today.getFullYear() - birthDate.getFullYear();
            let ageM = today.getMonth() - birthDate.getMonth();
            let ageD = today.getDate() - birthDate.getDate();

            if (ageD < 0) {
                ageM--;
                // Get days in previous month
                const prevMonth = new Date(today.getFullYear(), today.getMonth(), 0);
                ageD += prevMonth.getDate();
            }
            if (ageM < 0) {
                ageY--;
                ageM += 12;
            }

            ageResult.textContent = `${ageY} ปี ${ageM} เดือน ${ageD} วัน`;
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

    const vaccineRules = {
        'HBV': { doses: [ { val: '1', text: 'เข็ม 1' }, { val: '2', text: 'เข็ม 2' } ] },
        'HPV': { doses: [ { val: '1', text: 'เข็ม 1' }, { val: '2', text: 'เข็ม 2' } ] },
        'HAV': { doses: [ { val: '1', text: 'เข็ม 1' } ] },
        'VZV': { doses: [ { val: '1', text: 'เข็ม 1' } ] },
        'RZV': { doses: [ { val: '1', text: 'เข็ม 1' } ] },
        'MMR': { doses: [ { val: '1', text: 'เข็ม 1' } ] },
        'DENGUE': { doses: [ { val: '1', text: 'เข็ม 1' } ] },
        'RABIES': { doses: [ { val: '0', text: 'ผู้ที่ไม่เคยฉีดมาก่อน (5 เข็ม)' }, { val: '1', text: 'ผู้ที่เคยฉีดมาแล้ว (กระตุ้น 2 เข็ม)' } ] }
    };

    const vaccineDateLabel = document.getElementById('vaccineDateLabel');

    vaccineType.addEventListener('change', (e) => {
        const type = e.target.value;
        vaccineDose.innerHTML = '<option value="">-- เลือกเข็ม --</option>';
        
        if (type && vaccineRules[type]) {
            vaccineDose.disabled = false;
            vaccineRules[type].doses.forEach(d => {
                const opt = document.createElement('option');
                opt.value = d.val;
                opt.textContent = d.text;
                vaccineDose.appendChild(opt);
            });
            
            if (vaccineDateLabel) {
                if (type === 'RABIES') {
                    vaccineDateLabel.textContent = 'วันที่เริ่มฉีด (Day 0) / ฉีดเข็มล่าสุด (พ.ศ.)';
                } else {
                    vaccineDateLabel.textContent = 'วันที่ฉีดเข็มล่าสุด (พ.ศ.)';
                }
            }
        } else {
            vaccineDose.disabled = true;
            if (vaccineDateLabel) vaccineDateLabel.textContent = 'วันที่ฉีดเข็มล่าสุด (พ.ศ.)';
        }
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
            const yCE = yBE - 543;
            const vDate = new Date(yCE, m - 1, d);
            
            // Sync hidden date picker
            vaccineDatePicker.value = toISODate(vDate);

            const nextAppt = new Date(vDate);
            let resultHTML = '';
            let pickerDate = nextAppt;
            
            switch (type) {
                case 'RABIES':
                    if (dose === '0') {
                        const dose2 = new Date(vDate); dose2.setDate(dose2.getDate() + 3);
                        const dose3 = new Date(vDate); dose3.setDate(dose3.getDate() + 7);
                        const dose4 = new Date(vDate); dose4.setDate(dose4.getDate() + 14);
                        const dose5 = new Date(vDate); dose5.setDate(dose5.getDate() + 28);
                        resultHTML = renderVaccineDose('เข็ม 1 (Day 0)', formatThaiDateShortWithDay(vDate)) +
                                     renderVaccineDose('เข็ม 2 (Day 3)', formatThaiDateShortWithDay(dose2)) +
                                     renderVaccineDose('เข็ม 3 (Day 7)', formatThaiDateShortWithDay(dose3)) +
                                     renderVaccineDose('เข็ม 4 (Day 14)', formatThaiDateShortWithDay(dose4)) +
                                     renderVaccineDose('เข็ม 5 (Day 28)', formatThaiDateShortWithDay(dose5));
                        pickerDate = dose2;
                        vaccineNote.textContent = '(ฉีดแบบ IM 5 เข็ม)';
                    } else if (dose === '1') {
                        const dose2 = new Date(vDate); dose2.setDate(dose2.getDate() + 3);
                        resultHTML = renderVaccineDose('เข็ม 1 (Day 0)', formatThaiDateShortWithDay(vDate)) +
                                     renderVaccineDose('เข็ม 2 (Day 3)', formatThaiDateShortWithDay(dose2));
                        pickerDate = dose2;
                        vaccineNote.textContent = '(กระตุ้น 2 เข็ม)';
                    }
                    break;
                case 'HBV':
                    if (dose === '1') {
                        const dose2 = new Date(vDate); dose2.setMonth(dose2.getMonth() + 1);
                        const dose3 = new Date(vDate); dose3.setMonth(dose3.getMonth() + 6);
                        resultHTML = renderVaccineDose('เข็ม 2', formatThaiDateShortWithDay(dose2)) +
                                     renderVaccineDose('เข็ม 3', formatThaiDateShortWithDay(dose3));
                        pickerDate = dose2;
                        vaccineNote.textContent = '(เข็ม 2 ห่างจากเข็ม 1 = 1 เดือน, เข็ม 3 ห่างจากเข็ม 1 = 6 เดือน)';
                    } else if (dose === '2') {
                        nextAppt.setMonth(nextAppt.getMonth() + 5); 
                        resultHTML = renderVaccineDose('เข็ม 3', formatThaiDateShortWithDay(nextAppt));
                        vaccineNote.textContent = '(เข็ม 3 ห่างจากเข็ม 1 = 6 เดือน)';
                    }
                    break;
                case 'HPV':
                    if (dose === '1') {
                        const dose2 = new Date(vDate); dose2.setMonth(dose2.getMonth() + 2);
                        const dose3 = new Date(vDate); dose3.setMonth(dose3.getMonth() + 6);
                        resultHTML = renderVaccineDose('เข็ม 2', formatThaiDateShortWithDay(dose2)) +
                                     renderVaccineDose('เข็ม 3', formatThaiDateShortWithDay(dose3));
                        pickerDate = dose2;
                        vaccineNote.textContent = '(เข็ม 2 ห่างจากเข็ม 1 = 2 เดือน, เข็ม 3 ห่างจากเข็ม 1 = 6 เดือน)';
                    } else if (dose === '2') {
                        nextAppt.setMonth(nextAppt.getMonth() + 4);
                        resultHTML = renderVaccineDose('เข็ม 3', formatThaiDateShortWithDay(nextAppt));
                        vaccineNote.textContent = '(เข็ม 3 ห่างจากเข็ม 1 = 6 เดือน)';
                    }
                    break;
                case 'HAV':
                    if (dose === '1') {
                        nextAppt.setMonth(nextAppt.getMonth() + 6);
                        resultHTML = renderVaccineDose('เข็ม 2', formatThaiDateShortWithDay(nextAppt));
                        vaccineNote.textContent = 'เข็ม 2 ห่างจากเข็ม 1 = 6 เดือน';
                    }
                    break;
                case 'VZV':
                    if (dose === '1') {
                        nextAppt.setDate(nextAppt.getDate() + 28);
                        resultHTML = renderVaccineDose('เข็ม 2', formatThaiDateShortWithDay(nextAppt));
                        vaccineNote.textContent = 'เข็ม 2 ห่างจากเข็ม 1 = 4 สัปดาห์ (หรือ 1 เดือน)';
                    }
                    break;
                case 'MMR':
                    if (dose === '1') {
                        nextAppt.setDate(nextAppt.getDate() + 28);
                        resultHTML = renderVaccineDose('เข็ม 2', formatThaiDateShortWithDay(nextAppt));
                        vaccineNote.textContent = 'เข็ม 2 ห่างจากเข็ม 1 = 4 สัปดาห์';
                    }
                    break;
                case 'RZV':
                    if (dose === '1') {
                        nextAppt.setMonth(nextAppt.getMonth() + 2);
                        resultHTML = renderVaccineDose('เข็ม 2', formatThaiDateShortWithDay(nextAppt));
                        vaccineNote.textContent = 'เข็ม 2 ห่างจากเข็ม 1 = 2 เดือน';
                    }
                    break;
                case 'DENGUE':
                    if (dose === '1') {
                        nextAppt.setMonth(nextAppt.getMonth() + 3);
                        resultHTML = renderVaccineDose('เข็ม 2', formatThaiDateShortWithDay(nextAppt));
                        vaccineNote.textContent = 'เข็ม 2 ห่างจากเข็ม 1 = 3 เดือน';
                    }
                    break;
            }
            
            if (resultHTML) {
                vaccineResult.innerHTML = `<div class="w-full">${resultHTML}</div>`;
            } else {
                vaccineResult.innerHTML = renderVaccineDose('เข็มถัดไป', formatThaiDateShortWithDay(nextAppt));
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
        const tblToday = new Date();
        tblBaseDay.value = tblToday.getDate();
        tblBaseMonth.value = tblToday.getMonth() + 1;
        tblBaseYear.value = tblToday.getFullYear() + 543;

        function getTblBaseDate() {
            const d = parseInt(tblBaseDay.value);
            const m = parseInt(tblBaseMonth.value);
            const yBE = parseInt(tblBaseYear.value);
            if (isNaN(d) || isNaN(m) || isNaN(yBE)) return null;
            return new Date(yBE - 543, m - 1, d);
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
                tblBody.innerHTML = `<tr><td colspan="4" class="px-6 py-4 text-center text-gray-500">กรุณากรอกวันที่และขนาดยาให้ครบถ้วน</td></tr>`;
                return;
            }

            let html = '';
            for (let week = 1; week <= 24; week++) {
                const days = week * 7;
                const targetDate = new Date(baseDate);
                targetDate.setDate(targetDate.getDate() + days);
                
                const pills = (!isNaN(dose) && dose > 0) ? Math.ceil(dose * days) : '-';
                const weeklyPills = (!isNaN(weeklyDose) && weeklyDose > 0) ? Math.ceil(weeklyDose * week) : '-';
                
                // Zebra striping classes
                const bgClass = week % 2 === 0 ? 'bg-panelbg/5' : 'bg-white';

                html += `
                    <tr class="border-b border-gray-200 hover:bg-resultbg/50 transition ${bgClass}">
                        <td class="px-1 md:px-6 py-2 md:py-3 text-center font-medium"><div class="flex flex-col items-center whitespace-nowrap"><span>${week} สัปดาห์</span><span class="text-[10px] md:text-xs text-gray-500">(${days} วัน)</span></div></td>
                        <td class="px-1 md:px-6 py-2 md:py-3 text-center whitespace-nowrap">${formatThaiDateShort(targetDate)}</td>
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

            if (baseDate && !isNaN(days) && days > 0) {
                const targetDate = new Date(baseDate);
                targetDate.setDate(targetDate.getDate() + days);
                tblCustomDateResult.textContent = formatThaiDateShort(targetDate);
                
                if (!isNaN(dose) && dose > 0) {
                    const pills = Math.ceil(dose * days);
                    tblCustomPillResult.textContent = `${pills} เม็ด`;
                } else {
                    tblCustomPillResult.textContent = '- เม็ด';
                }

                if (tblCustomWeeklyPillResult) {
                    if (!isNaN(weeklyDose) && weeklyDose > 0) {
                        const weeklyPills = Math.ceil(weeklyDose * (days / 7));
                        tblCustomWeeklyPillResult.textContent = `${weeklyPills} เม็ด`;
                    } else {
                        tblCustomWeeklyPillResult.textContent = '- เม็ด';
                    }
                }
            } else {
                tblCustomDateResult.textContent = '-';
                tblCustomPillResult.textContent = '- เม็ด';
                if (tblCustomWeeklyPillResult) tblCustomWeeklyPillResult.textContent = '- เม็ด';
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
            link.addEventListener('click', closeMobileMenu);
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
        const isAdult = ageInMonths >= 13 * 12;

        // Weight is not required for adults (>= 13 years)
        if (!isAdult && (isNaN(weight) || weight <= 0)) {
            resetOseltamivir();
            return;
        }

        let dose = 0;
        let showNotRecommended = false;

        if (indication === 'prophylaxis' && ageInMonths < 3) {
            showNotRecommended = true;
        } else if (isAdult) {
            // Age 13+ gets adult dose regardless of weight
            dose = 75;
        } else if (ageInMonths < 12) {
            // Both Treatment and Prophylaxis: age < 1 year -> 3 mg/kg
            dose = weight * 3;
        } else {
            // age 1 to < 13 years
            if (weight <= 15) {
                dose = 30;
            } else if (weight > 15 && weight <= 23) {
                dose = 45;
            } else if (weight > 23 && weight <= 40) {
                dose = 60;
            } else {
                dose = 75;
            }
        }

        if (showNotRecommended) {
            oselAlert.classList.remove('hidden');
            oselDoseResult.textContent = '-';
            oselVolumeResult.textContent = '-';
            if(oselFrequencyResult) oselFrequencyResult.textContent = '-';
            oselBottlesResult.textContent = '-';
        } else {
            oselAlert.classList.add('hidden');
            
            // Concentration: 6 mg/ml
            const volume = dose / 6;
            
            // Bottles calculation
            const frequency = indication === 'treatment' ? 2 : 1;
            const days = indication === 'treatment' ? 5 : 10;
            const totalVolume = volume * frequency * days;
            const bottles = Math.ceil(totalVolume / 60);

            // Format numbers to 1 decimal place if needed
            const formattedDose = Number.isInteger(dose) ? dose.toFixed(1) : dose.toFixed(1);
            const formattedVolume = Number.isInteger(volume) ? volume.toFixed(1) : volume.toFixed(1);
            const freqText = frequency === 2 ? 'วันละ 2 ครั้ง' : 'วันละ 1 ครั้ง';

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

        // Reset if inputs are missing or invalid
        if (isNaN(age) || isNaN(weight) || isNaN(scr) || age <= 0 || weight <= 0 || scr <= 0) {
            renalCrClResult.innerHTML = `- <span class="text-lg">mL/min</span>`;
            renalDoseResult.textContent = '-';
            renalDoseResult.className = "font-bold text-gray-400 text-lg md:text-xl text-center";
            return;
        }

        // 1. Calculate CrCl using Cockcroft-Gault
        let crcl = ((140 - age) * weight) / (72 * scr);
        if (gender === 'female') {
            crcl *= 0.85;
        }

        // Display CrCl
        renalCrClResult.innerHTML = `${crcl.toFixed(1)} <span class="text-lg">mL/min</span>`;

        // 2. Determine Dose
        let recommendation = '';
        let isNotRecommended = false;

        switch (dialysis) {
            case 'hd':
                if (indication === 'treatment') {
                    recommendation = "30 mg immediately, then 30 mg after every hemodialysis cycle (max 5 days)";
                } else {
                    recommendation = "30 mg immediately, then 30 mg after alternate hemodialysis cycles";
                }
                break;
            case 'capd':
                if (indication === 'treatment') {
                    recommendation = "A single 30 mg dose";
                } else {
                    recommendation = "30 mg immediately, then 30 mg once weekly";
                }
                break;
            case 'esrd':
                recommendation = "TAMIFLU is not recommended";
                isNotRecommended = true;
                break;
            case 'none':
            default:
                if (crcl > 60) {
                    if (indication === 'treatment') {
                        recommendation = "75 mg twice daily for 5 days";
                    } else {
                        recommendation = "75 mg once daily";
                    }
                } else if (crcl > 30 && crcl <= 60) {
                    if (indication === 'treatment') {
                        recommendation = "30 mg twice daily for 5 days";
                    } else {
                        recommendation = "30 mg once daily";
                    }
                } else if (crcl > 10 && crcl <= 30) {
                    if (indication === 'treatment') {
                        recommendation = "30 mg once daily for 5 days";
                    } else {
                        recommendation = "30 mg every other day";
                    }
                } else {
                    recommendation = "TAMIFLU is not recommended";
                    isNotRecommended = true;
                }
                break;
        }

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

});
