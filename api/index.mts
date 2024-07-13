import express, { Request, Response, Application } from "express";
import cors from "cors";
import { create } from "@web3-storage/w3up-client";
// const { create } = require('@web3-storage/w3up-client');

export const app: Application = express();
const port = 3000;

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
const client = await create()
await client.login('atsetsoffc@gmail.com')
await client.setCurrentSpace('did:key:z6MkoMnWn6NQUrn7LnA6rmRuaQKdtCaax7Q7CHLZFc4ZLekL')
    
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
    const account = await client.login('atsetsoffc@gmail.com');

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

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
