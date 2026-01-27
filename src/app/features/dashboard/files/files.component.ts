import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';

// PrimeNG
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { SelectModule } from 'primeng/select';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TooltipModule } from 'primeng/tooltip';
import { FileUploadModule, FileUploadHandlerEvent } from 'primeng/fileupload';
import { TagModule } from 'primeng/tag';
import { MessageService, ConfirmationService } from 'primeng/api';

// Services
import { FileService, FileMetadata, FileVisibility } from '../../../shared/services/file.service';
import { AuthService } from '../../../shared/services/auth.service';
import { WorkingGroupsService } from '../../../shared/services/working-groups.service';

@Component({
    selector: 'app-files',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        DatePipe,
        ButtonModule,
        DialogModule,
        InputTextModule,
        TextareaModule,
        SelectModule,
        ProgressSpinnerModule,
        ToastModule,
        ConfirmDialogModule,
        TooltipModule,
        FileUploadModule,
        TagModule,
    ],
    providers: [MessageService, ConfirmationService],
    templateUrl: './files.component.html',
})
export class FilesComponent implements OnInit {
    public fileService = inject(FileService);
    public auth = inject(AuthService);
    private workingGroupsService = inject(WorkingGroupsService);
    private messageService = inject(MessageService);
    private confirmationService = inject(ConfirmationService);

    workingGroups = this.workingGroupsService.workingGroups;

    // State
    uploadDialogVisible = signal(false);
    uploading = signal(false);
    searchQuery = signal('');
    searchResults = signal<FileMetadata[]>([]);
    isSearching = signal(false);

    // Upload form
    uploadVisibility: FileVisibility = 'member';
    uploadDescription = '';
    uploadWorkingGroupId: string | null = null;

    visibilityOptions = [
        { label: 'Alle Mitglieder', value: 'member' },
        { label: 'Nur Vorstand', value: 'committee' },
        { label: 'Nur Admin', value: 'admin' },
        { label: 'Nur AG-Mitglieder', value: 'ag-only' },
    ];

    ngOnInit(): void {
        this.fileService.fetchFiles('/');
        this.fileService.fetchFolders();
        this.workingGroupsService.fetchWorkingGroups();
    }

    // --- Folder Navigation ---

    navigateToFolder(folder: string): void {
        this.fileService.fetchFiles(folder);
        this.clearSearch();
    }

    navigateUp(): void {
        const current = this.fileService.currentFolder();
        if (current === '/') return;

        const parts = current.split('/').filter(Boolean);
        parts.pop();
        const parent = parts.length === 0 ? '/' : '/' + parts.join('/');
        this.navigateToFolder(parent);
    }

    getBreadcrumbs(): { label: string; path: string }[] {
        const current = this.fileService.currentFolder();
        if (current === '/') return [{ label: 'Dateien', path: '/' }];

        const parts = current.split('/').filter(Boolean);
        const breadcrumbs = [{ label: 'Dateien', path: '/' }];

        let path = '';
        for (const part of parts) {
            path += '/' + part;
            breadcrumbs.push({ label: part, path });
        }

        return breadcrumbs;
    }

    // --- Upload ---

    openUploadDialog(): void {
        this.uploadVisibility = 'member';
        this.uploadDescription = '';
        this.uploadWorkingGroupId = null;
        this.uploadDialogVisible.set(true);
    }

    async handleUpload(event: FileUploadHandlerEvent): Promise<void> {
        const file = event.files[0];
        if (!file) return;

        this.uploading.set(true);

        try {
            await this.fileService.uploadFile(file, this.fileService.currentFolder(), {
                visibility: this.uploadVisibility,
                description: this.uploadDescription || undefined,
                workingGroupId: this.uploadWorkingGroupId || undefined,
            });

            this.messageService.add({
                severity: 'success',
                summary: 'Hochgeladen',
                detail: `${file.name} wurde hochgeladen.`,
            });

            this.uploadDialogVisible.set(false);
        } catch (e) {
            this.messageService.add({
                severity: 'error',
                summary: 'Fehler',
                detail: (e as Error).message,
            });
        }

        this.uploading.set(false);
    }

    // --- Download ---

    async downloadFile(file: FileMetadata): Promise<void> {
        try {
            await this.fileService.downloadFile(file);
        } catch (e) {
            this.messageService.add({
                severity: 'error',
                summary: 'Fehler',
                detail: 'Download fehlgeschlagen.',
            });
        }
    }

    // --- Delete ---

    confirmDelete(file: FileMetadata): void {
        this.confirmationService.confirm({
            message: `Möchtest du "${file.name}" wirklich löschen?`,
            header: 'Löschen bestätigen',
            icon: 'pi pi-exclamation-triangle',
            acceptLabel: 'Ja, löschen',
            rejectLabel: 'Abbrechen',
            accept: async () => {
                try {
                    await this.fileService.deleteFile(file);
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Gelöscht',
                        detail: 'Datei wurde gelöscht.',
                    });
                } catch (e) {
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Fehler',
                        detail: (e as Error).message,
                    });
                }
            },
        });
    }

    // --- Search ---

    async onSearch(): Promise<void> {
        const query = this.searchQuery().trim();
        if (!query) {
            this.clearSearch();
            return;
        }

        this.isSearching.set(true);
        try {
            const results = await this.fileService.searchFiles(query);
            this.searchResults.set(results);
        } catch (e) {
            console.error('Search error:', e);
        }
    }

    clearSearch(): void {
        this.searchQuery.set('');
        this.searchResults.set([]);
        this.isSearching.set(false);
    }

    // --- Helpers ---

    canDelete(file: FileMetadata): boolean {
        const member = this.auth.currentMember();
        if (!member) return false;
        return file.uploaded_by === member.id || member.app_role === 'admin';
    }

    getVisibilityLabel(visibility: FileVisibility): string {
        const labels: Record<FileVisibility, string> = {
            public: 'Öffentlich',
            member: 'Mitglieder',
            committee: 'Vorstand',
            admin: 'Admin',
            'ag-only': 'AG',
        };
        return labels[visibility];
    }

    getVisibilitySeverity(visibility: FileVisibility): string {
        const severities: Record<FileVisibility, string> = {
            public: 'success',
            member: 'info',
            committee: 'warn',
            admin: 'danger',
            'ag-only': 'secondary',
        };
        return severities[visibility];
    }
}
