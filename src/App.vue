<template>
  <div id="app">
    <Navigation>
      <router-view />
    </Navigation>
  </div>
</template>

<script>
import Navigation from "./components/Navigation";

export default {
  name: "App",
  components: { Navigation }
};
</script>

<style>
html,
body,
#app {
  min-height: 100%;
  margin: 0;
}

body {
  min-width: 320px;
}
</style>
