import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { DefaultBackTracks } from './models/default-backtracks.model';
import { BackTrack } from './models/back-track.model';

@Injectable({
  providedIn: 'root'
})
export class BackTrackDatabaseService {

  db: IDBDatabase | null = null;

  openDatabase(databaseName: string, version: number): Promise<BackTrack[]> {
    return new Promise<BackTrack[]>((resolve, reject) => {
      const request = indexedDB.open(databaseName, version);
      request.onupgradeneeded = (event: any) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains('tracks')) {
          const tracksStore = db.createObjectStore('tracks', { keyPath: 'title' });
          // Define indexes and initial data if needed.

          tracksStore.createIndex("beatsPerMinute", "beatsPerMinute", { unique: false});

          tracksStore.createIndex("genre", "genre", { unique: false});

          tracksStore.createIndex("sourcePath", "sourcePath", { unique: true });
        }
      };

      request.onsuccess = (event: any) => {
        this.db = event.target.result;
        // Retrieve all tracks from the database here and resolve the promise.
        const transaction = this.db!.transaction('tracks', 'readonly');
        const store = transaction.objectStore('tracks');
        const tracks: BackTrack[] = [];

        transaction.oncomplete = () => {
          resolve(tracks);
  
        };

        transaction.onerror = (error) => {
          console.error('Error opening database:', error);
          reject(error);
        };

        const cursorRequest = store.openCursor();
        cursorRequest.onsuccess = (cursorEvent: any) => {
          const cursor = cursorEvent.target.result;
          if (cursor) {
            tracks.push(cursor.value);
            cursor.continue();
          }
        };
      };

      request.onerror = (event: any) => {
        console.error('Failed to open the database:', event.target.error);
        reject(event.target.error);
      };
    });
  }

  addDefaultTracks() : Promise<BackTrack[]> {
    return new Promise<BackTrack[]>((resolve, reject) => {
      if (!this.db) {
        // Handle the case where the database is not open yet.
        reject(new Error('Database is not open.'));
        return;
      }
      
      const transaction = this.db!.transaction(['tracks'], 'readwrite');
      const objectStore = transaction.objectStore('tracks');
      const tracks: BackTrack[] = [];

      

      DefaultBackTracks.getTracks().forEach((track) => {
        const request = objectStore.add(track);
        request.onsuccess = () => {
          console.log('Added a default track to the database!')
          tracks.push(track);
        }
      })

      transaction.oncomplete = () => {
        console.log('Done adding all default tracks!');
        resolve(tracks);
      }

      transaction.onerror = () => {
        transaction.onerror = (event: any) => {
          console.error('Error adding default tracks to database:', event.target.error);
          reject(event.target.error);
        };
      };
    })
    
  }

  clearDatabase(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      if (!this.db) {
        // Handle the case where the database is not open yet.
        reject(new Error('Database is not open.'));
        return;
      }
  
      const transaction = this.db.transaction('tracks', 'readwrite');
      const store = transaction.objectStore('tracks');

      transaction.oncomplete = () => {
        resolve();
      };
  
      transaction.onerror = (event: any) => {
        console.error('Error clearing database:', event.target.error);
        reject(event.target.error);
      };
  
      // Clear all data in the 'tracks' object store.
      const clearRequest = store.clear();
      clearRequest.onsuccess = () => {
        console.log('Database cleared.');
      };
    });
  }

  getAllTracks(): Promise<BackTrack[]> {
    return new Promise<BackTrack[]>((resolve, reject) => {
      if (!this.db) {
        // Handle the case where the database is not open yet.
        reject(new Error('Database is not open.'));
        return;
      }

      const transaction = this.db.transaction('tracks', 'readonly');
      const store = transaction.objectStore('tracks');
      const tracks: BackTrack[] = [];

      transaction.oncomplete = () => {
        resolve(tracks);
      };

      transaction.onerror = (event: any) => {
        console.error('Error retrieving tracks:', event.target.error);
        reject(event.target.error);
      };

      const cursorRequest = store.openCursor();
      cursorRequest.onsuccess = (event: any) => {
        const cursor = event.target.result;
        if (cursor) {
          tracks.push(cursor.value);
          cursor.continue();
        }
      };
    });
  }

  updateTrack(updatedTrack: BackTrack): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      if (!this.db) {
        // Handle the case where the database is not open yet.
        reject(new Error('Database is not open.'));
        return;
      }
  
      const transaction = this.db.transaction('tracks', 'readwrite');
      const store = transaction.objectStore('tracks');
  
      const updateRequest = store.put(updatedTrack);
  
      updateRequest.onsuccess = () => {
        console.log(`Track updated: ${updatedTrack.title}`);
        resolve();
      };
  
      updateRequest.onerror = (event: any) => {
        console.error(`Error updating track: ${updatedTrack.title}`, event.target.error);
        reject(event.target.error);
      };
    });
  }

  updateTrackDurationIfZero(updatedTrack: BackTrack): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      if (!this.db) {
        // Handle the case where the database is not open yet.
        reject(new Error('Database is not open.'));
        return;
      }
  
      const transaction = this.db.transaction('tracks', 'readwrite');
      const store = transaction.objectStore('tracks');
  
      const getRequest = store.get(updatedTrack.title);
  
      getRequest.onsuccess = (event: any) => {
        const existingTrack: BackTrack = event.target.result;
  
        if (existingTrack && existingTrack.duration === 0) {
          // Only update duration if it equals 0
          existingTrack.duration = updatedTrack.duration;
  
          const updateRequest = store.put(existingTrack);
  
          updateRequest.onsuccess = () => {
            console.log(`Track duration updated: ${existingTrack.title}`);
            resolve();
          };
  
          updateRequest.onerror = (updateEvent: any) => {
            console.error(`Error updating track duration: ${existingTrack.title}`, updateEvent.target.error);
            reject(updateEvent.target.error);
          };
        } else {
          // The track doesn't exist or its duration is not 0, so no update needed.
          console.log(`No update needed for track: ${updatedTrack.title}`);
          resolve();
        }
      };
  
      getRequest.onerror = (event: any) => {
        console.error(`Error getting track: ${updatedTrack.title}`, event.target.error);
        reject(event.target.error);
      };
    });
  }
  
  
  
  
}
