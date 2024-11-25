<template>
  <div class="table-container">
    <vab-query-form>
      <vab-query-form-left-panel>
        <el-form ref="form" :inline="true" :model="queryForm" @submit.native.prevent>
          <el-form-item>
            <el-input v-model="queryForm.csearchword" placeholder="請輸入公司名稱..." />
          </el-form-item>
          <el-form-item>
            <el-input v-model="queryForm.psearchword" placeholder="請輸入遊戲名稱..." />
          </el-form-item>
          <el-form-item>
            <el-input v-model="queryForm.tsearchword" placeholder="請輸入漢化組..." />
          </el-form-item>
          <el-form-item>
            <el-button icon="el-icon-search" native-type="submit" type="primary" @click="handleQuery">查詢</el-button>
          </el-form-item>
          &nbsp;&nbsp;&nbsp;&nbsp;
          <el-form-item label="分類">
            <el-select v-model="queryForm.type" placeholder="請選擇分類">
              <el-option label="% 全選" value="%" />
              <el-option v-for="type in list_type.type" :key="type.type_id" :label="type.type_id + ' ' + type.name" :value="type.type_id" />
            </el-select>
          </el-form-item>
        </el-form>
      </vab-query-form-left-panel>
    </vab-query-form>

    <vab-query-form>
      <vab-query-form-left-panel>
        <el-button icon="el-icon-plus" type="primary" @click="handleAdd">新增</el-button>
      </vab-query-form-left-panel>
    </vab-query-form>

    <el-table ref="mainTable" :data="list" :height="height" :stripe="true" style="width: 100%">
      <el-table-column style="background: whitesmoke" type="expand">
        <template #default="props">
          <h2 style="margin-left: 50px; display: inline">漢化組列</h2>
          <el-button
            icon="el-icon-plus"
            style="margin-left: 10px; margin-bottom: 10px; display: inline"
            type="primary"
            @click="handleAdd2(props.row)"
          >
            新增
          </el-button>
          <el-button
            icon="el-icon-plus"
            style="margin-left: 10px; margin-bottom: 10px; display: inline"
            type="warning"
            @click="handleUrl(props.row)"
          >
            編輯網址
          </el-button>
          <el-table :border="true" :data="props.row.t_batch_data" style="margin-left: 50px; margin-bottom: 20px">
            <el-table-column label="批次" prop="t_batch" show-overflow-tooltip width="95" />
            <el-table-column label="漢化組">
              <template #default="scope">
                <div v-for="(item, index) in scope.row.tT_info" :key="index">
                  {{ item.t_Name }}
                </div>
              </template>
            </el-table-column>
            <el-table-column label="漢化進度" prop="type_Name" width="150" />
            <el-table-column label="備註" prop="remark" width="300" />
            <el-table-column label="TT_id" prop="id" show-overflow-tooltip width="95" />
            <el-table-column label="操作" show-overflow-tooltip width="180px">
              <template #default="{ row }">
                <el-button type="text" @click="handleEdit(row)">編輯</el-button>
                <el-button type="text" @click="handleDelete(row)">刪除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </template>
      </el-table-column>
      <el-table-column label="公司" prop="c_Name" show-overflow-tooltip sortable width="150" />
      <el-table-column label="遊戲名稱" prop="p_Name" show-overflow-tooltip />
      <el-table-column label="中文名稱" prop="p_CName" show-overflow-tooltip />
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
    <url-edit ref="urledit" />
  </div>
</template>

<script>
  import { doDelete, getList } from '@/api/table'
  import TableEdit from './components/TableEdit'
  import UrlEdit from './components/UrlEdit'

  export default {
    name: 'TranslationTeam',
    components: {
      TableEdit,
      UrlEdit,
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
        url: 'http://localhost:5252/api/translation_team',
        url2: 'http://localhost:5252/api/translation_team_batch',
        url_type: {
          url1: 'http://localhost:5252/api/translation_team_info',
          url2: 'http://localhost:5252/api/translation_team_type',
        },
        return_msg: '',
        return_success: '',
        imgShow: true,
        list: [],
        list_type: {
          info: [],
          type: [],
        },
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
          csearchword: '',
          psearchword: '',
          tsearchword: '',
          type: '',
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
      handleAdd2(row) {
        console.log('===methods handleAdd2')
        console.log(row)
        this.$refs['edit'].showAdd(row, this.list_type)
      },
      handleUrl(row) {
        console.log('===methods handleUrl')
        console.log(row)
        this.$refs['urledit'].showEdit(row)
      },
      handleEdit(row) {
        console.log('===methods handleEdit')
        console.log(row)
        this.$refs['edit'].showEdit(row, this.list_type)
      },
      handleDelete(row) {
        console.log('===methods handleDelete')
        console.log(row)
        if (row.id) {
          this.$baseConfirm('你確定要刪除當前項嗎?', null, async () => {
            //先刪batch
            let ls_url2 = this.url2
            ls_url2 += `/deletebyttid/${row.id}`

            await axios
              .delete(ls_url2, {})
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

            //再刪主檔
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
            msg_array = this.return_msg.split('#')
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

      // 展開所有摺疊的列
      expandAllRows() {
        this.$nextTick(() => {
          this.list.forEach((row) => {
            this.$refs.mainTable.toggleRowExpansion(row, true)
          })
        })
      },

      async fetchData() {
        console.log('===methods fetchData')
        this.listLoading = true

        let ls_url = `${this.url}?`

        if (this.queryForm.csearchword != '') {
          ls_url += `c_search=${this.queryForm.csearchword}` + '&'
        }

        if (this.queryForm.psearchword != '') {
          ls_url += `p_search=${this.queryForm.psearchword}` + '&'
        }

        if (this.queryForm.tsearchword != '') {
          ls_url += `t_search=${this.queryForm.tsearchword}` + '&'
        }

        if (
          this.queryForm.type !== '' &&
          this.queryForm.type !== null &&
          this.queryForm.type !== undefined &&
          this.queryForm.type !== '%'
        ) {
          console.log(this.queryForm.type)
          ls_url += `&type_id=${this.queryForm.type}` + '&'
        }

        ls_url = ls_url.substring(0, ls_url.length - 1)

        //主資料
        await axios
          .get(ls_url)
          .then((response) => (this.list = response.data))
          .catch(function (error) {
            console.log(error)
          })

        let ls_url1 = `${this.url_type.url1}`
        let ls_url2 = `${this.url_type.url2}?UseYN=Y`

        //漢化組info
        await axios
          .get(ls_url1)
          .then((response) => (this.list_type.info = response.data))
          .catch(function (error) {
            console.log(error)
          })

        //分類type
        await axios
          .get(ls_url2)
          .then((response) => (this.list_type.type = response.data))
          .catch(function (error) {
            console.log(error)
          })

        this.total = this.list.length
        this.timeOutID = setTimeout(() => {
          this.listLoading = false

          //有搜尋條件才全部展開, 不然會卡
          if (this.queryForm.csearchword != '' || this.queryForm.psearchword != '' || this.queryForm.tsearchword != '') {
            this.expandAllRows()
          }
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
