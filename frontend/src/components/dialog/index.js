const TronDialog = ({ props, children, show }) => {
  return (
    <div
      className={`max-h-[320px] overflow-auto z-10 fixed rounded-lg border bg-white border-[#4d4d4d] max-w-[480px] duration-150 -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2 ${
        show ? "scale-100" : "scale-0"
      }`}
    >
      {children}
    </div>
  );
};

export default TronDialog;
