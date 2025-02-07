import { useMobileWallet } from '@solana-mobile/mobile-wallet-adapter-react';

export default function MobileConnector() {
    const { connect, connected, publicKey } = useMobileWallet();
    
    return (
        <View style={styles.container}>
            {!connected ? (
                <Button 
                    title="Connect Wallet"
                    onPress={connect}
                />
            ) : (
                <Text>
                    Connected: {publicKey?.toBase58().slice(0,6)}... 
                </Text>
            )}
        </View>
    );
} 