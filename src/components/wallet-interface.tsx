"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import {
	ArrowDownLeft,
	Shield,
	Eye,
	EyeOff,
	Coins,
	CheckCircle,
	Clock,
	AlertCircle,
	Copy,
	Settings,
	HelpCircle,
	QrCode,
	RefreshCw,
	ExternalLink,
	CreditCard,
	AntennaIcon,
	SendIcon,
} from "lucide-react";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";

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

interface Asset {
	assetId: string;
	symbol: string;
	chain: string;
	decimals: number;
	memoRequired?: boolean;
}

interface Quote {
	expectedOut: string;
	fees: string;
	expiresAt: string;
}

interface SwapOrder {
	quoteId: string;
	depositAddress: string;
	depositMemo?: string;
	expiresAt: string;
	status: SwapStatus;
	txHashes?: string[];
	zecRecipient: string;
}

export function WalletInterface() {
	const [currentView, setCurrentView] = useState<View>("dashboard");
	const [currentStep, setCurrentStep] = useState<OnrampStep | SwapStep>(
		"amount",
	);
	const [amount, setAmount] = useState("");
	const [paymentMethod, setPaymentMethod] = useState<"card" | "crypto" | null>(
		null,
	);
	const [showBalance, setShowBalance] = useState(true);

	// Swap state
	const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
	const [zcashAddress] = useState("t1abc123def456ghi789jkl012mno345pqr678stu");
	const [quote, setQuote] = useState<Quote | null>(null);
	const [swapOrder, setSwapOrder] = useState<SwapOrder | null>(null);
	const [timeRemaining, setTimeRemaining] = useState<number>(0);

	// Mock assets data
	const assets: Asset[] = [
		{ assetId: "btc", symbol: "BTC", chain: "Bitcoin", decimals: 8 },
		{ assetId: "xmr", symbol: "XMR", chain: "Monero", decimals: 8 },
		{
			assetId: "eth",
			symbol: "ETH",
			chain: "Ethereum",
			decimals: 18,
			memoRequired: true,
		},
		{ assetId: "usdc", symbol: "USDC", chain: "Ethereum", decimals: 6 },
		{ assetId: "usdt", symbol: "USDT", chain: "Ethereum", decimals: 6 },
	];

	const steps = [
		{ id: "amount", label: "Amount", completed: currentStep !== "amount" },
		{
			id: "payment",
			label: "Payment",
			completed: ["verification", "processing", "complete"].includes(
				currentStep,
			),
		},
		{
			id: "verification",
			label: "Verify",
			completed: ["processing", "complete"].includes(currentStep),
		},
		{
			id: "processing",
			label: "Processing",
			completed: currentStep === "complete",
		},
		{ id: "complete", label: "Complete", completed: false },
	];

	const swapSteps = [
		{ id: "select", label: "Select", completed: currentStep !== "select" },
		{
			id: "quote",
			label: "Quote",
			completed: ["deposit", "status"].includes(currentStep),
		},
		{ id: "deposit", label: "Deposit", completed: currentStep === "status" },
		{ id: "status", label: "Status", completed: false },
	];

	const getStepProgress = () => {
		let currentStepsArray = steps;
		if (currentView === "swap") {
			currentStepsArray = swapSteps;
		}
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

	const handleGetQuote = async () => {
		// Mock API call
		setQuote({
			expectedOut: (Number.parseFloat(amount) * 0.95).toFixed(4),
			fees: (Number.parseFloat(amount) * 0.005).toFixed(4),
			expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
		});
		setTimeRemaining(15 * 60); // 15 minutes
		setCurrentStep("quote");
	};

	const handleConfirmSwap = async () => {
		// Mock API call
		setSwapOrder({
			quoteId: `swap_${Math.random().toString(36).substr(2, 9)}`,
			depositAddress: "1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa",
			depositMemo: selectedAsset?.memoRequired ? "123456789" : undefined,
			expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
			status: "pending",
			zecRecipient: zcashAddress,
		});
		setCurrentStep("deposit");
	};

	const copyToClipboard = (text: string) => {
		navigator.clipboard.writeText(text);
	};

	return (
		<div className="min-h-screen bg-background">
			{currentView === "dashboard" ? (
				<div className="max-w-6xl mx-auto p-8">
					<div className="flex items-center justify-between mb-8">
						<div className="flex items-center gap-3">
							<div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
								<AntennaIcon className="w-7 h-7 text-primary-foreground" />
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
			) : currentView === "onramp" ? (
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
								Buy Zcash
							</h2>
							<p className="text-muted-foreground">
								Purchase ZEC directly with your credit card or cryptocurrency.
								Your privacy is protected with shielded transactions.
							</p>
						</div>
					</div>

					{/* Progress */}
					<div className="mb-8">
						<div className="flex items-center justify-between mb-4">
							{steps.map((step, index) => (
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
									{index < steps.length - 1 && (
										<div
											className={`w-16 h-px mx-6 ${step.completed ? "bg-primary" : "bg-border"}`}
										/>
									)}
								</div>
							))}
						</div>
						<Progress value={getStepProgress()} className="h-2" />
					</div>

					{/* Onramp Content */}
					<div className="flex-1 p-8">
						<div className="max-w-2xl">
							{currentStep === "amount" && (
								<Card className="p-8">
									<div className="space-y-6">
										<div>
											<Label htmlFor="amount" className="text-base font-medium">
												How much ZEC would you like to buy?
											</Label>
											<div className="mt-3 space-y-4">
												<div className="relative">
													<Input
														id="amount"
														type="number"
														placeholder="0.00"
														value={amount}
														onChange={(e) => setAmount(e.target.value)}
														className="text-2xl h-16 pr-16 text-center"
													/>
													<div className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground">
														USD
													</div>
												</div>

												<div className="text-center text-sm text-muted-foreground">
													≈{" "}
													{amount
														? (Number.parseFloat(amount) / 100).toFixed(4)
														: "0.0000"}{" "}
													ZEC
												</div>

												<div className="flex gap-2 justify-center">
													{["50", "100", "250", "500"].map((preset) => (
														<Button
															key={preset}
															variant="outline"
															size="sm"
															onClick={() => setAmount(preset)}
															className="px-4"
														>
															${preset}
														</Button>
													))}
												</div>
											</div>
										</div>

										<div className="bg-muted/50 rounded-lg p-4">
											<div className="flex items-start gap-3">
												<AlertCircle className="w-5 h-5 text-accent mt-0.5" />
												<div className="space-y-1">
													<div className="text-sm font-medium text-foreground">
														Privacy Notice
													</div>
													<div className="text-xs text-muted-foreground">
														Your purchased ZEC will be automatically sent to a
														shielded address for maximum privacy protection.
													</div>
												</div>
											</div>
										</div>

										<Button
											onClick={() => setCurrentStep("payment")}
											className="w-full h-12 text-base"
											disabled={!amount || Number.parseFloat(amount) <= 0}
										>
											Continue to Payment
										</Button>
									</div>
								</Card>
							)}

							{currentStep === "payment" && (
								<Card className="p-8">
									<div className="space-y-6">
										<div>
											<h3 className="text-lg font-semibold text-foreground mb-4">
												Choose Payment Method
											</h3>
											<div className="grid gap-4">
												<Button
													variant={
														paymentMethod === "card" ? "default" : "outline"
													}
													onClick={() => setPaymentMethod("card")}
													className="h-16 justify-start gap-4"
												>
													<CreditCard className="w-6 h-6" />
													<div className="text-left">
														<div className="font-medium">Credit/Debit Card</div>
														<div className="text-sm opacity-70">
															Instant • 2.9% fee
														</div>
													</div>
												</Button>

												<Button
													variant={
														paymentMethod === "crypto" ? "default" : "outline"
													}
													onClick={() => setPaymentMethod("crypto")}
													className="h-16 justify-start gap-4"
												>
													<Coins className="w-6 h-6" />
													<div className="text-left">
														<div className="font-medium">Cryptocurrency</div>
														<div className="text-sm opacity-70">
															Fast • 0.5% fee
														</div>
													</div>
												</Button>
											</div>
										</div>

										<div className="bg-muted/50 rounded-lg p-4">
											<div className="flex justify-between items-center text-sm">
												<span className="text-muted-foreground">Amount</span>
												<span className="text-foreground">${amount}</span>
											</div>
											<div className="flex justify-between items-center text-sm mt-2">
												<span className="text-muted-foreground">Fee</span>
												<span className="text-foreground">
													$
													{paymentMethod === "card"
														? (
																Number.parseFloat(amount || "0") * 0.029
															).toFixed(2)
														: (
																Number.parseFloat(amount || "0") * 0.005
															).toFixed(2)}
												</span>
											</div>
											<Separator className="my-3" />
											<div className="flex justify-between items-center font-medium">
												<span className="text-foreground">Total</span>
												<span className="text-foreground">
													$
													{(
														Number.parseFloat(amount || "0") +
														(paymentMethod === "card"
															? Number.parseFloat(amount || "0") * 0.029
															: Number.parseFloat(amount || "0") * 0.005)
													).toFixed(2)}
												</span>
											</div>
										</div>

										<div className="flex gap-3">
											<Button
												variant="outline"
												onClick={() => setCurrentStep("amount")}
												className="flex-1"
											>
												Back
											</Button>
											<Button
												onClick={() => setCurrentStep("verification")}
												className="flex-1"
												disabled={!paymentMethod}
											>
												Continue
											</Button>
										</div>
									</div>
								</Card>
							)}

							{currentStep === "verification" && (
								<Card className="p-8">
									<div className="space-y-6">
										<div>
											<h3 className="text-lg font-semibold text-foreground mb-4">
												Verify Your Identity
											</h3>
											<p className="text-muted-foreground mb-6">
												For your security and regulatory compliance, we need to
												verify your identity for purchases over $50.
											</p>

											<div className="space-y-4">
												<div>
													<Label htmlFor="phone">Phone Number</Label>
													<Input
														id="phone"
														type="tel"
														placeholder="+1 (555) 123-4567"
														className="mt-2"
													/>
												</div>

												<div className="grid grid-cols-2 gap-4">
													<div>
														<Label htmlFor="firstName">First Name</Label>
														<Input
															id="firstName"
															placeholder="John"
															className="mt-2"
														/>
													</div>
													<div>
														<Label htmlFor="lastName">Last Name</Label>
														<Input
															id="lastName"
															placeholder="Doe"
															className="mt-2"
														/>
													</div>
												</div>
											</div>
										</div>

										<div className="bg-muted/50 rounded-lg p-4">
											<div className="flex items-start gap-3">
												<Shield className="w-5 h-5 text-primary mt-0.5" />
												<div className="space-y-1">
													<div className="text-sm font-medium text-foreground">
														Your Data is Protected
													</div>
													<div className="text-xs text-muted-foreground">
														We use bank-level encryption and never store your
														sensitive information. Your privacy remains intact.
													</div>
												</div>
											</div>
										</div>

										<div className="flex gap-3">
											<Button
												variant="outline"
												onClick={() => setCurrentStep("payment")}
												className="flex-1"
											>
												Back
											</Button>
											<Button
												onClick={() => setCurrentStep("processing")}
												className="flex-1"
											>
												Verify & Purchase
											</Button>
										</div>
									</div>
								</Card>
							)}

							{currentStep === "processing" && (
								<Card className="p-8 text-center">
									<div className="space-y-6">
										<div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto">
											<Clock className="w-8 h-8 text-primary animate-spin" />
										</div>

										<div>
											<h3 className="text-lg font-semibold text-foreground mb-2">
												Processing Your Purchase
											</h3>
											<p className="text-muted-foreground">
												We're securely processing your payment and preparing
												your ZEC. This usually takes 1-2 minutes.
											</p>
										</div>

										<div className="bg-muted/50 rounded-lg p-4 text-left">
											<div className="space-y-2 text-sm">
												<div className="flex items-center gap-2">
													<CheckCircle className="w-4 h-4 text-primary" />
													<span className="text-foreground">
														Payment verified
													</span>
												</div>
												<div className="flex items-center gap-2">
													<CheckCircle className="w-4 h-4 text-primary" />
													<span className="text-foreground">
														Identity confirmed
													</span>
												</div>
												<div className="flex items-center gap-2">
													<Clock className="w-4 h-4 text-accent animate-pulse" />
													<span className="text-foreground">
														Generating shielded address...
													</span>
												</div>
											</div>
										</div>

										<Button
											onClick={() => setCurrentStep("complete")}
											variant="outline"
											className="w-full"
										>
											Simulate Complete
										</Button>
									</div>
								</Card>
							)}

							{currentStep === "complete" && (
								<Card className="p-8 text-center">
									<div className="space-y-6">
										<div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto">
											<CheckCircle className="w-8 h-8 text-primary" />
										</div>

										<div>
											<h3 className="text-lg font-semibold text-foreground mb-2">
												Purchase Complete!
											</h3>
											<p className="text-muted-foreground">
												Your ZEC has been successfully purchased and sent to
												your shielded address.
											</p>
										</div>

										<div className="bg-muted/50 rounded-lg p-6 text-left">
											<div className="space-y-4">
												<div className="flex justify-between items-center">
													<span className="text-muted-foreground">
														Amount Purchased
													</span>
													<span className="text-foreground font-medium">
														{(Number.parseFloat(amount || "0") / 100).toFixed(
															4,
														)}{" "}
														ZEC
													</span>
												</div>
												<div className="flex justify-between items-center">
													<span className="text-muted-foreground">
														Transaction ID
													</span>
													<div className="flex items-center gap-2">
														<span className="text-foreground font-mono text-sm">
															zc1a2b3c...def456
														</span>
														<Button
															variant="ghost"
															size="sm"
															className="h-6 w-6 p-0"
														>
															<Copy className="w-3 h-3" />
														</Button>
													</div>
												</div>
												<div className="flex justify-between items-center">
													<span className="text-muted-foreground">Status</span>
													<Badge
														variant="secondary"
														className="bg-primary/20 text-primary"
													>
														Confirmed
													</Badge>
												</div>
											</div>
										</div>

										<div className="flex gap-3">
											<Button
												variant="outline"
												onClick={() => setCurrentStep("amount")}
												className="flex-1"
											>
												Buy More ZEC
											</Button>
											<Button className="flex-1">View Transaction</Button>
										</div>
									</div>
								</Card>
							)}
						</div>
					</div>
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
											className={`w-16 h-px mx-6 ${step.completed ? "bg-primary" : "bg-border"}`}
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
											<Select
												onValueChange={(value) =>
													setSelectedAsset(
														assets.find((a) => a.assetId === value) || null,
													)
												}
											>
												<SelectTrigger className="mt-3 h-12">
													<SelectValue placeholder="Choose cryptocurrency" />
												</SelectTrigger>
												<SelectContent>
													{assets.map((asset) => (
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
																		{asset.chain}
																	</div>
																</div>
																{asset.memoRequired && (
																	<Badge variant="outline" className="ml-auto">
																		Memo Required
																	</Badge>
																)}
															</div>
														</SelectItem>
													))}
												</SelectContent>
											</Select>
										</div>

										<div>
											<Label htmlFor="amount" className="text-base font-medium">
												Amount to swap
											</Label>
											<div className="mt-3">
												<div className="relative">
													<Input
														id="amount"
														type="number"
														placeholder="0.00"
														value={amount}
														onChange={(e) => setAmount(e.target.value)}
														className="text-2xl h-16 pr-20 text-center"
													/>
													<div className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground">
														{selectedAsset?.symbol || ""}
													</div>
												</div>
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
											onClick={handleGetQuote}
											className="w-full h-12 text-base"
											disabled={
												!selectedAsset ||
												!amount ||
												!zcashAddress ||
												Number.parseFloat(amount) <= 0
											}
										>
											Get Quote
										</Button>
									</div>
								</Card>
							)}

							{currentStep === "quote" && quote && (
								<Card className="p-8">
									<div className="space-y-6">
										<div className="flex items-center justify-between">
											<h3 className="text-lg font-semibold text-foreground">
												Swap Quote
											</h3>
											{timeRemaining > 0 && (
												<div className="flex items-center gap-2 text-sm">
													<Clock className="w-4 h-4 text-accent" />
													<span className="text-accent font-medium">
														Expires in {formatTime(timeRemaining)}
													</span>
												</div>
											)}
										</div>

										<div className="bg-muted/50 rounded-lg p-6">
											<div className="flex items-center justify-between mb-4">
												<div className="text-center">
													<div className="text-2xl font-bold text-foreground">
														{amount} {selectedAsset?.symbol}
													</div>
													<div className="text-sm text-muted-foreground">
														{selectedAsset?.chain}
													</div>
												</div>
												<div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
													<RefreshCw className="w-4 h-4 text-primary" />
												</div>
												<div className="text-center">
													<div className="text-2xl font-bold text-foreground">
														{quote.expectedOut} ZEC
													</div>
													<div className="text-sm text-muted-foreground">
														Zcash
													</div>
												</div>
											</div>

											<Separator className="my-4" />

											<div className="space-y-2 text-sm">
												<div className="flex justify-between">
													<span className="text-muted-foreground">
														Network Fee
													</span>
													<span className="text-foreground">
														{quote.fees} {selectedAsset?.symbol}
													</span>
												</div>
												<div className="flex justify-between">
													<span className="text-muted-foreground">
														Exchange Rate
													</span>
													<span className="text-foreground">
														1 {selectedAsset?.symbol} ={" "}
														{(
															Number.parseFloat(quote.expectedOut) /
															Number.parseFloat(amount)
														).toFixed(6)}{" "}
														ZEC
													</span>
												</div>
												<div className="flex justify-between">
													<span className="text-muted-foreground">
														Estimated Time
													</span>
													<span className="text-foreground">5-15 minutes</span>
												</div>
											</div>
										</div>

										<div className="bg-muted/50 rounded-lg p-4">
											<div className="flex items-start gap-3">
												<AlertCircle className="w-5 h-5 text-accent mt-0.5" />
												<div className="space-y-1">
													<div className="text-sm font-medium text-foreground">
														Important
													</div>
													<div className="text-xs text-muted-foreground">
														This quote is valid for {formatTime(timeRemaining)}.
														After confirmation, you'll have the same time to
														send your {selectedAsset?.symbol}.
													</div>
												</div>
											</div>
										</div>

										<div className="flex gap-3">
											<Button
												variant="outline"
												onClick={() => setCurrentStep("select")}
												className="flex-1"
											>
												Back
											</Button>
											<Button
												onClick={handleConfirmSwap}
												className="flex-1"
												disabled={timeRemaining === 0}
											>
												Confirm Swap
											</Button>
										</div>
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

												{swapOrder.depositMemo && (
													<div>
														<Label className="text-sm font-medium text-muted-foreground">
															Memo/Tag (Required)
														</Label>
														<div className="flex items-center gap-2 mt-2">
															<code className="flex-1 p-3 bg-background rounded border text-sm font-mono">
																{swapOrder.depositMemo}
															</code>
															<Button
																variant="outline"
																size="sm"
																onClick={() =>
																	copyToClipboard(swapOrder.depositMemo!)
																}
															>
																<Copy className="w-4 h-4" />
															</Button>
														</div>
													</div>
												)}

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
														{swapOrder.depositMemo && (
															<div>• Don't forget to include the memo/tag</div>
														)}
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
