import { Schema } from 'mongoose';

import { IOrder, IOrderItem } from '../../../../domain/interfaces';

const OrderItemSchema = new Schema<IOrderItem>({
  productId: { type: String, required: true },
  quantity: { type: Number, required: true },
  unitPrice: { type: Number, required: true },
});

export const OrderSchema = new Schema<IOrder>({
  customerId: { type: String, required: true },
  orderDate: { type: Date, required: true },
  orderId: { type: String, primary: true, required: true },
  orderItems: { type: [OrderItemSchema], required: true },
  status: { type: String, required: true },
  totalAmount: { type: Number, required: true },
});
