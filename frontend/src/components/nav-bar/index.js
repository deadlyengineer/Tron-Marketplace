import { useNavigate } from "react-router-dom";
import { useWallet } from "@tronweb3/tronwallet-adapter-react-hooks";

import ROUTE from "../../constants/routes";

import { ReactComponent as MarketSVG } from "../../assets/icons/attach_money_black.svg";
import { ReactComponent as UserDetailSVG } from "../../assets/icons/user.svg";

const NavBar = ({ props }) => {
  const navigate = useNavigate();
  const { address } = useWallet();

  return (
    <div className="fixed left-0 min-h-full border-r border-[#372A43] pl-2">
      <div
        className={`pl-2 pr-4 py-5 hover:bg-[#442d59] ${
          (window.location.pathname === ROUTE.dashboard ||
            window.location.pathname === ROUTE.product_detail) &&
          "bg-[#24182F]"
        }`}
        onClick={() => navigate(ROUTE.dashboard)}
      >
        <MarketSVG />
      </div>
      <div
        className={`pl-2 pr-4 py-5 hover:bg-[#442d59] ${
          window.location.pathname === ROUTE.user_detail && "bg-[#24182F]"
        }`}
        onClick={() => {
          if (!address) {
            alert("Please connect your wallet first");
          } else navigate(ROUTE.user_detail);
        }}
      >
        <UserDetailSVG className="fill-white" />
      </div>
    </div>
  );
};

export default NavBar;
