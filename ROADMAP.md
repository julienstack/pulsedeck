# 🚀 PulseDeck Roadmap

> **Letzte Aktualisierung:** 20. Januar 2026  
> **Aktuelle Version:** Alpha 0.9.1

---

## 📋 Was ist diese Seite?

Diese Roadmap zeigt dir, welche Features geplant sind, woran gerade gearbeitet wird und was bereits umgesetzt wurde. Du kannst hier den Fortschritt von PulseDeck verfolgen!

---

## 🎯 Aktueller Fokus: Mobilisierung

*"Die Hürde von 'Ich lese nur mit' zu 'Ich mache mit' so niedrig wie möglich legen."*

---

## 🚧 Aktuell in Arbeit

*(Wähle das nächste Feature aus Phase 2)*

---

## 📅 Mobilisierungs-Features (Priorisiert)

### Phase 1: Basis ⭐⭐⭐

| # | Feature | Status | Beschreibung |
|---|---------|--------|--------------|
| 1 | **Skill-Tagging** | ✅ Fertig | Mitglieder taggen ihre Fähigkeiten |
| 2 | **Admin-Einstellungen** | ✅ Fertig | Zentraler Admin-Bereich für Skills, Newsletter, Org-Settings |
| 3 | **Org erstellen** | ✅ Fertig | Eingeloggte User können neue Orgs erstellen |
| 4 | **Event-Helfer-Slots** | ✅ Fertig | Events mit Schichtplan |
| 5 | **Admin-Filter** | ✅ Fertig | Vorstand filtert nach Skills/Ort |

### Phase 2: Engagement ⭐⭐

| # | Feature | Status | Beschreibung |
|---|---------|--------|--------------|
| 6 | **Push-Notifications** | 🏃 In Arbeit | Zielgruppen-Push (Basis & UI steht) |
| 7 | **Mikro-Umfragen** | ⏳ Geplant | Schnelle 2-Klick Abstimmungen im Feed |
| 8 | **Teilnehmerlisten** | ⏳ Geplant | Social Proof: "Max und Julia sind dabei" |
| 9 | **One-Click Teilnahme** | ⏳ Geplant | "Ich bin dabei" Button ohne Formular |

### Phase 3: Community ⭐

| # | Feature | Status | Beschreibung |
|---|---------|--------|--------------|
| 10 | **Biete/Suche Brett** | ⏳ Geplant | Mitfahrgelegenheiten, Hilfsanfragen |
| 11 | **Auto-Danke System** | ⏳ Geplant | Automatische Wertschätzung nach Events |

---

## ✅ Abgeschlossen (Patch Notes)

### v0.9.1 – 20. Januar 2026

**🐛 Bugfixes & Stability**
- [x] **Wiki Critical Fix:** Absturz beim Laden behoben (fehlende `organization_id` Spalte)
- [x] **UI Logic Fix:** Sichergestellt, dass `organization_id` und `author` beim Speichern immer gesetzt sind
- [x] **Multi-Tenancy:** Wiki-Artikel sind nun korrekt Mandanten-fähig (`organization_id`, `working_group_id`)
- [x] **Daten-Integrität:** DB-Migration für striktere Wiki-Constraints angewendet

### v0.9.0 – 19. Januar 2026

**🛡️ Sicherheit & Audit**
- [x] **System Audit Logs:** Lückenlose Protokollierung aller Änderungen für Super-Admins
- [x] **Audit Browser:** Neuer Bereich für Logs mit JSON-Diff-Ansicht
- [x] **Security:** Row Level Security (RLS) policies für sensible Log-Daten

**📱 Mobile & UX**
- [x] **Smart Navigation:** Sidebar schließt sich automatisch bei Navigation, bleibt bei Interaktion offen
- [x] **Responsive Footer:** Optimiertes Design für Mobile (Platz freigegeben, Badge integriert)
- [x] **Feedback Integration:** Bessere Erreichbarkeit über Footer-Buttons auf Mobilgeräten

### v0.8.0 – 19. Januar 2026

**📢 Engagement Layer**
- [x] Landing Page Refactoring (UX/Subtle Design)
- [x] Made in EU / Datensouveränität Branding
- [x] Push Notification Service & UI (Opt-In/Settings)
- [x] Onboarding Widget für neue Mitglieder
- [x] Donation Integration (Buy me a coffee)

### v0.7.1 – 19. Januar 2026

**🔍 Admin & Mitglieder Filter**
- [x] Erweiterte Mitglieder-Suche
- [x] Filter nach Skills, Interessen & Verfügbarkeit
- [x] Geografische Suche (PLZ/Ort)
- [x] Performance-Optimierung (Bulk-Load)

### v0.7.0 – 18. Januar 2026

**🏷️ Skill-Tagging & Admin-Bereich**
- [x] Skills-Datenbank (`skills`, `member_skills` Tabellen)
- [x] Profil-Editor mit Skill-Auswahl (Chips/Tags)
- [x] Kategorien: Fähigkeiten, Interessen, Verfügbarkeit
- [x] Zentraler Admin-Bereich `/dashboard/settings`
- [x] Skills verwalten (CRUD) im Admin
- [x] Newsletter-Konfiguration (SMTP, Design, Zeitplan)
- [x] Organisations-Einstellungen (Name, Logo, Farbe)
- [x] Organisations-Erstellung für eingeloggte User

---

## 💡 Feature-Wünsche

Hast du eine Idee? Nutze den **Feedback-Button** (Alpha-Badge) oder melde dich beim Entwickler-Team!

---
