import { useNavigate, useLocation } from "react-router-dom";
import { useWallet } from "@tronweb3/tronwallet-adapter-react-hooks";
import BigNumber from "bignumber.js";

import { useMarketContractContext } from "../context";

import ROUTE from "../constants/routes";

import defaultImage from "../assets/icons/shopbag.webp";

export function ProductDetail() {
  const navigate = useNavigate();
  const location = useLocation();
  const myProps = location.state;
  const { name, uri, price, desc, index } = myProps;
  const { marketContract } = useMarketContractContext();
  const { wallet } = useWallet();

  const purchaseItem = async (itemId, price) => {
    await marketContract.purchaseItem(itemId).send({
      feeLimit: 100_000_000,
      callValue: new BigNumber(price).multipliedBy(1000000),
      shouldPollResponse: true,
    });
  };

  return (
    <div className="pb-4">
      <p
        className="flex pl-[128px] py-4 cursor-pointer text-white hover:font-bold"
        onClick={() => navigate(ROUTE.dashboard)}
      >
        Back
      </p>
      <p className="py-1 mb-4 text-sm font-bold text-center text-white">
        {name}
      </p>
      <div className="flex justify-center">
        <div className="flex gap-4 sm:w-[1024px] w-[480px] pl-[92px] pr-10 flex-col lg:flex-row">
          <div className="flex justify-center md:w-[480px] md:h-[480px]">
            <div>
              {uri?.length > 21 ? (
                <img src={uri} className="w-[480px] h-[480px]" alt="product" />
              ) : (
                <img
                  src={defaultImage}
                  className="w-[480px] h-[480px]"
                  alt="product"
                />
              )}
            </div>
          </div>
          <div className="flex flex-col justify-between h-full">
            <div>
              <p className="py-1 text-sm font-bold text-white">
                Price : <span className="text-xs text-gray-500">TRX </span>
                <span className="text-base text-white">{price}</span>
              </p>
              <div>
                <p className="py-1 text-sm font-bold text-white">Description</p>
                <p className="py-2 text-xs text-white">{desc}</p>
              </div>
            </div>
            <div className="flex justify-end mt-4">
              <div
                className="bg-[#0e641a] text-[#c9c9c9] leading-3 rounded-lg flex items-center px-2 cursor-pointer hover:bg-[#178325] py-3"
                onClick={async () => {
                  if (!wallet) {
                    alert("Please connect your wallet first");
                  } else {
                    await purchaseItem(index, price);
                    navigate(ROUTE.dashboard);
                  }
                }}
              >
                <p className="text-center">Quick Buy</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
