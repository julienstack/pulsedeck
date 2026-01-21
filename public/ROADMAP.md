# 🚀 Lexion Roadmap

> **Letzte Aktualisierung:** 21. Januar 2026 (17:35)  
> **Aktuelle Version:** Alpha 0.9.5

---

## 📋 Was ist diese Seite?

Diese Roadmap zeigt dir, welche Features geplant sind, woran gerade gearbeitet wird und was bereits umgesetzt wurde. Du kannst hier den Fortschritt von Lexion verfolgen!

---

## 🎯 Aktueller Fokus: Mobilisierung

*"Die Hürde von 'Ich lese nur mit' zu 'Ich mache mit' so niedrig wie möglich legen."*

---

## 🚧 Aktuell in Arbeit
*(Derzeit werden Features aus Phase 2 priorisiert)*

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

### Phase 2: Engagement & Wachstum ⭐⭐

| # | Feature | Status | Beschreibung |
|---|---------|--------|--------------|
| 6 | **Teilnehmerlisten** | ✅ Fertig | "Wer kommt?" sichtbar machen (Social Proof) |
| 7 | **Öffentliche Events** | ✅ Fertig | Shareable Links für WhatsApp (ohne Login lesbar) |
| 8 | **Einfache Umfragen** | ✅ Fertig | Abstimmungen im Feed ("Terminfindung") |

### Phase 3: Profi-Features ⭐

| # | Feature | Status | Beschreibung |
|---|---------|--------|--------------|
| 9 | **Push-Notifications** | ⏸️ Später | Native Mobile Notifications (technisch aufwendig) |
| 10 | **Biete/Suche Brett** | ⏳ Geplant | Marktplatz für Hilfe/Ressourcen |
| 11 | **Auto-Danke System** | ⏳ Geplant | Automatische Wertschätzung nach Events |

---

## ✅ Abgeschlossen (Patch Notes)

### v0.9.4 – 21. Januar 2026 (Interactive Feed)

**📊 Umfragen & Interaktion**
- [x] **Feed-Umfragen:** Erstellen von Umfragen mit mehreren Antwortmöglichkeiten
- [x] **Live-Voting:** Echtzeit-Abstimmung mit visueller Balkengrafik
- [x] **Feed-Integration:** Nahtlose Einbindung in den bestehenden News-Feed
- [x] **Vote-Management:** Ändern der eigenen Stimme jederzeit möglich

### v0.9.5 – 21. Januar 2026 (Invite Flow Fixes)

**📧 Einladungs-System**
- [x] **Smart Invites:** Automatische Passwort-Reset-Einladung, falls Nutzerkonto bereits existiert (statt Fehler)
- [x] **Localhost Support:** Einladungs-Links funktionieren jetzt auch lokal korrekt (Connection Refused Fix)
- [x] **Auto-Link:** Mitglieder werden erst nach erfolgreicher E-Mail-Bestätigung mit ihrem Profil verknüpft (Phantom-Login Fix)
- [x] **Zuverlässigkeit:** Edge Functions für Einladungen stabiler gemacht und aktualisiert

### v0.9.3 – 19. Januar 2026 (Growth Update)

**🚀 Wachstum & Viralität**
- [x] **Social Proof:** Teilnehmer-Bilder direkt in der Terminübersicht sichtbar ("Max und 3 weitere...")
- [x] **Event Sharing:** Neuer "Teilen"-Button für Events
- [x] **Public Event Pages:** Schicke Landingpages für Events, die auch ohne Login funktionieren (für WhatsApp-Einladungen)
- [x] **Performance:** Intelligentes Nachladen von Teilnehmerdaten

### v0.9.2 – 19. Januar 2026 (Audit & Mobile UX)

**🛡️ Sicherheit & Audit**
- [x] **System Audit Logs:** Lückenlose Protokollierung aller Änderungen für Super-Admins
- [x] **Audit Browser:** Neuer Bereich für Logs mit JSON-Diff-Ansicht
- [x] **Security:** Row Level Security (RLS) policies für sensible Log-Daten

**📱 Mobile & UX**
- [x] **Smart Navigation:** Sidebar schließt sich automatisch bei Navigation, bleibt bei Interaktion offen
- [x] **Responsive Footer:** Optimiertes Design für Mobile (Platz freigegeben, Badge integriert)
- [x] **Feedback Integration:** Bessere Erreichbarkeit über Footer-Buttons auf Mobilgeräten

### v0.9.1 – 19. Januar 2026 (Security & UX Update)

**🔒 Kalender & Sicherheit**
- [x] **iCal Security:** Personalisierte Token für sichere Kalender-Abos (`?token=...`)
- [x] **Sichtbarkeit:** Export enthält jetzt alle für den Nutzer sichtbaren Termine (auch interne & AG-Events)
- [x] **UX:** Abgelaufene Termine von heute werden sofort ausgeblendet
- [x] **Navigation:** Smarte Zurück-Links im Handbuch/Rechtliches

---

### v0.9.0 Alpha – 19. Januar 2026

**🐛 Bugfixes & Stabilisierung**
- [x] **Ansprechpartner:** Korrekte Trennung nach Organisation (Datenbank & Anzeige)
- [x] **Dateien:** Ordner-Liste und Suche jetzt organisations-spezifisch
- [x] **Termine-Sidebar:** Filtert nach Org & Auto-Refresh beim Wechsel
- [x] **Onboarding:** Speicherfehler (`409 Conflict`) behoben
- [x] **UI:** Feedback-Button auf Admin beschränkt, Version im Footer aktualisiert
- [x] **Dokumentation:** Umfangreiches Handbuch (`/docs`) integriert & verlinkt
- [x] **UX:** Footer-Links (Impressum/Docs) auf allen Seiten korrigiert
- [x] **Navigation:** Blockierte Desktop-Sidebar im eingeklappten Zustand gefixt
- [x] **Settings:** Icon-Liste im Admin-Dialog scrollbar gemacht
- [x] **Profil:** "Fast geschafft"-Meldung verschwindet sofort nach Speichern
- [x] **Sicherheit:** Wiki & News strikt abgesichert (RLS: "In Prüfung" ist unsichtbar)
- [x] **Wiki:** Eigene Wiki-Bereiche für Arbeitsgruppen (AGs)
- [x] **Workflow:** Sicherheitsmechanismus für bearbeitete Live-Artikel (Auto-Reset)
- [x] **Login:** Intelligenter Auto-Redirect zur letzten Organisation

---

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

### v0.6.0 – 18. Januar 2026

**🔐 Multi-Org Auth System**
- [x] Globaler Email-Lookup über alle Organisationen
- [x] Edge Function `send-invitation` für Login-Flow
- [x] User können mehreren Organisationen angehören
- [x] Org-Switcher in Sidebar
- [x] Automatische Dashboard-Weiterleitung für eingeloggte User

---

### v0.5.0 – 17. Januar 2026

**📊 Dashboard-Statistiken**
- [x] StatisticsService für Echtzeit-Zähler
- [x] Statistik-Karten auf Dashboard-Startseite
- [x] Mitglieder-Zähler (Gesamt + Aktiv)
- [x] Termine-Zähler (Anstehend + Diesen Monat)
- [x] Wiki-Artikel, Dateien und News-Zähler

---

### v0.4.0 – 17. Januar 2026

**📁 Dateiverwaltung**
- [x] files Tabelle mit RLS-Policies
- [x] FileService für Upload, Download, Suche
- [x] Ordner-Navigation mit Breadcrumbs
- [x] Sichtbarkeitsoptionen

---

### v0.3.1 – 17. Januar 2026

**📤 iCal-Export**
- [x] Edge Function für .ics-Generierung
- [x] Download-Button & Abo-Link

---

### v0.3.0 – 17. Januar 2026

**📅 Termin-Anmeldung**
- [x] event_registrations mit RLS
- [x] An-/Abmeldung mit Status

---

### v0.2.0 – 17. Januar 2026

**🔐 Berechtigungssystem**
- [x] Globale + AG-spezifische Rollen
- [x] PermissionsService

---

### v0.1.0 – 14. Januar 2026

**🎉 Erster Alpha-Release**
- [x] Dashboard, Mitglieder, AGs, Kalender, Wiki, Feed, Kontakte

---

## 💡 Feature-Wünsche

Hast du eine Idee? Nutze den **Feedback-Button** (Alpha-Badge) oder melde dich beim Entwickler-Team!

---

<!-- 
================================================================================
AI-INTERNAL: Technische Details
================================================================================

## Event-Slots (Aktueller Sprint)

### Datenbank-Schema
```sql
-- Helfer-Slots pro Event
CREATE TABLE event_slots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID REFERENCES events(id) ON DELETE CASCADE,
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    start_time TIME,
    end_time TIME,
    max_helpers INTEGER DEFAULT 5,
    required_skills UUID[], -- Array von skill IDs
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Anmeldungen
CREATE TABLE event_slot_signups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slot_id UUID REFERENCES event_slots(id) ON DELETE CASCADE,
    member_id UUID REFERENCES members(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'confirmed', -- 'confirmed', 'cancelled'
    signed_up_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(slot_id, member_id)
);
```

## Skill-Tagging (Abgeschlossen)

### Datenbank-Schema
```sql
-- Skills pro Organisation
CREATE TABLE skills (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    category TEXT, -- 'ability', 'interest', 'availability'
    icon TEXT,
    description TEXT,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(organization_id, name)
);

-- Member-Skill Zuordnung
CREATE TABLE member_skills (
    member_id UUID REFERENCES members(id) ON DELETE CASCADE,
    skill_id UUID REFERENCES skills(id) ON DELETE CASCADE,
    PRIMARY KEY (member_id, skill_id)
);
```

-->
