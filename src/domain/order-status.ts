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
    const status = Status[value.toUpperCase() as keyof typeof Status];
    if (Object.values(Status).includes(status)) {
      return status;
    }

    throw new Error(`Invalid status: ${value}`);
  }

  public static isValidStatus(status: string): boolean {
    try {
      OrderStatus.fromString(status);
      return true;
    } catch (error) {
      return false;
    }
  }

  public toString(): string {
    return this.value;
  }
}
