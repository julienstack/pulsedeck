import { Injectable, inject, signal } from '@angular/core';
import { SupabaseService } from './supabase';
import { AuthService } from './auth.service';
import { OrganizationService } from './organization.service';

export type FileVisibility = 'public' | 'member' | 'committee' | 'admin' | 'ag-only';

export interface FileMetadata {
    id?: string;
    name: string;
    original_name: string;
    storage_path: string;
    mime_type?: string;
    size_bytes?: number;
    folder: string;
    description?: string;
    uploaded_by?: string;
    working_group_id?: string;
    visibility: FileVisibility;
    created_at?: string;
    updated_at?: string;
    // Joined
    uploader?: { name: string };
    working_group?: { name: string };
}

const STORAGE_BUCKET = 'files';

@Injectable({ providedIn: 'root' })
export class FileService {
    private supabase = inject(SupabaseService);
    private auth = inject(AuthService);
    private org = inject(OrganizationService);

    files = signal<FileMetadata[]>([]);
    folders = signal<string[]>([]);
    loading = signal(false);
    currentFolder = signal('/');

    /**
     * Fetch files in a specific folder
     */
    async fetchFiles(folder: string = '/'): Promise<void> {
        this.loading.set(true);
        this.currentFolder.set(folder);

        const orgId = this.org.currentOrgId();

        let query = this.supabase.client
            .from('files')
            .select(`
                *,
                uploader:members!uploaded_by(name),
                working_group:working_groups(name)
            `)
            .eq('folder', folder)
            .order('name', { ascending: true });

        if (orgId) {
            query = query.eq('organization_id', orgId);
        }

        const { data, error } = await query;

        if (error) {
            console.error('Error fetching files:', error);
        } else {
            this.files.set(data as FileMetadata[]);
        }

        this.loading.set(false);
    }

    /**
     * Fetch all unique folders
     */
    async fetchFolders(): Promise<void> {
        const orgId = this.org.currentOrgId();
        let query = this.supabase.client
            .from('files')
            .select('folder');

        if (orgId) {
            query = query.eq('organization_id', orgId);
        }

        const { data, error } = await query;

        if (error) {
            console.error('Error fetching folders:', error);
            return;
        }

        const uniqueFolders = [...new Set(data?.map(f => f.folder) || [])];
        this.folders.set(uniqueFolders.sort());
    }

    /**
     * Search files by name
     */
    async searchFiles(query: string): Promise<FileMetadata[]> {
        const orgId = this.org.currentOrgId();
        let q = this.supabase.client
            .from('files')
            .select(`
                *,
                uploader:members!uploaded_by(name),
                working_group:working_groups(name)
            `)
            .ilike('name', `%${query}%`)
            .order('name', { ascending: true })
            .limit(50);

        if (orgId) {
            q = q.eq('organization_id', orgId);
        }

        const { data, error } = await q;

        if (error) throw new Error(error.message);
        return data as FileMetadata[];
    }

    /**
     * Upload a file
     */
    async uploadFile(
        file: File,
        folder: string = '/',
        options: {
            visibility?: FileVisibility;
            description?: string;
            workingGroupId?: string;
        } = {}
    ): Promise<FileMetadata> {
        const memberId = this.auth.currentMember()?.id;
        if (!memberId) throw new Error('Nicht eingeloggt');

        // Generate unique filename
        const timestamp = Date.now();
        const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
        const storagePath = `${folder === '/' ? '' : folder}/${timestamp}_${safeName}`;

        // Upload to storage
        const { error: uploadError } = await this.supabase.client
            .storage
            .from(STORAGE_BUCKET)
            .upload(storagePath, file, {
                cacheControl: '3600',
                upsert: false,
            });

        if (uploadError) throw new Error(uploadError.message);

        // Create metadata record
        const orgId = this.org.currentOrgId();

        const metadata: Partial<FileMetadata> & { organization_id?: string } = {
            name: file.name,
            original_name: file.name,
            storage_path: storagePath,
            mime_type: file.type,
            size_bytes: file.size,
            folder,
            description: options.description,
            uploaded_by: memberId,
            working_group_id: options.workingGroupId,
            visibility: options.visibility || 'member',
            ...(orgId && { organization_id: orgId }),
        };

        const { data, error } = await this.supabase.client
            .from('files')
            .insert(metadata)
            .select()
            .single();

        if (error) {
            // Rollback: delete uploaded file
            await this.supabase.client.storage.from(STORAGE_BUCKET).remove([storagePath]);
            throw new Error(error.message);
        }

        // Refresh files list
        await this.fetchFiles(folder);

        return data as FileMetadata;
    }

    /**
     * Get download URL for a file
     */
    getDownloadUrl(storagePath: string): string {
        const { data } = this.supabase.client
            .storage
            .from(STORAGE_BUCKET)
            .getPublicUrl(storagePath);

        return data.publicUrl;
    }

    /**
     * Get signed download URL (for private files)
     */
    async getSignedUrl(storagePath: string, expiresIn: number = 3600): Promise<string> {
        const { data, error } = await this.supabase.client
            .storage
            .from(STORAGE_BUCKET)
            .createSignedUrl(storagePath, expiresIn);

        if (error) throw new Error(error.message);
        return data.signedUrl;
    }

    /**
     * Download a file
     */
    async downloadFile(file: FileMetadata): Promise<void> {
        try {
            const url = await this.getSignedUrl(file.storage_path);

            // Trigger download
            const a = document.createElement('a');
            a.href = url;
            a.download = file.original_name;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        } catch (e) {
            console.error('Download error:', e);
            throw e;
        }
    }

    /**
     * Update file metadata
     */
    async updateFile(id: string, updates: Partial<FileMetadata>): Promise<void> {
        const { error } = await this.supabase.client
            .from('files')
            .update({ ...updates, updated_at: new Date().toISOString() })
            .eq('id', id);

        if (error) throw new Error(error.message);
        await this.fetchFiles(this.currentFolder());
    }

    /**
     * Delete a file
     */
    async deleteFile(file: FileMetadata): Promise<void> {
        // Delete from storage
        const { error: storageError } = await this.supabase.client
            .storage
            .from(STORAGE_BUCKET)
            .remove([file.storage_path]);

        if (storageError) console.warn('Storage delete failed:', storageError);

        // Delete metadata
        const { error } = await this.supabase.client
            .from('files')
            .delete()
            .eq('id', file.id);

        if (error) throw new Error(error.message);
        await this.fetchFiles(this.currentFolder());
    }

    /**
     * Create a new folder (virtual - just by having files in it)
     */
    createFolder(parentFolder: string, name: string): string {
        const newFolder = parentFolder === '/'
            ? `/${name}`
            : `${parentFolder}/${name}`;
        return newFolder;
    }

    /**
     * Format file size for display
     */
    formatFileSize(bytes?: number): string {
        if (!bytes) return '-';
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
        if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
        return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
    }

    /**
     * Get file icon based on mime type
     */
    getFileIcon(mimeType?: string): string {
        if (!mimeType) return 'pi-file';

        if (mimeType.startsWith('image/')) return 'pi-image';
        if (mimeType.startsWith('video/')) return 'pi-video';
        if (mimeType.startsWith('audio/')) return 'pi-volume-up';
        if (mimeType.includes('pdf')) return 'pi-file-pdf';
        if (mimeType.includes('word') || mimeType.includes('document')) return 'pi-file-word';
        if (mimeType.includes('excel') || mimeType.includes('spreadsheet')) return 'pi-file-excel';
        if (mimeType.includes('zip') || mimeType.includes('archive')) return 'pi-file-zip';

        return 'pi-file';
    }
}
