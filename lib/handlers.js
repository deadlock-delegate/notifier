const { database } = require('@arkecosystem/core-interfaces');

async function walletVote (data) {
    const transaction = data.transaction
    const delegatePubKey = transaction.asset.votes[0].slice(1)
    const delegate = database.walletManager.findByPublicKey(delegatePubKey)
    const voter = await database.wallets.findById(transaction.senderPublicKey)
    const balance = parseFloat(voter.balance / 1e8).toFixed(2)
    return [voter.address, delegate.username, balance, transaction.id]
}

async function walletUnvote (data) {
    const transaction = data.transaction
    const delegatePubKey = transaction.asset.votes[0].slice(1)
    const delegate = database.walletManager.findByPublicKey(delegatePubKey)
    const voter = await database.wallets.findById(transaction.senderPublicKey)
    const balance = parseFloat(voter.balance / 1e8).toFixed(2)
    return [voter.address, delegate.username, balance, transaction.id]
}

async function forgerMissing (data) {
    const delegate = data.delegate
    return [delegate.username]
}

module.exports = {
    'wallet.vote': walletVote,
    'wallet.unvote': walletUnvote,
    'forger.missing': forgerMissing
}
