import { Alchemy, Network } from "alchemy-sdk";
import { useEffect, useState } from "react";
import { ethers } from "ethers";

import "./App.css";

// Refer to the README doc for more information about using API
// keys in client-side code. You should never do this in production
// level code.
const settings = {
  apiKey: process.env.REACT_APP_ALCHEMY_API_KEY,
  network: Network.ETH_MAINNET,
};

// In this week's lessons we used ethers.js. Here we are using the
// Alchemy SDK is an umbrella library with several different packages.
//
// You can read more about the packages here:
//   https://docs.alchemy.com/reference/alchemy-sdk-api-surface-overview#api-surface
const alchemy = new Alchemy(settings);

function App() {
  const [blockNumber, setBlockNumber] = useState();
  const [balanceAddress, setBalanceAddress] = useState({ address: "" });
  const [tokenBalances, setTokenBalances] = useState([]);
  const [blockTransactions, setBlockTransactions] = useState([]);
  const [ownedNfts, setOwnedNfts] = useState([]);
  const [nfts, setNfts] = useState([]);
  const [lastYearTransfers, setLastYearTransfers] = useState([]);

  useEffect(() => {
    async function getBlockNumber() {
      setBlockNumber(await alchemy.core.getBlockNumber());
    }
    async function getEOAData() {
      const response = await alchemy.core.getTokenBalances(
        "0x8B84C916ff2F183Ab87d1fd792426b8C16935c47"
      );
      setBalanceAddress({
        address: response.address,
      });

      setTokenBalances(response.tokenBalances);

      const myData = await alchemy.core.getBlockWithTransactions(
        "0x92fc42b9642023f2ee2e88094df80ce87e15d91afa812fef383e6e5cd96e2ed3"
      );

      setBlockTransactions(myData.transactions);
      const Nfts = await alchemy.nft.getNftsForOwner(
        "0x8B84C916ff2F183Ab87d1fd792426b8C16935c47"
      );

      setOwnedNfts(Nfts.ownedNfts);

      const nftBelongings = [];
      const nftAddresses = [];

      Nfts.ownedNfts.forEach(async (item) => {
        nftBelongings.push(
          await alchemy.nft.getNftMetadata(item.contract.address, item.tokenId)
        );
        nftAddresses.push(item.contract.address);
      });

      setNfts(nftBelongings);

      const allTransactions = await alchemy.core.getAssetTransfers({
        fromAddress: "0x8B84C916ff2F183Ab87d1fd792426b8C16935c47",
        category: ["external", "internal", "erc20", "erc721", "erc1155"],
      });

      console.log(allTransactions);

      setLastYearTransfers(allTransactions.transfers);
    }

    getBlockNumber();
    getEOAData();
  }, [
    blockNumber,
    balanceAddress,
    tokenBalances,
    blockTransactions,
    ownedNfts,
    nfts,
  ]);

  return (
    <div className="App">
      <h2>Current Block Number: {blockNumber}</h2>
      <h2>Balance Address: {balanceAddress.address}</h2>
      <ul>
        <h2>Token Balances</h2>
        {tokenBalances &&
          tokenBalances.map((item) => (
            <li key={item.contractAddress}>
              {item.contractAddress}: {parseInt(item.tokenBalance, 16)}
            </li>
          ))}
      </ul>
      <h2>Last Year Transactions</h2>
      <ul>
        {lastYearTransfers &&
          lastYearTransfers.map((transaction) => (
            <li>
              <h4>Transaction Hash:</h4>
              {transaction.hash}
            </li>
          ))}
      </ul>
      <h2>Owned Nft Titles</h2>
      <ul>
        {nfts &&
          nfts.map((nft) => (
            <li key={nft.tokenId}>
              <h4>NFT Address:</h4>
              {nft.contract.address} - tokenId: {nft.tokenId}
            </li>
          ))}
      </ul>
      <h2>Owned Nfts Metadata</h2>
      <ul>
        {ownedNfts &&
          ownedNfts.map((nft) => (
            <li key={nft.tokenId}>
              <h4>NFT Description:</h4>
              {nft.description}
            </li>
          ))}
      </ul>
      <h2>Transactions inside Block</h2>
      <ul>
        {blockTransactions &&
          blockTransactions.map((transaction) => (
            <li key={transaction.hash}>
              {transaction.hash} - {transaction.data}
            </li>
          ))}
      </ul>
    </div>
  );
}

export default App;
