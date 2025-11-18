export declare const WALLET_ADDRESSES: {
    readonly BTC: "bc1qkgve6jynj7hnhyy3n6hz68zz66yuglzqzr83r5";
    readonly ETH: "0xc71b5d01e24F8D0d31e464D15B2b04032f58F4b3";
    readonly USDT_TRC20: "TXeXRbMZuunsMS558WV6xWBFiXTmgbQQnp";
};
export type WalletCurrency = keyof typeof WALLET_ADDRESSES;
export declare const SUPPORTED_CRYPTO_CURRENCIES: readonly ["BTC", "ETH", "USDT_TRC20"];
export declare const CRYPTO_NETWORKS: {
    readonly BTC: {
        readonly name: "Bitcoin";
        readonly symbol: "BTC";
        readonly decimals: 8;
        readonly network: "mainnet";
        readonly explorerUrl: "https://blockstream.info/tx/";
    };
    readonly ETH: {
        readonly name: "Ethereum";
        readonly symbol: "ETH";
        readonly decimals: 18;
        readonly network: "mainnet";
        readonly explorerUrl: "https://etherscan.io/tx/";
    };
    readonly USDT_TRC20: {
        readonly name: "Tether USD (TRC20)";
        readonly symbol: "USDT";
        readonly decimals: 6;
        readonly network: "tron";
        readonly explorerUrl: "https://tronscan.org/#/transaction/";
    };
};
export declare const MIN_PAYMENT_AMOUNTS: {
    readonly BTC: 0.0001;
    readonly ETH: 0.001;
    readonly USDT_TRC20: 1;
};
//# sourceMappingURL=crypto-wallets.d.ts.map