import { Injectable } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Injectable({
  providedIn: 'root'
})
export class JsonFormatterService {

  constructor(private sanitizer: DomSanitizer) {}

  /**
   * Convierte un objeto JSON a HTML coloreado con estilo VS Code Dark+
   */
  getColoredJson(data: any): SafeHtml {
    const json = JSON.stringify(data, null, 2);
    let result = '';
    let i = 0;
    let nestLevel = 0; // Track nesting level for bracket colors

    // VS Code bracket colors by nesting level
    const bracketColors = [
      '#ffd700', // Gold - level 0
      '#da70d6', // Orchid - level 1
      '#179fff', // Deep Sky Blue - level 2
    ];

    while (i < json.length) {
      const char = json[i];

      // Handle strings
      if (char === '"') {
        let str = '"';
        i++;
        while (i < json.length && json[i] !== '"') {
          if (json[i] === '\\' && i + 1 < json.length) {
            str += json[i] + json[i + 1];
            i += 2;
          } else {
            str += json[i];
            i++;
          }
        }
        if (i < json.length) {
          str += '"';
          i++;
        }

        // Check if it's a property key (followed by colon)
        let j = i;
        while (j < json.length && (json[j] === ' ' || json[j] === '\t')) j++;

        if (j < json.length && json[j] === ':') {
          // Property key - VS Code light blue
          result += `<span style="color: #9cdcfe;">${str}</span>`;
        } else {
          // String value - VS Code orange/brown
          result += `<span style="color: #ce9178;">${str}</span>`;
        }
        continue;
      }

      // Handle numbers
      if (char.match(/[0-9-]/)) {
        let num = '';
        while (i < json.length && json[i].match(/[0-9.\-]/)) {
          num += json[i];
          i++;
        }
        // VS Code light green
        result += `<span style="color: #b5cea8;">${num}</span>`;
        continue;
      }

      // Handle booleans and null
      if (json.substr(i, 4) === 'true') {
        // VS Code blue (keywords)
        result += `<span style="color: #569cd6;">true</span>`;
        i += 4;
        continue;
      }
      if (json.substr(i, 5) === 'false') {
        // VS Code blue (keywords)
        result += `<span style="color: #569cd6;">false</span>`;
        i += 5;
        continue;
      }
      if (json.substr(i, 4) === 'null') {
        // VS Code blue (keywords)
        result += `<span style="color: #569cd6;">null</span>`;
        i += 4;
        continue;
      }

      // Handle opening brackets and braces
      if (char === '{' || char === '[') {
        const color = bracketColors[nestLevel % bracketColors.length];
        result += `<span style="color: ${color};">${char}</span>`;
        nestLevel++;
        i++;
        continue;
      }

      // Handle closing brackets and braces
      if (char === '}' || char === ']') {
        nestLevel--;
        const color = bracketColors[nestLevel % bracketColors.length];
        result += `<span style="color: ${color};">${char}</span>`;
        i++;
        continue;
      }

      // Handle commas and colons
      if (char === ',' || char === ':') {
        result += `<span style="color: #d4d4d4;">${char}</span>`;
        i++;
        continue;
      }

      // Regular characters (whitespace, etc.)
      result += char;
      i++;
    }

    return this.sanitizer.bypassSecurityTrustHtml(result);
  }
}
