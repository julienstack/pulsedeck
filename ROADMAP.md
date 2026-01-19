# 🚀 Lexion Roadmap

> **Letzte Aktualisierung:** 18. Januar 2026  
> **Aktuelle Version:** Alpha 0.7.0

---

## 📋 Was ist diese Seite?

Diese Roadmap zeigt dir, welche Features geplant sind, woran gerade gearbeitet wird und was bereits umgesetzt wurde. Du kannst hier den Fortschritt von Lexion verfolgen!

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
| 6 | **Push-Notifications** | ⏳ Geplant | Zielgruppen-Push ("Hilfe morgen benötigt") |
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

### v0.7.1 – 19. Januar 2026

**🔍 Admin & Mitglieder Filter**
- [x] Erweiterte Mitglieder-Suche
- [x] Filter nach Skills, Interessen & Verfügbarkeit
- [x] Geografische Suche (PLZ/Ort)
- [x] Performance-Optimierung (Bulk-Load)

**📱 Android App (MVP)**
- [x] Capacitor Integration
- [x] Android Plattform Setup
- [x] Online-Only Strategie (Webview)

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
