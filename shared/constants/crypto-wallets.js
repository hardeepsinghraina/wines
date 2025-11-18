"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MIN_PAYMENT_AMOUNTS = exports.CRYPTO_NETWORKS = exports.SUPPORTED_CRYPTO_CURRENCIES = exports.WALLET_ADDRESSES = void 0;
exports.WALLET_ADDRESSES = {
    BTC: 'bc1qkgve6jynj7hnhyy3n6hz68zz66yuglzqzr83r5',
    ETH: '0xc71b5d01e24F8D0d31e464D15B2b04032f58F4b3',
    USDT_TRC20: 'TXeXRbMZuunsMS558WV6xWBFiXTmgbQQnp'
};
exports.SUPPORTED_CRYPTO_CURRENCIES = ['BTC', 'ETH', 'USDT_TRC20'];
exports.CRYPTO_NETWORKS = {
    BTC: {
        name: 'Bitcoin',
        symbol: 'BTC',
        decimals: 8,
        network: 'mainnet',
        explorerUrl: 'https://blockstream.info/tx/'
    },
    ETH: {
        name: 'Ethereum',
        symbol: 'ETH',
        decimals: 18,
        network: 'mainnet',
        explorerUrl: 'https://etherscan.io/tx/'
    },
    USDT_TRC20: {
        name: 'Tether USD (TRC20)',
        symbol: 'USDT',
        decimals: 6,
        network: 'tron',
        explorerUrl: 'https://tronscan.org/#/transaction/'
    }
};
exports.MIN_PAYMENT_AMOUNTS = {
    BTC: 0.0001,
    ETH: 0.001,
    USDT_TRC20: 1
};
//# sourceMappingURL=crypto-wallets.js.map