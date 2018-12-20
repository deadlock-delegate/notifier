# Ark Notifier Plugin

This plugin calls webhooks when a certain events occurs. You can use it to post alerts on Slack,
Discord, send Emails/SMS or use whichever service that supports webhooks.

## Installation

### Clone

```bash
cd ~/ark-core/plugins
git clone https://github.com/deadlock-delegate/notifier
lerna bootstrap
```

### Registration

Open `~/.ark/config/plugins.js` and add the following at the end (it has to be bellow p2p and api).

```js
'@deadlock/notifier': {}
```

like so:

```js
module.exports = {
  '@arkecosystem/core-event-emitter': {},
  '@arkecosystem/core-config': {},
  ...
  '@deadlock/notifier': {
    enabled: true,
    {
      endpoint: 'https://discordapp.com/api/webhooks/612412465124612462/A1Ag12F&ijafa-3mtASA121mja',
      payload: {
        msg: 'content'
      },
      events: ['wallet.vote', 'wallet.unvote', 'forger.missing']
    }, {
      endpoint: 'https://hooks.slack.com/services/T1212ASDA/BAEWAS12/ASxASJL901ajkS',
      payload: {
        msg: 'text'
      },
      events: ['wallet.vote', 'wallet.unvote', 'forger.missing']
    }
  }
}
```

### Configuration

```js
{
  enabled: true,  // true/false if you want to enable/disable the plugin
  {
    endpoint: 'webhook endpoint url',
    payload: {
      msg: 'name of the message field eg. discord has "content", slack has "text"'
    },
    events: ['list of events you want to subscribe to']
  }
}
```

#### Events you can subscribe to

Handlers for unticked events haven't been implemented yet. Feel free to make a contribution.

- [x] wallet.vote
- [x] wallet.unvote
- [x] forger.missing
- [ ] forger.failed
- [ ] forger.started
- [ ] block.applied
- [ ] block.forged
- [ ] block.reverted
- [ ] delegate.registered
- [ ] delegate.resigned
- [ ] peer.added
- [ ] peer.removed
- [ ] transaction.applied
- [ ] transaction.expired
- [ ] transaction.forged
- [ ] transaction.reverted

## Credits

- [roks0n](https://github.com/roks0n)
- [All Contributors](../../../../contributors)

## License

[MIT](LICENSE) © roks0n
