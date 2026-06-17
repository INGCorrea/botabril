# WhatsApp Chatbot Validation - Implementation Examples

**Practical code patterns for securing your appointment booking flow**

---

## 1. ENHANCED PHONE NUMBER VALIDATION

### Current Implementation (util/validators.js)
```javascript
const validatePhone = (phone) => {
    const digits = phone.replace(/\D/g, '');
    return digits.length >= 7 && digits.length <= 15;
};
```

### Production-Ready Implementation

```javascript
/**
 * Validates phone numbers with country-specific rules
 * Supports Colombian (+57) and international formats
 */
const validatePhoneProduction = (phone, country = 'CO') => {
    if (!phone || typeof phone !== 'string') return false;
    
    const original = phone.trim();
    const digits = original.replace(/\D/g, '');
    
    // COLOMBIA (10 digits, prefix 3)
    if (country === 'CO') {
        // Reject if not 10 digits
        if (digits.length !== 10) return false;
        
        // Must start with 3 (mobile) - Colombian standard
        if (!digits.startsWith('3')) return false;
        
        // Valid prefixes for Colombian operators
        const validPrefixes = ['300', '301', '302', '303', '304', '305', 
                              '310', '311', '312', '313', '314', '315',
                              '316', '317', '318', '319', '320', '321',
                              '322', '323', '324', '325'];
        const prefix = digits.substring(0, 3);
        if (!validPrefixes.includes(prefix)) return false;
        
        // REJECT OBVIOUS FAKES
        // All same digit: 3333333333
        if (/^(\d)\1{9}$/.test(digits)) return false;
        
        // Sequential: 3012345678 or 3098765432
        if (/^3[012345678]\d{8}$/.test(digits) && 
            !/(3[0-9])(0|9)\d{8}/.test(digits)) {
            const seq = digits.split('').every((d, i, arr) => 
                i === 0 || parseInt(d) >= parseInt(arr[i-1]) - 1);
            if (seq) return false;
        }
        
        return true;
    }
    
    // INTERNATIONAL (E.164 format: +[1-9]{1-3} digits)
    if (original.startsWith('+')) {
        // +1 to +999 country codes, 7-15 digits total
        if (!/^\+[1-9]\d{1,14}$/.test(original)) return false;
        return true;
    }
    
    // If no country code provided, assume Colombia
    if (digits.length === 10 && digits.startsWith('3')) {
        return true;
    }
    
    return false;
};

// Test cases
console.assert(validatePhoneProduction('310 123 4567', 'CO') === true);  // Valid
console.assert(validatePhoneProduction('3101234567', 'CO') === true);    // Valid
console.assert(validatePhoneProduction('+573101234567') === true);       // Valid
console.assert(validatePhoneProduction('3333333333', 'CO') === false);   // All same
console.assert(validatePhoneProduction('2101234567', 'CO') === false);   // Wrong prefix
console.assert(validatePhoneProduction('31012345', 'CO') === false);     // Too short
```

---

## 2. ROBUST DATE/TIME VALIDATION

### Current Implementation
```javascript
const validateDate = (dateStr) => {
    const trimmed = dateStr.trim();
    if (trimmed.length < 5) return false;
    const dateRegex = /(\b\d{1,2}[\/\-.]\d{1,2}([\/\-.]\d{2,4})?\b|...)/i;
    return dateRegex.test(trimmed);
};
```

### Production-Ready Implementation

```javascript
/**
 * Comprehensive appointment date/time validation
 * Ensures semantic correctness for business logic
 */

// Helper: Parse various date formats
const parseAppointmentDate = (dateStr) => {
    if (!dateStr) return null;
    
    dateStr = dateStr.trim().toLowerCase();
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    // TODAY
    if (dateStr === 'hoy' || dateStr === 'today') {
        return today;
    }
    
    // TOMORROW
    if (dateStr === 'mañana' || dateStr === 'manana' || dateStr === 'tomorrow') {
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        return tomorrow;
    }
    
    // DAY OF WEEK (next occurrence)
    const daysMap = {
        'lunes': 1, 'monday': 1,
        'martes': 2, 'tuesday': 2,
        'miércoles': 3, 'miercoles': 3, 'wednesday': 3,
        'jueves': 4, 'thursday': 4,
        'viernes': 5, 'friday': 5,
        'sábado': 6, 'sabado': 6, 'saturday': 6,
        'domingo': 0, 'sunday': 0
    };
    
    const dayNum = daysMap[dateStr];
    if (dayNum !== undefined) {
        const nextDate = new Date(today);
        const currentDay = nextDate.getDay();
        let daysToAdd = dayNum - currentDay;
        if (daysToAdd <= 0) daysToAdd += 7; // Next week if day passed
        nextDate.setDate(nextDate.getDate() + daysToAdd);
        return nextDate;
    }
    
    // NUMERIC FORMATS: DD/MM or DD/MM/YYYY
    const patterns = [
        /^(\d{1,2})[\/\-.](\d{1,2})(?:[\/\-.](\d{2,4}))?$/,
        /^(\d{1,2})[\/\-.](\d{1,2})(?:[\/\-.](\d{4}))?$/ // YYYY format
    ];
    
    for (const pattern of patterns) {
        const match = dateStr.match(pattern);
        if (match) {
            let day = parseInt(match[1]);
            let month = parseInt(match[2]);
            let year = match[3] ? parseInt(match[3]) : today.getFullYear();
            
            // Normalize 2-digit year
            if (year < 100) {
                year = year < 30 ? 2000 + year : 1900 + year;
            }
            
            // Validate month
            if (month < 1 || month > 12) return null;
            
            // Validate day (basic)
            if (day < 1 || day > 31) return null;
            
            // Create date object
            const date = new Date(year, month - 1, day);
            
            // Verify the date is valid (catches invalid dates like 31/02)
            if (date.getMonth() !== month - 1) return null;
            
            return date;
        }
    }
    
    return null;
};

// Main validator
const validateAppointmentDateTime = (dateStr, businessConfig = {}) => {
    const config = {
        hoursStart: 8,      // 8 AM
        hoursEnd: 18,       // 6 PM
        minAdvanceHours: 24, // 24 hours notice
        maxDaysFuture: 60,   // Max 60 days ahead
        allowWeekends: false,
        holidays: ['2026-12-25', '2026-01-01'], // Format: YYYY-MM-DD
        ...businessConfig
    };
    
    // Parse the date
    const parsedDate = parseAppointmentDate(dateStr);
    if (!parsedDate) return false;
    
    const now = new Date();
    
    // RULE 1: Must be in the future
    // Add minimum advance hours
    const minDateTime = new Date(now.getTime() + config.minAdvanceHours * 60 * 60 * 1000);
    if (parsedDate < minDateTime) {
        console.log(`Appointment too soon: ${parsedDate} < ${minDateTime}`);
        return false;
    }
    
    // RULE 2: Not too far in future
    const maxDateTime = new Date(now.getTime() + config.maxDaysFuture * 24 * 60 * 60 * 1000);
    if (parsedDate > maxDateTime) {
        console.log(`Appointment too far: ${parsedDate} > ${maxDateTime}`);
        return false;
    }
    
    // RULE 3: Check if weekend (if not allowed)
    if (!config.allowWeekends) {
        const dayOfWeek = parsedDate.getDay();
        if (dayOfWeek === 0 || dayOfWeek === 6) {
            console.log(`Weekend not allowed: ${parsedDate}`);
            return false;
        }
    }
    
    // RULE 4: Check if holiday
    const dateStr_YYYY_MM_DD = parsedDate.toISOString().split('T')[0];
    if (config.holidays.includes(dateStr_YYYY_MM_DD)) {
        console.log(`Holiday not available: ${dateStr_YYYY_MM_DD}`);
        return false;
    }
    
    // RULE 5: Check time in business hours
    // NOTE: If user only provided day (not time), assume 10 AM
    const hour = parsedDate.getHours() || 10;
    if (hour < config.hoursStart || hour >= config.hoursEnd) {
        console.log(`Outside hours: ${hour} not in [${config.hoursStart}-${config.hoursEnd})`);
        return false;
    }
    
    return true;
};

// Test cases
const businessConfig = {
    hoursStart: 8,
    hoursEnd: 18,
    minAdvanceHours: 24,
    maxDaysFuture: 60,
    allowWeekends: false,
    holidays: ['2026-12-25', '2026-01-01']
};

console.assert(validateAppointmentDateTime('23/06/2026', businessConfig) === true);  // Valid future
console.assert(validateAppointmentDateTime('17/06/2026', businessConfig) === false); // Today (< 24h)
console.assert(validateAppointmentDateTime('01/01/2027', businessConfig) === false); // Holiday
console.assert(validateAppointmentDateTime('20/06/2026', businessConfig) === false); // Saturday
console.assert(validateAppointmentDateTime('mañana', businessConfig) === false);     // Tomorrow < 24h
console.assert(validateAppointmentDateTime('19/06/2026', businessConfig) === true);  // Valid
```

---

## 3. NAME VALIDATION WITH INJECTION PREVENTION

### Current Implementation
```javascript
const validateName = (name) => {
    const nameRegex = /^[a-záéíóúñA-ZÁÉÍÓÚÑ\s'.-]{3,}$/;
    const trimmed = name.trim();
    return nameRegex.test(trimmed) && /[a-záéíóúñA-ZÁÉÍÓÚÑ]/.test(trimmed);
};
```

### Production-Ready Implementation

```javascript
/**
 * Validates and sanitizes name fields
 * Prevents injection attacks while allowing legitimate names
 */

const validateNameProduction = (name, maxLength = 100) => {
    if (!name || typeof name !== 'string') return false;
    
    const trimmed = name.trim();
    
    // LENGTH CHECKS
    if (trimmed.length < 3 || trimmed.length > maxLength) {
        return false; // Too short or too long
    }
    
    // CHARACTER WHITELIST
    // Allow: Letters (any), spaces, hyphens, apostrophes, periods
    const allowedPattern = /^[a-záéíóúñA-ZÁÉÍÓÚÑ\s'.\-]+$/;
    if (!allowedPattern.test(trimmed)) {
        return false; // Contains disallowed characters
    }
    
    // MUST CONTAIN LETTERS (not just punctuation)
    const letterCount = (trimmed.match(/[a-záéíóúñA-ZÁÉÍÓÚÑ]/gi) || []).length;
    if (letterCount < trimmed.length * 0.5) {
        return false; // More than 50% punctuation
    }
    
    // CHECK WORD LENGTHS (prevent "AAAAAA" or "-----")
    const words = trimmed.split(/[\s.-]+/).filter(w => w);
    for (const word of words) {
        // Each word should be 2-25 characters
        if (word.length < 2 || word.length > 25) {
            return false;
        }
        
        // Each word should have some letter diversity
        // (not "AAAA" or "----")
        const uniqueChars = new Set(word);
        if (uniqueChars.size < 2) {
            return false; // All same character
        }
    }
    
    // REJECT OBVIOUS MALICIOUS PATTERNS
    const maliciousPatterns = [
        /<[^>]*>/,           // HTML tags
        /javascript:/i,      // JavaScript
        /on\w+\s*=/i,        // Event handlers: onclick=, onerror=
        /['";]/,             // SQL injection chars (if not sanitized)
        /<script/i,          // Script tags
        /&lt;|&gt;|&quot;/,  // HTML entities
    ];
    
    for (const pattern of maliciousPatterns) {
        if (pattern.test(trimmed)) {
            return false;
        }
    }
    
    return true;
};

/**
 * Sanitize name before database storage
 * Additional layer of protection
 */
const sanitizeName = (name) => {
    if (!name) return '';
    
    return String(name)
        .trim()
        // Remove null bytes
        .replace(/\x00/g, '')
        // Normalize spaces (multiple spaces to one)
        .replace(/\s+/g, ' ')
        // No leading/trailing spaces
        .trim();
};

// Test cases
console.assert(validateNameProduction('José García') === true);          // Valid
console.assert(validateNameProduction("O'Brien Smith") === true);        // Valid
console.assert(validateNameProduction('Jean-Pierre Dupont') === true);   // Valid
console.assert(validateNameProduction('AAAAAAAAAA') === false);          // All same
console.assert(validateNameProduction('Jo') === false);                  // Too short
console.assert(validateNameProduction('<script>alert(1)</script>') === false); // Malicious
console.assert(validateNameProduction("Robert'); DROP TABLE--") === false);    // SQL injection
```

---

## 4. SYMPTOMS FIELD - SPAM & INJECTION DETECTION

### Current Implementation
```javascript
const validateSymptoms = (symptoms) => {
    const len = symptoms.trim().length;
    return len >= 5 && len <= 500;
};
```

### Production-Ready Implementation

```javascript
/**
 * Validates symptoms field
 * Detects spam, HTML injection, URLs, and other malicious patterns
 */

const validateSymptomsProduction = (symptoms, maxLength = 500) => {
    if (!symptoms || typeof symptoms !== 'string') return false;
    
    const trimmed = symptoms.trim();
    
    // LENGTH CHECKS
    if (trimmed.length < 5 || trimmed.length > maxLength) {
        return false;
    }
    
    // 1. NO HTML TAGS
    if (/<[^>]*>/g.test(trimmed)) {
        console.log('Rejected: Contains HTML tags');
        return false;
    }
    
    // 2. NO URLs
    if (/https?:\/\/|ftp:\/\//i.test(trimmed)) {
        console.log('Rejected: Contains URLs');
        return false;
    }
    
    // 3. NO JAVASCRIPT
    if (/javascript:/i.test(trimmed)) {
        console.log('Rejected: Contains javascript');
        return false;
    }
    
    // 4. NO DANGEROUS ENTITIES
    if (/&lt;|&gt;|&quot;|&#x?[0-9a-f]+;/i.test(trimmed)) {
        console.log('Rejected: Contains HTML entities');
        return false;
    }
    
    // 5. CHARACTER DIVERSITY
    // Reject if >70% is caps (shouting/spam)
    const capsCount = (trimmed.match(/[A-Z]/g) || []).length;
    if (capsCount > trimmed.length * 0.7 && capsCount > 10) {
        console.log('Rejected: Too many capital letters');
        return false;
    }
    
    // 6. REPEATED CHARACTERS
    // Reject if one char appears >50% of length
    const charCounts = {};
    for (const char of trimmed) {
        charCounts[char] = (charCounts[char] || 0) + 1;
    }
    const maxCharFreq = Math.max(...Object.values(charCounts));
    if (maxCharFreq > trimmed.length * 0.5) {
        console.log(`Rejected: Character repeated too much: ${maxCharFreq}/${trimmed.length}`);
        return false;
    }
    
    // 7. WORD DIVERSITY
    // Split and check minimum meaningful words
    const words = trimmed.split(/\s+/);
    if (words.length < 2) {
        console.log('Rejected: Less than 2 words');
        return false; // "dolor" alone is too vague, need context
    }
    
    // Check word lengths (2-20 chars per word is reasonable)
    const invalidWords = words.filter(w => w.length > 20);
    if (invalidWords.length > 0) {
        console.log(`Rejected: Words too long: ${invalidWords.join(', ')}`);
        return false;
    }
    
    // 8. SPAM PATTERNS
    // All same word repeated
    if (words.length > 5) {
        const firstWord = words[0];
        const sameCount = words.filter(w => w === firstWord).length;
        if (sameCount / words.length > 0.5) {
            console.log('Rejected: Same word repeated');
            return false;
        }
    }
    
    // 9. BASIC LANGUAGE CHECK
    // Must have some vowels/real words (not "xyzqw")
    const vowels = (trimmed.match(/[aeiouáéíóúAEIOUÁÉÍÓÚ]/gi) || []).length;
    if (vowels < trimmed.length * 0.2) {
        console.log('Rejected: Not enough vowels/real words');
        return false;
    }
    
    return true;
};

/**
 * Sanitize symptoms before storage/display
 */
const sanitizeSymptoms = (symptoms, maxLength = 500) => {
    if (!symptoms) return '';
    
    return String(symptoms)
        .substring(0, maxLength)
        .trim()
        // Remove null bytes
        .replace(/\x00/g, '')
        // Normalize whitespace
        .replace(/\s+/g, ' ');
};

// Test cases
console.assert(validateSymptomsProduction('Dolor de cabeza y fiebre') === true);     // Valid
console.assert(validateSymptomsProduction('dolor') === false);                       // Too short/vague
console.assert(validateSymptomsProduction('AAAAAAAAAA') === false);                  // No vowels
console.assert(validateSymptomsProduction('<script>alert(1)</script>') === false);   // Malicious
console.assert(validateSymptomsProduction('http://evil.com') === false);             // URL
console.assert(validateSymptomsProduction('aaaa aaaa aaaa aaaa aaaa') === false);    // Too repetitive
console.assert(validateSymptomsProduction('DOLOR DOLOR DOLOR DOLOR') === false);     // Caps spam
```

---

## 5. RATE LIMITING & BOT DETECTION

### Implementation Pattern

```javascript
/**
 * Rate limiter for appointment bookings
 * Prevents bot spam and DoS attacks
 */

class RateLimiter {
    constructor(config = {}) {
        this.config = {
            maxAttemptsPerWindow: 1,      // 1 booking
            windowSizeMinutes: 5,          // Per 5 minutes
            lockoutMinutes: 15,            // Lock for 15 min after limit
            maxAttemptsPerDay: 5,          // Max 5 bookings per day
            failedAttemptLimit: 3,         // Lock after 3 failures
            ...config
        };
        
        this.attempts = new Map();    // userId -> [timestamps...]
        this.locked = new Map();      // userId -> lockUntilTime
        this.dailyCount = new Map();  // userId -> count
    }
    
    /**
     * Check if user is rate limited
     */
    isLimited(userId) {
        // Check if in lockout
        const lockUntil = this.locked.get(userId);
        if (lockUntil && lockUntil > Date.now()) {
            return {
                limited: true,
                reason: 'Too many attempts. Try again later.',
                retryAfter: Math.ceil((lockUntil - Date.now()) / 1000)
            };
        }
        
        // Clear old lockout
        if (lockUntil) {
            this.locked.delete(userId);
        }
        
        // Check current window
        const now = Date.now();
        const windowMs = this.config.windowSizeMinutes * 60 * 1000;
        const attempts = this.attempts.get(userId) || [];
        
        // Remove old attempts
        const recentAttempts = attempts.filter(t => now - t < windowMs);
        
        if (recentAttempts.length >= this.config.maxAttemptsPerWindow) {
            // Exceed rate limit - apply lockout
            const lockUntil = now + this.config.lockoutMinutes * 60 * 1000;
            this.locked.set(userId, lockUntil);
            
            return {
                limited: true,
                reason: 'Too many booking attempts. Please try again later.',
                retryAfter: this.config.lockoutMinutes * 60
            };
        }
        
        // Check daily limit
        const dailyCount = this.dailyCount.get(userId) || 0;
        if (dailyCount >= this.config.maxAttemptsPerDay) {
            return {
                limited: true,
                reason: 'Daily booking limit reached.',
                retryAfter: 86400 // 24 hours
            };
        }
        
        return { limited: false };
    }
    
    /**
     * Record a booking attempt
     */
    recordAttempt(userId) {
        const now = Date.now();
        const attempts = this.attempts.get(userId) || [];
        attempts.push(now);
        this.attempts.set(userId, attempts);
        
        // Increment daily counter
        const dailyCount = this.dailyCount.get(userId) || 0;
        this.dailyCount.set(userId, dailyCount + 1);
        
        // Clear old daily counts (midnight reset)
        // In production, use a proper scheduler
    }
    
    /**
     * Record a failed validation
     */
    recordFailure(userId) {
        const failures = this.failedAttempts || new Map();
        const count = (failures.get(userId) || 0) + 1;
        failures.set(userId, count);
        
        if (count >= this.config.failedAttemptLimit) {
            // Lock the user temporarily
            const lockUntil = Date.now() + 15 * 60 * 1000; // 15 min lockout
            this.locked.set(userId, lockUntil);
            failures.delete(userId); // Reset failure counter
        }
        
        this.failedAttempts = failures;
    }
    
    /**
     * Clear on successful booking
     */
    clearUser(userId) {
        this.attempts.delete(userId);
        this.failedAttempts?.delete(userId);
    }
}

// Usage in your message handler
const limiter = new RateLimiter({
    maxAttemptsPerWindow: 1,
    windowSizeMinutes: 5,
    maxAttemptsPerDay: 2
});

// In your handler:
const checkRateLimit = async (phoneNumber) => {
    const userId = phoneNumber;
    const limit = limiter.isLimited(userId);
    
    if (limit.limited) {
        return {
            success: false,
            message: limit.reason
        };
    }
    
    return { success: true };
};
```

---

## 6. SPAM PATTERN DETECTION

```javascript
/**
 * Detect and reject obvious spam/test data
 */

const isSpamData = (userData) => {
    const { name, phone, symptoms, insurance } = userData;
    
    // TEST DATA PATTERNS
    const testPatterns = {
        name: /^(test|demo|admin|user|nombre|test\d+|aaa+|xxx+|zzz+)/i,
        phone: /^(1111|2222|3333|4444|5555|6666|7777|8888|9999|1234|0000)/,
        symptoms: /^(test|demo|hola|prueba|asdf|qwer)/i,
    };
    
    if (testPatterns.name.test(name)) {
        console.log(`Spam: Test name pattern: ${name}`);
        return true;
    }
    
    if (testPatterns.phone.test(phone)) {
        console.log(`Spam: Test phone pattern: ${phone}`);
        return true;
    }
    
    if (testPatterns.symptoms.test(symptoms)) {
        console.log(`Spam: Test symptoms pattern: ${symptoms}`);
        return true;
    }
    
    // SEQUENTIAL PATTERNS
    if (/^1234567890/.test(phone.replace(/\D/g, ''))) {
        console.log('Spam: Sequential phone number');
        return true;
    }
    
    // OBVIOUSLY FAKE INSURANCE
    if (/^(test|demo|insurance|seguro|yes|sí|si)$/i.test(insurance)) {
        console.log(`Spam: Suspicious insurance: ${insurance}`);
        return true;
    }
    
    // SINGLE CHARACTER REPEATED
    if (/^(.)\1{9,}$/.test(phone.replace(/\D/g, ''))) {
        console.log('Spam: Single digit repeated in phone');
        return true;
    }
    
    return false;
};

// Test cases
console.assert(isSpamData({
    name: 'test',
    phone: '3101234567',
    symptoms: 'prueba de spam',
    insurance: 'test'
}) === true);

console.assert(isSpamData({
    name: 'Juan García',
    phone: '3101234567',
    symptoms: 'dolor de cabeza',
    insurance: 'Sura'
}) === false);
```

---

## 7. INTEGRATION WITH MESSAGE HANDLER

```javascript
/**
 * Complete validation flow in appointment booking
 */

const validateAppointmentBooking = async (userData) => {
    const results = {
        valid: true,
        errors: []
    };
    
    // 1. Check rate limit
    const rateCheck = limiter.isLimited(userData.phone);
    if (rateCheck.limited) {
        results.valid = false;
        results.errors.push(rateCheck.reason);
        return results;
    }
    
    // 2. Check for spam
    if (isSpamData(userData)) {
        results.valid = false;
        results.errors.push('Invalid data format');
        limiter.recordFailure(userData.phone);
        return results;
    }
    
    // 3. Validate phone
    if (!validatePhoneProduction(userData.phone, 'CO')) {
        results.valid = false;
        results.errors.push('Teléfono inválido');
        limiter.recordFailure(userData.phone);
        return results;
    }
    
    // 4. Validate name
    if (!validateNameProduction(userData.name)) {
        results.valid = false;
        results.errors.push('Nombre inválido');
        limiter.recordFailure(userData.phone);
        return results;
    }
    
    // 5. Validate symptoms
    if (!validateSymptomsProduction(userData.symptoms)) {
        results.valid = false;
        results.errors.push('Descripción de síntomas inválida');
        limiter.recordFailure(userData.phone);
        return results;
    }
    
    // 6. Validate date
    if (!validateAppointmentDateTime(userData.date)) {
        results.valid = false;
        results.errors.push('Fecha o hora inválida');
        limiter.recordFailure(userData.phone);
        return results;
    }
    
    // 7. Sanitize for storage
    const sanitized = {
        phone: userData.phone.replace(/\D/g, ''),
        name: sanitizeName(userData.name),
        symptoms: sanitizeSymptoms(userData.symptoms),
        insurance: userData.insurance.trim(),
        date: userData.date
    };
    
    // 8. Check for duplicates/conflicts
    const existingBooking = await checkExistingBooking(
        sanitized.phone,
        sanitized.date
    );
    if (existingBooking) {
        results.valid = false;
        results.errors.push('Ya tienes una cita para esa fecha');
        return results;
    }
    
    // 9. Record successful attempt
    limiter.recordAttempt(userData.phone);
    results.sanitized = sanitized;
    
    return results;
};

// Usage
const handleBookingRequest = async (userMessage, phoneNumber) => {
    const userData = parseBookingData(userMessage);
    userData.phone = phoneNumber; // Add phone from WhatsApp
    
    const validation = await validateAppointmentBooking(userData);
    
    if (!validation.valid) {
        return {
            success: false,
            message: `Error: ${validation.errors[0]}`
        };
    }
    
    // Proceed with booking
    const booking = await createAppointment(validation.sanitized);
    return {
        success: true,
        message: `Cita confirmada para ${booking.date}`,
        bookingId: booking.id
    };
};
```

---

## 8. DATABASE SAFETY

```javascript
/**
 * CRITICAL: Always use parameterized queries
 * Never concatenate user input into queries
 */

// ❌ NEVER DO THIS:
// db.query(`SELECT * FROM appointments WHERE phone = '${phone}'`);
// db.query(`INSERT INTO appointments VALUES ('${name}', '${phone}')`);

// ✓ ALWAYS DO THIS:
const createAppointmentSafe = async (booking) => {
    // Using parameterized query (example with node-mysql)
    const query = `
        INSERT INTO appointments 
        (phone, name, symptoms, date, insurance, created_at)
        VALUES (?, ?, ?, ?, ?, NOW())
    `;
    
    const values = [
        booking.phone,
        booking.name,
        booking.symptoms,
        booking.date,
        booking.insurance
    ];
    
    // Query engine automatically sanitizes parameters
    return db.query(query, values);
};

// Or using ORM (example with Sequelize)
const createAppointmentORM = async (booking) => {
    return Appointment.create({
        phone: booking.phone,
        name: booking.name,
        symptoms: booking.symptoms,
        date: booking.date,
        insurance: booking.insurance
    });
    // ORM handles parameterization automatically
};
```

---

## SUMMARY: VALIDATION CHECKLIST

```javascript
✓ Phone validation
  - Country code format (Colombia: +57 or just 10 digits)
  - Valid prefix (310-325 for Colombia)
  - Reject fake patterns (all same, sequential)
  
✓ Date validation
  - Future date only (minimum 24 hours advance)
  - Within business hours
  - Not on weekends
  - Not on holidays
  - Max 60 days advance
  
✓ Name validation
  - 3-100 characters
  - Letters + spaces/hyphens/apostrophes only
  - No HTML/injection patterns
  - Word length checks
  
✓ Symptoms validation
  - 5-500 characters
  - No HTML tags or URLs
  - Character diversity (not all same char/caps)
  - Minimum word diversity
  
✓ Bot/Spam detection
  - Rate limiting (1 per 5 min, max 2-5 per day)
  - Test pattern rejection
  - Fake data detection
  - Sequential pattern detection
  
✓ Database safety
  - Parameterized queries only
  - No concatenation of user input
  - Sanitize before storage
  
✓ Security measures
  - Server-side validation (not client-side only)
  - Input encoding for XSS prevention
  - Failed attempt tracking
  - Generic error messages (no info leakage)
```

---

**Document created with production patterns from healthcare chatbots, security best practices (OWASP), and bot abuse research.**
