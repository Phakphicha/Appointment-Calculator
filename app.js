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

    // -------------------------------------------------------------
    // Translations & i18n Engine
    // -------------------------------------------------------------
    const translations = {
        TH: {
            title_main: "โปรแกรมคำนวณวันนัดและปริมาณยา",
            tooltip_coffee: "สนับสนุนค่ากาแฟ",
            tooltip_help: "คู่มือการใช้งาน",
            nav_datediff: "คำนวณระยะห่างของวัน",
            nav_med: "คำนวณจำนวนยารายวัน",
            nav_apptdays: "คำนวณวันนัด (วัน)",
            nav_apptweeks: "คำนวณวันนัด (สัปดาห์)",
            nav_weeklymed: "คำนวณจำนวนยารายสัปดาห์",
            nav_age: "คำนวณอายุ",
            nav_year: "แปลงปี พ.ศ./ค.ศ.",
            nav_vaccine: "คำนวณวันนัดวัคซีน",
            nav_table: "ตารางคำนวณสำเร็จรูป",
            nav_osel: "คำนวณยา Oseltamivir",
            nav_renal: "Oseltamivir (Renal Dose)",
            nav_contra: "คำนวณวันนัดฉีดยาคุม",
            btn_coffee: "สนับสนุนค่ากาแฟ",
            btn_manual: "คู่มือการใช้งาน",
            // Section 1
            s1_title: "คำนวณระยะห่างของวัน",
            s1_start_label: "วันที่เริ่มต้น (Base Date)",
            s1_target_label: "วันที่เป้าหมาย (Target Date)",
            s1_result_label: "ระยะห่างทั้งหมด",
            // Section 2
            s2_title_1: "คำนวณจำนวนยารายวัน",
            s2_title_tag: "(สำหรับจ่ายยาวันต่อวัน)",
            s2_start_label: "วันที่เริ่มต้น",
            s2_end_label: "วันนัดหมาย",
            s2_days_label: "จำนวนวัน",
            s2_dose_label: "ขนาดยาที่แพทย์สั่งต่อวัน",
            s2_result_label: "จำนวนยาที่ต้องจ่ายรวม",
            // Section Weekly Med
            s_wm_title_1: "คำนวณจำนวนยารายสัปดาห์",
            s_wm_title_tag: "(สำหรับจ่ายยารายสัปดาห์)",
            s_wm_start_label: "วันที่เริ่มต้น",
            s_wm_end_label: "วันนัดหมาย",
            s_wm_dose_label: "จำนวนเม็ดยาต่อสัปดาห์",
            s_wm_days_check_label: "ระบุวันที่ทานยาในสัปดาห์ (เพื่อความแม่นยำ)",
            s_wm_total_time: "ระยะเวลาทั้งหมด: ",
            s_wm_total_pills: "จำนวนยาที่ต้องจ่ายรวม",
            // Section 3 & 4
            s3_title_1: "คำนวณวันนัด",
            s3_title_2: "จากจำนวนวัน",
            s3_days_label: "จำนวนวันนัด",
            s3_result_label: "วันที่นัดหมาย",
            s4_title_1: "คำนวณวันนัด",
            s4_title_2: "จากจำนวนสัปดาห์",
            s4_weeks_label: "จำนวนสัปดาห์",
            // Section 5 & 6
            s5_title: "คำนวณอายุ",
            s5_dob_label: "วัน/เดือน/ปีเกิด",
            s5_result_label: "อายุ",
            s6_title: "แปลงปี พ.ศ. / ค.ศ.",
            s6_be_label: "ปี พ.ศ.",
            s6_ce_label: "ปี ค.ศ.",
            // Section 7 Vaccine
            s7_title: "คำนวณวันนัดฉีดวัคซีนผู้ใหญ่",
            s7_type_label: "ชนิดวัคซีน",
            s7_dose_label: "เข็มที่ฉีดไปล่าสุด",
            s7_date_label: "วันที่ฉีดเข็มล่าสุด",
            s7_result_label: "วันนัดฉีดเข็มถัดไป",
            s7_ref_1: "การรับวัคซีนเลยกำหนดนัด สามารถให้วัคซีนต่อได้เลย โดยไม่ต้องเริ่มต้นนับใหม่",
            s7_ref_2: "การรับวัคซีนเร็วกว่ากำหนดนัด ในกรณีของวัคซีนชนิดเชื้อตาย พิจารณาให้ก่อนนัดได้ไม่เกิน 4 วัน สำหรับวัคซีนชนิดเชื้อมีชีวิตอ่อนฤทธิ์ ไม่แนะนำให้รับวัคซีนเร็วกว่ากำหนดนัด",
            s7_ref_source: "Reference: คำแนะนำการให้วัคซีนป้องกันโรคสำหรับผู้ใหญ่และผู้สูงอายุ สมาคมโรคติดเชื้อแห่งประเทศไทย พ.ศ. 2568",
            // Section 8 Table
            s8_title: "ตารางคำนวณวันนัดหมายและจำนวนยา",
            s8_base_label: "วันที่เริ่มต้น (Base Date)",
            s8_dose_daily_label: "ขนาดยาที่แพทย์สั่งต่อวัน",
            s8_dose_weekly_label: "ขนาดยาที่แพทย์สั่งต่อสัปดาห์",
            s8_th_time: "ระยะเวลา<br><span class=\"hidden md:inline\">(สัปดาห์ / วัน)</span><span class=\"md:hidden\">(วีค/วัน)</span>",
            s8_th_date: "วันที่นัดหมาย<br><span class=\"hidden md:inline\">(วัน/เดือน/ปี)</span>",
            s8_th_daily: "จำนวนยาที่ต้องจ่าย<br>(เม็ด)<br><span class=\"text-[8px] md:text-[10px] text-gray-400 font-normal\">*คำนวณจากขนาดยาที่แพทย์สั่งต่อวัน*</span>",
            s8_th_weekly: "จำนวนยาที่ต้องจ่าย<br>(เม็ด)<br><span class=\"text-[8px] md:text-[10px] text-gray-400 font-normal\">*คำนวณจากขนาดยาที่แพทย์สั่งต่อสัปดาห์*</span>",
            s8_custom_title: "คำนวณเฉพาะจำนวนวันที่ต้องการ (Custom Days)",
            s8_custom_days_label: "ระบุจำนวนวัน",
            s8_custom_date_label: "ตรงกับวันที่",
            s8_custom_daily_label: "จ่ายยารายวัน",
            s8_custom_weekly_label: "จ่ายยารายสัปดาห์",
            // Oseltamivir
            s_osel_title: "คำนวณยา Oseltamivir",
            s_osel_ind_label: "ข้อบ่งชี้ (Indication)",
            s_osel_ind_treat: "Treatment<br><span class=\"text-xs font-bold text-[#24917d]\">(5 days, Twice daily)</span>",
            s_osel_ind_proph: "Prophylaxis<br><span class=\"text-xs font-bold text-[#24917d]\">(10 days, Once daily)</span>",
            s_osel_age_label: "อายุ (Age)",
            s_osel_weight_label: "น้ำหนัก (Weight)",
            s_osel_weight_note: "*(ไม่ต้องระบุน้ำหนักสำหรับอายุ 13 ปีขึ้นไป)",
            s_osel_alert: "Not recommended สำหรับอายุต่ำกว่า 3 เดือน",
            s_osel_dose: "Dose (mg)",
            s_osel_vol: "Volume (ml)",
            s_osel_vol_note: "*Concentration: 6 mg/ml.",
            s_osel_freq: "Frequency",
            s_osel_bottles: "Total Bottles",
            s_osel_bottles_note: "Bottle size: 60 ml.",
            s_osel_ref: "Reference: CDC Antiviral Medications - Table 2. Recommended Dosage and Duration of Influenza Antiviral Medications",
            // Renal Oseltamivir
            s_ro_title: "คำนวณยา Oseltamivir",
            s_ro_sub: "(Renal Dose Adjustment)",
            s_ro_pt_data: "ข้อมูลผู้ป่วย (Patient Data)",
            s_ro_age: "อายุ (Age)",
            s_ro_weight: "น้ำหนัก (Weight)",
            s_ro_gender: "เพศ (Gender)",
            s_ro_male: "ชาย (Male)",
            s_ro_female: "หญิง (Female)",
            s_ro_scr: "Serum Creatinine (SCr)",
            s_ro_clin_data: "ข้อมูลทางคลินิก (Clinical Data)",
            s_ro_ind: "ข้อบ่งชี้ (Indication)",
            s_ro_dialysis: "สถานะการฟอกไต (Dialysis Status)",
            s_ro_crcl: "Calculated CrCl (Cockcroft-Gault)",
            s_ro_rec_dose: "Recommended Dose",
            s_ro_source: "Source: Recommended Dosage Modifications for Treatment and Prophylaxis of Influenza in Adults with Renal Impairment",
            // Contraceptive
            s_con_title: "คำนวณวันนัดฉีดยาคุม",
            s_con_base_label: "วันที่ฉีดเข็มล่าสุด",
            s_con_type_label: "ชนิดยาคุมกำเนิด",
            s_con_1m_title: "ชนิด 1 เดือน (28 วัน)",
            s_con_3m_title: "ชนิด 3 เดือน (84 วัน)",
            s_con_result_label: "วันที่นัดหมายครั้งถัดไป",
            // SEO & Footer
            seo_title: "ทำไมต้องให้ Easymedcal เป็นผู้ช่วยคู่ใจของคุณ?",
            seo_p1: "เราคือ โปรแกรมคำนวณวันนัดผู้ป่วย ที่สร้างขึ้นมาเพื่อช่วยแบ่งเบาภาระการทำงานของแพทย์ พยาบาล และเภสัชกร ให้คุณทำงานได้รวดเร็วและแม่นยำยิ่งขึ้น:",
            seo_li1: "<strong>คำนวณเป๊ะ ไม่มีพลาด:</strong> ด้วย <strong>วิธีคำนวณยาตามวัน</strong> ที่ช่วยให้คุณเช็ค <strong>ระยะห่างวัน</strong> ได้ทันทีโดยไม่ต้องเปิดปฏิทินนับเอง",
            seo_li2: "<strong>ฟีเจอร์ครบ จบในเว็บเดียว:</strong> มาพร้อม <strong>ตารางนัดฉีดวัคซีนผู้ใหญ่</strong> ที่อิงตามมาตรฐานการแพทย์ล่าสุด",
            seo_li3: "<strong>ใช้งานฟรี ไม่ต้องโหลดแอป:</strong> เปิดผ่านเบราว์เซอร์ในมือถือหรือคอมพิวเตอร์ แล้วเริ่มใช้งานได้เลย!",
            coffee_modal_title: "สนับสนุนค่ากาแฟ",
            coffee_modal_sub: "สนับสนุนค่ากาแฟเพื่อเป็นกำลังใจ ☕",
            coffee_modal_note: "สแกนผ่านแอปพลิเคชันธนาคารได้ทุกธนาคาร<br>ขอบคุณสำหรับทุกการสนับสนุนค่ะ 🙏",
            manual_modal_title: "คู่มือการใช้งานระบบ",
            btn_close_manual: "ปิดหน้าต่าง",
            day_mon: "จ.", day_tue: "อ.", day_wed: "พ.", day_thu: "พฤ.", day_fri: "ศ.", day_sat: "ส.", day_sun: "อา.",
            unit_day: "วัน", unit_week: "สัปดาห์",
            manual_1: "<span class=\"font-bold text-[#163333] block mb-1\">ฟีเจอร์คำนวณระยะห่างของวัน:</span> <span class=\"text-gray-600 text-sm sm:text-[15px]\">เลือกวันที่ต้องการจากปฏิทิน ระบบจะแสดงระยะห่างระหว่างวันนี้กับวันที่เลือกเป็นจำนวนวัน</span>",
            manual_2: "<span class=\"font-bold text-[#163333] block mb-1\">ฟีเจอร์คำนวณวันนัดจากจำนวนวัน/สัปดาห์:</span> <span class=\"text-gray-600 text-sm sm:text-[15px]\">กรอกจำนวนวันหรือสัปดาห์ที่ต้องการนัด ระบบจะคำนวณวันที่นัดหมายให้ทันที</span>",
            manual_3: "<span class=\"font-bold text-[#163333] block mb-1\">ฟีเจอร์ตารางคำนวณวันนัดหมายและจำนวนยาแบบสำเร็จรูป:</span> <span class=\"text-gray-600 text-sm sm:text-[15px]\">เลือกวันที่เริ่มต้นและขนาดยาต่อวัน ระบบจะสร้างตารางวันนัดล่วงหน้า 1-24 สัปดาห์ พร้อมคำนวณเม็ดยารวม (ปัดเศษขึ้นเป็นเม็ดเต็มเสมอ) มีช่องกรอกจำนวนวันแบบระบุเองด้านล่างตาราง</span>",
            manual_4: "<span class=\"font-bold text-[#163333] block mb-1\">ฟีเจอร์คำนวณจำนวนยารายสัปดาห์:</span> <span class=\"text-gray-600 text-sm sm:text-[15px]\">เลือกวันที่เริ่มต้นและวันนัดหมาย พร้อมระบุจำนวนยาที่ต้องทานต่อสัปดาห์ ระบบจะคำนวณจำนวนสัปดาห์และสรุปเม็ดยารวมที่ต้องจ่ายให้อัตโนมัติ</span>",
            manual_5: "<span class=\"font-bold text-[#163333] block mb-1\">ฟีเจอร์คำนวณอายุคนไข้:</span> <span class=\"text-gray-600 text-sm sm:text-[15px]\">กรอก วัน/เดือน/ปีเกิด (พ.ศ.) ระบบจะคำนวณอายุแบบละเอียด (ปี เดือน วัน)</span>",
            manual_6: "<span class=\"font-bold text-[#163333] block mb-1\">ฟีเจอร์แปลงปี พ.ศ. และ ค.ศ.:</span> <span class=\"text-gray-600 text-sm sm:text-[15px]\">กรอกตัวเลขปีเพื่อแปลงสลับระบบปีอัตโนมัติ</span>",
            manual_7: "<span class=\"font-bold text-[#163333] block mb-1\">ฟีเจอร์คำนวณวันนัดฉีดวัคซีน:</span> <span class=\"text-gray-600 text-sm sm:text-[15px]\">เลือกชนิดวัคซีนและประวัติการฉีด ระบบจะประมวลผลวันนัดหมายตามมาตรฐาน สำหรับวัคซีนทั่วไปจะระบุระยะห่างกำกับ สำหรับวัคซีนแบบซีรีส์ (เช่น พิษสุนัขบ้า) ระบบจะสร้างตารางนัดหมายให้ครบทุกเข็มพร้อมระบุ (Day X) อัตโนมัติ</span>",
            manual_8: "<span class=\"font-bold text-[#163333] block mb-1\">ฟีเจอร์ตัวช่วยคำนวณยา Oseltamivir:</span> <span class=\"text-gray-600 text-sm sm:text-[15px]\">ระบุน้ำหนักตัวหรืออายุของผู้ป่วย พร้อมเลือกรูปแบบการใช้ยา (รักษา หรือ ป้องกัน) ระบบจะประมวลผลขนาดยาที่ต้องรับประทานต่อมื้อ พร้อมสรุปปริมาณยารวมที่ต้องจ่ายให้อัตโนมัติอย่างแม่นยำ</span>",
            manual_9: "<span class=\"font-bold text-[#163333] block mb-1\">ฟีเจอร์คำนวณวันนัดฉีดยาคุม:</span> <span class=\"text-gray-600 text-sm sm:text-[15px]\">เลือกวันที่ฉีดเข็มล่าสุด และชนิดยาคุม (1 เดือน หรือ 3 เดือน) ระบบจะคำนวณวันนัดเข็มถัดไป (บวก 28 วัน หรือ 84 วัน)</span>",
            osel_title: "คำนวณยา Oseltamivir",
            renal_subtitle: "(Renal Dose Adjustment)",
            renal_patient_data: "ข้อมูลผู้ป่วย (Patient Data)",
            osel_age_label: "อายุ (Age)",
            osel_weight_label: "น้ำหนัก (Weight)",
            renal_gender: "เพศ (Gender)",
            renal_male: "ชาย (Male)",
            renal_female: "หญิง (Female)",
            osel_indication_label: "ข้อบ่งชี้ (Indication)",
            osel_ind_treatment: "Treatment",
            renal_ind_treatment_desc: "(5 days)",
            osel_ind_proph: "Prophylaxis",
            osel_ind_proph_desc: "(10 days)",
            renal_dialysis_status: "สถานะการฟอกไต (Dialysis Status)",
            s9_title: "คำนวณวันนัดฉีดยาคุม",
            s9_type_label: "ชนิดยาคุมกำเนิด",
            s9_type_1m: "ชนิด 1 เดือน (28 วัน)",
            s9_type_3m: "ชนิด 3 เดือน (84 วัน)",
            s9_next_appt: "วันที่นัดหมายครั้งถัดไป",
            user_manual_btn: "คู่มือการใช้งาน",
            support_coffee_btn: "สนับสนุนค่ากาแฟ",
            coffee_title: "สนับสนุนค่ากาแฟเพื่อเป็นกำลังใจ ☕",
            coffee_scan_text: "สแกนผ่านแอปพลิเคชันธนาคารได้ทุกธนาคาร<br>ขอบคุณสำหรับทุกการสนับสนุนค่ะ 🙏",
            manual_title: "คู่มือการใช้งานระบบ",
            close_window: "ปิดหน้าต่าง",
            manual_1_title: "ฟีเจอร์คำนวณระยะห่างของวัน:",
            manual_1_desc: "เลือกวันที่ต้องการจากปฏิทิน ระบบจะแสดงระยะห่างระหว่างวันนี้กับวันที่เลือกเป็นจำนวนวัน",
            manual_2_title: "ฟีเจอร์คำนวณวันนัดจากจำนวนวัน/สัปดาห์:",
            manual_2_desc: "กรอกจำนวนวันหรือสัปดาห์ที่ต้องการนัด ระบบจะคำนวณวันที่นัดหมายให้ทันที",
            manual_3_title: "ฟีเจอร์ตารางคำนวณวันนัดหมายและจำนวนยาแบบสำเร็จรูป:",
            manual_3_desc: "เลือกวันที่เริ่มต้นและขนาดยาต่อวัน ระบบจะสร้างตารางวันนัดล่วงหน้า 1-24 สัปดาห์ พร้อมคำนวณเม็ดยารวม (ปัดเศษขึ้นเป็นเม็ดเต็มเสมอ) มีช่องกรอกจำนวนวันแบบระบุเองด้านล่างตาราง",
            manual_4_title: "ฟีเจอร์คำนวณจำนวนยารายสัปดาห์:",
            manual_4_desc: "เลือกวันที่เริ่มต้นและวันนัดหมาย พร้อมระบุจำนวนยาที่ต้องทานต่อสัปดาห์ ระบบจะคำนวณจำนวนสัปดาห์และสรุปเม็ดยารวมที่ต้องจ่ายให้อัตโนมัติ",
            manual_5_title: "ฟีเจอร์คำนวณอายุคนไข้:",
            manual_5_desc: "กรอก วัน/เดือน/ปีเกิด (พ.ศ.) ระบบจะคำนวณอายุแบบละเอียด (ปี เดือน วัน)",
            manual_6_title: "ฟีเจอร์แปลงปี พ.ศ. และ ค.ศ.:",
            manual_6_desc: "กรอกตัวเลขปีเพื่อแปลงสลับระบบปีอัตโนมัติ",
            manual_7_title: "ฟีเจอร์คำนวณวันนัดฉีดวัคซีน:",
            manual_7_desc: "เลือกชนิดวัคซีนและประวัติการฉีด ระบบจะประมวลผลวันนัดหมายตามมาตรฐาน สำหรับวัคซีนทั่วไปจะระบุระยะห่างกำกับ สำหรับวัคซีนแบบซีรีส์ (เช่น พิษสุนัขบ้า) ระบบจะสร้างตารางนัดหมายให้ครบทุกเข็มพร้อมระบุ (Day X) อัตโนมัติ",
            manual_8_title: "ฟีเจอร์ตัวช่วยคำนวณยา Oseltamivir:",
            manual_8_desc: "ระบุน้ำหนักตัวหรืออายุของผู้ป่วย พร้อมเลือกรูปแบบการใช้ยา (รักษา หรือ ป้องกัน) ระบบจะประมวลผลขนาดยาที่ต้องรับประทานต่อมื้อ พร้อมสรุปปริมาณยารวมที่ต้องจ่ายให้อัตโนมัติอย่างแม่นยำ",
            manual_9_title: "ฟีเจอร์คำนวณวันนัดฉีดยาคุม:",
            manual_9_desc: "เลือกวันที่ฉีดเข็มล่าสุด และชนิดยาคุม (1 เดือน หรือ 3 เดือน) ระบบจะคำนวณวันนัดเข็มถัดไป (บวก 28 วัน หรือ 84 วัน)",
            ph_specify_age: "ระบุอายุ...",
            ph_specify_weight: "ระบุน้ำหนัก...",
            ph_specify_scr: "ระบุค่า SCr...",
            ph_specify_dose: "ระบุตัวเลขขนาดยา",
            ph_specify_pills: "ระบุจำนวนเม็ด",
            ph_eg_30: "เช่น 30"
        },
        EN: {
            title_main: "Medical Appointment & Medication Calculator",
            tooltip_coffee: "Buy me a coffee",
            tooltip_help: "User Manual",
            nav_datediff: "Date Difference Calculator",
            nav_med: "Daily Medication Calculator",
            nav_apptdays: "Next Appt (by Days)",
            nav_apptweeks: "Next Appt (by Weeks)",
            nav_weeklymed: "Weekly Medication Calculator",
            nav_age: "Age Calculator",
            nav_year: "Year Converter (B.E./C.E.)",
            nav_vaccine: "Adult Vaccine Calculator",
            nav_table: "Appointment & Pill Table",
            nav_osel: "Oseltamivir Calculator",
            nav_renal: "Oseltamivir (Renal Dose)",
            nav_contra: "Contraceptive Injection",
            btn_coffee: "Buy me a coffee",
            btn_manual: "User Manual",
            // Section 1
            s1_title: "Date Difference Calculator",
            s1_start_label: "Start Date (Base Date)",
            s1_target_label: "Target Date",
            s1_result_label: "Total Days Difference",
            // Section 2
            s2_title_1: "Daily Medication Calculator",
            s2_title_tag: "(For Daily Prescriptions)",
            s2_start_label: "Start Date",
            s2_end_label: "Appointment Date",
            s2_days_label: "Total Days",
            s2_dose_label: "Daily Dosage Prescribed",
            s2_result_label: "Total Pills Required",
            // Section Weekly Med
            s_wm_title_1: "Weekly Medication Calculator",
            s_wm_title_tag: "(For Weekly Prescriptions)",
            s_wm_start_label: "Start Date",
            s_wm_end_label: "Appointment Date",
            s_wm_dose_label: "Pills per Week",
            s_wm_days_check_label: "Select administration days in week (for exact calculation)",
            s_wm_total_time: "Total Duration: ",
            s_wm_total_pills: "Total Pills Required",
            // Section 3 & 4
            s3_title_1: "Next Appointment",
            s3_title_2: "by Days",
            s3_days_label: "Number of Days",
            s3_result_label: "Appointment Date",
            s4_title_1: "Next Appointment",
            s4_title_2: "by Weeks",
            s4_weeks_label: "Number of Weeks",
            // Section 5 & 6
            s5_title: "Age Calculator",
            s5_dob_label: "Date of Birth",
            s5_result_label: "Age",
            s6_title: "Year Converter (B.E. / C.E.)",
            s6_be_label: "Buddhist Era (B.E.)",
            s6_ce_label: "Christian Era (C.E.)",
            // Section 7 Vaccine
            s7_title: "Adult Vaccine Appointment Calculator",
            s7_type_label: "Vaccine Type",
            s7_dose_label: "Latest Dose Administered",
            s7_date_label: "Date of Latest Dose",
            s7_result_label: "Next Scheduled Dose",
            s7_ref_1: "If an appointment is delayed, vaccination can continue immediately without restarting the series.",
            s7_ref_2: "For early administration: inactivated vaccines may be given up to 4 days before the recommended interval. For live attenuated vaccines, early administration is not recommended.",
            s7_ref_source: "Reference: Adult and Elderly Immunization Guidelines, Infectious Disease Association of Thailand, 2025",
            // Section 8 Table
            s8_title: "Appointment & Medication Table",
            s8_base_label: "Start Date (Base Date)",
            s8_dose_daily_label: "Daily Dosage Prescribed",
            s8_dose_weekly_label: "Weekly Dosage Prescribed",
            s8_th_time: "Duration<br><span class=\"hidden md:inline\">(Weeks / Days)</span><span class=\"md:hidden\">(Wks/Days)</span>",
            s8_th_date: "Appointment Date<br><span class=\"hidden md:inline\">(Date/Month/Year)</span>",
            s8_th_daily: "Total Pills Required<br>(Pills)<br><span class=\"text-[8px] md:text-[10px] text-gray-400 font-normal\">*Based on daily dosage*</span>",
            s8_th_weekly: "Total Pills Required<br>(Pills)<br><span class=\"text-[8px] md:text-[10px] text-gray-400 font-normal\">*Based on weekly dosage*</span>",
            s8_custom_title: "Calculate Specific Days (Custom Days)",
            s8_custom_days_label: "Enter number of days",
            s8_custom_date_label: "Corresponding Date",
            s8_custom_daily_label: "Daily Total Pills",
            s8_custom_weekly_label: "Weekly Total Pills",
            // Oseltamivir
            s_osel_title: "Oseltamivir Calculator",
            s_osel_ind_label: "Indication",
            s_osel_ind_treat: "Treatment<br><span class=\"text-xs font-bold text-[#24917d]\">(5 days, Twice daily)</span>",
            s_osel_ind_proph: "Prophylaxis<br><span class=\"text-xs font-bold text-[#24917d]\">(10 days, Once daily)</span>",
            s_osel_age_label: "Age",
            s_osel_weight_label: "Weight",
            s_osel_weight_note: "*(Weight not required for patients aged 13 years or older)",
            s_osel_alert: "Not recommended for infants under 3 months of age",
            s_osel_dose: "Dose (mg)",
            s_osel_vol: "Volume (ml)",
            s_osel_vol_note: "*Concentration: 6 mg/ml.",
            s_osel_freq: "Frequency",
            s_osel_bottles: "Total Bottles",
            s_osel_bottles_note: "Bottle size: 60 ml.",
            s_osel_ref: "Reference: CDC Antiviral Medications - Table 2. Recommended Dosage and Duration of Influenza Antiviral Medications",
            // Renal Oseltamivir
            s_ro_title: "Oseltamivir Calculator",
            s_ro_sub: "(Renal Dose Adjustment)",
            s_ro_pt_data: "Patient Data",
            s_ro_age: "Age",
            s_ro_weight: "Weight",
            s_ro_gender: "Gender",
            s_ro_male: "Male",
            s_ro_female: "Female",
            s_ro_scr: "Serum Creatinine (SCr)",
            s_ro_clin_data: "Clinical Data",
            s_ro_ind: "Indication",
            s_ro_dialysis: "Dialysis Status",
            s_ro_crcl: "Calculated CrCl (Cockcroft-Gault)",
            s_ro_rec_dose: "Recommended Dose",
            s_ro_source: "Source: Recommended Dosage Modifications for Treatment and Prophylaxis of Influenza in Adults with Renal Impairment",
            // Contraceptive
            s_con_title: "Contraceptive Injection Calculator",
            s_con_base_label: "Date of Latest Injection",
            s_con_type_label: "Contraceptive Type",
            s_con_1m_title: "1-Month Formulation (28 Days)",
            s_con_3m_title: "3-Month Formulation (84 Days)",
            s_con_result_label: "Next Scheduled Injection",
            // SEO & Footer
            seo_title: "Why choose Easymedcal as your daily clinical assistant?",
            seo_p1: "We are an all-in-one clinical appointment and medication calculator designed to streamline the workflows of doctors, nurses, and pharmacists, ensuring rapid and precise results:",
            seo_li1: "<strong>Accurate & Reliable:</strong> Instantly check exact date intervals and medication quantities without manually counting calendar days.",
            seo_li2: "<strong>Comprehensive Toolset:</strong> Includes standard adult vaccination schedules grounded in the latest clinical guidelines.",
            seo_li3: "<strong>Free & Browser-Based:</strong> Accessible on mobile devices and desktops right away with zero app downloads required!",
            coffee_modal_title: "Buy me a coffee",
            coffee_modal_sub: "Support and encourage our development team ☕",
            coffee_modal_note: "Scan with any mobile banking application.<br>Thank you so much for your support! 🙏",
            manual_modal_title: "System User Manual",
            btn_close_manual: "Close Window",
            day_mon: "Mon", day_tue: "Tue", day_wed: "Wed", day_thu: "Thu", day_fri: "Fri", day_sat: "Sat", day_sun: "Sun",
            unit_day: "Days", unit_week: "Weeks",
            manual_1: "<span class=\"font-bold text-[#163333] block mb-1\">Date Difference Calculator:</span> <span class=\"text-gray-600 text-sm sm:text-[15px]\">Select start and target dates from the calendar to calculate the exact number of days between them.</span>",
            manual_2: "<span class=\"font-bold text-[#163333] block mb-1\">Next Appointment by Days / Weeks:</span> <span class=\"text-gray-600 text-sm sm:text-[15px]\">Enter the required number of days or weeks to instantly calculate the corresponding future appointment date.</span>",
            manual_3: "<span class=\"font-bold text-[#163333] block mb-1\">Appointment & Medication Table:</span> <span class=\"text-gray-600 text-sm sm:text-[15px]\">Select a base date and prescribed dosage to generate a pre-calculated schedule for weeks 1 through 24, including total pills required (always rounded up). Includes a custom days calculator at the bottom.</span>",
            manual_4: "<span class=\"font-bold text-[#163333] block mb-1\">Weekly Medication Calculator:</span> <span class=\"text-gray-600 text-sm sm:text-[15px]\">Select start and appointment dates along with weekly dosage. The system computes total duration and required pills automatically.</span>",
            manual_5: "<span class=\"font-bold text-[#163333] block mb-1\">Age Calculator:</span> <span class=\"text-gray-600 text-sm sm:text-[15px]\">Enter date of birth to calculate exact patient age in years, months, and days.</span>",
            manual_6: "<span class=\"font-bold text-[#163333] block mb-1\">Year Converter (B.E. / C.E.):</span> <span class=\"text-gray-600 text-sm sm:text-[15px]\">Enter a year in either Buddhist Era or Christian Era to automatically convert to the opposite system.</span>",
            manual_7: "<span class=\"font-bold text-[#163333] block mb-1\">Adult Vaccine Appointment Calculator:</span> <span class=\"text-gray-600 text-sm sm:text-[15px]\">Select vaccine type and dose history to calculate next due date based on official guidelines. For multi-dose regimens like Rabies, generates the full schedule with day markers.</span>",
            manual_8: "<span class=\"font-bold text-[#163333] block mb-1\">Oseltamivir Calculator:</span> <span class=\"text-gray-600 text-sm sm:text-[15px]\">Input patient weight or age and select indication (Treatment vs. Prophylaxis) to compute precise dosage, liquid volume, frequency, and total bottles needed.</span>",
            manual_9: "<span class=\"font-bold text-[#163333] block mb-1\">Contraceptive Injection Calculator:</span> <span class=\"text-gray-600 text-sm sm:text-[15px]\">Select latest injection date and formulation type (1-month or 3-month) to determine the next scheduled appointment date (+28 or +84 days).</span>",
            osel_title: "Oseltamivir Calculator",
            renal_subtitle: "(Renal Dose Adjustment)",
            renal_patient_data: "Patient Data",
            osel_age_label: "Age",
            osel_weight_label: "Weight",
            renal_gender: "Gender",
            renal_male: "Male",
            renal_female: "Female",
            osel_indication_label: "Indication",
            osel_ind_treatment: "Treatment",
            renal_ind_treatment_desc: "(5 days)",
            osel_ind_proph: "Prophylaxis",
            osel_ind_proph_desc: "(10 days)",
            renal_dialysis_status: "Dialysis Status",
            s9_title: "Contraceptive Injection Calculator",
            s9_type_label: "Contraceptive Type",
            s9_type_1m: "1-Month Formulation (28 Days)",
            s9_type_3m: "3-Month Formulation (84 Days)",
            s9_next_appt: "Next Scheduled Injection",
            user_manual_btn: "User Manual",
            support_coffee_btn: "Buy me a coffee",
            coffee_title: "Support our development team ☕",
            coffee_scan_text: "Scan with any mobile banking application.<br>Thank you so much for your support! 🙏",
            manual_title: "System User Manual",
            close_window: "Close Window",
            manual_1_title: "Date Difference Calculator:",
            manual_1_desc: "Select start and target dates from the calendar to calculate exact days between them.",
            manual_2_title: "Next Appointment by Days/Weeks:",
            manual_2_desc: "Enter required days or weeks to instantly calculate the corresponding future appointment date.",
            manual_3_title: "Appointment & Medication Table:",
            manual_3_desc: "Select a base date and daily dosage to generate a pre-calculated schedule for weeks 1 through 24, including total pills required (always rounded up). Includes a custom days calculator at the bottom.",
            manual_4_title: "Weekly Medication Calculator:",
            manual_4_desc: "Select start and appointment dates along with weekly dosage to compute total duration and required pills automatically.",
            manual_5_title: "Age Calculator:",
            manual_5_desc: "Enter date of birth to calculate exact patient age in years, months, and days.",
            manual_6_title: "Year Converter (B.E. / C.E.):",
            manual_6_desc: "Enter a year in either Buddhist Era or Christian Era to automatically convert to the opposite system.",
            manual_7_title: "Adult Vaccine Appointment Calculator:",
            manual_7_desc: "Select vaccine type and dose history to calculate next due date based on official guidelines. For multi-dose regimens like Rabies, generates the full schedule with day markers.",
            manual_8_title: "Oseltamivir Calculator:",
            manual_8_desc: "Input patient weight or age and select indication (Treatment vs. Prophylaxis) to compute precise dosage, liquid volume, frequency, and total bottles needed.",
            manual_9_title: "Contraceptive Injection Calculator:",
            manual_9_desc: "Select latest injection date and formulation type (1-month or 3-month) to determine the next scheduled appointment date (+28 or +84 days).",
            ph_specify_age: "Enter age...",
            ph_specify_weight: "Enter weight...",
            ph_specify_scr: "Enter SCr...",
            ph_specify_dose: "Enter dose number",
            ph_specify_pills: "Enter pill count",
            ph_eg_30: "e.g. 30"
        }
    };

    window.currentLang = localStorage.getItem('lang') || 'TH';

    function setLanguage(lang) {
        window.currentLang = lang;
        localStorage.setItem('lang', lang);

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

        const vacTypeEN = { "": "-- Select Vaccine --", "HBV": "Hepatitis B (HBV)", "HPV": "HPV", "HAV": "Hepatitis A (HAV)", "VZV": "Varicella / Chickenpox (VZV)", "RZV": "Shingles / Zoster (RZV)", "MMR": "MMR", "DENGUE": "Dengue", "RABIES": "Rabies" };
        const vacTypeTH = { "": "-- เลือกวัคซีน --", "HBV": "ไวรัสตับอักเสบบี (HBV)", "HPV": "เอชพีวี (HPV)", "HAV": "ไวรัสตับอักเสบเอ (HAV)", "VZV": "อีสุกอีใส (VZV)", "RZV": "งูสวัด (RZV)", "MMR": "หัด คางทูม หัดเยอรมัน (MMR)", "DENGUE": "ไข้เลือดออก (Dengue)", "RABIES": "โรคพิษสุนัขบ้า (Rabies)" };
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
    }

    // Set current year in Footer on startup
    const currentYearBE = window.currentLang === 'EN' ? new Date().getFullYear() : (new Date().getFullYear() + 543);
    const yearSpan = document.getElementById('currentYearBE');
    if (yearSpan) yearSpan.textContent = currentYearBE;

    // -------------------------------------------------------------
    // Utilities
    // -------------------------------------------------------------
    
    // Helper to convert year value to C.E. regardless of whether it's typed as B.E. (>2400) or C.E.
    function toCEYear(yVal) {
        if (isNaN(yVal)) return NaN;
        return yVal > 2400 ? (yVal - 543) : yVal;
    }

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
            
            const diffTime = Math.abs(targetDate - startDate);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            dateDiffResult.textContent = `${diffDays} ${window.currentLang === 'EN' ? 'Days' : 'วัน'}`;
            
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
            const startDate = new Date(toCEYear(syBE), sm - 1, sd);
            const endDate = new Date(toCEYear(eyBE), em - 1, ed);
            
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
            medResult.textContent = `${totalPills} ${window.currentLang === 'EN' ? 'pills' : 'เม็ด'}`;
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
    // 3. Next Appointment by Days
    // -------------------------------------------------------------
    const apptDaysInput = document.getElementById('apptDays');
    const apptDaysResult = document.getElementById('apptDaysResult');
    const apptDaysResultPicker = document.getElementById('apptDaysResultPicker');

    function calculateApptDays() {
        const days = parseInt(apptDaysInput.value);
        if (!isNaN(days) && days > 0) {
            const nextDate = getToday();
            nextDate.setDate(nextDate.getDate() + days);
            apptDaysResult.textContent = formatThaiDateShortWithDay(nextDate);
            apptDaysResultPicker.value = toISODate(nextDate);
        } else {
            apptDaysResult.textContent = '-';
            apptDaysResultPicker.value = '';
        }
    }
    apptDaysInput.addEventListener('input', calculateApptDays);

    // -------------------------------------------------------------
    // 4. Next Appointment by Weeks
    // -------------------------------------------------------------
    const apptWeeksInput = document.getElementById('apptWeeks');
    const apptWeeksResult = document.getElementById('apptWeeksResult');
    const apptWeeksResultPicker = document.getElementById('apptWeeksResultPicker');

    function calculateApptWeeks() {
        const weeks = parseInt(apptWeeksInput.value);
        if (!isNaN(weeks) && weeks > 0) {
            const nextDate = getToday();
            nextDate.setDate(nextDate.getDate() + (weeks * 7));
            apptWeeksResult.textContent = formatThaiDateShortWithDay(nextDate);
            apptWeeksResultPicker.value = toISODate(nextDate);
        } else {
            apptWeeksResult.textContent = '-';
            apptWeeksResultPicker.value = '';
        }
    }
    apptWeeksInput.addEventListener('input', calculateApptWeeks);

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

            const diffTime = endDate - startDate;
            if (diffTime >= 0) {
                const totalDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                const totalWeeks = Math.ceil(totalDays / 7);
                
                const checkedDays = Array.from(document.querySelectorAll('.med-weekly-day:checked')).map(cb => parseInt(cb.value));
                let totalPills = 0;

                const dayUnit = window.currentLang === 'EN' ? 'Days' : 'วัน';
                const pillUnit = window.currentLang === 'EN' ? 'pills' : 'เม็ด';

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
                    const occNote = window.currentLang === 'EN' ? `(Taking meds ${occurrences} days total)` : `(ทานยาทั้งหมด ${occurrences} วัน)`;
                    medWeeklyDuration.innerHTML = `${totalDays} ${dayUnit} <br><span class="text-sm font-normal text-textdark/70">${occNote}</span>`;
                    
                    const exactPills = Number.isInteger(totalPills) ? totalPills : parseFloat(totalPills.toFixed(2));
                    const roundedPills = Math.ceil(totalPills);
                    
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
            const yCE = toCEYear(yBE);
            // Note: Month is 0-indexed in Date constructor
            const birthDate = new Date(yCE, m - 1, d);
            const today = new Date();

            if (birthDate > today) {
                ageResult.textContent = window.currentLang === 'EN' ? "Birth date cannot be in the future" : "วันเกิดต้องไม่เกินปัจจุบัน";
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
            'RABIES': [ { val: '0', text: 'ผู้ที่ไม่เคยฉีดมาก่อน (5 เข็ม)' }, { val: '1', text: 'ผู้ที่เคยฉีดมาแล้ว (กระตุ้น 2 เข็ม)' } ]
        };
        const rulesEN = {
            'HBV': [ { val: '1', text: 'Dose 1' }, { val: '2', text: 'Dose 2' } ],
            'HPV': [ { val: '1', text: 'Dose 1' }, { val: '2', text: 'Dose 2' } ],
            'HAV': [ { val: '1', text: 'Dose 1' } ],
            'VZV': [ { val: '1', text: 'Dose 1' } ],
            'RZV': [ { val: '1', text: 'Dose 1' } ],
            'MMR': [ { val: '1', text: 'Dose 1' } ],
            'DENGUE': [ { val: '1', text: 'Dose 1' } ],
            'RABIES': [ { val: '0', text: 'Never vaccinated (5 doses)' }, { val: '1', text: 'Previously vaccinated (Booster 2 doses)' } ]
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
            
            if (vaccineDateLabel) {
                if (type === 'RABIES') {
                    vaccineDateLabel.textContent = isEn ? 'Start Date (Day 0) / Latest Dose (CE/BE)' : 'วันที่เริ่มฉีด (Day 0) / ฉีดเข็มล่าสุด (พ.ศ.)';
                } else {
                    vaccineDateLabel.textContent = isEn ? 'Latest Dose Date (CE/BE)' : 'วันที่ฉีดเข็มล่าสุด (พ.ศ.)';
                }
            }
        } else {
            vaccineDose.disabled = true;
            if (vaccineDateLabel) vaccineDateLabel.textContent = isEn ? 'Latest Dose Date (CE/BE)' : 'วันที่ฉีดเข็มล่าสุด (พ.ศ.)';
        }
        if (typeof calculateVaccine === 'function') calculateVaccine();
    }

    vaccineType.addEventListener('change', populateVaccineDoses);

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
                        vaccineNote.textContent = isEn ? '(IM regimen 5 doses)' : '(ฉีดแบบ IM 5 เข็ม)';
                    } else if (dose === '1') {
                        const dose2 = new Date(vDate); dose2.setDate(dose2.getDate() + 3);
                        resultHTML = renderVaccineDose(isEn ? 'Dose 1 (Day 0)' : 'เข็ม 1 (Day 0)', formatThaiDateShortWithDay(vDate)) +
                                     renderVaccineDose(isEn ? 'Dose 2 (Day 3)' : 'เข็ม 2 (Day 3)', formatThaiDateShortWithDay(dose2));
                        pickerDate = dose2;
                        vaccineNote.textContent = isEn ? '(Booster 2 doses)' : '(กระตุ้น 2 เข็ม)';
                    }
                    break;
                case 'HBV':
                    if (dose === '1') {
                        const dose2 = new Date(vDate); dose2.setMonth(dose2.getMonth() + 1);
                        const dose3 = new Date(vDate); dose3.setMonth(dose3.getMonth() + 6);
                        resultHTML = renderVaccineDose(isEn ? 'Dose 2' : 'เข็ม 2', formatThaiDateShortWithDay(dose2)) +
                                     renderVaccineDose(isEn ? 'Dose 3' : 'เข็ม 3', formatThaiDateShortWithDay(dose3));
                        pickerDate = dose2;
                        vaccineNote.textContent = isEn ? '(Dose 2 is 1 mo after Dose 1, Dose 3 is 6 mos after Dose 1)' : '(เข็ม 2 ห่างจากเข็ม 1 = 1 เดือน, เข็ม 3 ห่างจากเข็ม 1 = 6 เดือน)';
                    } else if (dose === '2') {
                        nextAppt.setMonth(nextAppt.getMonth() + 5); 
                        resultHTML = renderVaccineDose(isEn ? 'Dose 3' : 'เข็ม 3', formatThaiDateShortWithDay(nextAppt));
                        vaccineNote.textContent = isEn ? '(Dose 3 is 6 mos after Dose 1)' : '(เข็ม 3 ห่างจากเข็ม 1 = 6 เดือน)';
                    }
                    break;
                case 'HPV':
                    if (dose === '1') {
                        const dose2 = new Date(vDate); dose2.setMonth(dose2.getMonth() + 2);
                        const dose3 = new Date(vDate); dose3.setMonth(dose3.getMonth() + 6);
                        resultHTML = renderVaccineDose(isEn ? 'Dose 2' : 'เข็ม 2', formatThaiDateShortWithDay(dose2)) +
                                     renderVaccineDose(isEn ? 'Dose 3' : 'เข็ม 3', formatThaiDateShortWithDay(dose3));
                        pickerDate = dose2;
                        vaccineNote.textContent = isEn ? '(Dose 2 is 2 mos after Dose 1, Dose 3 is 6 mos after Dose 1)' : '(เข็ม 2 ห่างจากเข็ม 1 = 2 เดือน, เข็ม 3 ห่างจากเข็ม 1 = 6 เดือน)';
                    } else if (dose === '2') {
                        nextAppt.setMonth(nextAppt.getMonth() + 4);
                        resultHTML = renderVaccineDose(isEn ? 'Dose 3' : 'เข็ม 3', formatThaiDateShortWithDay(nextAppt));
                        vaccineNote.textContent = isEn ? '(Dose 3 is 6 mos after Dose 1)' : '(เข็ม 3 ห่างจากเข็ม 1 = 6 เดือน)';
                    }
                    break;
                case 'HAV':
                    if (dose === '1') {
                        nextAppt.setMonth(nextAppt.getMonth() + 6);
                        resultHTML = renderVaccineDose(isEn ? 'Dose 2' : 'เข็ม 2', formatThaiDateShortWithDay(nextAppt));
                        vaccineNote.textContent = isEn ? 'Dose 2 is 6 mos after Dose 1' : 'เข็ม 2 ห่างจากเข็ม 1 = 6 เดือน';
                    }
                    break;
                case 'VZV':
                    if (dose === '1') {
                        nextAppt.setDate(nextAppt.getDate() + 28);
                        resultHTML = renderVaccineDose(isEn ? 'Dose 2' : 'เข็ม 2', formatThaiDateShortWithDay(nextAppt));
                        vaccineNote.textContent = isEn ? 'Dose 2 is 4 weeks (or 1 mo) after Dose 1' : 'เข็ม 2 ห่างจากเข็ม 1 = 4 สัปดาห์ (หรือ 1 เดือน)';
                    }
                    break;
                case 'MMR':
                    if (dose === '1') {
                        nextAppt.setDate(nextAppt.getDate() + 28);
                        resultHTML = renderVaccineDose(isEn ? 'Dose 2' : 'เข็ม 2', formatThaiDateShortWithDay(nextAppt));
                        vaccineNote.textContent = isEn ? 'Dose 2 is 4 weeks after Dose 1' : 'เข็ม 2 ห่างจากเข็ม 1 = 4 สัปดาห์';
                    }
                    break;
                case 'RZV':
                    if (dose === '1') {
                        nextAppt.setMonth(nextAppt.getMonth() + 2);
                        resultHTML = renderVaccineDose(isEn ? 'Dose 2' : 'เข็ม 2', formatThaiDateShortWithDay(nextAppt));
                        vaccineNote.textContent = isEn ? 'Dose 2 is 2 mos after Dose 1' : 'เข็ม 2 ห่างจากเข็ม 1 = 2 เดือน';
                    }
                    break;
                case 'DENGUE':
                    if (dose === '1') {
                        nextAppt.setMonth(nextAppt.getMonth() + 3);
                        resultHTML = renderVaccineDose(isEn ? 'Dose 2' : 'เข็ม 2', formatThaiDateShortWithDay(nextAppt));
                        vaccineNote.textContent = isEn ? 'Dose 2 is 3 mos after Dose 1' : 'เข็ม 2 ห่างจากเข็ม 1 = 3 เดือน';
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
        const tblToday = new Date();
        tblBaseDay.value = tblToday.getDate();
        tblBaseMonth.value = tblToday.getMonth() + 1;
        tblBaseYear.value = tblToday.getFullYear() + 543;

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
                
                const pills = (!isNaN(dose) && dose > 0) ? Math.ceil(dose * days) : '-';
                const weeklyPills = (!isNaN(weeklyDose) && weeklyDose > 0) ? Math.ceil(weeklyDose * week) : '-';
                
                // Zebra striping classes
                const bgClass = week % 2 === 0 ? 'bg-panelbg/5' : 'bg-white';

                html += `
                    <tr class="border-b border-gray-200 hover:bg-resultbg/50 transition ${bgClass}">
                        <td class="px-1 md:px-6 py-2 md:py-3 text-center font-medium"><div class="flex flex-col items-center whitespace-nowrap"><span>${week} ${wkStr}</span><span class="text-[10px] md:text-xs text-gray-500">(${days} ${dyStr})</span></div></td>
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
            const pillStr = window.currentLang === 'EN' ? 'pills' : 'เม็ด';

            if (baseDate && !isNaN(days) && days > 0) {
                const targetDate = new Date(baseDate);
                targetDate.setDate(targetDate.getDate() + days);
                tblCustomDateResult.textContent = formatThaiDateShort(targetDate);
                
                if (!isNaN(dose) && dose > 0) {
                    const pills = Math.ceil(dose * days);
                    tblCustomPillResult.textContent = `${pills} ${pillStr}`;
                } else {
                    tblCustomPillResult.textContent = `- ${pillStr}`;
                }

                if (tblCustomWeeklyPillResult) {
                    if (!isNaN(weeklyDose) && weeklyDose > 0) {
                        const weeklyPills = Math.ceil(weeklyDose * (days / 7));
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

    // Initialize with today's date
    const todayContra = getToday();
    if (contraDay) {
        syncDateToFields(todayContra, contraDay, contraMonth, contraYear);
        if (contraDatePicker) contraDatePicker.value = toISODate(todayContra);
    }

    function calculateContraceptive() {
        if (!contraDay || !contraMonth || !contraYear || !contraResult) return;

        const cd = parseInt(contraDay.value);
        const cm = parseInt(contraMonth.value);
        const cyBE = parseInt(contraYear.value);

        if (isNaN(cd) || isNaN(cm) || isNaN(cyBE)) {
            contraResult.textContent = '-';
            if (contraDatePicker) contraDatePicker.value = '';
            if (contraResultPicker) contraResultPicker.value = '';
            return;
        }

        const baseDate = new Date(toCEYear(cyBE), cm - 1, cd);
        if (isNaN(baseDate.getTime())) {
            contraResult.textContent = '-';
            return;
        }

        if (contraDatePicker) contraDatePicker.value = toISODate(baseDate);

        let selectedType = '1month';
        const checkedRadio = document.querySelector('input[name="contraType"]:checked');
        if (checkedRadio) selectedType = checkedRadio.value;

        const nextAppt = new Date(baseDate);
        if (selectedType === '1month') {
            nextAppt.setDate(nextAppt.getDate() + 28);
        } else {
            nextAppt.setDate(nextAppt.getDate() + 84);
        }

        contraResult.textContent = formatThaiDateShortWithDay(nextAppt);
        if (contraResultPicker) contraResultPicker.value = toISODate(nextAppt);
    }

    if (contraDay) contraDay.addEventListener('input', calculateContraceptive);
    if (contraMonth) contraMonth.addEventListener('change', calculateContraceptive);
    if (contraYear) contraYear.addEventListener('input', calculateContraceptive);

    if (contraDatePicker) {
        contraDatePicker.addEventListener('change', (e) => {
            const d = parseDateStr(e.target.value);
            if (d) {
                syncDateToFields(d, contraDay, contraMonth, contraYear);
                calculateContraceptive();
            }
        });
    }

    if (contraTypes.length > 0) {
        contraTypes.forEach(radio => radio.addEventListener('change', calculateContraceptive));
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

});
