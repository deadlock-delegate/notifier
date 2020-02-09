const axios = require('axios')
const os = require('os')

const messages = require('./messages')

const VALID_EVENTS = [
    'block.applied', 'block.forged', 'block.reverted', 'delegate.registered', 'delegate.resigned',
    'forger.failed', 'forger.missing', 'forger.started', 'peer.added', 'peer.removed',
    'transaction.applied', 'transaction.expired', 'transaction.forged', 'transaction.reverted',
    'wallet.vote', 'wallet.unvote'
]

module.exports = class App {
    constructor (container) {
        this.container = container
        this.events = {}
        this.emitter = container.resolvePlugin('event-emitter')
        this.logger = container.resolvePlugin('logger')
        this.database = container.resolvePlugin('database')
    }

    listen (options) {
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
        const context = {
            eventName: event, // must not have name "event"!
            events: this.events,
            detectPlatform: this.detectPlatform,
            getMessage: this.getMessage,
            logger: this.logger,
            handlers: {
                'wallet.vote': this.walletVote,
                'wallet.unvote': this.walletUnvote,
                'forger.missing': this.forgerMissing,
                'forger.failed': this.forgerFailed,
                'forger.started': this.forgerStarted,
                'block.forged': this.blockForged
            }
        }
        this.emitter.on(event, async function (data) {
            let payload = {}
            const webhooks = this.events[this.eventName]
            const messageData = await this.handlers[this.eventName](data)
            let requests = []
            for (const webhook of webhooks) {
                const platform = this.detectPlatform(webhook.endpoint)
                let message = this.getMessage(platform, this.eventName, messageData)
                payload[webhook.payload.msg] = message

                // todo: this should be nicer so no checks for platform === pushover would be needed
                // quick change to handle pushover a little differently
                if (platform === 'pushover') {
                    if (!webhook.payload.token || !webhook.payload.user) {
                        this.logger.error('Unable to setup pushover notifications. User and token params must be set')
                        continue
                    }
                    payload = {...payload, token: webhook.payload.token, user: webhook.payload.user}
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
        } else if (endpoint.includes('discordapp.com')) {
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
        const voter = await this.database.wallets.findById(transaction.senderPublicKey)
        const balance = parseFloat(voter.balance / 1e8).toFixed(2)
        return [voter.address, delegate.username, balance, transaction.id]
    }

    async walletUnvote (data) {
        const transaction = data.transaction
        const delegatePubKey = transaction.asset.votes[0].slice(1)
        const delegate = this.database.walletManager.findByPublicKey(delegatePubKey)
        const voter = await this.database.wallets.findById(transaction.senderPublicKey)
        const balance = parseFloat(voter.balance / 1e8).toFixed(2)
        return [voter.address, delegate.username, balance, transaction.id]
    }

    async forgerMissing (data) {
        console.log('>>> 0', data)
        console.log('>>> 1', data.delegate)
        console.log('>>> 2', data.getAttribute('delegate'))
        console.log('>>> 3', data.getAttribute('delegate.username'))
        return [os.hostname(), data.getAttribute('delegate.username')]
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
}
