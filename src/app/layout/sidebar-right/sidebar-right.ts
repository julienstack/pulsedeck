import {
  Component,
  computed,
  effect,
  ElementRef,
  inject,
  OnInit,
  signal,
  ViewChild,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { SupabaseService } from '../../shared/services/supabase';

interface Task {
  id: string;
  title: string;
  done: boolean;
}

@Component({
  selector: 'app-sidebar-right',
  imports: [RouterLink, FormsModule],
  templateUrl: './sidebar-right.html',
  styleUrl: './sidebar-right.css',
})
export class SidebarRight implements OnInit {
  @ViewChild('newTaskInput') newTaskInput!: ElementRef<HTMLInputElement>;

  private supabase = inject(SupabaseService);

  upcomingEvents: any[] = [];
  tasks = signal<Task[]>([]);
  isLoggedIn = computed(() => !!this.supabase.user());
  private memberId = signal<string | null>(null);

  // Inline add task
  showAddInput = signal(false);
  newTaskTitle = signal('');
  addingTask = signal(false);

  constructor() {
    // Re-fetch tasks when user changes
    effect(() => {
      const user = this.supabase.user();
      if (user) {
        this.fetchMemberAndTasks();
      } else {
        this.tasks.set([]);
        this.memberId.set(null);
      }
    });
  }

  ngOnInit() {
    this.fetchUpcoming();
  }

  async fetchUpcoming() {
    const today = new Date().toISOString().split('T')[0];
    const { data } = await this.supabase
      .from('events')
      .select('*')
      .gte('date', today)
      .order('date', { ascending: true })
      .order('start_time', { ascending: true })
      .limit(5);

    if (data) {
      this.upcomingEvents = data.map(evt => {
        const isToday = evt.date === today;
        const dateObj = new Date(evt.date);
        const formattedDate = dateObj.toLocaleDateString('de-DE', {
          day: '2-digit',
          month: 'short',
        });

        let color = 'blue';
        let icon = 'pi-calendar';

        switch (evt.type) {
          case 'ag':
            color = 'green';
            icon = 'pi-users';
            break;
          case 'personal':
            color = 'purple';
            icon = 'pi-user';
            break;
          case 'general':
            color = 'blue';
            icon = 'pi-flag';
            break;
        }

        return {
          title: evt.title,
          date: isToday ? 'Heute' : formattedDate,
          time: evt.start_time,
          type: evt.type,
          icon: icon,
          color: color,
        };
      });
    }
  }

  private async fetchMemberAndTasks() {
    const userId = this.supabase.user()?.id;
    if (!userId) return;

    // Get member ID for current user
    const { data: memberData } = await this.supabase
      .from('members')
      .select('id')
      .eq('user_id', userId)
      .single();

    if (memberData) {
      this.memberId.set(memberData.id);
      await this.fetchTasks();
    }
  }

  private async fetchTasks() {
    const memId = this.memberId();
    if (!memId) return;

    const { data } = await this.supabase
      .from('user_tasks')
      .select('id, title, done')
      .eq('member_id', memId)
      .order('created_at', { ascending: false });

    if (data) {
      this.tasks.set(data as Task[]);
    }
  }

  async toggleTask(task: Task) {
    const newDone = !task.done;

    // Optimistically update UI
    this.tasks.update(tasks =>
      tasks.map(t => (t.id === task.id ? { ...t, done: newDone } : t))
    );

    // Update in database
    await this.supabase
      .from('user_tasks')
      .update({ done: newDone, updated_at: new Date().toISOString() })
      .eq('id', task.id);
  }

  openAddInput() {
    this.showAddInput.set(true);
    this.newTaskTitle.set('');
    // Focus the input after it renders
    setTimeout(() => this.newTaskInput?.nativeElement?.focus(), 0);
  }

  cancelAdd() {
    this.showAddInput.set(false);
    this.newTaskTitle.set('');
  }

  async submitTask() {
    const memId = this.memberId();
    const title = this.newTaskTitle().trim();
    if (!memId || !title) return;

    this.addingTask.set(true);

    const { data } = await this.supabase
      .from('user_tasks')
      .insert({ member_id: memId, title, done: false })
      .select('id, title, done')
      .single();

    if (data) {
      this.tasks.update(tasks => [data as Task, ...tasks]);
    }

    this.addingTask.set(false);
    this.showAddInput.set(false);
    this.newTaskTitle.set('');
  }

  onInputKeydown(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      event.preventDefault();
      this.submitTask();
    } else if (event.key === 'Escape') {
      this.cancelAdd();
    }
  }
}

