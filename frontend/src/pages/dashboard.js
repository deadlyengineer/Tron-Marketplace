import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useWallet } from "@tronweb3/tronwallet-adapter-react-hooks";
import BigNumber from "bignumber.js";

import { ProductCard, Spinner } from "../components";

import { useMarketContractContext } from "../context";

import ROUTE from "../constants/routes";

export function Dashboard() {
  const [products, setProducts] = useState();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const { marketContract } = useMarketContractContext();
  const { address } = useWallet();

  const getProducts = async () => {
    try {
      setLoading(true);
      const itemCountStr = await marketContract.itemCount().call();
      const cnt = new BigNumber(itemCountStr.toString()).toNumber();

      let items = [];
      for (let i = 0; i < cnt; i++) {
        const item = await marketContract.items(i).call();
        if (item.owner !== window.tronWeb.address.toHex(address))
          items.push({
            id: i,
            ...item,
            price: new BigNumber(item.price.toString()).dividedBy(1000000),
          });
      }
      setProducts(items);
    } catch (e) {
      setLoading(false);
    }
    setLoading(false);
  };

  const purchaseItem = async (itemId, price) => {
    await marketContract.purchaseItem(itemId).send({
      feeLimit: 100_000_000,
      callValue: price.multipliedBy(1000000),
      shouldPollResponse: true,
    });
  };

  useEffect(() => {
    if (marketContract) getProducts();
  }, [marketContract]);

  return (
    <div className="flex justify-center">
      <div className="sm:w-[1024px] w-[480px] pl-[92px] pr-10">
        <div>
          <h1 className="mt-8 mb-4 text-3xl font-black text-center text-white">
            Upcoming Products
          </h1>
          <div className="flex justify-center mb-4">
            <p className="text-[#A197AA] max-w-[440px] text-center">
              Find your best products. Get ready to buy and view the latest
              products listed in this marketplace.
            </p>
          </div>
          <div className="flex justify-center mb-8">
            <div className="border-[#FFAA00] rounded-lg px-5 py-3 border max-w-[640px]">
              <p className="text-[#c9c9c9]">
                This is a test version of marketplace based on{" "}
                <span className="text-[#E4204C]">TRON</span> network.
              </p>
            </div>
          </div>
          <div className="flex justify-between mb-3">
            <p className="text-[#A197AA] px-2 py-3 border-b border-[#E4204C] font-bold">
              {" "}
              Products{" "}
            </p>
            <div
              className="bg-[#e42575] text-white leading-3 rounded-lg flex items-center px-2 cursor-pointer hover:bg-[#e2508d]"
              onClick={() => {
                if (!address) {
                  alert("Please connect your wallet first");
                } else navigate(ROUTE.user_detail);
              }}
            >
              <p className="text-center">List Your Product</p>
            </div>
          </div>
          {loading && (
            <div className="flex justify-center my-10">
              <Spinner />
            </div>
          )}
          <div className="grid grid-cols-1 gap-2 lg:grid-cols-3 md:grid-cols-2">
            {products?.map((item) => (
              <ProductCard
                key={item.id}
                index={item.id}
                uri={item.uri}
                name={item.name}
                desc={item.description}
                price={item.price}
              >
                <div className="flex justify-center px-4 pt-2 mb-4">
                  <div
                    className="bg-[#311f45] mr-2 text-[#c9c9c9] leading-3 rounded-lg flex items-center px-2 cursor-pointer hover:bg-[#33273F] py-3"
                    onClick={() => {
                      navigate(ROUTE.product_detail, {
                        state: {
                          name: item.name,
                          uri: item.uri,
                          price: item.price.toString(),
                          desc: item.description,
                          index: item.id,
                        },
                      });
                    }}
                  >
                    <p className="text-center">View Detail</p>
                  </div>
                  <div
                    className="bg-[#0e641a] text-[#c9c9c9] leading-3 rounded-lg flex items-center px-2 cursor-pointer hover:bg-[#178325] py-3"
                    onClick={async () => {
                      try {
                        setLoading(true);
                        await purchaseItem(item.id, item.price);
                        await getProducts();
                      } catch (e) {}
                      setLoading(false);
                    }}
                  >
                    <p className="text-center">Quick Buy</p>
                  </div>
                </div>
              </ProductCard>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
