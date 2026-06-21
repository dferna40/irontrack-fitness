export function repairTextEncoding(value: string): string;
export function repairTextEncoding(value: null): null;
export function repairTextEncoding(value: undefined): undefined;
export function repairTextEncoding(value: string | null | undefined): string | null | undefined;
export function repairTextEncoding(value: string | null | undefined) {
  if (value === null || value === undefined) {
    return value;
  }

  let nextValue = value;

  if (/[ÃÂ]/.test(nextValue)) {
    try {
      const bytes = Uint8Array.from([...nextValue].map((character) => character.charCodeAt(0)));
      const decoded = new TextDecoder("utf-8").decode(bytes);

      if (decoded && !decoded.includes("\uFFFD")) {
        nextValue = decoded;
      }
    } catch {
      // Keep the original value if decoding fails.
    }
  }

  return nextValue.replaceAll("Â·", "·");
}

export function normalizeTextKey(value: string | null | undefined) {
  const repaired = value == null ? value : repairTextEncoding(value);

  return (repaired ?? "")
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .trim()
    .toLocaleLowerCase("es");
}
