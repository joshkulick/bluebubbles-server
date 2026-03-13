import { createHmac } from "crypto";
import axios from "axios";
import { Server } from "@server";
import { Loggable } from "@server/lib/logging/Loggable";

export type WebhookEvent = {
    type: string;
    data: any;
};

/**
 * Handles dispatching webhooks
 */
export class WebhookService extends Loggable {
    tag = "WebhookService";

    async dispatch(event: WebhookEvent) {
        const webhooks = await Server().repo.getWebhooks();
        for (const i of webhooks) {
            const eventTypes = JSON.parse(i.events) as Array<string>;
            if (!eventTypes.includes("*") && !eventTypes.includes(event.type)) continue;
            this.log.debug(`Dispatching event to webhook: ${i.url}`);

            // We don't need to await this
            this.sendPost(i.url, event).catch(ex => {
                this.log.debug(`Failed to dispatch "${event.type}" event to webhook: ${i.url}`);
                this.log.debug(`  -> Error: ${ex?.message ?? String(ex)}`);
                this.log.debug(`  -> Status Text: ${ex?.response?.statusText}`);
            });
        }
    }

    private getSecret(): string {
        return Server().repo.getConfig("webhook_secret") as string ?? "";
    }

    private async sendPost(url: string, event: WebhookEvent) {
        const rawBody = JSON.stringify(event);
        const headers: Record<string, string> = { "Content-Type": "application/json" };

        const secret = this.getSecret();
        if (secret) {
            headers["X-Webhook-Signature"] = createHmac("sha256", secret).update(rawBody).digest("hex");
        }

        return await axios.post(url, rawBody, { headers });
    }
}
