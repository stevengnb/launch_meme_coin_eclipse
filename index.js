import {
    Connection,
    Keypair,
    PublicKey,
} from "@solana/web3.js";
import {
    createMint,
    getMint,
    createAssociatedTokenAccount,
    getAccount,
    mintToChecked,
    transferChecked,
} from "@solana/spl-token";
import bs58 from "bs58";  
import 'dotenv/config';

  (async () => {
    const connection = new Connection("https://testnet.dev2.eclipsenetwork.xyz", "confirmed");


    const feePayer = Keypair.fromSecretKey(
      bs58.decode(
        process.env.PRIVATE_KEY
      ),
    );

    const steven = Keypair.fromSecretKey(
      bs58.decode(
        process.env.PRIVATE_KEY
      ),
    );

    let mintPubkey = await createMint(
      connection, // conneciton
      feePayer, // fee payer
      steven.publicKey, // mint authority
      steven.publicKey, // freeze authority (you can use `null` to disable it. when you disable it, you can't turn it on again)
      8, // decimals
    );
    console.log(`mintPubkey: ${mintPubkey.toBase58()}`);

    let mintAccountInfo = await getMint(connection, mintPubkey);
    console.log(mintAccountInfo);

    let ata = await createAssociatedTokenAccount(
      connection, // connection
      feePayer, // fee payer
      mintPubkey, // mint
      steven.publicKey // owner,
    );
    console.log(`feePayer: ${feePayer.publicKey.toBase58()}, mint: ${mintPubkey.toBase58()}, steven: ${steven.publicKey.toBase58()}, ATA: ${ata.toBase58()}`);

    let tokenAmount = await connection.getTokenAccountBalance(ata);
    console.log(tokenAmount);

    let tokenAccount = await getAccount(connection, ata);
    console.log(tokenAccount);

    let txhash = await mintToChecked(
      connection, // connection
      feePayer, // fee payer
      mintPubkey, // mint
      ata, // receiver (should be a token account)
      steven, // mint authority
      2 * 1e8, // amount. if your decimals is 8, you mint 10^8 for 1 token.
      8 // decimals
    );
    console.log(`mint txhash: ${txhash}`);
    
    const bob = new PublicKey(
      "212EXZtALYXDQ2VT1hQeMPM41bmovL7t6MTxsxQbxZp9"
    );

    let ata_bob = await createAssociatedTokenAccount(
      connection, // connection
      feePayer, // fee payer˜
      mintPubkey, // mint
      bob // owner,
    );
    console.log(`ATA BOB: ${ata_bob.toBase58()}`);

    let trans_txhash = await transferChecked(
      connection, // connection
      feePayer, // payer
      ata, // from (should be a token account)
      mintPubkey, // mint
      ata_bob, // to (should be a token account)
      steven, // from's owner
      1e8, // amount, if your deciamls is 8, send 10^8 for 1 token
      8 // decimals
    );
    console.log(`transfer txhash: https://explorer.dev.eclipsenetwork.xyz/tx/${trans_txhash}/?cluster=testnet, bob: ${bob.toBase58()}, ata_bob: ${ata_bob.toBase58()}`);
    
  })();