import { Schema } from 'mongoose';

export const OrderSchema = new Schema({
  customerId: String,
  orderDate: Date,
  orderId: String,
  orderItems: [
    {
      productId: String,
      quantity: Number,
      unitPrice: Number,
    },
  ],
  status: String,
  totalAmount: Number,
});
