<template>
  <div id="app">
    <div id="nav">
      <!-- <router-link to="/">Home</router-link> |
      <router-link to="/about">About</router-link> |
	  <router-link to="/neo4j">Neo4j</router-link> |
	  <router-link to="/a">AA</router-link> | -->
	  <!-- <router-link to="/common/Home">Home</router-link> -->
	  <router-view></router-view>
	  
    </div>
  </div>
</template>

<style>
	@import "../static/css/main.css";
	@import "../static/css/color-dark.css";     /*深色主题*/
	/* @import "../static/css/theme-green/color-green.css";  /* 浅绿色主题*/ 
/* #app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  border:3px solid red;
} */

#nav {
  padding: 0px;
  /* border:3px solid red; */
}
</style>
