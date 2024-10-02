<template>
  <el-collapse v-model="activeNames">
    <!--↓公司↓-->
    <el-collapse-item
      v-for="(_company, companyIndex) in company"
      :key="_company.id"
      draggable="true"
      :name="_company.id"
      :title="_company.name"
      @dragend="dragEnd"
      @dragover="allowDrop"
      @dragstart="dragStart($event, companyIndex, 'Company')"
      @drop="CompanyDrop($event, companyIndex)"
    >
      >
      <!--↓作品分類↓-->
      <div v-for="(series, seriesIndex) in _company.series" :key="series.id">
        <div
          draggable="true"
          @dragend="dragEnd"
          @dragover="allowDrop"
          @dragstart="dragStart($event, seriesIndex, 'Series', companyIndex)"
          @drop="SeriesDrop($event, seriesIndex, 'Series', companyIndex)"
        >
          <div class="floor2">{{ series.name }}</div>
        </div>

        <!--↓作品↓-->
        <div
          v-for="(product, productIndex) in series.product"
          :key="product.id"
          draggable="true"
          @dragend="dragEnd"
          @dragover="allowDrop"
          @dragstart="dragStart2($event, productIndex, 'Product', companyIndex, seriesIndex)"
          @drop="ProductDrop($event, productIndex, 'Product', companyIndex, seriesIndex)"
        >
          <div class="floor3">{{ product.name }}</div>
        </div>

        <div v-if="series.product == 0" v-show="emptydiv">(+加入作品)</div>
      </div>
    </el-collapse-item>
  </el-collapse>
</template>

<script>
  import { doDelete, getList } from '@/api/table'
  import TableEdit from './components/TableEdit'

  export default {
    name: 'Export2',
    // components: {
    //   TableEdit,
    // },
    filters: {},
    data() {
      return {
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
      }
    },
    computed: {},
    created() {
      console.log('===created')
    },
    beforeDestroy() {
      console.log('===beforeDestroy')
    },
    mounted() {
      console.log('===mounted')
    },
    methods: {
      //拖曳相關--str---↓↓--
      allowDrop(e) {
        //取消默認行為
        e.preventDefault()
      },
      dragStart(e, index, type, CompanyIndex = null) {
        //拖曳開始
        this.emptydiv = true
        e.dataTransfer.setData('Text', JSON.stringify({ index, type, CompanyIndex }))
      },
      dragStart2(e, index, type, CompanyIndex = null, SeriesIndex = null) {
        //拖曳開始
        this.emptydiv = true
        e.dataTransfer.setData('Text2', JSON.stringify({ index, type, CompanyIndex, SeriesIndex }))
      },
      CompanyDrop(e, listIndex) {
        //公司
        this.allowDrop(e)
        const data = JSON.parse(e.dataTransfer.getData('Text'))
        console.log(data)
        const { index, type, CompanyIndex } = data

        if (type === 'Company') {
          //公司與公司換
          let arr = this.company.concat([])
          let temp = arr.splice(index, 1)
          arr.splice(listIndex, 0, temp[0])
          this.company = arr
          this.updateSort() // 更新排序
        } else if (type === 'Series') {
          //作品子分類與公司換
          const sourceCompany = this.company[CompanyIndex]
          const movedResource = sourceCompany.series.splice(index, 1)[0]
          const targetCompany = this.company[listIndex]
          targetCompany.series.splice(0, 0, movedResource)
          this.updateSort()
        }
      },
      SeriesDrop(e, targetIndex, targetType, targetCompanyIndex = null) {
        //"作品子分類"放置
        this.allowDrop(e)
        const data = JSON.parse(e.dataTransfer.getData('Text'))
        console.log(data)
        const { index, type, CompanyIndex } = data
        if (type === 'Series') {
          // 處理作品子分類拖曳
          const sourceCompany = this.company[CompanyIndex]
          const movedResource = sourceCompany.series.splice(index, 1)[0]
          const targetCompany = this.company[targetCompanyIndex]
          targetCompany.series.splice(targetIndex, 0, movedResource)
        }
        this.updateSort() // 更新排序
      },

      ProductDrop(e, targetIndex, targetType, targetCompanyIndex = null, targetSeriesIndex = null) {
        //"作品"放置
        this.allowDrop(e)
        const data = JSON.parse(e.dataTransfer.getData('Text2'))
        console.log(data)
        const { index, type, CompanyIndex, SeriesIndex } = data
        if (type === 'Product') {
          // 處理作品拖曳
          const sourceProduct = this.company[CompanyIndex].series[SeriesIndex]
          const movedResource = sourceProduct.product.splice(index, 1)[0]
          const targetProduct = this.company[targetCompanyIndex].series[targetSeriesIndex]
          targetProduct.product.splice(targetIndex, 0, movedResource)
        }
        this.updateSort() // 更新排序
      },

      updateSort() {
        // 更新排序
        this.company.forEach((Company, CompanyIndex) => {
          Company.sort = CompanyIndex + 1
          Company.series.forEach((resource, resourceIndex) => {
            resource.sort = resourceIndex + 1
          })
        })
      },
      dragEnd() {
        //放置結束
        console.log('dragEnd')
        this.emptydiv = false
      },
      //拖曳相關--end---↑↑--
    },
  }
</script>

<style>
  .floor1 {
    cursor: grab;
    background: deepskyblue;
    width: 200px;
    height: 50px;
    color: white;
    font-weight: bold;
    margin-top: 5px;
    margin-bottom: 5px;
  }

  .floor2 {
    cursor: grab;
    background: forestgreen;
    width: 100px;
    height: 25px;
    color: white;
    margin-top: 5px;
    margin-bottom: 5px;
  }
</style>
