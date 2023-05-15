import { TopMenu, NavBar } from "../../components";

export function PageContainer({ children }) {
  return (
    <div className="flex flex-col min-h-full bg-[#08050A]">
      <TopMenu />
      <div className="relative h-full pb-10">
        <NavBar />
        {children}
      </div>
    </div>
  );
}
