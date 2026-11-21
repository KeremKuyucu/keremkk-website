// ─── PII Redactor for AI Payloads ────────────────────────────────────────────
// AI servislerine (Gemini vb.) gönderilmeden önce metin ve nesnelerdeki
// kişisel bilgileri (PII) tespit edip sansürler.

export type PiiCategory =
    | "iban"
    | "card_number"
    | "tckn"
    | "vkn"
    | "email"
    | "phone"
    | "account_number"
    | "customer_number"
    | "subscriber_number"
    | "person_name"
    | "address"
    | "plate"
    | "ip_address"
    | "token"
    | "uuid"
    | "custom";

export interface RedactionSummary {
    totalRedactions: number;
    byCategory: Partial<Record<PiiCategory, number>>;
}

export interface RedactOptions {
    extraSensitiveTerms?: string[];
    redactUuids?: boolean;
    redactUrlQueryParams?: boolean;
}

export const PII_CATEGORY_LABELS_TR: Record<PiiCategory, string> = {
    iban: "IBAN",
    card_number: "Kart No",
    tckn: "T.C. Kimlik No",
    vkn: "Vergi No",
    email: "E-posta",
    phone: "Telefon",
    account_number: "Hesap No",
    customer_number: "Müşteri No",
    subscriber_number: "Abone/Sözleşme No",
    person_name: "Ad-Soyad",
    address: "Adres",
    plate: "Plaka",
    ip_address: "IP Adresi",
    token: "Token/Gizli Parametre",
    uuid: "Kullanıcı/Oturum ID",
    custom: "Özel Kişisel Bilgi",
};

// Banka/işlem terimleri yanlışlıkla isim parçası olarak sansürlenmesin
const TERM_STOPWORDS = new Set([
    "bank",
    "banka",
    "bankasi",
    "bankası",
    "kart",
    "kredi",
    "hesap",
    "hesabi",
    "hesabı",
    "musteri",
    "müşteri",
    "sube",
    "şube",
    "islem",
    "işlem",
    "odeme",
    "ödeme",
    "harcama",
    "tutar",
    "tarih",
    "saat",
    "aciklama",
    "açıklama",
    "ekstre",
    "ozet",
    "özet",
    "bakiye",
    "limit",
    "donem",
    "dönem",
    "fatura",
    "market",
    "taksit",
    "turk",
    "türk",
    "turkiye",
    "türkiye",
    "istanbul",
    "ankara",
    "izmir",
    "sayin",
    "sayın",
    "garanti",
    "akbank",
    "ziraat",
    "vakifbank",
    "halkbank",
    "enpara",
    "denizbank",
    "yapikredi",
    "isbank",
    "papara",
    "troy",
    "visa",
    "mastercard",
]);

// Standart IBAN ülke kodları (rastgele 2 harf + rakam kodlarıyla karışmasın)
const IBAN_COUNTRY_CODES = new Set([
    "TR", "DE", "GB", "FR", "NL", "BE", "ES", "IT", "AT", "CH", "SE", "NO",
    "DK", "FI", "IE", "PT", "PL", "CZ", "GR", "HU", "RO", "BG", "HR", "SK",
    "SI", "LT", "LV", "EE", "LU", "MT", "CY", "IS", "LI", "AE", "SA", "QA",
    "KW", "BH", "IL", "JO", "EG", "UA", "RS", "BA", "ME", "MK", "AL", "GE",
    "AZ", "KZ", "BR", "CR", "DO", "GT", "PK", "TN", "MU", "SC",
]);

const SENSITIVE_OBJECT_KEYS = new Set([
    "ip",
    "ip_address",
    "ipaddress",
    "client_ip",
    "remote_addr",
    "email",
    "e_mail",
    "eposta",
    "phone",
    "phone_number",
    "mobile",
    "tel",
    "telephone",
    "uid",
    "user_id",
    "userid",
    "tckn",
    "tc_no",
    "vkn",
    "iban",
    "card_number",
    "card_no",
    "kart_no",
    "account_number",
    "account_no",
    "hesap_no",
    "customer_no",
    "musteri_no",
    "address",
    "adres",
    "full_name",
    "fullname",
    "ad_soyad",
    "password",
    "passwd",
    "secret",
    "token",
    "access_token",
    "refresh_token",
    "authorization",
    "cookie",
]);

// ─── Helpers ─────────────────────────────────────────────────────────────────

export function createEmptyRedactionSummary(): RedactionSummary {
    return {
        totalRedactions: 0,
        byCategory: {},
    };
}

export function mergeRedactionSummaries(
    ...summaries: RedactionSummary[]
): RedactionSummary {
    const merged = createEmptyRedactionSummary();

    for (const summary of summaries) {
        merged.totalRedactions += summary.totalRedactions;
        for (const [key, count] of Object.entries(summary.byCategory)) {
            if (!count) continue;
            const cat = key as PiiCategory;
            merged.byCategory[cat] = (merged.byCategory[cat] || 0) + count;
        }
    }

    return merged;
}

export function formatRedactionSummaryTr(summary: RedactionSummary): string {
    const parts = Object.entries(summary.byCategory)
        .filter(([, count]) => typeof count === "number" && count > 0)
        .sort((a, b) => (b[1] || 0) - (a[1] || 0))
        .map(([cat, count]) => `${count} ${PII_CATEGORY_LABELS_TR[cat as PiiCategory] || cat}`);

    return parts.join(", ");
}

function recordRedaction(
    summary: RedactionSummary,
    category: PiiCategory,
    count = 1
) {
    if (count <= 0) return;
    summary.totalRedactions += count;
    summary.byCategory[category] = (summary.byCategory[category] || 0) + count;
}

function normalizeTrLower(value: string): string {
    return value.toLocaleLowerCase("tr-TR").trim();
}

function escapeRegExp(str: string): string {
    return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Türkçe harflerin büyük/küçük varyasyonlarını (I/ı/İ/i vb.) eşleştiren
 * case-insensitive regex pattern üretir.
 */
function buildTurkishInsensitivePattern(term: string): string {
    const charMap: Record<string, string> = {
        i: "[iİIı]",
        ı: "[ıIiİ]",
        İ: "[iİIı]",
        I: "[ıIiİ]",
        ğ: "[ğĞ]",
        Ğ: "[ğĞ]",
        ü: "[üÜ]",
        Ü: "[üÜ]",
        ş: "[şŞ]",
        Ş: "[şŞ]",
        ö: "[öÖ]",
        Ö: "[öÖ]",
        ç: "[çÇ]",
        Ç: "[çÇ]",
    };

    let pattern = "";
    for (const ch of term) {
        if (charMap[ch]) {
            pattern += charMap[ch];
        } else if (/\s/.test(ch)) {
            pattern += "\\s+";
        } else {
            pattern += escapeRegExp(ch);
        }
    }
    return pattern;
}

/**
 * T.C. Kimlik Numarası resmi algoritma kontrolü.
 */
export function isValidTckn(raw: string): boolean {
    if (!/^[1-9]\d{10}$/.test(raw)) {
        return false;
    }

    const d = raw.split("").map(Number);
    const oddSum = d[0] + d[2] + d[4] + d[6] + d[8];
    const evenSum = d[1] + d[3] + d[5] + d[7];

    const tenth = (((oddSum * 7 - evenSum) % 10) + 10) % 10;
    if (tenth !== d[9]) {
        return false;
    }

    const sumFirstTen =
        d[0] + d[1] + d[2] + d[3] + d[4] + d[5] + d[6] + d[7] + d[8] + d[9];
    const eleventh = sumFirstTen % 10;

    return eleventh === d[10];
}

/**
 * Kredi/banka kartı numarası için Luhn algoritması kontrolü.
 */
export function isValidLuhn(digits: string): boolean {
    if (!/^\d{13,19}$/.test(digits)) {
        return false;
    }

    let sum = 0;
    let shouldDouble = false;

    for (let i = digits.length - 1; i >= 0; i--) {
        let digit = Number(digits[i]);
        if (shouldDouble) {
            digit *= 2;
            if (digit > 9) digit -= 9;
        }
        sum += digit;
        shouldDouble = !shouldDouble;
    }

    return sum % 10 === 0;
}

function getEnvRedactTerms(): string[] {
    if (typeof process === "undefined" || !process.env?.AI_REDACT_TERMS) {
        return [];
    }

    return process.env.AI_REDACT_TERMS.split(/[,;\n]/)
        .map((t) => t.trim())
        .filter((t) => t.length >= 3);
}

/**
 * Kullanıcıdan veya belge üstbilgisinden gelen terimleri güvenli sansür listesine dönüştürür.
 */
function prepareExtraTerms(rawTerms: string[]): string[] {
    const result = new Set<string>();

    for (const raw of rawTerms) {
        const cleaned = raw.replace(/\s+/g, " ").trim();
        if (cleaned.length < 3) continue;

        const lower = normalizeTrLower(cleaned);
        if (TERM_STOPWORDS.has(lower)) continue;

        result.add(cleaned);

        // Çok kelimeli isimler (ör: "Kerem Kuyucu") için tek tek kelimeleri de ekle (>= 4 karakter)
        const words = cleaned.split(/\s+/);
        if (words.length >= 2 && words.length <= 4) {
            for (const word of words) {
                const cleanWord = word.replace(/^[^\p{L}\p{N}]+|[^\p{L}\p{N}]+$/gu, "");
                if (cleanWord.length < 4) continue;
                const wLower = normalizeTrLower(cleanWord);
                if (TERM_STOPWORDS.has(wLower)) continue;
                // Sadece rakam olan kısa parçaları alma (tutarlarla karışmasın)
                if (/^\d{1,5}$/.test(cleanWord)) continue;
                result.add(cleanWord);
            }
        }
    }

    // En uzundan en kısaya sırala (önce tam ad-soyad eşleşsin)
    return Array.from(result).sort((a, b) => b.length - a.length);
}

// ─── Dynamic Header PII Extraction ───────────────────────────────────────────

const METADATA_LABEL_PATTERNS = [
    /^(?:ad[ıi]?\s*soyad[ıi]?|müşteri\s*ad[ıi](?:\s*soyad[ıi])?|musteri\s*adi|hesap\s*sahibi|kart\s*sahibi|cardholder|account\s*holder|alıcı|alici|borçlu|borclu)$/i,
    /^(?:adres|fatura\s*adresi|teslimat\s*adresi|ikametgah|address)$/i,
    /^(?:müşteri\s*no|musteri\s*no|müşteri\s*numarası|hesap\s*no|hesap\s*numarası|kart\s*no|kart\s*numarası|iban|tckn|t\.?\s*c\.?\s*kimlik\s*no|vergi\s*no|vkn|telefon|cep\s*telefonu|e-?posta|email)$/i,
];

function isMetadataLabel(cell: string): boolean {
    const cleaned = cell.replace(/[:：\-\s]+$/g, "").trim();
    if (!cleaned || cleaned.length > 40) return false;
    return METADATA_LABEL_PATTERNS.some((rx) => rx.test(cleaned));
}

/**
 * Banka Excel dosyalarında tablo başlığından (Tarih/Saat) önceki üstbilgi satırlarından
 * hesap sahibinin adı, IBAN, hesap no, kart no gibi kişisel bilgileri toplar.
 * Bu değerler ASLA AI'ya gönderilmez; sadece işlem açıklamalarında geçerse sansürlemek için kullanılır.
 */
export function extractSensitiveTermsFromSpreadsheetRows(
    headerRows: unknown[][]
): string[] {
    const extracted = new Set<string>();

    for (const row of headerRows) {
        if (!Array.isArray(row)) continue;

        for (let i = 0; i < row.length; i++) {
            const cellText = String(row[i] ?? "").replace(/\s+/g, " ").trim();
            if (!cellText) continue;

            // Durum 1: Aynı hücre içinde "Etiket: Değer"
            const inlineMatch = cellText.match(
                /^(?:ad[ıi]?\s*soyad[ıi]?|müşteri\s*ad[ıi](?:\s*soyad[ıi])?|musteri\s*adi|hesap\s*sahibi|kart\s*sahibi|say[ıi]n|sn\.|adres|fatura\s*adresi|müşteri\s*no|hesap\s*no|kart\s*no|iban|t\.?\s*c\.?\s*kimlik\s*no|tckn)\s*[:：\-]?\s*(.+)$/i
            );
            if (inlineMatch?.[1]) {
                const val = inlineMatch[1].trim();
                if (val.length >= 3 && val.length <= 120) {
                    extracted.add(val);
                }
                continue;
            }

            // Durum 2: [Etiket hücresi, Değer hücresi]
            if (isMetadataLabel(cellText)) {
                for (let j = i + 1; j < Math.min(row.length, i + 4); j++) {
                    const nextVal = String(row[j] ?? "").replace(/\s+/g, " ").trim();
                    if (nextVal && nextVal !== ":" && nextVal.length >= 3 && nextVal.length <= 120) {
                        extracted.add(nextVal);
                        break;
                    }
                }
            }
        }
    }

    return Array.from(extracted);
}

/**
 * PDF veya düz metin ekstrelerdeki etiketli kişisel bilgileri (Sayın ..., Ad Soyad: ..., vb.)
 * çıkarır ki belgenin başka yerlerinde etiketsiz geçseler bile sansürlensinler.
 */
export function extractSensitiveTermsFromLabeledText(text: string): string[] {
    const extracted = new Set<string>();

    const patterns: RegExp[] = [
        /(?:ad[ıi]?[ \t]*soyad[ıi]?|müşteri[ \t]*ad[ıi](?:[ \t]*soyad[ıi])?|musteri[ \t]*adi|hesap[ \t]*sahibi|kart[ \t]*sahibi|cardholder|account[ \t]*holder)[ \t]*[:：\-][ \t]*([^\n,|;]{3,70}?)(?=[ \t]{2,}|\n|,|\||;|$)/gi,
        /\b(?:Say[ıi]n|say[ıi]n|SAYIN|Sn\.|sn\.|SN\.)[ \t]+([A-ZÇĞİÖŞÜ][A-Za-zÇĞİÖŞÜçğıöşü'.-]+(?: [A-ZÇĞİÖŞÜ][A-Za-zÇĞİÖŞÜçğıöşü'.-]+){1,3})/g,
        /(?:müşteri[ \t]*(?:no|numaras[ıi])|hesap[ \t]*(?:no|numaras[ıi])|kart[ \t]*(?:no|numaras[ıi]))[ \t]*[:：\-][ \t]*([A-Z0-9*xX•/\- ]{5,30}?)(?=[ \t]{2,}|\n|,|\||;|$)/gi,
    ];

    for (const rx of patterns) {
        let match: RegExpExecArray | null;
        while ((match = rx.exec(text)) !== null) {
            const val = (match[1] || "").replace(/\s+/g, " ").trim();
            if (val.length >= 3 && val.length <= 80 && !/^\[[A-Z_]+\]$/.test(val)) {
                extracted.add(val);
            }
        }
    }

    return Array.from(extracted);
}

// ─── Core Text Redactor ──────────────────────────────────────────────────────

export function redactPiiText(
    input: string,
    options: RedactOptions = {}
): { text: string; summary: RedactionSummary } {
    const summary = createEmptyRedactionSummary();

    if (!input || typeof input !== "string") {
        return { text: input || "", summary };
    }

    let text = input;

    const replaceWithCount = (
        regex: RegExp,
        category: PiiCategory,
        replacer: string | ((...args: string[]) => string)
    ) => {
        text = text.replace(regex, (...args) => {
            const match = args[0] as string;
            const replaced =
                typeof replacer === "function"
                    ? replacer(...(args as string[]))
                    : match.replace(
                          new RegExp(regex.source, regex.flags.replace("g", "")),
                          replacer
                      );

            if (replaced !== match) {
                recordRedaction(summary, category, 1);
            }
            return replaced;
        });
    };

    // 1. Etiketli Kişisel Bilgiler (Etiketi koruyarak değeri sansürle)

    // 1a. Ad-Soyad etiketleri
    replaceWithCount(
        /((?:ad[ıi]?[ \t]*soyad[ıi]?|müşteri[ \t]*ad[ıi](?:[ \t]*soyad[ıi])?|musteri[ \t]*adi|hesap[ \t]*sahibi|kart[ \t]*sahibi|alıcı[ \t]*ad[ıi]?|alici[ \t]*adi|gönderen[ \t]*ad[ıi]?|gonderen[ \t]*adi|cardholder|account[ \t]*holder)[ \t]*[:：\-][ \t]*)([^\n,|;]{2,70}?)(?=[ \t]{2,}|\n|,|\||;|$)/gi,
        "person_name",
        (_, prefix: string, value: string) => {
            if (/^\[[A-Z_]+\]/.test(value.trim())) return `${prefix}${value}`;
            return `${prefix}[AD_SOYAD]`;
        }
    );

    // 1b. "Sayın Ad Soyad" / "Sn. Ad Soyad" (tek boşlukla ayrılmış ad kelimeleri, sütun atlamaz)
    replaceWithCount(
        /\b(Say[ıi]n|say[ıi]n|SAYIN|Sn\.|sn\.|SN\.)([ \t]+)([A-ZÇĞİÖŞÜ][A-Za-zÇĞİÖŞÜçğıöşü'.-]+(?: [A-ZÇĞİÖŞÜ][A-Za-zÇĞİÖŞÜçğıöşü'.-]+){1,3})/g,
        "person_name",
        (_, salutation: string, space: string) => `${salutation}${space}[AD_SOYAD]`
    );

    // 1c. Etiketli Adres
    replaceWithCount(
        /((?:fatura[ \t]*adresi|teslimat[ \t]*adresi|ikametgah(?:[ \t]*adresi)?|iletişim[ \t]*adresi|adres|address)[ \t]*[:：\-][ \t]*)([^\n]{4,180}?)(?=[ \t]{3,}|\n|$)/gi,
        "address",
        (_, prefix: string, value: string) => {
            if (/^\[[A-Z_]+\]/.test(value.trim())) return `${prefix}${value}`;
            return `${prefix}[ADRES]`;
        }
    );

    // 1d. Etiketli TCKN
    replaceWithCount(
        /((?:t\.?[ \t]*c\.?[ \t]*(?:kimlik)?[ \t]*(?:no|numaras[ıi])?|tckn)[ \t]*[:：#\-]?[ \t]*)([\d*xX•\-]{8,14})/gi,
        "tckn",
        (_, prefix: string) => `${prefix}[TCKN]`
    );

    // 1e. Etiketli VKN / Vergi No
    replaceWithCount(
        /((?:vergi[ \t]*(?:kimlik[ \t]*)?(?:no|numaras[ıi])|vkn)[ \t]*[:：#\-]?[ \t]*)([\d*xX•\-]{8,12})/gi,
        "vkn",
        (_, prefix: string) => `${prefix}[VKN]`
    );

    // 1f. Etiketli Müşteri No
    replaceWithCount(
        /((?:müşteri[ \t]*(?:no|numaras[ıi]|kodu)|musteri[ \t]*(?:no|numarasi|kodu)|customer[ \t]*(?:id|no|number))[ \t]*[:：#\-]?[ \t]*)([A-Z0-9*xX•/\-]{4,22})/gi,
        "customer_number",
        (_, prefix: string) => `${prefix}[MUSTERI_NO]`
    );

    // 1g. Etiketli Hesap No
    replaceWithCount(
        /((?:hesap[ \t]*(?:no|numaras[ıi])|şube[ \t]*\/?[ \t]*hesap(?:[ \t]*no)?|sube[ \t]*\/?[ \t]*hesap(?:[ \t]*no)?|account[ \t]*(?:no|number))[ \t]*[:：#\-]?[ \t]*)([A-Z0-9*xX•/\-]{5,26})/gi,
        "account_number",
        (_, prefix: string) => `${prefix}[HESAP_NO]`
    );

    // 1h. Etiketli Kart No
    replaceWithCount(
        /((?:kart[ \t]*(?:no|numaras[ıi])|card[ \t]*(?:no|number))[ \t]*[:：#\-]?[ \t]*)([\d*xX•]{4}[\d*xX• \t\-]{4,20}?)(?=[ \t]{2,}|\n|,|\||;|$)/gi,
        "card_number",
        (_, prefix: string) => `${prefix}[KART_NO]`
    );

    // 1i. Etiketli Abone / Sözleşme / Tesisat / Poliçe / Sayaç No
    replaceWithCount(
        /((?:abone[ \t]*(?:no|numaras[ıi])|sözleşme[ \t]*(?:no|numaras[ıi])|sozlesme[ \t]*(?:no|numarasi)|tesisat[ \t]*(?:no|numaras[ıi])|hizmet[ \t]*(?:no|numaras[ıi])|poliçe[ \t]*(?:no|numaras[ıi])|police[ \t]*(?:no|numarasi)|sayaç[ \t]*(?:no|numaras[ıi])|sayac[ \t]*(?:no|numarasi)|subscriber[ \t]*(?:no|id))[ \t]*[:：#\-]?[ \t]*)([A-Z0-9*xX•/\-]{4,24})/gi,
        "subscriber_number",
        (_, prefix: string) => `${prefix}[ABONE_NO]`
    );

    // 1j. Etiketli Plaka ve HGS/OGS plakaları
    replaceWithCount(
        /((?:araç[ \t]*)?plaka(?:s[ıi])?[ \t]*[:：#\-]?[ \t]*)((?:0[1-9]|[1-7]\d|8[01])[ \t]*[A-ZÇĞİÖŞÜ]{1,3}[ \t]*\d{2,5})\b/gi,
        "plate",
        (_, prefix: string) => `${prefix}[PLAKA]`
    );
    replaceWithCount(
        /\b(HGS|OGS)([^,\n]{0,20}?)(\b(?:0[1-9]|[1-7]\d|8[01])[ \t]?[A-Z]{1,3}[ \t]?\d{2,5}\b)/gi,
        "plate",
        (_, prefix: string, mid: string) => `${prefix}${mid}[PLAKA]`
    );

    // 2. E-posta Adresleri (özel isim terimlerinden önce ki ad@domain.com tek parça [EPOSTA] olsun)
    replaceWithCount(
        /\b[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}\b/g,
        "email",
        () => "[EPOSTA]"
    );

    // 3. Özel ve Belgeden Dinamik Çıkarılan Terimler (Ad Soyad vb.)
    const allExtraTerms = prepareExtraTerms([
        ...(options.extraSensitiveTerms || []),
        ...getEnvRedactTerms(),
    ]);

    for (const term of allExtraTerms) {
        const pattern = buildTurkishInsensitivePattern(term);
        // Harf/rakam sınırlarına dikkat et (başka kelimenin ortasını kesmesin)
        const rx = new RegExp(
            `(?<![A-Za-zÇĞİÖŞÜçğıöşü0-9])${pattern}(?![A-Za-zÇĞİÖŞÜçğıöşü0-9])`,
            "gi"
        );
        replaceWithCount(rx, "custom", () => "[KISISEL_BILGI]");
    }

    // 4. JWT Token & Hassas URL Query Parametreleri
    replaceWithCount(
        /\beyJ[A-Za-z0-9_-]{10,}\.eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\b/g,
        "token",
        () => "[TOKEN]"
    );

    if (options.redactUrlQueryParams !== false) {
        replaceWithCount(
            /([?&](?:token|access_token|refresh_token|id_token|api_key|apikey|key|secret|password|passwd|pwd|email|mail|phone|tel|mobile|user|username|uid|user_id|session|sid|auth|code|tckn|iban|name|fullname)=)([^&#\s]+)/gi,
            "token",
            (_, prefix: string, value: string) => {
                if (value === "[GIZLI]") return `${prefix}${value}`;
                return `${prefix}[GIZLI]`;
            }
        );
    }

    // 5. IBAN (Türkiye tam, Türkiye maskeli ve uluslararası)
    replaceWithCount(
        /\bTR\d{2}(?:[ \t-]?[\d*xX•]{4}){5}[ \t-]?[\d*xX•]{2}\b/gi,
        "iban",
        () => "[IBAN]"
    );
    replaceWithCount(
        /\bTR\d{2}[ \t-]?[\d*xX•]{12,24}\b/gi,
        "iban",
        () => "[IBAN]"
    );
    replaceWithCount(
        /\b([A-Z]{2})\d{2}(?:[ \t-]?[A-Z0-9]{4}){3,7}(?:[ \t-]?[A-Z0-9]{1,4})?\b/g,
        "iban",
        (match: string, country: string) => {
            if (!IBAN_COUNTRY_CODES.has(country)) return match;
            const compact = match.replace(/[ \t-]/g, "");
            if (compact.length < 15 || compact.length > 34) return match;
            return "[IBAN]";
        }
    );

    // 6. Kredi / Banka Kartı Numaraları (Maskeli ve Tam)
    // 6a. Maskeli kart numaraları: 5406 67** **** 1234, 540667******1234, **** **** **** 1234, ****1234
    replaceWithCount(
        /\b\d{4,6}[ \t-]?[*xX•]{2,8}(?:[ \t-]?[*xX•]{4})*[ \t-]?\d{4}\b/g,
        "card_number",
        () => "[KART_NO]"
    );
    replaceWithCount(
        /(?:[*xX•]{4}[ \t-]?){2,3}\d{4}\b/g,
        "card_number",
        () => "[KART_NO]"
    );
    replaceWithCount(
        /(?<![A-Za-z0-9])[*xX•]{4,8}[ \t]?\d{4}\b/g,
        "card_number",
        () => "[KART_NO]"
    );
    replaceWithCount(
        /\b\d{4}[ \t]*(?:no'?lu|nolu|ile[ \t]+biten)[ \t]+(?:kredi[ \t]+|banka[ \t]+)?kart(?:[ıi]n[ıi]z|[ıi])?/gi,
        "card_number",
        () => "[KART_NO] kart"
    );

    // 6b. Tam kart numaraları (13-19 hane, boşluk/tireli veya bitişik; Luhn veya 4-4-4-4)
    replaceWithCount(
        /(?<!\d)(?:\d{4}[ \t-]\d{4}[ \t-]\d{4}[ \t-]\d{4}|\d{13,19})(?!\d)/g,
        "card_number",
        (match: string) => {
            const digits = match.replace(/[ \t-]/g, "");
            const isGrouped16 = /^\d{4}[ \t-]\d{4}[ \t-]\d{4}[ \t-]\d{4}$/.test(match);
            const hasCardPrefix = /^[34569]/.test(digits);
            if (isGrouped16 || (hasCardPrefix && isValidLuhn(digits))) {
                return "[KART_NO]";
            }
            return match;
        }
    );

    // 7. Telefon Numaraları (Türkiye + Uluslararası)
    // +90 / 0090 / 0 (5xx/2xx-4xx) xxx xx xx
    replaceWithCount(
        /(?<!\d)(?:\+?90|0090)[ \t.-]?\(?[2-9]\d{2}\)?[ \t.-]?\d{3}[ \t.-]?\d{2}[ \t.-]?\d{2}(?!\d)/g,
        "phone",
        () => "[TELEFON]"
    );
    replaceWithCount(
        /(?<!\d)0[ \t.-]?\(?[2-9]\d{2}\)?[ \t.-]?\d{3}[ \t.-]?\d{2}[ \t.-]?\d{2}(?!\d)/g,
        "phone",
        () => "[TELEFON]"
    );
    replaceWithCount(
        /(?<!\d)\(?5\d{2}\)?[ \t.-]\d{3}[ \t.-]\d{2}[ \t.-]\d{2}(?!\d)/g,
        "phone",
        () => "[TELEFON]"
    );
    // Uluslararası (+1, +44, +49 vb.)
    replaceWithCount(
        /(?<!\w)\+[1-9]\d{0,2}[ \t.-]?\(?\d{2,4}\)?[ \t.-]\d{3,4}[ \t.-]\d{2,4}(?:[ \t.-]\d{2,4})?(?!\d)/g,
        "phone",
        () => "[TELEFON]"
    );

    // 8. Etiketsiz 11 Haneli T.C. Kimlik Numaraları (Algoritma doğrulamalı)
    replaceWithCount(
        /(?<!\d)[1-9]\d{10}(?!\d)/g,
        "tckn",
        (match: string) => (isValidTckn(match) ? "[TCKN]" : match)
    );

    // 9. Yapılandırılmış Türkiye Açık Adres Kalıpları
    // Mağaza isimlerini bozmamak için en az 2 adres belirteci (Mah./Cad./Sok. + No:/Daire:/Kat:/Apt.) gerektirir
    replaceWithCount(
        /\b[A-ZÇĞİÖŞÜa-zçğıöşü0-9.\- ]{2,40}\b(?:Mah\.|Mahallesi|MH\.)[^\n]{0,120}(?:No[ \t]*[:.]?[ \t]*\d+|Daire[ \t]*[:.]?[ \t]*\d+|D[ \t]*[:.][ \t]*\d+|Kat[ \t]*[:.]?[ \t]*\d+|Apt\.?|Blok)/gi,
        "address",
        () => "[ADRES]"
    );
    replaceWithCount(
        /\b[A-ZÇĞİÖŞÜa-zçğıöşü0-9.\- ]{2,40}\b(?:Cad\.|Caddesi|Cd\.|Sok\.|Sokağ[ıi]|Sk\.|Bulvar[ıi]|Blv\.)[^\n]{0,100}(?:No[ \t]*[:.]?[ \t]*\d+(?:\/\d+)?(?:[ \t]*(?:Kat|Daire|D|Apt|Blok)[^\n,]{0,25})?)/gi,
        "address",
        () => "[ADRES]"
    );

    // 10. IP Adresleri (IPv4 ve IPv6)
    replaceWithCount(
        /\b(?:(?:25[0-5]|2[0-4]\d|1?\d?\d)\.){3}(?:25[0-5]|2[0-4]\d|1?\d?\d)\b/g,
        "ip_address",
        () => "[IP]"
    );
    replaceWithCount(
        /\b(?:[0-9a-fA-F]{1,4}:){3,7}[0-9a-fA-F]{1,4}\b/g,
        "ip_address",
        () => "[IP]"
    );

    // 11. Opsiyonel UUID Sansürleme (Analitik URL path / event isimleri için)
    if (options.redactUuids) {
        replaceWithCount(
            /\b[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\b/gi,
            "uuid",
            () => "[UUID]"
        );
    }

    return { text, summary };
}

// ─── Recursive Object Redactor ───────────────────────────────────────────────

export function redactPiiObject<T>(
    value: T,
    options: RedactOptions = {}
): { data: T; summary: RedactionSummary } {
    const totalSummary = createEmptyRedactionSummary();

    const walk = (node: unknown, keyName?: string): unknown => {
        if (keyName && SENSITIVE_OBJECT_KEYS.has(keyName.toLowerCase())) {
            if (node !== null && node !== undefined && node !== "") {
                recordRedaction(totalSummary, "custom", 1);
                return "[GIZLI]";
            }
            return node;
        }

        if (typeof node === "string") {
            const { text, summary } = redactPiiText(node, options);
            mergeInto(totalSummary, summary);
            return text;
        }

        if (Array.isArray(node)) {
            return node.map((item) => walk(item));
        }

        if (node && typeof node === "object") {
            const out: Record<string, unknown> = {};
            for (const [k, v] of Object.entries(node as Record<string, unknown>)) {
                out[k] = walk(v, k);
            }
            return out;
        }

        return node;
    };

    const data = walk(value) as T;
    return { data, summary: totalSummary };
}

function mergeInto(target: RedactionSummary, source: RedactionSummary) {
    target.totalRedactions += source.totalRedactions;
    for (const [key, count] of Object.entries(source.byCategory)) {
        if (!count) continue;
        const cat = key as PiiCategory;
        target.byCategory[cat] = (target.byCategory[cat] || 0) + count;
    }
}
