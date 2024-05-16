import { TransactionBlock } from "@mysten/sui.js/transactions";
import { type OwnedObjectRef, SuiClient, getFullnodeUrl } from "@mysten/sui.js/client";
import { keypair, type IObjectInfo, getId, type IConfigInfo } from './utils.js';
import { execSync } from 'child_process';
import * as fs from "fs";

type Network = "testnet" | "mainnet" | "devnet";

(async () => {
	console.log("publishing...")
	let network = process.argv[process.argv.indexOf('--network') + 1] as Network;
	if (!network) {
		network = "testnet";
	}
    console.log(process.env.SUI_PACKAGE_PATH!);
	const { modules, dependencies } = JSON.parse(
		execSync(`sui move build --dump-bytecode-as-base64 --path ${process.env.SUI_PACKAGE_PATH!}`, {
			encoding: 'utf-8',
		}),
       // await $`sui move build --dump-bytecode-as-base64 --path ${process.env.SUI_PACKAGE_PATH!}`.text()
	);
	
	const client = new SuiClient({ url: getFullnodeUrl(network) });
	try {
		const tx = new TransactionBlock();
		const [upgradeCap] = tx.publish({ modules, dependencies });
		tx.setGasBudget(1000000000);
		tx.transferObjects([upgradeCap], keypair.getPublicKey().toSuiAddress());
		const result = await client.signAndExecuteTransactionBlock({
			signer: keypair,
			transactionBlock: tx,
			options: {
				showEffects: true,
			},
			requestType: "WaitForLocalExecution"
		});

		console.log("result: ", JSON.stringify(result, null, 2));

		// return if the tx hasn't succeed
		if (result.effects?.status?.status !== "success") {
			console.log("\n\nPublishing failed");
			return;
		}

		// get all created objects IDs
		const createdObjectIds = result.effects.created!.map(
			(item: OwnedObjectRef) => item.reference.objectId
		);

		// fetch objects data
		const createdObjects = await client.multiGetObjects({
			ids: createdObjectIds,
			options: { showContent: true, showType: true, showOwner: true }
		});

		const objects: IObjectInfo[] = [];
		createdObjects.forEach((item) => {
			if (item.data?.type === "package") {
				objects.push({
					type: "package",
					id: item.data?.objectId,
				});
			} else if (!item.data!.type!.startsWith("0x2::")) {
				objects.push({
					type: item.data?.type!.slice(68),
					id: item.data?.objectId,
				});
			}
		});

        //await Bun.write(process.env.COFIG_FILE_PATH!,JSON.stringify(config, null, 2))
		fs.writeFileSync(process.env.COFIG_FILE_PATH!, JSON.stringify(objects, null, 2));

	} catch (e) {
		console.log(e);
	} finally {
		console.log("\n\nSuccessfully deployed at: " + getId("package"));
	}
})()