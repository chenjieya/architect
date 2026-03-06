<template>
  <div>
    <button @click="test">手动上报</button>
    <button data-tracker="true">data-set自动上报</button>
    <button>auto自动上报</button>
  </div>
</template>

<script>
export default {
  methods: {
    test: function ($event) {
      this.$monitor.tracker($event);
    }
  }
};
</script>
