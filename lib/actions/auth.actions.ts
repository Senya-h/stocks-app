'use server';

import {auth} from "@/lib/better-auth/auth";
import {inngest} from "@/lib/inngest/client";
import {headers} from "next/headers";

export const signUpWithEmail = async (data: SignUpFormData) => {
    try {
        const res = await auth.api.signUpEmail({
            body: {
                email: data.email,
                password: data.password,
                name: data.fullName,
            }
        });

        if (res) {
            await inngest.send({
                name: 'app/user.created',
                data: {
                    email: data.email,
                    name: data.fullName,
                    country: data.country,
                    investmentGoals: data.investmentGoals,
                    riskTolerance: data.riskTolerance,
                    preferredIndustry: data.preferredIndustry
                }
            })
        }

        return { success: true, data: res }
    } catch (error) {
        console.log('Sign Up failed: ', error);
        return { success: false, error: 'Sign Up failed' };
    }
}

export const signInWithEmail = async ({ email, password }: SignInFormData) => {
    try {
        const res = await auth.api.signInEmail({
            body: {
                email,
                password
            }
        });

        return { success: true, data: res }
    } catch (error) {
        console.log('Sign In failed: ', error);
        return { success: false, error: 'Sign In failed' };
    }
}

export const signOut = async () => {
    try {
        await auth.api.signOut({ headers: await headers() });
    } catch (error) {
        console.log('Sign Out failed: ', error);
        return { success: false, error: 'Sign Out failed' };
    }
}
