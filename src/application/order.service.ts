import { Event, Order, OrderStatus } from '../domain';
import { AmountMismatchException, InvalidOrderStatusException } from '../domain/exceptions';
import { IOrderRepository } from '../domain/interfaces';
import { Logger } from '../logger.module';

export class OrderService {
  private readonly module = 'OrderService';

  constructor(
    private readonly logger: Logger,
    private readonly repository: IOrderRepository,
  ) {}

  public async getOrderDetails(orderId: string): Promise<Order> {
    this.logger.debug(`Getting order details for orderId: ${orderId}`, { module: this.module });
    return await this.repository.getOrderById(orderId);
  }

  public async listCustomerOrders(customerId: string): Promise<Order[]> {
    this.logger.debug(`Getting orders for customerId: ${customerId}`, { module: this.module });
    return await this.repository.getOrdersByCustomerId(customerId);
  }

  public async listOrders(): Promise<Order[]> {
    this.logger.debug('Getting all orders', { module: this.module });
    return await this.repository.getAllOrders();
  }

  public async listOrdersByStatus(status: OrderStatus): Promise<Order[]> {
    this.logger.debug(`Getting orders with status: ${status}`, { module: this.module });
    return await this.repository.getOrdersByStatus(status);
  }

  public async updateOrderStatus(
    orderId: string,
    status: Event,
    amountPaid?: number,
  ): Promise<Order> {
    this.logger.debug(`Updating order status for orderId: ${orderId}`, {
      module: this.module,
      status,
    });

    try {
      const order = await this.repository.getOrderById(orderId);
      if (status === Event.CONFIRMED) {
        if (!amountPaid) {
          throw new AmountMismatchException('Amount paid is required for CONFIRMED status');
        }

        const difference = order.totalAmount - amountPaid;
        if (difference > parseFloat(process.env.PAYMENT_AMOUNT_MISMATCH_THRESHOLD ?? '0.10')) {
          throw new AmountMismatchException(
            `Amount paid is less than total amount by ${difference.toFixed(2)}`,
          );
        } else if (difference !== 0) {
          this.logger.warn(
            `Paid amount has a difference with the order total amount of ${difference.toFixed(2)}`,
            { module: this.module },
          );
        }
      }

      order.status.setStatus(status);
      return await this.repository.store(order);
    } catch (error) {
      if (error instanceof InvalidOrderStatusException) {
        this.logger.error('Error updating order status', {
          module: this.module,
          originalError: error,
        });
      }

      throw error;
    }
  }

  public async upsertOrder(order: Order, controllerOrigin = false): Promise<Order> {
    this.logger.debug(`Upserting order with orderId: ${order.orderId}`, { module: this.module });
    return await this.repository.store(order, controllerOrigin);
  }
}
