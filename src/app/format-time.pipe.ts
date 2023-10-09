import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'formatTime'
})
export class FormatTimePipe implements PipeTransform {

  transform(value: number): string {
    if (!value || isNaN(value)) {
      return '00:00.000';
    }

    const minutes = Math.floor(value / 60);
    const seconds = Math.floor(value % 60);
    const milliseconds = Math.floor((value % 1) * 1000);

    const formattedMinutes = minutes.toString().padStart(2, '0');
    const formattedSeconds = seconds.toString().padStart(2, '0');
    const formattedMilliseconds = milliseconds.toString().padStart(3, '0');

    return `${formattedMinutes}:${formattedSeconds}.${formattedMilliseconds}`;
  }

}
