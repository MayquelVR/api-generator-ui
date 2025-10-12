/**
 * Entidad del dominio: Document
 * Modelo puro sin dependencias de frameworks
 */
export class Document {
  constructor(
    public readonly uuid: string,
    public readonly collectionUuid: string,
    public readonly collectionName: string,
    public readonly data: Record<string, any>,
    public readonly createdAt: Date,
    public readonly updatedAt: Date
  ) {}

  static fromResponse(data: any, collectionName: string): Document {
    return new Document(
      data.uuid,
      data.collectionUuid,
      collectionName,
      data.data,
      new Date(data.createdAt),
      new Date(data.updatedAt)
    );
  }
}
