import { Component, inject, signal, effect } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { EditorModule } from 'primeng/editor';
import { SelectButtonModule } from 'primeng/selectbutton';
import { TabsModule } from 'primeng/tabs';
import { DataViewModule } from 'primeng/dataview';
import { CardModule } from 'primeng/card';
import { TagModule } from 'primeng/tag';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';
import { SelectModule } from 'primeng/select';
import { CheckboxModule } from 'primeng/checkbox';
import { FieldsetModule } from 'primeng/fieldset';
import { AuthService } from '../../../shared/services/auth.service';
import { PermissionsService } from '../../../shared/services/permissions.service';
import { FeedService, FeedItem, NewsletterConfig } from '../../../shared/services/feed.service';

@Component({
    selector: 'app-feed',
    standalone: true,
    imports: [
        CommonModule, FormsModule, DatePipe,
        ButtonModule, DialogModule, InputTextModule, EditorModule,
        SelectButtonModule, TabsModule, DataViewModule, CardModule,
        TagModule, ToastModule, TooltipModule,
        SelectModule, CheckboxModule, FieldsetModule
    ],
    providers: [MessageService],
    templateUrl: './feed.html',
    styles: [`
    :host ::ng-deep .p-editor-content { height: 320px; }
  `]
})
export class FeedComponent {
    auth = inject(AuthService);
    permissions = inject(PermissionsService);
    feedService = inject(FeedService);
    messageService = inject(MessageService);

    // Permission-based visibility
    canCreate = this.permissions.canCreateFeed;
    canApprove = this.permissions.canApproveFeed;

    feedItems = signal<FeedItem[]>([]);
    myItems = signal<FeedItem[]>([]);
    reviewItems = signal<FeedItem[]>([]);
    sentItems = signal<FeedItem[]>([]);

    // Admin View Switch
    adminView = signal<'review' | 'sent'>('review');
    adminViewOptions = [
        { label: 'Prüfung', value: 'review', icon: 'pi pi-list-check' },
        { label: 'Archiv', value: 'sent', icon: 'pi pi-history' }
    ];

    // Newsletter Config
    newsletterConfig = signal<NewsletterConfig | null>(null);
    days = [
        { label: 'Montag', value: 1 },
        { label: 'Dienstag', value: 2 },
        { label: 'Mittwoch', value: 3 },
        { label: 'Donnerstag', value: 4 },
        { label: 'Freitag', value: 5 },
        { label: 'Samstag', value: 6 },
        { label: 'Sonntag', value: 7 }
    ];
    frequencies = [
        { label: 'Wöchentlich', value: 'weekly' },
        { label: 'Monatlich', value: 'monthly' },
        { label: 'Manuell', value: 'manual' }
    ];

    // Dialog state
    dialogVisible = signal(false);
    editMode = signal(false);
    currentItem: Partial<FeedItem> = {};

    // Test Email Dialog
    testEmailDialogVisible = signal(false);
    testEmail = '';

    typeOptions: any[] = [{ label: 'Artikel', value: 'article' }, { label: 'Link', value: 'link' }];

    constructor() {
        effect(() => {
            if (this.auth.user()) {
                this.loadData();
            }
        });
    }

    loadData() {
        this.loadFeed();
        if (this.auth.isMember()) this.loadMyItems();
        if (this.auth.isAdmin()) {
            this.loadReviewItems();
            this.loadNewsletterConfig();
            this.loadSentItems();
        }
    }

    async loadFeed() {
        try {
            const data = await this.feedService.getFeedItems();
            this.feedItems.set(data);
        } catch (e) { console.error(e); }
    }

    async loadMyItems() {
        try {
            const data = await this.feedService.getMyItems();
            this.myItems.set(data);
        } catch (e) { console.error(e); }
    }

    async loadReviewItems() {
        try {
            const data = await this.feedService.getReviewItems();
            this.reviewItems.set(data);
        } catch (e) { console.error(e); }
    }

    async loadSentItems() {
        try {
            const data = await this.feedService.getSentItems();
            this.sentItems.set(data);
        } catch (e) { console.error(e); }
    }

    async loadNewsletterConfig() {
        try {
            const cfg = await this.feedService.getNewsletterConfig();
            this.newsletterConfig.set(cfg);
        } catch (e) { console.error(e); }
    }

    async saveConfig() {
        if (!this.newsletterConfig()) return;
        try {
            await this.feedService.updateNewsletterConfig(this.newsletterConfig()!);
            this.messageService.add({ severity: 'success', summary: 'Einstellungen gespeichert' });
        } catch (e: any) { this.messageService.add({ severity: 'error', detail: e.message }); }
    }

    async triggerNewsletter() {
        try {
            await this.feedService.triggerNewsletter();
            this.messageService.add({ severity: 'success', summary: 'Newsletter Versand ausgelöst' });
            this.loadNewsletterConfig();
            this.loadFeed();
            this.loadSentItems();
        } catch (e: any) {
            if (e.message && (e.message.includes('not found') || e.message.includes('Function '))) {
                this.messageService.add({ severity: 'info', summary: 'Simulation', detail: 'Edge Function nicht deployed.' });
            } else {
                this.messageService.add({ severity: 'error', detail: e.message });
            }
        }
    }

    openTestEmailDialog() {
        this.testEmail = this.auth.user()?.email || '';
        this.testEmailDialogVisible.set(true);
    }

    async sendTest() {
        if (!this.testEmail) {
            this.messageService.add({ severity: 'warn', summary: 'Bitte E-Mail angeben' });
            return;
        }
        try {
            await this.feedService.sendTestEmail(this.testEmail);
            this.messageService.add({ severity: 'success', summary: 'Test gesendet', detail: `Vorschau an ${this.testEmail} gesendet.` });
            this.testEmailDialogVisible.set(false);
        } catch (e: any) {
            if (e.message && (e.message.includes('not found') || e.message.includes('Function '))) {
                this.messageService.add({ severity: 'info', summary: 'Simulation', detail: `Hätte an ${this.testEmail} gesendet.` });
                this.testEmailDialogVisible.set(false);
            } else {
                this.messageService.add({ severity: 'error', detail: e.message });
            }
        }
    }

    openNew() {
        this.currentItem = { type: 'article', status: 'draft' };
        this.editMode.set(false);
        this.dialogVisible.set(true);
    }

    openEdit(item: FeedItem) {
        this.currentItem = { ...item };
        this.editMode.set(true);
        this.dialogVisible.set(true);
    }

    async saveItem() {
        if (!this.currentItem.title) {
            this.messageService.add({ severity: 'error', summary: 'Fehler', detail: 'Titel wird benötigt' });
            return;
        }

        try {
            const payload = { ...this.currentItem };
            if (this.editMode() && this.currentItem.id) {
                await this.feedService.updateItem(this.currentItem.id, payload);
                this.messageService.add({ severity: 'success', summary: 'Gespeichert' });
            } else {
                await this.feedService.createItem(payload);
                this.messageService.add({ severity: 'success', summary: 'Erstellt' });
            }
            this.dialogVisible.set(false);
            this.loadData();
        } catch (e: any) {
            this.messageService.add({ severity: 'error', summary: 'Fehler', detail: e.message });
        }
    }

    async deleteItem(item: FeedItem) {
        if (!confirm('Wirklich löschen?')) return;
        try {
            await this.feedService.deleteItem(item.id!);
            this.messageService.add({ severity: 'info', summary: 'Gelöscht' });
            this.loadData();
        } catch (e: any) {
            this.messageService.add({ severity: 'error', summary: 'Fehler', detail: e.message });
        }
    }

    async submitForReview(item: FeedItem) {
        try {
            await this.feedService.updateItem(item.id!, { status: 'review' });
            this.loadData();
            this.messageService.add({ severity: 'success', summary: 'Zur Prüfung eingereicht' });
        } catch (e: any) { this.messageService.add({ severity: 'error', detail: e.message }) }
    }

    async approveItem(item: FeedItem) {
        try {
            await this.feedService.updateItem(item.id!, { status: 'approved' });
            this.loadData();
            this.messageService.add({ severity: 'success', summary: 'Freigegeben und veröffentlicht' });
        } catch (e: any) { this.messageService.add({ severity: 'error', detail: e.message }) }
    }

    getStatusSeverity(status: string) {
        switch (status) {
            case 'approved': return 'success';
            case 'sent': return 'info';
            case 'review': return 'warn';
            default: return 'secondary';
        }
    }
}
