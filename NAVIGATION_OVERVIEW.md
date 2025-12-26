# Navigation-Übersicht: Buttons und Links im Frontend

Diese Übersicht listet alle Buttons und Links auf, die zu Navigationen führen, sowie deren Ziel-URLs.

## Legende

- **Typ**: `Link` = Next.js Link-Komponente, `router.push/replace` = Programmatische Navigation, `window.location` = Browser-Navigation, `redirect` = Server-Side Redirect, `a href` = Standard HTML-Link
- **Ziel**: Die Ziel-URL oder Route
- **Hinweis**: Besondere Anmerkungen oder Bedingungen

---

## Startseite (`app/page.tsx`)

| Zeile | Typ | Label/Text | Ziel | Hinweis |
|-------|-----|------------|------|---------|
| 130 | Link | "Jetzt kostenlos testen" | `/auth` | Hero CTA |
| 133 | Link | "Wie es funktioniert" | `#wie-es-funktioniert` | Anchor-Link auf derselben Seite |
| 223 | Link | "Erste Klausur kostenlos testen" | `/auth` | In "Mit KorrekturPilot" Card |
| 299 | Link | "→ Detaillierte Upload-Anleitung" | `/hilfe-upload` | In Schritt 2 der Timeline |
| 310 | Link | "Jetzt kostenlos testen" | `/auth` | Nach Timeline |
| 426 | Link | "Kostenlos testen (0 €)" | `/auth` | Pricing Card 1 |
| 474 | Link | "Jetzt kaufen (7,90 €)" | `/upload` | Pricing Card 2 (Beta-Angebot) |
| 529 | Link | "Datenschutzerklärung" | `/datenschutz` | In FAQ-Text |
| 565 | a | "kontakt@korrekturpilot.de" | `mailto:kontakt@korrekturpilot.de` | E-Mail-Link |
| 567 | Link | "Jetzt kostenlos testen" | `/auth` | Nach FAQ |
| 598 | Link | "Zum Beta-Angebot" | `#pricing` | Anchor-Link auf derselben Seite |
| 618 | a | "kontakt@korrekturpilot.de" | `mailto:kontakt@korrekturpilot.de` | E-Mail-Link |
| 624 | a | "kontakt@korrekturpilot.de" | `mailto:kontakt@korrekturpilot.de` | E-Mail-Link |
| 639 | Link | "Erste Klausur kostenlos testen" | `/auth` | CTA-Section |

---

## Dashboard (`app/dashboard/page.tsx`)

| Zeile | Typ | Label/Text | Ziel | Hinweis |
|-------|-----|------------|------|---------|
| 78 | Link | "Neue Korrektur starten" | `/correction` | CTA Button |
| 114 | Link | "Abonnement wählen" / "Plan ändern" | `/checkout` | Credits & Abonnement Section |
| 124 | Link | "Zu den Ergebnissen" | `/results` | Link in "Letzte Korrekturen" Header |

---

## Korrektur-Seite (`app/correction/page.tsx`)

| Zeile | Typ | Label/Text | Ziel | Hinweis |
|-------|-----|------------|------|---------|
| 312 | router.push | (automatisch) | `/results` | Redirect nach Analyse-Abschluss |
| 575 | window.location.href | (automatisch) | `/results` | Hard Redirect nach Analyse-Abschluss |

---

## Ergebnisse-Seite (`app/results/page.tsx`)

| Zeile | Typ | Label/Text | Ziel | Hinweis |
|-------|-----|------------|------|---------|
| 126 | button | "Aktualisieren" | (keine Navigation) | Lädt Ergebnisse neu |

**Hinweis**: Die Buttons "Details" öffnen einen Drawer (keine Navigation), "Details anzeigen" öffnet ebenfalls einen Drawer.

---

## Beispielauswertung (`app/beispielauswertung/page.tsx`)

| Zeile | Typ | Label/Text | Ziel | Hinweis |
|-------|-----|------------|------|---------|
| 66 | Link | "Jetzt kostenlos testen →" | `/auth` | In Warn-Banner |
| 175 | Link | "Jetzt kostenlos testen" | `/auth` | CTA am Ende der Seite |

---

## Profil (`app/profil/page.tsx`)

| Zeile | Typ | Label/Text | Ziel | Hinweis |
|-------|-----|------------|------|---------|
| - | - | (keine direkten Links) | - | Navigation erfolgt über Tabs (keine URL-Änderung) |

---

## Upload (`app/upload/page.tsx`)

| Zeile | Typ | Label/Text | Ziel | Hinweis |
|-------|-----|------------|------|---------|
| 4 | redirect | (automatisch) | `/correction#klausur-step` | Server-Side Redirect |

---

## Checkout (`app/checkout/page.tsx`)

| Zeile | Typ | Label/Text | Ziel | Hinweis |
|-------|-----|------------|------|---------|
| 153 | window.location.href | (automatisch) | Stripe Checkout URL | Weiterleitung zu Stripe |

---

## Checkout Success (`app/checkout/success/page.tsx`)

| Zeile | Typ | Label/Text | Ziel | Hinweis |
|-------|-----|------------|------|---------|
| 35 | router.push | (automatisch) | `/dashboard` | Nach 2 Sekunden |

---

## Checkout Cancel (`app/checkout/cancel/page.tsx`)

| Zeile | Typ | Label/Text | Ziel | Hinweis |
|-------|-----|------------|------|---------|
| 33 | Link | "Erneut versuchen" | `/checkout` | |
| 36 | Link | "Zur Startseite" | `/` | |

---

## Reset Password (`app/reset-password/page.tsx`)

| Zeile | Typ | Label/Text | Ziel | Hinweis |
|-------|-----|------------|------|---------|
| 29 | router.push | (automatisch) | `/` | Bei ungültiger Session |
| 85 | router.push | (automatisch) | `/dashboard` | Nach erfolgreichem Reset |
| 121 | button | "Zur Startseite" | `/` | onClick mit router.push |
| 206 | button | "Zurück zur Startseite" | `/` | onClick mit router.push |

---

## Not Found (`app/not-found.tsx`)

| Zeile | Typ | Label/Text | Ziel | Hinweis |
|-------|-----|------------|------|---------|
| 21 | Link | "Zur Startseite" | `/` | |
| 25 | Link | "Preise" | `/#pricing` | Anchor-Link |
| 28 | Link | "FAQ" | `/#faq` | Anchor-Link |
| 31 | Link | "So funktioniert's" | `/#wie-es-funktioniert` | Anchor-Link |
| 34 | a | "Kontakt" | `mailto:kontakt@korrekturpilot.de` | E-Mail-Link |

---

## Hilfe Upload (`app/hilfe-upload/page.tsx`)

| Zeile | Typ | Label/Text | Ziel | Hinweis |
|-------|-----|------------|------|---------|
| 60 | a | "Adobe Scan" | `https://www.adobe.com/de/acrobat/mobile/scanner-app.html` | Externer Link (target="_blank") |
| 61 | a | "Google Drive" | `https://www.google.com/drive/` | Externer Link (target="_blank") |
| 164 | a | "kontakt@korrekturpilot.de" | `mailto:kontakt@korrekturpilot.de` | E-Mail-Link |
| 169 | Link | "Zurück zur Startseite" | `/` | |
| 172 | Link | "Jetzt kostenlos testen" | `/auth` | |

---

## Datenschutz (`app/datenschutz/page.tsx`)

| Zeile | Typ | Label/Text | Ziel | Hinweis |
|-------|-----|------------|------|---------|
| 26 | a | "kontakt@korrekturpilot.de" | `mailto:kontakt@korrekturpilot.de` | E-Mail-Link |
| 96 | a | "kontakt@korrekturpilot.de" | `mailto:kontakt@korrekturpilot.de` | E-Mail-Link |
| 135 | a | "https://www.ldi.nrw.de" | `https://www.ldi.nrw.de` | Externer Link (target="_blank") |
| 155 | a | "kontakt@korrekturpilot.de" | `mailto:kontakt@korrekturpilot.de` | E-Mail-Link |
| 160 | Link | "Zurück zur Startseite" | `/` | |

---

## AGB (`app/agb/page.tsx`)

| Zeile | Typ | Label/Text | Ziel | Hinweis |
|-------|-----|------------|------|---------|
| 96 | a | "kontakt@korrekturpilot.de" | `mailto:kontakt@korrekturpilot.de` | E-Mail-Link |
| 106 | Link | "Datenschutzerklärung" | `/datenschutz` | |
| 126 | a | "kontakt@korrekturpilot.de" | `mailto:kontakt@korrekturpilot.de` | E-Mail-Link |
| 163 | a | "kontakt@korrekturpilot.de" | `mailto:kontakt@korrekturpilot.de` | E-Mail-Link |
| 168 | Link | "Zurück zur Startseite" | `/` | |

---

## Impressum (`app/impressum/page.tsx`)

| Zeile | Typ | Label/Text | Ziel | Hinweis |
|-------|-----|------------|------|---------|
| 30 | a | "peterka@gannaca.com" | `mailto:peterka@gannaca.com` | E-Mail-Link |
| 33 | a | "https://www.gannaca.com" | `https://www.gannaca.com` | Externer Link (target="_blank") |
| 88 | a | "https://www.gannaca.com" | `https://www.gannaca.com` | Externer Link (target="_blank") |

---

## App Header (`components/AppHeader.tsx`)

| Zeile | Typ | Label/Text | Ziel | Hinweis |
|-------|-----|------------|------|---------|
| 73 | Link | Logo "KorrekturPilot" | `/` | Logo-Link |
| 108-118 | Link | Navigation Links (dynamisch) | Siehe unten | |

**Navigation Links (eingeloggt):**
- `/correction` - "Korrektur starten"
- `/results` - "Ergebnisse"
- `/dashboard` - "Dashboard"
- `/profil` - "Profil"

**Navigation Links (nicht eingeloggt):**
- `#wie-es-funktioniert` - "So funktioniert's"
- `#pricing` - "Preise"
- `#faq` - "FAQ"

---

## App Footer (`components/AppFooter.tsx`)

| Zeile | Typ | Label/Text | Ziel | Hinweis |
|-------|-----|------------|------|---------|
| 14 | Link | "Impressum" | `/impressum` | |
| 15 | Link | "Datenschutzerklärung" | `/datenschutz` | |
| 16 | Link | "AGB (Beta)" | `/agb` | |
| 17 | Link | "Preise & Lizenzen" | `/checkout` | |
| 18 | Link | "Beispielauswertung" | `/beispielauswertung` | |
| 19 | a | "Kontakt" | `mailto:kontakt@korrekturpilot.de` | E-Mail-Link |

---

## Auth Button (`components/AuthButton.tsx`)

| Zeile | Typ | Label/Text | Ziel | Hinweis |
|-------|-----|------------|------|---------|
| 78 | (OAuth) | Google Sign-In | `/auth/callback` | Redirect nach OAuth |
| 103 | router.push | (automatisch) | `/` | Nach Sign-Out |

**Hinweis**: Die Buttons "Login" und "Jetzt starten" öffnen ein Modal (keine direkte Navigation).

---

## Auth Form (`components/AuthForm.tsx`)

| Zeile | Typ | Label/Text | Ziel | Hinweis |
|-------|-----|------------|------|---------|
| 32 | (Email) | Password Reset | `/auth/callback?next=/reset-password` | Redirect nach E-Mail-Bestätigung |
| 58 | (Email) | Sign Up | `/auth/callback?next=/dashboard` | Redirect nach E-Mail-Bestätigung |
| 73 | router.push | (automatisch) | `/dashboard?welcome=true` | Fallback nach Sign-Up |
| 108 | router.push | (automatisch) | `/dashboard` | Fallback nach Login |

---

## Welcome Banner (`components/WelcomeBanner.tsx`)

| Zeile | Typ | Label/Text | Ziel | Hinweis |
|-------|-----|------------|------|---------|
| 18 | router.replace | (automatisch) | `/dashboard` | Entfernt URL-Parameter |
| 49 | Link | "Jetzt testen →" | `/correction` | CTA Button |

---

## Buy Credits Button (`components/BuyCreditsButton.tsx`)

| Zeile | Typ | Label/Text | Ziel | Hinweis |
|-------|-----|------------|------|---------|
| 33 | window.location.href | (automatisch) | Stripe Checkout URL | Weiterleitung zu Stripe |

---

## Credits Display (`components/CreditsDisplay.tsx`)

| Zeile | Typ | Label/Text | Ziel | Hinweis |
|-------|-----|------------|------|---------|
| 122 | Link | "Mehr kaufen" | `/checkout` | Wenn credits < 5 |
| 147 | Link | "Jetzt 25 Klausuren für €7.90 kaufen →" | `/checkout` | Wenn keine Credits |

---

## Dashboard Credits Card (`components/DashboardCreditsCard.tsx`)

| Zeile | Typ | Label/Text | Ziel | Hinweis |
|-------|-----|------------|------|---------|
| 35 | Link | "Mehr kaufen →" | `/checkout` | Wenn credits < 5 |
| 52 | Link | "Mehr kaufen →" | `/checkout` | Wenn credits < 5 |
| 69 | Link | "25 Klausuren für €7.90 kaufen →" | `/checkout` | Wenn keine Credits |

---

## Protected Route (`components/ProtectedRoute.tsx`)

| Zeile | Typ | Label/Text | Ziel | Hinweis |
|-------|-----|------------|------|---------|
| 41 | router.push | (automatisch) | `/` | Bei fehlender Authentifizierung |
| 47 | router.push | (automatisch) | `/` | Bei fehlender Authentifizierung |
| 55 | router.push | (automatisch) | `/` | Bei fehlender Authentifizierung |
| 60 | router.push | (automatisch) | `/` | Bei fehlender Authentifizierung |
| 68 | router.push | (automatisch) | `/` | Bei Fehler |

---

## Checkout Session Handler (`components/CheckoutSessionHandler.tsx`)

| Zeile | Typ | Label/Text | Ziel | Hinweis |
|-------|-----|------------|------|---------|
| 95 | router.replace | (automatisch) | `/dashboard` | Nach Session-Refresh |
| 100 | router.replace | (automatisch) | `/dashboard` | Bei Fehler |

---

## Cookie Banner (`components/CookieBanner.tsx`)

| Zeile | Typ | Label/Text | Ziel | Hinweis |
|-------|-----|------------|------|---------|
| 75 | Link | "Mehr Informationen in der Datenschutzerklärung" | `/datenschutz` | |

---

## Corrections List (`components/dashboard/CorrectionsList.tsx`)

| Zeile | Typ | Label/Text | Ziel | Hinweis |
|-------|-----|------------|------|---------|
| 101 | Link | "Details ansehen" | `/results?id=${correction.id}` | |
| 107 | Link | "📥 Feedback herunterladen" | `/api/download/${correction.id}` | API-Endpoint |
| 152 | Link | "Zu den Ergebnissen →" | `/results` | |
| 162 | Link | "Neue Korrektur starten" | `/correction` | Empty State |

---

## Corrections Timeline (`components/dashboard/CorrectionsTimeline.tsx`)

| Zeile | Typ | Label/Text | Ziel | Hinweis |
|-------|-----|------------|------|---------|
| 121 | Link | "Details ansehen" | `/results?id=${correction.id}` | |
| 128 | Link | "📥 Feedback herunterladen" | `/api/download/${correction.id}` | API-Endpoint |
| 169 | Link | "Zu den Ergebnissen →" | `/results` | |
| 182 | Link | "Neue Korrektur starten" | `/correction` | Empty State |

---

## Credits Card (`components/dashboard/CreditsCard.tsx`)

| Zeile | Typ | Label/Text | Ziel | Hinweis |
|-------|-----|------------|------|---------|
| 84 | Link | "Credits kaufen" | `/checkout` | |
| 90 | Link | "Beta-Angebot" | `/checkout#beta-angebot` | Anchor-Link |

---

## Feedback Preview Modal (`components/beispielauswertung/FeedbackPreviewModal.tsx`)

| Zeile | Typ | Label/Text | Ziel | Hinweis |
|-------|-----|------------|------|---------|
| 518 | Link | "Jetzt kostenlos testen" | `/auth` | Nur im Demo-Mode |

**Hinweis**: Der Button "Schülerfeedback herunterladen" führt zu einem Download (keine Navigation).

---

## Expectation Page (`app/expectation/page.tsx`)

| Zeile | Typ | Label/Text | Ziel | Hinweis |
|-------|-----|------------|------|---------|
| 4 | redirect | (automatisch) | `/correction#expectation-step` | Server-Side Redirect |

---

## Zusammenfassung nach Ziel-URL

### Interne Routen

- `/` - Startseite (15 Links)
- `/auth` - Auth-Seite (10 Links)
- `/dashboard` - Dashboard (5 Links, 3 automatische Redirects)
- `/correction` - Korrektur starten (4 Links, 2 automatische Redirects)
- `/results` - Ergebnisse (4 Links)
- `/profil` - Profil (keine direkten Links)
- `/checkout` - Checkout (8 Links, 1 automatische Redirect)
- `/beispielauswertung` - Beispielauswertung (2 Links)
- `/hilfe-upload` - Upload-Hilfe (2 Links)
- `/datenschutz` - Datenschutz (1 Link)
- `/agb` - AGB (1 Link)
- `/impressum` - Impressum (keine Links)
- `/reset-password` - Passwort zurücksetzen (2 automatische Redirects, 2 Buttons)
- `/upload` - Upload (1 automatischer Redirect)
- `/expectation` - Erwartungshorizont (1 automatischer Redirect)

### Anchor-Links (auf derselben Seite)

- `#wie-es-funktioniert` - 2 Links
- `#pricing` - 2 Links
- `#faq` - 1 Link
- `#beta-angebot` - 1 Link
- `#klausur-step` - 1 Redirect
- `#expectation-step` - 1 Redirect

### Externe Links

- `mailto:kontakt@korrekturpilot.de` - 10 Links
- `mailto:peterka@gannaca.com` - 1 Link
- `https://www.adobe.com/de/acrobat/mobile/scanner-app.html` - 1 Link
- `https://www.google.com/drive/` - 1 Link
- `https://www.ldi.nrw.de` - 1 Link
- `https://www.gannaca.com` - 2 Links
- Stripe Checkout URLs - 2 automatische Redirects

### API-Endpoints (keine Navigation, aber erwähnt)

- `/api/download/${correction.id}` - 2 Links (Download)
- `/auth/callback` - 2 automatische Redirects (OAuth/Email)

---

## Besondere Fälle / Unklare Ziele

### Buttons ohne klare Navigation

1. **`app/results/page.tsx` Zeile 126**: Button "Aktualisieren" - Lädt nur Daten neu, keine Navigation
2. **`components/dashboard/CorrectionsList.tsx` Zeile 125**: Button "🔄 Erneut versuchen" - TODO: Retry-Logik (keine Navigation implementiert)
3. **`components/dashboard/CorrectionsTimeline.tsx` Zeile 141**: Button "🔄 Erneut versuchen" - TODO: Retry-Logik (keine Navigation implementiert)

### Potenzielle Probleme

1. **`app/page.tsx` Zeile 474**: Link zu `/upload` - Diese Route redirectet zu `/correction#klausur-step`. Sollte direkt zu `/correction` verlinken?
2. **`components/dashboard/CorrectionsList.tsx` Zeile 101**: Link zu `/results?id=${correction.id}` - Die Results-Seite verwendet keine Query-Parameter für einzelne Ergebnisse. Funktioniert das wie erwartet?
3. **`components/dashboard/CorrectionsTimeline.tsx` Zeile 121**: Gleiche Problematik wie oben.

---

## Empfehlungen

1. **Konsistenz prüfen**: Alle Links zu `/upload` sollten zu `/correction` führen, da `/upload` nur ein Redirect ist.
2. **Query-Parameter validieren**: Die Links mit `?id=` sollten überprüft werden, ob die Results-Seite diese Parameter auch verwendet.
3. **Retry-Logik implementieren**: Die "Erneut versuchen" Buttons in den Dashboard-Komponenten haben noch keine Funktionalität.







