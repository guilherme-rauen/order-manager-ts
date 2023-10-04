enum Status {
  CANCELLED = 'CANCELLED',
  CONFIRMED = 'CONFIRMED',
  DELIVERED = 'DELIVERED',
  PENDING = 'PENDING',
  SHIPPED = 'SHIPPED',
}

export class OrderStatus {
  public static readonly CANCELLED = new OrderStatus(Status.CANCELLED);

  public static readonly CONFIRMED = new OrderStatus(Status.CONFIRMED);

  public static readonly DELIVERED = new OrderStatus(Status.DELIVERED);

  public static readonly PENDING = new OrderStatus(Status.PENDING);

  public static readonly SHIPPED = new OrderStatus(Status.SHIPPED);

  public readonly value: Status;

  constructor(status: Status | string) {
    if (typeof status === 'string') {
      this.value = OrderStatus.fromString(status);
      return;
    }

    this.value = status;
  }

  public static fromString(value: string): Status {
    const status = Status[value.toUpperCase() as keyof typeof Status];
    if (OrderStatus.isValidStatus(status)) {
      return status;
    }

    throw new Error(`Invalid status: ${value}`);
  }

  public static isValidStatus(status: Status): boolean {
    return Object.values(Status).includes(status);
  }

  public toString(): string {
    return this.value;
  }
}
