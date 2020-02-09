const discord = {
    'wallet.vote': (address, username, balance, txid) => {
        return `⬆️ **${address}** voted for **${username}** with **${balance} ARK**. [Open transaction](https://explorer.ark.io/transaction/${txid})`
    },
    'wallet.unvote': (address, username, balance, txid) => {
        return `⬇️ **${address}** unvoted **${username}** with **${balance} ARK**. [Open transaction](https://explorer.ark.io/transaction/${txid})`
    },
    'forger.missing': (username) => {
        return `**${username}** missed a block`
    },
    'forger.failed': (error) => {
        return error
    }
}

const slack = {
    'wallet.vote': (address, username, balance, txid) => {
        return `⬆️ *${address}* voted for *${username}* with *${balance} ARK*. <https://explorer.ark.io/transaction/${txid}|Open transaction>`
    },
    'wallet.unvote': (address, username, balance, txid) => {
        return `⬇️ *${address}* unvoted *${username}* with *${balance} ARK*. <https://explorer.ark.io/transaction/${txid}|Open transaction>`
    },
    'forger.missing': (username) => {
        return `*${username}* missed a block`
    },
    'forger.failed': (error) => {
        return error
    }
}

const fallback = {
    'wallet.vote': (address, username, balance, txid) => {
        return `⬆️ ${address} voted for ${username} with ${balance} ARK. https://explorer.ark.io/transaction/${txid}`
    },
    'wallet.unvote': (address, username, balance, txid) => {
        return `⬇️ ${address} unvoted ${username} with ${balance} ARK. https://explorer.ark.io/transaction/${txid}`
    },
    'forger.missing': (username) => {
        return `${username} missed a block`
    },
    'forger.failed': (error) => {
        return error
    }
}

module.exports = {
    discord,
    slack,
    fallback
}
