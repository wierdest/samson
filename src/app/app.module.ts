// app.module.ts
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HomeComponent } from './home/home.component';
import { PlayerComponent } from './player/player.component';
import { CamelCaseToTitlePipe } from './camel-case-to-title.pipe';
import { BackTrackTableComponent } from './back-track-table/back-track-table.component';
import { OneShotTrackTableComponent } from './one-shot-track-table/one-shot-track-table.component';
import { TracklistComponent } from './tracklist/tracklist.component';


// Import the MaterialImportsModule here
import { MaterialImportsModule } from './material-imports.module';
import { CdkScrollableModule, CdkVirtualScrollViewport } from '@angular/cdk/scrolling';
import { CdkDrag, CdkDropList } from '@angular/cdk/drag-drop';

// Pipes
import { FormatTimePipe } from './format-time.pipe';
import { WaveformComponent } from './waveform/waveform.component';
import { OscilloscopeComponent } from './oscilloscope/oscilloscope.component';
import { SpectrogramComponent } from './spectrogram/spectrogram.component';
import { GestureControlComponent } from './gesture-control/gesture-control.component';

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    PlayerComponent,
    CamelCaseToTitlePipe,
    BackTrackTableComponent,
    OneShotTrackTableComponent,
    TracklistComponent,
    FormatTimePipe,
    WaveformComponent,
    OscilloscopeComponent,
    SpectrogramComponent,
    GestureControlComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    FormsModule,
    HttpClientModule,
    MaterialImportsModule, // Include the MaterialImportsModule
    CdkDrag,
    CdkDropList,
    CdkVirtualScrollViewport,
    CdkScrollableModule,

  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
