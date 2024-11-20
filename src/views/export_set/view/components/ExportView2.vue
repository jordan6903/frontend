<template>
  <el-dialog :title="title" :visible.sync="dialogFormVisible" width="1200px" @close="close">
    <el-button type="primary" @click="export_file">輸出</el-button>
    <el-divider content-position="left">輸出</el-divider>
    <div v-for="company in clist" :key="company.id">
      <hr />
      <a :href="company.url != '' ? company.url : '#'" style="font-size: 16px; font-weight: bold" target="_blank">
        {{ company.c_Name }} {{ company.c_Name_origin != '' ? '(' + company.c_Name_origin + ')' : '' }}
      </a>
      <br />
      <span>{{ company.c_Intro }}</span>
      <br />

      <div v-for="series in company.series_data" :key="series.id">
        <ul v-if="series.name == ''">
          <li v-for="product in series.p_data" :key="product.id">
            {{ product.p_Name }}
            {{ product.p_CName != '' ? ' / ' + product.p_CName : '' }}
            <span v-if="product.t_type != ''" :style="{ color: filteredColor(product.t_typeid) }">({{ product.t_type }})</span>
          </li>
        </ul>

        <ul v-if="series.name != ''">
          <li>{{ series.name }}</li>
          <ul>
            <li v-for="product in series.p_data" :key="product.id">
              {{ product.p_Name }}
              {{ product.p_CName != '' ? ' / ' + product.p_CName : '' }}
              <span v-if="product.t_type != ''" :style="{ color: filteredColor(product.t_typeid) }">({{ product.t_type }})</span>
            </li>
          </ul>
        </ul>
      </div>
      <br />

      <span v-if="company.c_Remark != ''">備註: {{ company.c_Remark }}</span>
    </div>
  </el-dialog>
</template>

<script>
  import { doEdit } from '@/api/table'

  export default {
    name: 'ExportView2',
    data() {
      return {
        export_batch: 0,
        url: 'http://localhost:5252/api/export_set_company/view',
        url2: 'http://localhost:5252/api/export_set_company/viewp',
        url3: 'http://localhost:5252/api/company_website',
        url4: 'http://localhost:5252/api/view/get5to7',

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
        this.title = '公司view'
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

        let Series_data, Product_data
        let ls_tmparray = []

        for (let i = 0; i < this.clist.length; i++) {
          //公司
          for (let j = 0; j < this.clist[i].series_data.length; j++) {
            //子分類

            //子分類跟遊戲比較
            for (let k = 0; k < this.plist.length; k++) {
              //匹配則放入子分類遊戲裡
              if (this.clist[i].series_data[j]['id'] == this.plist[k]['espS_id']) {
                ls_tmparray.push(this.plist[k])
              }
            }
            this.clist[i].series_data[j]['p_data'] = ls_tmparray
            ls_tmparray = [] //清空
          }
        }

        console.log(this.clist)
        console.log(this.list_Url)

        //塞入公司網址
        for (var i = 0; i < this.clist.length; i++) {
          for (var j = 0; j < this.list_Url.length; j++) {
            if (this.clist[i]['c_id'] == this.list_Url[j]['c_id']) {
              this.clist[i]['url'] = this.list_Url[j]['url']
            }
          }
        }
      },

      async fetchData() {
        console.log('fetchData')

        let ls_batch = this.export_batch
        console.log(ls_batch)

        let ls_url = `${this.url}/${ls_batch}?UseYN=Y`
        let ls_url2 = `${this.url2}/${ls_batch}`
        let ls_url3 = `${this.url3}?type_id=C01`
        let ls_url4 = `${this.url4}`
        console.log(ls_url)
        console.log(ls_url2)
        console.log(ls_url3)
        console.log(ls_url4)

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

        //網址資料
        await axios
          .get(ls_url3)
          .then((response) => (this.list_Url = response.data))
          .catch(function (error) {
            console.log(error)
          })

        //漢化資料
        await axios
          .get(ls_url4)
          .then((response) => (this.list_TT = response.data))
          .catch(function (error) {
            console.log(error)
          })

        await this.setTTdetail()
        await this.generateData()

        this.timeOutID = setTimeout(() => {
          this.listLoading = false
        }, 500)
      },

      async setTTdetail() {
        console.log('setTTdetail')
        let list = this.plist
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
          li_ttypeid = 0,
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
              this.plist[i].t_team = ls_tname.trim()
              ls_tname = ''
              ls_tname1 = ''
              ls_tname2 = '' //清空

              //漢化進度t_type
              for (var r = 0; r < ls_type_order.length; r++) {
                for (var n = 0; n < ls_type.length; n++) {
                  if (ls_type_order[r] == ls_type[n]) {
                    if (ls_type_order[r] == 1 || ls_type_order[r] == 3) {
                      ls_ttype = ''
                    } else {
                      ls_ttype = ls_type_word[n]
                    }
                    li_ttypeid = ls_type_order[r]

                    r = ls_type_order.length
                    n = ls_type.length
                    //break; break;
                  }
                }
              }
              this.plist[i].t_type = ls_ttype
              this.plist[i].t_typeid = li_ttypeid
              ls_type = []
              ls_type_word = []
              ls_ttype = '' //清空
              li_ttypeid = 0

              //備註remark
              if (ls_remark.length > 0) {
                for (var p = 0; p < ls_remark.length; p++) {
                  ls_tremark += `${ls_remark[p]}；`
                }
                ls_tremark = ls_tremark.substring(0, ls_tremark.length - 1)
                this.plist[i].remark = ls_tremark
              }
              ls_remark = []
              ls_tremark = '' //清空
            }
          }
        }

        console.log(this.plist)
      },
      filteredDate(date) {
        // 轉成日期形式
        date = `${date.substring(0, 4)}-${date.substring(4, 6)}-${date.substring(6, 8)}`
        return date
      },

      filteredColor(typeid) {
        let ls_color
        if (typeid == 6) {
          ls_color = '#3366ff'
        } else if (typeid == 8) {
          ls_color = '#ff6600'
        } else {
          ls_color = '#408080'
        }
        return ls_color
      },

      async export_file() {
        console.log('export_file')
        console.log(this.clist)

        let data = this.clist
        let fileName = '測試.txt'
        let text = '',
          title = '',
          content = '',
          remark = ''
        let ls_error = ''

        for (let i = 0; i < data.length; i++) {
          title = ''
          content = ''
          remark = ''

          //表頭
          title += `[hr][url=${data[i]['url']}][size=5][b]`
          title += data[i]['c_Name']
          if (data[i]['c_Name_origin'] != '') {
            title += `(${data[i]['c_Name_origin']})`
          }
          title += '[/b][/size][/url]\n'
          if (data[i]['c_Intro'] != '') {
            title += `${data[i]['c_Intro']}\n`
          }
          title += '\n'

          //內容
          let series = data[i]['series_data']

          for (let j = 0; j < series.length; j++) {
            let product = series[j]['p_data']

            if (series[j]['name'] == '') {
              content += '[ul]\n'

              for (let k = 0; k < product.length; k++) {
                content += '[li]'
                content += product[k]['p_Name']
                if (product[k]['p_CName'] != '') {
                  content += ` / ${product[k]['p_CName']}`
                }
                if (product[k]['t_type'] != '') {
                  content += ` [b][color=${this.filteredColor(product[k]['t_typeid'])}](${product[k]['t_type']})[/color][/b]`
                }
                content += '[/li]\n'
              }
              content += '[/ul]\n'
            } else {
              content += '[ul]\n'
              content += `[li]${series[j]['name']}[/li]\n`
              content += '[ul]\n'

              for (let k = 0; k < product.length; k++) {
                content += '[li]'
                content += product[k]['p_Name']
                if (product[k]['p_CName'] != '') {
                  content += ` / ${product[k]['p_CName']}`
                }
                if (product[k]['t_type'] != '') {
                  content += ` [b][color=${this.filteredColor(product[k]['t_typeid'])}](${product[k]['t_type']})[/color][/b]`
                }
                content += '[/li]\n'
              }
              content += '[/ul][/ul]\n'
            }
          }

          //備註
          if (data[i]['c_Remark'] != '') {
            remark += `\n備註: ${data[i]['c_Remark']}\n`
          }

          text += title + content + remark
        }

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

  li {
    list-style: disc;
  }
</style>
