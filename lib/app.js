const axios = require('axios')
const os = require('os')

const messages = require('./messages')

const VALID_EVENTS = [
    'block.applied', 'block.forged', 'block.reverted', 'delegate.registered', 'delegate.resigned',
    'forger.failed', 'forger.missing', 'forger.started', 'peer.added', 'peer.removed',
    'transaction.applied', 'transaction.expired', 'transaction.forged', 'transaction.reverted',
    'wallet.vote', 'wallet.unvote', 'round.created', 'activedelegateschanged'
]

const CUSTOM_EVENTS = ['activedelegateschanged']
const CUSTOM_EVENT_MAPPING = {
    activedelegateschanged: 'round.created'
}

let LAST_ACTIVE_DELEGATES_CACHED = []

module.exports = class App {
    constructor (container) {
        this.container = container
        this.events = {}
        this.emitter = container.resolvePlugin('event-emitter')
        this.logger = container.resolvePlugin('logger')
        this.database = container.resolvePlugin('database')
    }

    async listen (options) {
        const currentActiveDelegateList = await this.database.getActiveDelegates()
        LAST_ACTIVE_DELEGATES_CACHED = currentActiveDelegateList.map(wallet => wallet.attributes.delegate.username)

        for (const webhook of options.webhooks) {
            for (const event of webhook.events) {
                if (!VALID_EVENTS.includes(event)) {
                    this.logger.warning(`${event} is not a valid event. Check events in your deadlock-notifier configuration`)
                    continue
                }

                if (!this.events[event]) {
                    this.events[event] = []
                }

                this.events[event].push({
                    endpoint: webhook.endpoint,
                    payload: webhook.payload
                })
            }
        }
        Object.keys(this.events).forEach(event => this.subscribe(event))
    }

    subscribe (event) {
        let customEventName = null
        if (CUSTOM_EVENTS.includes(event)) {
            customEventName = event
            event = CUSTOM_EVENT_MAPPING[event]
        }
        const context = {
            eventName: event,
            customEventName: customEventName,
            events: this.events,
            detectPlatform: this.detectPlatform,
            getMessage: this.getMessage,
            logger: this.logger,
            handlers: {
                'wallet.vote': this.walletVote.bind({ database: this.database }),
                'wallet.unvote': this.walletUnvote.bind({ database: this.database }),
                'forger.missing': this.forgerMissing,
                'forger.failed': this.forgerFailed,
                'forger.started': this.forgerStarted,
                'block.forged': this.blockForged,
                'round.created': this.roundCreated,
                activedelegateschanged: this.activeDelegatesChanged
            }
        }
        this.emitter.on(event, async function (data) {
            let payload = {}
            const eventName = this.customEventName ? this.customEventName : this.eventName
            const webhooks = this.events[eventName]
            const messageData = await this.handlers[eventName](data)
            if (!messageData) {
                return
            }
            const requests = []
            for (const webhook of webhooks) {
                const platform = this.detectPlatform(webhook.endpoint)
                const message = this.getMessage(platform, eventName, messageData)
                // todo: `webhook.payload.msg` is the name of the message field eg. discord has "content", slack has "text", make this a bit smarter ;)
                payload[webhook.payload.msg] = message

                // todo: this should be nicer so no checks for platform === pushover would be needed
                // quick change to handle pushover a little differently
                if (platform === 'pushover') {
                    if (!webhook.payload.token || !webhook.payload.user) {
                        this.logger.error('Unable to setup pushover notifications. User and token params must be set')
                        continue
                    }
                    payload = { ...payload, token: webhook.payload.token, user: webhook.payload.user }
                }

                requests.push(axios.post(webhook.endpoint, payload))
            }

            // don't care about the response msg except if there's an error
            Promise.all(requests).catch(error => this.logger.error(error))
        }.bind(context))
    }

    getMessage (platform, event, data) {
        // todo: this should be nicer so no checks for platform === pushover would be needed
        if (platform === 'pushover') {
            platform = 'fallback'
        }
        return messages[platform][event](...data)
    }

    detectPlatform (endpoint) {
        if (endpoint.includes('hooks.slack.com')) {
            return 'slack'
        } else if (endpoint.includes('discordapp.com') || endpoint.includes('discord.com')) {
            return 'discord'
        } else if (endpoint.includes('pushover.net')) {
            return 'pushover'
        } else {
            return 'fallback'
        }
    }

    async walletVote (data) {
        const transaction = data.transaction
        const delegatePubKey = transaction.asset.votes[0].slice(1)
        const delegate = this.database.walletManager.findByPublicKey(delegatePubKey)
        const voter = await this.database.walletManager.findByPublicKey(transaction.senderPublicKey)
        const balance = parseFloat(voter.balance / 1e8).toFixed(2)
        return [voter.address, delegate.attributes.delegate.username, balance, transaction.id]
    }

    async walletUnvote (data) {
        const transaction = data.transaction
        const delegatePubKey = transaction.asset.votes[0].slice(1)
        const delegate = this.database.walletManager.findByPublicKey(delegatePubKey)
        const voter = await this.database.walletManager.findByPublicKey(transaction.senderPublicKey)
        const balance = parseFloat(voter.balance / 1e8).toFixed(2)
        return [voter.address, delegate.attributes.delegate.username, balance, transaction.id]
    }

    async forgerMissing (data) {
        return [os.hostname(), data.delegate.getAttribute('delegate.username')]
    }

    async forgerFailed (error) {
        return [os.hostname(), error]
    }

    async forgerStarted (data) {
        return [os.hostname]
    }

    async blockForged (data) {
        return [os.hostname(), data.id]
    }

    async roundCreated (activeDelegates) {
        return [activeDelegates]
    }

    async activeDelegatesChanged (activeDelegates) {
        const previouslyActiveDelegates = LAST_ACTIVE_DELEGATES_CACHED
        const newActiveDelegates = activeDelegates.map(wallet => wallet.attributes.delegate.username)

        const droppedOutDelegates = previouslyActiveDelegates.filter(x => !newActiveDelegates.includes(x))
        const newDelegates = newActiveDelegates.filter(x => !previouslyActiveDelegates.includes(x))

        if (droppedOutDelegates.length === 0 && newDelegates.length === 0) {
            return null
        }

        // cache new active delegates for the next round so we know which ones change
        LAST_ACTIVE_DELEGATES_CACHED = newActiveDelegates
        return [newDelegates, droppedOutDelegates]
    }
}
