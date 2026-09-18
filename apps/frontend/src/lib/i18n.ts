export function getLanguageName(locale: string): string {
  try {
    const nativeName = new Intl.DisplayNames([locale], { type: 'language' }).of(locale);
    if (nativeName) {
      return nativeName.charAt(0).toUpperCase() + nativeName.slice(1);
    }
  } catch {
    // fall through to uppercased code
  }
  return locale.toUpperCase();
}
