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
      this.value = this.toStatus(status.toUpperCase());
      return;
    }

    this.value = status;
  }

  public getOrderStatus(): Status {
    return this.value;
  }

  public isValidStatus(status: Status): boolean {
    return Object.values(Status).includes(status);
  }

  public toStatus(value: string): Status {
    const status = Status[value as keyof typeof Status];
    if (this.isValidStatus(status)) {
      return status;
    }

    throw new Error(`Invalid status: ${value}`);
  }

  public toString(): string {
    return this.value;
  }
}
