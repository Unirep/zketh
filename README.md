# zketh

A monorepo containing solidity contracts, javascript relay, javascript webapp

### 2.2.1 Start a node

```shell
yarn contracts hardhat node
```

### 2.2.2 Deploy smart contracts

in new terminal window, from root:

```shell
yarn contracts deploy
```

### 2.2.3 Start a relayer (backend)

```shell
yarn relay keys &&
yarn relay start
```

### 2.2.4 Start a frontend

in new terminal window, from root:

```shell
yarn frontend start
```

It will be running at: http://localhost:3000/
