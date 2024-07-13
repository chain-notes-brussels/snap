// THIS IS THE MAIN FILE FOR THE API

// THIS API IS FOR MANAGING IPFS AND SMART CONTRACT INTERACTIONS

// FUNCTIONS INCLUDED ( /createNewNote, /getNote, /getAllComments, /getBestNotes )

// CODE \\

// -- IMPORTS -- \\

// for API
import express, { Request, Response, Application } from "express";
import cors from "cors"
// import { File } from 'node-fetch';

// --;

// for IPFS
import { create as createIPFS } from 'ipfs-http-client';
import { create } from "@web3-storage/w3up-client";
const ipfs = createIPFS({ host: 'ipfs.infura.io', port: 5000, protocol: 'https' });
// --

// for Smart Contract
import { BaseContract, Contract, ethers } from "ethers";
import contractAbi from './contractInfo/contractAbi.json'
import deployedContracts from "./contractInfo/deployedContracts";
import axios from 'axios'
// --

// config
import dotenv from 'dotenv';
dotenv.config();
//--

// main app
export const app: Application = express();
const port = 3000;
// --

// ---------------- \\

//  -- HELPER FUNCTIONS -- \\

// Helper function to get the RPC URL based on the network
function getRpcUrl(chainId: number): string {
  console.log('um : ', deployedContracts[11155111])
  console.log('deploted : ', deployedContracts)
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



// -- MIDDLEWARES -- \\

// cors middleware
app.use(
  cors({
    origin: "*", // Allow all origins
  })
);

// json middleware
app.use(express.json());

// ------------------- \\


// -- TEST ENDPOINTS -- \\
app.get("/hello", (req: Request, res: Response) => {
  res.json({ message: "yes" });
});
// ---------------------- \\


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


// -- ENDPOINTS -- \\

// endpoint to create a new note
// receiving args ( chainId, commentator, comment, sentiment, timestamp )
app.post("/createNewNote", async (req: Request, res: Response) => {
  try {
    const client = await create();
    await client.login("atsetsoffc@gmail.com");
    await client.setCurrentSpace(
      "did:key:z6MkoMnWn6NQUrn7LnA6rmRuaQKdtCaax7Q7CHLZFc4ZLekL"
    );

    const note = req.body; // Expecting note object directly in the request body

    // Create a File from the note object directly
    const noteContent = JSON.stringify(note);
    const createdFile = new File([noteContent], "note.json", {
      type: "application/json",
    });

    const cid = await client.uploadFile(createdFile);
    console.log(`Uploaded to ${cid}`);

    res.json({ message: "Note created successfully", cid });
  } catch (error) {
    console.error("Error creating note:", error);
    res.status(500).json({ message: "Failed to create note", error });
  }
});


// endpoint to get a note by CID
// receiving args ( cid )
app.get("/getNote", async (req: Request, res: Response) => {
  try {
    const cid = req.query.cid as string;

    console.log('cid : ', cid)

    if (!cid) {
      return res.status(400).json({ message: "CID is required" });
    }

    const resp = await axios.get(`https://${cid}.ipfs.w3s.link`)

    console.log('resp : ', resp.data)

    res.json({ type : typeof(resp.data),  response: resp.data });

  } catch (error) {
    console.error("Error retrieving note:", error);
    res.status(500).json({ message: "Failed to retrieve note", error });
  }
});

// endpoint to get all notes for a given address
// receiving args ( address )
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
// receiving args ( address, chainId )
app.post("/getBestNotes", async (req, res) => {
  try {
      const address : String = req.body.params.address;
      const chainId : number = req.body.params.chainId;  // Assuming network info is provided in the request
      console.log(req.body)
      console.log('chainId : ', chainId)
      console.log('address : ', address)
      const signer = new ethers.Wallet(process.env.KEY_1!, new ethers.JsonRpcProvider(getRpcUrl(chainId)));
      
      const contractAddress = getContractAddress(chainId);
      const contract = new ethers.Contract(contractAddress, getContractAbi(chainId), signer);

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

      const noteFromCid = await axios.get(`https://${bestNote.cid}.ipfs.w3s.link`)
      
      res.json({ response: bestNote, ipfsNote : noteFromCid.data });
  } catch (error) {
      console.error("Error retrieving note:", error);
      res.status(500).json({ message: "Failed to retrieve note", error });
  }
});

// ----------------- \\


// -- LISTEN FUNCTION -- \\
app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
// --------------------- \\