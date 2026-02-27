<template>
  <div id="app">
    <router-view />
    <error-dialog />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import ErrorDialog from '@/components/ErrorDialog.vue';

export default defineComponent({
  name: 'App',
  components: {
    ErrorDialog
  }
});
</script>

<style lang="scss" scoped>
#app {
  min-height: 100vh;
}
</style>
