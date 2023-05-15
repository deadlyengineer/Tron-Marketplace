import defaultImage from "../../assets/icons/shopbag.webp";

const ProductCard = ({ index, uri, name, desc, price, children }) => {
  return (
    <div className="flex flex-col justify-between w-full overflow-hidden border border-white rounded-xl">
      <div>
        <div className="bg-gray-200 w-full h-[300px]">
          {uri?.length > 21 ? (
            <img src={uri} className="w-full h-[300px]" alt="product" />
          ) : (
            <img
              src={defaultImage}
              className="w-full h-[300px]"
              alt="product"
            />
          )}
        </div>
        <p className="py-1 text-sm font-bold text-center text-white">{name}</p>
        <p className="py-1 text-xs font-bold text-center text-[#9f9f9f]">
          TRX <span className="text-base text-white">{price.toString()}</span>
        </p>
        <p className="px-3 py-2 text-xs text-center text-white break-words line-clamp-2">
          {desc}
        </p>
      </div>
      {children}
    </div>
  );
};

export default ProductCard;
