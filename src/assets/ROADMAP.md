# 🚀 PulseDeck Roadmap

> **Letzte Aktualisierung:** 17. Januar 2026  
> **Aktuelle Version:** Alpha 0.2.0

---

## 📋 Was ist diese Seite?

Diese Roadmap zeigt dir, welche Features geplant sind, woran gerade gearbeitet wird und was bereits umgesetzt wurde. Du kannst hier den Fortschritt von PulseDeck verfolgen!

---

## 🎯 Aktuell in Arbeit

<!-- AI-TODO: Aktuelle Aufgaben hier -->

| Feature | Status | Ziel |
|---------|--------|------|
| Roadmap-Seite | 🔄 In Arbeit | Transparente Entwicklung |

---

## 📅 Geplante Features

### Priorität: Hoch ⭐⭐⭐

- [ ] **Termin-Anmeldung** – Mitglieder können sich für Events an-/abmelden
- [ ] **Dateiverwaltung** – Upload von Dokumenten mit Suche
- [ ] **iCal-Export** – Kalender-Sync für externe Apps
- [ ] **Dashboard-Statistiken** – Echte Zahlen statt Platzhalter

### Priorität: Mittel ⭐⭐

- [ ] **Kommentare bei Beiträgen** – Diskussionen im Feed
- [ ] **Abstimmungen/Umfragen** – Einfache Polls für Mitglieder
- [ ] **Aufgaben für AGs** – To-Do-Listen innerhalb einer AG
- [ ] **Mitglieder-Tags** – Flexible Kennzeichnungen

### Priorität: Niedrig ⭐

- [ ] **Gamification** – Punkte/Badges für aktive Teilnahme
- [ ] **PWA/Mobile Push** – Native App-Feeling
- [ ] **Öffentliche Landingpage** – Infos für Externe
- [ ] **Jahresberichte** – Automatische Statistiken

---

## ✅ Abgeschlossen (Patch Notes)

### v0.2.0 – 17. Januar 2026

**🔐 Berechtigungssystem**
- [x] Globale Berechtigungen für Mitglieder (feed:create, wiki:edit, etc.)
- [x] AG-spezifische Rollen (Mitglied, Admin, Leitung)
- [x] PermissionsService für reaktive Berechtigungsprüfung
- [x] Mitglieder-Dialog mit Rollen- und Berechtigungsverwaltung
- [x] AG-Mitglieder-Verwaltungsdialog
- [x] SQL-Migration für permissions und ag_memberships

**🎨 UI-Verbesserungen**
- [x] Feed: Buttons nur für berechtigte Nutzer sichtbar
- [x] Wiki: Edit-Button basierend auf Berechtigung
- [x] Kalender: Event-Erstellung berechtigungsgesteuert
- [x] AG-Seite: Rollen-Badge und Mitgliederverwaltung

---

### v0.1.0 – 14. Januar 2026

**🎉 Erster Alpha-Release**
- [x] Dashboard mit Navigation
- [x] Mitgliederverwaltung
- [x] Arbeitsgruppen (AGs)
- [x] Kalender/Events
- [x] Wiki/Wissensdatenbank
- [x] Feed/News mit Newsletter
- [x] Kontakte
- [x] Onboarding-Flow
- [x] Feedback-System
- [x] Issue-Tracker
- [x] Dark Mode

---

## 💡 Feature-Wünsche

Hast du eine Idee? Nutze den **Feedback-Button** (Alpha-Badge unten links) oder melde dich beim Entwickler-Team!

---

<!-- 
================================================================================
AI-INTERNAL: TODO-Liste für Entwicklung
(Dieser Bereich wird nicht in der UI angezeigt)
================================================================================

## Backlog (Priorisiert)

### Sprint: Roadmap & Transparenz
- [x] ROADMAP.md erstellen
- [ ] Roadmap-Komponente mit Markdown-Rendering
- [ ] Link im Alpha-Badge
- [ ] Route /dashboard/roadmap

### Sprint: Event-Anmeldung
- [ ] event_registrations Tabelle in Supabase
- [ ] EventRegistrationService
- [ ] Anmelde-Button im Kalender
- [ ] Teilnehmerliste pro Event
- [ ] RLS-Policies

### Sprint: Dateiverwaltung
- [ ] Supabase Storage Bucket konfigurieren
- [ ] File Upload Component
- [ ] Ordner-Struktur
- [ ] Suche/Filter
- [ ] Vorschau für PDFs/Bilder

### Sprint: iCal Export
- [ ] iCal-Format generieren
- [ ] Download-Button im Kalender
- [ ] Personalisierter iCal-Link (mit Token)
- [ ] AG-spezifische Kalender

## Archiv (Abgeschlossen)

### Sprint: Permissions (v0.2.0, 17.01.2026)
- [x] SQL-Migration Permissions
- [x] PermissionsService
- [x] Member Model erweitert
- [x] WorkingGroupsService AG-Rollen
- [x] Feed/Wiki/Calendar Berechtigungen
- [x] Member Dialog mit Permissions UI
- [x] AG Members Dialog

-->
