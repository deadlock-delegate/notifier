# Ark Notifier Plugin

This plugin calls webhooks when a certain events occurs. You can use it to post alerts on Slack,
Discord, send Emails/SMS or use whichever service that supports webhooks.

#### ❤️ Support maintenance and development of plugins
If you find this or other plugins useful please consider

- voting for `deadlock` delegate
- donating to `AWtgFYbvtLDYccJvC5MChk4dpiUy2Krt2U`

to support development new plugins and tools for Ark's Ecosystem and maintenance of existing ones. Full list of contributions can be found on [https://arkdelegates.live/delegate/deadlock/](https://arkdelegates.live/delegate/deadlock/contributions/). 🖖

## Installation

### Adding plugin to config

Before restarting your process, you need to add the plugin into the very end  `core.plugins` or `relay.plugins` section of `app.json` file:

```json
{
    "package": "@deadlock-delegate/notifier",
    "options": {
        "enabled": true,
        "webhooks": [{
          "endpoint": "https://discordapp.com/api/webhooks/612412465124612462/A1Ag12F&ijafa-3mtASA121mja",
          "payload": {
            "msg": "content"
          },
          "events": ["wallet.vote", "wallet.unvote", "forger.missing", "forger.failed"]
        }, {
          "endpoint": "https://hooks.slack.com/services/T1212ASDA/BAEWAS12/ASxASJL901ajkS",
          "payload": {
            "msg": "text"
          },
          "events": ["wallet.vote", "wallet.unvote", "forger.missing", "forger.failed"]
        },
        {
          "endpoint": "https://api.pushover.net/",
          "payload": {
            "msg": "message",
            "user": "<pushover user key>",
            "token": "<pushover token>"
          },
          "events": ["forger.missing", "forger.failed"]
        }]
      }
    }
}
```

### For production (eg. devnet/mainnet):

1. Install plugin: `ark plugin:install @deadlock-delegate/notifier`
2. Add plugin to `app.json`
3. Start your node as you usually start it 

### For development (eg. testnet):

Assuming you don't run testnet locally via docker:

1. Clone this plugin into `plugins/` directory of the [core](https://github.com/ArkEcosystem/core/) project
2. Add plugin to `app.json`, for testnet the file can be found in: `core/packages/core/bin/config/testnet/app.json`
3. Go into the plugin's directory: `cd notifier`
4. Build plugin: `yarn build`
5. Run `yarn full:testnet` inside `core/packages/core` directory to start testnet with notifier plugin

### Configuration explanation

```json
{
  "package": "@deadlock-delegate/notifier",
  "options": {
    "enabled": true,
    "webhooks": [{
      "endpoint": "webhook endpoint url",
      "payload": {
        "msg": "name of the message field eg. Discord has 'content', Slack has 'text', Pushover has 'message'"
      },
      "events": ["list of events you want to subscribe to"]
    }]
  }
}
```

#### Events you can subscribe to

Handlers for unticked events haven't been implemented yet. Feel free to make a contribution.

- [x] wallet.vote
- [x] wallet.unvote
- [x] forger.missing - when a delegate fails to forge in a round (could be any delegate)
- [x] forger.failed - if your forger process fails to forge (only works if a plugin is running on a node with a forging process running)
- [x] forger.started - when your forging process starts
- [ ] block.applied
- [x] block.forged - when your forging process forges a new block
- [ ] block.reverted
- [x] delegate.registered
- [x] delegate.resigned
- [ ] peer.added
- [ ] peer.removed
- [ ] transaction.applied
- [ ] transaction.expired
- [ ] transaction.forged
- [ ] transaction.reverted
- [x] activedelegateschanged - when active delegates change (voted out/in) (note: this is a custom event and does not existing in `core`!)

## Credits

- [roks0n](https://github.com/roks0n)
- [console](https://github.com/c0nsol3/)
- [All Contributors](../../contributors)

## License

[MIT](LICENSE) © deadlock delegate
