'use client';
export default function CookiePreferencesButton() {
  return <button className="text-sm underline hover:text-teal" onClick={() => window.dispatchEvent(new Event('open-cookie-preferences'))}>Cookie preferences</button>;
}
