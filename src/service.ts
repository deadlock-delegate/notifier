import { Container, Contracts, Enums as AppEnums, Services, Utils as AppUtils } from "@arkecosystem/core-kernel";
import { Interfaces, Utils as CryptoUtils } from "@arkecosystem/crypto";
import axios from "axios";
import os from "os";

import { IOptions } from "./interface";
import * as messages from "./messages";

const VALID_EVENTS = [
    "block.applied",
    "block.forged",
    "block.reverted",
    "delegate.registered",
    "delegate.resigned",
    "forger.failed",
    "forger.missing",
    "forger.started",
    "peer.added",
    "peer.removed",
    "transaction.applied",
    "transaction.expired",
    "transaction.forged",
    "transaction.reverted",
    "wallet.vote",
    "wallet.unvote",
    "round.created",
    "activedelegateschanged",
];

const CUSTOM_EVENTS = ["activedelegateschanged"];
const CUSTOM_EVENT_MAPPING = {
    activedelegateschanged: AppEnums.BlockEvent.Forged, // AppEnums.RoundEvent.Created,
};

let LAST_ACTIVE_DELEGATES_CACHED: string[] = [];

@Container.injectable()
export default class Service {
    @Container.inject(Container.Identifiers.EventDispatcherService)
    private readonly emitter!: Contracts.Kernel.EventDispatcher;

    @Container.inject(Container.Identifiers.LogService)
    private readonly logger!: Contracts.Kernel.Logger;

    @Container.inject(Container.Identifiers.TriggerService)
    private readonly triggers!: Services.Triggers.Triggers;

    // @Container.inject(Container.Identifiers.DposState)
    // @Container.tagged("state", "clone")
    // private readonly dposState!: Contracts.State.DposState;

    @Container.inject(Container.Identifiers.WalletRepository)
    // why state, blockchain - why not state, clone?
    @Container.tagged("state", "blockchain")
    private readonly walletRepository!: Contracts.State.WalletRepository;

    private events = {};

    public async listen(options: IOptions): Promise<void> {
        LAST_ACTIVE_DELEGATES_CACHED = await this.getActiveDelegates();

        for (const webhook of options.webhooks) {
            for (const event of webhook.events) {
                if (!VALID_EVENTS.includes(event)) {
                    this.logger.warning(
                        `[deadlock-delegate/notifier] ${event} is not a valid event. Check events in your deadlock-notifier configuration`,
                    );
                    continue;
                }

                if (!this.events[event]) {
                    this.events[event] = [];
                }

                this.events[event].push({
                    endpoint: webhook.endpoint,
                    payload: webhook.payload,
                });
            }
        }
        Object.keys(this.events).forEach((event) => this.subscribe(event));
    }

    private async getActiveDelegates() {
        // im not sure why I need to use triggers, but trying to inject dposState and calling
        // getActiveDelegates method from there didn't work
        const activeDelegates: Contracts.State.Wallet[] | undefined = await this.triggers.call(
            "getActiveDelegates",
            {},
        );
        if (!activeDelegates) return [];
        return activeDelegates.map((wallet) => wallet.getAttribute("delegate.username"));
    }

    private subscribe(event: string) {
        let customEventName: string | undefined = undefined;
        if (CUSTOM_EVENTS.includes(event)) {
            customEventName = event;
            event = CUSTOM_EVENT_MAPPING[event];
        }

        // for some yet unknown reason, if handlers are defined at the class level, we can not access
        // walletRepositoiry or triggers (or other) within each handle functions
        const handlers = {
            [AppEnums.VoteEvent.Vote]: this.walletVote.bind({ walletRepository: this.walletRepository }),
            [AppEnums.VoteEvent.Unvote]: this.walletUnvote.bind({ walletRepository: this.walletRepository }),
            [AppEnums.ForgerEvent.Missing]: this.forgerMissing,
            [AppEnums.ForgerEvent.Failed]: this.forgerFailed,
            [AppEnums.ForgerEvent.Started]: this.forgerStarted,
            [AppEnums.BlockEvent.Forged]: this.blockForged,
            [AppEnums.RoundEvent.Created]: this.roundCreated,
            activedelegateschanged: this.activeDelegatesChanged.bind({ triggers: this.triggers }),
        };

        this.emitter.listen(event, {
            handle: async (payload: any) => {
                let { name, data } = payload;
                // this.logger.debug(`[deadlock-delegate/notifier] Received ${name}: ${JSON.stringify(data)}`);

                const webhooks = this.events[name];

                if (customEventName === "activedelegateschanged") {
                    name = "activedelegateschanged";
                }

                if (!(name in handlers)) {
                    this.logger.error(`[deadlock-delegate/notifier] ${name} does not have a handler yet`);
                    return;
                }

                const messageData = await handlers[name](data);
                if (!messageData) {
                    return;
                }

                const requests: Promise<any>[] = [];
                for (const webhook of webhooks) {
                    const platform = this.detectPlatform(webhook.endpoint);
                    const message = this.getMessage(platform, name, messageData);
                    // todo: `webhook.payload.msg` is the name of the message field eg. discord has "content", slack has "text", make this a bit smarter ;)
                    payload[webhook.payload.msg] = message;

                    // todo: this should be nicer so no checks for platform === pushover would be needed
                    // quick change to handle pushover a little differently
                    if (platform === "pushover") {
                        if (!webhook.payload.token || !webhook.payload.user) {
                            this.logger.error(
                                "[deadlock-delegate/notifier] Unable to setup pushover notifications. User and token params must be set",
                            );
                            continue;
                        }
                        payload = { ...payload, token: webhook.payload.token, user: webhook.payload.user };
                    }
                    requests.push(axios.post(webhook.endpoint, payload));
                }

                // don't care about the response msg except if there's an error
                try {
                    await Promise.all(requests);
                } catch (err) {
                    this.logger.error(`[deadlock-delegate/notifier] ${err}`);
                }
            },
        });
    }

    private getMessage(platform: string, event: string, data: any) {
        // todo: this should be nicer so no checks for platform === pushover would be needed
        if (platform === "pushover") {
            platform = "fallback";
        }
        return messages[platform][event](...data);
    }

    private detectPlatform(endpoint: string) {
        if (endpoint.includes("hooks.slack.com")) {
            return "slack";
        } else if (endpoint.includes("discordapp.com") || endpoint.includes("discord.com")) {
            return "discord";
        } else if (endpoint.includes("pushover.net")) {
            return "pushover";
        } else {
            return "fallback";
        }
    }

    private async walletVote({
        delegate,
        transaction,
    }: {
        delegate: string;
        transaction: Interfaces.ITransactionData;
    }) {
        AppUtils.assert.defined<string>(transaction.senderPublicKey);
        const delPubKey = delegate.replace("+", "").replace("-", "");
        const delWallet = this.walletRepository.findByPublicKey(delPubKey);
        const voterWallet = this.walletRepository.findByPublicKey(transaction.senderPublicKey);
        const balance = CryptoUtils.formatSatoshi(voterWallet.getBalance()).replace("DѦ", "ARK");
        return [voterWallet.getAddress(), delWallet.getAttribute("delegate.username"), balance, transaction.id];
    }

    private async walletUnvote({
        delegate,
        transaction,
    }: {
        delegate: string;
        transaction: Interfaces.ITransactionData;
    }) {
        AppUtils.assert.defined<string>(transaction.senderPublicKey);
        const delPubKey = delegate.replace("+", "").replace("-", "");
        const delWallet = this.walletRepository.findByPublicKey(delPubKey);
        const voterWallet = this.walletRepository.findByPublicKey(transaction.senderPublicKey);
        const balance = CryptoUtils.formatSatoshi(voterWallet.getBalance()).replace("DѦ", "ARK");
        return [voterWallet.getAddress(), delWallet.getAttribute("delegate.username"), balance, transaction.id];
    }

    private async forgerMissing(wallet: Contracts.State.Wallet) {
        return [os.hostname(), wallet.getAttribute("delegate.username")];
    }

    private async forgerFailed(error) {
        return [os.hostname(), error];
    }

    private async forgerStarted(data) {
        return [os.hostname];
    }

    private async blockForged(block: Interfaces.IBlock) {
        return [os.hostname(), block.data.id];
    }

    private async roundCreated(activeDelegates: Contracts.State.Wallet[]) {
        return [activeDelegates];
    }

    private async activeDelegatesChanged(block: Interfaces.IBlock) {
        const previouslyActiveDelegates = LAST_ACTIVE_DELEGATES_CACHED;
        const latestDelegates = (await this.triggers.call("getActiveDelegates", {})) as Contracts.State.Wallet[];
        if (!latestDelegates) return [];
        const newActiveDelegates = latestDelegates.map((wallet) => wallet.getAttribute("delegate.username"));

        const droppedOutDelegates = previouslyActiveDelegates.filter((x) => !newActiveDelegates.includes(x));
        const newDelegates = newActiveDelegates.filter((x) => !previouslyActiveDelegates.includes(x));

        if (droppedOutDelegates.length === 0 && newDelegates.length === 0) {
            return null;
        }

        // cache new active delegates for the next round so we know which ones change
        LAST_ACTIVE_DELEGATES_CACHED = newActiveDelegates;
        return [newDelegates, droppedOutDelegates];
    }
}
