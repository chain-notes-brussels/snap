import type { OnTransactionHandler } from "@metamask/snaps-sdk";
import { panel, heading, text, input, button, form, row, address, divider, image } from "@metamask/snaps-sdk";
import type { SeverityLevel, OnSignatureHandler } from "@metamask/snaps-sdk";
import checkMark from "./public/checkmark.svg";


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
  // Function to fetch insights
  async function getJson(url: string): Promise<string> {
    const response = await fetch(url);
    const data = await response.json();
    return JSON.stringify(data);
  }

  const convertedChainId = parseInt(chainId.split(":")[1]);

  

  // const insights = await getJson("http://localhost:3000/hello");



  return {
    content:
     panel([

      heading("Users added context they thought people might want to know"),

      divider(),

      row("🚫", text("this contract is scam! duh")),

  
      row("chainId : ", text(chainId)),

      divider(),

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
