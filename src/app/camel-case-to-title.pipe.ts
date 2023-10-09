import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'camelCaseToTitle'
})
export class CamelCaseToTitlePipe implements PipeTransform {
  transform(value: string): string {
    // Use a regular expression to split camel case into words
    const words = value.split(/(?=[A-Z])/);

    // Capitalize the first letter of each word and join them with spaces
    const title = words.map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');

    return title;
  }
}
