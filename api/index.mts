import express, { Request, Response, Application } from "express";
import cors from "cors";
import { create } from "@web3-storage/w3up-client";
import {BaseContract, Contract, ethers} from "ethers";
// const { create } = require('@web3-storage/w3up-client');
import contractAbi from './contractInfo/contractAbi.json'
import deployedContracts from "./contractInfo/deployedContracts";

import dotenv from 'dotenv';
dotenv.config();

export const app: Application = express();
const port = 3000;

//  -- HELPER FUNCTIONS -- \\

// Helper function to get the RPC URL based on the network
function getRpcUrl(chainId: number): string {
  return deployedContracts[chainId].rpcUrl;
} 

// Helper function to get the contract address based on the network
function getContractAddress(chainId: number): string {
  return deployedContracts[chainId]["Notes"].address;
}

// Helper function to get the contract ABI based on the network
function getContractAbi(chainId: number): string {
  return deployedContracts[chainId]["Notes"].abi;
}

// ------------------------ \\



// Use the cors middleware with specific options
app.use(
  cors({
    origin: "*", // Allow all origins
  })
);

app.use(express.json());

app.get("/hello", (req: Request, res: Response) => {
  res.json({ message: "yes" });
});


  // TYPES \\
// Type for note
type Note = {
  chainId: number;
  commentator: string;
  comment: string;
  sentiment: boolean;
  timestamp: number;
};

// Type for note in smart contract
type NoteSM = {
  noteWriter: number;
  sentiment: string;
  score: string;
  cid: boolean;
};

// -------------------- \\

let client: any;
let space: any;
const spaceName = "notes-space";

// endpoint to create a new note
app.post("/createNewNote", async (req: Request, res: Response) => {
  try {
    const client = await create();
    await client.login("atsetsoffc@gmail.com");
    await client.setCurrentSpace(
      "did:key:z6MkoMnWn6NQUrn7LnA6rmRuaQKdtCaax7Q7CHLZFc4ZLekL"
    );

    const note: Note = req.body;

    const noteContent = JSON.stringify(note);
    const file = new File([noteContent], "note.json", {
      type: "application/json",
    });

    const cid = await client.uploadFile(file);
    console.log(`Uploaded to ${cid}`);

    res.json({ message: "Note created successfully", cid });
  } catch (error) {
    console.error("Error creating note:", error);
    res.status(500).json({ message: "Failed to create note", error });
  }
});

// endpoint to get a note by CID ( NOT DONE )
app.get("/getNote", async (req: Request, res: Response) => {
  try {
    client = await create();
    const account = await client.login("atsetsoffc@gmail.com");

    const cid = req.query.cid as string;
    if (!cid) {
      return res.status(400).json({ message: "CID is required" });
    }

    const file = await client.getFile(cid);
    if (!file) {
      return res.status(404).json({ message: "Note not found" });
    }

    const noteContent = await file.text();
    const note: Note = JSON.parse(noteContent);

    res.json(note);
  } catch (error) {
    console.error("Error retrieving note:", error);
    res.status(500).json({ message: "Failed to retrieve note", error });
  }
});

// endpoint to get all notes for a given address
app.post("/getAllComments", async (req, res) => {
  try {
      const address = req.body.address;
      const signer = new ethers.Wallet(process.env.KEY_1!, new ethers.JsonRpcProvider('https://base-sepolia.blockpi.network/v1/rpc/public'));
      // todo : change contract address's based on network
      const contract = new ethers.Contract('0x3B89a9D1026E29c7959154E5c826159C720007cb', contractAbi, signer);
      // todo : change contract address's based on network

      const response : NoteSM[] = await contract.retrieveContractNotes(address);

      // Convert BigInt to string for serialization
      const serializedResponse : NoteSM[] = response.map(result => ({
          noteWriter: result[0],
          sentiment: result[1].toString(),
          score: result[2].toString(),
          cid: result[3]
      }));

      res.json({ response: serializedResponse });
  } catch (error) {
      console.error("Error retrieving note:", error);
      res.status(500).json({ message: "Failed to retrieve note", error });
  }
});

// endpoint to get best notes for a given address
app.post("/getBestNotes", async (req, res) => {
  try {
      const address = req.body.address;
      const network = req.body.network;  // Assuming network info is provided in the request
      const signer = new ethers.Wallet(process.env.KEY_1!, new ethers.JsonRpcProvider(getRpcUrl(network)));
      
      const contractAddress = getContractAddress(network);
      const contract = new ethers.Contract(contractAddress, contractAbi, signer);

      const response : NoteSM[] = await contract.retrieveContractNotes(address);

      // Convert BigInt to string for serialization
      const serializedResponse : NoteSM[] = response.map(result => ({
          noteWriter: result[0],
          sentiment: result[1].toString(),
          score: result[2].toString(),
          cid: result[3]
      }));

      // Return response that has highest score
      const bestNote = serializedResponse.reduce((prev, current) => {
        return (BigInt(current.score) > BigInt(prev.score)) ? current : prev;
      });

      res.json({ response: bestNote });
  } catch (error) {
      console.error("Error retrieving note:", error);
      res.status(500).json({ message: "Failed to retrieve note", error });
  }
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
