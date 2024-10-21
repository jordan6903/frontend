<template>
  <div class="table-container">
    <vab-query-form>
      <vab-query-form-left-panel>
        <el-form ref="form" :inline="true" :model="queryForm" @submit.native.prevent>
          <el-form-item label="批次">
            <el-select v-model="queryForm.batch" placeholder="請選擇批次" @change="fetchData">
              <el-option
                v-for="batch in list_batch"
                :key="batch.export_batch"
                :label="batch.export_batch + ' ' + batch.content"
                :value="batch.export_batch"
              />
            </el-select>
          </el-form-item>
          &nbsp;&nbsp;&nbsp;&nbsp;
          <el-form-item label="啟用">
            <el-switch v-model="queryForm.use_yn_set" />
          </el-form-item>
          &nbsp;&nbsp;&nbsp;&nbsp;
          <el-form-item>
            <el-button icon="el-icon-search" native-type="submit" type="primary" @click="handleQuery">查詢</el-button>
          </el-form-item>
        </el-form>
      </vab-query-form-left-panel>
    </vab-query-form>

    <vab-query-form>
      <vab-query-form-left-panel>
        <el-button icon="el-icon-plus" type="primary" @click="sortCompany">公司排序</el-button>
      </vab-query-form-left-panel>
    </vab-query-form>

    <el-table :data="list" :height="height" :stripe="true" style="width: 100%">
      <el-table-column style="background: whitesmoke" type="expand">
        <template #default="props">
          <h2 style="margin-left: 50px; display: inline">子分類</h2>
          <el-button
            icon="el-icon-plus"
            style="margin-left: 10px; margin-bottom: 10px; display: inline"
            type="primary"
            @click="sortProduct(props.row.id)"
          >
            遊戲排序
          </el-button>
          <el-table :border="true" :data="props.row.series_data" style="margin-left: 50px; margin-bottom: 20px">
            <el-table-column label="子分類" prop="name" show-overflow-tooltip width="100" />
            <el-table-column label="遊戲">
              <template #default="{ row }">
                <div v-for="data in row.p_data" :key="data.id">
                  {{ data.p_Name }}
                </div>
              </template>
            </el-table-column>
            <el-table-column label="啟用" prop="use_yn" show-overflow-tooltip width="50">
              <template #default="{ row }">
                <vab-icon v-show="row.use_yn" :icon="['fas', 'check']" />
                <vab-icon v-show="!row.use_yn" :icon="['fas', 'times']" />
              </template>
            </el-table-column>
            <el-table-column label="排序" prop="sort" show-overflow-tooltip width="50" />
            <el-table-column label="操作" show-overflow-tooltip width="180px">
              <template #default="{ row }">
                <el-button type="text" @click="handleEdit(row)">編輯</el-button>
                <el-button type="text" @click="handleDelete(row)">刪除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </template>
      </el-table-column>
      <el-table-column label="公司名稱" prop="c_Name" show-overflow-tooltip sortable />
      <el-table-column label="啟用" prop="use_yn" show-overflow-tooltip>
        <template #default="{ row }">
          <vab-icon v-show="row.use_yn" :icon="['fas', 'check']" />
          <vab-icon v-show="!row.use_yn" :icon="['fas', 'times']" />
        </template>
      </el-table-column>
      <el-table-column label="排序" prop="sort" show-overflow-tooltip sortable />
      <el-table-column label="操作" show-overflow-tooltip width="180px">
        <template #default="{ row }">
          <el-button type="text" @click="handleEdit(row)">編輯</el-button>
          <el-button type="text" @click="handleDelete(row)">刪除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <company-edit ref="cedit" @trigger-handleQuery="handleQuery" />
    <product-edit ref="pedit" @trigger-handleQuery="handleQuery" />
  </div>
</template>

<script>
  import { doDelete, getList } from '@/api/table'
  import CompanyEdit from './components/CompanyEdit'
  import ProductEdit from './components/ProductEdit'

  export default {
    name: 'View',
    components: {
      CompanyEdit,
      ProductEdit,
    },
    filters: {},
    data() {
      return {
        url: 'http://localhost:5252/api/export_set_company/view',
        url2: 'http://localhost:5252/api/export_set_company/viewp',
        url_batch: 'http://localhost:5252/api/export_set_batch',
        return_msg: '',
        return_success: '',
        imgShow: true,
        list: [],
        list_product: [],
        list_batch: [],
        listLoading: true,
        total: 0,
        background: true,
        selectRows: '',
        elementLoadingText: '正在加載...',
        queryForm: {
          pageNo: 1,
          pageSize: 20,
          searchword: '',
          use_yn_set: true,
          sort: 0,
          batch: '',
        },
        timeOutID: null,
      }
    },
    computed: {
      height() {
        return this.$baseTableHeight()
      },
    },
    created() {
      console.log('===created')
      this.getBatch()
      //this.fetchData()
    },
    beforeDestroy() {
      console.log('===beforeDestroy')
      clearTimeout(this.timeOutID)
    },
    mounted() {
      console.log('===mounted')
    },
    methods: {
      tableSortChange() {
        console.log('===methods tableSortChange')
      },
      setSelectRows(val) {
        console.log('===methods setSelectRows')
        this.selectRows = val
      },
      handleAdd(type) {
        console.log(`handleAdd type:${type}`)
        this.$refs['cedit'].showEdit(null)
      },
      handleAdd2(type) {
        console.log(`handleAdd type:${type}`)
        this.$refs['cedit'].showEdit(null)
      },
      handleEdit(row) {
        console.log('===methods handleEdit')
        this.$refs['edit'].showEdit(row)
      },
      handleDelete(row) {
        console.log('===methods handleDelete')
        console.log(row.id)
        if (row.id) {
          this.$baseConfirm('你確定要刪除當前項嗎?', null, async () => {
            //const { msg } = await doDelete({ ids: row.id })

            let ls_url = this.url
            ls_url += `/${row.id}`

            await axios
              .delete(ls_url, {})
              .then((response) => (this.return_msg = response.data.message))
              .catch(function (error) {
                // 请求失败处理
                console.log(error)
              })

            //拆解
            let msg_array = this.return_msg.split('#')
            this.return_success = msg_array[0]
            this.return_msg = msg_array[1]

            this.$baseMessage(this.return_msg, 'success')

            //成功就關閉視窗
            if (this.return_success == 'Y') {
              this.fetchData()
            }
          })
        } else {
          if (this.selectRows.length > 0) {
            this.$baseMessage('尚未開放此功能', 'error')
          } else {
            this.$baseMessage('未選中任何一行', 'error')
            return false
          }
        }
      },
      handleSizeChange(val) {
        console.log('===methods handleSizeChange')
        this.queryForm.pageSize = val
        this.fetchData()
      },
      handleCurrentChange(val) {
        console.log('===methods handleCurrentChange')
        this.queryForm.pageNo = val
        this.fetchData()
      },
      handleQuery() {
        console.log('===methods handleQuery')
        this.queryForm.pageNo = 1
        this.fetchData()
      },

      async getBatch() {
        console.log('getBatch')
        let ls_url = `${this.url_batch}?UseYN=Y`

        //batch下拉選單
        await axios
          .get(ls_url)
          .then((response) => (this.list_batch = response.data))
          .catch(function (error) {
            console.log(error)
          })
      },

      async fetchData() {
        console.log('===methods fetchData')
        this.listLoading = true

        let ls_batch = this.queryForm.batch
        console.log(ls_batch)

        let ls_url = `${this.url}/${ls_batch}?`
        let ls_url2 = `${this.url2}/${ls_batch}?`
        console.log(ls_url)
        console.log(ls_url2)

        if (this.queryForm.use_yn_set) {
          ls_url += 'UseYN=Y'
        } else {
          ls_url += 'UseYN=N'
        }

        //主資料
        await axios
          .get(ls_url)
          .then((response) => (this.list = response.data))
          .catch(function (error) {
            console.log(error)
          })

        if (this.queryForm.use_yn_set) {
          ls_url2 += 'UseYN=Y'
        } else {
          ls_url2 += 'UseYN=N'
        }

        //遊戲
        await axios
          .get(ls_url2)
          .then((response) => (this.list_product = response.data))
          .catch(function (error) {
            console.log(error)
          })

        this.setPdata()

        this.timeOutID = setTimeout(() => {
          this.listLoading = false
        }, 500)
      },

      async setPdata() {
        console.log('setPdata')
        let Series_data, Product_data
        let ls_tmparray = []

        for (let i = 0; i < this.list.length; i++) {
          //公司
          for (let j = 0; j < this.list[i].series_data.length; j++) {
            //子分類

            //子分類跟遊戲比較
            for (let k = 0; k < this.list_product.length; k++) {
              //匹配則放入子分類遊戲裡
              if (this.list[i].series_data[j]['id'] == this.list_product[k]['espS_id']) {
                ls_tmparray.push(this.list_product[k])
              }
            }
            this.list[i].series_data[j]['p_data'] = ls_tmparray
            ls_tmparray = [] //清空
          }
        }
      },

      async sortCompany() {
        console.log('sortCompany')
        if (this.queryForm.batch === undefined || this.queryForm.batch === null || this.queryForm.batch === '') {
          alert('請先選擇批次')
        } else {
          this.$refs['cedit'].showEdit(this.queryForm.batch)
        }
      },

      async sortProduct(id) {
        console.log('sortProduct')
        if (id === undefined || id === null || id === '') {
          alert('請先選擇批次')
        } else {
          this.$refs['pedit'].showEdit(id)
        }
      },
    },
  }
</script>
