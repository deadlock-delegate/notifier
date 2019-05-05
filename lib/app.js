const axios = require('axios')
const { app } = require('@arkecosystem/core-container')

const handlers = require('./handlers')
const messages = require('./messages')

const VALID_EVENTS = [
    'block.applied', 'block.forged', 'block.reverted', 'delegate.registered', 'delegate.resigned',
    'forger.failed', 'forger.missing', 'forger.started', 'peer.added', 'peer.removed',
    'transaction.applied', 'transaction.expired', 'transaction.forged', 'transaction.reverted',
    'wallet.vote', 'wallet.unvote'
]

module.exports = class App {
    constructor () {
        this.events = {}
        this.emitter = app.resolvePlugin('event-emitter')
        this.logger = app.resolvePlugin('logger')
        this.database = app.resolvePlugin('database')
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
            logger: this.logger
        }
        this.emitter.on(event, async function (data) {
            let payload = {}
            const webhooks = this.events[this.eventName]
            const messageData = await handlers[this.eventName](data)
            let requests = []
            for (const webhook of webhooks) {
                const platform = this.detectPlatform(webhook.endpoint)
                const message = this.getMessage(platform, this.eventName, messageData)
                payload[webhook.payload.msg] = message
                requests.push(axios.post(webhook.endpoint, payload))
            }

            // don't care about the response msg except if there's an error
            Promise.all(requests).catch(error => this.logger.error(error))
        }.bind(context))
    }

    getMessage (platform, event, data) {
        return messages[platform][event](...data)
    }

    detectPlatform (endpoint) {
        if (endpoint.includes('hooks.slack.com')) {
            return 'slack'
        } else if (endpoint.includes('discordapp.com')) {
            return 'discord'
        } else {
            return 'fallback'
        }
    }
}
