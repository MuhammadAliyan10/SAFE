import { Metadata } from "next";
import DashboardComponent from "../components/DashboardComponent";

export const metadata: Metadata = {
  title: "Dashboard",
};

const page = () => {
  return <DashboardComponent />;
};

export default page;
