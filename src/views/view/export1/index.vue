<template>
  <div id="div_body">
    <vab-query-form>
      <vab-query-form-left-panel>
        <el-button type="primary" @click="export1">輸出</el-button>
      </vab-query-form-left-panel>
    </vab-query-form>

    <el-divider content-position="left">輸出</el-divider>
    <table id="table1" class="export">
      <tr>
        <td width="2%">#</td>
        <td width="10%">製作公司</td>
        <td width="15%">遊戲名稱</td>
        <td width="15%">遊戲譯名</td>
        <td width="5%">發售日</td>
        <td width="15%">中文化團隊 / 漢化組</td>
        <td width="5%">漢化進度</td>
        <td width="5%">備註</td>
        <td class="url_set">DL推薦</td>
        <td class="url_set">官網</td>
        <td class="url_set">其他網址</td>
        <td class="url_set">影片</td>
        <td class="url_set">預覽圖</td>
      </tr>
      <tr v-for="data in list" :key="data.p_id">
        <td></td>
        <td>{{ data.c_Name }}</td>
        <td>{{ data.p_Name }}</td>
        <td>{{ data.p_CName }}</td>
        <td>{{ filteredDate(data.sale_Date) }}</td>
        <td>{{ data.t_team }}</td>
        <td>{{ data.t_type }}</td>
        <td>{{ data.remark }}</td>
        <td class="url_set">{{ data.url1 }}</td>
        <td class="url_set">{{ data.url2 }}</td>
        <td class="url_set">{{ data.url3 }}</td>
        <td class="url_set">{{ data.url4 }}</td>
        <td class="url_set">{{ data.pic }}</td>
      </tr>
    </table>
  </div>
</template>

<script>
  export default {
    name: 'Export1',
    data() {
      return {
        url: 'http://localhost:5252/api/view/get1to4',
        url2: 'http://localhost:5252/api/view/get5to7',
        url3: 'http://localhost:5252/api/view/get8to11',
        url4: 'http://localhost:5252/api/view/get12to',
        return_msg: '',
        return_success: '',
        list: [],
        list_TT: [],
        list_Url: [],
        list_Pic: [],
        listLoading: true,
        total: 0,
        selectRows: '',
        elementLoadingText: '正在加載...',
        queryForm: {
          pageNo: 1,
          pageSize: 20,
          searchword: '',
        },
        timeOutID: null,
      }
    },
    computed: {},
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
      async export1() {
        console.log('===export1')

        //宣告物件
        var tempT = XLSX2.utils.table_to_sheet(document.querySelector('#table1'))

        //宣告轉出變數
        var tempArr = []
        var tempArrName = []

        //填入轉出變數
        tempArr.push(tempT)
        tempArrName.push('test')

        //輸出excel
        openDownloadDialog(sheet2blob(tempArr, tempArrName), 'export1.xlsx')
      },
      async fetchData() {
        console.log('===methods fetchData')
        this.listLoading = true

        let ls_url = `${this.url}`
        let ls_url2 = `${this.url2}`
        let ls_url3 = `${this.url3}`
        let ls_url4 = `${this.url4}`

        //主資料
        await axios
          .get(ls_url)
          .then((response) => (this.list = response.data))
          .catch(function (error) {
            console.log(error)
          })

        //漢化資料
        await axios
          .get(ls_url2)
          .then((response) => (this.list_TT = response.data))
          .catch(function (error) {
            console.log(error)
          })

        //網址資料
        await axios
          .get(ls_url3)
          .then((response) => (this.list_Url = response.data))
          .catch(function (error) {
            console.log(error)
          })

        //圖片資料
        await axios
          .get(ls_url4)
          .then((response) => (this.list_Pic = response.data))
          .catch(function (error) {
            console.log(error)
          })

        this.setTTdetail()
        this.setUrldetail()
        this.setPicdetail()

        this.timeOutID = setTimeout(() => {
          this.listLoading = false
        }, 500)
      },
      async setTTdetail() {
        console.log('===setTTdetail')
        let list = this.list
        let list_TT = this.list_TT
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

        for (var i = 0; i < list.length; i++) {
          for (var j = 0; j < list_TT.length; j++) {
            if (list[i]['p_id'] == list_TT[j]['p_id']) {
              t_batch_data = list_TT[j]['t_batch_data']

              //拆解每個批次t_batch, 放入各自array
              for (var k = 0; k < t_batch_data.length; k++) {
                tT_info = t_batch_data[k]['tT_info']

                if (t_batch_data[k]['type_id'] == 3 || t_batch_data[k]['type_id'] == 4) {
                  for (var l = 0; l < tT_info.length; l++) {
                    ls_tname1 += `${tT_info[l]['t_Name']}×`
                  }
                  ls_tname1 = `${ls_tname1.substring(0, ls_tname1.length - 1)} / `
                } else {
                  for (var m = 0; m < tT_info.length; m++) {
                    ls_tname2 += `${tT_info[m]['t_Name']}×`
                  }
                  ls_tname2 = `${ls_tname2.substring(0, ls_tname2.length - 1)} / `
                }

                ls_type.push(t_batch_data[k]['type_id'])
                ls_type_word.push(t_batch_data[k]['type_Name'])

                if (t_batch_data[k]['remark'] != '' && t_batch_data[k]['remark'] != null && t_batch_data[k]['remark'] != undefined) {
                  ls_remark.push(t_batch_data[k]['remark'])
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
              for (var r = 0; r < ls_type_order.length; r++) {
                for (var n = 0; n < ls_type.length; n++) {
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
              if (ls_remark.length > 0) {
                for (var p = 0; p < ls_remark.length; p++) {
                  ls_tremark += `${ls_remark[p]}；`
                }
                ls_tremark = ls_tremark.substring(0, ls_tremark.length - 1)
                this.list[i].remark = ls_tremark
              }
              ls_remark = []
              ls_tremark = '' //清空
            }
          }
        }
      },
      async setUrldetail() {
        console.log('===setUrldetail')
        let list = this.list
        let list_Url = this.list_Url
        let url_data = [] //網址清單

        for (var i = 0; i < list.length; i++) {
          for (var j = 0; j < list_Url.length; j++) {
            if (list[i]['p_id'] == list_Url[j]['p_id']) {
              url_data = list_Url[j]['url_data']

              for (var k = 0; k < url_data.length; k++) {
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
        let list_Pic = this.list_Pic
        let pic_data = [] //圖片清單

        for (var i = 0; i < list.length; i++) {
          for (var j = 0; j < list_Pic.length; j++) {
            if (list[i]['p_id'] == list_Pic[j]['p_id']) {
              pic_data = list_Pic[j]['pic_data']

              for (var k = 0; k < pic_data.length; k++) {
                if (pic_data[k]['type_id'] == 'P41') {
                  this.list[i]['pic'] = pic_data[k]['url']
                }
              }
            }
          }
        }
      },
      filteredDate(date) {
        // 轉成日期形式
        date = `${date.substring(0, 4)}-${date.substring(4, 6)}-${date.substring(6, 8)}`
        return date
      },
    },
  }
</script>

<style>
  #table1,
  #table1 > tr,
  #table1 > tr > td {
    border: 1px solid black;
    border-collapse: collapse;
  }

  #table1 > tr > td {
    white-space: pre-wrap;
  }

  #div_body {
    overflow: scroll;
    overflow-x: auto;
  }

  .url_set {
    max-width: 5%;
    word-break: break-all;
  }
</style>
