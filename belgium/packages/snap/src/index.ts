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

  const comment = await axios.post(`http://localhost:3000/getBestNotes`, {
    params: { 
      chainId: convertedChainId,
      address : transaction.to,
    }
  });

  console.log('respinse : ', comment.data.response)

  

  // const insights = await getJson("http://localhost:3000/hello");



  return {
    content:
     panel([

      heading("Users added context they thought people might want to know"),

      divider(),

      row("🚫", text("this contract is scam! duh")),

  
      row("chainId : ", text(cnvr)),

      divider(),

      text(comment.data.response),

      // text(transactionOrigin),

      // heading("Tip Commentator"),

      // input({
      //   name: "tip user",
      //   placeholder: "amount to tip",
      // }),
      // button({
      //   value: "tip",
      //   buttonType: "submit",
      // }),
      // divider(),

      text("[See Detailed](https://metamask.io)."),
      // ...insights.map((insight) => text(insight.value)),

    ]),
     
    severity: 'critical',
  };
};


export const onSignature: OnSignatureHandler = async ({
  signature,
  signatureOrigin,
}) => {
  // const insights = /* Get insights based on custom logic */;
  return {
    content: panel([
      heading("Message is NOT safe to sign!"),

      text("Reason : "),

      heading("Users added context they thought people might want to know"),

      divider(),

      row("🚫", text("this contract is scam! duh")),

      divider(),

      // ...(insights.map((insight) => text(insight.value))),
    ]),
    severity: 'critical',
  };
};
