const axios = require('axios')

const handlers = require('./handlers')
const messages = require('./messages')

const VALID_EVENTS = [
    'block.applied', 'block.forged', 'block.reverted', 'delegate.registered', 'delegate.resigned',
    'forger.failed', 'forger.missing', 'forger.started', 'peer.added', 'peer.removed',
    'transaction.applied', 'transaction.expired', 'transaction.forged', 'transaction.reverted',
    'wallet.vote', 'wallet.unvote'
]

module.exports = class App {
    constructor(app) {
        this.events = {}
        this.emitter = app.resolvePlugin('event-emitter')
        this.logger = app.resolvePlugin('logger')
    }

    listen(options) {
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

    subscribe(event) {
        const context = {
            foo: 'bar',
            event: event,
            eventName: event,
            events: this.events,
            detectPlatform: this.detectPlatform,
            getMessage: this.getMessage,
            logger: this.logger
        }
        console.log('>>> event:', event)
        console.log('>>> Context:', context)
        this.emitter.on(event, async data => {
            let payload = {}
            console.log('>>> this', this)
            console.log('>>> this.context', this.context)
            console.log('>>> context', context)
            console.log('>>> this.foo', this.foo)
            console.log('>>> event', event)
            console.log('>>> this.event', this.event)
            console.log('>>> eventName', eventName)
            console.log('>>> this.eventName', this.eventName)
            console.log('>>> this.events', this.events)
            console.log('>>> handlers', handlers)
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

    getMessage(platform, event, data) {
        return messages[platform][event](...data)
    }

    detectPlatform(endpoint) {
        if (endpoint.includes('hooks.slack.com')) {
            return 'slack'
        } else if (endpoint.includes('discordapp.com')) {
            return 'discord'
        } else {
            return 'fallback'
        }
    }
}
