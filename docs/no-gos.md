# No-Gos & Branchen-Ampel

Was Techsaar nicht macht bzw. nur mit besonderer Vorsicht. Vor jeder Kundenannahme prüfen ([workflow-neuer-kunde](workflow-neuer-kunde.md) Schritt 1). Verwandt: [recht-checkliste-website](recht-checkliste-website.md).

## Harte No-Gos (Aufträge ablehnen)

- **Glücksspiel, Erotik/Adult, Waffen** — Abmahn-/Lizenzminenfeld, passt nicht zur Marke
- **Krypto-/Anlageversprechen, "Trading-Coaches", MLM/Network-Marketing** — Seriositäts- und BaFin-Risiko
- **Alles mit Heilversprechen** ("heilt", "garantiert schmerzfrei") — Verstoß gegen HWG, Abmahnung fast sicher
- **Fake-Bewertungen** schreiben/kaufen oder Bewertungs-Gating (nur zufriedene Kunden zum Bewerten schicken, unzufriedene abfangen) — verstößt gegen UWG, Google straft ab
- **Garantien für Rankings** ("Platz 1 bei Google") — können wir nicht halten, niemals versprechen
- **Texte/Bilder/Designs von anderen Websites kopieren** — Urheberrecht
- **Kundendaten in öffentliche Repos** oder in diesen Vault (der Vault enthält Wissen, keine personenbezogenen Kundendaten außer Firmenkontakt)
- **Ohne schriftliche Beauftragung anfangen** — kein Handschlag-Projekt

## Gelbe Ampel (möglich, aber erst recherchieren)

| Branche | Warum Vorsicht | Bedingung |
|---|---|---|
| Ärzte, Heilpraktiker, Physio, Kosmetik | HWG: enge Grenzen für Werbung, keine Vorher-Nachher-Bilder bei bestimmten Eingriffen, keine Erfolgsversprechen | Nur sachliche Info-Website, Formulierungen doppelt prüfen |
| Anwälte, Steuerberater | Berufsordnungen regeln Werbung | Kunde muss Texte selbst verantworten/freigeben |
| Gastronomie | Allergene/Zusatzstoffe bei Online-Speisekarte, Preisangaben | Speisekarte nur als vom Kunden geliefertes PDF o. mit Kennzeichnung |
| Finanz-/Versicherungsmakler | Erlaubnispflichten (§ 34d/f GewO), Pflichtangaben | Pflichtangaben vom Kunden schriftlich einfordern |
| Tabak, E-Zigaretten, Alkohol | Werbebeschränkungen | Zurückhaltende Darstellung, keine Werbeversprechen |
| Online-Shops | Widerruf, AGB, Buttonlösung, BFSG voll anwendbar | Nur mit expliziter Vorbereitung, nicht "nebenbei" |

## Grüne Ampel (unser Kerngeschäft)

Handwerker (Dachdecker, Maler, Sanitär …), Gastro-Basics (Visitenkarten-Website), Friseur/Barbershop, Eisdiele, Einzelhandel, Vereine, Dienstleister ohne Regulierung. Genau dafür sind die Demos gebaut.

## Interne No-Gos (Arbeitsweise)

- Keine Tokens/Passwörter/Cookies in den Vault oder in Repos (den Arbeitsregeln der Claude-Instanzen)
- Keine Deployments auf Kundendomains ohne Freigabe des Kunden
- Nichts löschen/überschreiben beim Kunden ohne Backup
- Keine E-Mails/Nachrichten im Namen von Techsaar automatisch versenden ohne dass Leon sie gesehen hat
