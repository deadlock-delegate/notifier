const discord = {
    'wallet.vote': (address, username, balance, txid) => {
        return `⬆️ **${address}** voted for **${username}** with **${balance} ARK**. [Open transaction](https://explorer.ark.io/transaction/${txid})`
    },
    'wallet.unvote': (address, username, balance, txid) => {
        return `⬇️ **${address}** unvoted **${username}** with **${balance} ARK**. [Open transaction](https://explorer.ark.io/transaction/${txid})`
    },
    'forger.missing': (hostname) => {
        return `Forger missing on ${hostname}`
    },
    'forger.failed': (hostname, error) => {
        return `Forger failed on ${hostname}: ${error}`
    },
    'forger.started': (hostname) => {
        return `Forger started on ${hostname}`
    },
    'block.forged': (hostname) => {
        return `Forged a new block on ${hostname}`
    }
}

const slack = {
    'wallet.vote': (address, username, balance, txid) => {
        return `⬆️ *${address}* voted for *${username}* with *${balance} ARK*. <https://explorer.ark.io/transaction/${txid}|Open transaction>`
    },
    'wallet.unvote': (address, username, balance, txid) => {
        return `⬇️ *${address}* unvoted *${username}* with *${balance} ARK*. <https://explorer.ark.io/transaction/${txid}|Open transaction>`
    },
    'forger.missing': (hostname) => {
        return `Forger missing on ${hostname}`
    },
    'forger.failed': (hostname, error) => {
        return `Forger failed on ${hostname}: ${error}`
    },
    'block.forged': (hostname) => {
        return `Forged a new block on ${hostname}`
    }
}

const fallback = {
    'wallet.vote': (address, username, balance, txid) => {
        return `⬆️ ${address} voted for ${username} with ${balance} ARK. https://explorer.ark.io/transaction/${txid}`
    },
    'wallet.unvote': (address, username, balance, txid) => {
        return `⬇️ ${address} unvoted ${username} with ${balance} ARK. https://explorer.ark.io/transaction/${txid}`
    },
    'forger.missing': (hostname) => {
        return `Forger missing on ${hostname}`
    },
    'forger.failed': (hostname, error) => {
        return `Forger failed on ${hostname}: ${error}`
    },
    'block.forged': (hostname) => {
        return `Forged a new block on ${hostname}`
    }
}

module.exports = {
    discord,
    slack,
    fallback
}
