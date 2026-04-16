// import { createConfig, http } from "wagmi";
// import { bscTestnet } from "wagmi/chains";
// import { injected } from "wagmi/connectors";

// export const config = createConfig({
//   chains: [bscTestnet],
//   connectors: [injected()],
//   transports: {
//     [bscTestnet.id]: http("https://data-seed-prebsc-1-s1.binance.org:8545"),
//   },
// });

// declare module "wagmi" {
//   interface Register {
//     config: typeof config;
//   }
// }


import { createConfig, http } from "wagmi";
import { bscTestnet } from "wagmi/chains";

export const config = createConfig({
  chains: [bscTestnet],
  transports: {
    [bscTestnet.id]: http(),
  },
});
