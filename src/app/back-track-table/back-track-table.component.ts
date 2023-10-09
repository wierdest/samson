import { Component, EventEmitter, Output, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { BackTrack } from '../models/back-track.model';
import { DefaultBackTracks } from '../models/default-backtracks.model';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { TrackService } from '../track.service';
import { MatDialog } from '@angular/material/dialog';
import { BackTrackDatabaseService } from '../back-track-database.service';
import { Subject, Subscription, takeUntil } from 'rxjs';

@Component({
  selector: 'app-back-track-table',
  templateUrl: './back-track-table.component.html',
  styleUrls: ['./back-track-table.component.css'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({height: '0px', minHeight: '0'})),
      state('expanded', style({height: '*'})),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ],
})
export class BackTrackTableComponent {

  tracks: BackTrack[] = [];
  backTrackTableDataSource!: MatTableDataSource<BackTrack>
  // Expansion panel control
  isPanelExpanded = false;
  columnsToDisplayBackTrack = ['title', 'genre', 'beatsPerMinute', 'duration', 'author' ];
  columnstoDisplayBackTrackWithExpand = [...this.columnsToDisplayBackTrack, 'expand'];
  expandedBackTrackElement: BackTrack | null = null;
  @ViewChild(MatPaginator) backTrackPaginator!: MatPaginator;
  @ViewChild(MatSort) backTrackSort!: MatSort;

  @Output() playOrJustLoadSelectedTrack: EventEmitter<boolean> = new EventEmitter<boolean>();

  private trackRequestSubscription!: Subscription;


  constructor(private trackService: TrackService, private databaseService: BackTrackDatabaseService) {}

  ngOnInit() {
    // Subscribe to TrackService's request track observable
    this.trackRequestSubscription = this.trackService.getTrackRequest().subscribe((addTrack) => {
      if(addTrack) {
        console.log('received request!')
        this.selectRandomTrack();
      }
    })
    // DATABASE
    const databaseName = 'trackLibrary';
    const databaseVersion = 1;
    // FOR TESTING PURPOSES:

    // this.databaseService.openDatabase(databaseName, databaseVersion)
    //   .then(() => {
    //     this.clearDatabase();
    //   })
    //   .catch((error) => {
    //     console.error('Error opening the database:', error);
    //   });
  
    this.databaseService.openDatabase(databaseName, databaseVersion)
      .then(() => {
        this.databaseService.getAllTracks().then((tracks) => {
          if(tracks.length === 0) {
            // add all default tracks
            this.databaseService.addDefaultTracks().then((tracks) => {
              this.tracks = tracks;
              this.setTable();
            });
          } else {
            this.tracks = tracks;
            this.setTable();
          }
        })
        .catch((error) => {
          console.error('Error getting all tracks from database', error);
        })
      })
      .catch((error) => {
        console.error('Error opening the database:', error);
      });

  }

  ngOnDestroy() : void {
    this.trackRequestSubscription.unsubscribe();
  }

  setTable() {
    // Initialize your MatTableDataSource with the retrieved tracks.
    this.backTrackTableDataSource = new MatTableDataSource<BackTrack>(this.tracks);
    // After setting up the MatTableDataSource, you can proceed with any other necessary setup.
    // For example, you might want to configure pagination and sorting.
    this.backTrackTableDataSource.paginator = this.backTrackPaginator;
    this.backTrackTableDataSource.sort = this.backTrackSort;
    if (this.backTrackTableDataSource.paginator) {
      this.backTrackTableDataSource.paginator.firstPage();
    }

  }


  clearDatabase() {
    this.databaseService.clearDatabase()
      .then(() => {
        // Handle success
        console.log('Database cleared successfully.');
        // Optionally, you can reload the page or take any other actions to reset the application.
      })
      .catch((error) => {
        // Handle error
        console.error('Error clearing database:', error);
      });
  }
  
  applyFilterToBackTrackTable(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.backTrackTableDataSource.filter = filterValue.trim().toLowerCase();
    if(this.backTrackTableDataSource.paginator) {
      this.backTrackTableDataSource.paginator.firstPage();
    }
  }

  isArray(data: any): boolean {
    return Array.isArray(data);
  }
  
  formatArray(data: any[]): string {
    // Join array elements with a comma and space
    return data.join(', ');
  }

  selectTrack(track: BackTrack, playOnLoad: boolean = false) {
    // Use the service to select track
    this.trackService.setSelectedTrack(track);
    // emit an event to play immediately if playOnLoad, so that the player parent can know
    this.playOrJustLoadSelectedTrack.emit(playOnLoad);
    // Close the detail section and the expansion panel
    this.expandedBackTrackElement = null;
    this.isPanelExpanded = false;
  }

  selectRandomTrack() {
    // Get a random index to select a random track.
    const randomIndex = Math.floor(Math.random() * this.tracks.length);

    // Get the randomly selected track.
    const selectedTrack = this.tracks[randomIndex];

    // Use the trackService to select the random track.
    this.trackService.setSelectedTrack(selectedTrack);
  }

  
}
