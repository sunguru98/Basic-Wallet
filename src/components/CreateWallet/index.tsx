import { useState } from "react";
import { useWallet } from "../../context/WalletContext";
import "./style.scss";

const CreateWallet = () => {
  const { createWallet, wallets, setCreateMode } = useWallet();
  const [walletName, setWalletName] = useState("");

  const handleSubmit: React.FormEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault();
    createWallet(walletName);
    setWalletName("");
  };

  return (
    <div className="CreateWallet">
      <h2 className="text-center">Create a new Wallet</h2>
      <form className="CreateWallet__form" onSubmit={handleSubmit}>
        <input
          className="CreateWallet__input"
          name="walletName"
          value={walletName}
          onChange={(e) => setWalletName(e.target.value)}
          placeholder="My Wallet"
        />
        <input type="submit" value="Create" disabled={walletName.length < 5} />
        {wallets.length > 0 && (
          <input
            type="button"
            style={{ marginLeft: "10px" }}
            onClick={() => setCreateMode(false)}
            value="Dashboard"
          />
        )}
      </form>
    </div>
  );
};

export default CreateWallet;
