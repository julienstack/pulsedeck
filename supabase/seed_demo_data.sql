-- Demo-Daten für Die Linke Soest
-- Organisation ID: a9501361-b5cd-4a53-951a-bf639be85a4e (aus Debug-Output)

-- =====================================================
-- ARBEITSGRUPPEN (Working Groups / AGs)
-- =====================================================

-- Prüfe erst welche AGs existieren und fülle sie mit realistischen Daten

UPDATE working_groups 
SET 
    description = 'Die Bildungs-AG beschäftigt sich mit politischer Bildung, organisiert Vorträge, Lesekreise und Workshops zu aktuellen politischen Themen. Wir erarbeiten Materialien für die Mitgliederbildung und unterstützen bei der Einarbeitung neuer Genoss*innen.',
    next_meeting = '2026-02-05 19:00:00',
    contact_type = 'Signal',
    contact_value = 'AG Bildung Gruppe',
    contact_icon = 'pi pi-book',
    tags = ARRAY['Bildung', 'Vorträge', 'Workshops', 'Theorie']
WHERE name ILIKE '%bildung%' 
AND organization_id = 'a9501361-b5cd-4a53-951a-bf639be85a4e';

UPDATE working_groups 
SET 
    description = 'Die Öffentlichkeitsarbeit-AG ist verantwortlich für unsere mediale Präsenz. Wir betreuen Social Media, gestalten Flyer und Plakate, schreiben Pressemitteilungen und koordinieren Kampagnen.',
    next_meeting = '2026-02-03 18:30:00',
    contact_type = 'Signal',
    contact_value = 'Presse & PR Gruppe',
    contact_icon = 'pi pi-megaphone',
    tags = ARRAY['Social Media', 'Presse', 'Design', 'Kampagnen']
WHERE (name ILIKE '%öffentlichkeit%' OR name ILIKE '%presse%' OR name ILIKE '%pr%')
AND organization_id = 'a9501361-b5cd-4a53-951a-bf639be85a4e';

UPDATE working_groups 
SET 
    description = 'Die Soziale Bewegungen AG vernetzt sich mit Gewerkschaften, Umweltbewegungen und anderen progressiven Organisationen. Wir koordinieren gemeinsame Aktionen und bringen linke Positionen in Bündnisse ein.',
    next_meeting = '2026-02-10 18:00:00',
    contact_type = 'Email',
    contact_value = 'bewegungen@linke-soest.de',
    contact_icon = 'pi pi-users',
    tags = ARRAY['Bündnisse', 'Gewerkschaften', 'Vernetzung', 'Aktionen']
WHERE (name ILIKE '%bewegung%' OR name ILIKE '%sozial%' OR name ILIKE '%bündnis%')
AND organization_id = 'a9501361-b5cd-4a53-951a-bf639be85a4e';

-- Falls es eine Tech/IT AG gibt
UPDATE working_groups 
SET 
    description = 'Die Tech-AG kümmert sich um unsere digitale Infrastruktur: Website, interne Tools, Datenschutz und IT-Sicherheit. Wir helfen auch bei technischen Fragen und schulen Mitglieder in digitalen Tools.',
    next_meeting = '2026-02-07 19:30:00',
    contact_type = 'Discord',
    contact_value = 'DIE LINKE Soest Tech',
    contact_icon = 'pi pi-desktop',
    tags = ARRAY['IT', 'Website', 'Datenschutz', 'Tools']
WHERE (name ILIKE '%tech%' OR name ILIKE '%it%' OR name ILIKE '%digital%')
AND organization_id = 'a9501361-b5cd-4a53-951a-bf639be85a4e';

-- =====================================================
-- WIKI-ARTIKEL
-- =====================================================

-- Generelle Wiki-Artikel (organization-weit)

INSERT INTO wiki_docs (organization_id, title, description, content, category, status, author, last_updated, allowed_roles)
VALUES 
(
    'a9501361-b5cd-4a53-951a-bf639be85a4e',
    'Willkommen bei DIE LINKE Soest',
    'Einführung für neue Mitglieder',
    '# Willkommen bei DIE LINKE Soest!

Schön, dass du dabei bist! Diese Seite gibt dir einen ersten Überblick.

## Unsere Struktur

Wir organisieren uns in **Arbeitsgruppen (AGs)**, die sich um verschiedene Themen kümmern:

- **Bildungs-AG**: Politische Bildung, Lesekreise, Vorträge
- **Öffentlichkeitsarbeit**: Social Media, Presse, Kampagnen
- **Soziale Bewegungen**: Vernetzung mit Bündnispartner*innen

## Erste Schritte

1. **Mitgliederprofil ausfüllen** - Damit wir dich besser kennenlernen
2. **Skills angeben** - Was kannst du gut? Wo möchtest du dich einbringen?
3. **AG beitreten** - Schau dir die AGs an und trete einer bei
4. **Termine im Blick** - Unser Kalender zeigt alle Veranstaltungen

## Wichtige Kontakte

- **Vorstand**: vorstand@linke-soest.de
- **Geschäftsstelle**: Montag 16-18 Uhr, Mittwoch 10-12 Uhr

## Materialien

Im Wiki findest du weitere wichtige Dokumente:
- Satzung des Kreisverbands
- Leitfaden für Infostände
- Vorlagen für Flyer und Plakate

Bei Fragen wende dich an deine AG-Leitung oder den Vorstand!',
    'General',
    'Published',
    'Vorstand',
    NOW(),
    ARRAY['public', 'member', 'admin']
),
(
    'a9501361-b5cd-4a53-951a-bf639be85a4e',
    'Satzung des Kreisverbandes',
    'Die aktuelle Satzung von DIE LINKE KV Soest',
    '# Satzung DIE LINKE Kreisverband Soest

## § 1 Name und Sitz

Der Kreisverband führt den Namen "DIE LINKE. Kreisverband Soest" und hat seinen Sitz in Soest.

## § 2 Gliederung

Der Kreisverband gliedert sich in Ortsverbände und Arbeitsgruppen. Die Gründung von Ortsverbänden bedarf der Zustimmung der Kreismitgliederversammlung.

## § 3 Mitgliedschaft

Mitglied kann werden, wer die Grundsätze und das Programm der Partei anerkennt und keiner anderen Partei angehört.

## § 4 Organe

Die Organe des Kreisverbandes sind:
1. Die Kreismitgliederversammlung
2. Der Kreisvorstand
3. Die Kreisrevisionskommission

## § 5 Kreismitgliederversammlung

Die Kreismitgliederversammlung ist das höchste Organ des Kreisverbandes. Sie tritt mindestens einmal jährlich zusammen.

## § 6 Kreisvorstand

Der Kreisvorstand besteht aus:
- Zwei gleichberechtigten Vorsitzenden (quotiert)
- Dem/der Schatzmeister*in
- Bis zu 5 Beisitzer*innen

## § 7 Finanzen

Der Kreisverband erhält seinen Anteil an den Mitgliedsbeiträgen nach Maßgabe der Finanzordnung der Partei.

---
*Beschlossen auf der Kreismitgliederversammlung am 15.03.2024*',
    'Legal',
    'Published',
    'Kreisvorstand',
    NOW() - INTERVAL '30 days',
    ARRAY['member', 'admin']
),
(
    'a9501361-b5cd-4a53-951a-bf639be85a4e',
    'Leitfaden Infostände',
    'Wie organisiert man einen erfolgreichen Infostand?',
    '# Leitfaden: Infostände organisieren

## Vorbereitung

### 2 Wochen vorher
- [ ] Ort und Zeit festlegen
- [ ] Anmeldung bei der Stadt (falls nötig)
- [ ] Termin im Kalender eintragen
- [ ] Helfer*innen suchen (min. 3 Personen)

### 1 Woche vorher
- [ ] Material checken (Flyer, Plakate, Banner)
- [ ] Tisch und Pavillon reservieren
- [ ] Wetter prüfen

### Am Tag vorher
- [ ] Material zusammenpacken
- [ ] Helfer*innen erinnern
- [ ] Ablauf besprechen

## Durchführung

### Aufbau
1. Pavillon aufstellen (bei Sonne/Regen)
2. Tisch mittig platzieren
3. Banner sichtbar aufhängen
4. Material auslegen (sortiert!)

### Während des Standes
- **Freundlich ansprechen**: "Guten Tag, darf ich Ihnen..."
- **Zuhören wichtiger als reden**
- **Keine Diskussionen eskalieren lassen**
- **Visitenkarten/Kontakt anbieten**

### Abbau
- Material zählen
- Müll mitnehmen
- Fotos für Social Media machen

## Materialien

Folgende Materialien können in der Geschäftsstelle abgeholt werden:
- Faltpavillon (3x3m)
- Klapptisch
- Banner "DIE LINKE"
- Aktuelle Flyer
- Unterschriftenlisten

## Tipps

> **Tipp**: Die besten Zeiten sind Samstag 10-13 Uhr in der Fußgängerzone.

> **Wichtig**: Immer Wasser und Sonnenschutz dabei haben!',
    'General',
    'Published',
    'AG Öffentlichkeitsarbeit',
    NOW() - INTERVAL '14 days',
    ARRAY['member', 'admin']
),
(
    'a9501361-b5cd-4a53-951a-bf639be85a4e',
    'Social Media Guidelines',
    'Richtlinien für unsere Online-Kommunikation',
    '# Social Media Guidelines

## Unsere Kanäle

| Plattform | Handle | Verantwortlich |
|-----------|--------|----------------|
| Instagram | @linke.soest | AG Öffentlichkeitsarbeit |
| Twitter/X | @LinkeSoest | AG Öffentlichkeitsarbeit |
| Facebook | DIE LINKE Soest | Pressesprecher*in |

## Grundsätze

### DO ✅
- Freundlich und respektvoll kommunizieren
- Fakten checken vor dem Posten
- Bilder mit Genehmigung der abgebildeten Personen
- Auf Kommentare zeitnah reagieren
- Hashtags nutzen: #DieLINKE #Soest #Sozial

### DON''T ❌
- Persönliche Angriffe
- Ungeprüfte Infos teilen
- Auf Trolle eingehen
- Private Gespräche öffentlich führen
- Copyright-geschützte Bilder nutzen

## Redaktionsplan

- **Montag**: Wochenvorschau
- **Mittwoch**: Thematischer Post
- **Freitag**: Veranstaltungshinweis
- **Samstag**: Rückblick (wenn Aktion war)

## Bildsprache

- Eigene Fotos bevorzugen
- Menschen zeigen (mit Genehmigung!)
- Rote Akzente im Bild
- Lesbare Schrift auf Grafiken

## Krisenfall

Bei kritischen Kommentaren oder Shitstorm:
1. Ruhe bewahren
2. Nicht sofort reagieren
3. AG Öffentlichkeitsarbeit informieren
4. Gemeinsam Strategie besprechen',
    'Tech',
    'Published',
    'AG Öffentlichkeitsarbeit',
    NOW() - INTERVAL '7 days',
    ARRAY['member', 'admin']
),
(
    'a9501361-b5cd-4a53-951a-bf639be85a4e',
    'Finanzen: Erstattung von Ausgaben',
    'Wie bekomme ich Auslagen erstattet?',
    '# Erstattung von Ausgaben

## Grundsatz

Ausgaben für Parteiarbeit können erstattet werden, wenn sie **vorher genehmigt** wurden.

## Verfahren

### 1. Vor der Ausgabe
- Mit AG-Leitung oder Schatzmeister*in absprechen
- Budget prüfen lassen

### 2. Einkauf
- **Quittung aufheben!**
- Möglichst auf Rechnung mit Adresse des KV

### 3. Erstattung beantragen
- Formular ausfüllen (unten verlinkt)
- Original-Beleg beilegen
- Bei Schatzmeister*in einreichen

### 4. Auszahlung
- Überweisung innerhalb von 2 Wochen
- Bei Fragen: schatzmeister@linke-soest.de

## Erstattungsfähige Ausgaben

| Kategorie | Beispiele | Max. Betrag |
|-----------|-----------|-------------|
| Material | Flyer-Druck, Plakate | 100€ |
| Transport | Bahntickets, Benzin | Fahrkarte / 0,30€/km |
| Verpflegung | Veranstaltungscatering | 50€ |
| Sonstiges | Nach Absprache | - |

## Nicht erstattungsfähig

- Ausgaben ohne Beleg
- Private Ausgaben
- Alkohol (außer bei offiziellen Empfängen)
- Nicht genehmigte Anschaffungen

## Kontakt

**Schatzmeisterin**: Maria Müller
- Email: schatzmeister@linke-soest.de
- Sprechzeit: Mi 17-18 Uhr',
    'Finance',
    'Published',
    'Schatzmeisterin',
    NOW() - INTERVAL '60 days',
    ARRAY['member', 'admin']
),
(
    'a9501361-b5cd-4a53-951a-bf639be85a4e',
    'Datenschutz in der Parteiarbeit',
    'DSGVO-konforme Mitgliederverwaltung',
    '# Datenschutz in der Parteiarbeit

## Warum ist das wichtig?

Als politische Partei verarbeiten wir besondere Kategorien personenbezogener Daten (politische Meinung). Daher gelten **strenge Regeln**.

## Grundregeln

### Datenminimierung
Nur die Daten erheben, die wirklich nötig sind.

### Zweckbindung
Daten nur für den Zweck nutzen, für den sie erhoben wurden.

### Speicherbegrenzung
Daten löschen, wenn nicht mehr benötigt.

## Praktische Tipps

### E-Mail-Verteiler
- Immer **BCC** nutzen bei Massenmail
- Keine privaten E-Mails an Verteiler weiterleiten
- Regelmäßig Verteiler aufräumen

### Fotos
- **Vor** dem Fotografieren fragen
- Veröffentlichung nur mit Einwilligung
- Kinder: Eltern fragen!

### Mitgliederlisten
- Nur verschlüsselt speichern/senden
- Nicht an Dritte weitergeben
- Regelmäßig aktualisieren

### Unterschriftenlisten
- Nur für den angegebenen Zweck
- Nach Abschluss vernichten
- Nicht kopieren

## Bei Datenpannen

Sofort melden an:
1. Kreisvorstand
2. Landesverband

Innerhalb von **72 Stunden** muss ggf. die Aufsichtsbehörde informiert werden!

## Ansprechpartner

Datenschutzbeauftragte*r des KV:
datenschutz@linke-soest.de',
    'Legal',
    'Published',
    'Datenschutzbeauftragte*r',
    NOW() - INTERVAL '45 days',
    ARRAY['member', 'admin']
)
ON CONFLICT DO NOTHING;

-- Erfolgs-Message
SELECT 'Demo-Daten erfolgreich eingefügt!' as result;
