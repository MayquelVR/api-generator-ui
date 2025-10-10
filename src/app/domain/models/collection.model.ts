/**
 * Entidad del dominio: Collection
 * Modelo puro sin dependencias de frameworks
 */
export class Collection {
  constructor(
    public readonly collectionName: string,
    public readonly documentCount: number,
    public readonly createdAt: Date,
    public readonly schema?: Record<string, any>
  ) {}

  static fromResponse(data: any): Collection {
    return new Collection(
      data.collectionName,
      data.documentCount,
      new Date(data.createdAt),
      data.schema
    );
  }
}
