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
    const diffDatePicker = document.getElementById('diffDatePicker');
    const dateDiffResult = document.getElementById('dateDiffResult');
    const medDaysInput = document.getElementById('medDays');

    function calculateDateDiff() {
        const d = parseInt(diffDayInput.value);
        const m = parseInt(diffMonthInput.value);
        const yBE = parseInt(diffYearInput.value);

        if (!isNaN(d) && !isNaN(m) && !isNaN(yBE)) {
            const yCE = yBE - 543;
            const targetDate = new Date(yCE, m - 1, d);
            const today = getToday();
            
            // Sync to the hidden date picker
            diffDatePicker.value = toISODate(targetDate);
            
            const diffTime = Math.abs(targetDate - today);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            dateDiffResult.textContent = `${diffDays} วัน`;
            
            // Auto-fill Med Days
            medDaysInput.value = diffDays;
            medDaysInput.dispatchEvent(new Event('input'));
        } else {
            dateDiffResult.textContent = '- วัน';
            diffDatePicker.value = '';
        }
    }

    diffDayInput.addEventListener('input', calculateDateDiff);
    diffMonthInput.addEventListener('change', calculateDateDiff);
    diffYearInput.addEventListener('input', calculateDateDiff);
    
    // Reverse sync: Date Picker -> Fields
    diffDatePicker.addEventListener('change', (e) => {
        const d = parseDateStr(e.target.value);
        syncDateToFields(d, diffDayInput, diffMonthInput, diffYearInput);
        calculateDateDiff();
    });

    // -------------------------------------------------------------
    // 2. Medication Calculator
    // -------------------------------------------------------------
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
            apptDaysResult.textContent = formatThaiDate(nextDate);
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
            apptWeeksResult.textContent = formatThaiDate(nextDate);
            apptWeeksResultPicker.value = toISODate(nextDate);
        } else {
            apptWeeksResult.textContent = '-';
            apptWeeksResultPicker.value = '';
        }
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
        'DENGUE': { doses: [ { val: '1', text: 'เข็ม 1' } ] }
    };

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
        } else {
            vaccineDose.disabled = true;
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
                case 'HBV':
                    if (dose === '1') {
                        const dose2 = new Date(vDate);
                        dose2.setMonth(dose2.getMonth() + 1); // 1 month after dose 1
                        const dose3 = new Date(vDate);
                        dose3.setMonth(dose3.getMonth() + 6); // 6 months after dose 1
                        resultHTML = `<div class="text-xl md:text-2xl font-bold text-textdark">เข็ม 2: ${formatThaiDate(dose2)}</div><div class="text-xl md:text-2xl font-bold text-textdark">เข็ม 3: ${formatThaiDate(dose3)}</div>`;
                        pickerDate = dose2;
                        vaccineNote.textContent = '(เข็ม 2 ห่างจากเข็ม 1 = 1 เดือน, เข็ม 3 ห่างจากเข็ม 1 = 6 เดือน)';
                    } else if (dose === '2') {
                        nextAppt.setMonth(nextAppt.getMonth() + 5); 
                        vaccineNote.textContent = '(เข็ม 3 ห่างจากเข็ม 1 = 6 เดือน)';
                    }
                    break;
                case 'HPV':
                    if (dose === '1') {
                        const dose2 = new Date(vDate);
                        dose2.setMonth(dose2.getMonth() + 2); // 2 months after dose 1
                        const dose3 = new Date(vDate);
                        dose3.setMonth(dose3.getMonth() + 6); // 6 months after dose 1
                        resultHTML = `<div class="text-xl md:text-2xl font-bold text-textdark">เข็ม 2: ${formatThaiDate(dose2)}</div><div class="text-xl md:text-2xl font-bold text-textdark">เข็ม 3: ${formatThaiDate(dose3)}</div>`;
                        pickerDate = dose2;
                        vaccineNote.textContent = '(เข็ม 2 ห่างจากเข็ม 1 = 2 เดือน, เข็ม 3 ห่างจากเข็ม 1 = 6 เดือน)';
                    } else if (dose === '2') {
                        nextAppt.setMonth(nextAppt.getMonth() + 4);
                        vaccineNote.textContent = '(เข็ม 3 ห่างจากเข็ม 1 = 6 เดือน)';
                    }
                    break;
                case 'HAV':
                    if (dose === '1') {
                        nextAppt.setMonth(nextAppt.getMonth() + 6); // 6 months after dose 1
                        vaccineNote.textContent = '(เข็ม 2)';
                    }
                    break;
                case 'VZV':
                case 'MMR':
                    if (dose === '1') {
                        nextAppt.setDate(nextAppt.getDate() + 28); // 4 weeks
                        vaccineNote.textContent = '(เข็ม 2)';
                    }
                    break;
                case 'RZV':
                    if (dose === '1') {
                        nextAppt.setMonth(nextAppt.getMonth() + 2); // 2 months after dose 1
                        vaccineNote.textContent = '(เข็ม 2 ยืดหยุ่นได้ถึง 6 เดือน)';
                    }
                    break;
                case 'DENGUE':
                    if (dose === '1') {
                        nextAppt.setMonth(nextAppt.getMonth() + 3); // 3 months after dose 1
                        vaccineNote.textContent = '(เข็ม 2)';
                    }
                    break;
            }
            
            if (resultHTML) {
                vaccineResult.innerHTML = resultHTML;
            } else {
                vaccineResult.textContent = formatThaiDate(nextAppt);
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

});
