<template>
  <div>
    <vab-query-form>
      <vab-query-form-left-panel>
        <el-button type="primary" @click="add_company">新增公司</el-button>
      </vab-query-form-left-panel>
    </vab-query-form>

    <el-divider content-position="left">輸出</el-divider>

    <!--↓公司↓-->
    <div v-for="_company in company" :key="_company.id" :name="_company.id" :title="_company.name">
      <div class="floor1">{{ _company.name }}</div>

      <!--↓作品分類↓-->
      <div v-for="series in _company.series" :key="series.id">
        <div>
          <div class="floor2">{{ series.name }}</div>
        </div>
        <!--↓作品↓-->
        <div v-for="product in series.product" :key="product.id">
          <div class="floor3">{{ product.name }}</div>
        </div>

        <div v-if="series.product == 0" v-show="emptydiv">(+加入作品)</div>
      </div>
    </div>
    <table-edit ref="edit" />
  </div>
</template>

<script>
  import { doDelete, getList } from '@/api/table'
  import SortEdit from './components/SortEdit'

  export default {
    name: 'Export3',
    filters: {},
    data() {
      return {
        url: 'http://localhost:5252/api/company',
        url2: 'http://localhost:5252/api/product',
        list_data: {
          company: [],
          product: [],
        },
        emptydiv: false,
        activeNames: ['公司1'],
        company: [
          {
            id: 1,
            sort: 1,
            name: '公司1',
            series: [
              {
                id: 11,
                sort: 1,
                name: '一般',
                product: [
                  { id: 111, sort: 1, name: '作品1' },
                  { id: 112, sort: 2, name: '作品2' },
                  { id: 113, sort: 3, name: '作品3' },
                  { id: 114, sort: 4, name: '作品4' },
                  { id: 115, sort: 5, name: '作品5' },
                ],
              },
              {
                id: 12,
                sort: 2,
                name: '分類1',
                product: [
                  { id: 121, sort: 1, name: '作品6' },
                  { id: 122, sort: 2, name: '作品7' },
                ],
              },
              { id: 13, sort: 3, name: '其他', product: [] },
            ],
          },
          {
            id: 2,
            sort: 2,
            name: '公司2',
            series: [
              {
                id: 21,
                sort: 1,
                name: '一般',
                product: [
                  { id: 211, sort: 1, name: '作品8' },
                  { id: 212, sort: 2, name: '作品9' },
                ],
              },
              {
                id: 22,
                sort: 2,
                name: '分類2',
                product: [
                  { id: 221, sort: 1, name: '作品10' },
                  { id: 222, sort: 2, name: '作品11' },
                ],
              },
            ],
          },
          {
            id: 3,
            sort: 3,
            name: '公司3',
            series: [
              {
                id: 31,
                sort: 1,
                name: '一般',
                product: [
                  { id: 311, sort: 1, name: '作品12' },
                  { id: 312, sort: 2, name: '作品13' },
                ],
              },
              {
                id: 32,
                sort: 2,
                name: '其他',
                product: [
                  { id: 321, sort: 1, name: '作品14' },
                  { id: 322, sort: 2, name: '作品15' },
                ],
              },
            ],
          },
        ],
        timeOutID: null,
      }
    },
    // data() {
    //   return {
    //     activeNames: ['公司1'],
    //     company: [
    //       {
    //         id: 1,
    //         sort: 1,
    //         name: '公司1',
    //         series: [
    //           {
    //             id: 11,
    //             sort: 1,
    //             name: '一般',
    //             product: [
    //               { id: 111, sort: 1, name: '作品1' },
    //               { id: 112, sort: 2, name: '作品2' },
    //               { id: 113, sort: 3, name: '作品3' },
    //               { id: 114, sort: 4, name: '作品4' },
    //               { id: 115, sort: 5, name: '作品5' },
    //             ],
    //           },
    //           {
    //             id: 12,
    //             sort: 2,
    //             name: '分類1',
    //             product: [
    //               { id: 121, sort: 1, name: '作品6' },
    //               { id: 122, sort: 2, name: '作品7' },
    //             ],
    //           },
    //           { id: 13, sort: 3, name: '其他', product: [] },
    //         ],
    //       },
    //       {
    //         id: 2,
    //         sort: 2,
    //         name: '公司2',
    //         series: [
    //           {
    //             id: 21,
    //             sort: 1,
    //             name: '一般',
    //             product: [
    //               { id: 211, sort: 1, name: '作品8' },
    //               { id: 212, sort: 2, name: '作品9' },
    //             ],
    //           },
    //           {
    //             id: 22,
    //             sort: 2,
    //             name: '分類2',
    //             product: [
    //               { id: 221, sort: 1, name: '作品10' },
    //               { id: 222, sort: 2, name: '作品11' },
    //             ],
    //           },
    //         ],
    //       },
    //       {
    //         id: 3,
    //         sort: 3,
    //         name: '公司3',
    //         series: [
    //           {
    //             id: 31,
    //             sort: 1,
    //             name: '一般',
    //             product: [
    //               { id: 311, sort: 1, name: '作品12' },
    //               { id: 312, sort: 2, name: '作品13' },
    //             ],
    //           },
    //           {
    //             id: 32,
    //             sort: 2,
    //             name: '其他',
    //             product: [
    //               { id: 321, sort: 1, name: '作品14' },
    //               { id: 322, sort: 2, name: '作品15' },
    //             ],
    //           },
    //         ],
    //       },
    //     ],
    //   },

    // },
    computed: {},
    created() {
      console.log('===created')
    },
    beforeDestroy() {
      console.log('===beforeDestroy')
    },
    mounted() {
      console.log('===mounted')
      this.fetchData()
    },
    methods: {
      add_company() {
        console.log('===add_company')
        this.$refs['edit'].showEdit(null, this.list_type)
      },
      async fetchData() {
        console.log('===methods fetchData')
        this.listLoading = true

        let ls_url = `${this.url}`
        let ls_url2 = `${this.url2}`

        //公司
        await axios
          .get(ls_url)
          .then((response) => (this.list_data.company = response.data))
          .catch(function (error) {
            console.log(error)
          })

        //遊戲
        await axios
          .get(ls_url2)
          .then((response) => (this.list_data.product = response.data))
          .catch(function (error) {
            console.log(error)
          })

        this.timeOutID = setTimeout(() => {
          this.listLoading = false
        }, 500)
      },
    },
  }
</script>

<style>
  .floor1 {
    cursor: grab;
    background: forestgreen;
    width: 200px;
    color: white;
    font-weight: bold;
    font-size: 20px;
    margin-top: 5px;
    margin-bottom: 5px;
    padding: 10px;
    display: flex;
    align-items: center;
  }

  .floor2 {
    cursor: grab;
    background: deepskyblue;
    width: 100px;
    height: 25px;
    color: white;
    margin-top: 5px;
    margin-bottom: 5px;
  }
</style>
