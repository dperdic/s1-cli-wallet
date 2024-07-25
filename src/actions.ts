import Conf from "conf";
import chalk from "chalk";
import {
  clusterApiUrl,
  Connection,
  Keypair,
  LAMPORTS_PER_SOL,
  PublicKey,
  sendAndConfirmTransaction,
  SystemProgram,
  Transaction,
  type RpcResponseAndContext,
  type SignatureResult,
} from "@solana/web3.js";

const connection = new Connection(clusterApiUrl("devnet"), "confirmed");
const conf = new Conf({
  projectName: "grobana",
  projectVersion: "1.0.0",
});

export const keygen = () => {
  const keypair = Keypair.generate();

  conf.set(keypair.publicKey.toString(), Array.from(keypair.secretKey));

  console.log(keypair.publicKey.toString());
};

export const list = () => {
  const addresses = conf.store;

  console.log(Object.keys(addresses));
};

export const balance = async (address: string) => {
  let publicKey: PublicKey;

  try {
    publicKey = new PublicKey(address);
  } catch (error) {
    console.log(chalk.red("invalid public key"));

    return;
  }

  const balance = await connection.getBalance(publicKey);

  const balanceInSol = balance / LAMPORTS_PER_SOL;

  console.log("Balance: ", balanceInSol, " SOL");
};

export const airdrop = async (address: string, amount: number) => {
  let publicKey: PublicKey;

  try {
    publicKey = new PublicKey(address);
  } catch (error) {
    console.log(chalk.red("Invalid public key"));

    return;
  }

  try {
    const tx = await connection.requestAirdrop(
      publicKey,
      amount * LAMPORTS_PER_SOL
    );

    const confirmation = await confirmTransaction(tx);

    if (confirmation.value.err) {
      console.log(
        chalk.red(
          "An error occured while confirming the transaction. Check the transaction on an explorer."
        )
      );
    }

    console.log("Transaction hash: ", tx);
  } catch (error) {
    console.log(chalk.red("Error requesting airdrop:", error));
  }
};

export const transfer = async (
  senderAddress: string,
  recipientAddress: string,
  amount: number
) => {
  const secretKey = conf.get(senderAddress) as number[] | undefined;

  if (!secretKey) {
    console.log(chalk.red("Address is not in wallet"));

    return;
  }

  const parsedSecretKey = new Uint8Array(secretKey);

  const senderKeypair = Keypair.fromSecretKey(parsedSecretKey);

  let recipientPublicKey: PublicKey;

  try {
    recipientPublicKey = new PublicKey(recipientAddress);
  } catch (error) {
    console.log(chalk.red("Invalid public key"));

    return;
  }

  const transferTx = new Transaction().add(
    SystemProgram.transfer({
      fromPubkey: senderKeypair.publicKey,
      toPubkey: recipientPublicKey,
      lamports: amount * LAMPORTS_PER_SOL,
    })
  );

  try {
    const tx = await sendAndConfirmTransaction(connection, transferTx, [
      senderKeypair,
    ]);

    console.log("Transaction hash: ", tx);
  } catch (error) {
    console.log(chalk.red("An error occured whil transfering SOL", error));
  }
};

export const clear = () => {
  conf.clear();
};

const confirmTransaction = async (
  tx: string
): Promise<RpcResponseAndContext<SignatureResult>> => {
  const bh = await connection.getLatestBlockhash();

  return await connection.confirmTransaction(
    {
      signature: tx,
      blockhash: bh.blockhash,
      lastValidBlockHeight: bh.lastValidBlockHeight,
    },
    "confirmed"
  );
};
