# Ark Notifier Plugin

This plugin calls webhooks when a certain events occurs. You can use it to post alerts on Slack,
Discord, send Emails/SMS or use whichever service that supports webhooks.

#### ❤️ Support maintenance and development of plugins
If you find this or other plugins useful please consider

- voting for `deadlock` delegate
- donating to `AWtgFYbvtLDYccJvC5MChk4dpiUy2Krt2U`

to support development new plugins and tools for Ark's Ecosystem and maintenance of existing ones. Full list of contributions can be found on [https://arkdelegatesio/delegate/deadlock/](https://arkdelegates.io/delegate/deadlock/contributions/). 🖖

## Installation

#### For production:

`yarn global add @deadlock-delegate/notifier`

#### For development:

```bash
cd ~/ark-core/plugins
git clone https://github.com/deadlock-delegate/notifier
lerna bootstrap
```

### Registration

Open `~/.config/ark-core/{mainnet|devnet|testnet}/plugins.js` and add the following at the end (it has to be bellow p2p and api).

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
    webhooks: [{
      endpoint: 'https://discordapp.com/api/webhooks/612412465124612462/A1Ag12F&ijafa-3mtASA121mja',
      payload: {
        msg: 'content'
      },
      events: ['wallet.vote', 'wallet.unvote', 'forger.missing', 'forger.failed']
    }, {
      endpoint: 'https://hooks.slack.com/services/T1212ASDA/BAEWAS12/ASxASJL901ajkS',
      payload: {
        msg: 'text'
      },
      events: ['wallet.vote', 'wallet.unvote', 'forger.missing', 'forger.failed']
    },
    {
      endpoint: 'https://api.pushover.net/',
      payload: {
        msg: 'message',
        user: '<pushover user key>',
        token: '<pushover token>'
      },
      events: ['wallet.vote', 'wallet.unvote', 'forger.missing', 'forger.failed']
    }]
  }
}
```

### Configuration

```js
{
  enabled: true,  // true/false if you want to enable/disable the plugin
  webhooks: [{
    endpoint: 'webhook endpoint url',
    payload: {
      msg: 'name of the message field eg. discord has "content", slack has "text"'
    },
    events: ['list of events you want to subscribe to']
  }]
}
```

#### Events you can subscribe to

Handlers for unticked events haven't been implemented yet. Feel free to make a contribution.

- [x] wallet.vote
- [x] wallet.unvote
- [x] forger.missing
- [x] forger.failed
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
- [All Contributors](../../contributors)

## License

[MIT](LICENSE) © roks0n
