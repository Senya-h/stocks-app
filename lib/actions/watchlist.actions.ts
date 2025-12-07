'use server';

import { connectToDatabase } from '@/database/mongoose';
import { Watchlist } from '@/database/models/watchlist.model';

export async function getWatchlistSymbolsByEmail(email: string): Promise<string[]> {
  try {
    const mongoose = await connectToDatabase();
    const db = mongoose.connection.db;
    if (!db) return [];

    // Find the Better Auth user by email
    const user = await db
      .collection('users')
      .findOne<{ _id?: unknown; id?: string; email?: string }>({ email });

    if (!user) return [];

    const userId = (user.id && String(user.id)) || (user._id ? String(user._id) : '');
    if (!userId) return [];

    const items = await Watchlist.find({ userId }, { symbol: 1 }).lean();
    return items.map(item => item.symbol.toString());
  } catch (error) {
    console.error('getWatchlistSymbolsByEmail error:', error);
    return [];
  }
}
