<script>
  import { Router, Link, Route } from "svelte5-router";

  import { Canvas } from "@threlte/core";
  import Scene from "./lib/Scene.svelte";
  import Menu from "./lib/components/common/Menu.svelte";
  import Home from "./routes/Home.svelte";
  import CreateCoin from "./routes/CreateCoin.svelte";
  import { isConnected } from "./lib/stores/stores";
  import web3App from "./lib/web3/App";

  let url = $state("");

  const initApp = async () => {
    const isConn = await web3App.isConnected();
    isConnected.set(isConn);
  };

  $effect(() => {
    initApp();
  });
</script>

<Router {url}>
  <Menu />

  <div class="">
    <Route path="/" component={Home} />
    <Route path="/create-coin" component={CreateCoin} />
  </div>
</Router>
