<template>
  <el-dialog :title="title" :visible.sync="dialogFormVisible" width="1200px" @close="close">
    <el-button type="primary" @click="export_file">輸出</el-button>
    <el-divider content-position="left">輸出</el-divider>
    <table id="table1" class="export">
      <tr>
        <th width="2%">#</th>
        <th width="10%">製作公司</th>
        <th width="15%">遊戲名稱</th>
        <th width="15%">遊戲譯名</th>
        <th width="5%">發售日</th>
        <th width="15%">中文化團隊 / 漢化組</th>
        <th width="5%">漢化進度</th>
        <th width="5%">備註</th>
        <th class="url_set">DL推薦</th>
        <th class="url_set">官網</th>
        <th class="url_set">其他網址</th>
        <th class="url_set">影片</th>
        <th class="url_set">預覽圖</th>
      </tr>
      <tr v-for="data in clist" :key="data.esop_id">
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
  </el-dialog>
</template>

<script>
  import { doEdit } from '@/api/table'

  export default {
    name: 'ExportView',
    data() {
      return {
        export_batch: 0,
        url: 'http://localhost:5252/api/export_view_other/get1_1',
        url2: 'http://localhost:5252/api/export_view_other/get1_2',
        url3: 'http://localhost:5252/api/view/get5to7',
        url4: 'http://localhost:5252/api/view/get8to11',
        url5: 'http://localhost:5252/api/view/get12to',

        clist: [],
        plist: [],
        list_TT: [],
        list_Url: [],
        list_Pic: [],

        params: '',
        return_msg: '',
        return_success: '',

        form_type: [],
        title: '',
        dialogFormVisible: false,
      }
    },
    computed: {},
    created() {
      console.log('created')
    },
    methods: {
      showEdit(batch) {
        console.log('===showEdit')
        console.log(batch)
        this.title = '其他view'
        this.export_batch = batch
        this.dialogFormVisible = true

        this.clist = []
        this.plist = []
        this.fetchData()
      },
      close() {
        console.log('===close')
        this.$emit('trigger-handleQuery')
      },

      async generateData() {
        console.log('generateData')

        for (let i = 0; i < this.clist.length; i++) {
          for (let j = 0; j < this.plist.length; j++) {
            if (this.clist[i]['esop_id'] == this.plist[j]['esop_id']) {
              this.clist[i]['p_id'] = this.plist[j]['p_id']
              this.clist[i]['p_Name'] = this.plist[j]['p_Name']
              this.clist[i]['p_CName'] = this.plist[j]['p_CName']
              this.clist[i]['sale_Date'] = this.plist[j]['sale_Date']
            }
          }
        }
      },

      async fetchData() {
        console.log('fetchData')

        let ls_batch = this.export_batch

        let ls_url = `${this.url}?id=${ls_batch}`
        let ls_url2 = `${this.url2}`
        let ls_url3 = `${this.url3}`
        let ls_url4 = `${this.url4}`
        let ls_url5 = `${this.url5}`

        //公司
        await axios
          .get(ls_url)
          .then((response) => (this.clist = response.data))
          .catch(function (error) {
            console.log(error)
          })

        //遊戲
        await axios
          .get(ls_url2)
          .then((response) => (this.plist = response.data))
          .catch(function (error) {
            console.log(error)
          })

        //漢化資料
        await axios
          .get(ls_url3)
          .then((response) => (this.list_TT = response.data))
          .catch(function (error) {
            console.log(error)
          })

        //網址資料
        await axios
          .get(ls_url4)
          .then((response) => (this.list_Url = response.data))
          .catch(function (error) {
            console.log(error)
          })

        //圖片資料
        await axios
          .get(ls_url5)
          .then((response) => (this.list_Pic = response.data))
          .catch(function (error) {
            console.log(error)
          })

        this.generateData()
        this.setTTdetail()
        this.setUrldetail()
        this.setPicdetail()

        this.timeOutID = setTimeout(() => {
          this.listLoading = false
        }, 500)
      },

      async setTTdetail() {
        console.log('===setTTdetail')
        let list = this.clist
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
              this.clist[i].t_team = ls_tname.trim()
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
              this.clist[i].t_type = ls_ttype
              ls_type = []
              ls_type_word = []
              ls_ttype = '' //清空

              //備註remark
              if (ls_remark.length > 0) {
                for (var p = 0; p < ls_remark.length; p++) {
                  ls_tremark += `${ls_remark[p]}；`
                }
                ls_tremark = ls_tremark.substring(0, ls_tremark.length - 1)
                this.clist[i].remark = ls_tremark
              }
              ls_remark = []
              ls_tremark = '' //清空
            }
          }
        }
      },
      async setUrldetail() {
        console.log('===setUrldetail')
        let list = this.clist
        let list_Url = this.list_Url
        let url_data = [] //網址清單

        for (var i = 0; i < list.length; i++) {
          for (var j = 0; j < list_Url.length; j++) {
            if (list[i]['p_id'] == list_Url[j]['p_id']) {
              url_data = list_Url[j]['url_data']

              for (var k = 0; k < url_data.length; k++) {
                if (url_data[k]['type_id'] == 'P01') {
                  this.clist[i]['url1'] = url_data[k]['url']
                }
                if (url_data[k]['type_id'] == 'P02') {
                  this.clist[i]['url2'] = url_data[k]['url']
                }
                if (url_data[k]['type_id'] == 'P03') {
                  this.clist[i]['url3'] = url_data[k]['url']
                }
                if (url_data[k]['type_id'] == 'P04') {
                  this.clist[i]['url4'] = url_data[k]['url']
                }
              }
            }
          }
        }
      },
      async setPicdetail() {
        console.log('===setPicdetail')
        let list = this.clist
        let list_Pic = this.list_Pic
        let pic_data = [] //圖片清單

        for (var i = 0; i < list.length; i++) {
          for (var j = 0; j < list_Pic.length; j++) {
            if (list[i]['p_id'] == list_Pic[j]['p_id']) {
              pic_data = list_Pic[j]['pic_data']

              for (var k = 0; k < pic_data.length; k++) {
                if (pic_data[k]['type_id'] == 'P41') {
                  this.clist[i]['pic'] = pic_data[k]['url']
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

      async save() {
        console.log('save')

        if (this.list.length == 0) {
          alert('請先加入公司再存檔')
        } else {
          console.log(this.list)

          for (let i = 0; i < this.list.length; i++) {
            this.update_form.push({
              id: this.list[i]['id'],
              sort: this.list[i]['sort'],
            })
          }

          console.log(this.update_form)

          await axios
            .put(this.url3, this.update_form)
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

          //成功就重新讀取
          if (this.return_success == 'Y') {
            this.clear()
            //this.fetchData();
            //this.dialogFormVisible = false;
          }
        }
      },

      async export_file() {
        console.log('export_file')
        console.log(this.clist)

        let data = this.clist
        let fileName = '測試.tsv'
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

        let lastid = '',
          lastesosid = ''
        let ls_error = ''

        //開始串接
        for (let i = 0; i < data.length; i++) {
          if (lastid != data[i].id) {
            content += blank + newline
            content += blank + newline
          }

          if (lastesosid != data[i].esos_id) {
            content += blank + newline
          }

          content += newcell
          content += `"${data[i].c_id}"${newcell}`
          content += `"${data[i].p_id}"${newcell}`
          content += `"${data[i].c_Name}"${newcell}`
          content += `"${data[i].p_Name}"${newcell}`
          content += `"${data[i].p_CName}"${newcell}`
          content += `"${this.filteredDate(data[i].sale_Date)}"${newcell}`
          content += `"${data[i].t_team}"${newcell}`
          content += `"${data[i].t_type}"${newcell}`
          content += `"${data[i].remark}"${newcell}`
          content += `"${data[i].url1}"${newcell}`
          content += `"${data[i].url2}"${newcell}`
          content += `"${data[i].url3}"${newcell}`
          content += `"${data[i].url4}"${newcell}`
          content += `"${data[i].pic}"`
          content += newline

          if (
            data[i].c_Name.indexOf('"') != -1 ||
            data[i].p_Name.indexOf('"') != -1 ||
            data[i].p_CName.indexOf('"') != -1 ||
            data[i].t_team.indexOf('"') != -1 ||
            data[i].remark.indexOf('"') != -1
          ) {
            ls_error += `${data[i].c_id} ${data[i].p_Name}\n`
          }

          lastid = data[i].id
          lastesosid = data[i].esos_id
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
  #table1,
  #table1 > tr,
  #table1 > tr > td,
  #table1 > tr > th {
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
