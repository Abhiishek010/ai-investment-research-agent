const BLOCKED_HTML_BLOCKS = /<(script|style|iframe|object|embed|svg|math)\b[^>]*>[\s\S]*?<\/\1>/gi;
const HTML_TAG = /<[^>]*>/g;
const LEFTOVER_ANGLE_BRACKETS = /[<>]/g;
const CONTROL_CHARACTERS = /[\u0000-\u001F\u007F]/g;
const WHITESPACE = /\s+/g;

export const MAX_COMPANY_NAME_LENGTH = 80;

export function sanitizeCompanyNameInput(value: string) {
  return value
    .normalize("NFKC")
    .replace(BLOCKED_HTML_BLOCKS, " ")
    .replace(HTML_TAG, " ")
    .replace(LEFTOVER_ANGLE_BRACKETS, " ")
    .replace(CONTROL_CHARACTERS, " ")
    .replace(WHITESPACE, " ")
    .trim()
    .slice(0, MAX_COMPANY_NAME_LENGTH);
}
