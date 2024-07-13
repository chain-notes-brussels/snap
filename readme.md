## 🏗 Chain Notes


<h4 >
  <a href="https://github.com/chain-notes-brussels/chain-notes-snap">Frontend Repo</a> |
  <a href="https://chain-notes.vercel.app/">Website</a>

  ![logo](assets/logo.png)

<h4>

---
&nbsp;

how to run snap
cd into api

&nbsp;

```bash
cd api
```
```bash
yarn install
```
```bash
yarn start
```

## Imporant Endpoint From API

  ## /createNewNote
   **description** :  endpoint to create new note on ipfs that takes arguments

The function accepts the following arguments:

- **`chainId`**: <span style="color:green;">**Number**</span>
- **`commentator`**: <span style="color:green;">**String**</span>
- **`comment`**: <span style="color:green;">**String**</span>
- **`sentiment`**: <span style="color:green;">**Boolean**</span>
- **`timestamp`**: <span style="color:green;">**Date**</span>

### Function Return Types

The function returns the following:

- **`CID`**: <span style="color:green;">**String**</span>


### Example

The function might return:

```javascript
{
  chainId: 51167,
  commentator: "0xTest",
  comment: "Best Contract 🔥",
  sentiment : "positive",
  timestamp: new Date()
}


