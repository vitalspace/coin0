import Cerebras from '@cerebras/cerebras_cloud_sdk';

const cerebras = new Cerebras({
    apiKey: process.env['CEREBRAS_API_KEY']
});

export interface GenerateMemecoinNamesRequest {
    theme?: string;
    keywords?: string;
    count?: number;
}

export interface MemecoinNameSuggestion {
    name: string;
    symbol: string;
    description: string;
}

export interface GenerateMemecoinNamesResponse {
    suggestions: MemecoinNameSuggestion[];
}

export interface GenerateDescriptionRequest {
    type: 'airdrop' | 'staking';
    tokenName: string;
    tokenSymbol: string;
    amount?: string;
    lockDays?: number;
    multiplier?: string;
}

export interface GenerateDescriptionResponse {
    description: string;
}

// Types kept for backward compatibility
export interface ParsedIntent {
    intent: string;
    action: string;
    amount?: string;
    poolName?: string;
    tokenSymbol?: string;
    confidence: number;
    rawParams?: Record<string, any>;
    isFollowUp?: boolean;
}

export interface ConversationMessage {
    role: string;
    content: string;
    action?: string;
    metadata?: Record<string, any>;
}

export class CerebrasService {
    async generateMemecoinNames(request: GenerateMemecoinNamesRequest): Promise<GenerateMemecoinNamesResponse> {
        const { theme, keywords, count = 5 } = request;
        
        const systemPrompt = `You are a creative naming assistant for cryptocurrency memecoins. 
Your task is to generate catchy, memorable, and creative names for memecoins.
Each suggestion should include:
- A creative token name
- A 3-5 character symbol (all uppercase)
- A brief description explaining the concept

Rules:
- Names should be fun, catchy, and crypto-appropriate
- Symbols should be 3-5 uppercase letters
- Avoid offensive or inappropriate content
- Make names memorable and easy to pronounce
- Consider current crypto trends and meme culture

Respond ONLY in JSON format with this structure:
{
  "suggestions": [
    {
      "name": "Token Name",
      "symbol": "TKN",
      "description": "Brief description"
    }
  ]
}`;

        const userPrompt = `Generate ${count} memecoin name suggestions${theme ? ` with theme: "${theme}"` : ''}${keywords ? ` using keywords: "${keywords}"` : ''}.`;

        try {
            const stream = await cerebras.chat.completions.create({
                messages: [
                    {
                        role: "system",
                        content: systemPrompt
                    },
                    {
                        role: "user",
                        content: userPrompt
                    }
                ],
                model: 'llama3.1-8b',
                stream: true,
                max_completion_tokens: 2048,
                temperature: 0.9,
                top_p: 1
            });

            let fullResponse = '';
            for await (const chunk of stream) {
                //@ts-ignore
                fullResponse += chunk.choices[0]?.delta?.content || '';
            }

            // Clean response: remove markdown code blocks
            let cleaned = fullResponse.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();

            // Extract JSON from the response
            const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
            if (!jsonMatch) {
                throw new Error('No valid JSON found in response');
            }

            let parsed: any;
            try {
                parsed = JSON.parse(jsonMatch[0]);
            } catch {
                // Try fixing common issues: trailing commas, single quotes
                let fixed = jsonMatch[0]
                    .replace(/,\s*([\]}])/g, '$1')
                    .replace(/'/g, '"');
                parsed = JSON.parse(fixed);
            }
            
            // Validate the response structure
            if (!parsed.suggestions || !Array.isArray(parsed.suggestions)) {
                throw new Error('Invalid response structure');
            }

            return {
                suggestions: parsed.suggestions.slice(0, count).map((s: any) => ({
                    name: String(s.name || ''),
                    symbol: String(s.symbol || '').toUpperCase(),
                    description: String(s.description || '')
                }))
            };
        } catch (error) {
            console.error('Error generating memecoin names:', error);
            return {
                suggestions: [
                    { name: "MoonRocket", symbol: "MOON", description: "To the moon and beyond" },
                    { name: "DogeKing", symbol: "DKING", description: "The king of all dog coins" },
                    { name: "PepeCash", symbol: "PEPE", description: "Rare digital pepe currency" },
                    { name: "ShibaNova", symbol: "SHNOVA", description: "A new supernova of shiba energy" },
                    { name: "CryptoBanana", symbol: "BANANA", description: "The fun side of crypto" },
                ].slice(0, count)
            };
        }
    }

    async generateDescription(request: GenerateDescriptionRequest): Promise<GenerateDescriptionResponse> {
        const { type, tokenName, tokenSymbol, amount, lockDays, multiplier } = request;
        
        let systemPrompt = '';
        let userPrompt = '';

        if (type === 'airdrop') {
            systemPrompt = `You are a creative marketing copywriter for crypto airdrops.
Generate an exciting, engaging description for a token airdrop.
Keep it under 200 characters. Use emojis sparingly.
Make it sound exclusive and urgent.
Respond with ONLY the description text, no quotes or formatting.`;
            userPrompt = `Generate a description for an airdrop of ${amount || 'some'} ${tokenSymbol} (${tokenName}) tokens.`;
        } else {
            systemPrompt = `You are a creative marketing copywriter for crypto staking pools.
Generate an exciting, engaging description for a staking pool.
Keep it under 200 characters. Use emojis sparingly.
Highlight the benefits: rewards, multiplier, APY potential.
Respond with ONLY the description text, no quotes or formatting.`;
            userPrompt = `Generate a description for a staking pool of ${tokenSymbol} (${tokenName}) with ${lockDays || 30} day lock period and ${multiplier || '1.5'}x multiplier, offering ${amount || 'some'} tokens as rewards.`;
        }

        try {
            const stream = await cerebras.chat.completions.create({
                messages: [
                    { role: "system", content: systemPrompt },
                    { role: "user", content: userPrompt }
                ],
                model: 'llama3.1-8b',
                stream: true,
                max_completion_tokens: 512,
                temperature: 0.8,
                top_p: 1
            });

            let fullResponse = '';
            for await (const chunk of stream) {
                //@ts-ignore
                fullResponse += chunk.choices[0]?.delta?.content || '';
            }

            return { description: fullResponse.trim().slice(0, 300) };
        } catch (error) {
            console.error('Error generating description:', error);
            return {
                description: type === 'airdrop' 
                    ? `Don't miss this exclusive airdrop of ${amount || 'tokens'} ${tokenSymbol}! Claim your share before they run out.`
                    : `Stake ${tokenName} and earn up to ${multiplier || '1.5'}x rewards. Grow your holdings!`
            };
        }
    }
}
