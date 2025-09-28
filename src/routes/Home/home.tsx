/** biome-ignore-all lint/correctness/useUniqueElementIds: <Values are known> */
"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
	AntennaIcon,
	ArrowDownLeft,
	Eye,
	EyeOff,
	HelpCircle,
	RefreshCw,
	SendIcon,
	Settings,
} from "lucide-react";
import { useState } from "react";
import { NavLink } from "react-router";

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
	depositMemo?: string;
	expiresAt: string;
	status: SwapStatus;
	txHashes?: string[];
	zecRecipient: string;
}

export function Home() {
	const [showBalance, setShowBalance] = useState(true);

	return (
		<div className="min-h-screen bg-background">
			<div className="max-w-6xl mx-auto p-8">
				<div className="flex items-center justify-between mb-8">
					<div className="flex items-center gap-3">
						<div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
							<AntennaIcon className="w-7 h-7 text-background" />
						</div>
						<div>
							<h1 className="text-3xl font-bold text-foreground">ZHH Aklda</h1>
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
						<span className="text-lg text-muted-foreground">Total Balance</span>
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
					<NavLink to="/swap">
						<Card
							className="p-6 hover:shadow-lg transition-shadow cursor-pointer"
							onClick={() => {
								// setCurrentView("swap");
								// setCurrentStep("select");
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
					</NavLink>

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
									<div className="text-sm text-muted-foreground">{tx.time}</div>
								</div>
								<div className="text-right">
									<div
										className={`font-semibold text-lg ${tx.type === "received" ? "text-primary" : "text-foreground"}`}
									>
										{tx.amount}
									</div>
									<div className="text-sm text-muted-foreground">{tx.usd}</div>
								</div>
								<Badge variant="secondary" className="ml-4">
									{tx.status}
								</Badge>
							</div>
						))}
					</div>
				</Card>
			</div>
		</div>
	);
}
