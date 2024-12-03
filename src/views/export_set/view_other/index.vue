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
          <br />
          <el-form-item label="輸出分類">
            <el-select v-model="export_type" placeholder="請選擇分類">
              <el-option v-for="type in list_type" :key="type.id" :label="type.id + ' ' + type.name" :value="type.name" />
            </el-select>
          </el-form-item>
          &nbsp;&nbsp;&nbsp;&nbsp;
          <el-form-item>
            <el-button icon="el-icon-search" native-type="submit" type="primary" @click="export_start">產生預覽</el-button>
            <el-button icon="el-icon-plus" type="danger" @click="newOther">新增其他</el-button>
          </el-form-item>
        </el-form>
      </vab-query-form-left-panel>
    </vab-query-form>

    <el-table v-loading="listLoading" :data="list" :height="height" :stripe="true" style="width: 100%">
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
                <div v-for="data in row.p_data" :key="data.id">[{{ data.c_Name }}] {{ data.p_Name }}</div>
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
                <el-button type="text" @click="handleAddWord(row)">編輯html</el-button>
              </template>
            </el-table-column>
          </el-table>
        </template>
      </el-table-column>
      <el-table-column label="排序" prop="sort" show-overflow-tooltip sortable width="95px" />
      <el-table-column label="其他名稱" prop="name" show-overflow-tooltip sortable />
      <el-table-column label="編排完畢" prop="count_chk" show-overflow-tooltip sortable>
        <template #default="{ row }">
          <vab-icon v-show="row.count_chk" :icon="['fas', 'check']" style="color: green" />
          <vab-icon v-show="!row.count_chk" :icon="['fas', 'times']" style="color: red" />
        </template>
      </el-table-column>
      <el-table-column label="漢化已編排數" prop="count_export" show-overflow-tooltip />
      <el-table-column label="漢化可編排數" prop="count_exportall" show-overflow-tooltip />
      <el-table-column label="所有遊戲總數" prop="count_all" show-overflow-tooltip />
      <el-table-column label="操作" show-overflow-tooltip width="180px">
        <template #default="{ row }">
          <el-button type="text" @click="modifyOther(row)">編輯</el-button>
          <el-button type="text" @click="deleteOther(row)">刪除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-pagination
      :background="background"
      :current-page="queryForm.pageNo"
      :layout="layout"
      :page-size="queryForm.pageSize"
      :total="total"
      @current-change="handleCurrentChange"
      @size-change="handleSizeChange"
    />

    <company-edit ref="cedit" @trigger-handleQuery="handleQuery" />
    <product-edit ref="pedit" @trigger-handleQuery="handleQuery" />
    <export-view ref="export" />
    <export-view2 ref="export2" />
    <export-view3 ref="export3" />
    <addword-edit ref="addwordedit" @trigger-handleQuery="handleQuery" />
  </div>
</template>

<script>
  import { doDelete, getList } from '@/api/table'
  import CompanyEdit from './components/CompanyEdit'
  import ProductEdit from './components/ProductEdit'
  import ExportView from './components/ExportView'
  import ExportView2 from './components/ExportView2'
  import ExportView3 from './components/ExportView3'
  import AddwordEdit from './components/AddwordEdit'
  import axios from '@/utils/request2'

  export default {
    name: 'ViewOther',
    components: {
      CompanyEdit,
      ProductEdit,
      ExportView,
      ExportView2,
      ExportView3,
      AddwordEdit,
    },
    filters: {},
    data() {
      return {
        url: 'http://localhost:5252/api/export_set_other/viewmainpage',
        url2: 'http://localhost:5252/api/export_set_other/viewp',
        url3: 'http://localhost:5252/api/export_set_other',
        url_batch: 'http://localhost:5252/api/export_set_batch',
        url_type: 'http://localhost:5252/api/export_type',

        return_data: '',
        return_msg: '',
        return_success: '',

        imgShow: true,
        list: [],
        list_product: [],
        list_batch: [],
        list_type: [],
        list_count: [],
        listLoading: false,
        total: 0,
        background: true,
        selectRows: '',
        elementLoadingText: '正在加載...',
        layout: 'total, sizes, prev, pager, next, jumper',
        queryForm: {
          pageNo: 1,
          pageSize: 10,
          searchword: '',
          use_yn_set: true,
          sort: 0,
          batch: '',
        },
        export_type: '',
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
      handleAddWord(row) {
        console.log('handleAddWord')
        console.log(row)
        this.$refs['addwordedit'].showEdit(row)
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
        console.log('===fetchData')
        this.listLoading = true

        let ls_batch = this.queryForm.batch
        console.log(ls_batch)

        let ls_url = `${this.url}/${ls_batch}?`
        let ls_url2 = `${this.url2}/${ls_batch}?`
        let url_type = `${this.url_type}?UseYN=Y`
        console.log(ls_url)
        console.log(ls_url2)
        console.log(url_type)

        ls_url += `page=${this.queryForm.pageNo}&pageSize=${this.queryForm.pageSize}`

        if (this.queryForm.use_yn_set) {
          ls_url += '&UseYN=Y'
        } else {
          ls_url += '&UseYN=N'
        }

        //主資料
        await axios
          .get(ls_url)
          .then((response) => (this.return_data = response.data))
          .catch(function (error) {
            console.log(error)
          })

        this.total = this.return_data.totalRecords
        this.list = this.return_data.data

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

        //輸出分類
        await axios
          .get(url_type)
          .then((response) => (this.list_type = response.data))
          .catch(function (error) {
            console.log(error)
          })

        this.setPdata()
        //this.setPcount();

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
              if (this.list[i].series_data[j]['id'] == this.list_product[k]['esos_id']) {
                ls_tmparray.push(this.list_product[k])
              }
            }
            this.list[i].series_data[j]['p_data'] = ls_tmparray
            ls_tmparray = [] //清空
          }
        }
      },

      async setPcount() {
        console.log('setPcount')

        for (let i = 0; i < this.list.length; i++) {
          for (let j = 0; j < this.list_count.length; j++) {
            if (this.list[i]['id'] == this.list_count[j]['id']) {
              this.list[i]['count_export'] = this.list_count[j]['count_export']
              this.list[i]['count_exportall'] = this.list_count[j]['count_exportALL']
              this.list[i]['count_all'] = this.list_count[j]['count_ALL']

              if (this.list[i]['count_export'] == this.list[i]['count_exportall']) {
                this.list[i]['count_chk'] = true
              }
              break
            }
          }
        }
      },

      async newOther() {
        console.log('sortCompany')
        if (this.queryForm.batch === undefined || this.queryForm.batch === null || this.queryForm.batch === '') {
          alert('請先選擇批次')
        } else {
          this.$refs['cedit'].showEdit(this.queryForm.batch, null)
        }
      },

      async modifyOther(row) {
        console.log('sortCompany')
        if (this.queryForm.batch === undefined || this.queryForm.batch === null || this.queryForm.batch === '') {
          alert('請先選擇批次')
        } else {
          this.$refs['cedit'].showEdit(this.queryForm.batch, row)
        }
      },

      async deleteOther(row) {
        console.log('deleteOther')
        console.log(row)
        if (row.id) {
          this.$baseConfirm('你確定要刪除當前項嗎?', null, async () => {
            //const { msg } = await doDelete({ ids: row.id })

            let ls_url = this.url3
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
            // const ids = this.selectRows.map((item) => item.id).join()
            // this.$baseConfirm('你确定要删除选中项吗', null, async () => {
            //   const { msg } = await doDelete({ ids: ids })
            //   this.$baseMessage(msg, 'success')
            //   this.fetchData()
            // })
          } else {
            this.$baseMessage('未選中任何一行', 'error')
            return false
          }
        }
      },

      async sortProduct(id) {
        console.log('sortProduct')
        if (id === undefined || id === null || id === '') {
          alert('請先選擇批次')
        } else {
          this.$refs['pedit'].showEdit(id, this.queryForm.batch)
        }
      },

      async export_start() {
        console.log('export_start')
        if (this.queryForm.batch === undefined || this.queryForm.batch === null || this.queryForm.batch === '') {
          alert('請先選擇批次')
        } else if (this.export_type === undefined || this.export_type === null || this.export_type === '') {
          alert('請先選擇輸出分類')
        } else {
          console.log(this.export_type)
          if (this.export_type == '試算表') {
            this.$refs['export'].showEdit(this.queryForm.batch)
          } else if (this.export_type == '巴哈') {
            this.$refs['export2'].showEdit(this.queryForm.batch)
          } else if (this.export_type == 'Blogger') {
            this.$refs['export3'].showEdit(this.queryForm.batch)
          }
        }
      },
    },
  }
</script>
