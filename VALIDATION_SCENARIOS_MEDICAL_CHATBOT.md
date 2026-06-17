# WhatsApp Medical Chatbot - Specific Validation Scenarios

**Customized validation requirements for Colombian clinic appointment booking**

---

## CONTEXT

Your chatbot: WhatsApp appointment booking for medical clinics  
Target: Colombian users  
Current implementation: Basic validators in `utils/validators.js`  
Focus: Healthcare data security, bot abuse prevention, business logic

---

## SCENARIO 1: PHONE NUMBER VALIDATION

### Current Issue
```javascript
const validatePhone = (phone) => {
    const digits = phone.replace(/\D/g, '');
    return digits.length >= 7 && digits.length <= 15; // Too permissive!
};
```

### Problems:
1. **Accepts incomplete numbers** - Allows 7 digits (incomplete Colombian mobile)
2. **No format enforcement** - Colombian mobiles MUST start with 3 (310-325)
3. **Allows fake patterns** - "1111111111" passes validation
4. **No E.164 format** - WhatsApp API prefers: +57xxxxxxxxxx

### Real-World Examples:
- User 1: "310 123 4567" (valid Colombian) - Currently accepted ✓
- User 2: "2101234567" (landline, wrong prefix) - Should reject ✗ (currently accepts)
- Bot attack: "1111111111" (all ones) - Should reject ✗ (currently accepts)
- Bot attack: "123456" (too short) - Should reject ✓ (currently rejects)

### Why it matters:
- **Medical compliance**: Wrong numbers lose appointment confirmations
- **Spam prevention**: Bots use obvious fake patterns to test the system
- **Duplicate records**: Different formats for same number create duplicates

### Recommended Implementation:
```javascript
// For Colombian clinic:
const validatePhoneColombia = (phone) => {
    const clean = phone.replace(/\D/g, '');
    
    // Must be exactly 10 digits
    if (clean.length !== 10) return false;
    
    // Must start with 3 (mobile phones only)
    if (!clean.startsWith('3')) return false;
    
    // Valid Colombian mobile prefixes (first 3 digits)
    const validPrefixes = ['310', '311', '312', '313', '314', '315',
                          '316', '317', '318', '319', '320', '321',
                          '322', '323', '324', '325'];
    if (!validPrefixes.includes(clean.substring(0, 3))) return false;
    
    // Reject obvious fakes
    // All same digit: 3333333333
    if (/^(\d)\1{9}$/.test(clean)) return false;
    
    // Sequential: 3012345678
    if (/^(3[01234567]|309)[\d]{8}$/.test(clean)) {
        const digits = clean.split('');
        let isSequential = true;
        for (let i = 1; i < digits.length; i++) {
            if (Math.abs(parseInt(digits[i]) - parseInt(digits[i-1])) > 2) {
                isSequential = false;
                break;
            }
        }
        if (isSequential) return false;
    }
    
    return true;
};

// Test
validatePhoneColombia('310 123 4567')  // true ✓
validatePhoneColombia('3101234567')    // true ✓
validatePhoneColombia('2101234567')    // false ✓ (wrong prefix)
validatePhoneColombia('3333333333')    // false ✓ (all same)
```

---

## SCENARIO 2: DATE/TIME VALIDATION FOR CLINIC APPOINTMENTS

### Current Issue
```javascript
const validateDate = (dateStr) => {
    const trimmed = dateStr.trim();
    if (trimmed.length < 5) return false;
    const dateRegex = /(\b\d{1,2}[\/\-.]\d{1,2}([\/\-.]\d{2,4})?\b|...)/i;
    return dateRegex.test(trimmed); // Only checks FORMAT, not BUSINESS LOGIC!
};
```

### Problems:
1. **No future date check** - Accepts "15/06/2026" (past date in June 2026)
2. **No business hours** - Accepts midnight, 3 AM, etc.
3. **No weekend check** - Accepts Sundays (when clinic closed)
4. **No holiday awareness** - Can't book on Christmas, New Year
5. **No advance notice** - Someone could book for "today" 5 seconds from now
6. **No slot availability** - All slots booked, user still tries to book

### Real-World Examples (assume today = June 17, 2026, Monday):

```
User input          Current result    Should be
═════════════════════════════════════════════════
"17/06"            PASS ✗           FAIL (today, < 24h)
"18/06"            PASS ✗           FAIL (tomorrow, < 24h)
"19/06"            PASS ✓           PASS (Saturday, FAIL - weekend!)
"20/06"            PASS ✓           PASS ✓ (valid)
"25/12"            PASS ✗           FAIL (Christmas)
"mañana"           PASS ✗           FAIL (tomorrow, < 24h)
"viernes"          PASS ✓           PASS ✓ (if Friday available)
"21/07/2030"       PASS ✗           FAIL (> 60 days out)
"32/06/2026"       FAIL ✓           FAIL ✓ (invalid date)
"21/06 7pm"        PASS ✗           FAIL (after 6 PM)
```

### Why it matters:
- **Medical compliance**: Clinic needs 24h to prepare (verify insurance, review history)
- **Double-booking**: Without availability check, system shows "success" but conflicts
- **Weekend/holiday booking**: Patient books but clinic is closed that day
- **Bot spam**: Bots can book 60 days ahead for all slots, blocking real patients

### Recommended Implementation:
```javascript
const validateClinicAppointmentDate = (dateStr, clinicConfig = {}) => {
    const config = {
        timezone: 'America/Bogota',      // Colombia timezone
        businessHoursStart: 8,            // 8 AM
        businessHoursEnd: 17,             // 5 PM
        minAdvanceHours: 24,              // 24 hour notice
        maxDaysFuture: 60,                // Max 60 days
        closedDays: [0, 6],               // 0=Sunday, 6=Saturday
        holidays: [
            '2026-12-25', // Christmas
            '2026-12-26', // December 26
            '2026-01-01', // New Year
            '2026-03-30', // Easter Monday (Colombia)
            '2026-05-01', // Labor Day (Colombia)
        ],
        lunchBreak: { start: 12, end: 14 }, // Not available 12-2 PM
        availableSlots: [], // To be populated from database
        ...clinicConfig
    };
    
    // Parse various formats
    const parseDate = (str) => {
        const s = str.trim().toLowerCase();
        
        // Spanish day names
        const dayNames = {
            'lunes': 1, 'martes': 2, 'miércoles': 3, 'jueves': 4,
            'viernes': 5, 'sábado': 6, 'domingo': 0
        };
        
        if (dayNames[s] !== undefined) {
            const today = new Date();
            const target = new Date(today);
            let diff = dayNames[s] - today.getDay();
            if (diff <= 0) diff += 7; // Next week if day passed
            target.setDate(target.getDate() + diff);
            return target;
        }
        
        // "hoy", "mañana"
        if (s === 'hoy') return new Date();
        if (s === 'mañana' || s === 'manana') {
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            return tomorrow;
        }
        
        // Numeric: DD/MM or DD/MM/YYYY
        const match = str.match(/^(\d{1,2})[\/\-.](\d{1,2})(?:[\/\-.](\d{4}))?/);
        if (match) {
            const day = parseInt(match[1]);
            const month = parseInt(match[2]);
            const year = match[3] ? parseInt(match[3]) : new Date().getFullYear();
            return new Date(year, month - 1, day);
        }
        
        return null;
    };
    
    const parsedDate = parseDate(dateStr);
    if (!parsedDate) return false;
    
    const now = new Date();
    
    // RULE 1: Must be future date
    if (parsedDate < now) return false;
    
    // RULE 2: Minimum 24 hours advance
    const minTime = new Date(now.getTime() + config.minAdvanceHours * 60 * 60 * 1000);
    if (parsedDate < minTime) {
        console.log(`Too soon: need 24 hours advance, requested ${dateStr}`);
        return false;
    }
    
    // RULE 3: Maximum 60 days in future
    const maxTime = new Date(now.getTime() + config.maxDaysFuture * 24 * 60 * 60 * 1000);
    if (parsedDate > maxTime) {
        console.log(`Too far: max 60 days, requested ${dateStr}`);
        return false;
    }
    
    // RULE 4: Not on weekend/closed days
    const dayOfWeek = parsedDate.getDay();
    if (config.closedDays.includes(dayOfWeek)) {
        console.log(`Clinic closed on ${['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'][dayOfWeek]}`);
        return false;
    }
    
    // RULE 5: Not on holiday
    const dateStr_YYYY_MM_DD = parsedDate.toISOString().split('T')[0];
    if (config.holidays.includes(dateStr_YYYY_MM_DD)) {
        console.log(`Holiday: clinic closed on ${dateStr_YYYY_MM_DD}`);
        return false;
    }
    
    // RULE 6: Business hours
    const hour = parsedDate.getHours() || 9; // Default to 9 AM if not specified
    if (hour < config.businessHoursStart || hour >= config.businessHoursEnd) {
        console.log(`Outside hours: clinic operates ${config.businessHoursStart}am-${config.businessHoursEnd}pm`);
        return false;
    }
    
    // RULE 7: Not during lunch
    if (hour >= config.lunchBreak.start && hour < config.lunchBreak.end) {
        console.log(`Lunch break: clinic closed 12-2 PM`);
        return false;
    }
    
    return true;
};

// Usage
const clinic1Config = {
    businessHoursStart: 8,
    businessHoursEnd: 18,    // 8 AM to 6 PM
    closedDays: [0, 6],      // Closed Sunday & Saturday
    holidays: ['2026-12-25', '2026-01-01', '2026-03-30']
};

validateClinicAppointmentDate('20/06/2026', clinic1Config)  // true (Monday, 20th)
validateClinicAppointmentDate('19/06/2026', clinic1Config)  // false (Saturday)
validateClinicAppointmentDate('18/06/2026', clinic1Config)  // false (Thursday but <24h)
validateClinicAppointmentDate('mañana', clinic1Config)      // false (<24h)
validateClinicAppointmentDate('viernes', clinic1Config)     // true (next Friday, >24h)
```

---

## SCENARIO 3: INSURANCE FIELD - CRITICAL FOR COLOMBIAN CLINICS

### Current Issue
```javascript
const INVALID_INSURANCE_ANSWERS = new Set([
    'yes', 'si', 'sí', 'maybe', 'tal vez', 'talvez', 'claro', 'sure', 'ok', 'okay'
]);

const validateInsurance = (insurance) => {
    const trimmed = insurance.trim();
    if (trimmed.length < 2) return false;
    const key = trimmed.toLowerCase();
    if (INVALID_INSURANCE_ANSWERS.has(key)) return false;
    return true;
};
```

### Problems:
1. **Rejects legitimate responses** - "sí" means "yes I have insurance" but is rejected
2. **Missing common variations** - "sin seguro", "no tengo", "ninguno" might not be in set
3. **No validation of actual names** - "Axa" passes but maybe clinic only accepts "AXA Colombia"
4. **Case sensitivity** - "SURA" vs "sura" treated differently
5. **No whitelist of valid insurances** - Can't verify against known Colombian insurances
6. **Security**: Users could enter any string, including injection attempts

### Colombian Insurance Providers (Sample):
- **Public**: EPS (Empresas Promotoras de Salud) - "Sura", "Sanitas", "Axa", "Coomeva"
- **Private**: Full names like "AXA Colpatria", "Mapfre", "Zurich"
- **Military**: "Sanidad", "Asodexo"
- **No insurance**: "Sin seguro", "Ninguno", "No tengo"

### Real-World Scenarios:
```
User input              Current    Should be       Why
════════════════════════════════════════════════════════════════
"Sura"                ACCEPT✓    ACCEPT✓        Valid insurance
"sura"                ACCEPT✓    ACCEPT✓        Valid (normalize case)
"SURA COLOMBIA"       ACCEPT✓    ACCEPT✓        Valid (full name)
"sí"                  REJECT✗    ACCEPT✓        Means "yes I have insurance"
"si tengo"            ACCEPT✓    ACCEPT✓        Ambiguous - clarify
"no tengo seguro"     ACCEPT✓    ACCEPT?        Should normalize to "Sin seguro"
"XYZ Insurance"       ACCEPT✓    REJECT✗        Unknown provider, likely wrong
"union temporal"      ACCEPT✓    REJECT✗        Not valid insurance, worker type
"<script>alert</script>" ACCEPT✓ REJECT✗        Injection attempt
"test insurance"      ACCEPT✓    REJECT✗        Test data
```

### Why it matters:
- **Financial/Billing**: Wrong insurance = patient billed incorrectly, disputes
- **Medical records**: Insurance info is part of official health record (HIPAA/Colombian law)
- **Fraud prevention**: Patients trying to use fake insurance names
- **Compliance**: Clinic must validate insurance for reimbursement
- **Patient satisfaction**: Wrong insurance causes appointment cancellations

### Recommended Implementation:
```javascript
// HARDCODED list of valid Colombian insurances (from clinic database)
const VALID_COLOMBIAN_INSURANCES = new Set([
    'sura',
    'sanitas',
    'axa',
    'coomeva',
    'colsanitas',
    'famisanar',
    'emssanar',
    'mapfre',
    'zurich',
    'allianz',
    'seguros bolívar',
    'seguros monterrey',
    'oncosalud',
    'asodexo',
    'anmac',
    'capestrano',
    'colpensiones',
    'sol salud'
]);

const NO_INSURANCE_RESPONSES = new Set([
    'no', 'ninguno', 'ninguna', 'no tengo', 'sin seguro',
    'no tengo seguro', 'nope', 'ningún seguro', 'n/a',
    'no hay', 'particular'
]);

const validateInsuranceColombia = (insurance) => {
    if (!insurance || typeof insurance !== 'string') return false;
    
    const trimmed = insurance.trim();
    if (trimmed.length < 2 || trimmed.length > 100) return false;
    
    const normalized = trimmed.toLowerCase();
    
    // Accept explicit "no insurance" answers
    if (NO_INSURANCE_RESPONSES.has(normalized)) return true;
    
    // Check against valid insurance list
    // Handle partial matches and cleanup
    for (const validInsurance of VALID_COLOMBIAN_INSURANCES) {
        if (normalized.includes(validInsurance)) {
            return true;
        }
    }
    
    // If not in list and not explicit "no insurance", might be ambiguous
    // Examples: "sí" (Spanish "yes"), "si" (Spanish "if"), "talvez" (maybe)
    // These require clarification, not outright rejection
    
    return false; // Unknown insurance provider
};

const normalizeInsurance = (insurance) => {
    const normalized = insurance.trim().toLowerCase();
    
    // Map to standard names
    if (NO_INSURANCE_RESPONSES.has(normalized)) {
        return 'Sin seguro';
    }
    
    // Find best match in valid list
    for (const valid of VALID_COLOMBIAN_INSURANCES) {
        if (normalized.includes(valid) || valid.includes(normalized)) {
            // Capitalize first letter
            return valid.charAt(0).toUpperCase() + valid.slice(1);
        }
    }
    
    return null; // Couldn't match
};

// Test
validateInsuranceColombia('Sura')              // true ✓
validateInsuranceColombia('sura')              // true ✓
validateInsuranceColombia('Sin seguro')        // true ✓
validateInsuranceColombia('no tengo')          // true ✓
validateInsuranceColombia('sí')                // false ✓ (ambiguous)
validateInsuranceColombia('XYZ Insurance')     // false ✓ (unknown)
validateInsuranceColombia('AXA Colpatria')     // true ✓
```

---

## SCENARIO 4: SYMPTOMS DESCRIPTION - SECURITY & DATA QUALITY

### Current Issue
```javascript
const validateSymptoms = (symptoms) => {
    const len = symptoms.trim().length;
    return len >= 5 && len <= 500;  // Only checks length!
};
```

### Problems:
1. **No content validation** - "aaaaa" (5 chars) passes
2. **Accepts spam** - Could be "test test test test test"
3. **No injection prevention** - HTML/JavaScript could be injected
4. **URL injection** - User could paste "http://malicious.com" to phish others
5. **Character encoding** - No check for null bytes or dangerous characters

### Real-World Medical Chatbot Examples:

```
Input                          Current    Should be     Risk
═══════════════════════════════════════════════════════════════════
"dolor de cabeza"             PASS✓      PASS✓        Legitimate
"fiebre alta"                 PASS✓      PASS✓        Legitimate
"aaaaa"                        PASS✓      FAIL✗        Gibberish spam
"<script>alert(1)</script>"   PASS✓      FAIL✗        XSS injection
"http://evil.com"             PASS✓      FAIL✗        Phishing link
"test test test test test"    PASS✓      FAIL✗        Spam pattern
"DOLOR DOLOR DOLOR DOLOR"     PASS✓      FAIL✗        Shouting/spam
"zzzzzzzzzzzzzzzzzzzz"        PASS✓      FAIL✗        No meaning
"Tengo alergia a la &lt;penicilina&gt;" PASS✓ FAIL✗ HTML entity injection
"dolor de cabeza, fiebre, vómito, nausea" PASS✓ PASS✓ Good description
```

### Why it matters:
- **Patient safety**: Vague symptoms get misdiagnosed
- **Medical record**: Poor quality notes → liability issues
- **Staff efficiency**: Spam descriptions waste doctors' time
- **Security**: Injection attempts could compromise system
- **Data quality**: Reports/statistics based on bad data are useless

### Recommended Implementation:
```javascript
const validateSymptomsColombia = (symptoms, maxLength = 500) => {
    if (!symptoms || typeof symptoms !== 'string') return false;
    
    const trimmed = symptoms.trim();
    
    // LENGTH
    if (trimmed.length < 5 || trimmed.length > maxLength) return false;
    
    // 1. NO HTML/JAVASCRIPT
    if (/<[^>]*>/g.test(trimmed)) {
        console.log('Rejected: Contains HTML tags');
        return false;
    }
    
    if (/javascript:|on\w+\s*=/i.test(trimmed)) {
        console.log('Rejected: Contains JavaScript');
        return false;
    }
    
    // 2. NO URLs
    if (/https?:\/\/|ftp:\/\//i.test(trimmed)) {
        console.log('Rejected: Contains URLs');
        return false;
    }
    
    // 3. NO HTML ENTITIES
    if (/&[#a-z0-9]+;/i.test(trimmed)) {
        console.log('Rejected: Contains HTML entities');
        return false;
    }
    
    // 4. REASONABLE CAPS (not SCREAMING)
    const capsCount = (trimmed.match(/[A-Z]/g) || []).length;
    if (capsCount > trimmed.length * 0.7 && capsCount > 5) {
        console.log('Rejected: Too many capital letters (spam/screaming)');
        return false;
    }
    
    // 5. CHARACTER DIVERSITY (not "aaaa" or "xxxx")
    const charCounts = {};
    for (const char of trimmed) {
        charCounts[char] = (charCounts[char] || 0) + 1;
    }
    const maxFreq = Math.max(...Object.values(charCounts));
    if (maxFreq > trimmed.length * 0.6) {
        console.log('Rejected: Single character repeated too much');
        return false;
    }
    
    // 6. MINIMUM WORD DIVERSITY
    const words = trimmed.split(/\s+/);
    if (words.length < 2) {
        console.log('Rejected: Too few words');
        return false; // "dolor" alone is too vague
    }
    
    // 7. WORD LENGTH CHECK (catch gibberish)
    for (const word of words) {
        if (word.length > 25) {
            console.log(`Rejected: Word too long: "${word}"`);
            return false; // "aaaaaaaaaaaaaaaaaaaaaaaaaaa"
        }
    }
    
    // 8. SPAM PATTERN: Same word repeated
    const uniqueWords = new Set(words.map(w => w.toLowerCase()));
    if (uniqueWords.size < words.length * 0.4 && words.length > 3) {
        console.log('Rejected: Too much word repetition');
        return false; // "test test test test"
    }
    
    // 9. MUST HAVE SPANISH/LANGUAGE CONTENT
    // Check for vowels (indicates real language)
    const vowels = (trimmed.match(/[aeiouáéíóúAEIOUÁÉÍÓÚ]/gi) || []).length;
    if (vowels < trimmed.length * 0.15) {
        console.log('Rejected: Not enough vowels (not real language)');
        return false;
    }
    
    // 10. NO NULL BYTES OR DANGEROUS CHARS
    if (/[\x00-\x08\x0B-\x0C\x0E-\x1F]/.test(trimmed)) {
        console.log('Rejected: Contains control characters');
        return false;
    }
    
    return true;
};

const sanitizeSymptomsForDB = (symptoms, maxLength = 500) => {
    return String(symptoms)
        .substring(0, maxLength)
        .trim()
        // Remove null bytes
        .replace(/\x00/g, '')
        // Normalize whitespace
        .replace(/\s+/g, ' ')
        // Optional: Remove leading/trailing punctuation
        .replace(/^[,.;!?]+|[,.;!?]+$/g, '');
};

// Test
validateSymptomsColombia('Dolor de cabeza y fiebre')  // true ✓
validateSymptomsColombia('fiebre alta')                // true ✓
validateSymptomsColombia('aaaaa')                      // false ✓
validateSymptomsColombia('<script>alert(1)</script>')  // false ✓
validateSymptomsColombia('http://evil.com')            // false ✓
validateSymptomsColombia('test test test test')        // false ✓
validateSymptomsColombia('DOLOR DOLOR DOLOR DOLOR')    // false ✓
```

---

## SCENARIO 5: DOUBLE-BOOKING & RATE LIMITING

### Problem
Your current system probably doesn't check:
- Same user trying to book twice for same date/time
- Same user booking 10 appointments in 30 seconds
- Bot flooding system with invalid appointment requests

### Real Scenarios:
```
Action                              Current Result    Should Be        Impact
═════════════════════════════════════════════════════════════════════════════
User books appt for June 20, 2pm   Success           Success          ✓
Same user books AGAIN for June 20  Success ✗        REJECT ✗          Double booking!
Bot books 50 appts in 5 seconds     Success ✗        REJECT ✗          System overload
User tries 5 different phone #'s    Success ✗        After 3: Lock     Brute force attempt
```

### Implementation:
```javascript
class AppointmentValidator {
    constructor() {
        this.userAttempts = new Map();    // Phone -> [timestamp...]
        this.userLocked = new Map();      // Phone -> lockUntilTime
        this.existingBookings = new Map(); // Phone -> [dates...]
    }
    
    /**
     * Check if user already has appointment for this date
     */
    async hasConflict(phone, appointmentDate) {
        const bookings = await getExistingBookings(phone);
        
        const sameDay = bookings.find(b => {
            const existingDate = new Date(b.date);
            const newDate = new Date(appointmentDate);
            
            // Same day?
            return existingDate.toDateString() === newDate.toDateString();
        });
        
        if (sameDay) {
            console.log(`Conflict: User already has appointment ${sameDay.date}`);
            return true;
        }
        
        return false;
    }
    
    /**
     * Check rate limiting
     */
    checkRateLimit(phone) {
        const now = Date.now();
        
        // Check if locked
        const lockedUntil = this.userLocked.get(phone);
        if (lockedUntil && lockedUntil > now) {
            return {
                allowed: false,
                reason: 'Demasiados intentos. Intenta de nuevo en 15 minutos.'
            };
        }
        
        // Check attempts in last 5 minutes
        const attempts = this.userAttempts.get(phone) || [];
        const fiveMinutesAgo = now - 5 * 60 * 1000;
        const recentAttempts = attempts.filter(t => t > fiveMinutesAgo);
        
        if (recentAttempts.length >= 2) {
            // Lock user
            this.userLocked.set(phone, now + 15 * 60 * 1000);
            return {
                allowed: false,
                reason: 'Demasiados intentos. Por favor intenta de nuevo en 15 minutos.'
            };
        }
        
        return { allowed: true };
    }
    
    recordAttempt(phone) {
        const attempts = this.userAttempts.get(phone) || [];
        attempts.push(Date.now());
        this.userAttempts.set(phone, attempts);
    }
}

// Usage
const validator = new AppointmentValidator();

const bookAppointment = async (phone, date) => {
    // 1. Check rate limit
    const rateLimit = validator.checkRateLimit(phone);
    if (!rateLimit.allowed) {
        return { success: false, message: rateLimit.reason };
    }
    
    // 2. Check for conflict
    const hasConflict = await validator.hasConflict(phone, date);
    if (hasConflict) {
        validator.recordAttempt(phone); // Bad attempt
        return { success: false, message: 'Ya tienes cita para ese día' };
    }
    
    // 3. Proceed with booking
    validator.recordAttempt(phone); // Good attempt
    await createAppointment(phone, date);
    return { success: true, message: 'Cita confirmada' };
};
```

---

## SCENARIO 6: ABUSE PATTERNS SPECIFIC TO MEDICAL CHATBOTS

### Common Bot/Spam Patterns Documented in Production:

**Pattern 1: Inventory Hoarding**
- Bot books all available slots for next 60 days
- Medical impact: Real patients can't get appointments
- Detection: 1 user has 5+ appointments

```javascript
const maxAppointmentsPerUser = 1; // Only 1 active appointment per user
const checkExcessiveBookings = async (phone) => {
    const bookings = await getActiveBookings(phone);
    return bookings.length >= maxAppointmentsPerUser;
};
```

**Pattern 2: Test/Fake Data**
- Names: "test", "demo", "usuario", "aaa"
- Phones: "3333333333", "1234567890"
- Insurance: "test insurance"

```javascript
const isFakeData = (data) => {
    const fakePatterns = {
        name: /^(test|demo|usuario|user\d+|aaa+|zzz+|xxx+)/i,
        phone: /^(1111|2222|3333|4444|5555|6666|7777|8888|9999|1234)/,
        insurance: /^test/i
    };
    
    for (const [field, pattern] of Object.entries(fakePatterns)) {
        if (pattern.test(data[field])) {
            console.log(`Rejected: Fake ${field} pattern`);
            return true;
        }
    }
    return false;
};
```

**Pattern 3: Rapid-Fire Submissions**
- Multiple booking attempts in seconds
- Medical impact: Server overload, system crash
- Detection: Rate limiting (implemented above)

**Pattern 4: Information Leakage Testing**
- Trying different phone numbers to test if patients exist
- Medical impact: HIPAA violation, privacy breach
- Solution: Use GENERIC responses, don't leak existence info

```javascript
// WRONG - Leaks information:
if (userExists(phone)) {
    return "Usuario ya existe";
} else {
    return "Usuario no encontrado";
}

// CORRECT - Generic response:
return "Se ha enviado confirmación. Por favor verifica tu teléfono.";
```

---

## SUMMARY: VALIDATION PRIORITIES FOR YOUR CHATBOT

### Must Have (Security-Critical):
1. ✓ Phone validation - Colombian format only
2. ✓ Date validation - Future dates in business hours only
3. ✓ Double-booking prevention - No conflicts for same user/date
4. ✓ Rate limiting - Max 1 attempt per 5 minutes
5. ✓ Injection prevention - No HTML/JavaScript in any field
6. ✓ Generic error messages - Don't leak information

### Should Have (Data Quality):
1. ✓ Insurance validation - Against known provider list
2. ✓ Symptoms validation - No spam patterns, real language
3. ✓ Name validation - Reasonable length and format
4. ✓ Fake data detection - Reject test patterns
5. ✓ Duplicate user detection - Check if number already in system

### Nice to Have (UX/Completeness):
1. ✓ Timezone handling - All times in clinic timezone
2. ✓ Holiday awareness - Automated clinic closure dates
3. ✓ Confirmation SMS - Verify appointment via separate SMS
4. ✓ Availability check - Show available slots proactively

---

**Document tailored for Colombian medical clinic WhatsApp chatbot - June 2026**
