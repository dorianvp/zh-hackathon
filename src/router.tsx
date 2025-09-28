import { HashRouter, Route, Routes } from "react-router";
import { Home } from "./routes/Home/home";
import { WalletInterface } from "./routes/Swap/swap-interface";

export function AppRouter() {
	return (
		<HashRouter>
			<Routes>
				<Route path="/" element={<Home />} />

				<Route path="/swap" element={<WalletInterface />} />
			</Routes>
		</HashRouter>
	);
}
