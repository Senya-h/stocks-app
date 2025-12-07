import {Schema, Document, Model, models, model} from "mongoose";

export interface WatchlistItem extends Document {
    userId: string;
    symbol: string;
    company: string;
}

const WatchlistSchema = new Schema<WatchlistItem>(
    {
        userId: { type: String, required: true, index: true },
        symbol: { type: String, required: true, uppercase: true, trim: true },
        company: { type: String, required: true, trim: true },
    }
)

WatchlistSchema.index({ userId: 1, symbol: 1 }, { unique: true });

export const Watchlist: Model<WatchlistItem> =
    (models?.Watchlist as Model<WatchlistItem>) || model<WatchlistItem>("Watchlist", WatchlistSchema);