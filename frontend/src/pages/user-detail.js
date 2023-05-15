import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useWallet } from "@tronweb3/tronwallet-adapter-react-hooks";
import axios from "axios";
import BigNumber from "bignumber.js";

import { ProductCard, TronDialog, Spinner } from "../components";

import { useMarketContractContext } from "../context";

import ROUTE from "../constants/routes";

export function UserDetail() {
  const [show, setShow] = useState(false);
  const [price, setPrice] = useState(0);
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState();
  const [isUploading, setIsUploading] = useState({
    state: "pending",
    percent: 0,
  });
  const progressRef = useRef(null);
  const [imgHash, setImgHash] = useState("");
  const [preview, setPreview] = useState();
  const { address } = useWallet();
  const [showConfirmTransfer, setShowConfirmTransfer] = useState(false);
  const [transferAddr, setTransferAddr] = useState("");
  const navigate = useNavigate();

  const onSelectFile = async (e) => {
    if (!e.target.files || e.target.files.length === 0) {
      setSelectedFile(undefined);
      return;
    }

    const formData = new FormData();
    formData.append("file", e.target.files[0]);
    const intervalId = setInterval(() => {
      setIsUploading((prev) => {
        const num = Math.random() * 30;
        if (progressRef.current)
          progressRef.current.style.width =
            prev.percent + num > 90
              ? "94%"
              : (prev.percent + num).toString() + "%";
        return {
          ...prev,
          state: "going",
          percent:
            prev.percent + num > 90 ? 94 : Math.floor(prev.percent + num),
        };
      });
    }, 300);
    const uploadFile = await axios.post(
      "https://api.pinata.cloud/pinning/pinFileToIPFS",
      formData,
      {
        maxBodyLength: Infinity,
        headers: {
          pinata_api_key: "9be136d488e645663d18",
          pinata_secret_api_key:
            "52e5013a1bf673fc0480eedcb2a1bb541bbfb3e834acbdc88881234d1a14e6ce",
          "Content-Type": "multipart/form-data",
        },
      }
    );

    clearInterval(intervalId);
    if (progressRef.current) progressRef.current.style.width = "100%";
    setIsUploading({ state: "going", percent: 100 });
    setTimeout(() => {
      setSelectedFile(e.target.files[0]);
      setImgHash(uploadFile.data.IpfsHash);
      setIsUploading({ state: "pending", percent: 0 });
    }, 500);
  };

  const [products, setProducts] = useState();
  const { marketContract } = useMarketContractContext();

  const getProducts = async () => {
    try {
      setLoading(true);
      const itemCountStr = await marketContract.itemCount().call();
      const cnt = new BigNumber(itemCountStr.toString()).toNumber();

      let items = [];
      for (let i = 0; i < cnt; i++) {
        const item = await marketContract.items(i).call();
        if (item.owner === window.tronWeb.address.toHex(address))
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

  const listProduct = async () => {
    setLoading(true);
    try {
      await marketContract
        .listNewItem(
          name,
          desc,
          "https://ipfs.io/ipfs/" + imgHash,
          new BigNumber(price.toString()).multipliedBy(1000000).toString()
        )
        .send({
          feeLimit: 100_000_000,
          callValue: 0,
          shouldPollResponse: true,
        });
      getProducts();
    } catch (e) {
      setLoading(false);
    }
    setLoading(false);
    setName("");
    setPrice(0);
    setDesc("");
  };

  useEffect(() => {
    if (!address) {
      navigate(ROUTE.dashboard);
    }
  }, [address]);

  useEffect(() => {
    if (marketContract) getProducts();
  }, [marketContract]);

  useEffect(() => {
    if (!selectedFile) {
      setPreview(undefined);
      return;
    }
    const objectUrl = URL.createObjectURL(selectedFile);
    setPreview(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [selectedFile]);

  return (
    <>
      <div className="flex justify-center mt-4">
        <div className="sm:w-[1024px] w-[480px] pl-[92px] pr-10">
          <div className="flex justify-between mb-3">
            <p className="text-[#A197AA] px-2 py-3 border-b border-[#E4204C] font-bold">
              {" "}
              My Products{" "}
            </p>
            <div
              className="bg-[#e42575] text-white leading-3 rounded-lg flex items-center px-2 cursor-pointer hover:bg-[#e2508d]"
              onClick={() => setShow(true)}
            >
              <p className="text-center">Add New Product</p>
            </div>
          </div>
          {loading && (
            <div className="flex justify-center my-[80px]">
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
                <div className="flex justify-end px-4 pt-2 mb-4">
                  <div
                    className="bg-[#311f45] mr-2 text-[#c9c9c9] leading-3 rounded-lg flex items-center px-2 cursor-pointer hover:bg-[#33273F] py-3"
                    onClick={async () => {
                      setShowConfirmTransfer({ show: true, index: item.id });
                    }}
                  >
                    <p className="text-center">Transfer</p>
                  </div>
                </div>
              </ProductCard>
            ))}
          </div>
        </div>
      </div>
      <TronDialog show={show}>
        <div className="p-4">
          <p className="py-4 mb-4 text-base font-bold">
            Please add new product by specifying the details here
          </p>
          <div className="flex flex-col gap-2">
            <div className="my-4 bg-grey-900 rounded-xl">
              <p className="pt-[18px] pb-[2px] px-3 text-grey-200 font-bold text-sm">
                Upload File
              </p>
              <div className="px-3 py-2">
                {!preview ? (
                  <div className="p-4 border border-dashed border-grey-800 min-h-[120px] relative">
                    {isUploading.state !== "pending" ? (
                      <div className="absolute top-0 left-0 w-full h-full bg-transparent">
                        <div
                          className="bg-[#3C8725] w-0 h-full flex justify-center items-center transition-all duration-300"
                          ref={progressRef}
                        />
                        <div className="absolute font-bold -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2">
                          <p className="mb-2 text-base text-center text-grey-50">
                            Uploading
                          </p>
                          <p className="text-xs text-center text-white">
                            {isUploading.percent.toString() + "%"}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="flex justify-center">
                          <input
                            type="file"
                            onChange={onSelectFile}
                            className="hidden"
                            id="upload_img"
                          />
                          <label
                            className="mt-1 mb-2 text-base font-bold text-center cursor-pointer text-grey-50 active:text-grey-200"
                            htmlFor="upload_img"
                          >
                            Click to upload a file
                          </label>
                        </div>
                        <p className="mb-1 text-xs font-bold text-center px-9 text-grey-600">
                          File types supported JPG, PNG, GIF, SVG, etc Max size
                          100 MB
                        </p>
                      </>
                    )}
                  </div>
                ) : (
                  <div>
                    <div className="flex justify-center">
                      <img
                        width="120px"
                        height="120px"
                        alt="nft"
                        src={preview}
                        className="block rounded-[32px]"
                      />
                    </div>
                    <p
                      className="py-1 text-sm font-bold text-center cursor-pointer"
                      onClick={() => {
                        setSelectedFile(undefined);
                        setPreview("");
                      }}
                    >
                      Re-upload file
                    </p>
                  </div>
                )}
              </div>
            </div>
            <div>
              <p>Product Name: </p>
              <input
                className="px-2 py-1 border border-gray-400 rounded-sm"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div>
              <p>Price: </p>
              <input
                className="px-2 py-1 border border-gray-400 rounded-sm"
                type="number"
                value={price}
                onChange={(e) => setPrice(parseInt(e.target.value || "0"))}
              />
            </div>
            <div>
              <p>Description: </p>
              <textarea
                className="w-full px-2 py-1 border border-gray-400 rounded-sm"
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
              />
            </div>
          </div>
          <div className="flex justify-center px-4 pt-2">
            <div
              className="bg-[#0e641a] mr-2 w-[80px] text-[#c9c9c9] leading-3 rounded-lg flex justify-center items-center px-2 cursor-pointer hover:bg-[#178325] py-3"
              onClick={() => {
                listProduct();
                setShow(false);
              }}
            >
              <p className="text-center">Add</p>
            </div>
            <div
              className="bg-[#311f45] text-[#c9c9c9] w-[80px] leading-3 rounded-lg flex items-center px-2 justify-center cursor-pointer hover:bg-[#33273F] py-3"
              onClick={() => {
                setShow(false);
                setName("");
                setPrice(0);
                setDesc("");
              }}
            >
              <p className="text-center">Cancel</p>
            </div>
          </div>
        </div>
      </TronDialog>
      <TronDialog show={showConfirmTransfer.show}>
        <div className="p-4">
          <p className="py-4 mb-4 text-base font-bold text-center">
            Please confirm your transfer address
          </p>
          <div className="flex items-center gap-3 py-2">
            <p>Transfer address : </p>
            <input
              className="px-1 py-2 border border-gray-400"
              value={transferAddr}
              onChange={(e) => setTransferAddr(e.target.value)}
            />
          </div>
          <div className="flex justify-center px-4 pt-2 mb-4">
            <button
              className={`bg-[#0e641a] mr-2 text-[#c9c9c9] leading-3 rounded-lg flex items-center px-2 cursor-pointer hover:bg-[#178325] py-3`}
              onClick={async () => {
                try {
                  setShowConfirmTransfer({ show: false, index: -1 });
                  setLoading(true);
                  await marketContract
                    .transferItemOwnership(
                      showConfirmTransfer.index,
                      window.tronWeb.address.toHex(transferAddr)
                    )
                    .send({
                      feeLimit: 100_000_000,
                      callValue: 0,
                      shouldPollResponse: true,
                    });
                  await getProducts();
                } catch (e) {}
                setLoading(false);
                setShowConfirmTransfer({ show: false, index: -1 });
              }}
            >
              <p className="text-center">Proceed</p>
            </button>
            <div
              className="bg-[#780c0c] text-[#c9c9c9] leading-3 rounded-lg flex items-center px-2 cursor-pointer hover:bg-[#fe4a4a] py-3"
              onClick={() => setShowConfirmTransfer({ show: false, index: -1 })}
            >
              <p className="text-center">Cancel</p>
            </div>
          </div>
        </div>
      </TronDialog>
    </>
  );
}
