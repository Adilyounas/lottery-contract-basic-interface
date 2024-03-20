import { useEffect, useState } from "react";
import "./App.css";
import lottery from "./lottery";
import web3 from "./web3";

function App() {
  const [managerState, setManagerState] = useState("");
  const [playerState, setPlayersState] = useState([]);
  const [balanceState, setBalanceState] = useState("");
  const [value, setValue] = useState("");
  const [messageState, setMessageState] = useState("");

  const formSubmitHandler = async (e) => {
    e.preventDefault();
    try {
      const accounts = await web3.eth.getAccounts();

      setMessageState("waiting on transaction to be completed");

      const result = await lottery.methods.enter().send({
        from: accounts[0],
        value: web3.utils.toWei(value, "ether"),
      });

      console.log(result);

      setMessageState("You have been Entered!");
    } catch (error) {
      console.warn(error);
      setMessageState(error);
    }
  };

  const pickAWinnerHandler = async () => {
    try {
      const accounts = await web3.eth.getAccounts();
  
      setMessageState("Waiting for transaction to be confirmed...");
  
      // Send transaction to pick the winner
      const transactionReceipt = await lottery.methods.picWinner().send({
        from: accounts[0]
      });
  
      // Extract the transaction hash from the receipt
      const transactionHash = transactionReceipt.transactionHash;
  
      setMessageState(`Transaction confirmed: ${transactionHash}`);
  
      // Fetch the winner after the transaction is confirmed
      const winner = await lottery.methods.winner().call();
  
      setMessageState(`Our lucky winner is ${winner}`);
    } catch (error) {
      console.error("Error picking winner:", error);
      setMessageState(`Error: ${error.message}`);
    }
  };
  

  useEffect(() => {
    const fetchManager = async () => {
      const manager = await lottery.methods.manager().call();
      const players = await lottery.methods.getPlayersArr().call();
      const balance = await web3.eth.getBalance(lottery.options.address);

      setManagerState(manager);
      setPlayersState(players);
      setBalanceState(balance);
    };

    fetchManager();
  }, []);

  return (
    <>
      <h2>Lottery Contract</h2>
      <span>This contract is managed by </span> <strong>{managerState} </strong>
      <span>people enrolled In </span> <strong>{playerState.length} </strong>
      <span>Total account balance is </span>{" "}
      <strong>{web3.utils.fromWei(balanceState, "ether")} ethers</strong>
      <hr />
      <form onSubmit={formSubmitHandler}>
        <h4>Want to try your luck?</h4>
        <div>
          <label>Amount of ether to enter </label>
          <input value={value} onChange={(e) => setValue(e.target.value)} />
        </div>

        <button type="submit">Enter</button>
      </form>
      <hr />
      <h4>Pick a winner button</h4>
      <button onClick={pickAWinnerHandler}>Pick One Winner</button>
      <hr />
      <h1>{messageState}</h1>
    </>
  );
}

export default App;
