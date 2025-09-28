/** biome-ignore-all lint/correctness/useUniqueElementIds: <Values are known> */
"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import type { TokenRow } from "@/lib/server";
import { useQuery } from "@tanstack/react-query";
import {
	AlertCircle,
	AntennaIcon,
	ArrowDownLeft,
	CheckCircle,
	Clock,
	Coins,
	Copy,
	ExternalLink,
	Eye,
	EyeOff,
	HelpCircle,
	QrCode,
	RefreshCw,
	SendIcon,
	Settings,
} from "lucide-react";
import { useEffect, useState } from "react";

type OnrampStep =
	| "amount"
	| "payment"
	| "verification"
	| "processing"
	| "complete";
type SwapStep = "select" | "quote" | "deposit" | "status";
type View = "dashboard" | "onramp" | "swap";
type SwapStatus =
	| "pending"
	| "deposited"
	| "processing"
	| "complete"
	| "failed"
	| "expired";

interface Quote {
	expectedOut: string;
	fees: string;
	expiresAt: string;
}

interface SwapOrder {
	quoteId: string;
	depositAddress: string;
	expiresAt: string;
	status: SwapStatus;
	txHashes?: string[];
	zecRecipient: string;
}

const API_BASE = import.meta.env.VITE_SERVER_URL;

export function WalletInterface() {
	const { isPending, error, data } = useQuery<TokenRow[]>({
		queryKey: ["assets"],
		queryFn: async () => {
			const url = `${API_BASE}/api/tokens`;

			const res = await fetch(url, {
				headers: { "content-type": "application/json" },
			});

			const txt = await res.text();

			if (!res.ok) throw new Error(`${res.status} ${txt}`);

			try {
				const json: TokenRow[] = JSON.parse(txt);

				const sortedTokens = json.sort((a, b) =>
					a.symbol.localeCompare(b.symbol),
				);

				console.log("✓ JSON:", sortedTokens);
				return sortedTokens;
			} catch (_e) {
				throw new Error(
					`Expected JSON, got content-type=${res.headers.get("content-type")} body=${txt.slice(0, 200)}`,
				);
			}
		},
	});

	const [assetList, setAssetList] = useState<TokenRow[]>([]);
	useEffect(() => {
		if (data) setAssetList(data);
	}, [data]);

	const [currentView, setCurrentView] = useState<View>("swap");
	const [currentStep, setCurrentStep] = useState<OnrampStep | SwapStep>(
		"select",
	);
	const [amount, setAmount] = useState("");
	const [showBalance, setShowBalance] = useState(true);

	// Swap state
	const [selectedAsset, setSelectedAsset] = useState<TokenRow | null>(null);
	const [zcashAddress] = useState("t1abc123def456ghi789jkl012mno345pqr678stu");
	const [quote, setQuote] = useState<Quote | null>(null);
	const [swapOrder, setSwapOrder] = useState<SwapOrder | null>(null);
	const [timeRemaining, setTimeRemaining] = useState<number>(0);
	const [inputMode, setInputMode] = useState<"pay" | "receive">("pay");
	const [isLoadingQuote, setIsLoadingQuote] = useState(false);

	const swapSteps = [
		{
			id: "select",
			label: "Select & Quote",
			completed: currentStep !== "select",
		},
		{ id: "deposit", label: "Deposit", completed: currentStep === "status" },
		{ id: "status", label: "Status", completed: false },
	];

	const getStepProgress = () => {
		const currentStepsArray = swapSteps;
		const stepIndex = currentStepsArray.findIndex(
			(step) => step.id === currentStep,
		);
		return ((stepIndex + 1) / currentStepsArray.length) * 100;
	};

	// Timer for quote expiry
	useEffect(() => {
		if (quote && timeRemaining > 0) {
			const timer = setInterval(() => {
				setTimeRemaining((prev) => Math.max(0, prev - 1));
			}, 1000);
			return () => clearInterval(timer);
		}
	}, [quote, timeRemaining]);

	const formatTime = (seconds: number) => {
		const mins = Math.floor(seconds / 60);
		const secs = seconds % 60;
		return `${mins}:${secs.toString().padStart(2, "0")}`;
	};

	const fetchQuote = async (
		inputAmount: string,
		asset: TokenRow,
		mode: "pay" | "receive",
	) => {
		if (!inputAmount || !asset || Number.parseFloat(inputAmount) <= 0) {
			setQuote(null);
			return;
		}

		setIsLoadingQuote(true);
		try {
			// Mock API call - replace with real API
			await new Promise((resolve) => setTimeout(resolve, 500)); // Simulate network delay

			const mockExchangeRate = 0.95;
			const fees = Number.parseFloat(inputAmount) * 0.005;

			let expectedOut: string;
			if (mode === "pay") {
				expectedOut = (
					Number.parseFloat(inputAmount) * mockExchangeRate
				).toFixed(6);
			} else {
				expectedOut = inputAmount; // User wants to receive this amount
			}

			setQuote({
				expectedOut,
				fees: fees.toFixed(6),
				expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
			});
			setTimeRemaining(15 * 60); // 15 minutes
		} catch (error) {
			console.error("Failed to fetch quote:", error);
			setQuote(null);
		} finally {
			setIsLoadingQuote(false);
		}
	};

	// const handleAmountChange = (value: string) => {
	//   setAmount(value)
	//   if (selectedAsset) {
	//     fetchQuote(value, selectedAsset, inputMode)
	//   }
	// }

	// const handleModeToggle = (mode: "pay" | "receive") => {
	//   setInputMode(mode)
	//   if (amount && selectedAsset) {
	//     fetchQuote(amount, selectedAsset, mode)
	//   }
	// }

	// const handleAssetChange = (assetId: string) => {
	//   const asset = assets.find((a) => a.assetId === assetId) || null
	//   setSelectedAsset(asset)
	//   if (amount && asset) {
	//     fetchQuote(amount, asset, inputMode)
	//   }
	// }

	const handleAmountChange = (value: string) => {
		setAmount(value);
		// Clear existing quote when amount changes
		setQuote(null);
		setTimeRemaining(0);
	};

	const handleModeToggle = (mode: "pay" | "receive") => {
		setInputMode(mode);
		// Clear existing quote when mode changes
		setQuote(null);
		setTimeRemaining(0);
	};

	const handleAssetChange = (assetId: string) => {
		const asset = assetList.find((a) => a.assetId === assetId) || null;
		setSelectedAsset(asset);
		// Clear existing quote when asset changes
		setQuote(null);
		setTimeRemaining(0);
	};

	const handleGetQuote = () => {
		if (selectedAsset && amount && Number.parseFloat(amount) > 0) {
			fetchQuote(amount, selectedAsset, inputMode);
		}
	};

	const handleConfirmSwap = async () => {
		if (!quote) return;

		// Mock API call
		setSwapOrder({
			quoteId: `swap_${Math.random().toString(36).substr(2, 9)}`,
			depositAddress: "1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa",
			expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
			status: "pending",
			zecRecipient: zcashAddress,
		});
		setCurrentStep("deposit");
	};

	const copyToClipboard = (text: string) => {
		navigator.clipboard.writeText(text);
	};

	if (isPending) return "Loading...";

	if (error) return `Error: ${error.message}`;

	return (
		<div className="min-h-screen bg-background">
			{currentView === "dashboard" ? (
				<div className="max-w-6xl mx-auto p-8">
					<div className="flex items-center justify-between mb-8">
						<div className="flex items-center gap-3">
							<div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
								<AntennaIcon className="w-7 h-7 text-background" />
							</div>
							<div>
								<h1 className="text-3xl font-bold text-foreground">
									ZHH Aklda
								</h1>
							</div>
						</div>

						<div className="flex items-center gap-4">
							<Button variant="ghost" size="sm">
								<Settings className="w-4 h-4" />
							</Button>
							<Button variant="ghost" size="sm">
								<HelpCircle className="w-4 h-4" />
							</Button>
						</div>
					</div>

					<Card className="p-8 mb-8 bg-gradient-to-r from-card to-card/50">
						<div className="flex items-center justify-between mb-4">
							<span className="text-lg text-muted-foreground">
								Total Balance
							</span>
							<Button
								variant="ghost"
								size="sm"
								onClick={() => setShowBalance(!showBalance)}
								className="h-8 w-8 p-0"
							>
								{showBalance ? (
									<Eye className="w-4 h-4" />
								) : (
									<EyeOff className="w-4 h-4" />
								)}
							</Button>
						</div>
						<div className="space-y-2">
							<div className="text-5xl font-bold text-foreground">
								{showBalance ? "12.4567 ZEC" : "••••••••"}
							</div>
							<div className="text-xl text-muted-foreground">
								{showBalance ? "≈ $1,247.83 USD" : "••••••••"}
							</div>
						</div>
					</Card>

					<div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
						<Card
							className="p-6 hover:shadow-lg transition-shadow cursor-pointer"
							onClick={() => {
								setCurrentView("swap");
								setCurrentStep("select");
							}}
						>
							<div className="flex items-center gap-4 mb-4">
								<div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center">
									<RefreshCw className="w-6 h-6 text-primary" />
								</div>
								<div>
									<h3 className="text-xl font-semibold text-foreground">
										Swap to ZEC
									</h3>
									<p className="text-muted-foreground">
										Convert any crypto to ZEC
									</p>
								</div>
							</div>
							<Button className="w-full">Start Swap</Button>
						</Card>

						<Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
							<div className="flex items-center gap-4 mb-4">
								<div className="w-12 h-12 bg-accent/20 rounded-lg flex items-center justify-center">
									<SendIcon className="w-6 h-6 text-accent" />
								</div>
								<div>
									<h3 className="text-xl font-semibold text-foreground">
										Send ZEC
									</h3>
									<p className="text-muted-foreground">Private transactions</p>
								</div>
							</div>
							<Button variant="outline" className="w-full bg-transparent">
								Send Now
							</Button>
						</Card>

						<Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
							<div className="flex items-center gap-4 mb-4">
								<div className="w-12 h-12 bg-muted/50 rounded-lg flex items-center justify-center">
									<ArrowDownLeft className="w-6 h-6 text-muted-foreground" />
								</div>
								<div>
									<h3 className="text-xl font-semibold text-foreground">
										Receive ZEC
									</h3>
									<p className="text-muted-foreground">Generate address</p>
								</div>
							</div>
							<Button variant="outline" className="w-full bg-transparent">
								Receive
							</Button>
						</Card>
					</div>

					<Card className="p-6">
						<h3 className="text-xl font-semibold text-foreground mb-6">
							Recent Transactions
						</h3>
						<div className="space-y-4">
							{[
								{
									id: 1,
									type: "received",
									amount: "+2.1 ZEC",
									usd: "+$210.00",
									time: "2 hours ago",
									status: "confirmed",
								},
								{
									id: 2,
									type: "sent",
									amount: "-0.5 ZEC",
									usd: "-$50.00",
									time: "1 day ago",
									status: "confirmed",
								},
								{
									id: 3,
									type: "received",
									amount: "+5.0 ZEC",
									usd: "+$500.00",
									time: "3 days ago",
									status: "confirmed",
								},
								{
									id: 4,
									type: "sent",
									amount: "-1.2 ZEC",
									usd: "-$120.00",
									time: "1 week ago",
									status: "confirmed",
								},
							].map((tx) => (
								<div
									key={tx.id}
									className="flex items-center gap-4 p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
								>
									<div
										className={`w-12 h-12 rounded-full flex items-center justify-center ${
											tx.type === "received" ? "bg-primary/20" : "bg-accent/20"
										}`}
									>
										{tx.type === "received" ? (
											<ArrowDownLeft className="w-6 h-6 text-primary" />
										) : (
											<SendIcon className="w-6 h-6 text-accent" />
										)}
									</div>
									<div className="flex-1">
										<div className="font-medium text-foreground capitalize text-lg">
											{tx.type}
										</div>
										<div className="text-sm text-muted-foreground">
											{tx.time}
										</div>
									</div>
									<div className="text-right">
										<div
											className={`font-semibold text-lg ${tx.type === "received" ? "text-primary" : "text-foreground"}`}
										>
											{tx.amount}
										</div>
										<div className="text-sm text-muted-foreground">
											{tx.usd}
										</div>
									</div>
									<Badge variant="secondary" className="ml-4">
										{tx.status}
									</Badge>
								</div>
							))}
						</div>
					</Card>
				</div>
			) : currentView === "swap" ? (
				<div className="max-w-4xl mx-auto p-8">
					<div className="flex items-center gap-4 mb-8">
						<Button
							variant="ghost"
							size="sm"
							onClick={() => setCurrentView("dashboard")}
							className="shrink-0"
						>
							← Back to Wallet
						</Button>
						<div>
							<h2 className="text-3xl font-bold text-foreground mb-2">
								Swap to Zcash
							</h2>
							<p className="text-muted-foreground">
								Convert any supported cryptocurrency to ZEC with privacy-focused
								shielded transactions.
							</p>
						</div>
					</div>

					{/* Progress */}
					<div className="mb-8">
						<div className="flex items-center justify-between mb-4">
							{swapSteps.map((step, index) => (
								<div key={step.id} className="flex items-center">
									<div
										className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium ${
											step.id === currentStep
												? "bg-primary text-primary-foreground"
												: step.completed
													? "bg-primary/20 text-primary"
													: "bg-muted text-muted-foreground"
										}`}
									>
										{step.completed ? (
											<CheckCircle className="w-5 h-5" />
										) : (
											index + 1
										)}
									</div>
									<span
										className={`ml-3 text-sm ${
											step.id === currentStep
												? "text-foreground font-medium"
												: "text-muted-foreground"
										}`}
									>
										{step.label}
									</span>
									{index < swapSteps.length - 1 && (
										<div
											className={`w-40 h-px mx-6 ${step.completed ? "bg-primary" : "bg-border"}`}
										/>
									)}
								</div>
							))}
						</div>
						<Progress value={getStepProgress()} className="h-2" />
					</div>

					{/* Swap Content */}
					<div className="flex-1 p-8">
						<div className="max-w-2xl">
							{currentStep === "select" && (
								<Card className="p-8">
									<div className="space-y-6">
										<div>
											<Label className="text-base font-medium">
												Select cryptocurrency to swap
											</Label>
											<Select onValueChange={handleAssetChange}>
												<SelectTrigger className="mt-3 h-12">
													<SelectValue placeholder="Choose cryptocurrency" />
												</SelectTrigger>
												<SelectContent>
													{assetList.map((asset) => (
														<SelectItem
															key={asset.assetId}
															value={asset.assetId}
														>
															<div className="flex items-center gap-3">
																<div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
																	<Coins className="w-4 h-4" />
																</div>
																<div>
																	<div className="font-medium">
																		{asset.symbol}
																	</div>
																	<div className="text-sm text-muted-foreground">
																		{asset.blockchain}
																	</div>
																</div>
															</div>
														</SelectItem>
													))}
												</SelectContent>
											</Select>
										</div>

										<div>
											<Label className="text-base font-medium">Amount</Label>
											<div className="mt-3 space-y-4">
												<div className="flex gap-2 p-1 bg-muted rounded-lg">
													<Button
														variant={inputMode === "pay" ? "default" : "ghost"}
														size="sm"
														onClick={() => handleModeToggle("pay")}
														className="flex-1 h-8"
													>
														You Pay
													</Button>
													<Button
														variant={
															inputMode === "receive" ? "default" : "ghost"
														}
														size="sm"
														onClick={() => handleModeToggle("receive")}
														className="flex-1 h-8"
													>
														You Receive
													</Button>
												</div>

												<div className="relative">
													<Input
														id="amount"
														type="number"
														placeholder="0.00"
														value={amount}
														onChange={(e) => handleAmountChange(e.target.value)}
														className="text-2xl h-16 pr-20 text-center"
													/>
													<div className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground">
														{inputMode === "pay"
															? selectedAsset?.symbol || ""
															: "ZEC"}
													</div>
												</div>

												{selectedAsset &&
													amount &&
													Number.parseFloat(amount) > 0 && (
														<div className="space-y-3">
															{!quote ? (
																<Button
																	onClick={handleGetQuote}
																	disabled={isLoadingQuote}
																	className="w-full bg-transparent"
																	variant="outline"
																>
																	{isLoadingQuote ? (
																		<>
																			<RefreshCw className="w-4 h-4 mr-2 animate-spin" />
																			Getting Quote...
																		</>
																	) : (
																		"Get Quote"
																	)}
																</Button>
															) : (
																<div className="bg-muted/50 rounded-lg p-4">
																	<div className="flex items-center justify-between mb-3">
																		<div className="text-center">
																			<div className="text-lg font-semibold text-foreground">
																				{inputMode === "pay"
																					? amount
																					: (
																							Number.parseFloat(amount) / 0.95
																						).toFixed(6)}{" "}
																				{selectedAsset.symbol}
																			</div>
																			<div className="text-sm text-muted-foreground">
																				You pay
																			</div>
																		</div>
																		<div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
																			<RefreshCw className="w-4 h-4 text-primary" />
																		</div>
																		<div className="text-center">
																			<div className="text-lg font-semibold text-foreground">
																				{inputMode === "receive"
																					? amount
																					: quote.expectedOut}{" "}
																				ZEC
																			</div>
																			<div className="text-sm text-muted-foreground">
																				You receive
																			</div>
																		</div>
																	</div>

																	<div className="space-y-2 text-sm border-t border-border pt-3">
																		<div className="flex justify-between">
																			<span className="text-muted-foreground">
																				Network Fee
																			</span>
																			<span className="text-foreground">
																				{quote.fees} {selectedAsset.symbol}
																			</span>
																		</div>
																		<div className="flex justify-between">
																			<span className="text-muted-foreground">
																				Exchange Rate
																			</span>
																			<span className="text-foreground">
																				1 {selectedAsset.symbol} = 0.95 ZEC
																			</span>
																		</div>
																		{timeRemaining > 0 && (
																			<div className="flex justify-between">
																				<span className="text-muted-foreground">
																					Quote expires
																				</span>
																				<span className="text-accent font-medium">
																					{formatTime(timeRemaining)}
																				</span>
																			</div>
																		)}
																	</div>

																	<Button
																		onClick={handleGetQuote}
																		disabled={isLoadingQuote}
																		variant="ghost"
																		size="sm"
																		className="w-full mt-3"
																	>
																		<RefreshCw className="w-4 h-4 mr-2" />
																		Refresh Quote
																	</Button>
																</div>
															)}
														</div>
													)}
											</div>
										</div>

										<div>
											<Label
												htmlFor="zcashAddress"
												className="text-base font-medium"
											>
												Your ZEC address (transparent only)
											</Label>
											<div className="mt-3 p-3 bg-muted/50 rounded-lg border">
												<code className="text-sm font-mono text-foreground break-all">
													{zcashAddress}
												</code>
											</div>
											<p className="text-sm text-muted-foreground mt-2">
												This is your default transparent address for receiving
												swapped ZEC
											</p>
										</div>

										<Button
											onClick={handleConfirmSwap}
											className="w-full h-12 text-base"
											disabled={
												!selectedAsset ||
												!amount ||
												!zcashAddress ||
												Number.parseFloat(amount) <= 0 ||
												!quote ||
												timeRemaining === 0
											}
										>
											{!selectedAsset ||
											!amount ||
											Number.parseFloat(amount) <= 0
												? "Select asset and enter amount"
												: !quote
													? "Get quote first"
													: timeRemaining === 0
														? "Quote expired - refresh quote"
														: "Confirm Swap"}
										</Button>
									</div>
								</Card>
							)}

							{currentStep === "deposit" && swapOrder && (
								<Card className="p-8">
									<div className="space-y-6">
										<div className="flex items-center justify-between">
											<h3 className="text-lg font-semibold text-foreground">
												Send Your {selectedAsset?.symbol}
											</h3>
											{timeRemaining > 0 && (
												<div className="flex items-center gap-2 text-sm">
													<Clock className="w-4 h-4 text-accent" />
													<span className="text-accent font-medium">
														{formatTime(timeRemaining)} remaining
													</span>
												</div>
											)}
										</div>

										<div className="bg-muted/50 rounded-lg p-6">
											<div className="space-y-4">
												<div>
													<Label className="text-sm font-medium text-muted-foreground">
														Deposit Address
													</Label>
													<div className="flex items-center gap-2 mt-2">
														<code className="flex-1 p-3 bg-background rounded border text-sm font-mono">
															{swapOrder.depositAddress}
														</code>
														<Button
															variant="outline"
															size="sm"
															onClick={() =>
																copyToClipboard(swapOrder.depositAddress)
															}
														>
															<Copy className="w-4 h-4" />
														</Button>
													</div>
												</div>

												<div className="text-center py-4">
													<div className="w-32 h-32 bg-background border-2 border-dashed border-border rounded-lg flex items-center justify-center mx-auto mb-3">
														<QrCode className="w-12 h-12 text-muted-foreground" />
													</div>
													<p className="text-sm text-muted-foreground">
														QR Code for {swapOrder.depositAddress}
													</p>
												</div>
											</div>
										</div>

										<div className="bg-accent/10 border border-accent/20 rounded-lg p-4">
											<div className="flex items-start gap-3">
												<AlertCircle className="w-5 h-5 text-accent mt-0.5" />
												<div className="space-y-2">
													<div className="text-sm font-medium text-foreground">
														Send exactly {amount} {selectedAsset?.symbol}
													</div>
													<div className="text-xs text-muted-foreground space-y-1">
														<div>• Send from any wallet or exchange</div>
														<div>• Double-check the address before sending</div>
														<div>
															• Your ZEC will be sent to: {zcashAddress}
														</div>
													</div>
												</div>
											</div>
										</div>

										<Button
											onClick={() => {
												setSwapOrder({ ...swapOrder, status: "deposited" });
												setCurrentStep("status");
											}}
											className="w-full"
											variant="outline"
										>
											I've sent the {selectedAsset?.symbol}
										</Button>
									</div>
								</Card>
							)}

							{currentStep === "status" && swapOrder && (
								<Card className="p-8">
									<div className="space-y-6">
										<div className="text-center">
											<h3 className="text-lg font-semibold text-foreground mb-2">
												Swap Status
											</h3>
											<p className="text-muted-foreground">
												Tracking your {selectedAsset?.symbol} to ZEC swap
											</p>
										</div>

										<div className="space-y-4">
											<div className="flex items-center gap-4 p-4 rounded-lg bg-muted/30">
												<div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
													<CheckCircle className="w-5 h-5 text-primary" />
												</div>
												<div className="flex-1">
													<div className="font-medium text-foreground">
														Swap Initiated
													</div>
													<div className="text-sm text-muted-foreground">
														Quote confirmed and deposit address generated
													</div>
												</div>
											</div>

											<div
												className={`flex items-center gap-4 p-4 rounded-lg ${
													swapOrder.status === "deposited"
														? "bg-primary/10"
														: "bg-muted/30"
												}`}
											>
												<div
													className={`w-10 h-10 rounded-full flex items-center justify-center ${
														swapOrder.status === "deposited"
															? "bg-primary/20"
															: "bg-muted"
													}`}
												>
													{swapOrder.status === "deposited" ? (
														<CheckCircle className="w-5 h-5 text-primary" />
													) : (
														<Clock className="w-5 h-5 text-muted-foreground animate-pulse" />
													)}
												</div>
												<div className="flex-1">
													<div className="font-medium text-foreground">
														Waiting for Deposit
													</div>
													<div className="text-sm text-muted-foreground">
														{swapOrder.status === "deposited"
															? "Deposit received!"
															: "Send your crypto to the deposit address"}
													</div>
												</div>
											</div>

											<div className="flex items-center gap-4 p-4 rounded-lg bg-muted/30">
												<div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center">
													<Clock className="w-5 h-5 text-muted-foreground" />
												</div>
												<div className="flex-1">
													<div className="font-medium text-muted-foreground">
														Processing Swap
													</div>
													<div className="text-sm text-muted-foreground">
														Converting to ZEC
													</div>
												</div>
											</div>

											<div className="flex items-center gap-4 p-4 rounded-lg bg-muted/30">
												<div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center">
													<Clock className="w-5 h-5 text-muted-foreground" />
												</div>
												<div className="flex-1">
													<div className="font-medium text-muted-foreground">
														ZEC Sent
													</div>
													<div className="text-sm text-muted-foreground">
														Delivering to your address
													</div>
												</div>
											</div>
										</div>

										<div className="bg-muted/50 rounded-lg p-4">
											<div className="space-y-2 text-sm">
												<div className="flex justify-between">
													<span className="text-muted-foreground">Swap ID</span>
													<span className="text-foreground font-mono">
														{swapOrder.quoteId}
													</span>
												</div>
												<div className="flex justify-between">
													<span className="text-muted-foreground">
														Expected ZEC
													</span>
													<span className="text-foreground">
														{quote?.expectedOut} ZEC
													</span>
												</div>
												<div className="flex justify-between">
													<span className="text-muted-foreground">
														Destination
													</span>
													<span className="text-foreground font-mono text-xs">
														{zcashAddress}
													</span>
												</div>
											</div>
										</div>

										<div className="flex gap-3">
											<Button
												variant="outline"
												className="flex-1 bg-transparent"
											>
												<RefreshCw className="w-4 h-4 mr-2" />
												Refresh Status
											</Button>
											<Button
												variant="outline"
												className="flex-1 bg-transparent"
											>
												<ExternalLink className="w-4 h-4 mr-2" />
												View on Explorer
											</Button>
										</div>
									</div>
								</Card>
							)}
						</div>
					</div>
				</div>
			) : null}
		</div>
	);
}
