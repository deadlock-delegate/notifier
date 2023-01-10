export const discord = {
    "wallet.vote": (address, username, balance, txid, explorerTx) => {
        return `⬆️ **${address}** voted for **${username}** with **${balance}**. [Open transaction](<${explorerTx}${txid}>)`;
    },
    "wallet.unvote": (address, username, balance, txid, explorerTx) => {
        return `⬇️ **${address}** unvoted **${username}** with **${balance}**. [Open transaction](<${explorerTx}${txid}>)`;
    },
    "forger.missing": (hostname, username) => {
        return `⚠️ **${username}** failed to produce a block in this round`;
    },
    "forger.failed": (hostname, error) => {
        // only works if a plugin is running on a node with a forging process running
        return `⚠️ Your block producer failed to produce a block in this slot on **${hostname}**: ${error}`;
    },
    "forger.started": (hostname) => {
        return `Forger started on **${hostname}**`;
    },
    "block.forged": (hostname, blockId) => {
        return `Produced a new block **${blockId}** on **${hostname}**`;
    },
    "round.created": (activeDelegates) => {
        return `Round created with following active block producers: ${JSON.stringify(activeDelegates)}`;
    },
    activedelegateschanged: (newForgingDelegates, oldForgingDelegates) => {
        if (newForgingDelegates.length === 1 && oldForgingDelegates.length === 1) {
            return `
🚨 **Changes in active block producer rankings**
🔃 Delegate **${newForgingDelegates[0]}** replaced **${oldForgingDelegates[0]}** as a block producer.
            `;
        }
        return `
**🚨 Changes in active block producer rankings**
**Moved out:**
${oldForgingDelegates.map((delegate) => `- ${delegate}\n`).join("")}
**Moved in:**
${newForgingDelegates.map((delegate) => `- ${delegate}\n`).join("")}
        `;
    },
    "delegate.registered": (delegate) => {
        return `🆕 New producer registered: **${delegate}**`;
    },
    "delegate.resigned": (delegate) => {
        return `**${delegate}** producer resigned`;
    },
};

export const slack = {
    "wallet.vote": (address, username, balance, txid, explorerTx) => {
        return `⬆️ *${address}* voted for *${username}* with *${balance}*. <${explorerTx}${txid}|Open transaction>`;
    },
    "wallet.unvote": (address, username, balance, txid, explorerTx) => {
        return `⬇️ *${address}* unvoted *${username}* with *${balance}*. <${explorerTx}${txid}|Open transaction>`;
    },
    "forger.missing": (hostname, username) => {
        return `⚠️ *${username}* failed to produce a block in this round`;
    },
    "forger.failed": (hostname, error) => {
        // only works if a plugin is running on a node with a forging process running
        return `⚠️ Your block producer failed to producce a block in this slot on *${hostname}*: ${error}`;
    },
    "forger.started": (hostname) => {
        return `Forger started on *${hostname}*`;
    },
    "block.forged": (hostname, blockId) => {
        return `Forged a new block *${blockId}* on *${hostname}*`;
    },
    "round.created": (activeDelegates) => {
        return `Round created with following active delegates: ${JSON.stringify(activeDelegates)}`;
    },
    activedelegateschanged: (newActiveDelegates, oldActiveDelegates) => {
        return `
*🚨 Changes in active block producer rankings*
*Moved out:*
${oldActiveDelegates.map((delegate) => `- ${delegate}\n`).join("")}
*Moved in:*
${newActiveDelegates.map((delegate) => `- ${delegate}\n`).join("")}
        `;
    },
    "delegate.registered": (delegate) => {
        return `🆕 New producer registered: *${delegate}*`;
    },
    "delegate.resigned": (delegate) => {
        return `*${delegate}* producer resigned`;
    },
};

export const fallback = {
    "wallet.vote": (address, username, balance, txid, explorerTx) => {
        return `⬆️ ${address} voted for ${username} with ${balance}. ${explorerTx}${txid}`;
    },
    "wallet.unvote": (address, username, balance, txid, explorerTx) => {
        return `⬇️ ${address} unvoted ${username} with ${balance}. ${explorerTx}${txid}`;
    },
    "forger.missing": (hostname, username) => {
        return `${username} failed to produce a block in this round`;
    },
    "forger.failed": (hostname, error) => {
        // only works if a plugin is running on a node with a forging process running
        return `Your forger failed to producce a block in this slot ${hostname}: ${error}`;
    },
    "forger.started": (hostname) => {
        return `Forger started on ${hostname}`;
    },
    "block.forged": (hostname, blockId) => {
        return `Forged a new block ${blockId} on ${hostname}`;
    },
    "round.created": (activeDelegates) => {
        return `Round created with following active delegates: ${JSON.stringify(activeDelegates)}`;
    },
    activedelegateschanged: (newActiveDelegates, oldActiveDelegates) => {
        return `Active producers changed: ${oldActiveDelegates.join(", ")} replaced by ${newActiveDelegates.join(", ")}.`;
    },
    "delegate.registered": (delegate) => {
        return `New producer registered: ${delegate}`;
    },
    "delegate.resigned": (delegate) => {
        return `${delegate} producer resigned`;
    },
};
