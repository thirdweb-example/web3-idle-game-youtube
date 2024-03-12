import { ConnectEmbed, SmartWallet, useAddress, useSDK, useShowConnectEmbed, useUser, useWallet } from "@thirdweb-dev/react";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import styles from "../styles/Home.module.css";
import { getUser } from "./api/auth/[...thirdweb]";
import { WORKER_CONTRACT_ADDRESS } from "../constants/contracts";

// Set loginOptional to false to require the user to login
const loginOptional = false;

const Login = () => {
    // Return the ConnectEmbed component if the user is not logged in
    const showConnectEmbed = useShowConnectEmbed();

    // Get the user's wallet, address, and SDK
    const wallet = useWallet();
    const address = useAddress();
    const sdk = useSDK();

    // Check if the user is logged in and redirect to the home page if they are
    const { isLoggedIn, isLoading } = useUser();
    const router = useRouter();

    // States for loading worker status
    const [loadingWorkerStatus, setLoadingWorkerStatus] = useState(false);
    const [loadingStatus, setLoadingStatus] = useState("");

    // Function to check if the user is a new player and claim a worker and tokens
    // If not a new player, redirect to the home page
    const checkNewPlayer = async () => {
        try {
            // Check if the wallet is a SmartWallet and the user's address and SDK are available
            if(wallet instanceof SmartWallet && address && sdk) {
                // Set the loading status to true and status message
                setLoadingWorkerStatus(true);
                setLoadingStatus("Checking worker balance...");

                // Check if the user has a worker NFT
                const workerContract = await sdk?.getContract(WORKER_CONTRACT_ADDRESS);
                const workerBalance = await workerContract?.erc721.balanceOf(address);

                // If the user does not have a worker, claim a worker and tokens
                if(workerBalance?.toNumber() === 0) {
                    // Set the status message
                    setLoadingStatus("No worker found...");
                    try {
                        // Set the status message and claim the worker and tokens with Engine
                        setLoadingStatus("Claiming worker and tokens...")
                        const response = await fetch("/api/claimToken", {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json",
                            },
                            body: JSON.stringify({ address: address }),
                        });

                        const data = await response.json();
                        if(!response.ok) {
                            throw new Error(data.message);
                        }

                        // Set the status message
                        setLoadingStatus("Worker and tokens claimed...");
                    } catch (error) {
                        console.error(error);
                        alert("Error creating new account. Please try again.");
                    } finally {
                        // Redirect to the home page
                        setLoadingStatus("");
                        router.push("/");
                    }
                } else {
                    // If the user has a worker, redirect to the home page
                    setLoadingStatus("");
                    router.push("/");
                }
            } else {
                console.error("Wallet is not a SmartWallet");
            }
        } catch (error) {
            console.error("Error getting worker balance");
            console.error(error);
        }
    };

    // Run the checkNewPlayer function when the user is logged in and not loading
    useEffect(() => {
        if(isLoggedIn && !isLoading) {
            checkNewPlayer();
        }
    }, [isLoggedIn, isLoading, wallet]);

    // Return status message if claiming worker and tokens
    if(loadingWorkerStatus) {
        return (
            <div className={styles.container}>
                <h1>{loadingStatus}</h1>
            </div>
        )
    }

    return (
        <div className={styles.container}>
            <h1>Web3 Idle Game Login</h1>
            {showConnectEmbed && (
                <ConnectEmbed
                    auth={{
                        loginOptional,
                    }}
                />
            )}
        </div>
    )
};

export default Login;

// This is a server-side function that checks if the user is logged in and redirects to the home page if not.
export async function getServerSideProps(context: any) {
    const user = await getUser(context.req);

    console.log("Checking user" + user?.address);
    if(user) {
        return {
        redirect: {
            destination: "/",
            permanent: false,
        },
        };
    }

    return {
        props: {},
    };
}