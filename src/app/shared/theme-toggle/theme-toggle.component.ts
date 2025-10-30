import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ThemeStorageAdapter } from '../../infrastructure/adapters/theme-storage.adapter';

@Component({
  selector: 'app-theme-toggle',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './theme-toggle.component.html'
})
export class ThemeToggleComponent implements OnInit {
  isDarkMode = false;

  constructor(private themeAdapter: ThemeStorageAdapter) {}

  ngOnInit(): void {
    this.isDarkMode = this.themeAdapter.isDarkMode();
  }

  toggleTheme(): void {
    const newTheme = this.themeAdapter.toggleTheme();
    this.isDarkMode = newTheme === 'dark';
  }
}
