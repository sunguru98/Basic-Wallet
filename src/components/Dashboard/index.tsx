import { parseUnits } from "@ethersproject/units";
import { useState } from "react";
import { useWallet } from "../../context/WalletContext";
import "./style.scss";

const shortenAddress = (address: string) =>
  `${address.slice(0, 5)}...${address.slice(-5)}`;

const Dashboard = () => {
  const {
    isTransferring,
    wallets,
    currentWallet,
    selectWallet,
    setCreateMode,
    transferFunds,
  } = useWallet();

  const [recipientAddress, setRecipientAddress] = useState("");
  const [ethValue, setEthValue] = useState("0");

  const handleSubmit: React.FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();
    await transferFunds(recipientAddress, parseUnits(ethValue || "0", 18));
    setRecipientAddress("");
    setEthValue("0");
  };

  return (
    <div className="Dashboard">
      <div className="Dashboard__list">
        <button
          className="Dashboard__create"
          onClick={() => setCreateMode(true)}
        >
          <span>+</span>
        </button>
        <h2>Accounts available</h2>
        <ul className="Dashboard__list--accounts">
          {wallets.map((wallet) => (
            <li
              onClick={() => selectWallet(wallet)}
              className={`Dashboard__list--account ${
                wallet.name === currentWallet?.name ? "selected" : ""
              }`}
              key={wallet.name}
            >
              <p>{wallet.name}</p>
              <p>{shortenAddress(wallet.wallet.address)}</p>
              <p>{wallet.balance} ETH</p>
            </li>
          ))}
        </ul>
      </div>
      <div className="Dashboard__send">
        <h2>Send Ether</h2>
        <p>Please enter the recipient address you would want to send.</p>
        <p>
          Current address:{" "}
          <span style={{ fontWeight: "bold" }}>
            {currentWallet?.wallet.address}
          </span>
        </p>
        <p style={{ marginBottom: "10px" }}>
          Available Balance: {currentWallet?.balance} ETH
        </p>
        {parseFloat(currentWallet?.balance!) === 0.0 && (
          <a
            target="_blank"
            rel="noreferrer noopener"
            href="https://faucet.rinkeby.io/"
          >
            Get funds from faucet
          </a>
        )}
        <form onSubmit={handleSubmit}>
          <input
            placeholder="Recipient Address"
            type="text"
            name="recipientAddress"
            value={recipientAddress}
            onChange={(e) => setRecipientAddress(e.target.value)}
          />
          <input
            min="0"
            step={1 / 10 ** 18}
            type="number"
            name="ethValue"
            value={ethValue}
            onChange={(e) =>
              setEthValue(e.target.value === "" ? "0" : e.target.value)
            }
          />
          <input
            type="submit"
            disabled={
              isTransferring ||
              parseUnits(ethValue, 18).eq(0) ||
              parseUnits(ethValue, 18).gt(
                parseUnits(currentWallet?.balance!, 18)
              ) ||
              !recipientAddress ||
              parseFloat(currentWallet?.balance!) === 0.0
            }
            value={
              currentWallet?.balance === "0.0"
                ? "Insufficient funds"
                : isTransferring
                ? "Transferring"
                : "Send"
            }
          />
        </form>
      </div>
    </div>
  );
};

export default Dashboard;
