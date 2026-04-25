import { Context } from "elysia";
import { CerebrasService } from "../services/cerebras.service";

const cerebrasService = new CerebrasService();

export const generateMemecoinNames = async (ctx: Context) => {
    try {
        const body = ctx.body as {
            theme?: string;
            keywords?: string;
            count?: number;
        };

        const { theme, keywords, count = 5 } = body;

        // Validate count
        const validCount = Math.min(10, Math.max(1, count || 5));

        const result = await cerebrasService.generateMemecoinNames({
            theme,
            keywords,
            count: validCount
        });

        ctx.set.status = 200;
        return {
            success: true,
            suggestions: result.suggestions
        };
    } catch (error) {
        console.error('Error in generateMemecoinNames:', error);
        ctx.set.status = 500;
        return {
            success: false,
            message: "Failed to generate memecoin names",
            error: error instanceof Error ? error.message : "Unknown error"
        };
    }
};

export const generateDescription = async (ctx: Context) => {
    try {
        const body = ctx.body as {
            type: 'airdrop' | 'staking';
            tokenName: string;
            tokenSymbol: string;
            amount?: string;
            lockDays?: number;
            multiplier?: string;
        };

        const { type, tokenName, tokenSymbol, amount, lockDays, multiplier } = body;

        if (!type || !tokenName || !tokenSymbol) {
            ctx.set.status = 400;
            return { success: false, message: "Missing required fields: type, tokenName, tokenSymbol" };
        }

        const result = await cerebrasService.generateDescription({
            type, tokenName, tokenSymbol, amount, lockDays, multiplier
        });

        ctx.set.status = 200;
        return { success: true, description: result.description };
    } catch (error) {
        console.error('Error in generateDescription:', error);
        ctx.set.status = 500;
        return {
            success: false,
            message: "Failed to generate description",
            error: error instanceof Error ? error.message : "Unknown error"
        };
    }
};
