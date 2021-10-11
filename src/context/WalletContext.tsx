import { InfuraProvider } from "@ethersproject/providers";
import { Wallet } from "@ethersproject/wallet";
import { BigNumber } from "ethers";
import { formatEther, parseUnits } from "ethers/lib/utils";
import {
  useEffect,
  useState,
  useContext,
  createContext,
  FC,
  useCallback,
} from "react";

type CustomWallet = {
  name: string;
  pubKey: string;
  privKey: string;
  balance: string;
  wallet: Wallet;
};

type WalletContextType = {
  wallets: CustomWallet[];
  createWallet: (walletName: string) => {};
  currentWallet: CustomWallet | null;
  selectWallet: (wallet: CustomWallet) => void;
  createMode: boolean;
  provider: InfuraProvider;
  setCreateMode: React.Dispatch<React.SetStateAction<boolean>>;
  transferFunds: (recipientAddress: string, value: BigNumber) => void;
  isTransferring: boolean;
};

const WalletContext = createContext<WalletContextType>({
  wallets: [],
  createWallet: () => ({}),
  selectWallet: () => {},
  currentWallet: null,
  createMode: true,
  setCreateMode: () => {},
  provider: new InfuraProvider("rinkeby", "868d79e5b1a14a149e37ded1af7e9f00"),
  transferFunds: () => {},
  isTransferring: false,
});

export const useWallet = () => useContext(WalletContext);

export const WalletContextProvider: FC = ({ children }) => {
  const [provider] = useState<InfuraProvider>(
    new InfuraProvider(
      { chainId: 4, name: "rinkeby" },
      "868d79e5b1a14a149e37ded1af7e9f00"
    )
  );
  const [wallets, setWallets] = useState<CustomWallet[]>([]);
  const [startFetching, setStartFetching] = useState(false);
  const [isTransferring, setIsTransferring] = useState(false);
  const [currentWallet, setCurrentWallet] = useState<CustomWallet | null>(null);
  const [createMode, setCreateMode] = useState<boolean>(true);

  useEffect(() => {
    const wallets = JSON.parse(localStorage.getItem("wallets") || "[]").map(
      (w: CustomWallet) => ({
        ...w,
        wallet: new Wallet(w.privKey, provider),
      })
    );

    setWallets(wallets);
    if (wallets.length > 0) {
      setCurrentWallet(wallets[0]);
      setCreateMode(false);
    }
  }, []);

  useEffect(() => {
    !createMode && setStartFetching(true);
  }, [createMode]);

  useEffect(() => {
    localStorage.setItem("wallets", JSON.stringify(wallets));
  }, [wallets]);

  const fetchBalance = useCallback(async () => {
    console.log("FETCHING BALANCE FOR ", wallets.length, " WALLETS");
    const updatedWallets = await Promise.all(
      wallets.map(async (w) => {
        const balance = formatEther(
          await provider.getBalance(w.wallet.address)
        );

        if (w.name === currentWallet?.name && currentWallet.balance !== balance)
          setCurrentWallet({
            ...w,
            balance,
          });

        return {
          ...w,
          balance,
        };
      })
    );
    setWallets(updatedWallets);
  }, [wallets]);

  useEffect(() => {
    startFetching && provider?.on("block", fetchBalance);
    return () => {
      provider.off("block", fetchBalance);
    };
  }, [startFetching, fetchBalance]);

  async function createWallet(walletName: string): Promise<CustomWallet> {
    const randWallet = new Wallet(Wallet.createRandom().privateKey, provider);
    const balance = formatEther(await randWallet.getBalance());
    const wallet = {
      name: walletName,
      pubKey: randWallet.publicKey,
      privKey: randWallet.privateKey,
      wallet: randWallet,
      balance,
    };

    setWallets((prevWallets) => {
      const newWallets = [...prevWallets, wallet];
      localStorage.setItem("wallets", JSON.stringify(newWallets));
      return newWallets;
    });

    setCurrentWallet(wallet);
    setCreateMode(false);
    return wallet;
  }

  function selectWallet(wallet: CustomWallet) {
    setCurrentWallet(wallet);
  }

  async function transferFunds(recipientAddress: string, value: BigNumber) {
    try {
      setIsTransferring(true);
      const gasPrice = await provider.getGasPrice();
      const newValue = value.eq(parseUnits(currentWallet?.balance!, 18))
        ? value.sub(gasPrice.mul(BigNumber.from("25000")))
        : value;
      await (
        await currentWallet?.wallet?.sendTransaction({
          to: recipientAddress,
          value: newValue,
          gasPrice,
        })
      )?.wait();
      alert("Transfer successful");
    } catch (err) {
      alert((err as Error).message);
    } finally {
      setIsTransferring(false);
    }
  }

  return (
    <WalletContext.Provider
      value={{
        wallets,
        createWallet,
        selectWallet,
        currentWallet,
        createMode,
        setCreateMode,
        provider,
        transferFunds,
        isTransferring,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};
