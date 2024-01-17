import { PrismaClient } from '@prisma/client';

import { InvalidOrderStatusException, ObjectNotFoundException } from '../../../domain/exceptions';
import { ILogger, IOrder, IOrderItem, IOrderRepository } from '../../../domain/interfaces';
import { Order, OrderStatus } from '../../../domain/order';
import { OrderMapper } from '../mappers';

export class OrderRepository implements IOrderRepository {
  private readonly model = 'Order';

  private readonly module = 'OrderRepository';

  /**
   * @property {String} model - The name of the model
   * @description Prisma connection to the Order model
   */
  private readonly orderRepository: PrismaClient['order'];

  /**
   * @property {String} model - The name of the model
   * @description Prisma connection to the OrderItem model
   */
  private readonly orderItemRepository: PrismaClient['orderItem'];

  /**
   *
   * @param {PrismaClient} connection  - The connection to the database through Prisma
   * @param {Logger} logger - The logger module
   * @param {OrderMapper} mapper - The order mapper to map from domain to model and vice versa
   *
   */
  constructor(
    private readonly connection: PrismaClient,
    private readonly logger: ILogger,
    private readonly mapper: OrderMapper,
  ) {
    this.orderRepository = this.connection.order;
    this.orderItemRepository = this.connection.orderItem;
  }

  /**
   *
   * @param {IOrder} order - The order to be added
   * @returns {Promise<Order>} - Returns a promise that resolves to an Order
   *
   * @throws {Error} - If there is an error adding the order
   *
   * @description
   * Adds an order to the database
   *
   */
  private async add(order: IOrder): Promise<Order> {
    try {
      const { orderItems } = order;
      const createdOrder = await this.orderRepository.create({
        data: { ...order, orderItems: { create: orderItems } },
        include: { orderItems: true },
      });

      return this.mapper.mapToDomain(createdOrder);
    } catch (error) {
      this.logger.error('Error adding order', {
        module: this.module,
        orderId: order.orderId,
        originalError: error,
      });

      throw error;
    }
  }

  /**
   *
   * @param {IOrder} order - The order to be updated
   * @returns {Promise<Order>} - Returns a promise that resolves to an Order
   *
   * @throws {Error} - If there is an error updating the order
   *
   * @description
   * Updates an order in the database
   *
   */
  private async update(order: IOrder): Promise<Order> {
    try {
      const { orderId, orderItems } = order;
      await this.orderItemRepository.deleteMany({
        where: { productId: { notIn: orderItems.map((item: IOrderItem) => item.productId) } },
      });

      const updatedOrder = await this.orderRepository.update({
        where: { orderId },
        data: {
          ...order,
          orderItems: {
            upsert: orderItems.map((item: IOrderItem) => ({
              where: { productId: item.productId },
              create: item,
              update: item,
            })),
          },
        },
        include: { orderItems: true },
      });

      return this.mapper.mapToDomain(updatedOrder);
    } catch (error) {
      this.logger.error('Error updating order', {
        module: this.module,
        orderId: order.orderId,
        originalError: error,
      });

      throw error;
    }
  }

  /**
   *
   * @returns {Promise<Order[]>} - Returns a promise that resolves to an array of Orders
   *
   * @throws {Error} - If there is an error getting all orders
   *
   * @description
   * Gets all orders from the database
   *
   */
  public async getAllOrders(): Promise<Order[]> {
    try {
      const orders = await this.orderRepository.findMany({ include: { orderItems: true } });
      return orders.map((order: IOrder) => this.mapper.mapToDomain(order));
    } catch (error) {
      this.logger.error('Error getting all orders', { module: this.module, originalError: error });
      throw error;
    }
  }

  /**
   *
   * @param {String} customerId - The id of the customer to get orders for
   * @returns {Promise<Order[]>} - Returns a promise that resolves to an array of Orders
   *
   * @throws {Error} - If there is an error getting orders by customer id
   *
   * @description
   * Gets all orders for a customer from the database
   *
   */
  public async getOrdersByCustomerId(customerId: string): Promise<Order[]> {
    try {
      const orders = await this.orderRepository.findMany({
        where: { customerId },
        include: { orderItems: true },
      });

      return orders.map((order: IOrder) => this.mapper.mapToDomain(order));
    } catch (error) {
      this.logger.error('Error getting orders by customer id', {
        module: this.module,
        customerId,
        originalError: error,
      });

      throw error;
    }
  }

  /**
   *
   * @param {String} orderId - The id of the order to get
   * @returns {Promise<Order>} - Returns a promise that resolves to an Order
   *
   * @throws {ObjectNotFoundException} - If the order does not exist
   * @throws {Error} - If there is an error getting the order by id
   *
   * @description
   * Gets an order by id from the database
   *
   */
  public async getOrderById(orderId: string): Promise<Order> {
    try {
      const order = await this.orderRepository.findUnique({
        where: { orderId },
        include: { orderItems: true },
      });

      if (!order) {
        throw new ObjectNotFoundException(this.model, orderId);
      }

      return this.mapper.mapToDomain(order);
    } catch (error) {
      this.logger.error('Error getting order by id', { module: this.module, originalError: error });
      throw error;
    }
  }

  /**
   *
   * @param {OrderStatus} status - The status of the order to get
   * @returns {Promise<Order[]>} - Returns a promise that resolves to an array of Orders
   *
   * @throws {Error} - If there is an error getting orders by status
   *
   * @description
   * Gets all orders by status from the database
   *
   */
  public async getOrdersByStatus(status: OrderStatus): Promise<Order[]> {
    try {
      const orders = await this.orderRepository.findMany({
        where: { status: status.toString() },
        include: { orderItems: true },
      });

      return orders.map((order: IOrder) => this.mapper.mapToDomain(order));
    } catch (error) {
      this.logger.error('Error getting orders by status', {
        module: this.module,
        originalError: error,
      });

      throw error;
    }
  }

  /**
   *
   * @param {String} orderId - The id of the order to be deleted
   * @returns {Promise<void>} - Returns a promise that resolves to void
   *
   * @throws {ObjectNotFoundException} - If the order does not exist
   * @throws {Error} - If there is an error deleting the order
   *
   * @description
   * Deletes an order from the database
   *
   */
  public async remove(orderId: string): Promise<void> {
    try {
      const deletedOrder = await this.orderRepository.findUnique({
        where: { orderId },
        include: { orderItems: true },
      });

      if (!deletedOrder) {
        throw new ObjectNotFoundException(this.model, orderId);
      }

      const { orderItems } = deletedOrder;
      await this.orderItemRepository.deleteMany({
        where: { productId: { in: orderItems.map((item: IOrderItem) => item.productId) } },
      });

      await this.orderRepository.delete({ where: { orderId } });

      return;
    } catch (error) {
      this.logger.error('Error deleting order', {
        module: this.module,
        orderId,
        originalError: error,
      });

      throw error;
    }
  }

  /**
   *
   * @param {Order} order - The order to be stored
   * @returns {Promise<Order>} - Returns a promise that resolves to an Order
   *
   * @throws {Error} - If there is an error storing the order
   *
   * @description
   * Stores an order to the database
   * Note: This method cannot be used to update the status of an order directly via HTTP request
   *
   */
  public async store(order: Order, controllerOrigin?: boolean): Promise<Order> {
    try {
      const { orderId } = order;
      const orderModel = this.mapper.mapToModel(order);
      const existentOrder = await this.orderRepository.findUnique({ where: { orderId } });

      if (existentOrder) {
        if (controllerOrigin) {
          if (orderModel.status !== existentOrder.status) {
            throw new InvalidOrderStatusException(
              'Cannot update order status directly via HTTP request',
            );
          }
        }

        return await this.update(orderModel);
      } else {
        return await this.add(orderModel);
      }
    } catch (error) {
      this.logger.error('Error storing order', { module: this.module, originalError: error });
      throw error;
    }
  }
}
