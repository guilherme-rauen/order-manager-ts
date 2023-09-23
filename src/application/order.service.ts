import { Order } from '../domain';
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

  public async upsertOrder(order: Order): Promise<Order> {
    this.logger.debug(`Upserting order with orderId: ${order.orderId}`, { module: this.module });
    return await this.repository.store(order);
  }
}
