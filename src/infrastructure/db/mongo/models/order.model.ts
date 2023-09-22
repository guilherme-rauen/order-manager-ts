import mongoose from 'mongoose';

import { OrderSchema } from '../schemas';

export const OrderModel = mongoose.model('Order', OrderSchema);
