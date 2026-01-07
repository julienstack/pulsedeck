
interface ContactPerson {
    name: string;
    role: string;
    description: string;
    email: string;
    phone?: string;
    location: string;
    image?: string;
}

import { Component } from '@angular/core';

@Component({
    selector: 'app-contacts',
    imports: [],
    templateUrl: './contacts.html',
    styleUrl: './contacts.css',
})
export class ContactsComponent {
    contacts: ContactPerson[] = [
        {
            name: 'Max Mustermann',
            role: 'Vorsitzender',
            description: 'Verantwortlich für die strategische Ausrichtung und Öffentlichkeitsarbeit des Vereins.',
            email: 'max.mustermann@example.com',
            location: 'Berlin',
            phone: '+49 123 456789'
        },
        {
            name: 'Erika Musterfrau',
            role: 'Mitgliederbetreuung',
            description: 'Erste Ansprechpartnerin für alle Belange unserer Mitglieder und Interessenten.',
            email: 'erika.musterfrau@example.com',
            location: 'München'
        }
    ];
}
