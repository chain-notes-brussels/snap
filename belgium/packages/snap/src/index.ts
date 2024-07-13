import type { OnTransactionHandler } from "@metamask/snaps-sdk";
import { panel, heading, text, input, button, form, row, address, divider, image } from "@metamask/snaps-sdk";
import type { SeverityLevel, OnSignatureHandler } from "@metamask/snaps-sdk";
import checkMark from "./public/checkmark.svg";
import axios from "axios";

interface EthSignature {
  from: string;
  data: string;
  signatureMethod: "eth_sign";
}

export const onTransaction: OnTransactionHandler = async ({
  transaction,
  chainId,
  transactionOrigin,
}) => {
  console.log('came here')
  console.log('trasanction : ', transaction)
  // Function to fetch insights
  async function getJson(url: string): Promise<string> {
    const response = await fetch(url);
    const data = await response.json();
    return JSON.stringify(data);
  }

  const hexChainId = chainId.split(":")[1]

  const convertedChainId = parseInt(hexChainId!, 16);

  const cnvr = convertedChainId.toString();

  const response = await fetch('http://localhost:3001/getBestNotes', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      params: { 
        chainId: convertedChainId,
        address: transaction.to,
      }
    })
  });
  const comment = await response.json();
  

  // Determine the emoji based on the sentiment
  const sentiment = JSON.stringify(comment.data.ipfsNote.sentiment);
  const emoji = sentiment === 'false' ? '✅' : '🚫';

  return {
    content: panel([
      heading("Users' Added Context"),
      divider(),
      row(emoji, text(JSON.stringify(comment.data.ipfsNote.comment))),
      row("chainId : ", text(cnvr)),
      divider(),
      text("[See Detailed](https://metamask.io)."),
    ]),
    severity: 'critical',
  };
};

export const onSignature: OnSignatureHandler = async ({
  signature,
  signatureOrigin,
}) => {
  return {
    content: panel([
      heading("Message is NOT safe to sign!"),
      text("Reason : "),
      heading("Users added context they thought people might want to know"),
      divider(),
      row("🚫", text("this contract is scam! duh")),
      divider(),
    ]),
    severity: 'critical',
  };
};
