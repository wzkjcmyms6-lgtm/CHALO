/** SHA-256 hex del texto (con respaldo simple si crypto.subtle no está disponible). */
export async function sha256(text) {
  if (globalThis.crypto?.subtle) {
    const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
    return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');
  }
  let h = 5381;
  for (const c of text) h = ((h << 5) + h + c.charCodeAt(0)) | 0;
  return `fallback-${h}`;
}

export const SEED_USER = { username: 'Chalo', password: '130602' };
