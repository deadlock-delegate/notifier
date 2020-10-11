const discord = {
    'wallet.vote': (address, username, balance, txid) => {
        return `⬆️ **${address}** voted for **${username}** with **${balance} ARK**. [Open transaction](https://explorer.ark.io/transaction/${txid})`
    },
    'wallet.unvote': (address, username, balance, txid) => {
        return `⬇️ **${address}** unvoted **${username}** with **${balance} ARK**. [Open transaction](https://explorer.ark.io/transaction/${txid})`
    },
    'forger.missing': (hostname, username) => {
        return `**${username}** failed to forge in this round`
    },
    'forger.failed': (hostname, error) => {
        // only works if a plugin is running on a node with a forging process running
        return `Your forger failed to forge in this slot on **${hostname}**: ${error}`
    },
    'forger.started': (hostname) => {
        return `Forger started on **${hostname}**`
    },
    'block.forged': (hostname, blockId) => {
        return `Forged a new block **${blockId}** on **${hostname}**`
    },
    'round.created': (activeDelegates) => {
        return `Round created with following active delegates: ${JSON.stringify(activeDelegates)}`
    },
    activedelegateschanged: (newForgingDelegates, oldForgingDelegates) => {
        if (newForgingDelegates.length === 1 && oldForgingDelegates.length === 1) {
            return `
🚨 **Changes in forging positions**
🔃 Delegate **${newForgingDelegates[0]}** replaced **${oldForgingDelegates[0]}** as a forging delegate.
            `
        }

        return `
**🚨 Changes in forging positions**
**Moved out of a forging spot:**
${newForgingDelegates.map(delegate => `- ${delegate}\n`).join('')}
**Moved into a forging spot:**:
${oldForgingDelegates.map(delegate => `- ${delegate}\n`).join('')}
        `
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
        return `*${username}* failed to forge in this round`
    },
    'forger.failed': (hostname, error) => {
        // only works if a plugin is running on a node with a forging process running
        return `Your forger failed to forge in this slot on *${hostname}*: ${error}`
    },
    'forger.started': (hostname) => {
        return `Forger started on *${hostname}*`
    },
    'block.forged': (hostname, blockId) => {
        return `Forged a new block *${blockId}* on *${hostname}*`
    },
    'round.created': (activeDelegates) => {
        return `Round created with following active delegates: ${JSON.stringify(activeDelegates)}`
    },
    activedelegateschanged: (newActiveDelegates, oldActiveDelegates) => {
        return `
*🚨 Changes in forging positions*
*Moved out of a forging spot:*
${oldActiveDelegates.map(delegate => `- ${delegate}\n`).join('')}
*Moved into a forging spot:*:
${newActiveDelegates.map(delegate => `- ${delegate}\n`).join('')}
        `
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
    },
    'round.created': (activeDelegates) => {
        return `Round created with following active delegates: ${JSON.stringify(activeDelegates)}`
    },
    activedelegateschanged: (newActiveDelegates, oldActiveDelegates) => {
        return `Active delegates changed: ${oldActiveDelegates.join(', ')} replaced by ${newActiveDelegates.join(', ')}.`
    }
}

module.exports = {
    discord,
    slack,
    fallback
}
