-- Cloudflare D1 SQLite Database Schema for VacPass (LINE OA, PDPA & National ID Enabled)

CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT,                     -- Optional if authenticated via LINE LIFF
    national_id TEXT,                       -- Thai National ID (13 digits, Optional) for official vaccine records
    full_name TEXT,                         -- First name & Last name
    phone TEXT,                             -- Contact Phone Number (Primary unique identifier)
    email TEXT,                             -- Email Address
    line_user_id TEXT UNIQUE,               -- LINE User ID (e.g. U1234567890abcdef...)
    line_display_name TEXT,                 -- Display name from LINE Profile
    line_picture_url TEXT,                  -- Avatar URL from LINE Profile
    birth_date TEXT,
    gender TEXT,
    is_pregnant INTEGER DEFAULT 0,
    gestational_weeks INTEGER,
    underlying_conditions TEXT,             -- JSON array of strings: '["chronic", "immunocompromised"]'
    notify_enabled INTEGER DEFAULT 1,       -- 1 = Receive LINE / Push reminders, 0 = Disabled
    notify_advance_days INTEGER DEFAULT 7,  -- Days before due date to alert (e.g. 7 days)
    consent_pdpa INTEGER DEFAULT 0,         -- 1 = Explicit Consent Given
    consent_at TEXT,                        -- ISO Timestamp of consent
    created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone);
CREATE INDEX IF NOT EXISTS idx_users_national_id ON users(national_id);

CREATE TABLE IF NOT EXISTS vaccine_logs (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    vaccine_name TEXT NOT NULL,             -- Vaccine ID, e.g. 'flu', 'hpv', 'zoster', etc.
    dose_number TEXT NOT NULL,              -- e.g. '1', '2', '3', 'booster'
    brand_name TEXT,
    administered_date TEXT NOT NULL,        -- YYYY-MM-DD
    hospital_name TEXT,
    created_at TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS notification_logs (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    line_user_id TEXT,
    vaccine_id TEXT NOT NULL,
    dose_number TEXT NOT NULL,
    due_date TEXT NOT NULL,
    notification_type TEXT NOT NULL,        -- 'upcoming_7d', 'upcoming_3d', 'due_today', 'annual_booster'
    sent_at TEXT NOT NULL,
    status TEXT DEFAULT 'sent',             -- 'sent', 'failed'
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);
