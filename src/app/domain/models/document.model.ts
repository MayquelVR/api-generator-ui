/**
 * Entidad del dominio: Document
 * Modelo puro sin dependencias de frameworks
 */
export class Document {
  constructor(
    public readonly id: number,
    public readonly collectionName: string,
    public readonly data: Record<string, any>,
    public readonly createdAt: Date
  ) {}

  static fromResponse(data: any, collectionName: string): Document {
    return new Document(
      data.id,
      collectionName,
      data.data,
      new Date(data.createdAt)
    );
  }
}
