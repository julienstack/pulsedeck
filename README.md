# Hustle Hub Dashboard

Dieses Projekt ist ein modernes Dashboard für Vereine und Parteien, entwickelt mit [Angular](https://github.com/angular/angular-cli), [Tailwind CSS](https://tailwindcss.com), [PrimeNG](https://primeng.org) und [Supabase](https://supabase.com).

## Funktionen

*   **Dreispaltiges Layout**: Navigationsleiste links, Hauptinhalt in der Mitte, Kalender und Widgets rechts.
*   **Mitgliederbereich**: Übersicht für Mitglieder (in Entwicklung).
*   **Öffentlicher Bereich**: Landingpage mit Informationen.
*   **Anpassbares Design**: Dark Mode mit konfigurierbaren Akzentfarben (Standard: Rot).
*   **Supabase Integration**: Vorbereitet für Authentifizierung und Datenbankanbindung.

## Voraussetzungen

*   Node.js (Version 18 oder höher empfohlen)
*   npm

## Installation & Start

1.  Abhängigkeiten installieren:
    ```bash
    npm install
    ```

2.  Entwicklungsserver starten:
    ```bash
    npm start
    # oder
    ng serve
    ```

3.  Öffne `http://localhost:4200/` in deinem Browser.

## Build für Produktion

Um das Projekt für die Produktion zu bauen:

```bash
npm run build
# oder
ng build
```

Die kompilierten Dateien befinden sich dann im Ordner `dist/`.

## Konfiguration

### Supabase
Trage deine Supabase-URL und den API-Key in die Datei `src/app/shared/services/supabase.ts` (oder später in die `environment`-Dateien) ein.

### Design
Die Farben können in `src/styles.css` über CSS-Variablen angepasst werden:
```css
:root {
    --primary-color: #e11d48; /* Beispiel: Rot */
}
```

## Projektstruktur

*   `src/app/layout`: Hauptlayout-Komponenten (Sidebar Links/Rechts).
*   `src/app/features/public`: Öffentliche Seiten (Landingpage).
*   `src/app/features/dashboard`: Der geschützte Mitgliederbereich.
*   `src/app/shared`: Gemeinsam genutzte Services und Komponenten.
