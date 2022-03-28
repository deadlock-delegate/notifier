export interface IWebhook {
    endpoint: string;
    events: string[];
    payload: { msg: string };
}

export interface IOptions {
    enabled: boolean;
    explorerTx: string;
    webhooks: IWebhook[];
}
