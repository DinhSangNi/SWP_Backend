import { Types } from 'mongoose';

export interface CartItem {
  product: Types.ObjectId | string;
  name: string;
  thumbnail?: string;
  price: number;
  quantity: number;
}

export function mergeCartItems(
  oldItems: CartItem[],
  newItems: CartItem[],
): CartItem[] {
  const mergedMap = new Map<string, CartItem>();

  // Add old items first
  for (const item of oldItems) {
    mergedMap.set(item.product.toString(), { ...item });
  }

  // Merge or insert new items
  for (const newItem of newItems) {
    const id = newItem.product.toString();
    if (mergedMap.has(id)) {
      const existing = mergedMap.get(id)!;
      existing.quantity += newItem.quantity;
      mergedMap.set(id, existing);
    } else {
      mergedMap.set(id, {
        ...newItem,
        product: new Types.ObjectId(newItem.product),
      });
    }
  }

  return Array.from(mergedMap.values());
}
