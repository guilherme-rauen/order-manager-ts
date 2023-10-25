import { InvalidOrderStatusException } from '../exceptions';

enum Status {
  CANCELLED = 'CANCELLED',
  CONFIRMED = 'CONFIRMED',
  DELIVERED = 'DELIVERED',
  PENDING = 'PENDING',
  SHIPPED = 'SHIPPED',
}

const ALLOWED_TRANSITIONS: Record<Status, Status[]> = {
  [Status.PENDING]: [Status.CONFIRMED, Status.CANCELLED],
  [Status.CONFIRMED]: [Status.SHIPPED, Status.CANCELLED],
  [Status.SHIPPED]: [Status.DELIVERED],
  [Status.CANCELLED]: [],
  [Status.DELIVERED]: [],
};

export class OrderStatus {
  public value: Status;

  constructor(status: string) {
    this.value = OrderStatus.fromString(status);
  }

  private isTransitionAllowed(newStatus: Status): boolean {
    return ALLOWED_TRANSITIONS[this.value].includes(newStatus);
  }

  private static parseStatus(value: string) {
    return Status[value.toUpperCase() as keyof typeof Status];
  }

  public setStatus(newStatus: string): void {
    const status = OrderStatus.fromString(newStatus);

    if (this.isTransitionAllowed(status)) {
      this.value = status;
    } else {
      throw new InvalidOrderStatusException(
        `Invalid status transition from ${this.value} to ${status}`,
      );
    }
  }

  public static fromString(value: string): Status {
    if (OrderStatus.isValidStatus(value)) {
      return OrderStatus.parseStatus(value);
    }

    throw new InvalidOrderStatusException(`Invalid status: ${value}`);
  }

  public static isValidStatus(status: string): boolean {
    /** Double negation checks if the status exists in the Status enum and returns a boolean. */
    return !!OrderStatus.parseStatus(status);
  }

  public toString(): string {
    return this.value;
  }
}
