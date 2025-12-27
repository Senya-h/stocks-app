import {inngest} from "@/lib/inngest/client";
import {NEWS_SUMMARY_EMAIL_PROMPT, PERSONALIZED_WELCOME_EMAIL_PROMPT} from "@/lib/inngest/prompts";
import {sendSummaryEmail, sendWelcomeEmail} from "@/lib/nodemailer";
import {getAllUsersForNewsEmail} from "@/lib/actions/user.actions";
import { getWatchlistSymbolsByEmail } from "@/lib/actions/watchlist.actions";
import { getNews } from "@/lib/actions/finnhub.actions";
import {formatDateToday} from "@/lib/utils";

export const sendSignUpEmail = inngest.createFunction(
    { id: 'sign-up-email' },
    { event: 'app/user.created' },
    async ({ event, step }) => {
        const userProfile = `
            - Country: ${event.data.country}
            - Investment goals: ${event.data.investmentGoals}
            - Risk tolerance: ${event.data.riskTolerance}
            - Preferred industry: ${event.data.preferredIndustry}
        `;

        const prompt = PERSONALIZED_WELCOME_EMAIL_PROMPT.replace('{{userProfile}}', userProfile);

        const response = await step.ai.infer('generate-welcome-intro', {
            model: step.ai.models.gemini({ model: 'gemini-2.5-flash-lite' }),
            body: {
                contents: [
                    {
                        role: 'user',
                        parts: [
                            { text: prompt }
                        ]
                    }
                ]
            }
        });

        await step.run('send-welcome-email', async () => {
            const part = response.candidates?.[0]?.content?.parts?.[0];
            const introText = (part && 'text' in part ? part.text : null) || 'Thanks for joining Signalist. You now have the tools to track market and make smarter moves.';

            const { data: { email, name } } = event;
            return await sendWelcomeEmail({ email, name, intro: introText })
        })

        return {
            success: true,
            message: 'Welcome email sent successfully'
        }
    }
)

export const sendDailyNewsSummary = inngest.createFunction(
    { id: 'daily-news-summary' },
    [{ event: 'app/send.daily.news' }, { cron: '0 12 * * *' }],
    async ({ step }) => {
        const users = await step.run('get-all-users', getAllUsersForNewsEmail);

        if (!users.length) {
            return { success: false, message: 'No users found' }
        }

        for (const user of users as User[]) {
            const email = user.email?.trim().toLowerCase();
            if (!email) continue;

            const symbols = await step.run(`get-watchlist-${email}`, async () => {
                return await getWatchlistSymbolsByEmail(email);
            });

            const articles = await step.run(`fetch-news-${email}`, async (): Promise<MarketNewsArticle[]> => {
                try {
                    const sym = Array.isArray(symbols) ? symbols : [];
                    let news = await getNews(sym);
                    if (!news || news.length === 0) {
                        news = await getNews();
                    }
                    return (news || []).slice(0, 6);
                } catch (e) {
                    console.error('daily news fetch failed for', email, e);
                    return [];
                }
            });

            if (!articles || articles.length === 0) {
                continue;
            }

            const userNewsSummaries: { user: User, newsContent: string | null}[] = [];

            for (const article of articles) {
                try {
                    const prompt = NEWS_SUMMARY_EMAIL_PROMPT.replace('{{newsData}}', JSON.stringify(article, null, 2));

                    const response = await step.ai.infer(`summarize-news-${user.email}`, {
                        model: step.ai.models.gemini({ model: 'gemini-2.5-flash-lite' }),
                        body: {
                            contents: [
                                {
                                    role: 'user',
                                    parts: [{ text: prompt }]
                                }
                            ]
                        }
                    });

                    const part = response.candidates?.[0]?.content?.parts?.[0];
                    const newsContent = (part && 'text' in part ? part.text : null) || 'No market news';

                    userNewsSummaries.push({ user, newsContent });
                } catch (error) {
                    console.error('Failed to summarizse news for: ', user.email);
                    userNewsSummaries.push({ user, newsContent: null });
                }
            }

            await step.run(`send-news-emails-${email}`, async () => {
                await Promise.all(
                    userNewsSummaries.map(async ({ user, newsContent }) => {
                        if (!newsContent) {
                            return false;
                        }

                        return await sendSummaryEmail({ email: user.email, newsContent, date: formatDateToday })
                    })
                )
            });
        }

        return { success: true, message: 'Daily news summary sent successfully' }
    }
)