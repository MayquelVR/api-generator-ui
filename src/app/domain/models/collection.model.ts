/**
 * Entidad del dominio: Collection
 * Modelo puro sin dependencias de frameworks
 */
export class Collection {
  constructor(
    public readonly uuid: string,
    public readonly collectionName: string,
    public readonly username: string,
    public readonly documentCount: number,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
    public readonly schema?: Record<string, any>
  ) {}

  static fromResponse(data: any): Collection {
    return new Collection(
      data.uuid,
      data.collectionName,
      data.username,
      data.documentCount,
      new Date(data.createdAt),
      new Date(data.updatedAt),
      data.schema
    );
  }
}
