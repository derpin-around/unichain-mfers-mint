"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Toast } from "@/components/ui/toast";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Minus, Plus } from "lucide-react";
import { useTheme } from "next-themes";
import type { ThirdwebContract } from "thirdweb";
import {
	ClaimButton,
	ConnectButton,
	MediaRenderer,
	NFT,
	useActiveAccount,
} from "thirdweb/react";
import { client } from "@/lib/thirdwebClient";
import React from "react";
import { toast } from "sonner";
import { Skeleton } from "./ui/skeleton";

type Props = {
	contract: ThirdwebContract;
	displayName: string;
	description: string;
	contractImage: string;
	pricePerToken: number | null;
	currencySymbol: string | null;
	isERC1155: boolean;
	isERC721: boolean;
	tokenId: bigint;
	claimedSupply: bigint;
	unclaimedSupply: bigint;
};

export function NftMint(props: Props) {
	// console.log(props);
	const [isMinting, setIsMinting] = useState(false);
	const [quantity, setQuantity] = useState(1);
	const [useCustomAddress, setUseCustomAddress] = useState(false);
	const [customAddress, setCustomAddress] = useState("");
	const { theme, setTheme } = useTheme();
	const account = useActiveAccount();

	const decreaseQuantity = () => {
		setQuantity((prev) => Math.max(1, prev - 1));
	};

	const increaseQuantity = () => {
		setQuantity((prev) => prev + 1); // Assuming a max of 10 NFTs can be minted at once
	};

	const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const value = Number.parseInt(e.target.value);
		if (!Number.isNaN(value)) {
			setQuantity(Math.min(Math.max(1, value)));
		}
	};

	// const toggleTheme = () => {
	// 	setTheme(theme === "dark" ? "light" : "dark");
	// };
	if (props.pricePerToken === null || props.pricePerToken === undefined) {
		console.error("Invalid pricePerToken");
		return null;
	}
	return (
		<div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors duration-200">
			<div className="absolute top-4 right-4 z-[9999]">
				<ConnectButton client={client} />
			</div>
			<Card className="w-full max-w-md">
				<CardContent className="pt-6">
					<div className="aspect-square overflow-hidden rounded-lg mb-4 relative">
						{props.isERC1155 ? (
							<NFT contract={props.contract} tokenId={props.tokenId}>
								<React.Suspense
									fallback={<Skeleton className="w-full h-full object-cover" />}
								>
									<NFT.Media className="w-full h-full object-cover" />
								</React.Suspense>
							</NFT>
						) : (
							<MediaRenderer
								client={client}
								className="w-full h-full object-cover pt-12"
								alt=""
								src={
									props.contractImage || "/placeholder.svg?height=400&width=400"
								}
							/>
						)}
					</div>
					<h2 className="text-2xl font-bold mb-2 dark:text-white text-center">
						{props.displayName}
					</h2>
					<p className="text-gray-600 dark:text-gray-300 mb-4 text-center">
						{props.description}<br></br>
						{props.unclaimedSupply !== undefined ? `(${props.unclaimedSupply.toLocaleString()} mints remaining)` : ""}
					</p>
					<p className="text-gray-600 dark:text-gray-300 mb-4 text-center">
					<strong>how many mfers do you want?</strong>
					</p>
					<div className="flex items-center mb-4">
						<div className="flex items-center justify-center w-full">
							<Button
								variant="outline"
								size="icon"
								onClick={decreaseQuantity}
								disabled={quantity <= 1}
								aria-label="Decrease quantity"
								className="rounded-r-none"
							>
								<Minus className="h-4 w-4" />
							</Button>
							<Input
								type="number"
								value={quantity}
								onChange={handleQuantityChange}
								className="w-28 text-center rounded-none border-x-0 pl-6"
								min="1"
							/>
							<Button
								variant="outline"
								size="icon"
								onClick={increaseQuantity}
								aria-label="Increase quantity"
								className="rounded-l-none"
							>
								<Plus className="h-4 w-4" />
							</Button>
						</div>
					</div>
					<div className="flex items-center justify-center mb-4 text-center w-full">
						<div className="text-base font-semibold dark:text-white">
							<span style={{fontFamily: "monospace"}}>{props.pricePerToken * quantity} {props.currencySymbol}</span>
						</div>
					</div>
					<div className="flex items-center justify-center mb-4 text-center w-full">
						<div className="text-base dark:text-white">
							(🤝 only <span style={{fontFamily: "monospace", fontWeight: "bold"}}>{.00042069 * quantity} {props.currencySymbol}</span> for mfers, tinyass unicorns, and based space punks holders from february 17th snapshot)
						</div>
					</div>

					<div className="flex items-center justify-center space-x-2 mb-4 w-full">
						<Switch
							id="custom-address"
							checked={useCustomAddress}
							onCheckedChange={setUseCustomAddress}
						/>
						<Label
							htmlFor="custom-address"
							className={`${useCustomAddress ? "" : "text-gray-500"} cursor-pointer`}
						>
							mint to a custom address
						</Label>
					</div>
					{useCustomAddress && (
						<div className="flex justify-center mb-4 w-full">
							<Input
								id="address-input"
								type="text"
								placeholder="Enter recipient address"
								value={customAddress}
								onChange={(e) => setCustomAddress(e.target.value)}
								className="w-full max-w-md"
							/>
						</div>
					)}
				</CardContent>
				<CardFooter>
					{account ? (
						<ClaimButton
							theme={"light"}
							contractAddress={props.contract.address}
							chain={props.contract.chain}
							client={props.contract.client}
							claimParams={
								props.isERC1155
									? {
											type: "ERC1155",
											tokenId: props.tokenId,
											quantity: BigInt(quantity),
											to: customAddress,
											from: account.address,
										}
									: props.isERC721
										? {
												type: "ERC721",
												quantity: BigInt(quantity),
												to: customAddress,
												from: account.address,
											}
										: {
												type: "ERC20",
												quantity: String(quantity),
												to: customAddress,
												from: account.address,
											}
							}
							style={{
								backgroundColor: "black",
								color: "white",
								width: "100%",
							}}
							disabled={isMinting}
							onTransactionSent={() => toast.info("thank you mfer - minting now...")}
							onTransactionConfirmed={() =>
								toast.success("minted!")
							}
							onError={(err) => toast.error(err.message)}
						>
							mint {quantity} mfer{quantity > 1 ? "s" : ""}
						</ClaimButton>
					) : (
						<ConnectButton
							client={client}
							connectButton={{ style: { width: "100%" } }}
						/>
					)}
				</CardFooter>
			</Card>
			{true && (
				<Toast className="fixed bottom-4 right-4 bg-green-500 text-white p-4 rounded-md">
					successfully minted {quantity} mfer{quantity > 1 ? "s" : ""}
					{useCustomAddress && customAddress ? ` to ${customAddress}` : ""}!
				</Toast>
			)}
		</div>
	);
}
