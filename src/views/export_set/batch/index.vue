<template>
  <div class="table-container">
    <vab-query-form>
      <vab-query-form-left-panel>
        <el-form ref="form" :inline="true" :model="queryForm" @submit.native.prevent>
          <el-form-item>
            <el-input v-model="queryForm.searchword" placeholder="輸入關鍵字..." />
          </el-form-item>
          <el-form-item>
            <el-button icon="el-icon-search" native-type="submit" type="primary" @click="handleQuery">查詢</el-button>
          </el-form-item>
          &nbsp;&nbsp;&nbsp;&nbsp;
          <el-form-item label="啟用">
            <el-switch v-model="queryForm.use_yn_set" />
          </el-form-item>
          &nbsp;&nbsp;&nbsp;&nbsp;
          <el-form-item label="批次複製">
            <el-button native-type="submit" type="danger" @click="handleCopy">複製公司</el-button>
            <el-button native-type="submit" type="danger" @click="handleCopyOther">複製其他</el-button>
          </el-form-item>
        </el-form>
      </vab-query-form-left-panel>
    </vab-query-form>

    <vab-query-form>
      <vab-query-form-left-panel>
        <el-button icon="el-icon-plus" type="primary" @click="handleAdd">新增</el-button>
      </vab-query-form-left-panel>
    </vab-query-form>

    <el-table
      ref="tableSort"
      v-loading="listLoading"
      :data="list"
      :element-loading-text="elementLoadingText"
      :height="height"
      @selection-change="setSelectRows"
      @sort-change="tableSortChange"
    >
      <el-table-column show-overflow-tooltip type="selection" width="55" />
      <el-table-column label="代碼" prop="export_batch" show-overflow-tooltip sortable width="95" />
      <el-table-column label="敘述" prop="content" show-overflow-tooltip />
      <el-table-column label="已編排總數" prop="count_exportALL" show-overflow-tooltip />
      <el-table-column label="可編排總數" prop="count_all" show-overflow-tooltip />
      <el-table-column label="啟用" prop="use_yn" show-overflow-tooltip>
        <template #default="{ row }">
          <vab-icon v-show="row.use_yn" :icon="['fas', 'check']" />
          <vab-icon v-show="!row.use_yn" :icon="['fas', 'times']" />
        </template>
      </el-table-column>
      <el-table-column label="操作" show-overflow-tooltip width="180px">
        <template #default="{ row }">
          <el-button type="text" @click="handleEdit(row)">編輯</el-button>
          <el-button type="text" @click="handleDelete(row)">刪除</el-button>
        </template>
      </el-table-column>
    </el-table>
    <table-edit ref="edit" />
    <export-copy ref="exportCopy" @trigger-handleQuery="handleQuery" />
    <export-copy-other ref="exportCopyOther" @trigger-handleQuery="handleQuery" />
  </div>
</template>

<script>
  import { doDelete, getList } from '@/api/table'
  import TableEdit from './components/TableEdit'
  import ExportCopy from './components/ExportCopy'
  import ExportCopyOther from './components/ExportCopyOther'
  import axios from '@/utils/request2'

  export default {
    name: 'Batch',
    components: {
      TableEdit,
      ExportCopy,
      ExportCopyOther,
    },
    filters: {},
    data() {
      return {
        url: 'http://localhost:5252/api/export_set_batch',
        url2: 'http://localhost:5252/api/product/getforother',
        return_msg: '',
        return_success: '',
        imgShow: true,
        list: [],
        product_all: [],
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
      this.fetchData()
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
      handleAdd() {
        console.log('===methods handleAdd')
        this.$refs['edit'].showEdit(null)
      },
      handleEdit(row) {
        console.log('===methods handleEdit')
        this.$refs['edit'].showEdit(row)
      },
      handleCopy() {
        console.log('handleCopy')
        this.$refs['exportCopy'].showEdit()
      },
      handleCopyOther() {
        console.log('handleCopyOther')
        this.$refs['exportCopyOther'].showEdit()
      },
      handleDelete(row) {
        console.log('===methods handleDelete')
        console.log(row.export_batch)
        if (row.export_batch) {
          this.$baseConfirm('你確定要刪除當前項嗎?', null, async () => {
            //const { msg } = await doDelete({ ids: row.id })

            let ls_url = this.url
            ls_url += `/${row.export_batch}`

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

      async generateData() {
        console.log('generateData')

        for (let i = 0; i < this.list.length; i++) {
          this.list[i]['count_exportALL'] += this.list[i]['count_export1']
          this.list[i]['count_exportALL'] += this.list[i]['count_export2']
          this.list[i]['count_all'] = this.product_all.length
        }
      },

      async fetchData() {
        console.log('===methods fetchData')
        this.listLoading = true

        let ls_url = `${this.url}?`
        let ls_url2 = `${this.url2}`

        if (this.queryForm.use_yn_set) {
          ls_url += 'UseYN=Y&'
        } else {
          ls_url += 'UseYN=N&'
        }

        if (this.queryForm.searchword != '') {
          ls_url += `searchword=${this.queryForm.searchword}` + '&'
        }

        ls_url = ls_url.substring(0, ls_url.length - 1)

        //主資料
        await axios
          .get(ls_url)
          .then((response) => (this.list = response.data))
          .catch(function (error) {
            console.log(error)
          })

        //抓出所有跟漢化相關的遊戲
        await axios
          .get(ls_url2)
          .then((response) => (this.product_all = response.data))
          .catch(function (error) {
            console.log(error)
          })

        this.generateData()

        this.timeOutID = setTimeout(() => {
          this.listLoading = false
        }, 500)
      },

      testMessage() {
        console.log('===methods testMessage')
        this.$baseMessage('test1', 'success')
      },

      testALert() {
        console.log('===methods testALert')
        this.$baseAlert('11')
        this.$baseAlert('11', '自定義標題', () => {
          /* 可以写回调; */
        })
        this.$baseAlert('11', null, () => {
          /* 可以写回调; */
        })
      },

      testConfirm() {
        console.log('===methods testConfirm')
        this.$baseConfirm(
          '你确定要执行该操作?',
          null,
          () => {
            /* 可以写回调; */
          },
          () => {
            /* 可以写回调; */
          }
        )
      },

      testNotify() {
        console.log('===methods testNotify')
        this.$baseNotify('测试消息提示', 'test', 'success', 'bottom-right')
      },
    },
  }
</script>
