const discord = {
    'wallet.vote': (address, username, balance, txid) => {
        return `⬆️ **${address}** voted for **${username}** with **${balance} ARK**. [Open transaction](https://explorer.ark.io/transaction/${txid})`
    },
    'wallet.unvote': (address, username, balance, txid) => {
        return `⬇️ **${address}** unvoted **${username}** with **${balance} ARK**. [Open transaction](https://explorer.ark.io/transaction/${txid})`
    },
    'forger.missing': (hostname, username) => {
        return `${username} failed to forge in this round`
    },
    'forger.failed': (hostname, error) => {
        // only works if a plugin is running on a node with a forging process running
        return `Your forger failed to forge in this slot on ${hostname}: ${error}`
    },
    'forger.started': (hostname) => {
        return `Forger started on ${hostname}`
    },
    'block.forged': (hostname, blockId) => {
        return `Forged a new block ${blockId} on ${hostname}`
    }
}

const slack = {
    'wallet.vote': (address, username, balance, txid) => {
        return `⬆️ *${address}* voted for *${username}* with *${balance} ARK*. <https://explorer.ark.io/transaction/${txid}|Open transaction>`
    },
    'wallet.unvote': (address, username, balance, txid) => {
        return `⬇️ *${address}* unvoted *${username}* with *${balance} ARK*. <https://explorer.ark.io/transaction/${txid}|Open transaction>`
    },
    'forger.missing': (hostname, username) => {
        return `${username} failed to forge in this round`
    },
    'forger.failed': (hostname, error) => {
        // only works if a plugin is running on a node with a forging process running
        return `Your forger failed to forge in this slot on ${hostname}: ${error}`
    },
    'forger.started': (hostname) => {
        return `Forger started on ${hostname}`
    },
    'block.forged': (hostname, blockId) => {
        return `Forged a new block ${blockId} on ${hostname}`
    }
}

const fallback = {
    'wallet.vote': (address, username, balance, txid) => {
        return `⬆️ ${address} voted for ${username} with ${balance} ARK. https://explorer.ark.io/transaction/${txid}`
    },
    'wallet.unvote': (address, username, balance, txid) => {
        return `⬇️ ${address} unvoted ${username} with ${balance} ARK. https://explorer.ark.io/transaction/${txid}`
    },
    'forger.missing': (hostname, username) => {
        return `${username} failed to forge in this round`
    },
    'forger.failed': (hostname, error) => {
        // only works if a plugin is running on a node with a forging process running
        return `Your forger failed to forge in this slot on ${hostname}: ${error}`
    },
    'forger.started': (hostname) => {
        return `Forger started on ${hostname}`
    },
    'block.forged': (hostname, blockId) => {
        return `Forged a new block ${blockId} on ${hostname}`
    }
}

module.exports = {
    discord,
    slack,
    fallback
}
