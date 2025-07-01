import { Metadata } from "next";
import EmailComponent from "./components/EmailComponent";

export const metadata: Metadata = {
  title: "Email",
};

const page = () => {
  return <EmailComponent />;
};

export default page;
