import { useUser } from "@thirdweb-dev/react";
import styles from "../styles/Home.module.css";
import { NextPage } from "next";
import { useEffect } from "react";
import { useRouter } from "next/router";
import { getUser } from "./api/auth/[...thirdweb]";
import Worker from "../components/Worker";
import Businesses from "../components/Businesses";

const Home: NextPage = () => {
  // Check if the user is logged in
  const { isLoggedIn, isLoading } = useUser();
  // Redirect to login if not logged in
  const router = useRouter();

  // Checks if the user is logged in and redirects to the login page if not.
  // This is a client-side function that runs after the page is loaded.
  useEffect(() => {
    if (!isLoggedIn && !isLoading) {
      router.push("/login");
    }
  }, [isLoggedIn, isLoading, router]);

  return (
    <div className={styles.main}>
      <div style={{
        display: "flex",
        justifyContent: "flex-start",
        alignItems: "flex-start",
        flexDirection: "row",
        width: "100%",
      }}>
        <Worker />
        <Businesses />
      </div>
    </div>
  );
};

export default Home;

// This is a server-side function that checks if the user is logged in and redirects to the login page if not.
export async function getServerSideProps(context: any) {
  const user = await getUser(context.req);

  // Redirect to login if not logged in
  if(!user) {
    return {
      redirect: {
        destination: "/login",
        permanent: false,
      },
    };
  }

  return {
    props: {},
  };
}