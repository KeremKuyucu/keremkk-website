import { webcrypto } from 'node:crypto';

const crypto = globalThis.crypto || webcrypto;
const PBKDF2_ITERATIONS = 200_000;

function uint8ToHex(u8) {
    return Array.from(u8).map(b => b.toString(16).padStart(2, '0')).join('');
}

async function pbkdf2Hash(password, salt) {
    const enc = new TextEncoder();
    const keyMaterial = await crypto.subtle.importKey(
        "raw",
        enc.encode(password),
        { name: "PBKDF2" },
        false,
        ["deriveBits"]
    );
    const bits = await crypto.subtle.deriveBits(
        {
            name: "PBKDF2",
            salt: salt,
            iterations: PBKDF2_ITERATIONS,
            hash: "SHA-256",
        },
        keyMaterial,
        256
    );
    return new Uint8Array(bits);
}

const password = process.argv[2];
if (!password) {
    console.error("Lütfen bir şifre girin: node scripts/generate-auth-secret.mjs <sifreniz>");
    process.exit(1);
}

console.log("Şifre oluşturuluyor (biraz sürebilir)...");

const salt = crypto.getRandomValues(new Uint8Array(16));
const hash = await pbkdf2Hash(password, salt);

const saltHex = uint8ToHex(salt);
const hashHex = uint8ToHex(hash);

console.log(`\n✅ Oluşturuldu! Aşağıdaki satırı .env.local dosyanıza ekleyin:\n`);
console.log(`SYNC_PASSWORD="${saltHex}:${hashHex}"`);
console.log(`\n(Bu şifreyi request header'ında 'x-sync-password' olarak kullanacaksınız)`);
