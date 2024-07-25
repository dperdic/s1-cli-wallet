#!/usr/bin/env node

import { Command } from "commander";
import { list, balance, keygen, airdrop, transfer, clear } from "./actions";

const program = new Command();

program.name("solstash").description("A simple CLI wallet").version("1.0.0");

program.command("keygen").description("generates a new keypair").action(keygen);

program
  .command("list")
  .description("lists all addresses in the wallet")
  .action(list);

program
  .command("balance")
  .description("gets the balance for the address in SOL")
  .argument("<address>", "the address whose balance will be checked")
  .action(balance);

program
  .command("airdrop")
  .description("requests SOL from a faucet")
  .argument("<address>", "the address that will recieve the SOL")
  .argument("<amount>", "the airdrop amount to request in SOL")
  .action(airdrop);

program
  .command("transfer")
  .description(
    "transfers the specified amount of SOL from one address to another"
  )
  .argument("<sender>", "address that will send the SOL")
  .argument("<recipient>", "address that will recieve the SOL")
  .argument("<amount>", "amount of SOL that will be transfered")
  .action(transfer);

program
  .command("clear")
  .description("deletes all saved keypairs from the wallet")
  .action(clear);

program.parse();
