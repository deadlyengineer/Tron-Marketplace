/*
Top Menu component
 */
import { useState, useEffect } from "react";
import { useWallet } from "@tronweb3/tronwallet-adapter-react-hooks";
import BigNumber from "bignumber.js";

import TronDialog from "../dialog";

import { useMarketContractContext } from "../../context";

import { CONTRACTS_ADDR, OWNER_ADDR } from "../../constants/contracts";

import logo from "../../assets/icons/logo.png";
import diamond from "../../assets/icons/rewards.gif";
import { ReactComponent as WalletSVG } from "../../assets/icons/Wallet.svg";

const TopMenu = () => {
  const { connect, disconnect, select, connected, address, wallet } =
    useWallet();
  const { marketContract, setMarketContract } = useMarketContractContext();
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [balance, setBalance] = useState(0);

  useEffect(() => {
    const connectContract = async () => {
      if (wallet) {
        const marketContact = await wallet?.adapter?._wallet?.tronWeb
          .contract()
          .at(CONTRACTS_ADDR);
        setMarketContract(marketContact);
      }
    };
    connectContract();
  }, [wallet]);
  return (
    <>
      <div>
        <div>
          <div className="flex justify-center min-h-[32px] bg-[#1C1326] items-center">
            <ul className="flex flex-col justify-center gap-4 py-2 md:flex-row md:py-0">
              <li>
                <p className="text-[#A197AA] text-sm">
                  Volume 24h:{" "}
                  <span className="text-[#E4204C] font-bold text-sm">
                    30,801 TRX
                  </span>
                </p>
              </li>
              <li>
                <p className="text-[#A197AA] text-sm">
                  Volume total:{" "}
                  <span className="text-[#E4204C] font-bold text-sm">
                    60,631,536 TRX
                  </span>
                </p>
              </li>
              <li>
                <p className="text-[#A197AA] text-sm">
                  Tron Network:{" "}
                  <span className="text-[#E4204C] font-bold text-sm">
                    3,676 TPS
                  </span>
                </p>
              </li>
            </ul>
          </div>
          <div className="sticky flex flex-col md:flex-row justify-between bg-[#120C18] p-4 items-center">
            <div className="flex items-center gap-2">
              <div>
                <img src={logo} width="36" height="36" alt="logo" />
              </div>
              <div className="flex flex-col gap-1">
                <h3 className="text-base font-bold leading-3 text-[#c9c9c9]">
                  HOME ASSESSMENT
                </h3>
                <p className="text-xs font-bold leading-3 text-[#c9c9c9]">
                  TRON
                </p>
              </div>
            </div>
            <p className="items-center text-[#A197AA] text-sm my-4 md:my-0">
              {connected ? (
                <>
                  <span className="text-xs font-bold">Connected WALLET : </span>
                  <span className="text-white">{address}</span>
                </>
              ) : (
                ""
              )}
            </p>
            <div className="flex flex-col gap-4 md:flex-row">
              {address === OWNER_ADDR && (
                <div
                  className="bg-[#311f45] text-[#c9c9c9] leading-3 rounded-lg flex items-center px-2 cursor-pointer hover:bg-[#33273F]"
                  onClick={async () => {
                    const balanceBigNum = await window.tronWeb.trx.getBalance(
                      CONTRACTS_ADDR
                    );
                    setBalance(
                      new BigNumber(balanceBigNum).dividedBy(1000000).toFixed(6)
                    );
                    setShowWithdraw(true);
                  }}
                >
                  <img src={diamond} width="40" height="40" alt="diamond" />
                  <p className="text-center">Withdraw</p>
                </div>
              )}

              <div
                className="bg-[#e42575] text-white leading-3 rounded-lg flex items-center px-2 cursor-pointer hover:bg-[#e2508d] py-2"
                onClick={async () => {
                  select("TronLink");
                  if (connected) disconnect();
                  else {
                    await connect();
                  }
                }}
              >
                <WalletSVG className="fill-white" />
                <p className="text-center">
                  {connected ? "Disconnect Wallet" : "Connect Wallet"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <TronDialog show={showWithdraw}>
        <div className="p-4">
          <p className="py-4 mb-4 text-base font-bold">
            The current balance of smart contracts is {balance}
          </p>
          <div className="flex justify-center px-4 pt-2 mb-4">
            <button
              className={`bg-[#0e641a] mr-2 text-[#c9c9c9] leading-3 rounded-lg flex items-center px-2 cursor-pointer hover:bg-[#178325] py-3 ${
                balance <= 0 && "bg-[#0f100f] hover:bg-[#0f100f]"
              }`}
              disabled={balance <= 0}
              onClick={async () => {
                await marketContract.withdrawFunds().send();
                setShowWithdraw(false);
              }}
            >
              <p className="text-center">Proceed</p>
            </button>
            <div
              className="bg-[#780c0c] text-[#c9c9c9] leading-3 rounded-lg flex items-center px-2 cursor-pointer hover:bg-[#fe4a4a] py-3"
              onClick={() => setShowWithdraw(false)}
            >
              <p className="text-center">Cancel</p>
            </div>
          </div>
        </div>
      </TronDialog>
    </>
  );
};

export default TopMenu;
