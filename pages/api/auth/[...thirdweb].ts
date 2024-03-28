import { ThirdwebAuth } from '@thirdweb-dev/auth/next';
import { PrivateKeyWallet } from '@thirdweb-dev/auth/evm';

export const { ThirdwebAuthHandler, getUser } = ThirdwebAuth({
    wallet: new PrivateKeyWallet(process.env.PRIVATE_KEY || ""),
    domain: process.env.DOMAIN || "",
    thirdwebAuthOptions: {
        secretKey: process.env.THIRDWEB_AUTH_SECRET_KEY,
    },
});

export default ThirdwebAuthHandler();