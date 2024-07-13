import express, { Request, Response, Application } from "express";
import cors from "cors";
import { create } from "@web3-storage/w3up-client";
import {BaseContract, Contract, ethers} from "ethers";
// const { create } = require('@web3-storage/w3up-client');
import contractAbi from './contractInfo/contractAbi.json'

export const app: Application = express();
const port = 3000;

const abi = [
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "author",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "contractAddress",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "amountOfNotesForContract",
        "type": "uint256"
      },
      {
        "components": [
          {
            "internalType": "address",
            "name": "noteWriter",
            "type": "address"
          },
          {
            "internalType": "enum CNDataTypes.Sentiment",
            "name": "sentiment",
            "type": "uint8"
          },
          { "internalType": "uint16", "name": "score", "type": "uint16" },
          { "internalType": "string", "name": "uri", "type": "string" }
        ],
        "indexed": false,
        "internalType": "struct CNDataTypes.Note",
        "name": "note",
        "type": "tuple"
      }
    ],
    "name": "NotePublished",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "tipper",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "author",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "contractAddress",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "tipAmount",
        "type": "uint256"
      },
      {
        "components": [
          {
            "internalType": "address",
            "name": "noteWriter",
            "type": "address"
          },
          {
            "internalType": "enum CNDataTypes.Sentiment",
            "name": "sentiment",
            "type": "uint8"
          },
          { "internalType": "uint16", "name": "score", "type": "uint16" },
          { "internalType": "string", "name": "uri", "type": "string" }
        ],
        "indexed": false,
        "internalType": "struct CNDataTypes.Note",
        "name": "note",
        "type": "tuple"
      }
    ],
    "name": "Tipped",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "voter",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "contractAddress",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint16",
        "name": "noteIndex",
        "type": "uint16"
      },
      {
        "indexed": false,
        "internalType": "enum CNDataTypes.Rating",
        "name": "rating",
        "type": "uint8"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "score",
        "type": "uint256"
      }
    ],
    "name": "Voted",
    "type": "event"
  },
  {
    "inputs": [],
    "name": "DENOMINATOR",
    "outputs": [{ "internalType": "uint16", "name": "", "type": "uint16" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "HELPFULNESS_THRESHOLD",
    "outputs": [{ "internalType": "uint16", "name": "", "type": "uint16" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "INITIAL_ELIGIBILITY_RATING_THRESHOLD",
    "outputs": [{ "internalType": "uint16", "name": "", "type": "uint16" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "contractAddress",
        "type": "address"
      },
      { "internalType": "uint16", "name": "index", "type": "uint16" },
      {
        "internalType": "enum CNDataTypes.Rating",
        "name": "rating",
        "type": "uint8"
      }
    ],
    "name": "amountOfRating",
    "outputs": [
      { "internalType": "uint32", "name": "amount", "type": "uint32" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "contractAddress",
        "type": "address"
      },
      { "internalType": "uint256", "name": "", "type": "uint256" }
    ],
    "name": "notesOf",
    "outputs": [
      { "internalType": "address", "name": "noteWriter", "type": "address" },
      {
        "internalType": "enum CNDataTypes.Sentiment",
        "name": "sentiment",
        "type": "uint8"
      },
      { "internalType": "uint16", "name": "score", "type": "uint16" },
      { "internalType": "string", "name": "uri", "type": "string" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "_contractAddress",
        "type": "address"
      },
      { "internalType": "string", "name": "_uri", "type": "string" },
      {
        "internalType": "enum CNDataTypes.Sentiment",
        "name": "_sentiment",
        "type": "uint8"
      }
    ],
    "name": "publishNote",
    "outputs": [
      {
        "components": [
          {
            "internalType": "address",
            "name": "noteWriter",
            "type": "address"
          },
          {
            "internalType": "enum CNDataTypes.Sentiment",
            "name": "sentiment",
            "type": "uint8"
          },
          { "internalType": "uint16", "name": "score", "type": "uint16" },
          { "internalType": "string", "name": "uri", "type": "string" }
        ],
        "internalType": "struct CNDataTypes.Note",
        "name": "_note",
        "type": "tuple"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "address", "name": "user", "type": "address" },
      { "internalType": "enum CNDataTypes.Rating", "name": "", "type": "uint8" }
    ],
    "name": "ratingWeightOf",
    "outputs": [
      { "internalType": "uint40", "name": "amount", "type": "uint40" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "_contractAddress",
        "type": "address"
      }
    ],
    "name": "retrieveContractNotes",
    "outputs": [
      {
        "components": [
          {
            "internalType": "address",
            "name": "noteWriter",
            "type": "address"
          },
          {
            "internalType": "enum CNDataTypes.Sentiment",
            "name": "sentiment",
            "type": "uint8"
          },
          { "internalType": "uint16", "name": "score", "type": "uint16" },
          { "internalType": "string", "name": "uri", "type": "string" }
        ],
        "internalType": "struct CNDataTypes.Note[]",
        "name": "_notes",
        "type": "tuple[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "contractAddress",
        "type": "address"
      },
      { "internalType": "uint16", "name": "index", "type": "uint16" }
    ],
    "name": "scoreInfoOf",
    "outputs": [
      { "internalType": "uint256", "name": "score", "type": "uint256" },
      { "internalType": "bool", "name": "consideredHelpful", "type": "bool" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "contractAddress",
        "type": "address"
      },
      {
        "internalType": "enum CNDataTypes.Sentiment",
        "name": "sentiment",
        "type": "uint8"
      }
    ],
    "name": "sentimentOf",
    "outputs": [
      { "internalType": "uint16", "name": "amount", "type": "uint16" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "uint16", "name": "_noteIndex", "type": "uint16" },
      {
        "internalType": "address",
        "name": "_contractAddress",
        "type": "address"
      }
    ],
    "name": "tip",
    "outputs": [{ "internalType": "bool", "name": "_success", "type": "bool" }],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "address", "name": "user", "type": "address" },
      {
        "internalType": "address",
        "name": "contractAddress",
        "type": "address"
      },
      { "internalType": "uint16", "name": "index", "type": "uint16" }
    ],
    "name": "userRatingOfNote",
    "outputs": [
      { "internalType": "enum CNDataTypes.Rating", "name": "", "type": "uint8" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "enum CNDataTypes.Rating",
        "name": "_rating",
        "type": "uint8"
      },
      { "internalType": "uint16", "name": "_noteIndex", "type": "uint16" },
      {
        "internalType": "address",
        "name": "_contractAddress",
        "type": "address"
      }
    ],
    "name": "vote",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
]


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

// Type for note
type Note = {
  chainId: number;
  commentator: string;
  comment: string;
  sentiment: boolean;
  timestamp: number;
};

let client: any;
let space: any;
const spaceName = "notes-space";

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

app.get("/getNote", async (req: Request, res: Response) => {
  try {
    client = await create();
    const account = await client.login("atsetsoffc@gmail.com");

    // Check if the space already exists
    const spaces = await client.listSpaces();
    space = spaces.find((s: any) => s.name === spaceName);

    if (!space) {
      space = await client.createSpace(spaceName);
      await client.addSpace(await space.createAuthorization(client));
      console.log(`Created space ${space.did()}`);
      await client.setCurrentSpace(space.did());
      await account.provision(space.did());
    } else {
      console.log(`Using existing space ${space.did()}`);
      await client.setCurrentSpace(space.did());
    }

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

app.post("/getBestComment", async (req, res) => {
  try {
      const address = req.body.address;
      const signer = new ethers.Wallet('5b48d3f5c11d2a956f056557186c322f6a7fe940a0f8bc77a83d0ca5f72b1c9a', new ethers.JsonRpcProvider('https://base-sepolia.blockpi.network/v1/rpc/public'));
      const contract = new ethers.Contract('0x3B89a9D1026E29c7959154E5c826159C720007cb', abi, signer);

      const response : Note[] = await contract.retrieveContractNotes(address);

      // Convert BigInt to string for serialization
      const serializedResponse = response.map(result => ({
          address: result[0],
          value1: result[1].toString(),
          value2: result[2].toString(),
          data: result[3]
      }));

      res.json({ response: serializedResponse });
  } catch (error) {
      console.error("Error retrieving note:", error);
      res.status(500).json({ message: "Failed to retrieve note", error });
  }
});


app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
