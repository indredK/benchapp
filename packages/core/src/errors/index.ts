// ============================================================
// Error utilities — storage errors etc.
// ============================================================

export class StorageError extends Error {
  constructor(message: string, cause?: Error) {
    super(message, { cause });
    this.name = 'StorageError';
  }
}
