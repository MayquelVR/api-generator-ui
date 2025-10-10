/**
 * Entidad del dominio: User
 * Modelo puro sin dependencias de frameworks
 */
export class User {
  constructor(
    public readonly token: string,
    public readonly refreshToken: string,
    public readonly expiresIn: number,
    public readonly username?: string,
    public readonly email?: string
  ) {}

  static fromLoginResponse(data: any): User {
    return new User(
      data.token,
      data.refreshToken,
      data.expiresIn,
      data.username, // Opcional
      data.email     // Opcional
    );
  }
}
