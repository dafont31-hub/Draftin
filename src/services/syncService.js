import { supabase } from '../supabaseClient';

class SyncService {
  constructor() {
    this.queue = JSON.parse(localStorage.getItem('sync_queue') || '[]');
    this.isProcessing = false;
    
    window.addEventListener('online', () => this.processQueue());
  }

  async enqueue(table, action, payload) {
    const item = {
      id: crypto.randomUUID(),
      table,
      action,
      payload,
      timestamp: new Date().toISOString()
    };

    if (navigator.onLine) {
      return this.execute(item);
    } else {
      this.queue.push(item);
      this.saveQueue();
      return { offline: true, item };
    }
  }

  async execute(item) {
    try {
      let result;
      if (item.action === 'INSERT') {
        result = await supabase.from(item.table).insert([item.payload]).select();
      } else if (item.action === 'UPDATE') {
        result = await supabase.from(item.table).update(item.payload).eq('id', item.payload.id);
      }
      
      if (result.error) throw result.error;
      return { success: true, data: result.data };
    } catch (error) {
      console.error(`Sync error for ${item.table}:`, error);
      throw error;
    }
  }

  async processQueue() {
    if (this.isProcessing || this.queue.length === 0) return;
    
    this.isProcessing = true;
    console.log(`Processing ${this.queue.length} items in sync queue...`);
    
    const remaining = [];
    for (const item of this.queue) {
      try {
        await this.execute(item);
      } catch (error) {
        remaining.push(item);
      }
    }
    
    this.queue = remaining;
    this.saveQueue();
    this.isProcessing = false;
  }

  saveQueue() {
    localStorage.setItem('sync_queue', JSON.stringify(this.queue));
  }
}

export const syncService = new SyncService();
