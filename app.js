// ==========================================================================
// VACCINE REFERENCE DATABASE (Guideline 2026 - Infectious Disease Association of Thailand / สมาคมโรคติดเชื้อแห่งประเทศไทย)
// ==========================================================================
const VACCINE_INFO = {
    flu: {
        nameTh: 'วัคซีนไข้หวัดใหญ่',
        nameEn: 'Influenza Vaccine',
        schedule: 'ฉีด 1 เข็มต่อคอร์ส เข้ากล้ามเนื้อ (IM) ปีละ 1 ครั้ง (แนะนำชนิด High-Dose 60 µg สำหรับผู้มีอายุตั้งแต่ 60 ปีขึ้นไป เพื่อภูมิคุ้มกันที่สูงกว่าและลดปอดอักเสบ)',
        sideEffects: 'ปวดบวมแดงบริเวณที่ฉีด, ไข้ต่ำๆ, ปวดเมื่อยตัว (ผู้แพ้ไข่สามารถฉีดได้ตามปกติ)',
        brandExamples: 'Vaxigrip Tetra, Influvac Tetra, Fluarix Tetra, Efluelda (High-Dose)',
        totalDosesNeeded: 1,
        govBenefit: 'ฟรีสำหรับ 7 กลุ่มเสี่ยงตามสิทธิบัตรทอง / สปสช.'
    },
    tdap: {
        nameTh: 'วัคซีนบาดทะยัก-คอตีบ-ไอกรน',
        nameEn: 'Tdap / Td Vaccine',
        schedule: 'ฉีดเข้ากล้ามเนื้อ (IM) กระตุ้นทุก 10 ปีด้วย Td โดยทดแทนด้วย Tdap หรือ TdaP อย่างน้อย 1 ครั้ง (หญิงตั้งครรภ์แนะนำ Tdap 1 เข็มที่อายุครรภ์ 20-32 สัปดาห์)',
        sideEffects: 'ปวดตึงกล้ามเนื้อแขน แดงบวมบริเวณที่ฉีด (มักหายได้เองใน 2-3 วัน)',
        brandExamples: 'Boostrix, Adacel, Td-Biovac',
        totalDosesNeeded: 1,
        govBenefit: 'มีบริการฟรีใน รพ.รัฐ เมื่อมีแผลเสี่ยงหรือตามเกณฑ์กระตุ้น'
    },
    covid: {
        nameTh: 'วัคซีนโควิด-19',
        nameEn: 'COVID-19 Vaccine (mRNA)',
        schedule: 'ฉีด 1 เข็มต่อคอร์ส เข้ากล้ามเนื้อ (IM) กระตุ้นประจำปีด้วยวัคซีน mRNA รุ่นล่าสุด (แนะนำเป็นพิเศษสำหรับอายุ ≥ 60 ปี หรือกลุ่มเสี่ยงโรคร่วม)',
        sideEffects: 'ปวดบริเวณที่ฉีด, อ่อนเพลีย, ปวดเมื่อยกล้ามเนื้อ, มีไข้',
        brandExamples: 'Comirnaty (Pfizer mRNA), Spikevax (Moderna mRNA)',
        totalDosesNeeded: 1,
        govBenefit: 'มีบริการตามจุดบริการของกระทรวงสาธารณสุข'
    },
    pneumo: {
        nameTh: 'วัคซีนนิวโมค็อกคัส (ปอดอักเสบ)',
        nameEn: 'Pneumococcal Vaccine (PCV / PPSV)',
        schedule: 'แบบที่ 1: ฉีด PCV20 (20 สายพันธุ์) 1 เข็มจบ หรือ แบบที่ 2: ฉีด PCV13/15 จำนวน 1 เข็ม ตามด้วย PPSV23',
        sideEffects: 'เจ็บปวดบวมบริเวณแขน, ปวดเมื่อยตามข้อ, ปวดศีรษะ, มีไข้ต่ำ',
        brandExamples: 'Prevnar 20 (PCV20), Vaxneuvance (PCV15), Prevnar 13 (PCV13), Pneumovax 23 (PPSV23)',
        totalDosesNeeded: 1
    },
    rsv: {
        nameTh: 'วัคซีนไวรัสอาร์เอสวี',
        nameEn: 'Respiratory Syncytial Virus Vaccine (RSV)',
        schedule: 'ฉีด 1 เข็มต่อคอร์ส เข้ากล้ามเนื้อ (IM) (แนะนำสำหรับผู้มีอายุ ≥ 75 ปี, อายุ 50-74 ปีที่มีโรคเรื้อรัง และหญิงตั้งครรภ์อายุครรภ์ 24-36 สัปดาห์)',
        sideEffects: 'ปวดตึงบริเวณที่ฉีด, ปวดศีรษะ, อ่อนเพลียชั่วคราว',
        brandExamples: 'Abrysvo (Bivalent RSVpreF - สำหรับผู้สูงอายุและหญิงตั้งครรภ์), Arexvy (RSVPreF3 - สำหรับอายุ 60 ปีขึ้นไป)',
        totalDosesNeeded: 1
    },
    zoster: {
        nameTh: 'วัคซีนงูสวัด',
        nameEn: 'Herpes Zoster Vaccine (RZV - Recombinant)',
        schedule: 'ฉีดวัคซีน Recombinant (RZV - Shingrix) 2 เข็ม เข้ากล้ามเนื้อ (IM) ห่างกัน 2-6 เดือน สำหรับอายุ ≥ 50 ปี (หรือห่างกัน 1-2 เดือน สำหรับผู้มีภูมิบกพร่อง/ฟอกไต 18+)',
        sideEffects: 'เจ็บระบมแขนที่ฉีด, ปวดเมื่อยกล้ามเนื้อ, อ่อนเพลีย, ไข้ต่ำ (มักหายใน 2-3 วัน)',
        brandExamples: 'Shingrix (RZV), Zostavax/SkyZoster (ZVL)',
        totalDosesNeeded: 2
    },
    hpv: {
        nameTh: 'วัคซีนป้องกันมะเร็งปากมดลูก (HPV)',
        nameEn: 'Human Papillomavirus Vaccine (HPV)',
        schedule: 'ฉีดเข้ากล้ามเนื้อ (IM) ป้องกันมะเร็งปากมดลูก ช่องปากทวารหนัก และหูดหงอนไก่ (อายุ 9-14 ปี ฉีด 2 เข็ม / อายุ 15-26 ปี ฉีด 3 เข็ม ที่ 0, 1-2, 6 เดือน)',
        sideEffects: 'ปวดตึงแขน, ปวดศีรษะ, หน้ามืดคล้ายจะเป็นลม (แนะนำนั่งพักสังเกตอาการ 15-30 นาที)',
        brandExamples: 'Gardasil 9 (HPV9), Gardasil (HPV4), Cervarix (HPV2)',
        totalDosesNeeded: 3,
        govBenefit: 'สนับสนุนฟรีสำหรับนักเรียนหญิงและกลุ่มเป้าหมาย สปสช.'
    },
    hepb: {
        nameTh: 'วัคซีนไวรัสตับอักเสบบี',
        nameEn: 'Hepatitis B Vaccine',
        schedule: 'ฉีดเข้ากล้ามเนื้อ (IM) 3 เข็ม (สูตร 0, 1, 6 เดือน) แนะนำสำหรับผู้เกิดก่อน พ.ศ. 2535 หรือตรวจไม่พบภูมิคุ้มกัน (ผู้ป่วยไตวาย/HIV แนะนำขนาด 40 µg)',
        sideEffects: 'บวม แดง เจ็บ เล็กน้อยบริเวณที่ฉีดวัคซีน',
        brandExamples: 'Engerix-B, Euvax B, Twinrix (รวมตับ A+B)',
        totalDosesNeeded: 3
    },
    dengue: {
        nameTh: 'วัคซีนไข้เลือดออก',
        nameEn: 'Dengue Vaccine (TAK-003 / Qdenga)',
        schedule: 'ฉีด 2 เข็มต่อคอร์ส ใต้ผิวหนัง (SC) ห่างกัน 3 เดือน (เดือนที่ 0 และ 3) สำหรับอายุ 4-60+ ปี ทั้งคนที่เคยและไม่เคยเป็นไข้เลือดออก',
        sideEffects: 'ปวดระบม แดง คัน บริเวณที่ฉีดวัคซีน, ไข้ต่ำๆ, ปวดเมื่อยตามตัว',
        brandExamples: 'Qdenga (TAK-003)',
        totalDosesNeeded: 2
    },
    mmr: {
        nameTh: 'วัคซีนหัด-หัดเยอรมัน-คางทูม',
        nameEn: 'Measles, Mumps, and Rubella Vaccine (MMR/MR)',
        schedule: 'ฉีด 2 เข็มต่อคอร์ส ใต้ผิวหนัง (SC) ห่างกันอย่างน้อย 4 สัปดาห์ สำหรับผู้ใหญ่ที่ไม่มีหลักฐานภูมิคุ้มกัน หรือบุคลากรทางการแพทย์',
        sideEffects: 'ไข้, ผื่นแดงขึ้นเล็กน้อยหลังฉีด 7-12 วัน',
        brandExamples: 'M-M-R II, Priorix, MR Vaccine',
        totalDosesNeeded: 2
    },
    varicella: {
        nameTh: 'วัคซีนอีสุกอีใส',
        nameEn: 'Varicella Vaccine (Live)',
        schedule: 'ฉีด 2 เข็มต่อคอร์ส ใต้ผิวหนัง (SC) ห่างกัน 4-8 สัปดาห์ สำหรับผู้ที่อายุ < 50 ปี ที่ไม่เคยเป็นอีสุกอีใส/งูสวัดมาก่อน',
        sideEffects: 'ปวดบวมแดงบริเวณที่ฉีด, ผื่นตุ่มน้ำใสขึ้นเล็กน้อย',
        brandExamples: 'Varivax, Varilrix',
        totalDosesNeeded: 2
    }
};

const BRAND_OPTIONS_MAP = {
    flu: ['Vaxigrip Tetra', 'Influvac Tetra', 'Fluarix Tetra', 'Other'],
    flu_hd: ['Efluelda (High-Dose 60µg)', 'Other'],
    dengue: ['Qdenga (TAK-003)', 'Other'],
    tdap: ['Boostrix', 'Adacel', 'Td-Biovac', 'Other'],
    covid: ['Comirnaty (Pfizer mRNA)', 'Spikevax (Moderna mRNA)', 'Other'],
    pneumo: ['Prevnar 20 (PCV20)', 'Vaxneuvance (PCV15)', 'Prevnar 13 (PCV13)', 'Pneumovax 23 (PPSV23)', 'Other'],
    rsv: ['Abrysvo (Bivalent RSVpreF)', 'Arexvy (Adjuvanted RSVPreF3)', 'Other'],
    zoster: ['Shingrix (RZV)', 'Zostavax/SkyZoster (ZVL)', 'Other'],
    hpv: ['Gardasil 9 (9-valent)', 'Gardasil (4-valent)', 'Cervarix (2-valent)', 'Other'],
    hepb: ['Engerix-B', 'Euvax B', 'Twinrix (HepA+HepB)', 'Other'],
    mmr: ['M-M-R II', 'Priorix', 'Other'],
    varicella: ['Varivax', 'Varilrix', 'Other']
};

// ==========================================================================
// VACCINE PACKAGES DIRECTORY (Shopee Affiliate, Rama Sri, Rajavithi Gov)
// ==========================================================================
const VACCINE_PROMOS = [
    // --- 1. Shopee E-Coupon Packages (Affiliate) ---
    {
        id: 'promo-hpv-9-sriracha',
        vaccineId: 'hpv',
        providerType: 'shopee',
        categoryName: 'วัคซีน HPV มะเร็งปากมดลูก',
        title: '[E-Coupon] พญาไท ศรีราชา - วัคซีนป้องกันมะเร็งปากมดลูก ชนิด 9 สายพันธุ์ 3 เข็ม',
        hospital: 'โรงพยาบาลพญาไท ศรีราชา',
        promoPrice: 16400,
        originalPrice: 24500,
        discountPercent: 'ลด 33%',
        shopeeUrl: 'https://s.shopee.co.th/3VjvwCsWrR',
        badge: 'Shopee Mall แนะนำ',
        highlight: 'รวมค่าแพทย์และค่าบริการแล้ว ป้องกันมะเร็งปากมดลูก ทวารหนัก และหูดหงอนไก่ ครอบคลุม 9 สายพันธุ์'
    },
    {
        id: 'promo-zoster-phahol',
        vaccineId: 'zoster',
        providerType: 'shopee',
        categoryName: 'วัคซีนงูสวัด Shingrix',
        title: '[E-Coupon] พญาไท พหลโยธิน - วัคซีนป้องกันโรคงูสวัด 2 เข็ม',
        hospital: 'โรงพยาบาลพญาไท พหลโยธิน',
        promoPrice: 17001,
        originalPrice: 20000,
        discountPercent: 'ลด 15%',
        shopeeUrl: 'https://s.shopee.co.th/9Khit2lR9V',
        badge: 'Shopee Mall ยอดนิยม',
        highlight: 'วัคซีนงูสวัดชนิดซับยูนิต (Shingrix) 2 เข็ม ประสิทธิภาพป้องกันอาการปวดเรื้อรังสูง สำหรับอายุ 50 ปี+'
    },
    {
        id: 'promo-hpv-phahol',
        vaccineId: 'hpv',
        providerType: 'shopee',
        categoryName: 'วัคซีน HPV มะเร็งปากมดลูก',
        title: '[E-Coupon] พญาไท พหลโยธิน - วัคซีนป้องกันมะเร็งปากมดลูก 3 เข็ม ชนิด 4 หรือ 9 สายพันธุ์',
        hospital: 'โรงพยาบาลพญาไท พหลโยธิน',
        promoPrice: 12101,
        originalPrice: 18000,
        discountPercent: 'ดีลสุดคุ้ม',
        shopeeUrl: 'https://s.shopee.co.th/8AVlV7fp72',
        badge: 'Shopee Mall',
        highlight: 'แพ็กเกจวัคซีน HPV 3 เข็ม ครบคอร์ส สะดวกใจกลางเมือง BTS อารีย์'
    },
    {
        id: 'promo-hpv-4-sriracha',
        vaccineId: 'hpv',
        providerType: 'shopee',
        categoryName: 'วัคซีน HPV มะเร็งปากมดลูก',
        title: '[E-Coupon] พญาไท ศรีราชา - วัคซีนป้องกันมะเร็งปากมดลูก ชนิด 4 สายพันธุ์ 3 เข็ม',
        hospital: 'โรงพยาบาลพญาไท ศรีราชา',
        promoPrice: 8900,
        originalPrice: 12500,
        discountPercent: 'ลด 29%',
        shopeeUrl: 'https://s.shopee.co.th/9V195j1lxM',
        badge: 'ราคาประหยัด',
        highlight: 'วัคซีน HPV ชนิด 4 สายพันธุ์ (Gardasil 4) 3 เข็ม ป้องกันมะเร็งปากมดลูกและหูดอวัยวะเพศ'
    },

    // --- 2. ศูนย์การแพทย์รามาธิบดีศรีอยุธยา (Special Promo Packages) ---
    {
        id: 'promo-rama-flu',
        vaccineId: 'flu',
        providerType: 'rama',
        categoryName: 'วัคซีนไข้หวัดใหญ่',
        title: 'วัคซีนไข้หวัดใหญ่ (3 สายพันธุ์) ปี 2026 - 1 เข็ม',
        hospital: 'ศูนย์การแพทย์รามาธิบดีศรีอยุธยา',
        promoPrice: 790,
        originalPrice: 1000,
        discountPercent: 'ลด 21%',
        lineUrl: 'https://line.me/R/ti/p/@801kdmbj',
        tel: '1575',
        badge: 'รามาธิบดีศรีอยุธยา',
        highlight: 'วัคซีนไข้หวัดใหญ่ตามฤดูกาล ป้องกันภาวะแทรกซ้อนรุนแรง บริการโดยแพทย์เฉพาะทาง'
    },
    {
        id: 'promo-rama-flu-hd',
        vaccineId: 'flu',
        providerType: 'rama',
        categoryName: 'วัคซีนไข้หวัดใหญ่',
        title: 'วัคซีนไข้หวัดใหญ่ชนิด High dose (3 สายพันธุ์) ปี 2026 - 1 เข็ม',
        hospital: 'ศูนย์การแพทย์รามาธิบดีศรีอยุธยา',
        promoPrice: 2390,
        originalPrice: 3000,
        discountPercent: 'ลด 20%',
        lineUrl: 'https://line.me/R/ti/p/@801kdmbj',
        tel: '1575',
        badge: 'สำหรับผู้สูงอายุ 60 ปี+',
        highlight: 'ขนาดความเข้มข้นแอนติเจนสูงกว่าปกติ 4 เท่า กระตุ้นภูมิคุ้มกันในผู้สูงวัยได้ดียิ่งขึ้น'
    },
    {
        id: 'promo-rama-tdap',
        vaccineId: 'tdap',
        providerType: 'rama',
        categoryName: 'วัคซีนบาดทะยัก-คอตีบ-ไอกรน',
        title: 'วัคซีน คอตีบ ไอกรน บาดทะยัก (Tdap) - 1 เข็ม',
        hospital: 'ศูนย์การแพทย์รามาธิบดีศรีอยุธยา',
        promoPrice: 1490,
        originalPrice: 2000,
        discountPercent: 'ลด 25%',
        lineUrl: 'https://line.me/R/ti/p/@801kdmbj',
        tel: '1575',
        badge: 'รามาธิบดีศรีอยุธยา',
        highlight: 'เสริมภูมิคุ้มกันไอกรนและบาดทะยัก แนะนำสำหรับผู้ใหญ่กระตุ้นทุก 10 ปี และหญิงตั้งครรภ์'
    },
    {
        id: 'promo-rama-pneumo',
        vaccineId: 'pneumo',
        providerType: 'rama',
        categoryName: 'วัคซีนปอดอักเสบ',
        title: 'วัคซีนปอดอักเสบ (นิวโมคอคคัสชนิด 20 สายพันธุ์ PCV20) - 1 เข็ม',
        hospital: 'ศูนย์การแพทย์รามาธิบดีศรีอยุธยา',
        promoPrice: 3990,
        originalPrice: 5000,
        discountPercent: 'ลด 20%',
        lineUrl: 'https://line.me/R/ti/p/@801kdmbj',
        tel: '1575',
        badge: 'ครอบคลุมสูงสุด 20 สายพันธุ์',
        highlight: 'ป้องกันการติดเชื้อปอดบวมและติดเชื้อในกระแสเลือด สำหรับผู้ใหญ่อายุ 50 ปีขึ้นไป หรือผู้มีโรคเรื้อรัง'
    },
    {
        id: 'promo-rama-hpv-9',
        vaccineId: 'hpv',
        providerType: 'rama',
        categoryName: 'วัคซีน HPV มะเร็งปากมดลูก',
        title: 'วัคซีนป้องกันมะเร็งปากมดลูก HPV (ชนิด 9 สายพันธุ์) - 3 เข็ม',
        hospital: 'ศูนย์การแพทย์รามาธิบดีศรีอยุธยา',
        promoPrice: 18990,
        originalPrice: 23000,
        discountPercent: 'ลด 17%',
        lineUrl: 'https://line.me/R/ti/p/@801kdmbj',
        tel: '1575',
        badge: 'รามาธิบดีศรีอยุธยา',
        highlight: 'วัคซีน Gardasil 9 จำนวน 3 เข็ม ครบคอร์ส ป้องกันมะเร็งปากมดลูกและหูดหงอนไก่'
    },
    {
        id: 'promo-rama-mmr',
        vaccineId: 'mmr',
        providerType: 'rama',
        categoryName: 'วัคซีนหัด-หัดเยอรมัน-คางทูม',
        title: 'วัคซีนหัด คางทูม หัดเยอรมัน (MMR) - 1 เข็ม',
        hospital: 'ศูนย์การแพทย์รามาธิบดีศรีอยุธยา',
        promoPrice: 1990,
        originalPrice: 3000,
        discountPercent: 'ลด 33%',
        lineUrl: 'https://line.me/R/ti/p/@801kdmbj',
        tel: '1575',
        badge: 'รามาธิบดีศรีอยุธยา',
        highlight: 'สร้างภูมิคุ้มกันป้องกันโรคหัด หัดเยอรมัน และคางทูม ป้องกันภาวะแทรกซ้อน'
    },
    {
        id: 'promo-rama-zoster',
        vaccineId: 'zoster',
        providerType: 'rama',
        categoryName: 'วัคซีนงูสวัด Shingrix',
        title: 'วัคซีน งูสวัด ชนิดไม่ใช่เชื้อเป็น (Shingrix) - 2 เข็ม',
        hospital: 'ศูนย์การแพทย์รามาธิบดีศรีอยุธยา',
        promoPrice: 12990,
        originalPrice: 15000,
        discountPercent: 'ลด 13%',
        lineUrl: 'https://line.me/R/ti/p/@801kdmbj',
        tel: '1575',
        badge: 'ประสิทธิภาพสูง 97%',
        highlight: 'วัคซีนงูสวัด 2 เข็ม ป้องกันอาการปวดเส้นประสาทเรื้อรัง สำหรับผู้มีอายุ 50 ปีขึ้นไป'
    },
    {
        id: 'promo-rama-dengue',
        vaccineId: 'dengue',
        providerType: 'rama',
        categoryName: 'วัคซีนไข้เลือดออก',
        title: 'วัคซีนไข้เลือดออก (Qdenga) - 2 เข็ม',
        hospital: 'ศูนย์การแพทย์รามาธิบดีศรีอยุธยา',
        promoPrice: 4990,
        originalPrice: 6000,
        discountPercent: 'ลด 17%',
        lineUrl: 'https://line.me/R/ti/p/@801kdmbj',
        tel: '1575',
        badge: 'ฉีดได้ทั้งเคย/ไม่เคยเป็น',
        highlight: 'วัคซีนไข้เลือดออก 4 สายพันธุ์ 2 เข็ม ลดความเสี่ยงนอนโรงพยาบาลได้ถึง 84%'
    },
    {
        id: 'promo-rama-hepa',
        vaccineId: 'hepa',
        providerType: 'rama',
        categoryName: 'วัคซีนตับอักเสบเอ',
        title: 'วัคซีนไวรัสตับอักเสบเอ - 2 เข็ม',
        hospital: 'ศูนย์การแพทย์รามาธิบดีศรีอยุธยา',
        promoPrice: 4990,
        originalPrice: 6000,
        discountPercent: 'ลด 17%',
        lineUrl: 'https://line.me/R/ti/p/@801kdmbj',
        tel: '1575',
        badge: 'รามาธิบดีศรีอยุธยา',
        highlight: 'ป้องกันการติดเชื้อไวรัสตับอักเสบเอจากการรับประทานอาหารและน้ำที่ไม่สะอาด'
    },
    {
        id: 'promo-rama-hepb',
        vaccineId: 'hepb',
        providerType: 'rama',
        categoryName: 'วัคซีนตับอักเสบบี',
        title: 'วัคซีนไวรัสตับอักเสบบี - 3 เข็ม',
        hospital: 'ศูนย์การแพทย์รามาธิบดีศรีอยุธยา',
        promoPrice: 3290,
        originalPrice: 4000,
        discountPercent: 'ลด 18%',
        lineUrl: 'https://line.me/R/ti/p/@801kdmbj',
        tel: '1575',
        badge: 'รามาธิบดีศรีอยุธยา',
        highlight: 'วัคซีนป้องกันไวรัสตับอักเสบบี 3 เข็ม ครบคอร์ส ป้องกันโรคตับแข็งและมะเร็งตับ'
    },

    // --- 3. โรงพยาบาลราชวิถี (รพ.รัฐ - อัตราค่าบริการตามระเบียบ) ---
    {
        id: 'promo-raj-flu',
        vaccineId: 'flu',
        providerType: 'rajavithi',
        categoryName: 'วัคซีนไข้หวัดใหญ่',
        title: 'วัคซีนไข้หวัดใหญ่ - รพ.ราชวิถี - 1 เข็ม',
        hospital: 'โรงพยาบาลราชวิถี',
        promoPrice: 226,
        originalPrice: null,
        tel: '02-206-2900',
        badge: 'รพ.รัฐ (ราชวิถี)',
        highlight: 'อัตราค่าวัคซีน รพ.รัฐ (ราคายังไม่รวมค่าบริการทางการแพทย์ • ข้อมูล ณ 31/5/2569)'
    },
    {
        id: 'promo-raj-hpv-4',
        vaccineId: 'hpv',
        providerType: 'rajavithi',
        categoryName: 'วัคซีน HPV มะเร็งปากมดลูก',
        title: 'วัคซีนเอชพีวี (HPV) 4 สายพันธุ์ - รพ.ราชวิถี - 1 เข็ม',
        hospital: 'โรงพยาบาลราชวิถี',
        promoPrice: 2564,
        originalPrice: null,
        tel: '02-206-2900',
        badge: 'รพ.รัฐ (ราชวิถี)',
        highlight: 'อัตราค่าวัคซีน รพ.รัฐ (ราคายังไม่รวมค่าบริการทางการแพทย์ • ข้อมูล ณ 31/5/2569)'
    },
    {
        id: 'promo-raj-hpv-9',
        vaccineId: 'hpv',
        providerType: 'rajavithi',
        categoryName: 'วัคซีน HPV มะเร็งปากมดลูก',
        title: 'วัคซีนเอชพีวี (HPV) 9 สายพันธุ์ - รพ.ราชวิถี - 1 เข็ม',
        hospital: 'โรงพยาบาลราชวิถี',
        promoPrice: 5593,
        originalPrice: null,
        tel: '02-206-2900',
        badge: 'รพ.รัฐ (ราชวิถี)',
        highlight: 'อัตราค่าวัคซีน รพ.รัฐ (ราคายังไม่รวมค่าบริการทางการแพทย์ • ข้อมูล ณ 31/5/2569)'
    },
    {
        id: 'promo-raj-td',
        vaccineId: 'tdap',
        providerType: 'rajavithi',
        categoryName: 'วัคซีนบาดทะยัก-คอตีบ',
        title: 'วัคซีนป้องกันบาดทะยัก คอตีบ (Td) - รพ.ราชวิถี - 1 เข็ม',
        hospital: 'โรงพยาบาลราชวิถี',
        promoPrice: 143,
        originalPrice: null,
        tel: '02-206-2900',
        badge: 'รพ.รัฐ (ราชวิถี)',
        highlight: 'อัตราค่าวัคซีน รพ.รัฐ (ราคายังไม่รวมค่าบริการทางการแพทย์ • ข้อมูล ณ 31/5/2569)'
    },
    {
        id: 'promo-raj-tdap',
        vaccineId: 'tdap',
        providerType: 'rajavithi',
        categoryName: 'วัคซีนบาดทะยัก-คอตีบ-ไอกรน',
        title: 'วัคซีนป้องกันบาดทะยัก คอตีบ ไอกรน (Tdap) - รพ.ราชวิถี - 1 เข็ม',
        hospital: 'โรงพยาบาลราชวิถี',
        promoPrice: 644,
        originalPrice: null,
        tel: '02-206-2900',
        badge: 'รพ.รัฐ (ราชวิถี)',
        highlight: 'อัตราค่าวัคซีน รพ.รัฐ (ราคายังไม่รวมค่าบริการทางการแพทย์ • ข้อมูล ณ 31/5/2569)'
    },
    {
        id: 'promo-raj-mmr',
        vaccineId: 'mmr',
        providerType: 'rajavithi',
        categoryName: 'วัคซีนหัด-หัดเยอรมัน-คางทูม',
        title: 'วัคซีนป้องกันโรคหัด หัดเยอรมัน คางทูม (MMR) - รพ.ราชวิถี - 1 เข็ม',
        hospital: 'โรงพยาบาลราชวิถี',
        promoPrice: 247,
        originalPrice: null,
        tel: '02-206-2900',
        badge: 'รพ.รัฐ (ราชวิถี)',
        highlight: 'อัตราค่าวัคซีน รพ.รัฐ (ราคายังไม่รวมค่าบริการทางการแพทย์ • ข้อมูล ณ 31/5/2569)'
    },
    {
        id: 'promo-raj-hepb',
        vaccineId: 'hepb',
        providerType: 'rajavithi',
        categoryName: 'วัคซีนตับอักเสบบี',
        title: 'วัคซีนป้องกันไวรัสตับอักเสบบี (Hepatitis B) - รพ.ราชวิถี - 1 เข็ม',
        hospital: 'โรงพยาบาลราชวิถี',
        promoPrice: 149,
        originalPrice: null,
        tel: '02-206-2900',
        badge: 'รพ.รัฐ (ราชวิถี)',
        highlight: 'อัตราค่าวัคซีน รพ.รัฐ (ราคายังไม่รวมค่าบริการทางการแพทย์ • ข้อมูล ณ 31/5/2569)'
    },
    {
        id: 'promo-raj-hepa',
        vaccineId: 'hepa',
        providerType: 'rajavithi',
        categoryName: 'วัคซีนตับอักเสบเอ',
        title: 'วัคซีนป้องกันไวรัสตับอักเสบเอ (Hepatitis A) - รพ.ราชวิถี - 1 เข็ม',
        hospital: 'โรงพยาบาลราชวิถี',
        promoPrice: 1356,
        originalPrice: null,
        tel: '02-206-2900',
        badge: 'รพ.รัฐ (ราชวิถี)',
        highlight: 'อัตราค่าวัคซีน รพ.รัฐ (ราคายังไม่รวมค่าบริการทางการแพทย์ • ข้อมูล ณ 31/5/2569)'
    },
    {
        id: 'promo-raj-varicella',
        vaccineId: 'varicella',
        providerType: 'rajavithi',
        categoryName: 'วัคซีนอีสุกอีใส',
        title: 'วัคซีนป้องกันโรคอีสุกอีใส (Varicella) - รพ.ราชวิถี - 1 เข็ม',
        hospital: 'โรงพยาบาลราชวิถี',
        promoPrice: 983,
        originalPrice: null,
        tel: '02-206-2900',
        badge: 'รพ.รัฐ (ราชวิถี)',
        highlight: 'อัตราค่าวัคซีน รพ.รัฐ (ราคายังไม่รวมค่าบริการทางการแพทย์ • ข้อมูล ณ 31/5/2569)'
    },
    {
        id: 'promo-raj-rabies',
        vaccineId: 'rabies',
        providerType: 'rajavithi',
        categoryName: 'วัคซีนพิษสุนัขบ้า',
        title: 'วัคซีนป้องกันโรคพิษสุนัขบ้า (Rabies) - รพ.ราชวิถี - 1 เข็ม',
        hospital: 'โรงพยาบาลราชวิถี',
        promoPrice: 299,
        originalPrice: null,
        tel: '02-206-2900',
        badge: 'รพ.รัฐ (ราชวิถี)',
        highlight: 'อัตราค่าวัคซีน รพ.รัฐ (ราคายังไม่รวมค่าบริการทางการแพทย์ • ข้อมูล ณ 31/5/2569)'
    },
    {
        id: 'promo-raj-zoster',
        vaccineId: 'zoster',
        providerType: 'rajavithi',
        categoryName: 'วัคซีนงูสวัด',
        title: 'วัคซีนป้องกันโรคงูสวัด - รพ.ราชวิถี - 1 เข็ม',
        hospital: 'โรงพยาบาลราชวิถี',
        promoPrice: 5199,
        originalPrice: null,
        tel: '02-206-2900',
        badge: 'รพ.รัฐ (ราชวิถี)',
        highlight: 'อัตราค่าวัคซีน รพ.รัฐ (ราคายังไม่รวมค่าบริการทางการแพทย์ • ข้อมูล ณ 31/5/2569)'
    },
    {
        id: 'promo-raj-dengue',
        vaccineId: 'dengue',
        providerType: 'rajavithi',
        categoryName: 'วัคซีนไข้เลือดออก',
        title: 'วัคซีนป้องกันโรคไข้เลือดออก (Dengue) - รพ.ราชวิถี - 1 เข็ม',
        hospital: 'โรงพยาบาลราชวิถี',
        promoPrice: 1639,
        originalPrice: null,
        tel: '02-206-2900',
        badge: 'รพ.รัฐ (ราชวิถี)',
        highlight: 'อัตราค่าวัคซีน รพ.รัฐ (ราคายังไม่รวมค่าบริการทางการแพทย์ • ข้อมูล ณ 31/5/2569)'
    }
];

// ==========================================================================
// NEARBY HEALTHCARE CENTERS DIRECTORY (Pre-compiled with Geocoordinates)
// ==========================================================================
const HEALTHCARE_DIRECTORY = [
    {
        name: 'ศูนย์การแพทย์รามาธิบดีศรีอยุธยา',
        type: 'gov',
        typeName: 'ศูนย์การแพทย์ / รพ.รัฐ',
        address: 'ถ.ศรีอยุธยา แขวงทุ่งพญาไท เขตราชเทวี กรุงเทพฯ',
        tel: '1575',
        lat: 13.7584,
        lng: 100.5348,
        services: ['วัคซีนผู้ใหญ่ทุกชนิด', 'คลินิกสร้างเสริมภูมิคุ้มกัน', 'คำแนะนำโดยแพทย์เฉพาะทาง']
    },
    {
        name: 'โรงพยาบาลจุฬาลงกรณ์ สภากาชาดไทย',
        type: 'gov',
        typeName: 'โรงพยาบาลรัฐชั้นนำ',
        address: 'ถ.พระราม 4 แขวงปทุมวัน เขตปทุมวัน กรุงเทพฯ',
        tel: '02-256-4000',
        lat: 13.7314,
        lng: 100.5342,
        services: ['วัคซีนผู้ใหญ่และผู้สูงอายุ', 'สิทธิบัตรทอง', 'คลินิกวัคซีน']
    },
    {
        name: 'โรงพยาบาลศิริราช',
        type: 'gov',
        typeName: 'โรงพยาบาลรัฐชั้นนำ',
        address: 'ถ.วังหลัง แขวงศิริราช เขตบางกอกน้อย กรุงเทพฯ',
        tel: '02-419-7000',
        lat: 13.7578,
        lng: 100.4853,
        services: ['วัคซีนผู้ใหญ่', 'คลินิกผู้สูงอายุ', 'สิทธิบัตรทอง/ข้าราชการ']
    },
    {
        name: 'ศูนย์บริการสาธารณสุข 2 (มักกะสัน กทม.)',
        type: 'subdist',
        typeName: 'ศูนย์บริการสาธารณสุข กทม.',
        address: 'ถ.เพชรบุรีตัดใหม่ แขวงมักกะสัน เขตราชเทวี กรุงเทพฯ',
        tel: '02-245-2615',
        lat: 13.7512,
        lng: 100.5482,
        services: ['วัคซีนไข้หวัดใหญ่ฟรี (7 กลุ่มเสี่ยง)', 'วัคซีนบาดทะยัก', 'สิทธิบัตรทอง 30 บาท']
    },
    {
        name: 'ศูนย์บริการสาธารณสุข 5 (จุฬาลงกรณ์ กทม.)',
        type: 'subdist',
        typeName: 'ศูนย์บริการสาธารณสุข กทม.',
        address: 'ถ.สี่พระยา แขวงมหาพฤฒาราม เขตบางรัก กรุงเทพฯ',
        tel: '02-236-4171',
        lat: 13.7301,
        lng: 100.5204,
        services: ['วัคซีนผู้ใหญ่พื้นฐาน', 'สิทธิบัตรทอง 30 บาท', 'วัคซีนไข้หวัดใหญ่']
    },
    {
        name: 'โรงพยาบาลส่งเสริมสุขภาพตำบล (รพ.สต.) บางใหญ่',
        type: 'subdist',
        typeName: 'รพ.สต. ชุมชน',
        address: 'ต.บางใหญ่ อ.บางใหญ่ จ.นนทบุรี',
        tel: '02-595-0123',
        lat: 13.8402,
        lng: 100.3621,
        services: ['วัคซีนตามสิทธิบัตรทอง', 'วัคซีนไข้หวัดใหญ่', 'วัคซีนบาดทะยัก']
    },
    {
        name: 'โรงพยาบาลพระนครศรีอยุธยา',
        type: 'gov',
        typeName: 'โรงพยาบาลศูนย์ประจำจังหวัด',
        address: 'ต.ประตูชัย อ.พระนครศรีอยุธยา จ.พระนครศรีอยุธยา',
        tel: '035-211-888',
        lat: 14.3532,
        lng: 100.5587,
        services: ['วัคซีนผู้ใหญ่ครบวงจร', 'สิทธิบัตรทอง/ประกันสังคม', 'คลินิกวัคซีน']
    },
    {
        name: 'โรงพยาบาลกรุงเทพ (Bangkok Hospital)',
        type: 'private',
        typeName: 'โรงพยาบาลเอกชน',
        address: 'ซ.เพชรบุรี 47 แขวงบางกะปิ เขตห้วยขวาง กรุงเทพฯ',
        tel: '1719',
        lat: 13.7485,
        lng: 100.5836,
        services: ['แพ็กเกจวัคซีนผู้ใหญ่', 'วัคซีนงูสวัด', 'วัคซีน HPV 9 สายพันธุ์']
    },
    {
        name: 'โรงพยาบาลสมิติเวช สุขุมวิท',
        type: 'private',
        typeName: 'โรงพยาบาลเอกชน',
        address: 'สุขุมวิท 49 แขวงคลองตันเหนือ เขตวัฒนา กรุงเทพฯ',
        tel: '02-022-2222',
        lat: 13.7371,
        lng: 100.5772,
        services: ['ศูนย์วัคซีนสำหรับผู้ใหญ่', 'RSV', 'High-dose Flu', 'HPV']
    }
];

// ==========================================================================
// STATE MANAGEMENT & AUTHENTICATED FETCH HELPER
// ==========================================================================
let currentUser = null;
let currentUserId = null;
let currentAuthToken = null; // JWT Session Token
let userAccountInfo = null; // LINE, PDPA, and Notification settings
let userState = {
    profile: null,
    records: []
};
let activeDrilldownStatus = null;
let userCurrentCoords = null; // { lat, lng }
let activeNearbyFilter = 'all';

// Secure authenticated fetch helper (automatically injects Bearer JWT)
async function authFetch(url, options = {}) {
    const headers = options.headers ? { ...options.headers } : {};
    if (currentAuthToken) {
        headers['Authorization'] = `Bearer ${currentAuthToken}`;
    }
    const response = await fetch(url, { ...options, headers });
    if (response.status === 401 && currentUserId) {
        console.warn('Session expired or unauthorized');
        logout();
    }
    return response;
}

// DOM Cache
const dom = {
    // Screens
    screenLanding: document.getElementById('screen-landing'),
    screenAuth: document.getElementById('screen-auth'),
    screenProfile: document.getElementById('screen-profile'),
    screenHub: document.getElementById('screen-dashboard-hub'),
    
    // Top Header Nav & Brand
    logoBrand: document.getElementById('logoBrand'),
    navLinkHome: document.getElementById('navLinkHome'),
    navLinkPromo: document.getElementById('navLinkPromo'),
    navLinkArticles: document.getElementById('navLinkArticles'),
    navLinkAuth: document.getElementById('navLinkAuth'),

    // Landing Page Actions
    btnGetStarted: document.getElementById('btnGetStarted'),
    btnLandingLineLogin: document.getElementById('btnLandingLineLogin'),
    btnLandingSignIn: document.getElementById('btnLandingSignIn'),
    btnLandingCtaAssess: document.getElementById('btnLandingCtaAssess'),
    btnBackToLandingFromAuth: document.getElementById('btnBackToLandingFromAuth'),
    btnBackToLandingFromProfile: document.getElementById('btnBackToLandingFromProfile'),
    goToRegisterFromLogin: document.getElementById('goToRegisterFromLogin'),
    
    // Landing Sections Elements
    landingPromoSearchInput: document.getElementById('landingPromoSearchInput'),
    landingPromoPackagesGrid: document.getElementById('landingPromoPackagesGrid'),
    landingPromoFilterChips: document.querySelectorAll('button[data-landing-promo-filter]'),
    landingArticlesGrid: document.getElementById('landingArticlesGrid'),
    landingArticleFilterChips: document.querySelectorAll('button[data-landing-article-filter]'),
    
    // Auth Forms & LINE Login
    lineLoginBtn: document.getElementById('lineLoginBtn'),
    loginForm: document.getElementById('loginForm'),
    loginUsername: document.getElementById('login-username'),
    loginPass: document.getElementById('login-password'),
    loginErr: document.getElementById('login-error-msg'),
    loginContainer: document.getElementById('login-container'),
    logoutBtn: document.getElementById('logoutBtn'),
    
    // Profile Forms & PDPA
    profileForm: document.getElementById('profileForm'),
    nationalId: document.getElementById('nationalId'),
    nationalIdNotice: document.getElementById('nationalIdNotice'),
    fullName: document.getElementById('fullName'),
    phone: document.getElementById('phone'),
    phoneNotice: document.getElementById('phoneNotice'),
    btnQuickLineLogin: document.getElementById('btnQuickLineLogin'),
    email: document.getElementById('email'),
    regPassword: document.getElementById('regPassword'),
    regConfirmPassword: document.getElementById('regConfirmPassword'),
    regPasswordMatchHint: document.getElementById('regPasswordMatchHint'),
    toggleRegPassBtn: document.getElementById('toggleRegPassBtn'),
    toggleRegConfirmPassBtn: document.getElementById('toggleRegConfirmPassBtn'),
    toggleLoginPassBtn: document.getElementById('toggleLoginPassBtn'),
    dob: document.getElementById('dob'),
    genderFemale: document.querySelector('input[name="gender"][value="female"]'),
    genderMale: document.querySelector('input[name="gender"][value="male"]'),
    pregnancyToggleGroup: document.getElementById('pregnancy-toggle-group'),
    isPregnant: document.getElementById('isPregnant'),
    gestationalGroup: document.getElementById('gestational-group'),
    gestationalWeeks: document.getElementById('gestationalWeeks'),
    conditionNone: document.getElementById('profile-condition-none'),
    conditionCheckboxes: document.querySelectorAll('input[name="conditions"]'),
    profilePdpaConsent: document.getElementById('profilePdpaConsent'),
    viewPdpaTermsBtn: document.getElementById('viewPdpaTermsBtn'),
    saveProfileBtn: document.getElementById('saveProfileBtn'),
    
    // Hub Header
    currentUserName: document.getElementById('currentUserName'),
    currentUserProfileText: document.getElementById('currentUserProfileText'),
    lineLinkedBadge: document.getElementById('lineLinkedBadge'),
    editProfileBtn: document.getElementById('editProfileBtn'),
    notifSettingsBtn: document.getElementById('notifSettingsBtn'),
    exportDataBtn: document.getElementById('exportDataBtn'),
    themeToggleBtn: document.getElementById('themeToggleBtn'),
    
    // Tabs Navigation (4 tabs)
    tabNavAnalysis: document.getElementById('tabNavAnalysis'),
    tabNavLogbook: document.getElementById('tabNavLogbook'),
    tabNavNearby: document.getElementById('tabNavNearby'),
    tabNavPromo: document.getElementById('tabNavPromo'),
    tabNavArticles: document.getElementById('tabNavArticles'),
    subScreenAnalysis: document.getElementById('sub-screen-analysis'),
    subScreenLogbook: document.getElementById('sub-screen-logbook'),
    subScreenNearby: document.getElementById('sub-screen-nearby'),
    subScreenPromo: document.getElementById('sub-screen-promo'),
    subScreenArticles: document.getElementById('sub-screen-articles'),
    
    // Sub-screen C grids
    highlyRecommendedGrid: document.getElementById('highlyRecommendedGrid'),
    optionalRecommendedGrid: document.getElementById('optionalRecommendedGrid'),
    contraindicatedSection: document.getElementById('contraindicatedSection'),
    contraindicatedGrid: document.getElementById('contraindicatedGrid'),
    
    // Sub-screen D logbook & Roadmap
    logbookCoverageSubtitle: document.getElementById('logbookCoverageSubtitle'),
    logbookCoveragePercent: document.getElementById('logbookCoveragePercent'),
    logbookProgressFill: document.getElementById('logbookProgressFill'),
    logbookMetricChips: document.querySelectorAll('button[data-roadmap-filter]'),
    statAllCount: document.getElementById('statAllCount'),
    statUrgentCount: document.getElementById('statUrgentCount'),
    statInProgressCount: document.getElementById('statInProgressCount'),
    statCompletedCount: document.getElementById('statCompletedCount'),
    logbookStepperGrid: document.getElementById('logbookStepperGrid'),
    addNewRecordBtn: document.getElementById('addNewRecordBtn'),
    logbookHistoryTable: document.getElementById('logbookHistoryTable'),
    logbookHistoryBody: document.getElementById('logbookHistoryBody'),
    emptyLogState: document.getElementById('emptyLogState'),
    
    // Sub-screen E Nearby Finder
    nearbySearchInput: document.getElementById('nearbySearchInput'),
    btnUseMyLocation: document.getElementById('btnUseMyLocation'),
    nearbyClinicsGrid: document.getElementById('nearbyClinicsGrid'),
    filterChips: document.querySelectorAll('#sub-screen-nearby .chip-btn'),

    // Sub-screen F Promo Packages
    promoSearchInput: document.getElementById('promoSearchInput'),
    promoPackagesGrid: document.getElementById('promoPackagesGrid'),
    promoFilterChips: document.querySelectorAll('button[data-promo-filter]'),

    // Sub-screen G Articles Knowledge Hub
    articleSearchInput: document.getElementById('articleSearchInput'),
    articlesGrid: document.getElementById('articlesGrid'),
    articleFilterChips: document.querySelectorAll('button[data-article-filter]'),
    
    // Modals
    recordModal: document.getElementById('recordModal'),
    recordModalCloseBtn: document.getElementById('recordModalCloseBtn'),
    recordModalCancelBtn: document.getElementById('recordModalCancelBtn'),
    recordForm: document.getElementById('recordForm'),
    editRecordId: document.getElementById('editRecordId'),
    recordVaccine: document.getElementById('recordVaccine'),
    recordDose: document.getElementById('recordDose'),
    recordDate: document.getElementById('recordDate'),
    recordBrand: document.getElementById('recordBrand'),
    recordBrandOtherGroup: document.getElementById('recordBrandOtherGroup'),
    recordBrandOther: document.getElementById('recordBrandOther'),
    recordLocation: document.getElementById('recordLocation'),
    recordSaveBtn: document.getElementById('recordSaveBtn'),
    modalTitle: document.getElementById('modalTitle'),
    
    // Notification Modal
    notifModal: document.getElementById('notifModal'),
    notifModalCloseBtn: document.getElementById('notifModalCloseBtn'),
    notifModalCancelBtn: document.getElementById('notifModalCancelBtn'),
    settingNotifyToggle: document.getElementById('settingNotifyToggle'),
    settingAdvanceDays: document.getElementById('settingAdvanceDays'),
    saveNotifSettingsBtn: document.getElementById('saveNotifSettingsBtn'),
    
    // PDPA Modal
    pdpaModal: document.getElementById('pdpaModal'),
    pdpaModalCloseBtn: document.getElementById('pdpaModalCloseBtn'),
    pdpaModalCloseFooterBtn: document.getElementById('pdpaModalCloseFooterBtn'),

    // Reset Password Modal
    btnOpenForgotPassword: document.getElementById('btnOpenForgotPassword'),
    resetPassModal: document.getElementById('resetPassModal'),
    resetPassModalCloseBtn: document.getElementById('resetPassModalCloseBtn'),
    resetPassModalCancelBtn: document.getElementById('resetPassModalCancelBtn'),
    resetPassForm: document.getElementById('resetPassForm'),
    resetIdentifier: document.getElementById('resetIdentifier') || document.getElementById('resetNationalId'),
    resetNationalId: document.getElementById('resetNationalId') || document.getElementById('resetIdentifier'),
    resetVerifyValue: document.getElementById('resetVerifyValue'),
    resetNewPassword: document.getElementById('resetNewPassword'),
    resetConfirmNewPassword: document.getElementById('resetConfirmNewPassword'),
    toggleResetNewPassBtn: document.getElementById('toggleResetNewPassBtn'),
    toggleResetConfirmNewPassBtn: document.getElementById('toggleResetConfirmNewPassBtn'),
    resetPassErrorMsg: document.getElementById('resetPassErrorMsg'),
    resetMatchHint: document.getElementById('resetMatchHint'),
    btnSubmitResetPass: document.getElementById('btnSubmitResetPass'),

    // Export Modal
    exportModal: document.getElementById('exportModal'),
    exportModalCloseBtn: document.getElementById('exportModalCloseBtn'),
    exportModalCancelBtn: document.getElementById('exportModalCancelBtn'),
    btnExportCertificate: document.getElementById('btnExportCertificate'),
    btnExportCalendar: document.getElementById('btnExportCalendar'),
    btnExportJsonRaw: document.getElementById('btnExportJsonRaw'),

    // Article Reader Modal
    articleModal: document.getElementById('articleModal'),
    articleModalCategory: document.getElementById('articleModalCategory'),
    articleModalReadTime: document.getElementById('articleModalReadTime'),
    articleModalCloseBtn: document.getElementById('articleModalCloseBtn'),
    articleModalCloseFooterBtn: document.getElementById('articleModalCloseFooterBtn'),
    articleModalBody: document.getElementById('articleModalBody'),
    articleModalActions: document.getElementById('articleModalActions')
};

// ==========================================================================
// INITIALIZATION
// ==========================================================================
document.addEventListener('DOMContentLoaded', async () => {
    loadGlobalData();
    setupAuthListeners();
    setupProfileFormListeners();
    setupDashboardHubListeners();
    setupNearbyFinderListeners();
    setupModalListeners();
    applyTheme();
    
    // Initial display: Landing Page for new users, or Dashboard Hub for active sessions
    if (currentUser && currentUserId) {
        await loadUserSession();
    } else {
        showScreen('screenLanding');
    }

    // Initialize LINE LIFF in background
    try {
        await initLiff();
    } catch (e) {
        console.warn('LIFF startup info:', e);
    }
});

function loadGlobalData() {
    try {
        const savedCurrentUser = localStorage.getItem('vaccine_current_user');
        if (savedCurrentUser) currentUser = savedCurrentUser;
        const savedCurrentUserId = localStorage.getItem('vaccine_current_user_id');
        if (savedCurrentUserId) currentUserId = savedCurrentUserId;
        const savedToken = localStorage.getItem('vaccine_auth_token');
        if (savedToken) currentAuthToken = savedToken;
        
        const savedTheme = localStorage.getItem('vaccine_theme') || 'light';
        document.documentElement.setAttribute('data-theme', savedTheme);
    } catch (e) {
        console.error('Failed to load global data', e);
    }
}

// ==========================================================================
// LINE LIFF INTEGRATION (1-Click Login & Profile Sync)
// ==========================================================================
const LIFF_ID = '2011358854-HGoAIOsy'; // LINE Login LIFF ID
let liffInitialized = false;
let liffInitPromise = null;

async function initLiff() {
    if (typeof liff === 'undefined') return;
    if (liffInitPromise) return liffInitPromise;

    liffInitPromise = (async () => {
        try {
            await liff.init({ liffId: LIFF_ID });
            liffInitialized = true;
            if (liff.isLoggedIn()) {
                const profile = await liff.getProfile();
                const idToken = liff.getIDToken();
                await loginWithLine(profile, idToken);
            } else if (liff.isInClient()) {
                liff.login();
            }
        } catch (err) {
            console.warn('LIFF init warning:', err);
        }
    })();

    return liffInitPromise;
}

async function loginWithLine(profile, idToken) {
    try {
        const res = await fetch('/api/line/liff-auth', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                idToken: idToken,
                lineUserId: profile.userId,
                displayName: profile.displayName,
                pictureUrl: profile.pictureUrl
            })
        });

        if (!res.ok) {
            const errData = await res.json().catch(() => ({}));
            throw new Error(errData.error || 'LINE Auth failed');
        }
        const data = await res.json();

        currentUser = data.displayName || data.username;
        currentUserId = data.id;
        if (data.token) {
            currentAuthToken = data.token;
            localStorage.setItem('vaccine_auth_token', currentAuthToken);
        }
        localStorage.setItem('vaccine_current_user', currentUser);
        localStorage.setItem('vaccine_current_user_id', currentUserId);

        await loadUserSession();
    } catch (err) {
        console.error('Error in LINE login:', err);
        showScreen('screenLanding');
    }
}

// ==========================================================================
// SESSION MANAGEMENT
// ==========================================================================
async function loadUserSession() {
    if (!currentUserId || !currentAuthToken) {
        logout();
        return;
    }
    try {
        const res = await authFetch(`/api/user?id=${currentUserId}`);
        if (!res.ok) throw new Error('Failed to load session');
        
        const data = await res.json();
        userState.profile = data.profile || null;
        userState.records = data.records || [];
        userAccountInfo = data.accountInfo || {};
        
        if (userState.profile && userState.profile.dob) {
            showScreen('screenHub');
            renderDashboardHub();
        } else {
            showScreen('screenProfile');
            resetProfileForm();
        }
    } catch (err) {
        console.error('Failed to load user session', err);
        showScreen('screenLanding');
    }
}

function logout() {
    currentUser = null;
    currentUserId = null;
    currentAuthToken = null;
    userAccountInfo = null;
    userState = { profile: null, records: [] };
    activeDrilldownStatus = null;
    localStorage.removeItem('vaccine_auth_token');
    localStorage.removeItem('vaccine_current_user');
    localStorage.removeItem('vaccine_current_user_id');
    showScreen('screenLanding');
    if (dom.loginUsername) dom.loginUsername.value = '';
    if (dom.loginPass) dom.loginPass.value = '';
    if (dom.loginErr) dom.loginErr.style.display = 'none';
    updateHeaderAuthState();
}

// ==========================================================================
// SCREEN SWITCHING, HEADER AUTH STATE & THEME
// ==========================================================================
function updateHeaderAuthState() {
    if (!dom.navLinkAuth) return;

    if (currentUser && currentUserId) {
        let displayName = 'บัญชีของฉัน';
        if (userState.profile && userState.profile.fullName) {
            const firstPart = userState.profile.fullName.trim().split(' ')[0];
            displayName = `คุณ${firstPart.length > 8 ? firstPart.substring(0, 8) + '...' : firstPart}`;
        }
        dom.navLinkAuth.innerHTML = `<i class="fa-solid fa-circle-user" style="color: #38bdf8; font-size: 15px;"></i> <span>${displayName}</span>`;
        dom.navLinkAuth.title = 'ไปยังแดชบอร์ดและประวัติสุขภาพของคุณ';
    } else {
        dom.navLinkAuth.innerHTML = `<i class="fa-solid fa-right-to-bracket"></i> <span>เข้าสู่ระบบ</span>`;
        dom.navLinkAuth.title = 'เข้าสู่ระบบ';
    }
}

function showScreen(screenKey) {
    const screens = {
        screenLanding: document.getElementById('screen-landing'),
        screenAuth: document.getElementById('screen-auth'),
        screenProfile: document.getElementById('screen-profile'),
        screenHub: document.getElementById('screen-dashboard-hub')
    };
    
    Object.keys(screens).forEach(key => {
        const el = screens[key];
        if (el) {
            if (key === screenKey) {
                el.classList.add('active');
                el.style.display = 'block';
                el.style.opacity = '1';
                el.style.transform = 'translateY(0)';
            } else {
                el.classList.remove('active');
                el.style.display = 'none';
                el.style.opacity = '0';
            }
        }
    });

    // Update Header Navigation Active State
    if (dom.navLinkHome) dom.navLinkHome.classList.toggle('active', screenKey === 'screenLanding');
    if (dom.navLinkAuth) dom.navLinkAuth.classList.toggle('active', screenKey === 'screenAuth' || (screenKey === 'screenHub' && !!currentUser));

    updateHeaderAuthState();
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function applyTheme() {
    const theme = document.documentElement.getAttribute('data-theme') || 'light';
    const icon = dom.themeToggleBtn.querySelector('i');
    if (theme === 'dark') {
        icon.className = 'fa-solid fa-sun';
    } else {
        icon.className = 'fa-solid fa-moon';
    }
}

dom.themeToggleBtn.addEventListener('click', () => {
    let currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
    let newTheme = currentTheme === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('vaccine_theme', newTheme);
    applyTheme();
});

// ==========================================================================
// SCREEN A & 1: LANDING & AUTHENTICATION LISTENERS
// ==========================================================================
function setupAuthListeners() {
    // 0. Top Header Navigation Listeners
    if (dom.logoBrand) {
        dom.logoBrand.addEventListener('click', () => {
            if (currentUser && currentUserId && userState.profile && userState.profile.dob) {
                showScreen('screenHub');
                if (dom.tabNavAnalysis) dom.tabNavAnalysis.click();
            } else {
                showScreen('screenLanding');
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        });
    }

    if (dom.navLinkHome) {
        dom.navLinkHome.addEventListener('click', () => {
            if (currentUser && currentUserId && userState.profile && userState.profile.dob) {
                showScreen('screenHub');
                if (dom.tabNavAnalysis) dom.tabNavAnalysis.click();
            } else {
                showScreen('screenLanding');
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        });
    }

    if (dom.navLinkPromo) {
        dom.navLinkPromo.addEventListener('click', () => {
            const landing = document.getElementById('screen-landing');
            if (landing && landing.classList.contains('active')) {
                const el = document.getElementById('landing-promos-section');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
            } else if (currentUser && currentUserId) {
                showScreen('screenHub');
                if (dom.tabNavPromo) dom.tabNavPromo.click();
            } else {
                showScreen('screenLanding');
                setTimeout(() => {
                    const el = document.getElementById('landing-promos-section');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                }, 100);
            }
        });
    }

    if (dom.navLinkArticles) {
        dom.navLinkArticles.addEventListener('click', () => {
            const landing = document.getElementById('screen-landing');
            if (landing && landing.classList.contains('active')) {
                const el = document.getElementById('landing-articles-section');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
            } else if (currentUser && currentUserId) {
                showScreen('screenHub');
                if (dom.tabNavArticles) dom.tabNavArticles.click();
            } else {
                showScreen('screenLanding');
                setTimeout(() => {
                    const el = document.getElementById('landing-articles-section');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                }, 100);
            }
        });
    }

    if (dom.navLinkAuth) {
        dom.navLinkAuth.addEventListener('click', () => {
            if (currentUser && currentUserId) {
                if (userState.profile && userState.profile.dob) {
                    showScreen('screenHub');
                } else {
                    showScreen('screenProfile');
                }
            } else {
                showScreen('screenAuth');
            }
        });
    }

    // 1. Landing Page Navigation
    if (dom.btnGetStarted) {
        dom.btnGetStarted.addEventListener('click', () => {
            showScreen('screenProfile');
            resetProfileForm();
        });
    }

    if (dom.btnLandingCtaAssess) {
        dom.btnLandingCtaAssess.addEventListener('click', () => {
            showScreen('screenProfile');
            resetProfileForm();
        });
    }

    if (dom.btnLandingSignIn) {
        dom.btnLandingSignIn.addEventListener('click', () => {
            showScreen('screenAuth');
        });
    }

    if (dom.goToRegisterFromLogin) {
        dom.goToRegisterFromLogin.addEventListener('click', () => {
            showScreen('screenProfile');
            resetProfileForm();
        });
    }

    if (dom.btnBackToLandingFromAuth) {
        dom.btnBackToLandingFromAuth.addEventListener('click', () => {
            showScreen('screenLanding');
        });
    }

    if (dom.btnBackToLandingFromProfile) {
        dom.btnBackToLandingFromProfile.addEventListener('click', () => {
            showScreen('screenLanding');
        });
    }

    // Landing Promo Search Input
    if (dom.landingPromoSearchInput) {
        dom.landingPromoSearchInput.addEventListener('input', (e) => {
            renderLandingPromos(e.target.value.trim());
        });
    }

    // Landing Promo Filter Chips
    if (dom.landingPromoFilterChips) {
        dom.landingPromoFilterChips.forEach(chip => {
            chip.addEventListener('click', () => {
                dom.landingPromoFilterChips.forEach(c => c.classList.remove('active'));
                chip.classList.add('active');
                activeLandingPromoFilter = chip.getAttribute('data-landing-promo-filter') || 'all';
                const kw = dom.landingPromoSearchInput ? dom.landingPromoSearchInput.value.trim() : '';
                renderLandingPromos(kw);
            });
        });
    }

    // Landing Article Filter Chips
    if (dom.landingArticleFilterChips) {
        dom.landingArticleFilterChips.forEach(chip => {
            chip.addEventListener('click', () => {
                dom.landingArticleFilterChips.forEach(c => c.classList.remove('active'));
                chip.classList.add('active');
                activeLandingArticleFilter = chip.getAttribute('data-landing-article-filter') || 'all';
                renderLandingArticles();
            });
        });
    }

    // Initial Render of Landing Sections
    renderLandingPromos();
    renderLandingArticles();

    // LINE Login Action (Direct Official LIFF Redirect)
    const handleLineLogin = async (btn) => {
        if (btn) {
            btn.disabled = true;
            btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin" style="font-size: 20px;"></i> กำลังเปิด LINE...';
        }
        try {
            if (typeof liff !== 'undefined') {
                if (!liffInitialized) {
                    await liff.init({ liffId: LIFF_ID });
                    liffInitialized = true;
                }
                if (liff.isLoggedIn()) {
                    const profile = await liff.getProfile();
                    const idToken = liff.getIDToken();
                    await loginWithLine(profile, idToken);
                    return;
                } else {
                    const returnUrl = window.location.origin + window.location.pathname;
                    liff.login({ redirectUri: returnUrl });
                    return;
                }
            }
        } catch (err) {
            console.warn('LIFF login warning:', err);
        }
        window.location.href = `https://liff.line.me/${LIFF_ID}`;
    };

    if (dom.btnLandingLineLogin) {
        dom.btnLandingLineLogin.addEventListener('click', (e) => {
            e.preventDefault();
            handleLineLogin(dom.btnLandingLineLogin);
        });
    }

    if (dom.lineLoginBtn) {
        dom.lineLoginBtn.addEventListener('click', (e) => {
            e.preventDefault();
            handleLineLogin(dom.lineLoginBtn);
        });
    }

    // Password Visibility Toggles
    setupPasswordToggles();

    // Username/Password Login Form
    if (dom.loginForm) {
        dom.loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const username = dom.loginUsername.value.trim();
            const password = dom.loginPass.value;
            
            try {
                const submitBtn = dom.loginForm.querySelector('button[type="submit"]');
                if (submitBtn) {
                    submitBtn.disabled = true;
                    submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> กำลังเข้าสู่ระบบ...';
                }

                const res = await fetch('/api/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username, password })
                });
                
                const data = await res.json();
                if (!res.ok) throw new Error(data.error || 'ชื่อผู้ใช้งาน หรือ รหัสผ่าน ไม่ถูกต้อง');
                
                currentUser = data.displayName || data.username || data.fullName;
                currentUserId = data.id;
                if (data.token) {
                    currentAuthToken = data.token;
                    localStorage.setItem('vaccine_auth_token', currentAuthToken);
                }
                localStorage.setItem('vaccine_current_user', currentUser);
                localStorage.setItem('vaccine_current_user_id', currentUserId);
                if (dom.loginErr) dom.loginErr.style.display = 'none';
                await loadUserSession();
            } catch (err) {
                if (dom.loginErr) {
                    dom.loginErr.textContent = '❌ ' + err.message;
                    dom.loginErr.style.display = 'block';
                }
            } finally {
                const submitBtn = dom.loginForm.querySelector('button[type="submit"]');
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = 'เข้าสู่ระบบ <i class="fa-solid fa-right-to-bracket icon-right"></i>';
                }
            }
        });
    }

    if (dom.logoutBtn) {
        dom.logoutBtn.addEventListener('click', logout);
    }
}

function setupPasswordToggles() {
    const bindToggle = (btnEl, inputEl) => {
        if (!btnEl || !inputEl) return;
        btnEl.addEventListener('click', (e) => {
            e.preventDefault();
            const isPass = inputEl.type === 'password';
            inputEl.type = isPass ? 'text' : 'password';
            const icon = btnEl.querySelector('i');
            if (icon) {
                icon.className = isPass ? 'fa-solid fa-eye-slash' : 'fa-solid fa-eye';
            }
        });
    };

    bindToggle(dom.toggleLoginPassBtn, dom.loginPass);
    bindToggle(dom.toggleRegPassBtn, dom.regPassword);
    bindToggle(dom.toggleRegConfirmPassBtn, dom.regConfirmPassword);
    bindToggle(dom.toggleResetNewPassBtn, dom.resetNewPassword);
    bindToggle(dom.toggleResetConfirmNewPassBtn, dom.resetConfirmNewPassword);
}

// Thai National ID and Phone Format Helpers
function formatNationalId(val) {
    const digits = (val || '').replace(/\D/g, '').substring(0, 13);
    let res = '';
    for (let i = 0; i < digits.length; i++) {
        if (i === 1 || i === 5 || i === 10 || i === 12) {
            res += '-';
        }
        res += digits[i];
    }
    return res;
}

function formatPhone(val) {
    const digits = (val || '').replace(/\D/g, '').substring(0, 10);
    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
    return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
}

function isValidThaiNationalId(idStr) {
    const clean = (idStr || '').replace(/\D/g, '');
    if (clean.length !== 13) return false;
    let sum = 0;
    for (let i = 0; i < 12; i++) {
        sum += parseInt(clean[i]) * (13 - i);
    }
    const checkDigit = (11 - (sum % 11)) % 10;
    return checkDigit === parseInt(clean[12]);
}

// ==========================================================================
// SCREEN B & 3: HEALTH PROFILE & REGISTRATION FORM LISTENERS
// ==========================================================================
function setupProfileFormListeners() {
    let nationalIdCheckTimeout = null;
    let phoneCheckTimeout = null;

    // Phone Input Auto-formatter & Live Duplicate Checker (Primary Identity)
    if (dom.phone) {
        dom.phone.addEventListener('input', (e) => {
            e.target.value = formatPhone(e.target.value);
            const cleanPhone = e.target.value.replace(/\D/g, '');

            if (phoneCheckTimeout) clearTimeout(phoneCheckTimeout);

            if (cleanPhone.length >= 10) {
                phoneCheckTimeout = setTimeout(() => {
                    checkExistingPhone(cleanPhone);
                }, 250);
            } else {
                if (dom.phoneNotice) {
                    dom.phoneNotice.style.display = 'none';
                }
            }
        });
    }

    // Quick LINE Login Button from Registration screen
    if (dom.btnQuickLineLogin) {
        dom.btnQuickLineLogin.addEventListener('click', (e) => {
            e.preventDefault();
            if (dom.lineLoginBtn) {
                dom.lineLoginBtn.click();
            } else {
                initiateLineLogin();
            }
        });
    }

    // Optional National ID Input Auto-formatter & Duplicate Checker
    if (dom.nationalId) {
        dom.nationalId.addEventListener('input', (e) => {
            e.target.value = formatNationalId(e.target.value);
            const cleanId = e.target.value.replace(/\D/g, '');

            if (nationalIdCheckTimeout) clearTimeout(nationalIdCheckTimeout);
            
            if (cleanId.length === 13) {
                nationalIdCheckTimeout = setTimeout(() => {
                    checkExistingNationalId(cleanId);
                }, 250);
            } else {
                if (dom.nationalIdNotice) {
                    dom.nationalIdNotice.style.display = 'none';
                }
            }
        });
    }

    const genderRadios = document.querySelectorAll('input[name="gender"]');
    genderRadios.forEach(radio => {
        radio.addEventListener('change', (e) => {
            const genderVal = e.target.value;
            if (genderVal === 'female') {
                dom.pregnancyToggleGroup.classList.add('show');
            } else {
                dom.pregnancyToggleGroup.classList.remove('show');
                dom.isPregnant.checked = false;
                dom.gestationalGroup.classList.remove('show');
                dom.gestationalWeeks.value = '';
                dom.gestationalWeeks.required = false;
            }
        });
    });
    
    dom.isPregnant.addEventListener('change', (e) => {
        if (e.target.checked) {
            dom.gestationalGroup.classList.add('show');
            dom.gestationalWeeks.required = true;
        } else {
            dom.gestationalGroup.classList.remove('show');
            dom.gestationalWeeks.value = '';
            dom.gestationalWeeks.required = false;
        }
    });
    
    dom.conditionCheckboxes.forEach(cb => {
        cb.addEventListener('change', (e) => {
            const checkedVal = e.target.value;
            const card = e.target.closest('.checkbox-card');
            
            if (checkedVal === 'none' && e.target.checked) {
                dom.conditionCheckboxes.forEach(item => {
                    if (item.value !== 'none') {
                        item.checked = false;
                        item.closest('.checkbox-card').classList.remove('selected-card');
                    }
                });
            } else if (checkedVal !== 'none' && e.target.checked) {
                dom.conditionNone.checked = false;
                dom.conditionNone.closest('.checkbox-card').classList.remove('selected-card');
            }
            
            if (e.target.checked) {
                card.classList.add('selected-card');
            } else {
                card.classList.remove('selected-card');
            }
        });
    });

    dom.viewPdpaTermsBtn.addEventListener('click', (e) => {
        e.preventDefault();
        dom.pdpaModal.classList.add('open');
    });
    
    // Password live match check
    if (dom.regPassword && dom.regConfirmPassword) {
        const checkPassMatch = () => {
            const p1 = dom.regPassword.value;
            const p2 = dom.regConfirmPassword.value;
            if (!dom.regPasswordMatchHint) return;

            if (!p1 && !p2) {
                dom.regPasswordMatchHint.textContent = 'พิมพ์รหัสผ่านทั้ง 2 ช่องให้ตรงกัน';
                dom.regPasswordMatchHint.style.color = 'var(--text-muted)';
            } else if (p1 && p1.length < 6) {
                dom.regPasswordMatchHint.textContent = '⚠️ รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร';
                dom.regPasswordMatchHint.style.color = '#d97706';
            } else if (p1 && p2 && p1 === p2) {
                dom.regPasswordMatchHint.textContent = '✓ รหัสผ่านตรงกันเรียบร้อย';
                dom.regPasswordMatchHint.style.color = '#059640';
            } else if (p2 && p1 !== p2) {
                dom.regPasswordMatchHint.textContent = '✗ รหัสผ่านไม่ตรงกัน';
                dom.regPasswordMatchHint.style.color = '#dc2626';
            }
        };

        dom.regPassword.addEventListener('input', checkPassMatch);
        dom.regConfirmPassword.addEventListener('input', checkPassMatch);
    }

    dom.profileForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        if (!dom.profilePdpaConsent.checked) {
            alert('กรุณาให้ความยินยอมตามนโยบายคุ้มครองข้อมูลส่วนบุคคล (PDPA) เพื่อดำเนินการต่อ');
            return;
        }

        const rawNationalId = dom.nationalId ? dom.nationalId.value.trim() : '';
        const cleanNationalId = rawNationalId.replace(/\D/g, '');
        const fullName = dom.fullName ? dom.fullName.value.trim() : '';
        const rawPhone = dom.phone ? dom.phone.value.trim() : '';
        const cleanPhone = rawPhone.replace(/\D/g, '');
        const email = dom.email ? dom.email.value.trim() : '';
        const regPassword = dom.regPassword ? dom.regPassword.value : '';
        const regConfirmPassword = dom.regConfirmPassword ? dom.regConfirmPassword.value : '';

        if (!cleanPhone || cleanPhone.length < 9 || cleanPhone.length > 10 || !cleanPhone.startsWith('0')) {
            alert('กรุณาระบุเบอร์โทรศัพท์มือถือที่ถูกต้อง (10 หลัก ขึ้นต้นด้วย 0) สำหรับใช้เป็นบัญชีเข้าสู่ระบบ');
            if (dom.phone) dom.phone.focus();
            return;
        }

        if (!fullName) {
            alert('กรุณาระบุชื่อ-นามสกุลของคุณ');
            if (dom.fullName) dom.fullName.focus();
            return;
        }

        // Optional Thai National ID: validate only if provided
        if (cleanNationalId && cleanNationalId.length > 0) {
            if (cleanNationalId.length !== 13) {
                alert('หากต้องการระบุเลขประจำตัวประชาชน ต้องกรอกให้ครบถ้วน 13 หลัก หรือสามารถเว้นว่างไว้ได้');
                if (dom.nationalId) dom.nationalId.focus();
                return;
            }
            if (!isValidThaiNationalId(cleanNationalId)) {
                const confirmCont = confirm('⚠️ รูปแบบเลขประจำตัวประชาชน 13 หลักอาจไม่ถูกต้อง คุณต้องการยืนยันบันทึกข้อมูลหรือไม่?');
                if (!confirmCont) {
                    if (dom.nationalId) dom.nationalId.focus();
                    return;
                }
            }
        }

        // Validate Password (required for new user registration, optional on profile edit if empty)
        if (!currentUserId || regPassword || regConfirmPassword) {
            if (!regPassword || regPassword.length < 6) {
                alert('กรุณากำหนดรหัสผ่านอย่างน้อย 6 ตัวอักษร สำหรับใช้เข้าสู่ระบบในครั้งถัดไป');
                if (dom.regPassword) dom.regPassword.focus();
                return;
            }
            if (regPassword !== regConfirmPassword) {
                alert('รหัสผ่านและยืนยันรหัสผ่านไม่ตรงกัน กรุณาตรวจสอบอีกครั้ง');
                if (dom.regConfirmPassword) dom.regConfirmPassword.focus();
                return;
            }
        }

        const dob = dom.dob.value;
        if (!dob) {
            alert('กรุณาเลือกวัน/เดือน/ปี เกิด');
            dom.dob.focus();
            return;
        }

        const gender = document.querySelector('input[name="gender"]:checked').value;
        const pregnant = (gender === 'female') && dom.isPregnant.checked;
        const gestationalWeeks = pregnant ? parseInt(dom.gestationalWeeks.value) : null;
        
        if (pregnant && (!gestationalWeeks || gestationalWeeks < 1 || gestationalWeeks > 42)) {
            alert('กรุณากรอกอายุครรภ์ให้ถูกต้อง (1-42 สัปดาห์)');
            return;
        }
        
        const conditions = [];
        dom.conditionCheckboxes.forEach(cb => {
            if (cb.checked) conditions.push(cb.value);
        });
        
        const profileData = {
            userId: currentUserId,
            password: regPassword || undefined,
            nationalId: cleanNationalId,
            fullName,
            phone: cleanPhone,
            email,
            dob,
            gender,
            pregnant,
            gestationalWeeks,
            conditions,
            consentPdpa: true
        };
        
        try {
            const originalSaveText = dom.saveProfileBtn.innerHTML;
            dom.saveProfileBtn.disabled = true;
            dom.saveProfileBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> กำลังวิเคราะห์วัคซีน...';

            const res = await authFetch('/api/user', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(profileData)
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to save profile');

            currentUserId = data.userId;
            currentUser = fullName || data.displayName || data.username;
            if (data.token) {
                currentAuthToken = data.token;
                localStorage.setItem('vaccine_auth_token', currentAuthToken);
            }
            localStorage.setItem('vaccine_current_user', currentUser);
            localStorage.setItem('vaccine_current_user_id', currentUserId);

            if (data.merged) {
                alert('✅ ระบบตรวจพบประวัติเดิมตามเลขบัตรประชาชน ได้รวมข้อมูลวัคซีนและอัปเดตบัญชีของคุณเรียบร้อยแล้ว');
            }

            userState.profile = { nationalId: cleanNationalId, fullName, phone: cleanPhone, email, dob, gender, pregnant, gestationalWeeks, conditions };
            
            // Navigate directly to Vaccine Analysis Hub (Next Step)
            await loadUserSession();
        } catch (err) {
            alert('❌ เกิดข้อผิดพลาดในการบันทึกข้อมูล: ' + err.message);
        } finally {
            if (dom.saveProfileBtn) {
                dom.saveProfileBtn.disabled = false;
                dom.saveProfileBtn.innerHTML = 'บันทึกข้อมูลและดูผลประเมินวัคซีนทันที <i class="fa-solid fa-arrow-right icon-right"></i>';
            }
        }
    });
}

// Live Check for duplicate Phone Number (PDPA Safe)
async function checkExistingPhone(cleanPhone) {
    if (!dom.phoneNotice) return;
    try {
        const res = await fetch(`/api/check-phone?phone=${cleanPhone}`);
        const data = await res.json();
        if (data.exists) {
            dom.phoneNotice.style.display = 'block';
            dom.phoneNotice.style.backgroundColor = 'rgba(234, 179, 8, 0.12)';
            dom.phoneNotice.style.color = '#b45309';
            dom.phoneNotice.style.border = '1px solid rgba(234, 179, 8, 0.35)';
            dom.phoneNotice.innerHTML = `
                <div style="font-weight: 600; margin-bottom: 4px; display: flex; align-items: center; gap: 6px;">
                    <i class="fa-solid fa-triangle-exclamation" style="color: #d97706;"></i> ตรวจพบข้อมูล: เบอร์โทรศัพท์นี้เคยลงทะเบียนในระบบแล้ว
                </div>
                <div style="font-size: 12.5px; line-height: 1.5; color: #475569;">
                    ท่านมีบัญชีในระบบแล้ว สามารถเข้าสู่ระบบด้วยเบอร์โทรศัพท์นี้ได้ทันที
                </div>
                <div style="margin-top: 8px;">
                    <button type="button" id="btnNoticePhoneGoToLogin" class="btn btn-sm btn-primary" style="padding: 4px 12px; font-size: 12px; border-radius: 6px; cursor: pointer;">
                        <i class="fa-solid fa-right-to-bracket"></i> เข้าสู่ระบบด้วยเบอร์นี้
                    </button>
                </div>
            `;

            const btnLogin = document.getElementById('btnNoticePhoneGoToLogin');
            if (btnLogin) {
                btnLogin.onclick = (e) => {
                    e.preventDefault();
                    showScreen('screenAuth');
                    if (dom.loginUsername) {
                        dom.loginUsername.value = cleanPhone;
                        if (dom.loginPassword) dom.loginPassword.focus();
                    }
                };
            }
        } else {
            dom.phoneNotice.style.display = 'block';
            dom.phoneNotice.style.backgroundColor = 'rgba(37, 99, 235, 0.08)';
            dom.phoneNotice.style.color = '#2563eb';
            dom.phoneNotice.style.border = '1px solid rgba(37, 99, 235, 0.2)';
            dom.phoneNotice.innerHTML = `<i class="fa-solid fa-circle-check" style="color: #059640;"></i> เบอร์โทรศัพท์พร้อมสำหรับการลงทะเบียนใหม่`;
        }
    } catch (e) {
        console.warn('Check phone error:', e);
    }
}

// Live Check for duplicate National ID (PDPA Safe - No Unauthenticated Medical Data Leak)
async function checkExistingNationalId(cleanId) {
    if (!dom.nationalIdNotice) return;
    try {
        const res = await fetch(`/api/check-national-id?nationalId=${cleanId}`);
        const data = await res.json();
        if (data.exists) {
            dom.nationalIdNotice.style.display = 'block';
            dom.nationalIdNotice.style.backgroundColor = 'rgba(234, 179, 8, 0.12)';
            dom.nationalIdNotice.style.color = '#b45309';
            dom.nationalIdNotice.style.border = '1px solid rgba(234, 179, 8, 0.35)';
            dom.nationalIdNotice.innerHTML = `
                <div style="font-weight: 600; margin-bottom: 4px; display: flex; align-items: center; gap: 6px;">
                    <i class="fa-solid fa-triangle-exclamation" style="color: #d97706;"></i> ตรวจพบข้อมูล: เลขบัตรประชาชนนี้เคยลงทะเบียนในระบบแล้ว
                </div>
                <div style="font-size: 12.5px; line-height: 1.5; color: #475569;">
                    เพื่อความปลอดภัยและการคุ้มครองข้อมูลสุขภาพส่วนบุคคล (PDPA) กรุณาเข้าสู่ระบบเพื่อเข้าถึงและจัดการข้อมูลของคุณ
                </div>
                <div style="margin-top: 8px;">
                    <button type="button" id="btnNoticeGoToLogin" class="btn btn-sm btn-primary" style="padding: 4px 12px; font-size: 12px; border-radius: 6px; cursor: pointer;">
                        <i class="fa-solid fa-right-to-bracket"></i> ไปที่หน้าเข้าสู่ระบบ
                    </button>
                </div>
            `;

            const btnLogin = document.getElementById('btnNoticeGoToLogin');
            if (btnLogin) {
                btnLogin.onclick = (e) => {
                    e.preventDefault();
                    showScreen('screenAuth');
                    if (dom.loginUsername) {
                        dom.loginUsername.value = cleanId;
                        if (dom.loginPassword) dom.loginPassword.focus();
                    }
                };
            }
        } else {
            dom.nationalIdNotice.style.display = 'block';
            dom.nationalIdNotice.style.backgroundColor = 'rgba(37, 99, 235, 0.08)';
            dom.nationalIdNotice.style.color = '#2563eb';
            dom.nationalIdNotice.style.border = '1px solid rgba(37, 99, 235, 0.2)';
            dom.nationalIdNotice.innerHTML = `<i class="fa-solid fa-id-card"></i> เลขบัตรประชาชน 13 หลักถูกต้อง พร้อมสำหรับการลงทะเบียนใหม่`;
        }
    } catch (e) {
        console.warn('Check national ID error:', e);
    }
}


function resetProfileForm() {
    if (dom.phoneNotice) dom.phoneNotice.style.display = 'none';
    if (dom.nationalIdNotice) dom.nationalIdNotice.style.display = 'none';
    if (dom.nationalId) dom.nationalId.value = '';
    if (dom.fullName) dom.fullName.value = '';
    if (dom.phone) dom.phone.value = '';
    if (dom.email) dom.email.value = '';
    if (dom.regPassword) dom.regPassword.value = '';
    if (dom.regConfirmPassword) dom.regConfirmPassword.value = '';
    if (dom.regPasswordMatchHint) {
        dom.regPasswordMatchHint.textContent = 'พิมพ์รหัสผ่านทั้ง 2 ช่องให้ตรงกัน';
        dom.regPasswordMatchHint.style.color = 'var(--text-muted)';
    }
    dom.dob.value = '';
    dom.genderMale.checked = true;
    dom.pregnancyToggleGroup.classList.remove('show');
    dom.isPregnant.checked = false;
    dom.gestationalGroup.classList.remove('show');
    dom.gestationalWeeks.value = '';
    dom.gestationalWeeks.required = false;
    
    dom.conditionCheckboxes.forEach(cb => {
        cb.checked = (cb.value === 'none');
        const card = cb.closest('.checkbox-card');
        if (cb.checked) {
            card.classList.add('selected-card');
        } else {
            card.classList.remove('selected-card');
        }
    });
}

// ==========================================================================
// DASHBOARD HUB & TABS ROUTING (4 Modules)
// ==========================================================================
function setupDashboardHubListeners() {
    dom.editProfileBtn.addEventListener('click', () => {
        const profile = userState.profile;
        if (profile) {
            if (dom.nationalId && profile.nationalId) {
                dom.nationalId.value = formatNationalId(profile.nationalId);
            }
            if (dom.fullName && profile.fullName) {
                dom.fullName.value = profile.fullName;
            }
            if (dom.phone && profile.phone) {
                dom.phone.value = formatPhone(profile.phone);
            }
            if (dom.email && profile.email) {
                dom.email.value = profile.email;
            }
            dom.dob.value = profile.dob || '';
            if (profile.gender === 'female') {
                dom.genderFemale.checked = true;
                dom.pregnancyToggleGroup.classList.add('show');
            } else {
                dom.genderMale.checked = true;
                dom.pregnancyToggleGroup.classList.remove('show');
            }
            
            dom.isPregnant.checked = !!profile.pregnant;
            if (profile.pregnant) {
                dom.gestationalGroup.classList.add('show');
                dom.gestationalWeeks.value = profile.gestationalWeeks || '';
                dom.gestationalWeeks.required = true;
            } else {
                dom.gestationalGroup.classList.remove('show');
                dom.gestationalWeeks.value = '';
                dom.gestationalWeeks.required = false;
            }
            
            dom.conditionCheckboxes.forEach(cb => {
                cb.checked = (profile.conditions || []).includes(cb.value);
                const card = cb.closest('.checkbox-card');
                if (cb.checked) {
                    card.classList.add('selected-card');
                } else {
                    card.classList.remove('selected-card');
                }
            });
        }
        showScreen('screenProfile');
    });

    // Sidebar Collapsible Toggle
    const sidebar = document.getElementById('dashboardSidebar');
    const sidebarToggleBtn = document.getElementById('sidebarToggleBtn');
    if (sidebarToggleBtn && sidebar) {
        // Restore collapse preference on desktop
        if (window.innerWidth > 820 && localStorage.getItem('vaccine_sidebar_collapsed') === '1') {
            sidebar.classList.add('collapsed');
        }

        sidebarToggleBtn.addEventListener('click', () => {
            sidebar.classList.toggle('collapsed');
            const isCollapsed = sidebar.classList.contains('collapsed');
            localStorage.setItem('vaccine_sidebar_collapsed', isCollapsed ? '1' : '0');
        });
    }

    // 5-Tab Switching
    const tabs = [
        { btn: dom.tabNavAnalysis, screen: dom.subScreenAnalysis },
        { btn: dom.tabNavLogbook, screen: dom.subScreenLogbook },
        { btn: dom.tabNavNearby, screen: dom.subScreenNearby },
        { btn: dom.tabNavPromo, screen: dom.subScreenPromo },
        { btn: dom.tabNavArticles, screen: dom.subScreenArticles }
    ];

    tabs.forEach(({ btn, screen }) => {
        if (!btn || !screen) return;
        btn.addEventListener('click', () => {
            tabs.forEach(t => {
                if (t.btn) t.btn.classList.remove('active');
                if (t.screen) t.screen.classList.remove('active');
            });
            btn.classList.add('active');
            screen.classList.add('active');
            
            if (btn === dom.tabNavLogbook) {
                hideDrilldownPanel();
                renderLogbookTab();
            } else if (btn === dom.tabNavNearby) {
                renderNearbyClinics();
            } else if (btn === dom.tabNavPromo) {
                renderPromoTab();
            } else if (btn === dom.tabNavArticles) {
                renderArticlesTab();
            }
        });
    });

    // Promo Category Filter Chips
    if (dom.promoFilterChips) {
        dom.promoFilterChips.forEach(chip => {
            chip.addEventListener('click', () => {
                dom.promoFilterChips.forEach(c => c.classList.remove('active'));
                chip.classList.add('active');
                activePromoFilter = chip.getAttribute('data-promo-filter') || 'all';
                const kw = dom.promoSearchInput ? dom.promoSearchInput.value.trim() : '';
                renderPromoTab(kw);
            });
        });
    }

    // Promo Live Search Input
    if (dom.promoSearchInput) {
        dom.promoSearchInput.addEventListener('input', (e) => {
            renderPromoTab(e.target.value.trim());
        });
    }

    // Article Category Filter Chips
    if (dom.articleFilterChips) {
        dom.articleFilterChips.forEach(chip => {
            chip.addEventListener('click', () => {
                dom.articleFilterChips.forEach(c => c.classList.remove('active'));
                chip.classList.add('active');
                activeArticleFilter = chip.getAttribute('data-article-filter') || 'all';
                const kw = dom.articleSearchInput ? dom.articleSearchInput.value.trim() : '';
                renderArticlesTab(kw);
            });
        });
    }

    // Article Live Search Input
    if (dom.articleSearchInput) {
        dom.articleSearchInput.addEventListener('input', (e) => {
            renderArticlesTab(e.target.value.trim());
        });
    }

    // Roadmap Metric Filter Chips
    if (dom.logbookMetricChips) {
        dom.logbookMetricChips.forEach(chip => {
            chip.addEventListener('click', () => {
                dom.logbookMetricChips.forEach(c => c.classList.remove('active'));
                chip.classList.add('active');
                activeRoadmapFilter = chip.getAttribute('data-roadmap-filter') || 'all';
                renderLogbookTab();
            });
        });
    }

    // Notification Preferences Modal
    dom.notifSettingsBtn.addEventListener('click', () => {
        if (userAccountInfo) {
            dom.settingNotifyToggle.checked = userAccountInfo.notifyEnabled !== false;
            dom.settingAdvanceDays.value = String(userAccountInfo.notifyAdvanceDays || 7);
        }
        dom.notifModal.classList.add('open');
    });

    dom.saveNotifSettingsBtn.addEventListener('click', async () => {
        const notifyEnabled = dom.settingNotifyToggle.checked;
        const notifyAdvanceDays = parseInt(dom.settingAdvanceDays.value);

        try {
            await authFetch('/api/user', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: currentUserId,
                    notifyEnabled,
                    notifyAdvanceDays
                })
            });
            if (userAccountInfo) {
                userAccountInfo.notifyEnabled = notifyEnabled;
                userAccountInfo.notifyAdvanceDays = notifyAdvanceDays;
            }
            alert('✅ บันทึกการตั้งค่าการแจ้งเตือนเรียบร้อยแล้ว');
            dom.notifModal.classList.remove('open');
        } catch (e) {
            alert('❌ บันทึกไม่สำเร็จ: ' + e.message);
        }
    });

    // PDPA Export Data & Calendar Modal
    dom.exportDataBtn.addEventListener('click', () => {
        if (dom.exportModal) dom.exportModal.classList.add('open');
    });
}

function renderDashboardHub() {
    const profile = userState.profile;
    if (!profile) return;
    
    const nameToDisplay = profile.fullName || currentUser || 'ผู้ใช้งาน';
    dom.currentUserName.textContent = `คุณ ${nameToDisplay}`;

    // Show LINE linked badge if applicable
    if (userAccountInfo && userAccountInfo.lineUserId) {
        dom.lineLinkedBadge.style.display = 'inline-flex';
    } else {
        dom.lineLinkedBadge.style.display = 'none';
    }
    
    const age = getAge(profile.dob);
    let detailsText = `อายุ: ${age} ปี • `;
    if (profile.gender === 'female') {
        if (profile.pregnant) {
            detailsText += `เพศหญิง (ตั้งครรภ์ ${profile.gestationalWeeks} สัปดาห์) • `;
        } else {
            detailsText += `เพศหญิง • `;
        }
    } else {
        detailsText += `เพศชาย • `;
    }
    
    if (profile.conditions.includes('none') || profile.conditions.length === 0) {
        detailsText += 'ไม่มีปัจจัยเสี่ยง';
    } else {
        let list = [];
        if (profile.conditions.includes('chronic')) list.push('โรคเรื้อรัง');
        if (profile.conditions.includes('immunocompromised')) list.push('ภูมิคุ้มกันบกพร่อง');
        detailsText += `ปัจจัยเสี่ยง: ${list.join(', ')}`;
    }
    dom.currentUserProfileText.textContent = detailsText;
    
    renderSmartAnalysisTab(age, profile);
    renderLogbookTab();
}

function getAge(dobString) {
    const today = new Date();
    const birthDate = new Date(dobString);
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    return age;
}

// ==========================================================================
// SCREEN C: SMART RECOMMENDATIONS ENGINE
// ==========================================================================
function renderSmartAnalysisTab(age, profile) {
    dom.highlyRecommendedGrid.innerHTML = '';
    dom.optionalRecommendedGrid.innerHTML = '';
    dom.contraindicatedGrid.innerHTML = '';
    
    let isContraindicatedSectionShown = false;
    
    Object.keys(VACCINE_INFO).forEach(id => {
        const info = VACCINE_INFO[id];
        const rec = analyzeVaccineRecommendation(id, age, profile);
        const card = createVaccineAnalysisCardHtml(id, info, rec);
        
        if (rec.status === 'contraindicated') {
            dom.contraindicatedGrid.appendChild(card);
            isContraindicatedSectionShown = true;
        } else if (rec.status === 'highly') {
            dom.highlyRecommendedGrid.appendChild(card);
        } else {
            dom.optionalRecommendedGrid.appendChild(card);
        }
    });
    
    dom.contraindicatedSection.style.display = isContraindicatedSectionShown ? 'block' : 'none';
}

function analyzeVaccineRecommendation(id, age, profile) {
    const isPregnant = Boolean(profile.pregnant);
    const gw = Number(profile.gestationalWeeks) || 0;
    const isImmunocompromised = profile.conditions ? profile.conditions.includes('immunocompromised') : false;
    const isChronic = profile.conditions ? profile.conditions.includes('chronic') : false;
    
    // Check birth year (B.E. 2535 = A.D. 1992) for Hepatitis B routine logic
    let birthYear = null;
    if (profile.dob) {
        const d = new Date(profile.dob);
        if (!isNaN(d.getTime())) birthYear = d.getFullYear();
    }
    const isBornBefore2535 = birthYear !== null ? ((birthYear + 543) < 2535) : (age >= 34);

    // =========================================================================
    // 1. PREGNANCY EVALUATION (สตรีมีครรภ์)
    // =========================================================================
    if (isPregnant) {
        // Contraindicated live vaccines & HPV
        if (['mmr', 'varicella', 'dengue'].includes(id)) {
            return {
                status: 'contraindicated',
                reason: 'สตรีมีครรภ์ห้ามฉีดวัคซีนชนิดเชื้อเป็นอ่อนฤทธิ์ (Live-attenuated) เด็ดขาด เนื่องจากมีความเสี่ยงต่อการแพร่เชื้อสู่ทารกในครรภ์'
            };
        }
        if (id === 'zoster') {
            return {
                status: 'contraindicated',
                reason: 'หลีกเลี่ยงการฉีดวัคซีนงูสวัดในหญิงตั้งครรภ์ (วัคซีนงูสวัดเชื้อเป็น ZVL เป็นข้อห้ามเด็ดขาด ส่วนชนิด RZV แนะนำให้เลื่อนไปฉีดหลังคลอด)'
            };
        }
        if (id === 'hpv') {
            return {
                status: 'contraindicated',
                reason: 'ห้ามฉีดวัคซีน HPV ในระหว่างตั้งครรภ์ หากฉีดค้างไว้ ให้หยุดพักและรับเข็มที่เหลือต่อหลังคลอดบุตร'
            };
        }

        // Pregnancy Specific Recommendations
        if (id === 'tdap') {
            if (gw >= 20 && gw <= 32) {
                return {
                    status: 'highly',
                    reason: `อายุครรภ์ปัจจุบัน ${gw} สัปดาห์: แนะนำฉีด Tdap / TdaP หรือ aP 1 เข็มทันที (ช่วงเวลาทอง 20-32 สัปดาห์) เพื่อสร้างและส่งต่อภูมิคุ้มกันไอกรนคุ้มครองทารกแรกเกิดถึง 6 เดือน`
                };
            } else if (gw > 32) {
                return {
                    status: 'highly',
                    reason: `อายุครรภ์ปัจจุบัน ${gw} สัปดาห์: แนะนำฉีด Tdap 1 เข็มก่อนคลอดอย่างน้อย 2 สัปดาห์ เพื่อให้มีภูมิคุ้มกันไอกรนส่งต่อสู่ทารก`
                };
            } else {
                return {
                    status: 'highly',
                    reason: `อายุครรภ์ปัจจุบัน ${gw} สัปดาห์: แนะนำวางแผนฉีด Tdap 1 เข็มเมื่อเข้าสู่อายุครรภ์ 20-32 สัปดาห์ (สามารถฉีดได้ตั้งแต่อายุครรภ์ 16 สัปดาห์)`
                };
            }
        }

        if (id === 'rsv') {
            if (gw >= 24 && gw <= 36) {
                return {
                    status: 'highly',
                    reason: `อายุครรภ์ปัจจุบัน ${gw} สัปดาห์: แนะนำฉีดวัคซีน Bivalent RSVpreF (Abrysvo) 1 เข็มทันที (อายุครรภ์ 24-36 สัปดาห์ ดีที่สุดช่วง 28-32 สัปดาห์ และก่อนคลอด ≥15 วัน) เพื่อป้องกันปอดอักเสบ RSV รุนแรงในทารกแรกเกิดถึง 6 เดือน`,
                    highlight: 'แนะนำเฉพาะชนิด Bivalent RSVpreF (Abrysvo) เท่านั้น (ห้ามใช้ชนิด Arexvy ในหญิงตั้งครรภ์)'
                };
            } else if (gw > 36) {
                return {
                    status: 'optional',
                    reason: `อายุครรภ์ปัจจุบัน ${gw} สัปดาห์ (เกิน 36 สัปดาห์): ภูมิคุ้มกันอาจส่งต่อสู่ทารกได้ไม่สมบูรณ์ก่อนคลอด พิจารณาปรึกษาแพทย์สูตินรีเวช`
                };
            } else {
                return {
                    status: 'highly',
                    reason: `อายุครรภ์ปัจจุบัน ${gw} สัปดาห์: มีแผนแนะนำฉีดวัคซีน Bivalent RSVpreF (Abrysvo) 1 เข็มเมื่ออายุครรภ์ครบ 24-36 สัปดาห์ (ดีที่สุดช่วง 28-32 สัปดาห์)`
                };
            }
        }

        if (id === 'flu') {
            return {
                status: 'highly',
                reason: 'หญิงตั้งครรภ์มีความเสี่ยงสูงต่อไข้หวัดใหญ่รุนแรง แนะนำฉีดวัคซีนไข้หวัดใหญ่ชนิดเชื้อตาย 1 เข็ม (ฉีดได้ทุกไตรมาส แนะนำช่วง 12-20 สัปดาห์) เพื่อป้องกันปอดอักเสบในมารดาและส่งต่อภูมิคุ้มกันสู่ทารก'
            };
        }

        if (id === 'covid') {
            return {
                status: 'highly',
                reason: 'หญิงตั้งครรภ์จัดเป็นกลุ่มเสี่ยงต่อภาวะแทรกซ้อนรุนแรงจากโควิด-19 แนะนำฉีดวัคซีนชนิด mRNA รุ่นล่าสุด 1 เข็มประจำปี'
            };
        }

        if (id === 'pneumo') {
            return {
                status: 'optional',
                reason: 'หากหญิงตั้งครรภ์มีภาวะโรคร่วมหรือโรคประจำตัวเสี่ยงสูง สามารถพิจารณาฉีด PCV20 จำนวน 1 เข็มตามคำแนะนำของแพทย์'
            };
        }

        if (id === 'hepb') {
            return {
                status: 'optional',
                reason: 'หญิงตั้งครรภ์สามารถรับวัคซีนไวรัสตับอักเสบบีได้ตามปกติหากมีความเสี่ยงหรือไม่มีภูมิคุ้มกัน'
            };
        }
    }

    // =========================================================================
    // 2. IMMUNOCOMPROMISED EVALUATION (ผู้มีภูมิคุ้มกันบกพร่อง / HIV / มะเร็ง / ยากดภูมิ)
    // =========================================================================
    if (isImmunocompromised) {
        // Contraindicated live vaccines
        if (['mmr', 'varicella', 'dengue'].includes(id)) {
            return {
                status: 'contraindicated',
                reason: 'ผู้มีภาวะภูมิคุ้มกันบกพร่องรุนแรง (เช่น HIV CD4 < 200, ผู้ป่วยมะเร็งรับเคมีบำบัด/ยากดภูมิ) ห้ามฉีดวัคซีนชนิดเชื้อเป็นอ่อนฤทธิ์ (Live-attenuated) เด็ดขาด'
            };
        }

        if (id === 'zoster') {
            return {
                status: 'highly',
                reason: 'ผู้มีภาวะภูมิคุ้มกันบกพร่องอายุตั้งแต่ 18 ปีขึ้นไป: แนะนำฉีดวัคซีนงูสวัดชนิดรีคอมบิแนนท์ (RZV - Shingrix) 2 เข็ม ห่างกัน 1-2 เดือน เพื่อป้องกันโรคงูสวัดและภาวะแทรกซ้อนทางระบบประสาท',
                highlight: 'ห้ามใช้วัคซีนงูสวัดเชื้อเป็น (ZVL) เด็ดขาด ให้ใช้เฉพาะชนิด Recombinant (RZV - Shingrix)'
            };
        }

        if (id === 'pneumo') {
            return {
                status: 'highly',
                reason: 'ผู้มีภาวะภูมิคุ้มกันบกพร่อง/ยากดภูมิ/โรคไตระยะ 4-5/ไม่มีม้าม: แนะนำฉีด PCV20 จำนวน 1 เข็ม (หรือสูตร PCV13/15 ตามด้วย PPSV23 หลัง 8 สัปดาห์) ป้องกันโรคปอดอักเสบและติดเชื้อในกระแสเลือด'
            };
        }

        if (id === 'flu') {
            if (age >= 60) {
                return {
                    status: 'highly',
                    reason: 'ผู้มีภูมิคุ้มกันบกพร่องอายุ 60 ปีขึ้นไป: แนะนำฉีดวัคซีนไข้หวัดใหญ่ขนาดสูง (High-Dose 60 µg) ปีละ 1 ครั้ง เพื่อประสิทธิภาพการกระตุ้นภูมิที่สูงกว่า',
                    highlight: 'แนะนำชนิด High-Dose Flu (60 µg) สำหรับอายุ 60 ปีขึ้นไป (ห้ามชนิดพ่นจมูก)'
                };
            }
            return {
                status: 'highly',
                reason: 'ผู้มีภาวะภูมิคุ้มกันบกพร่องจัดเป็นกลุ่มเสี่ยงสูง แนะนำฉีดวัคซีนไข้หวัดใหญ่ชนิดเชื้อตายปีละ 1 ครั้ง (ห้ามใช้วัคซีนชนิดพ่นจมูกที่เป็นเชื้อเป็น)'
            };
        }

        if (id === 'covid') {
            return {
                status: 'highly',
                reason: 'ผู้มีภาวะภูมิคุ้มกันบกพร่องแนะนำฉีดวัคซีนโควิด-19 ชนิด mRNA รุ่นล่าสุด 1 โดสทุกปี (หรือปรึกษาแพทย์สำหรับการให้เข็มกระตุ้นถี่ขึ้น)'
            };
        }

        if (id === 'hepb') {
            return {
                status: 'highly',
                reason: 'ผู้มีภาวะภูมิคุ้มกันบกพร่อง/HIV/ฟอกไต แนะนำตรวจคัดกรองและฉีดวัคซีนไวรัสตับอักเสบบีขนาดสูง (40 µg รวม 3-4 เข็ม) เนื่องจากตอบสนองต่อวัคซีนมาตรฐานได้น้อยกว่าปกติ'
            };
        }

        if (id === 'rsv') {
            if (age >= 50) {
                return {
                    status: 'highly',
                    reason: 'ผู้มีภาวะภูมิคุ้มกันบกพร่องอายุ 50 ปีขึ้นไป มีความเสี่ยงสูงต่อการติดเชื้อ RSV ทางเดินหายใจส่วนล่างรุนแรง แนะนำฉีดวัคซีน RSV 1 เข็ม'
                };
            }
            return {
                status: 'optional',
                reason: 'ผู้มีภาวะภูมิคุ้มกันบกพร่องอายุ 18-49 ปี สามารถพิจารณาฉีดวัคซีน RSV 1 เข็ม ร่วมกับแพทย์ตามความเสี่ยงรายบุคคล'
            };
        }

        if (id === 'hpv') {
            if (age <= 26) {
                return {
                    status: 'highly',
                    reason: 'ผู้มีภาวะภูมิคุ้มกันบกพร่องอายุ 9-26 ปี แนะนำฉีดวัคซีน HPV ชนิด 3 เข็ม (0, 1-2, 6 เดือน) เพื่อป้องกันมะเร็งที่สัมพันธ์กับเชื้อเอชพีวี'
                };
            }
            return {
                status: 'optional',
                reason: 'ผู้มีภาวะภูมิคุ้มกันบกพร่องอายุ 27 ปีขึ้นไป สามารถพิจารณาฉีดวัคซีน HPV 3 เข็ม ตามการตัดสินใจร่วมกับแพทย์'
            };
        }

        if (id === 'tdap') {
            return {
                status: 'highly',
                reason: 'แนะนำฉีดกระตุ้นป้องกันบาดทะยัก-คอตีบ (Td) ทุก 10 ปี โดยแทนด้วย Tdap หรือ TdaP อย่างน้อย 1 ครั้ง'
            };
        }
    }

    // =========================================================================
    // 3. GENERAL ADULT & ELDERLY POPULATION EVALUATION (บุคคลทั่วไปและผู้สูงอายุ)
    // =========================================================================
    
    // --- 3.1 INFLUENZA VACCINE ---
    if (id === 'flu') {
        if (age >= 60) {
            return {
                status: 'highly',
                reason: 'ผู้มีอายุตั้งแต่ 60 ปีขึ้นไป: แนะนำฉีดวัคซีนไข้หวัดใหญ่ขนาดสูง (High-Dose 60 µg) ปีละ 1 ครั้ง เนื่องจากช่วยลดการติดเชื้อแบบมีอาการ ลดการนอนโรงพยาบาลจากปอดอักเสบและโรคหัวใจได้อย่างมีนัยสำคัญ',
                highlight: 'แนะนำชนิด High-Dose Flu (60 µg) สำหรับผู้ใหญ่อายุ 60 ปีขึ้นไป'
            };
        }
        if (isChronic) {
            return {
                status: 'highly',
                reason: 'ผู้มีโรคประจำตัวเรื้อรัง (ปอด, หัวใจ, เบาหวาน, ไต, ตับ): จัดเป็นกลุ่มเสี่ยงสูง แนะนำฉีดวัคซีนไข้หวัดใหญ่ขนาดมาตรฐานปีละ 1 ครั้ง'
            };
        }
        return {
            status: 'highly',
            reason: 'แนะนำสำหรับบุคคลทั่วไปฉีดวัคซีนไข้หวัดใหญ่ขนาดมาตรฐานปีละ 1 ครั้ง ก่อนฤดูระบาด (เมษายน-พฤษภาคม หรือฉีดได้ตลอดทั้งปี)'
        };
    }

    // --- 3.2 TDAP / TD VACCINE ---
    if (id === 'tdap') {
        return {
            status: 'highly',
            reason: 'แนะนำสำหรับผู้ใหญ่ทุกคนฉีดวัคซีนป้องกันบาดทะยัก-คอตีบ (Td) ทุก 10 ปี โดยให้ฉีดทดแทนด้วย Tdap หรือ TdaP อย่างน้อย 1 ครั้ง เพื่อเสริมภูมิคุ้มกันไอกรน'
        };
    }

    // --- 3.3 COVID-19 VACCINE ---
    if (id === 'covid') {
        if (age >= 60 || isChronic) {
            return {
                status: 'highly',
                reason: 'กลุ่มเสี่ยงสูง (อายุ 60 ปีขึ้นไป หรือมีโรคเรื้อรัง เบาหวาน/หัวใจ/ปอด/ไต/โรคอ้วน): แนะนำฉีดวัคซีนโควิด-19 ชนิด mRNA รุ่นล่าสุด กระตุ้นปีละ 1 เข็ม'
            };
        }
        return {
            status: 'optional',
            reason: 'ผู้ใหญ่อายุ 18-59 ปี สุขภาพแข็งแรง สามารถพิจารณาฉีดวัคซีนโควิด-19 mRNA ประจำปีได้ตามความสมัครใจ'
        };
    }

    // --- 3.4 PNEUMOCOCCAL VACCINE (PCV / PPSV) ---
    if (id === 'pneumo') {
        if (age >= 65) {
            return {
                status: 'highly',
                reason: 'ผู้สูงอายุ 65 ปีขึ้นไปทุกคน: แนะนำฉีดวัคซีนนิวโมค็อกคัสชนิด PCV20 จำนวน 1 เข็ม (หรือสูตร PCV13/15 ตามด้วย PPSV23) เพื่อป้องกันโรคปอดอักเสบและการติดเชื้อในกระแสเลือดรุนแรง'
            };
        }
        if (isChronic) {
            return {
                status: 'highly',
                reason: 'ผู้มีโรคเรื้อรัง (โรคหัวใจ, โรคปอด/หอบหืด/COPD, โรคตับ, เบาหวาน, สูบบุหรี่, ดื่มสุราเรื้อรัง): แนะนำฉีด PCV20 จำนวน 1 เข็ม (หรือ PCV13/15 ตามด้วย PPSV23 หลัง 1 ปี)'
            };
        }
        if (age >= 50 && age <= 64) {
            return {
                status: 'optional',
                reason: 'ผู้ใหญ่อายุ 50-64 ปี สุขภาพทั่วไปดี สามารถพิจารณาฉีดวัคซีน PCV20 จำนวน 1 เข็ม ร่วมกับแพทย์ตามความสมัครใจ'
            };
        }
        return {
            status: 'optional',
            reason: 'สำหรับผู้ใหญ่สุขภาพแข็งแรงทั่วไป สามารถพิจารณาฉีดได้ตามดุลยพินิจของแพทย์'
        };
    }

    // --- 3.5 RSV VACCINE ---
    if (id === 'rsv') {
        if (age >= 75) {
            return {
                status: 'highly',
                reason: 'ผู้สูงอายุ 75 ปีขึ้นไปทุกคน: แนะนำฉีดวัคซีน RSV จำนวน 1 เข็ม เพื่อป้องกันโรคติดเชื้อทางเดินหายใจส่วนล่าง (LRTD) และลดอัตราการนอนโรงพยาบาล'
            };
        }
        if (age >= 50 && isChronic) {
            return {
                status: 'highly',
                reason: 'ผู้มีอายุ 50-74 ปีที่มีโรคประจำตัวเรื้อรัง (โรคปอด, หัวใจ, เบาหวานมีภาวะแทรกซ้อน, ตับ, ไต, โรคอ้วน BMI ≥ 40): แนะนำฉีดวัคซีน RSV จำนวน 1 เข็ม'
            };
        }
        if (age >= 50) {
            return {
                status: 'optional',
                reason: 'ผู้ใหญ่อายุ 50-74 ปี สุขภาพแข็งแรงดี สามารถพิจารณาฉีดวัคซีน RSV จำนวน 1 เข็ม โดยการตัดสินใจร่วมกับแพทย์'
            };
        }
        return {
            status: 'optional',
            reason: 'ผู้ใหญ่อายุ 18-49 ปีที่มีความเสี่ยงสูง สามารถพิจารณาฉีดวัคซีน RSV ได้เป็นรายบุคคลตามดุลยพินิจแพทย์'
        };
    }

    // --- 3.6 HERPES ZOSTER VACCINE (RZV) ---
    if (id === 'zoster') {
        if (age >= 50) {
            return {
                status: 'highly',
                reason: 'ผู้มีอายุตั้งแต่ 50 ปีขึ้นไปทุกคน: แนะนำฉีดวัคซีนงูสวัดชนิดรีคอมบิแนนท์ (RZV - Shingrix) 2 เข็ม ห่างกัน 2-6 เดือน (ป้องกันโรคงูสวัดได้ >90% และป้องกันอาการปวดปลายประสาทเรื้อรัง PHN)'
            };
        }
        if (isChronic) {
            return {
                status: 'optional',
                reason: 'ผู้มีโรคเรื้อรังที่อายุต่ำกว่า 50 ปี (โดยเฉพาะไตวายเรื้อรังระยะ 5 หรือฟอกไต) สามารถพิจารณาฉีดวัคซีน RZV 2 เข็มตามคำแนะนำแพทย์'
            };
        }
        return {
            status: 'optional',
            reason: 'วัคซีนงูสวัดเป็นคำแนะนำหลักสำหรับผู้มีอายุตั้งแต่ 50 ปีขึ้นไป หรือผู้มีภูมิคุ้มกันบกพร่องอายุ 18 ปีขึ้นไป'
        };
    }

    // --- 3.7 HPV VACCINE ---
    if (id === 'hpv') {
        if (age >= 18 && age <= 26) {
            return {
                status: 'highly',
                reason: 'อายุ 18-26 ปี (ทั้งหญิงและชาย): แนะนำฉีดวัคซีน HPV ชนิด 9 สายพันธุ์ 3 เข็ม (0, 1-2, 6 เดือน) เพื่อป้องกันมะเร็งปากมดลูก มะเร็งช่องปากและลำคอ มะเร็งทวารหนัก และหูดหงอนไก่'
            };
        }
        if (age >= 27 && age <= 45) {
            return {
                status: 'optional',
                reason: 'อายุ 27-45 ปี: แนะนำตามการตัดสินใจร่วมกับแพทย์ (Shared Clinical Decision-Making) ยังคงได้รับประโยชน์ในการป้องกันสายพันธุ์ที่ยังไม่เคยติดเชื้อ'
            };
        }
        return {
            status: 'optional',
            reason: 'อายุมากกว่า 45 ปี สามารถปรึกษาแพทย์เป็นรายบุคคลหากมีความเสี่ยงในการสัมผัสเชื้อ'
        };
    }

    // --- 3.8 HEPATITIS B VACCINE ---
    if (id === 'hepb') {
        if (isBornBefore2535) {
            return {
                status: 'highly',
                reason: 'ผู้ที่เกิดก่อนปี พ.ศ. 2535 (ยังไม่เคยได้รับวัคซีนแรกเกิดในโครงการ EPI): แนะนำตรวจเลือดหา HBsAg และ Anti-HBs หากไม่พบภูมิคุ้มกัน แนะนำฉีดวัคซีน 3 เข็ม (เดือนที่ 0, 1, 6)'
            };
        }
        if (isChronic) {
            return {
                status: 'highly',
                reason: 'ผู้ป่วยโรคตับเรื้อรัง หรือโรคไตเรื้อรัง แนะนำตรวจระดับภูมิคุ้มกันและฉีดวัคซีนไวรัสตับอักเสบบีเพื่อป้องกันภาวะแทรกซ้อนรุนแรง'
            };
        }
        return {
            status: 'optional',
            reason: 'ผู้ที่เกิดตั้งแต่ปี พ.ศ. 2535 ได้รับวัคซีนตั้งแต่แรกเกิดแล้ว หากไม่มีความเสี่ยงเฉพาะทาง (เช่น สัมผัสเลือด, บุคลากรแพทย์) ไม่จำเป็นต้องตรวจหรือฉีดซ้ำ'
        };
    }

    // --- 3.9 DENGUE VACCINE (TAK-003) ---
    if (id === 'dengue') {
        if (isChronic) {
            return {
                status: 'highly',
                reason: 'ผู้มีโรคเรื้อรัง (โรคหัวใจ, เบาหวาน, ปอด, ไต, ตับ, โรคอ้วน) มีความเสี่ยงต่อไข้เลือดออกรุนแรง: แนะนำฉีดวัคซีน TAK-003 (Qdenga) 2 เข็ม (เดือนที่ 0 และ 3) ป้องกันการนอน รพ. ได้ถึง 84%'
            };
        }
        return {
            status: 'optional',
            reason: 'วัคซีนไข้เลือดออก TAK-003 ฉีดได้ในผู้มีอายุ 4-60+ ปี ทั้งคนที่เคยและไม่เคยเป็นไข้เลือดออกมาก่อน ฉีด 2 เข็ม ใต้ผิวหนัง ห่างกัน 3 เดือน'
        };
    }

    // --- 3.10 MMR VACCINE ---
    if (id === 'mmr') {
        return {
            status: 'optional',
            reason: 'แนะนำสำหรับผู้ใหญ่ที่ไม่มีหลักฐานการได้รับวัคซีนหรือไม่เคยเป็นโรคหัด/หัดเยอรมัน หรือบุคลากรทางการแพทย์ ฉีด 2 เข็ม ใต้ผิวหนัง ห่างกันอย่างน้อย 4 สัปดาห์'
        };
    }

    // --- 3.11 VARICELLA VACCINE ---
    if (id === 'varicella') {
        if (age < 50) {
            return {
                status: 'optional',
                reason: 'แนะนำสำหรับผู้ที่อายุต่ำกว่า 50 ปี ที่ไม่เคยเป็นอีสุกอีใสมาก่อน และตรวจไม่พบภูมิคุ้มกัน ฉีด 2 เข็ม ใต้ผิวหนัง ห่างกัน 4-8 สัปดาห์'
            };
        }
        return {
            status: 'optional',
            reason: 'ผู้ใหญ่อายุ 50 ปีขึ้นไปส่วนใหญ่มีภูมิคุ้มกันตามธรรมชาติแล้ว แนะนำเป็นวัคซีนงูสวัด (RZV) แทน'
        };
    }

    return {
        status: 'optional',
        reason: 'พิจารณาฉีดตามดุลยพินิจของแพทย์ หรือความเสี่ยงส่วนบุคคล'
    };
}

const VACCINE_GRAPHIC_ICONS = {
    flu: { icon: 'fa-virus', bgClass: 'graphic-flu' },
    flu_hd: { icon: 'fa-temperature-high', bgClass: 'graphic-flu' },
    tdap: { icon: 'fa-shield-halved', bgClass: 'graphic-tdap' },
    covid: { icon: 'fa-shield-virus', bgClass: 'graphic-covid' },
    pneumo: { icon: 'fa-lungs', bgClass: 'graphic-pneumo' },
    rsv: { icon: 'fa-wind', bgClass: 'graphic-rsv' },
    zoster: { icon: 'fa-bolt', bgClass: 'graphic-zoster' },
    hpv: { icon: 'fa-dna', bgClass: 'graphic-hpv' },
    hepb: { icon: 'fa-droplet', bgClass: 'graphic-hepb' },
    dengue: { icon: 'fa-mosquito', bgClass: 'graphic-dengue' },
    mmr: { icon: 'fa-shield-heart', bgClass: 'graphic-live' },
    varicella: { icon: 'fa-head-side-cough', bgClass: 'graphic-live' }
};

function createVaccineAnalysisCardHtml(id, info, rec) {
    const card = document.createElement('div');
    const isContra = rec.status === 'contraindicated';
    card.className = `vaccine-card ${isContra ? 'contraindicated-card' : ''}`;
    
    const badgeClass = rec.status === 'highly' ? 'badge-routine' : (rec.status === 'optional' ? 'badge-risk' : 'badge-danger');
    const badgeText = rec.status === 'highly' ? 'จำเป็น (Routine)' : (rec.status === 'optional' ? 'ทางเลือก (Risk-Based)' : 'ห้ามฉีดเด็ดขาด');
    
    const graphicInfo = VACCINE_GRAPHIC_ICONS[id] || { icon: 'fa-syringe', bgClass: 'graphic-flu' };
    
    let alertBox = '';
    if (rec.highlight) {
        alertBox = `
            <div class="recommend-box high-dose-alert">
                <span class="recommend-text"><i class="fa-solid fa-triangle-exclamation"></i> ${rec.highlight}</span>
            </div>
        `;
    } else if (isContra) {
        alertBox = `
            <div class="recommend-box danger-alert">
                <span class="recommend-text"><i class="fa-solid fa-circle-xmark"></i> ข้อห้ามปฏิบัติทางการแพทย์</span>
            </div>
        `;
    }
    
    const benefitHtml = info.govBenefit ? `
        <div class="coverage-badge">
            <i class="fa-solid fa-certificate"></i> ${info.govBenefit}
        </div>
    ` : '';

    const descItems = `
        <div class="desc-box">
            <div class="desc-item ${isContra ? 'contra-item' : ''}">
                <i class="fa-solid ${isContra ? 'fa-xmark' : 'fa-syringe'}"></i>
                <span>${isContra ? '<b>งดเว้นการให้วัคซีนชนิดนี้</b>' : info.schedule}</span>
            </div>
            <div class="desc-item">
                <i class="fa-solid fa-circle-info"></i>
                <span><b>ข้อมูลวิชาการ:</b> ${rec.reason}</span>
            </div>
            ${benefitHtml}
        </div>
    `;

    let promoShopeeBox = '';
    if (!isContra) {
        const matchingPromos = VACCINE_PROMOS.filter(p => p.vaccineId === id);
        if (matchingPromos.length > 0) {
            const topPromo = matchingPromos[0];
            const badgeIcon = topPromo.providerType === 'shopee' ? 'fa-bag-shopping' : (topPromo.providerType === 'rama' ? 'fa-hospital' : 'fa-building-columns');
            const badgeColor = topPromo.providerType === 'shopee' ? '' : (topPromo.providerType === 'rama' ? 'background: rgba(2, 132, 199, 0.12); color: var(--primary); border: 1px solid rgba(2, 132, 199, 0.3);' : 'background: rgba(16, 185, 129, 0.12); color: #059640; border: 1px solid rgba(16, 185, 129, 0.3);');
            
            const priceHtml = topPromo.originalPrice ? 
                `<span style="font-size: 13.5px; font-weight: 700; color: #ee4d2d;">฿${topPromo.promoPrice.toLocaleString('th-TH')} <span style="font-size: 10px; font-weight: normal; color: var(--text-muted); text-decoration: line-through;">฿${topPromo.originalPrice.toLocaleString('th-TH')}</span></span>` :
                `<span style="font-size: 13.5px; font-weight: 700; color: #059640;">฿${topPromo.promoPrice.toLocaleString('th-TH')} <span style="font-size: 10.5px; font-weight: normal; color: var(--text-muted);">/ เข็ม</span></span>`;

            let actionBtnHtml = '';
            if (topPromo.providerType === 'shopee') {
                actionBtnHtml = `
                    <a href="${topPromo.shopeeUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-shopee btn-sm btn-block">
                        <i class="fa-solid fa-cart-shopping"></i> สั่งซื้อ E-Coupon
                    </a>
                `;
            } else if (topPromo.providerType === 'rama') {
                actionBtnHtml = `
                    <a href="${topPromo.lineUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-primary btn-sm btn-block" style="background: #06c755; border-color: #06c755;">
                        <i class="fa-brands fa-line"></i> สอบถาม / นัดหมาย LINE
                    </a>
                `;
            } else {
                actionBtnHtml = `
                    <a href="tel:${topPromo.tel}" class="btn btn-outline btn-sm btn-block">
                        <i class="fa-solid fa-phone"></i> โทร. ${topPromo.tel}
                    </a>
                `;
            }

            promoShopeeBox = `
                <div class="promo-shopee-box">
                    <div class="shopee-box-header">
                        <span class="shopee-badge" style="${badgeColor}"><i class="fa-solid ${badgeIcon}"></i> ${topPromo.badge}</span>
                        ${priceHtml}
                    </div>
                    <div class="shopee-box-title">${topPromo.title}</div>
                    <div class="shopee-box-hospital"><i class="fa-solid fa-hospital"></i> ${topPromo.hospital} ${topPromo.discountPercent ? `• <b style="color: #059640;">${topPromo.discountPercent}</b>` : ''}</div>
                    ${actionBtnHtml}
                </div>
            `;
        }
    }

    const actionButton = !isContra ? `
        <div style="margin-top: 14px; padding-top: 10px; border-top: 1px solid var(--border);">
            <button class="btn btn-outline btn-sm btn-block" onclick="openRecordModalFor('${id}', '1')">
                <i class="fa-solid fa-plus"></i> บันทึกประวัติวัคซีนนี้
            </button>
        </div>
    ` : '';
    
    card.innerHTML = `
        <div style="display: flex; flex-direction: column; height: 100%; justify-content: space-between;">
            <div>
                <div class="card-header-row">
                    <div style="display: flex; align-items: center; gap: 12px;">
                        <div class="vaccine-graphic-badge ${graphicInfo.bgClass}">
                            <i class="fa-solid ${graphicInfo.icon}"></i>
                        </div>
                        <div>
                            <h4 class="card-title ${isContra ? 'danger-text' : ''}">${info.nameTh}</h4>
                            <span class="card-subtitle">${info.nameEn}</span>
                        </div>
                    </div>
                    <span class="badge ${badgeClass}">${badgeText}</span>
                </div>
                ${alertBox}
                ${descItems}
                ${promoShopeeBox}
            </div>
            ${actionButton}
        </div>
    `;
    
    return card;
}

// ==========================================================================
// SCREEN D: LOGBOOK & VACCINE STEPPER ROADMAP ENGINE
// ==========================================================================
let activeRoadmapFilter = 'all';

function renderLogbookTab() {
    if (!userState.profile || !userState.profile.dob) return;
    const age = getAge(userState.profile.dob);
    const trackIds = Object.keys(VACCINE_INFO);
    
    let totalDosesRequired = 0;
    let totalDosesAdministered = 0;
    let countUrgent = 0;
    let countInProgress = 0;
    let countCompleted = 0;
    let countAll = 0;

    const vaccineRoadmaps = [];

    trackIds.forEach(vid => {
        const rec = analyzeVaccineRecommendation(vid, age, userState.profile);
        if (rec.status === 'contraindicated') return;

        const info = VACCINE_INFO[vid];
        const dosesLogged = userState.records.filter(r => r.vaccineId === vid).sort((a,b) => new Date(a.date) - new Date(b.date));
        const totalDoses = info.totalDosesNeeded;
        totalDosesRequired += totalDoses;
        totalDosesAdministered += Math.min(dosesLogged.length, totalDoses);

        let roadmapStatus = 'urgent'; // 'urgent', 'inprogress', 'completed'
        if (dosesLogged.length >= totalDoses) {
            roadmapStatus = 'completed';
            countCompleted++;
        } else if (dosesLogged.length > 0) {
            roadmapStatus = 'inprogress';
            countInProgress++;
        } else {
            roadmapStatus = 'urgent';
            countUrgent++;
        }
        countAll++;

        vaccineRoadmaps.push({
            id: vid,
            info: info,
            rec: rec,
            dosesLogged: dosesLogged,
            totalDoses: totalDoses,
            roadmapStatus: roadmapStatus
        });
    });

    // Update Progress Summary
    const coveragePercent = totalDosesRequired > 0 ? Math.round((totalDosesAdministered / totalDosesRequired) * 100) : 0;
    if (dom.logbookCoveragePercent) {
        dom.logbookCoveragePercent.textContent = `ได้รับแล้ว ${coveragePercent}%`;
    }
    if (dom.logbookProgressFill) {
        dom.logbookProgressFill.style.width = `${coveragePercent}%`;
    }
    if (dom.logbookCoverageSubtitle) {
        dom.logbookCoverageSubtitle.textContent = `ได้รับแล้ว ${totalDosesAdministered} จากทั้งหมด ${totalDosesRequired} เข็มที่แนะนำสำหรับคุณ`;
    }

    // Update Filter Counts
    if (dom.statAllCount) dom.statAllCount.textContent = countAll;
    if (dom.statUrgentCount) dom.statUrgentCount.textContent = countUrgent;
    if (dom.statInProgressCount) dom.statInProgressCount.textContent = countInProgress;
    if (dom.statCompletedCount) dom.statCompletedCount.textContent = countCompleted;

    // Filter cards
    let filteredRoadmaps = vaccineRoadmaps;
    if (activeRoadmapFilter !== 'all') {
        filteredRoadmaps = vaccineRoadmaps.filter(v => v.roadmapStatus === activeRoadmapFilter);
    }

    // Sort: Urgent/InProgress first, then Completed
    filteredRoadmaps.sort((a, b) => {
        const order = { urgent: 1, inprogress: 2, completed: 3 };
        return order[a.roadmapStatus] - order[b.roadmapStatus];
    });

    // Render Stepper Cards Grid
    if (dom.logbookStepperGrid) {
        dom.logbookStepperGrid.innerHTML = '';

        if (filteredRoadmaps.length === 0) {
            dom.logbookStepperGrid.innerHTML = `
                <div style="grid-column: 1/-1; text-align: center; padding: 36px 20px; background: var(--bg-surface); border: 1px dashed var(--border); border-radius: var(--radius-md);">
                    <i class="fa-solid fa-circle-check" style="font-size: 28px; color: #059640; margin-bottom: 8px;"></i>
                    <p style="font-size: 13.5px; color: var(--text-secondary); margin-bottom: 0;">ไม่มีรายการวัคซีนในหมวดหมู่นี้</p>
                </div>
            `;
        } else {
            filteredRoadmaps.forEach(v => {
                const card = createVaccineStepperCard(v);
                dom.logbookStepperGrid.appendChild(card);
            });
        }
    }

    renderLogbookTable();
}

function createVaccineStepperCard(v) {
    const card = document.createElement('div');
    card.className = 'logbook-stepper-card';

    const info = v.info;
    const rec = v.rec;
    const dosesLogged = v.dosesLogged;
    const totalDoses = v.totalDoses;
    const isCompleted = dosesLogged.length >= totalDoses;
    const isInProgress = dosesLogged.length > 0 && !isCompleted;
    const currentDoseNum = dosesLogged.length + 1;

    // Status Badge
    let statusBadgeHtml = '';
    if (isCompleted) {
        statusBadgeHtml = `<span class="stepper-status-badge status-completed"><i class="fa-solid fa-check"></i> ฉีดครบแล้ว (${totalDoses}/${totalDoses})</span>`;
    } else if (isInProgress) {
        statusBadgeHtml = `<span class="stepper-status-badge status-inprogress"><i class="fa-solid fa-clock"></i> รอฉีดเข็มที่ ${currentDoseNum}</span>`;
    } else {
        const isRoutine = rec.status === 'highly';
        statusBadgeHtml = `<span class="stepper-status-badge status-pending">${isRoutine ? '⚡ แนะนำเริ่มฉีด' : '🛡️ ทางเลือกตามวัย'}</span>`;
    }

    // Build Stepper Timeline HTML
    let stepsHtml = '';
    for (let i = 1; i <= totalDoses; i++) {
        const logged = dosesLogged[i - 1];
        const isStepCompleted = !!logged;
        const isNextUp = !isStepCompleted && (i === currentDoseNum);
        
        let stepClass = isStepCompleted ? 'completed' : (isNextUp ? 'next-up' : 'pending');
        let dotContent = isStepCompleted ? '<i class="fa-solid fa-check"></i>' : `${i}`;
        let descText = '';

        if (isStepCompleted) {
            descText = `ฉีดแล้ว: ${formatShortDate(logged.date)}`;
        } else if (isNextUp) {
            if (dosesLogged.length > 0) {
                const nextDueDate = calculateNextDueDate(v.id, dosesLogged, i);
                descText = `นัด: ${formatShortDate(nextDueDate)}`;
            } else {
                descText = 'เริ่มฉีดได้ทันที';
            }
        } else {
            descText = `รอเข็มที่ ${i - 1}`;
        }

        stepsHtml += `
            <div class="stepper-step ${stepClass}">
                <div class="step-dot">${dotContent}</div>
                <div class="step-label">
                    <span class="step-title">เข็มที่ ${i}</span>
                    <span class="step-desc">${descText}</span>
                </div>
            </div>
        `;

        if (i < totalDoses) {
            const connectorCompleted = dosesLogged.length >= i;
            stepsHtml += `<div class="stepper-connector ${connectorCompleted ? 'completed' : ''}"></div>`;
        }
    }

    // Category Icon
    const catIcon = getCategoryIconForVaccine(v.id);

    // Footer actions
    let footerActionHtml = '';
    if (!isCompleted) {
        footerActionHtml = `
            <div class="stepper-actions-group">
                <button class="btn btn-outline btn-sm" onclick="exportSingleVaccineCalendar('${v.id}')" title="เตือนในปฏิทิน">
                    <i class="fa-solid fa-calendar-plus"></i> เตือนปฏิทิน
                </button>
                <button class="btn btn-primary btn-sm" onclick="openRecordModalFor('${v.id}', '${currentDoseNum}')">
                    <i class="fa-solid fa-plus"></i> บันทึกเข็มที่ ${currentDoseNum}
                </button>
            </div>
        `;
    } else {
        footerActionHtml = `
            <div class="stepper-actions-group">
                <span style="font-size: 11.5px; color: #059640; font-weight: 600;">
                    <i class="fa-solid fa-circle-check"></i> สถานะครอบคลุมสมบูรณ์
                </span>
            </div>
        `;
    }

    // Next dose note
    let noteText = '';
    if (isCompleted) {
        noteText = `<i class="fa-solid fa-shield-check" style="color: #059640;"></i> ภูมิคุ้มกันพร้อม`;
    } else if (isInProgress) {
        noteText = `<i class="fa-solid fa-bell" style="color: #d97706;"></i> นัดเข็มถัดไป (เข็มที่ ${currentDoseNum})`;
    } else {
        noteText = `<i class="fa-solid fa-circle-info" style="color: var(--primary);"></i> ${rec.status === 'highly' ? 'จำเป็นตามเกณฑ์แพทย์' : 'วัคซีนทางเลือก'}`;
    }

    // Visual Graphic Badge
    const graphicInfo = VACCINE_GRAPHIC_ICONS[v.id] || { icon: 'fa-syringe', bgClass: 'graphic-flu' };

    card.innerHTML = `
        <div>
            <div class="stepper-card-header">
                <div class="stepper-card-left">
                    <div class="stepper-icon-wrap ${graphicInfo.bgClass}" style="border: none;">
                        <i class="fa-solid ${graphicInfo.icon}"></i>
                    </div>
                    <div>
                        <h4 class="stepper-vaccine-title">${info.nameTh}</h4>
                        <div class="stepper-vaccine-sub">${info.nameEn} • รวม ${totalDoses} เข็ม</div>
                    </div>
                </div>
                ${statusBadgeHtml}
            </div>

            <div class="stepper-timeline-bar">
                ${stepsHtml}
            </div>
        </div>

        <div class="stepper-card-footer">
            <div class="stepper-note">${noteText}</div>
            ${footerActionHtml}
        </div>
    `;

    return card;
}

function getCategoryIconForVaccine(vid) {
    const icons = {
        flu: 'fa-syringe',
        tdap: 'fa-shield-halved',
        covid: 'fa-shield-virus',
        pneumo: 'fa-lungs',
        rsv: 'fa-virus',
        zoster: 'fa-bolt',
        hpv: 'fa-venus',
        dengue: 'fa-mosquito',
        hepb: 'fa-droplet',
        hepa: 'fa-water',
        mmr: 'fa-head-side-virus',
        varicella: 'fa-virus-covid'
    };
    return icons[vid] || 'fa-syringe';
}

function formatShortDate(dateStr) {
    if (!dateStr) return '-';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return String(dateStr);
    const months = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
    return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear() + 543}`;
}

function calculateNextDueDate(vid, dosesLogged, targetDoseNum) {
    if (!dosesLogged || dosesLogged.length === 0) return new Date();
    const lastDose = dosesLogged[dosesLogged.length - 1];
    let dueDate = new Date(lastDose.date);

    if (vid === 'hpv') {
        if (targetDoseNum === 2) dueDate.setMonth(dueDate.getMonth() + 2);
        else if (targetDoseNum === 3) {
            dueDate = new Date(dosesLogged[0].date);
            dueDate.setMonth(dueDate.getMonth() + 6);
        }
    } else if (vid === 'hepb') {
        if (targetDoseNum === 2) dueDate.setMonth(dueDate.getMonth() + 1);
        else if (targetDoseNum === 3) {
            dueDate = new Date(dosesLogged[0].date);
            dueDate.setMonth(dueDate.getMonth() + 6);
        }
    } else if (vid === 'zoster') {
        dueDate.setMonth(dueDate.getMonth() + 2);
    } else if (vid === 'dengue') {
        dueDate.setMonth(dueDate.getMonth() + 3);
    } else if (vid === 'hepa') {
        dueDate.setMonth(dueDate.getMonth() + 6);
    } else if (vid === 'mmr' || vid === 'varicella') {
        dueDate.setDate(dueDate.getDate() + 28);
    } else {
        dueDate.setMonth(dueDate.getMonth() + 1);
    }
    return dueDate;
}

function exportSingleVaccineCalendar(vaccineId) {
    const info = VACCINE_INFO[vaccineId];
    if (!info) return;
    const dosesLogged = userState.records.filter(r => r.vaccineId === vaccineId).sort((a,b) => new Date(a.date) - new Date(b.date));
    const nextDoseNum = dosesLogged.length + 1;
    const dueDate = calculateNextDueDate(vaccineId, dosesLogged, nextDoseNum);
    
    const startStr = dueDate.toISOString().slice(0, 10).replace(/-/g, '') + 'T090000';
    const endStr = dueDate.toISOString().slice(0, 10).replace(/-/g, '') + 'T100000';
    const icsContent = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//VacPass Digital Vaccine Passport//TH',
        'CALSCALE:GREGORIAN',
        'BEGIN:VEVENT',
        `UID:vacpass-${vaccineId}-${nextDoseNum}-${Date.now()}@vacpass.app`,
        `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').slice(0, 15)}Z`,
        `DTSTART;TZID=Asia/Bangkok:${startStr}`,
        `DTEND;TZID=Asia/Bangkok:${endStr}`,
        `SUMMARY:💉 นัดฉีดวัคซีน: ${info.nameTh} (เข็มที่ ${nextDoseNum})`,
        `DESCRIPTION:นัดหมายฉีดวัคซีน ${info.nameTh} (${info.nameEn}) เข็มที่ ${nextDoseNum}\\nบันทึกและจัดการผ่าน VacPass สมุดบันทึกวัคซีนดิจิทัล`,
        'STATUS:CONFIRMED',
        'BEGIN:VALARM',
        'TRIGGER:-P1D',
        'ACTION:DISPLAY',
        'DESCRIPTION:เตือนนัดหมายฉีดวัคซีนวันพรุ่งนี้',
        'END:VALARM',
        'END:VEVENT',
        'END:VCALENDAR'
    ].join('\r\n');

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `VacPass_${vaccineId}_Dose${nextDoseNum}.ics`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}
window.exportSingleVaccineCalendar = exportSingleVaccineCalendar;

// --------------------------------------------------------------------------
// LOGBOOK HISTORY TABLE
// --------------------------------------------------------------------------
function renderLogbookTable() {
    dom.logbookHistoryBody.innerHTML = '';
    
    if (userState.records.length === 0) {
        dom.emptyLogState.style.display = 'block';
        dom.logbookHistoryTable.style.display = 'none';
        return;
    }
    
    dom.emptyLogState.style.display = 'none';
    dom.logbookHistoryTable.style.display = 'table';
    
    const sorted = [...userState.records].sort((a, b) => new Date(b.date) - new Date(a.date));
    
    sorted.forEach(rec => {
        const tr = document.createElement('tr');
        const vInfo = VACCINE_INFO[rec.vaccineId] || { nameTh: rec.vaccineId, nameEn: 'Unknown' };
        const doseText = rec.dose === 'booster' ? 'เข็มกระตุ้นประจำปี' : `เข็มที่ ${rec.dose}`;
        
        tr.innerHTML = `
            <td data-label="ชื่อวัคซีน">
                <b>${vInfo.nameTh}</b><br>
                <span class="text-muted" style="font-size: 11px;">${vInfo.nameEn}</span>
            </td>
            <td data-label="ยี่ห้อ/แบรนด์">${rec.brand || '-'}</td>
            <td data-label="ครั้งที่ได้รับ">${doseText}</td>
            <td data-label="วันที่ได้รับ">${formatThaiDateString(new Date(rec.date))}</td>
            <td data-label="สถานที่รับ">${rec.location || '-'}</td>
            <td data-label="การจัดการ">
                <button class="delete-log-btn" onclick="deleteVaccineRecord('${rec.id}')" title="ลบข้อมูล">
                    <i class="fa-solid fa-trash-can"></i>
                </button>
            </td>
        `;
        dom.logbookHistoryBody.appendChild(tr);
    });
}

async function deleteVaccineRecord(id) {
    if (confirm('คุณต้องการลบข้อมูลประวัติการฉีดวัคซีนนี้ใช่หรือไม่? การลบข้อมูลจะไม่สามารถกู้คืนได้')) {
        try {
            const res = await authFetch(`/api/logs?id=${encodeURIComponent(id)}`, { method: 'DELETE' });
            if (!res.ok) throw new Error('Failed to delete record');
            userState.records = userState.records.filter(r => r.id !== id);
            renderLogbookTab();
        } catch (err) {
            alert('❌ เกิดข้อผิดพลาดในการลบข้อมูล: ' + err.message);
        }
    }
}
window.deleteVaccineRecord = deleteVaccineRecord;

// ==========================================================================
// SUB-SCREEN E: NEARBY VACCINE FINDER MODULE
// ==========================================================================
function setupNearbyFinderListeners() {
    dom.btnUseMyLocation.addEventListener('click', () => {
        if (!navigator.geolocation) {
            alert('เบราว์เซอร์ของคุณไม่รองรับการระบุพิกัด GPS');
            return;
        }
        dom.btnUseMyLocation.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> กำลังค้นหาพิกัด...';
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                userCurrentCoords = {
                    lat: pos.coords.latitude,
                    lng: pos.coords.longitude
                };
                dom.btnUseMyLocation.innerHTML = '<i class="fa-solid fa-location-crosshairs"></i> ใช้พิกัดปัจจุบันแล้ว';
                renderNearbyClinics();
            },
            (err) => {
                alert('ไม่สามารถดึงตำแหน่งพิกัดได้: ' + err.message);
                dom.btnUseMyLocation.innerHTML = '<i class="fa-solid fa-crosshairs"></i> ใช้พิกัดปัจจุบัน (GPS)';
            }
        );
    });

    dom.nearbySearchInput.addEventListener('input', () => {
        renderNearbyClinics();
    });

    dom.filterChips.forEach(chip => {
        chip.addEventListener('click', () => {
            dom.filterChips.forEach(c => c.classList.remove('active'));
            chip.classList.add('active');
            activeNearbyFilter = chip.getAttribute('data-filter');
            renderNearbyClinics();
        });
    });
}

function renderNearbyClinics() {
    dom.nearbyClinicsGrid.innerHTML = '';
    const query = (dom.nearbySearchInput.value || '').trim().toLowerCase();
    
    let clinics = [...HEALTHCARE_DIRECTORY];

    // Filter by type chip
    if (activeNearbyFilter !== 'all') {
        clinics = clinics.filter(c => c.type === activeNearbyFilter);
    }

    // Filter by search query
    if (query) {
        clinics = clinics.filter(c => 
            c.name.toLowerCase().includes(query) || 
            c.address.toLowerCase().includes(query) ||
            c.typeName.toLowerCase().includes(query)
        );
    }

    // Calculate distance if GPS available
    clinics.forEach(c => {
        if (userCurrentCoords) {
            c.distanceKm = calculateDistance(userCurrentCoords.lat, userCurrentCoords.lng, c.lat, c.lng);
        } else {
            c.distanceKm = null;
        }
    });

    if (userCurrentCoords) {
        clinics.sort((a, b) => a.distanceKm - b.distanceKm);
    }

    if (clinics.length === 0) {
        dom.nearbyClinicsGrid.innerHTML = '<p class="text-muted" style="grid-column: 1/-1; text-align:center; padding: 30px;">ไม่พบสถานพยาบาลที่ตรงกับคำค้นหา</p>';
        return;
    }

    clinics.forEach(c => {
        const card = document.createElement('div');
        card.className = 'clinic-card';
        
        const badgeClass = c.type === 'gov' ? 'badge-gov' : (c.type === 'subdist' ? 'badge-subdist' : 'badge-private');
        const graphicClass = c.type === 'gov' ? 'graphic-pneumo' : (c.type === 'subdist' ? 'graphic-flu' : 'graphic-hpv');
        const iconName = c.type === 'gov' ? 'fa-hospital' : (c.type === 'subdist' ? 'fa-house-chimney-medical' : 'fa-building-shield');

        const distanceHtml = c.distanceKm !== null ? `
            <div class="clinic-distance">
                <i class="fa-solid fa-route"></i> ห่างประมาณ ${c.distanceKm.toFixed(1)} กม.
            </div>
        ` : '';

        const navUrl = `https://www.google.com/maps/dir/?api=1&destination=${c.lat},${c.lng}`;

        card.innerHTML = `
            <div>
                <div style="display: flex; align-items: flex-start; gap: 12px; margin-bottom: 10px;">
                    <div class="vaccine-graphic-badge ${graphicClass}" style="width: 40px; height: 40px; font-size: 16px; border: none;">
                        <i class="fa-solid ${iconName}"></i>
                    </div>
                    <div style="flex-grow: 1;">
                        <div class="clinic-card-header" style="margin-bottom: 4px;">
                            <span class="clinic-title">${c.name}</span>
                            <span class="clinic-badge ${badgeClass}">${c.typeName}</span>
                        </div>
                    </div>
                </div>
                <p class="clinic-details">
                    <i class="fa-solid fa-location-dot" style="color: var(--primary);"></i> ${c.address}
                </p>
                <p class="clinic-details" style="margin-bottom: 8px;">
                    <i class="fa-solid fa-shield-virus"></i> บริการ: ${c.services.join(', ')}
                </p>
                ${distanceHtml}
            </div>
            <div class="clinic-actions-row">
                <a href="tel:${c.tel}" class="btn btn-outline">
                    <i class="fa-solid fa-phone"></i> โทร ${c.tel}
                </a>
                <a href="${navUrl}" target="_blank" class="btn btn-primary">
                    <i class="fa-solid fa-diamond-turn-right"></i> นำทาง (Maps)
                </a>
            </div>
        `;
        dom.nearbyClinicsGrid.appendChild(card);
    });
}

// Haversine Distance Formula (km)
function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Earth radius in km
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a = 
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

function deg2rad(deg) {
    return deg * (Math.PI / 180);
}

// ==========================================================================
// SUB-SCREEN F: VACCINE PACKAGES & BENEFITS MODULE
// ==========================================================================
let activePromoFilter = 'all';

function renderPromoTab(searchKeyword = '') {
    if (!dom.promoPackagesGrid) return;
    dom.promoPackagesGrid.innerHTML = '';

    let promos = [...VACCINE_PROMOS];
    if (activePromoFilter !== 'all') {
        if (['shopee', 'rama', 'rajavithi'].includes(activePromoFilter)) {
            promos = promos.filter(p => p.providerType === activePromoFilter);
        } else {
            promos = promos.filter(p => p.vaccineId === activePromoFilter);
        }
    }

    if (searchKeyword) {
        const kw = searchKeyword.toLowerCase();
        promos = promos.filter(p =>
            p.title.toLowerCase().includes(kw) ||
            p.hospital.toLowerCase().includes(kw) ||
            p.categoryName.toLowerCase().includes(kw) ||
            (p.highlight && p.highlight.toLowerCase().includes(kw))
        );
    }

    if (promos.length === 0) {
        dom.promoPackagesGrid.innerHTML = '<p class="text-muted" style="grid-column: 1/-1; text-align:center; padding: 30px;">ไม่พบแพ็กเกจที่ตรงกับเงื่อนไขการค้นหา</p>';
        return;
    }

    promos.forEach(p => {
        const card = document.createElement('div');
        card.className = 'promo-card';

        const badgeIcon = p.providerType === 'shopee' ? 'fa-bag-shopping' : (p.providerType === 'rama' ? 'fa-hospital' : 'fa-building-columns');
        const badgeStyle = p.providerType === 'shopee' ? '' : (p.providerType === 'rama' ? 'background: rgba(2, 132, 199, 0.12); color: var(--primary); border: 1px solid rgba(2, 132, 199, 0.3);' : 'background: rgba(16, 185, 129, 0.12); color: #059640; border: 1px solid rgba(16, 185, 129, 0.3);');

        let priceHtml = '';
        if (p.originalPrice) {
            priceHtml = `
                <div class="promo-price-tag-group">
                    <span class="price-original">ปกติ ฿${p.originalPrice.toLocaleString('th-TH')}</span>
                    <div class="promo-price-tag">
                        <span class="price-value" style="color: #ee4d2d;">฿${p.promoPrice.toLocaleString('th-TH')}</span>
                        <span class="price-currency">/ คอร์ส</span>
                    </div>
                </div>
            `;
        } else {
            priceHtml = `
                <div class="promo-price-tag-group">
                    <span class="price-original" style="visibility: hidden;">-</span>
                    <div class="promo-price-tag">
                        <span class="price-value" style="color: #059640;">฿${p.promoPrice.toLocaleString('th-TH')}</span>
                        <span class="price-currency">/ เข็ม</span>
                    </div>
                </div>
            `;
        }

        let buttonHtml = '';
        if (p.providerType === 'shopee') {
            buttonHtml = `
                <a href="${p.shopeeUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-shopee btn-block">
                    <i class="fa-solid fa-cart-shopping"></i> สั่งซื้อ E-Coupon
                </a>
            `;
        } else if (p.providerType === 'rama') {
            buttonHtml = `
                <div style="display: flex; flex-direction: column; gap: 6px;">
                    <a href="${p.lineUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-primary btn-block" style="background: #06c755; border-color: #06c755;">
                        <i class="fa-brands fa-line"></i> สอบถาม / นัดหมาย LINE
                    </a>
                    <a href="tel:${p.tel}" class="btn btn-outline btn-block btn-sm">
                        <i class="fa-solid fa-phone"></i> โทร. ${p.tel}
                    </a>
                </div>
            `;
        } else {
            buttonHtml = `
                <a href="tel:${p.tel}" class="btn btn-outline btn-block">
                    <i class="fa-solid fa-phone"></i> โทร. ${p.tel}
                </a>
            `;
        }

        const promoGraphic = VACCINE_GRAPHIC_ICONS[p.vaccineId] || { icon: 'fa-tags', bgClass: 'graphic-flu' };

        card.innerHTML = `
            <div>
                <div class="promo-card-header">
                    <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 8px;">
                        <div class="vaccine-graphic-badge ${promoGraphic.bgClass}" style="width: 38px; height: 38px; font-size: 16px; border: none;">
                            <i class="fa-solid ${promoGraphic.icon}"></i>
                        </div>
                        <div>
                            <span class="shopee-badge" style="${badgeStyle}"><i class="fa-solid ${badgeIcon}"></i> ${p.badge}</span>
                        </div>
                        ${p.discountPercent ? `<span style="margin-left: auto; background: rgba(5, 150, 64, 0.12); color: #059640; border: 1px solid rgba(5, 150, 64, 0.25); font-size: 11px; font-weight: 700; padding: 2px 8px; border-radius: var(--radius-pill);">${p.discountPercent}</span>` : ''}
                    </div>
                    <h4 style="font-size: 15px; font-weight: 700; line-height: 1.35; margin-bottom: 4px;">${p.title}</h4>
                    <span class="promo-card-sub" style="color: var(--primary); font-weight: 600;"><i class="fa-solid fa-hospital"></i> ${p.hospital}</span>
                </div>
                <div class="promo-card-body">
                    <p style="font-size: 12.5px; color: var(--text-secondary); line-height: 1.5; margin-bottom: 12px;">${p.highlight}</p>
                    ${priceHtml}
                </div>
            </div>
            <div class="promo-card-footer" style="margin-top: 14px;">
                ${buttonHtml}
            </div>
        `;

        dom.promoPackagesGrid.appendChild(card);
    });
}

// ==========================================================================
// SUB-SCREEN G: VACCINE HEALTH ARTICLES & KNOWLEDGE BASE DIRECTORY
// ==========================================================================
const VACCINE_ARTICLES = [
    {
        id: 'art-why-adult-vaccines',
        category: 'guide',
        categoryName: 'คู่มือวัคซีนผู้ใหญ่',
        readTime: '4 นาที',
        title: 'ทำไมผู้ใหญ่ต้องฉีดวัคซีน? 5 วัคซีนจำเป็นที่คนวัยทำงานและผู้สูงอายุห้ามมองข้าม',
        excerpt: 'หลายคนเข้าใจผิดว่าวัคซีนเป็นเรื่องของเด็กเท่านั้น แต่ความจริงคือภูมิคุ้มกันวัยเด็กจะค่อยๆ ลดลงตามกาลเวลา และเชื้อโรคบางชนิดเป็นอันตรายในผู้ใหญ่มากกว่าเด็กหลายเท่า',
        author: 'สมาคมโรคติดเชื้อแห่งประเทศไทย & กรมควบคุมโรค',
        publishDate: '2026-08-15',
        relatedVaccineId: 'flu',
        content: `
            <h3>ทำไมภูมิคุ้มกันตอนเด็กจึงไม่เพียงพอตลอดชีวิต?</h3>
            <p>เมื่อเรามีอายุมากขึ้น ระดับแอนติบอดีหรือภูมิคุ้มกันที่เคยได้รับจากวัคซีนในวัยเด็กจะค่อยๆ ลดลงตามกาลเวลา (Immunosenescence) ประกอบกับเชื้อโรคสายพันธุ์ใหม่ๆ มีการกลายพันธุ์อยู่ตลอดเวลา การได้รับวัคซีนกระตุ้นจึงเป็นสิ่งจำเป็นอย่างยิ่งในการปกป้องสุขภาพ</p>
            
            <h3>5 วัคซีนสำคัญที่สุดสำหรับผู้ใหญ่และวัยทำงาน</h3>
            <ul>
                <li><b>1. วัคซีนไข้หวัดใหญ่ (Influenza):</b> ควรฉีดกระตุ้นปีละ 1 ครั้ง เพราะเชื้อไวรัสเปลี่ยนสายพันธุ์ทุกปี ช่วยลดความรุนแรงของโรคและการนอนโรงพยาบาลได้กว่า 70-80%</li>
                <li><b>2. วัคซีนบาดทะยัก-คอตีบ-ไอกรน (Tdap / Td):</b> ควรฉีดกระตุ้นทุกๆ 10 ปี เพื่อป้องกันเชื้อบาดทะยักจากบาดแผล และป้องกันเชื้อไอกรนที่อาจนำไปแพร่สู่ทารกในบ้าน</li>
                <li><b>3. วัคซีนงูสวัด (Shingrix):</b> สำหรับผู้ที่มีอายุตั้งแต่ 50 ปีขึ้นไป หรือผู้มีภูมิคุ้มกันบกพร่อง ป้องกันอาการปวดแสบร้อนทรมานตามแนวเส้นประสาทเรื้อรัง (PHN)</li>
                <li><b>4. วัคซีนมะเร็งปากมดลูก (HPV):</b> ป้องกันได้ทั้งผู้หญิงและผู้ชาย ช่วยป้องกันมะเร็งปากมดลูก มะเร็งทวารหนัก และหูดหงอนไก่</li>
                <li><b>5. วัคซีนปอดอักเสบนิวโมคอคคัส (Pneumococcal):</b> แนะนำสำหรับผู้มีอายุ 50-65 ปีขึ้นไป หรือผู้มีโรคประจำตัวเรื้อรัง ป้องกันการติดเชื้อในกระแสเลือดและปอดบวมรุนแรง</li>
            </ul>

            <div class="article-takeaway-box">
                <b>💡 สรุปข้อแนะนำ:</b> การฉีดวัคซีนผู้ใหญ่ช่วยลดค่ารักษาพยาบาลในระยะยาว และป้องกันไม่ให้โรคร้ายแรงมาบั่นทอนคุณภาพชีวิต สามารถปรึกษาแพทย์หรือประเมินความเสี่ยงสุขภาพผ่านระบบ VacPass ได้ทันที
            </div>
        `
    },
    {
        id: 'art-zoster-shingrix',
        category: 'senior',
        categoryName: 'ผู้สูงวัย 50-60+',
        readTime: '5 นาที',
        title: 'เจาะลึกวัคซีนงูสวัดรุ่นใหม่ (Shingrix): ใครควรฉีด ป้องกันได้ดีแค่ไหน และคุ้มค่าหรือไม่?',
        excerpt: 'โรคงูสวัดไม่ได้น่ากลัวแค่ผื่นตุ่มน้ำ แต่สิ่งที่ทรมานที่สุดคือ "อาการปวดปลายประสาทเรื้อรัง" ที่อาจยาวนานเป็นปีๆ มารู้จักวัคซีนรุ่นใหม่ที่ป้องกันได้สูงกว่า 90%',
        author: 'สมาคมโรคติดเชื้อแห่งประเทศไทย',
        publishDate: '2026-08-20',
        relatedVaccineId: 'zoster',
        content: `
            <h3>โรคงูสวัดเกิดจากอะไร?</h3>
            <p>คนไทยมากกว่า 90% เคยเป็นโรคอีสุกอีใสมาก่อนในวัยเด็ก เมื่อหายจากโรค เชื้อไวรัส <i>Varicella Zoster Virus</i> จะไม่ได้หายไปไหน แต่จะไปแฝงตัวอยู่อย่างเงียบๆ ในปมประสาทไขสันหลัง และจะกำเริบขึ้นมาเป็น <b>"โรคงูสวัด"</b> เมื่อร่างกายอ่อนแอ หรือเมื่ออายุมากขึ้นจนภูมิคุ้มกันตกลง</p>

            <h3>ภาวะแทรกซ้อนที่น่ากลัวที่สุด: ปวดแสบปวดร้อนเรื้อรัง (PHN)</h3>
            <p>ภาวะแทรกซ้อนที่พบบ่อยและทรมานที่สุดคือ <b>Post-Herpetic Neuralgia (PHN)</b> หรืออาการปวดแสบร้อนเหมือนไฟช็อตตามแนวเส้นประสาท แม้ผื่นตุ่มน้ำจะแห้งหายไปแล้ว แต่อาการปวดอาจคงอยู่นานหลายเดือนหรือหลายปี ส่งผลกระทบอย่างรุนแรงต่อการนอนหลับและการใช้ชีวิตประจำวัน</p>

            <h3>วัคซีนงูสวัดรุ่นใหม่ Shingrix แตกต่างอย่างไร?</h3>
            <ul>
                <li><b>ประสิทธิภาพสูง:</b> ป้องกันโรคงูสวัดและอาการปวดประสาท PHN ได้สูงถึง <b>97%</b> ในผู้ที่มีอายุ 50 ปีขึ้นไป</li>
                <li><b>ไม่ใช่เชื้อเป็น (Recombinant Subunit):</b> มีความปลอดภัยสูง สามารถฉีดในผู้ที่มีภาวะภูมิคุ้มกันบกพร่องหรือรับยากดภูมิคุ้มกันได้</li>
                <li><b>จำนวนเข็ม:</b> ฉีด 2 เข็ม ห่างกัน 2-6 เดือน เพื่อสร้างภูมิคุ้มกันที่อยู่ได้ยาวนานเกิน 10 ปี</li>
            </ul>

            <div class="article-takeaway-box">
                <b>💡 ใครควรฉีด:</b> ผู้ใหญ่อายุ 50 ปีขึ้นไปทุกคน แม้เคยเป็นงูสวัดมาแล้วก็สามารถฉีดได้เพื่อป้องกันการเป็นซ้ำ
            </div>
        `
    },
    {
        id: 'art-hpv-adults',
        category: 'women',
        categoryName: 'สตรีและวัยรุ่น',
        readTime: '4 นาที',
        title: 'วัคซีน HPV มะเร็งปากมดลูก: ผู้ชายและผู้ใหญ่อายุเกิน 26 ปียังฉีดได้ไหม และมีประโยชน์อย่างไร?',
        excerpt: 'ความเข้าใจเดิมคิดว่าวัคซีน HPV ต้องฉีดเฉพาะผู้หญิงวัยเรียนเท่านั้น แต่ปัจจุบันทางการแพทย์แนะนำให้ฉีดได้ทั้งชายและหญิงจนถึงอายุ 45 ปี',
        author: 'ราชวิทยาลัยสูตินรีแพทย์แห่งประเทศไทย',
        publishDate: '2026-08-22',
        relatedVaccineId: 'hpv',
        content: `
            <h3>ไวรัส HPV ไม่ได้ทำให้เกิดแค่มะเร็งปากมดลูก</h3>
            <p>เชื้อไวรัส Human Papillomavirus (HPV) เป็นสาเหตุหลักของ <b>มะเร็งปากมดลูก 99%</b> และยังเป็นสาเหตุของมะเร็งทวารหนัก มะเร็งช่องปากและลำคอ มะเร็งอวัยวะเพศชาย รวมถึงโรคหูดหงอนไก่ทั้งในผู้หญิงและผู้ชาย</p>

            <h3>ผู้ใหญ่อายุ 27-45 ปี ฉีดแล้วยังได้ประโยชน์หรือไม่?</h3>
            <p>ตามแนวทางเวชปฏิบัติปัจจุบัน ผู้ที่มีอายุ 27-45 ปี <b>ยังคงแนะนำให้ฉีดวัคซีน HPV</b> โดยเฉพาะชนิด 9 สายพันธุ์ (Gardasil 9) เพราะถึงแม้จะเคยมีเพศสัมพันธ์มาแล้ว ก็มักจะยังไม่เคยติดเชื้อครบทั้ง 9 สายพันธุ์ การฉีดวัคซีนจึงช่วยป้องกันสายพันธุ์ที่เหลือได้อย่างมีประสิทธิภาพ</p>

            <h3>ผู้ชายจำเป็นต้องฉีด HPV หรือไม่?</h3>
            <ul>
                <li>ป้องกันโรคหูดหงอนไก่ที่อวัยวะเพศ</li>
                <li>ป้องกันมะเร็งทวารหนัก และมะเร็งในช่องปาก/ลำคอ</li>
                <li>ช่วยลดการเป็นพาหะแพร่เชื้อไปสู่คู่ครอง</li>
            </ul>

            <div class="article-takeaway-box">
                <b>💡 คอร์สการฉีดในผู้ใหญ่:</b> อายุตั้งแต่ 15 ปีขึ้นไป ฉีดทั้งหมด 3 เข็ม (เดือนที่ 0, 1-2, และ 6) เพื่อภูมิคุ้มกันที่สมบูรณ์
            </div>
        `
    },
    {
        id: 'art-flu-high-dose',
        category: 'senior',
        categoryName: 'ผู้สูงวัย 50-60+',
        readTime: '3 นาที',
        title: 'วัคซีนไข้หวัดใหญ่ขนาดสูง (High Dose) คืออะไร? ต่างจากขนาดมาตรฐานอย่างไร และจำเป็นกับใคร?',
        excerpt: 'สำหรับผู้สูงอายุ 65 ปีขึ้นไป การฉีดวัคซีนไข้หวัดใหญ่ขนาดมาตรฐานอาจสร้างภูมิคุ้มกันได้น้อยลง วัคซีนขนาดสูง (High Dose) จึงถูกพัฒนาขึ้นเพื่อปกป้องผู้สูงวัยอย่างตรงจุด',
        author: 'สมาคมโรคติดเชื้อแห่งประเทศไทย',
        publishDate: '2026-08-25',
        relatedVaccineId: 'flu',
        content: `
            <h3>ทำไมผู้สูงอายุถึงเสี่ยงต่อไข้หวัดใหญ่มากกว่าคนทั่วไป?</h3>
            <p>เมื่ออายุเกิน 65 ปี ระบบภูมิคุ้มกันจะตอบสนองต่อวัคซีนขนาดมาตรฐานได้น้อยลงกว่าคนหนุ่มสาวถึง 50% ทำให้ผู้สูงอายุมีโอกาสเกิดภาวะแทรกซ้อนรุนแรง เช่น ปอดบวม กล้ามเนื้อหัวใจอักเสบ หรือภาวะหัวใจวายเฉียบพลันสูงขึ้นหลายเท่าตัว</p>

            <h3>ความแตกต่างของ High Dose กับ Standard Dose</h3>
            <ul>
                <li><b>ปริมาณแอนติเจนสูงกว่า 4 เท่า:</b> วัคซีน High Dose มีแอนติเจน 60 ไมโครกรัมต่อสายพันธุ์ (เทียบกับ 15 ไมโครกรัมในสูตรปกติ)</li>
                <li><b>ประสิทธิภาพสูงกว่า 24%:</b> ช่วยลดความเสี่ยงในการป่วยเป็นไข้หวัดใหญ่ลงอีก 24.2% เมื่อเทียบกับวัคซีนขนาดมาตรฐาน</li>
                <li><b>ลดการนอน รพ. และเสียชีวิต:</b> ลดอัตราการนอนรักษาตัวในโรงพยาบาลจากปอดอักเสบและโรคหัวใจได้อย่างมีนัยสำคัญ</li>
            </ul>

            <div class="article-takeaway-box">
                <b>💡 คำแนะนำ:</b> แนะนำเป็นพิเศษสำหรับผู้มีอายุตั้งแต่ 65 ปีขึ้นไป หรือผู้สูงอายุ 60 ปีขึ้นไปที่มีโรคประจำตัวเรื้อรัง
            </div>
        `
    },
    {
        id: 'art-dengue-qdenga',
        category: 'guide',
        categoryName: 'คู่มือวัคซีนผู้ใหญ่',
        readTime: '4 นาที',
        title: 'วัคซีนไข้เลือดออกตัวใหม่ (Qdenga): ใครฉีดได้บ้าง? ไม่เคยเป็นไข้เลือดออกฉีดได้หรือไม่?',
        excerpt: 'นวัตกรรมวัคซีนไข้เลือดออกชนิด 4 สายพันธุ์รุ่นใหม่ ที่ไม่ต้องตรวจเลือดหาก่อนฉีด และฉีดได้ตั้งแต่อายุ 4 ถึง 60 ปี',
        author: 'กรมควบคุมโรค กระทรวงสาธารณสุข',
        publishDate: '2026-08-28',
        relatedVaccineId: 'dengue',
        content: `
            <h3>ไข้เลือดออกเป็นซ้ำ เสี่ยงรุนแรงกว่าเดิม</h3>
            <p>ไวรัสเดงกีมี 4 สายพันธุ์ การติดเชื้อครั้งแรกอาจมีอาการไม่รุนแรงมาก แต่หากติดเชื้อซ้ำด้วยสายพันธุ์ที่ต่างกัน ร่างกายอาจเกิดปฏิกิริยาภูมิคุ้มกันที่รุนแรง (ADE) ทำให้เกิดภาวะช็อก มีเลือดออกในอวัยวะภายใน และเป็นอันตรายถึงชีวิตได้</p>

            <h3>จุดเด่นของวัคซีนไข้เลือดออกรุ่นใหม่ (TAK-003 / Qdenga)</h3>
            <ul>
                <li><b>ฉีดได้ทั้งคนที่เคยและไม่เคยเป็น:</b> ไม่จำเป็นต้องเจาะเลือดตรวจหาภูมิคุ้มกันเดิมก่อนฉีด</li>
                <li><b>ช่วงอายุที่ครอบคลุม:</b> รับรองสำหรับผู้มีอายุตั้งแต่ 4 ถึง 60 ปี</li>
                <li><b>ประสิทธิภาพสูง:</b> ป้องกันไข้เลือดออกทุกสายพันธุ์ได้ 80.2% และลดอัตราการนอนโรงพยาบาลได้ถึง <b>84%</b></li>
                <li><b>ตารางการฉีด:</b> ฉีดเพียง 2 เข็ม ห่างกัน 3 เดือน</li>
            </ul>

            <div class="article-takeaway-box">
                <b>💡 คำแนะนำ:</b> แนะนำสำหรับผู้ที่อาศัยอยู่ในเขตระบาด คนวัยทำงาน และผู้มีโรคเรื้อรัง เช่น เบาหวาน ความดัน หรือโรคตับ
            </div>
        `
    },
    {
        id: 'art-pneumococcal-pcv20',
        category: 'chronic',
        categoryName: 'กลุ่มโรคเรื้อรัง',
        readTime: '5 นาที',
        title: 'ผู้ป่วยเบาหวาน โรคไต โรคหัวใจ ทำไมต้องระวังปอดอักเสบ? ทำความรู้จักวัคซีน PCV20',
        excerpt: 'เชื้อนิวโมคอคคัสเป็นสาเหตุอันดับ 1 ของปอดบวมและติดเชื้อในกระแสเลือดในผู้สูงอายุและผู้ป่วยโรคเรื้อรัง มารู้จักแนวทางการฉีดวัคซีนป้องกันเข็มเดียวจบ',
        author: 'สมาคมโรคติดเชื้อแห่งประเทศไทย',
        publishDate: '2026-08-30',
        relatedVaccineId: 'pneumo',
        content: `
            <h3>ทำไมผู้มีโรคเรื้อรังถึงเสี่ยงต่อปอดอักเสบสูงกว่าคนทั่วไป?</h3>
            <p>ผู้ป่วยเบาหวาน โรคหัวใจ โรคปอดเรื้อรัง (COPD/หอบหืด) โรคไตวายเรื้อรัง และโรคตับ มีความเสี่ยงต่อการติดเชื้อแบคทีเรีย <i>Streptococcus pneumoniae</i> (นิวโมคอคคัส) สูงกว่าคนสุขภาพดีถึง <b>3-7 เท่า</b> และเมื่อติดเชื้อแล้วมีอัตราการเสียชีวิตสูงมาก</p>

            <h3>วัคซีนนิวโมคอคคัสชนิดคอนจูเกต 20 สายพันธุ์ (PCV20)</h3>
            <p>แนวทางเวชปฏิบัติปี 2568-2569 แนะนำวัคซีนคอนจูเกตรุ่นใหม่ล่าสุด <b>PCV20</b> ซึ่งครอบคลุมเชื้อสายพันธุ์ที่พบบ่อยในประเทศไทยได้มากถึง 20 สายพันธุ์:</p>
            <ul>
                <li><b>ฉีดเพียงเข็มเดียว (Single Dose):</b> ไม่ต้องฉีดวัคซีนหลายชนิดสลับกันเหมือนสูตรในอดีต</li>
                <li><b>กระตุ้นภูมิคุ้มกันระดับลึก (T-cell Dependent):</b> ให้ภูมิคุ้มกันที่อยู่ได้ยาวนานและลดการเป็นพาหะในลำคอ</li>
                <li><b>ป้องกันการติดเชื้อแบบรุกล้ำ:</b> ป้องกันภาวะเยื่อหุ้มสมองอักเสบและการติดเชื้อในกระแสเลือดได้อย่างดีเยี่ยม</li>
            </ul>

            <div class="article-takeaway-box">
                <b>💡 ใครบ้างที่ควรได้รับ:</b> ผู้มีอายุ 50-65 ปีขึ้นไป และผู้ป่วยโรคเรื้อรังทุกช่วงอายุ (18 ปีขึ้นไป)
            </div>
        `
    }
];

let activeArticleFilter = 'all';

function renderArticlesTab(searchKeyword = '') {
    if (!dom.articlesGrid) return;
    dom.articlesGrid.innerHTML = '';

    let articles = [...VACCINE_ARTICLES];
    if (activeArticleFilter !== 'all') {
        articles = articles.filter(a => a.category === activeArticleFilter);
    }

    if (searchKeyword) {
        const kw = searchKeyword.toLowerCase();
        articles = articles.filter(a => 
            a.title.toLowerCase().includes(kw) || 
            a.excerpt.toLowerCase().includes(kw) ||
            a.categoryName.toLowerCase().includes(kw) ||
            a.content.toLowerCase().includes(kw)
        );
    }

    if (articles.length === 0) {
        dom.articlesGrid.innerHTML = '<p class="text-muted" style="grid-column: 1/-1; text-align:center; padding: 30px;">ไม่พบบทความที่ตรงกับคำค้นหา</p>';
        return;
    }

    articles.forEach(a => {
        const card = document.createElement('div');
        card.className = 'article-card';
        card.onclick = () => openArticleModal(a.id);

        card.innerHTML = `
            <div>
                <div class="article-card-header">
                    <span class="article-category-badge">${a.categoryName}</span>
                    <span class="article-read-time"><i class="fa-regular fa-clock"></i> ${a.readTime}</span>
                </div>
                <h4 class="article-card-title">${a.title}</h4>
                <p class="article-card-excerpt">${a.excerpt}</p>
            </div>
            <div class="article-card-footer">
                <span style="font-size: 11px; color: var(--text-muted);"><i class="fa-solid fa-user-doctor"></i> ${a.author}</span>
                <button class="article-read-btn" type="button">
                    อ่านต่อ <i class="fa-solid fa-arrow-right"></i>
                </button>
            </div>
        `;

        dom.articlesGrid.appendChild(card);
    });
}

function openArticleModal(articleId) {
    const article = VACCINE_ARTICLES.find(a => a.id === articleId);
    if (!article || !dom.articleModal) return;

    if (dom.articleModalCategory) dom.articleModalCategory.textContent = article.categoryName;
    if (dom.articleModalReadTime) dom.articleModalReadTime.innerHTML = `<i class="fa-regular fa-clock"></i> ${article.readTime}`;

    if (dom.articleModalBody) {
        dom.articleModalBody.innerHTML = `
            <div style="margin-bottom: 18px; border-bottom: 1px solid var(--border); padding-bottom: 14px;">
                <h2 style="font-size: 18.5px; font-weight: 700; line-height: 1.4; color: var(--text-main); margin-bottom: 8px;">${article.title}</h2>
                <div style="font-size: 12px; color: var(--text-muted); display: flex; align-items: center; gap: 10px; flex-wrap: wrap;">
                    <span><i class="fa-solid fa-user-doctor"></i> ${article.author}</span>
                    <span>•</span>
                    <span><i class="fa-regular fa-calendar"></i> ข้อมูลเวชปฏิบัติปี 2568-2569</span>
                </div>
            </div>
            <div class="article-content-prose">
                ${article.content}
            </div>
        `;
    }

    if (dom.articleModalActions) {
        dom.articleModalActions.innerHTML = `
            <button class="btn btn-primary" onclick="switchToPromoForVaccine('${article.relatedVaccineId || 'all'}')">
                <i class="fa-solid fa-tags"></i> ดูแพ็กเกจวัคซีนที่เกี่ยวข้อง
            </button>
        `;
    }

    dom.articleModal.classList.add('open');
}

function switchToPromoForVaccine(vaccineId) {
    if (dom.articleModal) dom.articleModal.classList.remove('open');
    const landing = document.getElementById('screen-landing');
    if (landing && landing.classList.contains('active')) {
        const el = document.getElementById('landing-promos-section');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
        if (vaccineId && vaccineId !== 'all') {
            activeLandingPromoFilter = vaccineId;
            if (dom.landingPromoFilterChips) {
                dom.landingPromoFilterChips.forEach(chip => {
                    chip.classList.toggle('active', chip.getAttribute('data-landing-promo-filter') === vaccineId);
                });
            }
            renderLandingPromos();
        }
    } else if (dom.tabNavPromo) {
        dom.tabNavPromo.click();
        if (vaccineId && vaccineId !== 'all') {
            activePromoFilter = vaccineId;
            if (dom.promoFilterChips) {
                dom.promoFilterChips.forEach(chip => {
                    chip.classList.toggle('active', chip.getAttribute('data-promo-filter') === vaccineId);
                });
            }
            renderPromoTab();
        }
    }
}
window.switchToPromoForVaccine = switchToPromoForVaccine;
window.openArticleModal = openArticleModal;

// ==========================================================================
// LANDING PAGE SECTIONS RENDERERS
// ==========================================================================
let activeLandingPromoFilter = 'all';

function renderLandingPromos(searchKeyword = '') {
    if (!dom.landingPromoPackagesGrid) return;
    dom.landingPromoPackagesGrid.innerHTML = '';

    let promos = [...VACCINE_PROMOS];
    if (activeLandingPromoFilter !== 'all') {
        if (['shopee', 'rama', 'rajavithi'].includes(activeLandingPromoFilter)) {
            promos = promos.filter(p => p.providerType === activeLandingPromoFilter);
        } else {
            promos = promos.filter(p => p.vaccineId === activeLandingPromoFilter);
        }
    }

    if (searchKeyword) {
        const kw = searchKeyword.toLowerCase();
        promos = promos.filter(p =>
            p.title.toLowerCase().includes(kw) ||
            p.hospital.toLowerCase().includes(kw) ||
            p.categoryName.toLowerCase().includes(kw) ||
            (p.highlight && p.highlight.toLowerCase().includes(kw))
        );
    }

    if (promos.length === 0) {
        dom.landingPromoPackagesGrid.innerHTML = '<p class="text-muted" style="grid-column: 1/-1; text-align:center; padding: 30px;">ไม่พบแพ็กเกจที่ตรงกับเงื่อนไขการค้นหา</p>';
        return;
    }

    promos.forEach(p => {
        const card = document.createElement('div');
        card.className = 'promo-card';

        const badgeIcon = p.providerType === 'shopee' ? 'fa-bag-shopping' : (p.providerType === 'rama' ? 'fa-hospital' : 'fa-building-columns');
        const badgeStyle = p.providerType === 'shopee' ? '' : (p.providerType === 'rama' ? 'background: rgba(2, 132, 199, 0.12); color: var(--primary); border: 1px solid rgba(2, 132, 199, 0.3);' : 'background: rgba(16, 185, 129, 0.12); color: #059640; border: 1px solid rgba(16, 185, 129, 0.3);');

        let priceHtml = '';
        if (p.originalPrice) {
            priceHtml = `
                <div class="promo-price-tag-group">
                    <span class="price-original">ปกติ ฿${p.originalPrice.toLocaleString('th-TH')}</span>
                    <div class="promo-price-tag">
                        <span class="price-value" style="color: #ee4d2d;">฿${p.promoPrice.toLocaleString('th-TH')}</span>
                        <span class="price-currency">/ คอร์ส</span>
                    </div>
                </div>
            `;
        } else {
            priceHtml = `
                <div class="promo-price-tag-group">
                    <span class="price-original" style="visibility: hidden;">-</span>
                    <div class="promo-price-tag">
                        <span class="price-value" style="color: #059640;">฿${p.promoPrice.toLocaleString('th-TH')}</span>
                        <span class="price-currency">/ เข็ม</span>
                    </div>
                </div>
            `;
        }

        let buttonHtml = '';
        if (p.providerType === 'shopee') {
            buttonHtml = `
                <a href="${p.shopeeUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-shopee btn-block">
                    <i class="fa-solid fa-cart-shopping"></i> สั่งซื้อ E-Coupon
                </a>
            `;
        } else if (p.providerType === 'rama') {
            buttonHtml = `
                <div style="display: flex; flex-direction: column; gap: 6px;">
                    <a href="${p.lineUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-primary btn-block" style="background: #06c755; border-color: #06c755;">
                        <i class="fa-brands fa-line"></i> สอบถาม / นัดหมาย LINE
                    </a>
                    <a href="tel:${p.tel}" class="btn btn-outline btn-block btn-sm">
                        <i class="fa-solid fa-phone"></i> โทร. ${p.tel}
                    </a>
                </div>
            `;
        } else {
            buttonHtml = `
                <a href="tel:${p.tel}" class="btn btn-outline btn-block">
                    <i class="fa-solid fa-phone"></i> โทร. ${p.tel}
                </a>
            `;
        }

        const promoGraphic = VACCINE_GRAPHIC_ICONS[p.vaccineId] || { icon: 'fa-tags', bgClass: 'graphic-flu' };

        card.innerHTML = `
            <div>
                <div class="promo-card-header">
                    <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 8px;">
                        <div class="vaccine-graphic-badge ${promoGraphic.bgClass}" style="width: 38px; height: 38px; font-size: 16px; border: none;">
                            <i class="fa-solid ${promoGraphic.icon}"></i>
                        </div>
                        <div>
                            <span class="shopee-badge" style="${badgeStyle}"><i class="fa-solid ${badgeIcon}"></i> ${p.badge}</span>
                        </div>
                        ${p.discountPercent ? `<span style="margin-left: auto; background: rgba(5, 150, 64, 0.12); color: #059640; border: 1px solid rgba(5, 150, 64, 0.25); font-size: 11px; font-weight: 700; padding: 2px 8px; border-radius: var(--radius-pill);">${p.discountPercent}</span>` : ''}
                    </div>
                    <h4 style="font-size: 15px; font-weight: 700; line-height: 1.35; margin-bottom: 4px;">${p.title}</h4>
                    <span class="promo-card-sub" style="color: var(--primary); font-weight: 600;"><i class="fa-solid fa-hospital"></i> ${p.hospital}</span>
                </div>
                <div class="promo-card-body">
                    <p style="font-size: 12.5px; color: var(--text-secondary); line-height: 1.5; margin-bottom: 12px;">${p.highlight}</p>
                    ${priceHtml}
                </div>
            </div>
            <div class="promo-card-footer" style="margin-top: 14px;">
                ${buttonHtml}
            </div>
        `;

        dom.landingPromoPackagesGrid.appendChild(card);
    });
}

let activeLandingArticleFilter = 'all';

function renderLandingArticles() {
    if (!dom.landingArticlesGrid) return;
    dom.landingArticlesGrid.innerHTML = '';

    let articles = [...VACCINE_ARTICLES];
    if (activeLandingArticleFilter !== 'all') {
        articles = articles.filter(a => a.category === activeLandingArticleFilter);
    }

    articles.forEach(a => {
        const card = document.createElement('div');
        card.className = 'article-card';
        card.onclick = () => openArticleModal(a.id);

        card.innerHTML = `
            <div>
                <div class="article-card-header">
                    <span class="article-category-badge">${a.categoryName}</span>
                    <span class="article-read-time"><i class="fa-regular fa-clock"></i> ${a.readTime}</span>
                </div>
                <h4 class="article-card-title">${a.title}</h4>
                <p class="article-card-excerpt">${a.excerpt}</p>
            </div>
            <div class="article-card-footer">
                <span style="font-size: 11px; color: var(--text-muted);"><i class="fa-solid fa-user-doctor"></i> ${a.author}</span>
                <button class="article-read-btn" type="button">
                    อ่านต่อ <i class="fa-solid fa-arrow-right"></i>
                </button>
            </div>
        `;

        dom.landingArticlesGrid.appendChild(card);
    });
}

// ==========================================================================
// FORMAT 1: PRINTABLE VACCINE PASSPORT / MEDICAL CERTIFICATE (PDF)
// ==========================================================================
function generateVaccinePassportCertificate() {
    const profile = userState.profile || {};
    const age = profile.dob ? getAge(profile.dob) : '-';
    const fullName = profile.fullName || currentUser || 'ผู้ใช้งาน';
    const nationalId = profile.nationalId ? formatNationalId(profile.nationalId) : '-';
    const dobFormatted = profile.dob ? formatThaiDateString(new Date(profile.dob)) : '-';
    const genderText = profile.gender === 'female' ? (profile.pregnant ? `หญิง (ตั้งครรภ์ ${profile.gestationalWeeks || '-'} สัปดาห์)` : 'หญิง') : (profile.gender === 'male' ? 'ชาย' : '-');
    
    let conditionsText = 'ไม่มีโรคประจำตัว / บุคคลทั่วไป';
    if (profile.conditions && profile.conditions.length > 0 && !profile.conditions.includes('none')) {
        const conds = [];
        if (profile.conditions.includes('chronic')) conds.push('โรคเรื้อรัง (ปอด, หัวใจ, เบาหวาน, ไต, ตับ)');
        if (profile.conditions.includes('immunocompromised')) conds.push('ภาวะภูมิคุ้มกันบกพร่อง / ผู้รับยากดภูมิคุ้มกัน');
        conditionsText = conds.join(', ');
    }

    const todayThai = formatThaiDateString(new Date());

    // Completed records rows
    let recordsRows = '';
    if (userState.records && userState.records.length > 0) {
        userState.records.forEach((r, idx) => {
            const vInfo = VACCINE_INFO[r.vaccineId] || { nameTh: r.vaccineId, nameEn: '' };
            recordsRows += `
                <tr>
                    <td style="text-align: center;">${idx + 1}</td>
                    <td><b>${vInfo.nameTh}</b><br><small style="color: #64748b;">${vInfo.nameEn}</small></td>
                    <td style="text-align: center;">เข็มที่ ${r.dose}</td>
                    <td style="text-align: center;">${formatThaiDateString(new Date(r.date))}</td>
                    <td>${r.brand || '-'}</td>
                    <td>${r.location || '-'}</td>
                </tr>
            `;
        });
    } else {
        recordsRows = `<tr><td colspan="6" style="text-align: center; color: #94a3b8; padding: 20px;">ยังไม่มีบันทึกประวัติการฉีดวัคซีน</td></tr>`;
    }

    // Recommended vaccines rows
    let recRows = '';
    const trackIds = Object.keys(VACCINE_INFO);
    trackIds.forEach(vid => {
        const vInfo = VACCINE_INFO[vid];
        const rec = analyzeVaccineRecommendation(vid, age, profile);
        if (rec.status === 'highly') {
            const dosesLogged = (userState.records || []).filter(r => r.vaccineId === vid);
            const isCompleted = dosesLogged.length >= vInfo.totalDosesNeeded;
            recRows += `
                <tr>
                    <td><b>${vInfo.nameTh}</b></td>
                    <td><span style="color: #0284c7; font-weight: 600;">แนะนำตามเกณฑ์แพทย์ (Routine)</span></td>
                    <td>${rec.reason}</td>
                    <td style="text-align: center;">${isCompleted ? '<span style="color: #059640; font-weight: 600;">✓ ครบคอร์สแล้ว</span>' : `<span style="color: #d97706; font-weight: 600;">ฉีดแล้ว ${dosesLogged.length}/${vInfo.totalDosesNeeded} เข็ม</span>`}</td>
                </tr>
            `;
        }
    });

    const certHtml = `
<!DOCTYPE html>
<html lang="th">
<head>
    <meta charset="UTF-8">
    <title>สมุดบันทึกประวัติวัคซีนดิจิทัล - ${fullName}</title>
    <link href="https://fonts.googleapis.com/css2?family=Prompt:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'Prompt', -apple-system, sans-serif; background: #f8fafc; color: #0f172a; padding: 24px; font-size: 13px; line-height: 1.5; }
        @page { size: A4; margin: 12mm 15mm; }
        .no-print-bar { background: #0284c7; color: white; padding: 12px 24px; border-radius: 12px; margin-bottom: 24px; display: flex; justify-content: space-between; align-items: center; box-shadow: 0 4px 12px rgba(2, 132, 199, 0.25); }
        .btn-print { background: #ffffff; color: #0284c7; border: none; padding: 8px 18px; border-radius: 8px; font-weight: 700; font-family: inherit; font-size: 14px; cursor: pointer; }
        .btn-close { background: rgba(255,255,255,0.2); color: #ffffff; border: 1px solid rgba(255,255,255,0.4); padding: 8px 16px; border-radius: 8px; font-weight: 600; font-family: inherit; font-size: 13px; cursor: pointer; margin-left: 8px; }
        .cert-paper { background: #ffffff; max-width: 840px; min-height: 297mm; margin: 0 auto; padding: 36px 40px; border-radius: 12px; border: 1.5px solid #cbd5e1; box-shadow: 0 8px 24px rgba(0,0,0,0.06); display: flex; flex-direction: column; justify-content: space-between; }
        .cert-content-body { flex-grow: 1; }
        .cert-header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #0284c7; padding-bottom: 16px; margin-bottom: 20px; }
        .cert-title h1 { font-size: 20px; color: #0284c7; font-weight: 700; }
        .cert-title p { font-size: 12px; color: #64748b; }
        .patient-box { background: #f1f5f9; border-radius: 8px; padding: 14px 18px; margin-bottom: 20px; display: grid; grid-template-columns: 1fr 1fr; gap: 8px 20px; }
        .patient-item { font-size: 12.5px; }
        .patient-item b { color: #334155; }
        .section-title { font-size: 14px; font-weight: 700; color: #0f172a; margin: 18px 0 8px 0; display: flex; align-items: center; gap: 6px; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 18px; font-size: 12px; }
        th { background: #f8fafc; color: #475569; font-weight: 600; border: 1px solid #e2e8f0; padding: 8px 10px; text-align: left; }
        td { border: 1px solid #e2e8f0; padding: 8px 10px; vertical-align: top; }
        .cert-footer { border-top: 1px solid #cbd5e1; padding-top: 14px; margin-top: 24px; font-size: 11.5px; color: #475569; text-align: center; width: 100%; }
        @media print {
            body { background: #ffffff !important; padding: 0 !important; margin: 0 !important; }
            .no-print-bar { display: none !important; }
            .cert-paper { border: none !important; box-shadow: none !important; padding: 0 !important; max-width: 100% !important; min-height: 268mm !important; display: flex !important; flex-direction: column !important; justify-content: space-between !important; }
            .cert-footer { margin-top: auto !important; border-top: 1px solid #cbd5e1 !important; padding-top: 12px !important; text-align: center !important; }
        }
    </style>
</head>
<body>
    <div class="no-print-bar">
        <div>
            <b>📄 สรุปประวัติวัคซีนดิจิทัลส่วนบุคคล (Digital Vaccine Record)</b>
            <span style="font-size: 12px; opacity: 0.9; margin-left: 10px;">พร้อมพิมพ์หรือบันทึกเป็น PDF สำหรับแสดงต่อแพทย์</span>
        </div>
        <div>
            <button class="btn-print" onclick="window.print()">🖨️ พิมพ์เอกสาร / บันทึก PDF</button>
            <button class="btn-close" onclick="window.close()">ปิดหน้านี้</button>
        </div>
    </div>

    <div class="cert-paper">
        <div class="cert-content-body">
            <div class="cert-header">
                <div class="cert-title">
                    <h1>สมุดบันทึกและประวัติการรับวัคซีนดิจิทัล</h1>
                    <p>VacPass Digital Personal Immunization Record • ข้อมูลบันทึกส่วนบุคคลอ้างอิงแนวทางสมาคมโรคติดเชื้อแห่งประเทศไทย (IDAT 2026)</p>
                </div>
                <div style="text-align: right; font-size: 11px; color: #64748b;">
                    <b>วันที่ออกเอกสาร:</b> ${todayThai}<br>
                    <b>รหัสเอกสาร:</b> VP-${Date.now().toString().slice(-6)}
                </div>
            </div>

            <div class="patient-box">
                <div class="patient-item"><b>ชื่อ-นามสกุล:</b> คุณ ${fullName}</div>
                <div class="patient-item"><b>เลขประจำตัวประชาชน:</b> ${nationalId}</div>
                <div class="patient-item"><b>วันเดือนปีเกิด:</b> ${dobFormatted} (อายุ ${age} ปี)</div>
                <div class="patient-item"><b>เพศ / สภาวะ:</b> ${genderText}</div>
                <div class="patient-item" style="grid-column: 1 / -1;"><b>ปัจจัยเสี่ยงทางการแพทย์:</b> ${conditionsText}</div>
            </div>

            <div class="section-title">💉 1. ประวัติการได้รับวัคซีนที่บันทึกไว้ในระบบ (Vaccination History)</div>
            <table>
                <thead>
                    <tr>
                        <th style="width: 40px; text-align: center;">ลำดับ</th>
                        <th>ชื่อวัคซีน (Vaccine Name)</th>
                        <th style="width: 70px; text-align: center;">เข็มที่</th>
                        <th style="width: 110px; text-align: center;">วันที่ได้รับ</th>
                        <th>ยี่ห้อ / บริษัทผู้ผลิต</th>
                        <th>สถานพยาบาลที่รับบริการ</th>
                    </tr>
                </thead>
                <tbody>
                    ${recordsRows}
                </tbody>
            </table>

            <div class="section-title">🩺 2. รายการวัคซีนที่แนะนำตามเกณฑ์ทางการแพทย์ (Recommended Vaccines)</div>
            <table>
                <thead>
                    <tr>
                        <th style="width: 170px;">ชื่อวัคซีน</th>
                        <th style="width: 140px;">สถานะคำแนะนำ</th>
                        <th>ข้อบ่งชี้และเหตุผลทางการแพทย์</th>
                        <th style="width: 110px; text-align: center;">สถานะการฉีด</th>
                    </tr>
                </thead>
                <tbody>
                    ${recRows}
                </tbody>
            </table>
        </div>

        <div class="cert-footer">
            <div style="font-weight: 600; color: #334155; margin-bottom: 3px;">
                * ข้อจำกัดความรับผิดชอบทางการแพทย์และมาตรฐานข้อมูล (Medical Disclaimer) *
            </div>
            <div style="font-size: 11px; color: #64748b; line-height: 1.45;">
                เอกสารนี้เป็นสรุปประวัติวัคซีนและผลการประเมินสุขภาพเบื้องต้นที่บันทึกโดยผู้ใช้งานด้วยตนเอง (Self-Reported Personal Record) อ้างอิงตามแนวทางสมาคมโรคติดเชื้อแห่งประเทศไทย (IDAT 2026)<br>
                <b>มิใช่ใบรับรองแพทย์หรือเอกสารรับรองการสร้างเสริมภูมิคุ้มกันโรคอย่างเป็นทางการจากกระทรวงสาธารณสุข</b> และไม่สามารถใช้ทดแทนการตรวจ วินิจฉัย หรือคำสั่งการรักษาจากแพทย์ผู้เชี่ยวชาญได้
            </div>
        </div>
    </div>
</body>
</html>
    `;

    const printWin = window.open('', '_blank');
    if (printWin) {
        printWin.document.open();
        printWin.document.write(certHtml);
        printWin.document.close();
    } else {
        alert('กรุณาอนุญาตให้เบราว์เซอร์เปิด Pop-up เพื่อพิมพ์เอกสาร');
    }
}

// ==========================================================================
// FORMAT 2: CALENDAR SYNC (.ICS) FOR APPLE / GOOGLE CALENDAR
// ==========================================================================
function generateCalendarIcs() {
    const profile = userState.profile || {};
    const records = userState.records || [];
    const age = profile.dob ? getAge(profile.dob) : 30;
    
    let events = [];

    // 1. Calculate next doses from existing records
    records.forEach(r => {
        const vInfo = VACCINE_INFO[r.vaccineId];
        if (!vInfo) return;
        const recordDate = new Date(r.date);
        if (isNaN(recordDate.getTime())) return;

        const currentDose = parseInt(r.dose) || 1;

        if (r.vaccineId === 'zoster' && currentDose === 1) {
            const d2 = new Date(recordDate);
            d2.setDate(d2.getDate() + 60);
            events.push({
                summary: `💉 ฉีดวัคซีนงูสวัด (Shingrix) เข็มที่ 2`,
                description: `กำหนดการฉีดวัคซีนป้องกันโรคงูสวัด เข็มที่ 2 (เว้นห่างจากเข็มแรก 2-6 เดือน) เพื่อภูมิคุ้มกันสูงสุด\\nบันทึกจาก VacPass`,
                date: d2
            });
        } else if (r.vaccineId === 'hpv') {
            if (currentDose === 1) {
                const d2 = new Date(recordDate);
                d2.setDate(d2.getDate() + 60);
                events.push({
                    summary: `💉 ฉีดวัคซีน HPV มะเร็งปากมดลูก เข็มที่ 2`,
                    description: `กำหนดการฉีดวัคซีน HPV เข็มที่ 2 (เดือนที่ 2 หลังเข็มแรก)\\nบันทึกจาก VacPass`,
                    date: d2
                });
            } else if (currentDose === 2) {
                const d3 = new Date(recordDate);
                d3.setDate(d3.getDate() + 120);
                events.push({
                    summary: `💉 ฉีดวัคซีน HPV มะเร็งปากมดลูก เข็มที่ 3 (ครบคอร์ส)`,
                    description: `กำหนดการฉีดวัคซีน HPV เข็มที่ 3 ครบคอร์ส (เดือนที่ 6 หลังเข็มแรก)\\nบันทึกจาก VacPass`,
                    date: d3
                });
            }
        } else if (r.vaccineId === 'hepb') {
            if (currentDose === 1) {
                const d2 = new Date(recordDate);
                d2.setDate(d2.getDate() + 30);
                events.push({
                    summary: `💉 ฉีดวัคซีนไวรัสตับอักเสบบี เข็มที่ 2`,
                    description: `กำหนดการฉีดวัคซีนไวรัสตับอักเสบบี เข็มที่ 2 (1 เดือนหลังเข็มแรก)\\nบันทึกจาก VacPass`,
                    date: d2
                });
            } else if (currentDose === 2) {
                const d3 = new Date(recordDate);
                d3.setDate(d3.getDate() + 150);
                events.push({
                    summary: `💉 ฉีดวัคซีนไวรัสตับอักเสบบี เข็มที่ 3 (ครบคอร์ส)`,
                    description: `กำหนดการฉีดวัคซีนไวรัสตับอักเสบบี เข็มที่ 3 ครบคอร์ส (6 เดือนหลังเข็มแรก)\\nบันทึกจาก VacPass`,
                    date: d3
                });
            }
        } else if (r.vaccineId === 'dengue' && currentDose === 1) {
            const d2 = new Date(recordDate);
            d2.setDate(d2.getDate() + 90);
            events.push({
                summary: `💉 ฉีดวัคซีนไข้เลือดออก (Qdenga) เข็มที่ 2 (ครบคอร์ส)`,
                description: `กำหนดการฉีดวัคซีนไข้เลือดออก เข็มที่ 2 ครบคอร์ส (3 เดือนหลังเข็มแรก)\\nบันทึกจาก VacPass`,
                date: d2
            });
        } else if (r.vaccineId === 'flu') {
            const nextYear = new Date(recordDate);
            nextYear.setFullYear(nextYear.getFullYear() + 1);
            events.push({
                summary: `💉 ฉีดวัคซีนไข้หวัดใหญ่ประจำปี (Annual Flu Booster)`,
                description: `ครบกำหนดฉีดวัคซีนไข้หวัดใหญ่ประจำปี เพื่อป้องกันเชื้อสายพันธุ์ใหม่\\nบันทึกจาก VacPass`,
                date: nextYear
            });
        }
    });

    // 2. If no future events calculated, add scheduled routine reminders
    if (events.length === 0) {
        const nextWeek = new Date();
        nextWeek.setDate(nextWeek.getDate() + 7);
        nextWeek.setHours(9, 0, 0, 0);

        Object.keys(VACCINE_INFO).forEach(vid => {
            const rec = analyzeVaccineRecommendation(vid, age, profile);
            if (rec.status === 'highly' && !records.some(r => r.vaccineId === vid)) {
                const vInfo = VACCINE_INFO[vid];
                events.push({
                    summary: `💉 นัดหมายฉีดวัคซีน: ${vInfo.nameTh}`,
                    description: `วัคซีนที่แพทย์แนะนำสำหรับคุณ: ${vInfo.nameTh}\\nเหตุผล: ${rec.reason}\\nบันทึกจาก VacPass`,
                    date: new Date(nextWeek)
                });
                nextWeek.setDate(nextWeek.getDate() + 7);
            }
        });
    }

    if (events.length === 0) {
        alert('ℹ️ คุณได้รับวัคซีนครบตามเกณฑ์แนะนำทั้งหมดแล้ว ยังไม่มีกำหนดการฉีดเข็มถัดไป');
        return;
    }

    const formatIcsDate = (d) => {
        const pad = (n) => String(n).padStart(2, '0');
        return `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}T090000`;
    };
    const formatIcsEndDate = (d) => {
        const pad = (n) => String(n).padStart(2, '0');
        return `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}T100000`;
    };
    const nowUtc = new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';

    let icsContent = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//VacPass//Vaccine Reminder Calendar//TH',
        'CALSCALE:GREGORIAN',
        'METHOD:PUBLISH',
        'X-WR-CALNAME:กำหนดการฉีดวัคซีน (VacPass)'
    ];

    events.forEach((ev, idx) => {
        const dtStart = formatIcsDate(ev.date);
        const dtEnd = formatIcsEndDate(ev.date);
        icsContent.push(
            'BEGIN:VEVENT',
            `UID:vacpass-${Date.now()}-${idx}@vacpass.pages.dev`,
            `DTSTAMP:${nowUtc}`,
            `DTSTART:${dtStart}`,
            `DTEND:${dtEnd}`,
            `SUMMARY:${ev.summary}`,
            `DESCRIPTION:${ev.description.replace(/\n/g, '\\n')}`,
            'STATUS:CONFIRMED',
            'BEGIN:VALARM',
            'TRIGGER:-P1D',
            'DESCRIPTION:แจ้งเตือนล่วงหน้า 1 วัน',
            'ACTION:DISPLAY',
            'END:VALARM',
            'END:VEVENT'
        );
    });

    icsContent.push('END:VCALENDAR');

    const blob = new Blob([icsContent.join('\r\n')], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.setAttribute('download', 'vacpass_vaccine_schedule.ics');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    alert(`🗓️ สร้างไฟล์ปฏิทินนัดหมาย (${events.length} รายการ) สำเร็จเรียบร้อย!\n\nคุณสามารถแตะเปิดไฟล์ .ics เพื่อเพิ่มลงใน Apple Calendar หรือ Google Calendar บนมือถือได้ทันทีครับ`);
}

// ==========================================================================
// PDPA COMPLIANCE: EXPORT DATA & ACCOUNT ERASURE
// ==========================================================================
function exportUserData() {
    const exportObject = {
        exportedAt: new Date().toISOString(),
        standard: 'PDPA Section 26 Health Data Portability',
        user: {
            username: currentUser,
            profile: userState.profile
        },
        vaccineHistory: userState.records.map(r => ({
            vaccine: VACCINE_INFO[r.vaccineId]?.nameTh || r.vaccineId,
            dose: r.dose,
            brand: r.brand,
            date: r.date,
            location: r.location
        }))
    };

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportObject, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `vaccine_booklet_${currentUser}_export.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
}

async function deleteUserAccountPermanently() {
    const confirmPrompt = prompt('⚠️ คุณกำลังจะลบบัญชีและประวัติวัคซีนทั้งหมดอย่างถาวร (PDPA Right to Erasure)\n\nกรุณาพิมพ์คำว่า "DELETE" เพื่อยืนยัน:');
    if (confirmPrompt === 'DELETE') {
        try {
            const res = await authFetch(`/api/user?id=${encodeURIComponent(currentUserId)}`, { method: 'DELETE' });
            if (!res.ok) throw new Error('Failed to delete user');
            alert('ลบข้อมูลและบัญชีของคุณสำเร็จเรียบร้อยแล้ว');
            logout();
        } catch (e) {
            alert('❌ เกิดข้อผิดพลาด: ' + e.message);
        }
    }
}
window.deleteUserAccountPermanently = deleteUserAccountPermanently;

// ==========================================================================
// MODAL LOGIC
// ==========================================================================
function setupModalListeners() {
    dom.addNewRecordBtn.addEventListener('click', openRecordModal);
    dom.recordModalCloseBtn.addEventListener('click', closeRecordModal);
    dom.recordModalCancelBtn.addEventListener('click', closeRecordModal);
    
    dom.notifModalCloseBtn.addEventListener('click', () => dom.notifModal.classList.remove('open'));
    dom.notifModalCancelBtn.addEventListener('click', () => dom.notifModal.classList.remove('open'));
    
    dom.pdpaModalCloseBtn.addEventListener('click', () => dom.pdpaModal.classList.remove('open'));
    dom.pdpaModalCloseFooterBtn.addEventListener('click', () => dom.pdpaModal.classList.remove('open'));

    // Export & Calendar Modal
    if (dom.exportModalCloseBtn) {
        dom.exportModalCloseBtn.addEventListener('click', () => dom.exportModal.classList.remove('open'));
    }
    if (dom.exportModalCancelBtn) {
        dom.exportModalCancelBtn.addEventListener('click', () => dom.exportModal.classList.remove('open'));
    }
    if (dom.btnExportCertificate) {
        dom.btnExportCertificate.addEventListener('click', () => {
            dom.exportModal.classList.remove('open');
            generateVaccinePassportCertificate();
        });
    }
    if (dom.btnExportCalendar) {
        dom.btnExportCalendar.addEventListener('click', () => {
            dom.exportModal.classList.remove('open');
            generateCalendarIcs();
        });
    }
    if (dom.btnExportJsonRaw) {
        dom.btnExportJsonRaw.addEventListener('click', () => {
            dom.exportModal.classList.remove('open');
            exportUserData();
        });
    }

    // Article Reader Modal
    if (dom.articleModalCloseBtn) {
        dom.articleModalCloseBtn.addEventListener('click', () => {
            if (dom.articleModal) dom.articleModal.classList.remove('open');
        });
    }
    if (dom.articleModalCloseFooterBtn) {
        dom.articleModalCloseFooterBtn.addEventListener('click', () => {
            if (dom.articleModal) dom.articleModal.classList.remove('open');
        });
    }

    // Reset Password Modal
    if (dom.btnOpenForgotPassword) {
        dom.btnOpenForgotPassword.addEventListener('click', () => {
            if (dom.resetPassForm) dom.resetPassForm.reset();
            if (dom.resetPassErrorMsg) dom.resetPassErrorMsg.style.display = 'none';
            if (dom.resetMatchHint) dom.resetMatchHint.textContent = '';
            dom.resetPassModal.classList.add('open');
        });
    }

    if (dom.resetPassModalCloseBtn) {
        dom.resetPassModalCloseBtn.addEventListener('click', () => dom.resetPassModal.classList.remove('open'));
    }
    if (dom.resetPassModalCancelBtn) {
        dom.resetPassModalCancelBtn.addEventListener('click', () => dom.resetPassModal.classList.remove('open'));
    }

    const resetInputElem = dom.resetIdentifier || dom.resetNationalId;
    if (resetInputElem) {
        resetInputElem.addEventListener('input', (e) => {
            const clean = e.target.value.replace(/\D/g, '');
            if (clean.length > 10) {
                e.target.value = formatNationalId(e.target.value);
            } else {
                e.target.value = formatPhone(e.target.value);
            }
        });
    }

    if (dom.resetNewPassword && dom.resetConfirmNewPassword) {
        const checkResetPassMatch = () => {
            const p1 = dom.resetNewPassword.value;
            const p2 = dom.resetConfirmNewPassword.value;
            if (!dom.resetMatchHint) return;

            if (!p1 && !p2) {
                dom.resetMatchHint.textContent = '';
            } else if (p1 && p1.length < 6) {
                dom.resetMatchHint.textContent = '⚠️ รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร';
                dom.resetMatchHint.style.color = '#d97706';
            } else if (p1 && p2 && p1 === p2) {
                dom.resetMatchHint.textContent = '✓ รหัสผ่านตรงกันเรียบร้อย';
                dom.resetMatchHint.style.color = '#059640';
            } else if (p2 && p1 !== p2) {
                dom.resetMatchHint.textContent = '✗ รหัสผ่านไม่ตรงกัน';
                dom.resetMatchHint.style.color = '#dc2626';
            }
        };

        dom.resetNewPassword.addEventListener('input', checkResetPassMatch);
        dom.resetConfirmNewPassword.addEventListener('input', checkResetPassMatch);
    }

    if (dom.resetPassForm) {
        dom.resetPassForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const identifier = (dom.resetIdentifier || dom.resetNationalId).value.trim();
            const verifyValue = dom.resetVerifyValue.value.trim();
            const newPassword = dom.resetNewPassword.value;
            const confirmNewPassword = dom.resetConfirmNewPassword.value;

            if (newPassword !== confirmNewPassword) {
                if (dom.resetPassErrorMsg) {
                    dom.resetPassErrorMsg.textContent = '❌ รหัสผ่านและยืนยันรหัสผ่านไม่ตรงกัน';
                    dom.resetPassErrorMsg.style.display = 'block';
                }
                return;
            }

            try {
                if (dom.btnSubmitResetPass) {
                    dom.btnSubmitResetPass.disabled = true;
                    dom.btnSubmitResetPass.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> กำลังบันทึก...';
                }

                const res = await fetch('/api/reset-password', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ identifier, verifyValue, newPassword })
                });

                const data = await res.json();
                if (!res.ok) throw new Error(data.error || 'ตั้งรหัสผ่านใหม่ไม่สำเร็จ');

                alert('✅ ตั้งรหัสผ่านใหม่สำเร็จเรียบร้อย! ระบบจะนำท่านเข้าสู่ระบบทันที');
                dom.resetPassModal.classList.remove('open');

                currentUser = data.displayName || data.username || data.fullName;
                currentUserId = data.id;
                if (data.token) {
                    currentAuthToken = data.token;
                    localStorage.setItem('vaccine_auth_token', currentAuthToken);
                }
                localStorage.setItem('vaccine_current_user', currentUser);
                localStorage.setItem('vaccine_current_user_id', currentUserId);

                await loadUserSession();
            } catch (err) {
                if (dom.resetPassErrorMsg) {
                    dom.resetPassErrorMsg.textContent = '❌ ' + err.message;
                    dom.resetPassErrorMsg.style.display = 'block';
                }
            } finally {
                if (dom.btnSubmitResetPass) {
                    dom.btnSubmitResetPass.disabled = false;
                    dom.btnSubmitResetPass.innerHTML = '<i class="fa-solid fa-check"></i> บันทึกรหัสผ่านใหม่';
                }
            }
        });
    }
    
    dom.recordVaccine.addEventListener('change', updateBrandDropdown);
    dom.recordBrand.addEventListener('change', toggleBrandOtherInput);
    
    dom.recordForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        let vaccineId = dom.recordVaccine.value;
        const dose = dom.recordDose.value;
        const date = dom.recordDate.value;
        
        const brandSelectValue = dom.recordBrand.value;
        const brand = brandSelectValue === 'Other' ? dom.recordBrandOther.value.trim() : brandSelectValue;
        const location = dom.recordLocation.value.trim();
        
        let mappedVaccineId = vaccineId === 'flu_hd' ? 'flu' : vaccineId;
        
        const age = getAge(userState.profile.dob);
        const rec = analyzeVaccineRecommendation(mappedVaccineId, age, userState.profile);
        
        if (rec.status === 'contraindicated') {
            if (!confirm(`⚠️ วัคซีนนี้เป็นข้อห้ามทางการแพทย์ในสภาวะสุขภาพปัจจุบันของคุณ ยืนยันจะบันทึกหรือไม่?`)) {
                return;
            }
        }
        
        const recordId = 'rec-' + Date.now();
        const newRecord = {
            id: recordId,
            userId: currentUserId,
            vaccineId: mappedVaccineId,
            dose,
            date,
            brand,
            location
        };
        
        try {
            const res = await authFetch('/api/logs', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newRecord)
            });
            if (!res.ok) throw new Error('Failed to save record');
            userState.records.push({
                id: recordId,
                vaccineId: mappedVaccineId,
                dose,
                brand,
                date,
                location
            });
            closeRecordModal();
            renderLogbookTab();
        } catch (err) {
            alert('❌ บันทึกไม่สำเร็จ: ' + err.message);
        }
    });
}

function openRecordModal() {
    dom.recordVaccine.value = '';
    dom.recordDose.value = '1';
    dom.recordDate.value = new Date().toISOString().split('T')[0];
    dom.modalTitle.textContent = 'บันทึกการรับวัคซีน';
    updateBrandDropdown();
    dom.recordModal.classList.add('open');
}

function openRecordModalFor(vaccineId, doseNum) {
    openRecordModal();
    if (vaccineId === 'flu') {
        const age = getAge(userState.profile.dob);
        dom.recordVaccine.value = age >= 60 ? 'flu_hd' : 'flu';
    } else {
        dom.recordVaccine.value = vaccineId;
    }
    updateBrandDropdown();
    dom.recordDose.value = doseNum;
    dom.modalTitle.textContent = `บันทึกการรับวัคซีน: ${VACCINE_INFO[vaccineId]?.nameTh || vaccineId}`;
}
window.openRecordModalFor = openRecordModalFor;

function closeRecordModal() {
    dom.recordModal.classList.remove('open');
}

function updateBrandDropdown() {
    dom.recordBrand.innerHTML = '';
    const selectedVaccine = dom.recordVaccine.value;
    
    if (!selectedVaccine) {
        const opt = document.createElement('option');
        opt.value = '';
        opt.textContent = '-- เลือกประเภทวัคซีนก่อน --';
        dom.recordBrand.appendChild(opt);
        dom.recordBrand.disabled = true;
        hideBrandOtherInput();
        return;
    }
    
    dom.recordBrand.disabled = false;
    const brands = BRAND_OPTIONS_MAP[selectedVaccine] || ['Other'];
    brands.forEach(b => {
        const opt = document.createElement('option');
        opt.value = b;
        opt.textContent = b === 'Other' ? 'อื่นๆ (ระบุเอง)' : b;
        dom.recordBrand.appendChild(opt);
    });
    toggleBrandOtherInput();
}

function toggleBrandOtherInput() {
    if (dom.recordBrand.value === 'Other') {
        dom.recordBrandOtherGroup.classList.add('show');
        dom.recordBrandOther.required = true;
    } else {
        hideBrandOtherInput();
    }
}

function hideBrandOtherInput() {
    dom.recordBrandOtherGroup.classList.remove('show');
    dom.recordBrandOther.value = '';
    dom.recordBrandOther.required = false;
}

function formatThaiDateString(dateObj) {
    if (!dateObj || isNaN(dateObj.getTime())) return '-';
    const day = dateObj.getDate();
    const monthIndex = dateObj.getMonth();
    const year = dateObj.getFullYear() + 543;
    const thaiMonths = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
    return `${day} ${thaiMonths[monthIndex]} ${year}`;
}
