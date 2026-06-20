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
                        resultHTML = `<div class="text-base md:text-lg font-bold text-textdark text-left inline-block">
                            <div>เข็ม 2 (+3 วัน): ${formatThaiDate(dose2)}</div>
                            <div>เข็ม 3 (+7 วัน): ${formatThaiDate(dose3)}</div>
                            <div>เข็ม 4 (+14 วัน): ${formatThaiDate(dose4)}</div>
                            <div>เข็ม 5 (+28 วัน): ${formatThaiDate(dose5)}</div>
                        </div>`;
                        pickerDate = dose2;
                        vaccineNote.textContent = '(ฉีดแบบ IM 5 เข็ม)';
                    } else if (dose === '1') {
                        const dose2 = new Date(vDate); dose2.setDate(dose2.getDate() + 3);
                        resultHTML = `<div class="text-xl md:text-2xl font-bold text-textdark">เข็ม 2 (+3 วัน): ${formatThaiDate(dose2)}</div>`;
                        pickerDate = dose2;
                        vaccineNote.textContent = '(กระตุ้น 2 เข็ม)';
                    }
                    break;
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

    // ----------------------------------------
    // 8. Appointment & Medication Table
    // ----------------------------------------
    const tblBaseDay = document.getElementById('tblBaseDay');
    const tblBaseMonth = document.getElementById('tblBaseMonth');
    const tblBaseYear = document.getElementById('tblBaseYear');
    const tblDoseDropdown = document.getElementById('tblDoseDropdown');
    const tblDoseCustom = document.getElementById('tblDoseCustom');
    const tblBody = document.getElementById('tblBody');
    
    const tblCustomDays = document.getElementById('tblCustomDays');
    const tblCustomDateResult = document.getElementById('tblCustomDateResult');
    const tblCustomPillResult = document.getElementById('tblCustomPillResult');

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

        function generateTable() {
            const baseDate = getTblBaseDate();
            const dose = getTblDose();

            if (!baseDate || isNaN(dose) || dose <= 0) {
                tblBody.innerHTML = `<tr><td colspan="3" class="px-6 py-4 text-center text-gray-500">กรุณากรอกวันที่และขนาดยาให้ครบถ้วน</td></tr>`;
                return;
            }

            let html = '';
            for (let week = 1; week <= 24; week++) {
                const days = week * 7;
                const targetDate = new Date(baseDate);
                targetDate.setDate(targetDate.getDate() + days);
                
                const pills = Math.ceil(dose * days);
                
                // Zebra striping classes
                const bgClass = week % 2 === 0 ? 'bg-panelbg/5' : 'bg-white';

                html += `
                    <tr class="border-b border-gray-200 hover:bg-resultbg/50 transition ${bgClass}">
                        <td class="px-1 md:px-6 py-2 md:py-3 text-center font-medium">${week} สัปดาห์<br><span class="text-[10px] md:text-xs text-gray-500">(${days} วัน)</span></td>
                        <td class="px-1 md:px-6 py-2 md:py-3 text-center whitespace-nowrap">${formatThaiDateShort(targetDate)}</td>
                        <td class="px-1 md:px-6 py-2 md:py-3 text-center font-bold text-cardouter text-base md:text-lg">${pills}</td>
                    </tr>
                `;
            }
            tblBody.innerHTML = html;
            calculateTblCustom();
        }

        function calculateTblCustom() {
            const baseDate = getTblBaseDate();
            const dose = getTblDose();
            const days = parseInt(tblCustomDays.value);

            if (baseDate && !isNaN(dose) && dose > 0 && !isNaN(days) && days > 0) {
                const targetDate = new Date(baseDate);
                targetDate.setDate(targetDate.getDate() + days);
                const pills = Math.ceil(dose * days);

                tblCustomDateResult.textContent = formatThaiDateShort(targetDate);
                tblCustomPillResult.textContent = `${pills} เม็ด`;
            } else {
                tblCustomDateResult.textContent = '-';
                tblCustomPillResult.textContent = '- เม็ด';
            }
        }

        tblDoseDropdown.addEventListener('change', (e) => {
            if (e.target.value === 'custom') {
                tblDoseCustom.classList.remove('hidden');
            } else {
                tblDoseCustom.classList.add('hidden');
            }
            generateTable();
        });

        tblBaseDay.addEventListener('input', generateTable);
        tblBaseMonth.addEventListener('change', generateTable);
        tblBaseYear.addEventListener('input', generateTable);
        tblDoseCustom.addEventListener('input', generateTable);
        tblCustomDays.addEventListener('input', calculateTblCustom);

        // Initial generate
        generateTable();
    }

});
