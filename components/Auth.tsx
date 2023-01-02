import { useEffect, useRef, useState } from "react";
import SmartAccount from "@biconomy/smart-account";
import SocialLogin from "@biconomy/web3-auth";
import { ethers } from "ethers";
import { ChainId } from "@biconomy/core-types";
import { css } from "@emotion/css";

const Auth = () => {
    const [smartAccount, setSmartAccount] = useState<SmartAccount | null>(null);
    const [interval, enableInterval] = useState<boolean>(false);
    const sdkRef = useRef<SocialLogin | null>(null);
    const [loading, setLoading] =useState<boolean>(false);

    // useEffect(() => {
    //     login()
    //     .catch((err) => {
    //         console.log('logging error...', err);
    //     });
    // }, []);

    useEffect(() => {
        let configureLogin: any;

        if (interval) {
            configureLogin = setInterval(async () => {
                if (!!sdkRef.current?.provider) {
                    await setupSmartAccount();
                    clearInterval(configureLogin);
                }
            }, 1000);
        }
    }, [interval]);

    const login = async () => {
        if (!sdkRef.current) {
            const SocialLoginSDK = new SocialLogin();
            await SocialLoginSDK.init(ethers.utils.hexValue(ChainId.POLYGON_MAINNET));
            sdkRef.current = SocialLoginSDK;
        }

        if (!sdkRef.current.provider) {
            sdkRef.current.showConnectModal();
            sdkRef.current.showWallet();
            enableInterval(true);
        } else {
            await setupSmartAccount();
        }
    }

    const setupSmartAccount = async () => {
        if (!sdkRef?.current?.provider) {
            return;
        }

        setLoading(true);

        sdkRef.current?.hideWallet();

        const web3Provider = new ethers.providers.Web3Provider(sdkRef.current?.provider);

        try {
            const smartAccount = new SmartAccount(web3Provider, {
                activeNetworkId: ChainId.POLYGON_MAINNET,
                supportedNetworksIds: [ChainId.POLYGON_MAINNET]
            });

            await smartAccount.init();

            setSmartAccount(smartAccount);
            setLoading(false);
        } catch (err) {
            console.log('error setting up smart account...', err);
        }
    }

    const logout = async () => {
        if (!sdkRef.current) {
            console.error('web3Modal is not initialized');
            return;
        }
        await sdkRef.current?.logout();
        sdkRef.current?.hideWallet();
        setSmartAccount(null);
        enableInterval(false);
    }

    return (
        <div className={containerStyle}>
            <h1 className={headerStyle}>Biconomy app example</h1>
            {
                !loading && !smartAccount && <button className={buttonStyle} onClick={login}>Login</button>
            }
            {
                loading && <p>Loading account details...</p>
            }
            {
                !!smartAccount && (
                    <div className={detailsContainerStyle}>
                        <h3>Smart account adress:</h3>
                        <p>{smartAccount.address}</p>
                        <button className={buttonStyle} onClick={logout}>Logout</button>
                    </div>
                )
            }

        </div>
    )
}

const detailsContainerStyle = css`
  margin-top: 10px;
`

const buttonStyle = css`
  padding: 14px;
  width: 200px;
  border: none;
  cursor: pointer;
  border-radius: 100px;
  outline: none;
  margin-top: 20px;
  transition: all .2s;
  &:hover {
    background-color: rgba(0,0,0,0.2);
  }
`

const headerStyle = css`
  font-size: 44px;
`

const containerStyle = css`
  width: 900px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  flex-direction: column;
  padding-top: 100px;
`

export default Auth;

