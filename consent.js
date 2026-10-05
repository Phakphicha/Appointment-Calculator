/*
 * EasyMedCal - Cookie Consent (PDPA)
 * -------------------------------------------------------------
 * - Google Analytics จะถูกโหลด "หลังจาก" ผู้ใช้กดยินยอมเท่านั้น
 * - เก็บผลการเลือกไว้ใน localStorage (key: emc_consent = granted | denied)
 * - เรียก window.EMCConsent.open() เพื่อเปิดหน้าต่างตั้งค่าคุกกี้อีกครั้ง
 */
(function () {
    'use strict';

    var GA_ID = 'G-KNP3JV6XKN';
    var STORAGE_KEY = 'emc_consent';
    var PRIVACY_URL = '/privacy.html';

    var TEXT = {
        TH: {
            title: 'เว็บไซต์นี้ใช้คุกกี้',
            body: 'เราใช้คุกกี้ของ Google Analytics เพื่อวิเคราะห์สถิติการเข้าชมและปรับปรุงเว็บไซต์ โดยจะใช้ก็ต่อเมื่อคุณยินยอมเท่านั้น ข้อมูลที่คุณกรอกในเครื่องมือคำนวณจะประมวลผลบนอุปกรณ์ของคุณและไม่ถูกส่งไปยังเซิร์ฟเวอร์',
            more: 'อ่านนโยบายความเป็นส่วนตัว',
            accept: 'ยอมรับ',
            decline: 'ปฏิเสธ'
        },
        EN: {
            title: 'This website uses cookies',
            body: 'We use Google Analytics cookies to understand site usage and improve the service, only with your consent. Data you enter into the calculators is processed on your device and is never sent to our server.',
            more: 'Read our Privacy Policy',
            accept: 'Accept',
            decline: 'Decline'
        }
    };

    function safeGet(key) {
        try { return window.localStorage.getItem(key); } catch (e) { return null; }
    }
    function safeSet(key, value) {
        try { window.localStorage.setItem(key, value); } catch (e) { /* ignore */ }
    }
    function lang() {
        return safeGet('lang') === 'EN' ? 'EN' : 'TH';
    }

    // ---------------------------------------------------------
    // Google Analytics (loaded only after consent)
    // ---------------------------------------------------------
    var gaLoaded = false;
    function loadGA() {
        if (gaLoaded) return;
        gaLoaded = true;
        window.dataLayer = window.dataLayer || [];
        window.gtag = window.gtag || function () { window.dataLayer.push(arguments); };
        window.gtag('consent', 'default', {
            analytics_storage: 'granted',
            ad_storage: 'denied',
            ad_user_data: 'denied',
            ad_personalization: 'denied'
        });
        window.gtag('js', new Date());
        window.gtag('config', GA_ID);
        var s = document.createElement('script');
        s.async = true;
        s.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA_ID;
        document.head.appendChild(s);
    }

    function deleteGACookies() {
        var host = window.location.hostname;
        var parts = host.split('.');
        var domains = ['', host];
        if (parts.length >= 2) domains.push('.' + parts.slice(-2).join('.'));
        document.cookie.split(';').forEach(function (c) {
            var name = c.split('=')[0].trim();
            if (name === '_ga' || name.indexOf('_ga_') === 0 || name === '_gid' || name === '_gat') {
                domains.forEach(function (d) {
                    document.cookie = name + '=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/' + (d ? '; domain=' + d : '');
                });
            }
        });
    }

    function setConsent(value) {
        safeSet(STORAGE_KEY, value);
        if (value === 'granted') {
            loadGA();
        } else {
            if (gaLoaded && window.gtag) {
                window.gtag('consent', 'update', { analytics_storage: 'denied' });
            }
            window['ga-disable-' + GA_ID] = true;
            deleteGACookies();
        }
        hideBanner();
    }

    // ---------------------------------------------------------
    // Banner UI (self-contained styles, no Tailwind dependency)
    // ---------------------------------------------------------
    var banner = null;

    function injectStyles() {
        if (document.getElementById('emc-consent-style')) return;
        var css = '' +
            '#emc-consent{position:fixed;left:16px;right:16px;bottom:16px;z-index:9999;max-width:640px;margin:0 auto;' +
            'background:#fff;color:#163333;border:1px solid #d7ebe6;border-radius:16px;box-shadow:0 10px 30px rgba(0,0,0,.18);' +
            'padding:18px 20px;font-family:Prompt,system-ui,sans-serif;font-size:14px;line-height:1.6}' +
            '#emc-consent h2{margin:0 0 6px;font-size:16px;font-weight:700;color:#163333}' +
            '#emc-consent p{margin:0 0 12px;color:#3b5250}' +
            '#emc-consent a{color:#24917d;font-weight:600;text-decoration:underline}' +
            '#emc-consent .emc-actions{display:flex;gap:10px;justify-content:flex-end;flex-wrap:wrap}' +
            '#emc-consent button{border:0;border-radius:999px;padding:8px 20px;font:inherit;font-weight:700;cursor:pointer}' +
            '#emc-consent .emc-accept{background:#24917d;color:#fff}' +
            '#emc-consent .emc-accept:hover{background:#1d7666}' +
            '#emc-consent .emc-decline{background:#eef5f3;color:#163333}' +
            '#emc-consent .emc-decline:hover{background:#dfece8}' +
            '#emc-consent button:focus-visible{outline:3px solid #ffc395;outline-offset:2px}' +
            '.dark #emc-consent{background:#1b2b2b;color:#e6f2ef;border-color:#2c4442}' +
            '.dark #emc-consent h2{color:#e6f2ef}.dark #emc-consent p{color:#b8cfcb}' +
            '.dark #emc-consent .emc-decline{background:#2c4442;color:#e6f2ef}';
        var style = document.createElement('style');
        style.id = 'emc-consent-style';
        style.textContent = css;
        document.head.appendChild(style);
    }

    function render() {
        if (!banner) return;
        var t = TEXT[lang()];
        banner.innerHTML =
            '<h2 id="emc-consent-title">' + t.title + '</h2>' +
            '<p>' + t.body + ' <a href="' + PRIVACY_URL + '">' + t.more + '</a></p>' +
            '<div class="emc-actions">' +
            '<button type="button" class="emc-decline">' + t.decline + '</button>' +
            '<button type="button" class="emc-accept">' + t.accept + '</button>' +
            '</div>';
        banner.querySelector('.emc-accept').addEventListener('click', function () { setConsent('granted'); });
        banner.querySelector('.emc-decline').addEventListener('click', function () { setConsent('denied'); });
    }

    function showBanner() {
        injectStyles();
        if (!banner) {
            banner = document.createElement('div');
            banner.id = 'emc-consent';
            banner.setAttribute('role', 'dialog');
            banner.setAttribute('aria-live', 'polite');
            banner.setAttribute('aria-labelledby', 'emc-consent-title');
            document.body.appendChild(banner);
        }
        render();
        banner.style.display = '';
    }

    function hideBanner() {
        if (banner) banner.style.display = 'none';
    }

    // Re-render banner text when the site language is switched (index page)
    document.addEventListener('click', function (e) {
        if (e.target.closest && e.target.closest('.btnLangTH, .btnLangEN')) {
            setTimeout(render, 0);
        }
    });

    // Delegated handler for any "cookie settings" link/button on the page
    document.addEventListener('click', function (e) {
        var el = e.target.closest && e.target.closest('[data-cookie-settings]');
        if (el) {
            e.preventDefault();
            showBanner();
        }
    });

    window.EMCConsent = {
        open: showBanner,
        get: function () { return safeGet(STORAGE_KEY); }
    };

    // ---------------------------------------------------------
    // Init
    // ---------------------------------------------------------
    var stored = safeGet(STORAGE_KEY);
    if (stored === 'granted') {
        loadGA();
    } else if (stored !== 'denied') {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', showBanner);
        } else {
            showBanner();
        }
    }
})();
