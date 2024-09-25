<template>
  <div class="table-container">
    <vab-query-form>
      <vab-query-form-left-panel>
        <el-form ref="form" :inline="true" :model="queryForm" @submit.native.prevent>
          <el-form-item>
            <el-input v-model="queryForm.searchword" placeholder="輸入遊戲名稱或id..." />
          </el-form-item>
          <el-form-item>
            <el-input v-model="queryForm.searchword2" placeholder="輸入公司名稱或id..." />
          </el-form-item>
          <el-form-item>
            <el-button icon="el-icon-search" native-type="submit" type="primary" @click="handleQuery">查詢</el-button>
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
      :element-loading-text="elementLoadingText"
      :height="height"
      @selection-change="setSelectRows"
      @sort-change="tableSortChange"
    >
      <el-table-column show-overflow-tooltip type="selection" width="55" />
      <el-table-column label="代碼" prop="p_id" show-overflow-tooltip sortable width="150" />
      <el-table-column label="公司名稱" prop="company_name" show-overflow-tooltip sortable width="150" />
      <el-table-column label="遊戲名稱" prop="name" show-overflow-tooltip width="150" />
      <el-table-column label="中文名稱" prop="c_Name" show-overflow-tooltip />
      <el-table-column label="介紹" prop="content" show-overflow-tooltip />
      <el-table-column label="類型" prop="content_style" show-overflow-tooltip />
      <el-table-column label="遊玩時數" prop="play_time" show-overflow-tooltip />
      <el-table-column label="備註" prop="remark" show-overflow-tooltip />
      <el-table-column label="更新時間" prop="upd_date" show-overflow-tooltip sortable width="200" />
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
    <table-edit ref="edit" />
  </div>
</template>

<script>
  import { doDelete, getList } from '@/api/table'
  import TableEdit from './components/TableEdit'

  export default {
    name: 'Product',
    components: {
      TableEdit,
    },
    filters: {
      statusFilter(status) {
        const statusMap = {
          published: 'success',
          draft: 'gray',
          deleted: 'danger',
        }
        return statusMap[status]
      },
    },
    data() {
      return {
        url: 'http://localhost:5252/api/product',
        url2: 'http://localhost:5252/api/company',
        return_msg: '',
        return_success: '',
        imgShow: true,
        list: [],
        list_type: [],
        imageList: [],
        listLoading: true,
        layout: 'total, sizes, prev, pager, next, jumper',
        total: 0,
        background: true,
        selectRows: '',
        elementLoadingText: '正在加載...',
        queryForm: {
          pageNo: 1,
          pageSize: 20,
          searchword: '',
          searchword2: '',
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
        this.$refs['edit'].showEdit(null, this.list_type)
      },
      handleEdit(row) {
        console.log('===methods handleEdit')
        this.$refs['edit'].showEdit(row, this.list_type)
      },
      handleDelete(row) {
        console.log('===methods handleDelete')
        console.log(row.p_id)
        if (row.p_id) {
          this.$baseConfirm('你確定要刪除當前項嗎?', null, async () => {
            let ls_url = this.url
            ls_url += `/${row.p_id}`

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

        let ls_url = `${this.url}?`

        if (this.queryForm.searchword != '') {
          ls_url += `searchword=${this.queryForm.searchword}` + '&'
        }

        if (this.queryForm.searchword2 != '') {
          ls_url += `searchword2=${this.queryForm.searchword2}` + '&'
        }

        ls_url = ls_url.substring(0, ls_url.length - 1)

        //遊戲主資料
        await axios
          .get(ls_url)
          .then((response) => (this.list = response.data))
          .catch(function (error) {
            console.log(error)
          })

        let ls_url2 = `${this.url2}`

        //公司
        await axios
          .get(ls_url2)
          .then((response) => (this.list_type = response.data))
          .catch(function (error) {
            console.log(error)
          })

        this.total = this.list.length
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
