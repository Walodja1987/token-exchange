import { useState, ChangeEvent } from 'react';
import { ConnectButton, useRainbow } from '@rainbow-me/rainbowkit';
import { ethers } from 'ethers';
import erc20ABI from '../abis/IERC20.json';
import { NextPage } from 'next';
import { useProvider } from "wagmi";

const provider = useProvider();



const CONTRACT_ADDRESS = '0x123456789...'; // Replace with your ERC20 contract address

const IndexPage: NextPage = () => {
  const [address, setAddress] = useState('');
  const [balance, setBalance] = useState('');

  // const rainbowProvider = useContext(RainbowKitContext);

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    setAddress(event.target.value);
  };

  const handleCheckBalance = async () => {
    const provider = await getProvider();
    const contract = new ethers.Contract(CONTRACT_ADDRESS, erc20ABI, provider);

    try {
      const balance = await contract.balanceOf(address);
      setBalance(balance.toString());
    } catch (error) {
      console.error(error);
      setBalance('Error');
    }
  };

  return (    
    <div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'flex-end',
          padding: 12,
        }}
      >
        <ConnectButton />
      </div>
      <input type="text" value={address} onChange={handleInputChange} placeholder="Enter Ethereum address" />
      <button onClick={handleCheckBalance}>Check Balance</button>
      <div>Balance: {balance}</div>
    </div>
  );
};

export default IndexPage;
