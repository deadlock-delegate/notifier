const axios = require('axios')

const handlers = require('./handlers')
const messages = require('./messages')

const VALID_EVENTS = [
    'block.applied', 'block.forged', 'block.reverted', 'delegate.registered', 'delegate.resigned',
    'forger.failed', 'forger.missing', 'forger.started', 'peer.added', 'peer.removed',
    'transaction.applied', 'transaction.expired', 'transaction.forged', 'transaction.reverted',
    'wallet.vote', 'wallet.unvote'
]

class App {
    constructor () {
        this.events = {}
        this.emmiter = undefined
        this.logger = undefined
    }

    listen (container, options) {
        this.emitter = container.resolvePlugin('event-emitter')
        this.logger = container.resolvePlugin('logger')

        this.setUp(options.webhooks)
        Object.keys(this.events).map(event => this.subscribe(event))
    }

    setUp (webhooks) {
        for (const webhook of webhooks) {
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
    }

    subscribe (event) {
        const context = {
            event,
            events: this.events,
            detectPlatform: this.detectPlatform,
            getMessage: this.getMessage,
            logger: this.logger
        }

        this.emitter.on(event, async function (data) {
            let payload = {}
            const webhooks = this.events[this.event]
            const messageData = await handlers[this.event](data)

            let requests = []
            for (const webhook of webhooks) {
                const platform = this.detectPlatform(webhook.endpoint)
                const message = this.getMessage(platform, this.event, messageData)
                payload[webhook.payload.msg] = message
                requests.push(axios.post(webhook.endpoint, payload))
            }

            // don't care about the response msg except if there's an error
            Promise.all(requests).catch(error => this.logger.error(error))
        }, context)
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

module.exports = new App()
