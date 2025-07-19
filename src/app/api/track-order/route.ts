
import { NextRequest, NextResponse } from 'next/server';
import { getDbInstance } from '@/lib/firebase/config';
import { doc, getDoc, collection } from 'firebase/firestore';
import { Order } from '@/lib/types';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const orderId = searchParams.get('orderId');

  if (!orderId) {
    return NextResponse.json({ message: 'Order ID is required.' }, { status: 400 });
  }

  const db = getDbInstance();
  if (!db) {
    return NextResponse.json({ message: 'Database service is unavailable.' }, { status: 503 });
  }

  try {
    const orderDocRef = doc(db, 'orders', orderId);
    const orderDocSnap = await getDoc(orderDocRef);

    if (!orderDocSnap.exists()) {
      return NextResponse.json({ message: 'No order found with this ID.' }, { status: 404 });
    }

    const orderData = orderDocSnap.data() as Order;

    // For security, only return public-facing data.
    const publicOrderData: Partial<Order> = {
      id: orderDocSnap.id,
      status: orderData.status,
      createdAt: orderData.createdAt,
      totalAmount: orderData.totalAmount,
      items: orderData.items, // Optional: if you want to show items
    };

    return NextResponse.json(publicOrderData, { status: 200 });

  } catch (error) {
    console.error('Error fetching order status:', error);
    return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500 });
  }
}
