import mongoose, { Model } from 'mongoose';

import { InvalidOrderStatusException, ObjectNotFoundException } from '../../../domain/exceptions';
import { IOrder, IOrderRepository } from '../../../domain/interfaces';
import { Order, OrderStatus } from '../../../domain/order';
import { Logger } from '../../../logger.module';
import { OrderMapper } from '../mappers';
import { OrderSchema } from '../mongo/schemas';

export class OrderRepository implements IOrderRepository {
  private readonly model = 'Order';

  private readonly module = 'OrderRepository';

  /**
   * @description
   * Repository is a mongoose model that represents the Order collection in mongo
   */
  private readonly repository: Model<IOrder>;

  /**
   *
   * @param {mongoose} connection  - The connection to mongo
   * @param {Logger} logger - The logger module
   * @param {OrderMapper} mapper - The order mapper to map from domain to model and vice versa
   *
   */
  constructor(
    private readonly connection: typeof mongoose,
    private readonly logger: Logger,
    private readonly mapper: OrderMapper,
  ) {
    this.repository = this.connection.model(this.model, OrderSchema);
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
      const createdOrder = await this.repository.create(order);
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
   * @throws {ObjectNotFoundException} - If the order does not exist
   * @throws {Error} - If there is an error updating the order
   *
   * @description
   * Updates an order in the database
   *
   */
  private async update(order: IOrder): Promise<Order> {
    try {
      const updatedOrder = await this.repository.findOneAndUpdate(
        { orderId: order.orderId },
        order,
        { new: true },
      );

      if (!updatedOrder) {
        throw new ObjectNotFoundException(this.model, order.orderId);
      }

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
      const orders = await this.repository.find();
      return orders.map(order => this.mapper.mapToDomain(order));
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
      const orders = await this.repository.find({ customerId });
      return orders.map(order => this.mapper.mapToDomain(order));
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
      const order = await this.repository.findOne({ orderId });
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
      const orders = await this.repository.find({ status });
      return orders.map(order => this.mapper.mapToDomain(order));
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
      const deletedOrder = await this.repository.findOneAndDelete({ orderId });
      if (!deletedOrder) {
        throw new ObjectNotFoundException(this.model, orderId);
      }

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
   *
   */
  public async store(order: Order, controllerOrigin?: boolean): Promise<Order> {
    try {
      const orderModel = this.mapper.mapToModel(order);
      const existentOrder = await this.repository.findOne({ orderId: order.orderId });

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
