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
          &nbsp;&nbsp;&nbsp;
          <el-form-item label="啟用">
            <el-switch v-model="queryForm.use_yn_set" />
          </el-form-item>
        </el-form>
      </vab-query-form-left-panel>
    </vab-query-form>

    <vab-query-form>
      <vab-query-form-left-panel>
        <el-button icon="el-icon-plus" type="primary" @click="handleAdd">新增</el-button>
        <el-button icon="el-icon-delete" type="danger" @click="handleDelete">删除</el-button>
      </vab-query-form-left-panel>
    </vab-query-form>

    <el-table
      ref="tableSort"
      v-loading="listLoading"
      :data="list"
      :default-sort="{ prop: 'sort' }"
      :element-loading-text="elementLoadingText"
      :height="height"
      @selection-change="setSelectRows"
      @sort-change="tableSortChange"
    >
      <el-table-column show-overflow-tooltip type="selection" width="55" />
      <el-table-column label="代碼" prop="voice_id" show-overflow-tooltip sortable width="95" />
      <el-table-column label="名稱" prop="name" show-overflow-tooltip />
      <el-table-column label="敘述" prop="content" show-overflow-tooltip />
      <el-table-column label="排序" prop="sort" show-overflow-tooltip sortable width="95" />
      <el-table-column label="操作" show-overflow-tooltip width="180px">
        <template #default="{ row }">
          <el-button type="text" @click="handleEdit(row)">編輯</el-button>
          <el-button type="text" @click="handleDelete(row)">刪除</el-button>
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
    <table-edit ref="edit" @trigger-handleQuery="handleQuery" />
  </div>
</template>

<script>
  import { doDelete, getList } from '@/api/table'
  import TableEdit from './components/TableEdit'

  export default {
    name: 'Voice',
    components: {
      TableEdit,
    },
    filters: {},
    data() {
      return {
        url: 'http://localhost:5252/api/voice_type',
        return_data: '',
        return_msg: '',
        return_success: '',
        imgShow: true,
        list: [],
        imageList: [],
        listLoading: true,
        layout: 'total, sizes, prev, pager, next, jumper',
        total: 0,
        background: true,
        selectRows: '',
        elementLoadingText: '正在加載...',
        queryForm: {
          pageNo: 1,
          pageSize: 10,
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
        this.$refs['edit'].showEdit()
      },
      handleEdit(row) {
        console.log('===methods handleEdit')
        this.$refs['edit'].showEdit(row)
      },
      handleDelete(row) {
        console.log('===methods handleDelete')
        console.log(row.voice_id)
        if (row.voice_id) {
          this.$baseConfirm('你確定要刪除當前項嗎?', null, async () => {
            //const { msg } = await doDelete({ ids: row.id })

            let ls_url = this.url
            ls_url += `/${row.voice_id}`

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

      async fetchData() {
        console.log('===methods fetchData')
        this.listLoading = true

        let ls_url = `${this.url}/mainpage`

        if (this.queryForm.use_yn_set) {
          ls_url += '?UseYN=Y'
        } else {
          ls_url += '?UseYN=N'
        }

        if (this.queryForm.searchword != '') {
          ls_url += `&searchword=${this.queryForm.searchword}`
        }

        ls_url += `&page=${this.queryForm.pageNo}&pageSize=${this.queryForm.pageSize}`

        await axios
          .get(ls_url)
          .then((response) => (this.return_data = response.data))
          .catch(function (error) {
            console.log(error)
          })

        this.total = this.return_data.totalRecords
        this.list = this.return_data.data

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
