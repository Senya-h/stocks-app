'use server';

import {connectToDatabase} from "@/database/mongoose";

export const getAllUsersForNewsEmail = async () => {
    try {
        // serverless envrironemnt, therefore need to reconnect each time, but efficient because is cached
        const mongoose = await connectToDatabase();
        const db = mongoose.connection.db;

        if (!db) {
            throw new Error('Database connection failed');
        }

        const users = await db.collection('users').find(
            { email: { $ne: null }, name: { $ne: null }},
            { projection: { _id: 1, id: 1, email: 1, name: 1, country: 1 } }
        ).toArray();

        return users.map(user => ({
            id: user.id || user._id.toString() || '',
            email: user.email,
            name: user.name
        }));
    } catch (error) {
        console.error('error fecthing users for news email: ', error);

        return [];
    }
}