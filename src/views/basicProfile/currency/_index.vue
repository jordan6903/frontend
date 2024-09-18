<template>
  <div class="test-container">
    <el-divider content-position="left">你可以在这里写demo</el-divider>
  </div>
</template>
<script>
  export default {
    name: 'Test',
    data() {
      return {
        url: 'http://localhost:5252/api/devices',
        show: true,
        device: [],
      }
    },
    created() {},
    mounted() {
      console.log('mounted')
      axios
        .get(this.url)
        .then((response) => (this.device = response))
        .catch(function (error) {
          // 请求失败处理
          console.log(error)
        })
    },
    methods: {},
  }
</script>
