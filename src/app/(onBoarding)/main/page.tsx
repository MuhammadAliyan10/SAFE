import { Metadata } from "next";
import WelcomePage from "./components/StartingComponent";

export const metadata: Metadata = {
  title: "Main",
};

const page = () => {
  return <WelcomePage />;
};

export default page;
