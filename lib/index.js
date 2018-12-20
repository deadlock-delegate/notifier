'use strict'

/**
 * This file is part of Ark Core - Detective.
 *
 * (c) roks0n
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

const app = require('./app.js')
const defaults = require('./defaults')

/**
 * The struct used by the plugin container.
 * @type {Object}
 */
exports.plugin = {
    pkg: require('../package.json'),
    defaults,
    alias: 'deadlock:notifier',
    async register (container, options) {
        if (!options.enabled) {
            return
        }
        const logger = container.resolvePlugin('logger')
        app.listen(container, options)
        logger.debug('[Notifier] Up and running :mega:')
    }
}
