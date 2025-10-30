import { Injectable } from '@angular/core';

/**
 * Adapter para manejar el tema oscuro/claro
 * Persiste la preferencia del usuario en localStorage
 */
@Injectable({
  providedIn: 'root'
})
export class ThemeStorageAdapter {
  private readonly THEME_KEY = 'theme-preference';
  private readonly DARK_CLASS = 'dark';

  constructor() {
    // Aplicar tema al inicializar
    this.applyTheme();
  }

  /**
   * Obtiene el tema actual
   */
  getTheme(): 'light' | 'dark' {
    const savedTheme = localStorage.getItem(this.THEME_KEY);

    if (savedTheme === 'dark' || savedTheme === 'light') {
      return savedTheme;
    }

    // Si no hay preferencia guardada, usar preferencia del sistema
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  /**
   * Establece el tema
   */
  setTheme(theme: 'light' | 'dark'): void {
    localStorage.setItem(this.THEME_KEY, theme);
    this.applyTheme();
  }

  /**
   * Alterna entre tema claro y oscuro
   */
  toggleTheme(): 'light' | 'dark' {
    const currentTheme = this.getTheme();
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    this.setTheme(newTheme);
    return newTheme;
  }

  /**
   * Verifica si el tema oscuro está activo
   */
  isDarkMode(): boolean {
    return this.getTheme() === 'dark';
  }

  /**
   * Aplica el tema al elemento HTML
   */
  private applyTheme(): void {
    const theme = this.getTheme();
    const htmlElement = document.documentElement;

    if (theme === 'dark') {
      htmlElement.classList.add(this.DARK_CLASS);
    } else {
      htmlElement.classList.remove(this.DARK_CLASS);
    }
  }
}
