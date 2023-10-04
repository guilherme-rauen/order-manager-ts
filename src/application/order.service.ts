import { Order, OrderStatus } from '../domain';
import { InvalidOrderStatusException } from '../domain/exceptions';
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

  public async updateOrderStatus(orderId: string, status: string): Promise<Order> {
    this.logger.debug(`Updating order status for orderId: ${orderId}`, {
      module: this.module,
      status,
    });

    try {
      const order = await this.repository.getOrderById(orderId);
      order.status.setStatus(status);
      return await this.repository.store(order);
    } catch (error) {
      if (error instanceof InvalidOrderStatusException) {
        this.logger.error('Error updating order status', { module: this.module, error });
      }

      throw error;
    }
  }

  public async upsertOrder(order: Order): Promise<Order> {
    this.logger.debug(`Upserting order with orderId: ${order.orderId}`, { module: this.module });
    return await this.repository.store(order);
  }
}
