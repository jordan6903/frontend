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
            <el-button icon="el-icon-search" native-type="submit" type="primary" @click="handleQuery('')">查詢</el-button>
            <el-button icon="el-icon-search" type="primary" @click="handleQuery('recent')">查詢最近更新</el-button>
          </el-form-item>
          &nbsp;&nbsp;&nbsp;&nbsp;
          <el-form-item>
            <el-select v-model="queryForm.type" placeholder="請選擇分類">
              <el-option label="% 全選" value="%" />
              <el-option v-for="type in list_type.type" :key="type.type_id" :label="type.type_id + ' ' + type.name" :value="type.type_id" />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-date-picker
              v-model="queryForm.upddate"
              align="right"
              end-placeholder="结束日期"
              :picker-options="pickerOptions"
              range-separator="至"
              start-placeholder="開始日期"
              type="daterange"
              unlink-panels
            />
          </el-form-item>
          <el-form-item label="展開細節">
            <el-switch v-model="queryForm.open_detail" @change="expandAllRows" />
          </el-form-item>
          <el-form-item>
            <el-button icon="el-icon-plus" type="danger" @click="handleAdd">新增</el-button>
            <el-button v-if="export_btn_show" type="success" @click="export_file">產生更新表</el-button>
          </el-form-item>
        </el-form>
      </vab-query-form-left-panel>
    </vab-query-form>

    <el-table ref="mainTable" v-loading="listLoading" :data="list" :height="height" :stripe="true" style="width: 100%">
      <el-table-column fixed style="background: whitesmoke" type="expand">
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
      <el-table-column fixed label="公司" prop="c_Name" show-overflow-tooltip sortable width="125" />
      <el-table-column fixed label="遊戲名稱" prop="p_Name" show-overflow-tooltip width="250" />
      <el-table-column label="中文名稱" prop="p_CName" show-overflow-tooltip width="250" />
      <el-table-column label="發售日" prop="sale_Date" show-overflow-tooltip sortable width="100" />

      <el-table-column label="漢化狀況" width="200">
        <template #default="scope">
          <div v-html="scope.row.t_batch_data_show"></div>
        </template>
      </el-table-column>

      <el-table-column label="網址" width="250">
        <template #default="scope">
          <div v-html="scope.row.url_data_show"></div>
        </template>
      </el-table-column>

      <el-table-column label="圖片" width="100">
        <template #default="scope">
          <div v-html="scope.row.pic_data_show"></div>
        </template>
      </el-table-column>

      <el-table-column label="更新時間" prop="upd_date_show" show-overflow-tooltip sortable />
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
  import axios from '@/utils/request2'

  export default {
    name: 'TranslationTeam',
    components: {
      TableEdit,
      UrlEdit,
    },
    filters: {},
    data() {
      return {
        url: 'http://localhost:5252/api/translation_team',
        url2: 'http://localhost:5252/api/translation_team_batch',
        url3: 'http://localhost:5252/api/product_website',
        url4: 'http://localhost:5252/api/product_pic',
        url_type: {
          url1: 'http://localhost:5252/api/translation_team_info',
          url2: 'http://localhost:5252/api/translation_team_type',
        },
        return_data: '',
        return_msg: '',
        return_success: '',
        imgShow: true,
        export_btn_show: false,

        list: [],
        list_type: {
          info: [],
          type: [],
        },
        UrlList: [],
        PicList: [],
        imageList: [],

        //時間選擇器
        pickerOptions: {
          shortcuts: [
            {
              text: '今天',
              onClick(picker) {
                picker.$emit('pick', [new Date(), new Date()])
              },
            },
            {
              text: '昨天',
              onClick(picker) {
                const date = new Date()
                date.setTime(date.getTime() - 3600 * 1000 * 24)
                picker.$emit('pick', [date, date])
              },
            },
            {
              text: '最近一周',
              onClick(picker) {
                const end = new Date()
                const start = new Date()
                start.setTime(start.getTime() - 3600 * 1000 * 24 * 7)
                picker.$emit('pick', [start, end])
              },
            },
            {
              text: '最近一個月',
              onClick(picker) {
                const end = new Date()
                const start = new Date()
                start.setTime(start.getTime() - 3600 * 1000 * 24 * 30)
                picker.$emit('pick', [start, end])
              },
            },
            {
              text: '最近三個月',
              onClick(picker) {
                const end = new Date()
                const start = new Date()
                start.setTime(start.getTime() - 3600 * 1000 * 24 * 90)
                picker.$emit('pick', [start, end])
              },
            },
            {
              text: '最後一次更新',
              async onClick(picker) {
                const end = new Date()
                let arg

                await axios
                  .get('http://localhost:5252/api/export_set_date/getlast')
                  .then((response) => (arg = response.data))
                  .catch(function (error) {
                    // 请求失败处理
                    console.log(error)
                  })
                const start = new Date(arg)

                picker.$emit('pick', [start, end])
              },
            },
          ],
        },

        lastDate: '',
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
          open_detail: false,
          upddate: '',
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
      handleQuery(type) {
        console.log('===methods handleQuery')
        this.queryForm.pageNo = 1

        if (type == 'recent') {
          if (this.queryForm.upddate == '' || this.queryForm.upddate == null || this.queryForm.upddate == undefined) {
            alert('請先選擇更新日期')
            return
          }
        }
        this.fetchData(type)
      },

      async getLastDate() {
        console.log('getLastDate')

        await axios
          .get('http://localhost:5252/api/export_set_date/getlast')
          .then((response) => (this.lastDate = response.data.message))
          .catch(function (error) {
            // 请求失败处理
            console.log(error)
          })

        return this.lastDate
      },

      // 展開所有摺疊的列
      expandAllRows() {
        if (this.queryForm.open_detail) {
          this.$nextTick(() => {
            this.list.forEach((row) => {
              this.$refs.mainTable.toggleRowExpansion(row, true)
            })
          })
        } else {
          this.$nextTick(() => {
            this.list.forEach((row) => {
              this.$refs.mainTable.toggleRowExpansion(row, false)
            })
          })
        }
      },

      async fetchData(type) {
        console.log('===methods fetchData')
        this.listLoading = true
        this.export_btn_show = false
        let ls_url

        if (type == 'recent') {
          ls_url = `${this.url}/mainpage_recent?`
        } else {
          ls_url = `${this.url}/mainpage?`
        }

        ls_url += `page=${this.queryForm.pageNo}&pageSize=${this.queryForm.pageSize}`

        if (this.queryForm.csearchword != '') {
          ls_url += `&c_search=${this.queryForm.csearchword}`
        }

        if (this.queryForm.psearchword != '') {
          ls_url += `&p_search=${this.queryForm.psearchword}`
        }

        if (this.queryForm.tsearchword != '') {
          ls_url += `&t_search=${this.queryForm.tsearchword}`
        }

        if (
          this.queryForm.type !== '' &&
          this.queryForm.type !== null &&
          this.queryForm.type !== undefined &&
          this.queryForm.type !== '%'
        ) {
          ls_url += `&type_id=${this.queryForm.type}`
        }

        //主資料
        if (type == 'recent') {
          await axios
            .get(ls_url)
            .then((response) => (this.list = response.data))
            .catch(function (error) {
              console.log(error)
            })

          this.total = this.list.length
        } else {
          //主資料
          await axios
            .get(ls_url)
            .then((response) => (this.return_data = response.data))
            .catch(function (error) {
              console.log(error)
            })

          this.total = this.return_data.totalRecords
          this.list = this.return_data.data
        }

        let ls_url3 = `${this.url3}/getformainpage`
        if (this.queryForm.psearchword != '') {
          ls_url3 += `?searchword=${this.queryForm.psearchword}`
        }

        //網址資料
        await axios
          .get(ls_url3)
          .then((response) => (this.UrlList = response.data))
          .catch(function (error) {
            console.log(error)
          })

        let ls_url4 = `${this.url4}/getformainpage`
        if (this.queryForm.psearchword != '') {
          ls_url4 += `?searchword=${this.queryForm.psearchword}`
        }

        //圖片資料
        await axios
          .get(ls_url4)
          .then((response) => (this.PicList = response.data))
          .catch(function (error) {
            console.log(error)
          })

        await this.generateData(type)

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

        this.timeOutID = setTimeout(() => {
          this.listLoading = false

          if (this.queryForm.open_detail == true) {
            this.expandAllRows()
          }
        }, 500)
      },
      async generateData(type) {
        console.log('generateData')

        for (let i = 0; i < this.list.length; i++) {
          //抓漢化、網址、圖片的最後更新日
          let upd_date_show = ''

          //發售日
          this.list[i]['sale_Date'] = this.filteredDate(this.list[i]['sale_Date'])

          //漢化狀況
          let tdata = this.list[i]['t_batch_data']
          let tdata_show = ''
          let tt_chk = []

          for (let j = 0; j < tdata.length; j++) {
            let tt = tdata[j]['tT_info']
            let tt_show = ''

            for (let k = 0; k < tt.length; k++) {
              tt_show += `${tt[k]['t_Name']}×`

              if (tt[k]['upd_date'] != '' && tt[k]['upd_date'] != null && tt[k]['upd_date'] != undefined) {
                upd_date_show = await this.getLaterDate(upd_date_show, tt[k]['upd_date'])
              }
            }
            tt_show = tt_show.substring(0, tt_show.length - 1)

            //一種只能出現一次
            if (tt_chk.indexOf(tdata[j]['type_id']) == -1) {
              tdata_show += `<span class="${this.filteredTTtype(tdata[j]['type_id'])}">${tdata[j]['type_Name']}</span>`
              tt_chk.push(tdata[j]['type_id'])
            }
          }
          this.list[i]['t_batch_data_show'] = tdata_show

          //網址
          let udata_show = ''
          for (let j = 0; j < this.UrlList.length; j++) {
            if (this.list[i]['p_id'] == this.UrlList[j]['p_id']) {
              let url_data = this.UrlList[j]['url_data']

              for (let k = 0; k < url_data.length; k++) {
                udata_show += `<a href="${url_data[k]['url']}" class="${this.filteredUrltype(url_data[k]['type_id'])}" target="_blank">${
                  url_data[k]['type_Name']
                }</a>`

                if (url_data[k]['upd_date'] != '' && url_data[k]['upd_date'] != null && url_data[k]['upd_date'] != undefined) {
                  upd_date_show = await this.getLaterDate(upd_date_show, url_data[k]['upd_date'])
                }
              }
            }
          }
          this.list[i]['url_data_show'] = udata_show

          //圖片
          let pdata_show = ''
          for (let j = 0; j < this.PicList.length; j++) {
            if (this.list[i]['p_id'] == this.PicList[j]['p_id']) {
              let pic_data = this.PicList[j]['pic_data']

              for (let k = 0; k < pic_data.length; k++) {
                pdata_show += `<a href="${pic_data[k]['url']}" class="${this.filteredPictype(pic_data[k]['type_id'])}" target="_blank">${
                  pic_data[k]['type_Name']
                }</a>`

                if (pic_data[k]['upd_date'] != '' && pic_data[k]['upd_date'] != null && pic_data[k]['upd_date'] != undefined) {
                  upd_date_show = await this.getLaterDate(upd_date_show, pic_data[k]['upd_date'])
                }
              }
            }
          }
          this.list[i]['pic_data_show'] = pdata_show

          //最後放入更新時間
          this.list[i]['upd_date_show'] = upd_date_show
        }

        if (type == 'recent') {
          const date_start = new Date(this.queryForm.upddate[0]) //起始日
          const date_end = new Date(this.queryForm.upddate[1]) //結束日

          date_end.setHours(23, 59, 59, 999) // 結束日設置為當天的 23:59:59.999

          // console.log(date_start)
          // console.log(date_end)

          for (let i = this.list.length - 1; i >= 0; i--) {
            const date = new Date(this.list[i]['upd_date_show'])

            if (date_start > date || date_end < date || this.list[i]['upd_date_show'] == '') {
              this.list.splice(i, 1) //移除此列
            }
          }

          this.total = this.list.length
          this.export_btn_show = true
        }
        console.log('generateData complete')
      },

      filteredDate(date) {
        // 轉成日期形式
        if (date.length == 8) {
          date = `${date.substring(0, 4)}-${date.substring(4, 6)}-${date.substring(6, 8)}`
        }
        return date
      },
      filteredTTtype(id) {
        if (id == 3) {
          //官方中文化
          return 'tag'
        } else if (id == 1) {
          //漢化完成
          return 'tag tag_success'
        } else if (id == 6) {
          //部分漢化
          return 'tag tag_warning'
        } else if (id == 8) {
          //雲翻漢化
          return 'tag tag_danger'
        } else {
          //其他
          return 'tag tag_info'
        }
      },
      filteredUrltype(id) {
        if (id == 'P01' || id == 'P06' || id == 'P07') {
          //DL推薦
          return 'tag'
        } else if (id == 'P02') {
          //遊戲官網
          return 'tag tag_success'
        } else if (id == 'P03' || id == 'P08' || id == 'P09' || id == 'P10') {
          //其他網址
          return 'tag tag_warning'
        } else if (id == 'P04' || id == 'P11') {
          //OP影片
          return 'tag tag_danger'
        } else {
          //其他
          return 'tag tag_info'
        }
      },
      filteredPictype(id) {
        if (id == 'P41') {
          //DL推薦
          return 'tag'
        }
        // else if (id == 'P02') {
        //   //遊戲官網
        //   return 'tag tag_success'
        // } else if (id == 'P03' || id == 'P08' || id == 'P09' || id == 'P10') {
        //   //其他網址
        //   return 'tag tag_warning'
        // } else if (id == 'P04' || id == 'P11') {
        //   //OP影片
        //   return 'tag tag_danger'
        // } else {
        //   //其他
        //   return 'tag tag_info'
        // }
      },
      getLaterDate(dateStr1, dateStr2) {
        const date1 = new Date(dateStr1)
        const date2 = new Date(dateStr2)
        return date1 > date2 ? dateStr1 : dateStr2
      },
      getCurrentDateTime() {
        const now = new Date()

        // 使用 String.prototype.padStart 確保單位數值補零
        const year = now.getFullYear()
        const month = String(now.getMonth() + 1).padStart(2, '0') // 月份從 0 開始
        const date = String(now.getDate()).padStart(2, '0')
        const hours = String(now.getHours()).padStart(2, '0')
        const minutes = String(now.getMinutes()).padStart(2, '0')
        const seconds = String(now.getSeconds()).padStart(2, '0')

        return `${year}${month}${date}${hours}${minutes}${seconds}`
      },
      async export_file() {
        console.log('export_file')

        await this.setTTdetail()
        await this.setUrldetail()
        await this.setPicdetail()

        console.log(this.list)

        let nowtime = await this.getCurrentDateTime()

        let data = JSON.parse(JSON.stringify(this.list)) //深拷貝
        let fileName = `更新表_${nowtime}.tsv`
        let text = ''

        //let title = "#,cid,gid,製作公司 (母),遊戲名稱,遊戲譯名,發售日,中文化團隊 / 漢化組,漢化進度,備註,DL推薦,官網,其他網址,影片,,預覽圖,picw,pich"; //表頭
        let title =
          '#\tcid\tgid\t製作公司 (母)\t遊戲名稱\t遊戲譯名\t發售日\t中文化團隊 / 漢化組\t漢化進度\t備註\tDL推薦\t官網\t其他網址\t影片\t\t預覽圖\tpicw\tpich' //表頭

        let content = '' //內容

        //let blank = ",,,,,,,,,,,,,,,,,"; //空白間隔
        //let newcell = ",";
        let blank = '\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t' //空白間隔
        let newcell = '\t'

        let newline = '\n' //換行符

        let lastid = ''
        let ls_error = ''

        //開始串接
        for (let i = 0; i < data.length; i++) {
          content += newcell
          content += `"${data[i].c_id}"${newcell}`
          content += `"${data[i].p_id}"${newcell}`
          content += `"${data[i].c_Name}"${newcell}`
          content += `"${data[i].p_Name}"${newcell}`
          content += `"${data[i].p_CName}"${newcell}`
          content += `"${data[i].sale_Date}"${newcell}`
          content += `"${data[i].t_team}"${newcell}`
          content += `"${data[i].t_type}"${newcell}`
          content += `"${data[i].remark}"${newcell}`
          content += `"${data[i].url1}"${newcell}`
          content += `"${data[i].url2}"${newcell}`
          content += `"${data[i].url3}"${newcell}`
          content += `"${data[i].url4}"${newcell}`
          content += `""${newcell}`
          content += `"${data[i].pic}"`
          content += newline

          if (
            data[i].c_Name.indexOf('"') != -1 ||
            data[i].p_Name.indexOf('"') != -1 ||
            data[i].p_CName.indexOf('"') != -1 ||
            data[i].t_team.indexOf('"') != -1 ||
            data[i].remark.indexOf('"') != -1
          ) {
            ls_error += `${data[i].c_Name} ${data[i].p_Name}\n`
          }

          lastid = data[i].c_id
        }
        content = content.substring(0, content.length - 2)

        //回報錯誤, 以利後續手動調整
        if (ls_error != '') {
          ls_error = ls_error.substring(0, ls_error.length - 2)
          this.$baseAlert(`偵測到雙引號: \n${ls_error}`)
        }

        text = title + newline + content

        this.saveTextAsFile(fileName, text)
      },

      async setTTdetail() {
        console.log('===setTTdetail')
        let list = this.list
        let t_batch_data = [] //漢化批次
        let tT_info = [] //漢化組訊息
        let ls_type = [],
          ls_type_word = [] //漢化進度
        let ls_remark = [] //備註
        let ls_tname = '',
          ls_tname1 = '',
          ls_tname2 = '',
          ls_ttype = '',
          ls_tremark = ''

        let ls_type_order = [3, 1, 6, 8, 4, 2, 7, 9, 10, 11, 5] //漢化類型排序顯示(左邊顯示優先度最高)

        for (let i = 0; i < list.length; i++) {
          t_batch_data = list[i]['t_batch_data']

          //拆解每個批次t_batch, 放入各自array
          for (let j = 0; j < t_batch_data.length; j++) {
            tT_info = t_batch_data[j]['tT_info']

            if (t_batch_data[j]['type_id'] == 3 || t_batch_data[j]['type_id'] == 4) {
              for (let l = 0; l < tT_info.length; l++) {
                ls_tname1 += `${tT_info[l]['t_Name']}×`
              }
              ls_tname1 = `${ls_tname1.substring(0, ls_tname1.length - 1)} / `
            } else {
              for (let m = 0; m < tT_info.length; m++) {
                ls_tname2 += `${tT_info[m]['t_Name']}×`
              }
              ls_tname2 = `${ls_tname2.substring(0, ls_tname2.length - 1)} / `
            }

            ls_type.push(t_batch_data[j]['type_id'])
            ls_type_word.push(t_batch_data[j]['type_Name'])

            if (t_batch_data[j]['remark'] != '' && t_batch_data[j]['remark'] != null && t_batch_data[j]['remark'] != undefined) {
              ls_remark.push(t_batch_data[j]['remark'])
            }
          }

          //漢化組t_team
          ls_tname1 = ls_tname1.substring(0, ls_tname1.length - 3)
          ls_tname2 = ls_tname2.substring(0, ls_tname2.length - 3)
          ls_tname = `${ls_tname1}\n${ls_tname2}`
          this.list[i].t_team = ls_tname.trim()
          ls_tname = ''
          ls_tname1 = ''
          ls_tname2 = '' //清空

          //漢化進度t_type
          for (let r = 0; r < ls_type_order.length; r++) {
            for (let n = 0; n < ls_type.length; n++) {
              if (ls_type_order[r] == ls_type[n]) {
                ls_ttype = ls_type_word[n]
                r = ls_type_order.length
                n = ls_type.length
              }
            }
          }
          this.list[i].t_type = ls_ttype
          ls_type = []
          ls_type_word = []
          ls_ttype = '' //清空

          //備註remark
          this.list[i].remark = ''
          if (ls_remark.length > 0) {
            for (let p = 0; p < ls_remark.length; p++) {
              ls_tremark += `${ls_remark[p]}；`
            }
            ls_tremark = ls_tremark.substring(0, ls_tremark.length - 1)
            this.list[i].remark = ls_tremark
          }
          ls_remark = []
          ls_tremark = '' //清空
        }
      },
      async setUrldetail() {
        console.log('===setUrldetail')
        let list = this.list
        let list_Url = this.UrlList
        let url_data = [] //網址清單

        for (let i = 0; i < list.length; i++) {
          for (let j = 0; j < list_Url.length; j++) {
            if (list[i]['p_id'] == list_Url[j]['p_id']) {
              url_data = list_Url[j]['url_data']

              this.list[i]['url1'] = ''
              this.list[i]['url2'] = ''
              this.list[i]['url3'] = ''
              this.list[i]['url4'] = ''

              for (let k = 0; k < url_data.length; k++) {
                if (url_data[k]['type_id'] == 'P01') {
                  this.list[i]['url1'] = url_data[k]['url']
                }
                if (url_data[k]['type_id'] == 'P02') {
                  this.list[i]['url2'] = url_data[k]['url']
                }
                if (url_data[k]['type_id'] == 'P03') {
                  this.list[i]['url3'] = url_data[k]['url']
                }
                if (url_data[k]['type_id'] == 'P04') {
                  this.list[i]['url4'] = url_data[k]['url']
                }
              }
            }
          }
        }
      },
      async setPicdetail() {
        console.log('===setPicdetail')
        let list = this.list
        let list_Pic = this.PicList
        let pic_data = [] //圖片清單

        for (var i = 0; i < list.length; i++) {
          for (var j = 0; j < list_Pic.length; j++) {
            if (list[i]['p_id'] == list_Pic[j]['p_id']) {
              pic_data = list_Pic[j]['pic_data']

              this.list[i]['pic'] = ''

              for (var k = 0; k < pic_data.length; k++) {
                if (pic_data[k]['type_id'] == 'P41') {
                  this.list[i]['pic'] = pic_data[k]['url']
                }
              }
            }
          }
        }
      },

      async saveTextAsFile(_fileName, _text) {
        var textFileAsBlob = new Blob([_text], { type: 'text/plain' })

        var downloadLink = document.createElement('a')
        downloadLink.download = _fileName
        downloadLink.innerHTML = 'Download File'
        if (window.webkitURL != null) {
          // Chrome allows the link to be clicked
          // without actually adding it to the DOM.
          downloadLink.href = window.webkitURL.createObjectURL(textFileAsBlob)
        } else {
          // Firefox requires the link to be added to the DOM
          // before it can be clicked.
          downloadLink.href = window.URL.createObjectURL(textFileAsBlob)
          downloadLink.onclick = destroyClickedElement
          downloadLink.style.display = 'none'
          document.body.appendChild(downloadLink)
        }

        downloadLink.click()
      },

      async destroyClickedElement(event) {
        document.body.removeChild(event.target)
      },
    },
  }
</script>

<style>
  .tag {
    background-color: #ecf5ff;
    border-color: #d9ecff;
    display: inline-block;
    /*height: 32px;*/
    /*padding: 0 10px;*/
    padding: 0 5px;
    /*line-height: 30px;*/
    font-size: 12px;
    color: #409eff;
    border-width: 1px;
    border-style: solid;
    border-radius: 4px;
    box-sizing: border-box;
    white-space: nowrap;
  }

  .tag.tag_success {
    background-color: #ecf8f3;
    border-color: #d9f1e6;
    color: #41b882;
  }

  .tag.tag_info {
    background-color: #f4f4f5;
    border-color: #e9e9eb;
    color: #909399;
  }

  .tag.tag_warning {
    background-color: #fff6e8;
    border-color: #ffeed1;
    color: #ffa91b;
  }

  .tag.tag_danger {
    background-color: #feedeb;
    border-color: #fddbd7;
    color: #f34d37;
  }

  .tag.tag_dark {
    background-color: #409eff;
    border-color: #409eff;
    color: white;
  }

  .tag.tag_success2 {
    background-color: #41b882;
    border-color: #41b882;
    color: white;
  }

  .tag.tag_info2 {
    background-color: #909399;
    border-color: #909399;
    color: white;
  }

  .tag.tag_warning2 {
    background-color: #ffa91b;
    border-color: #ffa91b;
    color: white;
  }

  .tag.tag_danger2 {
    background-color: #f34d37;
    border-color: #f34d37;
    color: white;
  }
</style>
