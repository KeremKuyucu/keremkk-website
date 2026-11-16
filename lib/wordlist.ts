import { promises as fs } from "fs";
import path from "path";

export interface GeneratePasswordOptions {
    wordCount?: number;
    wordLengths?: number[];
    separator?: string;
    capitalize?: "none" | "first" | "all" | "random";
    includeNumber?: boolean;
    count?: number; // Bulk generation
}

export interface GeneratedPasswordResult {
    password: string;
    words: string[];
    wordCount: number;
    totalLength: number;
    strength: "Zayıf" | "Orta" | "Güçlü" | "Çok Güçlü";
    strengthScore: number; // 0 - 100
    separator: string;
    wordLengths: number[];
    passwords?: string[]; // If count > 1
}

// In-memory cache for word lists
const wordsCache = new Map<number, string[]>();

/**
 * Loads words of a specific character length from file (with in-memory caching).
 */
export async function getWordsForLength(length: number): Promise<string[]> {
    if (wordsCache.has(length)) {
        return wordsCache.get(length)!;
    }

    const candidatePaths = [
        path.join(process.cwd(), "public", "word-lists", `${length}-harfli-kelimeler.txt`),
        path.join(process.cwd(), "lib", "word-lists", `${length}-harfli-kelimeler.txt`),
    ];

    for (const filePath of candidatePaths) {
        try {
            const content = await fs.readFile(filePath, "utf-8");
            const words = content
                .split(/\r?\n/)
                .map(w => w.trim())
                .filter(w => w.length > 0);

            if (words.length > 0) {
                wordsCache.set(length, words);
                return words;
            }
        } catch {
            // Try next candidate path
        }
    }

    console.error(`Wordlist file for length ${length} not found.`);
    return [];
}

/**
 * Returns available wordlist stats (counts per length and total).
 */
export async function getWordlistStats(): Promise<{
    totalWords: number;
    availableWordLengths: number[];
    wordCounts: Record<number, number>;
}> {
    const availableWordLengths = [3, 4, 5, 6, 7, 8, 9, 10];
    const wordCounts: Record<number, number> = {};
    let totalWords = 0;

    for (const len of availableWordLengths) {
        const words = await getWordsForLength(len);
        wordCounts[len] = words.length;
        totalWords += words.length;
    }

    return {
        totalWords,
        availableWordLengths,
        wordCounts
    };
}

/**
 * Picks a random word from the provided list.
 */
function getRandomWord(words: string[]): string {
    return words[Math.floor(Math.random() * words.length)];
}

/**
 * Applies capitalization transformation to a word.
 */
function applyCasing(word: string, casing: "none" | "first" | "all" | "random"): string {
    if (casing === "none") return word.toLowerCase();
    if (casing === "all") return word.toUpperCase();
    if (casing === "first") {
        if (!word) return "";
        return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    }
    if (casing === "random") {
        return Math.random() > 0.5
            ? word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
            : word.toLowerCase();
    }
    return word;
}

/**
 * Evaluates password strength based on length, unique characters, numbers, and special symbols.
 */
export function calculatePasswordStrength(password: string): {
    strength: "Zayıf" | "Orta" | "Güçlü" | "Çok Güçlü";
    strengthScore: number;
} {
    const totalChars = password.length;
    const uniqueChars = new Set(password.toLowerCase()).size;
    const hasNumbers = /\d/.test(password);
    const hasSpecialChars = /[^a-zA-ZğüşıöçĞÜŞİÖÇ\d\s]/.test(password);
    const hasUpper = /[A-ZĞÜŞİÖÇ]/.test(password);
    const hasLower = /[a-zğüşıöç]/.test(password);

    let score = 0;

    // Length points
    if (totalChars >= 24) score += 40;
    else if (totalChars >= 18) score += 30;
    else if (totalChars >= 12) score += 20;
    else if (totalChars >= 8) score += 10;

    // Uniqueness points
    if (uniqueChars >= 14) score += 25;
    else if (uniqueChars >= 10) score += 20;
    else if (uniqueChars >= 6) score += 12;
    else score += 5;

    // Character variety
    if (hasNumbers) score += 15;
    if (hasSpecialChars) score += 15;
    if (hasUpper && hasLower) score += 10;

    score = Math.min(100, Math.max(10, score));

    let strength: "Zayıf" | "Orta" | "Güçlü" | "Çok Güçlü" = "Zayıf";
    if (score >= 85 || (totalChars >= 20 && uniqueChars >= 10)) {
        strength = "Çok Güçlü";
    } else if (score >= 65 || (totalChars >= 15 && uniqueChars >= 8)) {
        strength = "Güçlü";
    } else if (score >= 40 || (totalChars >= 10 && uniqueChars >= 6)) {
        strength = "Orta";
    }

    return { strength, strengthScore: score };
}

/**
 * Generates one or more passwords according to options.
 */
export async function generateWordlistPassword(
    options: GeneratePasswordOptions = {}
): Promise<GeneratedPasswordResult> {
    const {
        wordCount = 3,
        wordLengths = [5, 6, 7],
        separator = "-",
        capitalize = "none",
        includeNumber = false,
        count = 1
    } = options;

    // Validation
    const cleanWordCount = Math.max(1, Math.min(20, Math.round(wordCount)));
    const cleanCount = Math.max(1, Math.min(50, Math.round(count)));

    if (!Array.isArray(wordLengths) || wordLengths.length === 0) {
        throw new Error("En az bir kelime uzunluğu belirtmelisiniz.");
    }

    const validLengths = wordLengths.filter(l => typeof l === "number" && l >= 3 && l <= 10);
    if (validLengths.length === 0) {
        throw new Error("Kelime uzunlukları 3 ile 10 arasında olmalıdır.");
    }

    // Preload words for the selected lengths
    const wordsByLength = new Map<number, string[]>();
    for (const len of validLengths) {
        const words = await getWordsForLength(len);
        if (words.length === 0) {
            throw new Error(`${len} harfli kelimeler bulunamadı.`);
        }
        wordsByLength.set(len, words);
    }

    const generatedList: { password: string; words: string[]; wordLengths: number[] }[] = [];

    for (let c = 0; c < cleanCount; c++) {
        const selectedWords: string[] = [];
        const chosenLengths: number[] = [];

        for (let i = 0; i < cleanWordCount; i++) {
            const randomLength = validLengths[Math.floor(Math.random() * validLengths.length)];
            const list = wordsByLength.get(randomLength)!;
            const word = getRandomWord(list);

            const styledWord = applyCasing(word, capitalize);
            selectedWords.push(styledWord);
            chosenLengths.push(styledWord.length);
        }

        let pwd = selectedWords.join(separator);

        if (includeNumber) {
            const randomNum = Math.floor(Math.random() * 90 + 10); // 10 - 99
            pwd = `${pwd}${separator}${randomNum}`;
        }

        generatedList.push({
            password: pwd,
            words: selectedWords,
            wordLengths: chosenLengths
        });
    }

    const primary = generatedList[0];
    const { strength, strengthScore } = calculatePasswordStrength(primary.password);

    return {
        password: primary.password,
        words: primary.words,
        wordCount: primary.words.length,
        totalLength: primary.password.length,
        strength,
        strengthScore,
        separator,
        wordLengths: primary.wordLengths,
        ...(cleanCount > 1 ? { passwords: generatedList.map(g => g.password) } : {})
    };
}
