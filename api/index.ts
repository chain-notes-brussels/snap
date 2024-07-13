import express, { Request, Response, Application } from 'express';
import cors from 'cors';

const app: Application = express();
const port = 3000;

// Use the cors middleware with specific options
app.use(cors({
  origin: '*', // Allow all origins
}));

app.use(express.json());

app.get('/hello', (req: Request, res: Response) => {
  res.json({ message: 'yes' });
});

//  type for note
type Note = {
  chainId: number;
  commentator: string;
  comment: string;
  sentiment: boolean;
  timestamp: number;
};

let client: any;
let space: any;
const spaceName = 'notes-space';

const initializeClient = async () => {
  if (!client) {
    const { create } = await import('@web3-storage/w3up-client');
    client = await create();
    const account = await client.login('atsetsoffc@gmail.com');

    // Check if the space already exists
    const spaces = await client.listSpaces();
    space = spaces.find((s: any) => s.name === spaceName);

    if (!space) {
      space = await client.createSpace(spaceName);
      await client.addSpace(await space.createAuthorization(client));
      await client.setCurrentSpace(space.did());
      await account.provision(space.did());
    } else {
      await client.setCurrentSpace(space.did());
    }
  }
};

app.post('/createNewNote', async (req: Request, res: Response) => {
  try {
    await initializeClient();

    const note: Note = req.body;

    const noteContent = JSON.stringify(note);
    const file = new File([noteContent], 'note.json', { type: 'application/json' });

    const cid = await client.uploadFile(file);
    console.log(`Uploaded to ${cid}`);

    res.json({ message: 'Note created successfully', cid });
  } catch (error) {
    console.error('Error creating note:', error);
    res.status(500).json({ message: 'Failed to create note', error });
  }
});

app.get('/getNote', async (req: Request, res: Response) => {
  // Implementation for getNote endpoint
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
