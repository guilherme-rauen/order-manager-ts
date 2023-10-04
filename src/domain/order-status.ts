enum Status {
  CANCELLED = 'CANCELLED',
  CONFIRMED = 'CONFIRMED',
  DELIVERED = 'DELIVERED',
  PENDING = 'PENDING',
  SHIPPED = 'SHIPPED',
}

export class OrderStatus {
  public readonly value: Status;

  constructor(status: string) {
    this.value = OrderStatus.fromString(status);
  }

  public static fromString(value: string): Status {
    if (OrderStatus.isValidStatus(value)) {
      return OrderStatus.parseStatus(value);
    }

    throw new Error(`Invalid status: ${value}`);
  }

  public static isValidStatus(status: string): boolean {
    /** Double negation checks if the status exists in the Status enum and returns a boolean. */
    return !!OrderStatus.parseStatus(status);
  }

  public static parseStatus(value: string) {
    return Status[value.toUpperCase() as keyof typeof Status];
  }

  public toString(): string {
    return this.value;
  }
}
