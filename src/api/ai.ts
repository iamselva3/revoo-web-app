import { apiClient } from './client';

export interface AiChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface AiChatContext {
  currentPath?: string;
  category?: string;
  brand?: string;
  cityName?: string;
}

export const aiApi = {
  async sendMessage(messages: AiChatMessage[], context?: AiChatContext): Promise<string> {
    try {
      const res = await apiClient.post<{ success: boolean; message: string }>('/ai/chat', {
        messages,
        context,
      });
      if (res.data && res.data.message) {
        return res.data.message;
      }
      throw new Error('Empty response from AI service');
    } catch (err) {
      console.warn('AI endpoint failed or offline, using fallback:', err);
      return generateLocalFallback(messages[messages.length - 1]?.content || '');
    }
  },

  async getStatus(): Promise<{ configured: boolean; model?: string }> {
    try {
      const res = await apiClient.get<{ success: boolean; configured: boolean; model?: string }>('/ai/status');
      return res.data;
    } catch {
      return { configured: false };
    }
  },
};

function generateLocalFallback(query: string): string {
  const q = query.toLowerCase();

  if (q.includes('sell') || q.includes('phone') || q.includes('mobile') || q.includes('old') || q.includes('price')) {
    return (
      `You can sell your device on Genie in 3 easy steps:\n\n` +
      `1. **Instant Valuation**: Choose your brand & model to see the top guaranteed price in under 60 seconds.\n` +
      `2. **Free Doorstep Pickup**: Book your convenient date and time anywhere in Tamil Nadu.\n` +
      `3. **Instant Payment**: Get paid on the spot via UPI, IMPS, or Cash before our agent leaves.\n\n` +
      `👉 [Sell Your Mobile Phone](/sell?category=phone)`
    );
  }

  if (q.includes('track') || q.includes('order') || q.includes('status') || q.includes('request') || q.includes('genie-')) {
    return (
      `Track your buyback request in real time:\n\n` +
      `• Enter your request number (e.g. \`GENIE-2026-XXXX\`) or registered mobile number.\n` +
      `• See assigned collector details, scheduled pickup time, and payment status.\n\n` +
      `👉 [Track Your Order](/track)`
    );
  }

  if (q.includes('pickup') || q.includes('doorstep') || q.includes('city') || q.includes('tamil') || q.includes('location')) {
    return (
      `🚚 **100% Free Doorstep Pickup** across all districts of Tamil Nadu!\n\n` +
      `Our verified agents serve Chennai, Coimbatore, Madurai, Tiruchirappalli, Salem, Tirunelveli, Erode, Vellore, Srivilliputhur, and all surrounding areas.\n\n` +
      `👉 [Doorstep Pickup Information](/pickup)`
    );
  }

  if (q.includes('buy') || q.includes('refurbished') || q.includes('used') || q.includes('store')) {
    return (
      `Looking for certified phones at great prices?\n\n` +
      `• 32-point hardware and software inspection\n` +
      `• 1-Year Comprehensive Genie Warranty\n` +
      `• 7-day hassle-free replacement guarantee\n\n` +
      `👉 [Browse Certified Phones Store](/buy)`
    );
  }

  return (
    `Vanakkam! I'm your **Genie AI Assistant** ✨\n\n` +
    `I can help you navigate Genie, check instant device valuations, book free pickups, or track orders:\n\n` +
    `• [Sell Your Device](/sell)\n` +
    `• [Track Your Request](/track)\n` +
    `• [Certified Phones Store](/buy)\n\n` +
    `How can I assist you today?`
  );
}
