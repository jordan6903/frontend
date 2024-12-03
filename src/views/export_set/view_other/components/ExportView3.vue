<template>
  <el-dialog :title="title" :visible.sync="dialogFormVisible" width="1200px" @close="close">
    <el-button type="primary" @click="export_file">輸出</el-button>
    <el-button type="primary" @click="export_file2">輸出目錄</el-button>
    <el-button type="primary" @click="export_file3">輸出JSON</el-button>
    <el-divider content-position="left">輸出</el-divider>
    <div v-for="company in clist" :key="company.id">
      <hr />
      <span style="font-size: 16px; font-weight: bold; color: #409eff">
        {{ company.name }}
      </span>
      <br />

      <div v-for="series in company.series_data" :key="series.id">
        <div v-if="series.add_word_Use_yn" style="white-space: pre-wrap">
          <br />
          {{ series.add_word }}
        </div>
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
    </div>
  </el-dialog>
</template>

<script>
  import { doEdit } from '@/api/table'
  import axios from '@/utils/request2'

  export default {
    name: 'ExportView3',
    data() {
      return {
        export_batch: 0,
        url: 'http://localhost:5252/api/export_set_other/view',
        url2: 'http://localhost:5252/api/export_set_other/viewp',
        url4: 'http://localhost:5252/api/view/get5to7',

        url5: 'http://localhost:5252/api/export_view_other/get1_1',
        url6: 'http://localhost:5252/api/export_view_other/get1_2',
        url7: 'http://localhost:5252/api/view/get5to7',
        url8: 'http://localhost:5252/api/view/get8to11',
        url9: 'http://localhost:5252/api/view/get12to',

        clist: [],
        plist: [],
        list_TT: [],
        list_Url: [],
        list_Pic: [],

        clist2: [],
        plist2: [],
        list_TT2: [],
        list_Url2: [],
        list_Pic2: [],

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
              if (this.clist[i].series_data[j]['id'] == this.plist[k]['esos_id']) {
                ls_tmparray.push(this.plist[k])
              }
            }
            this.clist[i].series_data[j]['p_data'] = ls_tmparray
            ls_tmparray = [] //清空
          }
        }

        console.log(this.clist)
      },

      async fetchData() {
        console.log('fetchData')

        let ls_batch = this.export_batch
        console.log(ls_batch)

        let ls_url = `${this.url}/${ls_batch}?UseYN=Y`
        let ls_url2 = `${this.url2}/${ls_batch}`
        let ls_url4 = `${this.url4}`
        console.log(ls_url)
        console.log(ls_url2)
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
        if (date.length == 8) {
          date = `${date.substring(0, 4)}-${date.substring(4, 6)}-${date.substring(6, 8)}`
        }
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
        let fileName = 'Blogger本體其他.txt'
        let text = '',
          title = '',
          content = ''
        let ls_error = ''

        for (let i = 0; i < data.length; i++) {
          title = ''
          content = ''

          //表頭
          title += `<hr><a id="c_other${data[i]['id']}_h" href="#"><h1>`
          title += data[i]['name']
          title += '</h1></a>'
          title += `<a class="b_pic" onclick="pic_vis('c_other${data[i]['id']}');this.style.display='none'"><div id="show_com_pic"><font size="2">展開細節</font></div></a><br><br>`
          title += '\n'

          //內容
          let series = data[i]['series_data']

          for (let j = 0; j < series.length; j++) {
            if (series[j]['add_word_Use_yn']) {
              content += `${series[j]['add_word']}\n`
            }

            if (series[j]['add_word_Use_yn']) {
              content += `<input type="hidden" class="c_other${data[i]['id']}_p" value="`
              content += `${series[j]['add_word']}`
              content += `"><p class="c_other${data[i]['id']}_p"></p>`
            }

            let product = series[j]['p_data']

            if (series[j]['name'] == '') {
              content += '<ul>\n'

              for (let k = 0; k < product.length; k++) {
                content += `<li><a id='${product[k]['p_id']}' class='show'>`
                content += `${product[k]['p_Name']}</a>`
                if (product[k]['p_CName'] != '') {
                  content += ` / ${product[k]['p_CName']}`
                }
                if (product[k]['t_type'] != '') {
                  content += `<font color="${this.filteredColor(product[k]['t_typeid'])}"><b>  (${product[k]['t_type']})</b></font>`
                }
                content += '</li>\n'
              }
              content += '</ul>\n'
            } else {
              content += '<ul>\n'
              content += `<li>${series[j]['name']}</li>\n`
              content += '<ul>\n'

              for (let k = 0; k < product.length; k++) {
                content += `<li><a id='${product[k]['p_id']}' class='show'>`
                content += `${product[k]['p_Name']}</a>`
                if (product[k]['p_CName'] != '') {
                  content += ` / ${product[k]['p_CName']}`
                }
                if (product[k]['t_type'] != '') {
                  content += `<font color="${this.filteredColor(product[k]['t_typeid'])}"><b>  (${product[k]['t_type']})</b></font>`
                }
                content += '</li>\n'
              }
              content += '</ul></ul>\n'
            }
          }

          text += title + content
        }

        this.saveTextAsFile(fileName, text)
      },

      async export_file2() {
        console.log('export_file2')
        console.log(this.clist)

        let data = this.clist
        let fileName = 'Blogger目錄其他.txt'
        let text = '',
          title = '',
          content = '',
          remark = ''
        let ls_error = '',
          ls_url1 = '',
          ls_url2 = ''
        let array = [],
          ls_tmp = ''

        //整理
        for (let i = 0; i < data.length; i++) {
          ls_tmp += `<a href="#c_other${data[i]['id']}_h"><font size="1">${data[i]['name']}</font></a><br>\n`
        }
        array.push(ls_tmp)
        ls_tmp = ''

        console.log(array)

        content += '<div id="g_index" class="g_index" style=" position:absolute; width: 256px ;"> \n'
        content +=
          '<a onclick="pic_all();this.style.display=\'none\'"><div id="show_all_pic"><font size="4">展開圖片與公司介紹</font></div></a>\n'
        content += '<table id="g_sindex" width="240px" bgcolor="white" style="display: \'none\';" align="center">\n'
        content += '<thead><th>\n'
        content += '<a onclick="pre_index()"><div class="pointer" style="float: left; margin-left: 10px;">❮</div></a>\n'
        content += '<font id="index_h" size="6" style="float:center; vertical-align: center;">A~D</font>\n'
        content += '<a onclick="next_index()"><div class="pointer" style="float: right; margin-right: 10px;">❯</div></a>\n'
        content += '</th></thead>\n'

        content += '<tr>\n'

        for (let i = 1; i <= array.length; i++) {
          if (i == 1) {
            content += `<td id="table${i}" style="text-align: left;display: block;">\n`
          } else {
            content += `<td id="table${i}" style="text-align: left;display: none;">\n`
          }

          content += array[i - 1]
          content += '</td>\n'
        }

        content += '</tr>\n'
        content += '</table>\n'
        content += '</div>\n'

        console.log(content)

        this.saveTextAsFile(fileName, content)
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

      async export_file3() {
        console.log('export_file3')
        await this.fetchData2()
        console.log(this.clist2)

        let data = this.clist2
        let fileName = 'BloggerJson檔其他.json'
        /*        let content = ''

        content += '{ "title": ['

        for(let i=0; i < data.length; i++){
          content += '{\n';
          content += '"gid": "' + this.setString(data[i]['p_id']) + '",\n';
          content += '"company": "' + this.setString(data[i]['c_Name']) + '",\n';
          content += '"name": "' + this.setString(data[i]['p_Name']) + '",\n';
          content += '"cname": "' + this.setString(data[i]['p_CName']) + '",\n';
          content += '"date": "' + this.setString(this.filteredDate(data[i]['sale_Date'])) + '",\n';
          content += '"fan": "' + this.setFanString(data[i]['t_team']) + '",\n';
          content += '"yn": "' + this.setString(data[i]['t_type']) + '",\n';
          content += '"other": "' + this.setString(data[i]['remark']) + '",\n';
          content += '"dlsite": "' + this.setString(data[i]['url1']) + '",\n';
          content += '"hpweb": "' + this.setString(data[i]['url2']) + '",\n';
          content += '"website": "' + this.setString(data[i]['url3']) + '",\n';
          content += '"trailer": "' + this.setString(data[i]['url4']) + '",\n';
          content += '"pic": "' + this.setString(data[i]['pic']) + '",\n';
          content += '"picw": "' + this.setString(data[i]['picw']) + '",\n';
          content += '"pich": "' + this.setString(data[i]['pich']) + '"\n';
          content += '},';
        }
        content = content.substring(0, content.length - 1);

        content += ']}'

        this.saveTextAsFile(fileName, content)
*/

        // 儲存所有內容
        const content = {
          title: data.map((item) => ({
            gid: this.setString(item.p_id),
            company: this.setString(item.c_Name),
            name: this.setString(item.p_Name),
            cname: this.setString(item.p_CName),
            date: this.setString(this.filteredDate(item.sale_Date)),
            fan: this.setFanString(item.t_team),
            yn: this.setString(item.t_type),
            other: this.setString(item.remark),
            dlsite: this.setString(item.url1),
            hpweb: this.setString(item.url2),
            website: this.setString(item.url3),
            trailer: this.setString(item.url4),
            pic: this.setString(item.pic),
            picw: this.setString(item.picw),
            pich: this.setString(item.pich),
          })),
        }

        // 將物件轉成 JSON 字串，會自動處理雙引號
        const jsonContent = JSON.stringify(content, null, 2)

        this.saveTextAsFile(fileName, jsonContent)
      },

      async generateData2() {
        console.log('generateData2')

        for (let i = 0; i < this.clist2.length; i++) {
          for (let j = 0; j < this.plist2.length; j++) {
            if (this.clist2[i]['esop_id'] == this.plist2[j]['esop_id']) {
              this.clist2[i]['p_id'] = this.plist2[j]['p_id']
              this.clist2[i]['p_Name'] = this.plist2[j]['p_Name']
              this.clist2[i]['p_CName'] = this.plist2[j]['p_CName']
              this.clist2[i]['sale_Date'] = this.plist2[j]['sale_Date']
            }
          }
        }
      },

      async fetchData2() {
        console.log('fetchData2')

        let ls_batch = this.export_batch

        let ls_url = `${this.url5}?id=${ls_batch}`
        let ls_url2 = `${this.url6}`
        let ls_url3 = `${this.url7}`
        let ls_url4 = `${this.url8}`
        let ls_url5 = `${this.url9}`

        //公司
        await axios
          .get(ls_url)
          .then((response) => (this.clist2 = response.data))
          .catch(function (error) {
            console.log(error)
          })

        //遊戲
        await axios
          .get(ls_url2)
          .then((response) => (this.plist2 = response.data))
          .catch(function (error) {
            console.log(error)
          })

        //漢化資料
        await axios
          .get(ls_url3)
          .then((response) => (this.list_TT2 = response.data))
          .catch(function (error) {
            console.log(error)
          })

        //網址資料
        await axios
          .get(ls_url4)
          .then((response) => (this.list_Url2 = response.data))
          .catch(function (error) {
            console.log(error)
          })

        //圖片資料
        await axios
          .get(ls_url5)
          .then((response) => (this.list_Pic2 = response.data))
          .catch(function (error) {
            console.log(error)
          })

        this.generateData2()
        this.setTTdetail2()
        this.setUrldetail2()
        this.setPicdetail2()

        this.timeOutID = setTimeout(() => {
          this.listLoading = false
        }, 500)
      },

      async setTTdetail2() {
        console.log('===setTTdetail2')
        let list = this.clist2
        let list_TT2 = this.list_TT2
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
          for (var j = 0; j < list_TT2.length; j++) {
            if (list[i]['p_id'] == list_TT2[j]['p_id']) {
              t_batch_data = list_TT2[j]['t_batch_data']

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
              this.clist2[i].t_team = ls_tname.trim()
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
              this.clist2[i].t_type = ls_ttype
              ls_type = []
              ls_type_word = []
              ls_ttype = '' //清空

              //備註remark
              if (ls_remark.length > 0) {
                for (var p = 0; p < ls_remark.length; p++) {
                  ls_tremark += `${ls_remark[p]}；`
                }
                ls_tremark = ls_tremark.substring(0, ls_tremark.length - 1)
                this.clist2[i].remark = ls_tremark
              }
              ls_remark = []
              ls_tremark = '' //清空
            }
          }
        }
      },
      async setUrldetail2() {
        console.log('===setUrldetail2')
        let list = this.clist2
        let list_Url2 = this.list_Url2
        let url_data = [] //網址清單

        for (var i = 0; i < list.length; i++) {
          for (var j = 0; j < list_Url2.length; j++) {
            if (list[i]['p_id'] == list_Url2[j]['p_id']) {
              url_data = list_Url2[j]['url_data']

              for (var k = 0; k < url_data.length; k++) {
                if (url_data[k]['type_id'] == 'P01') {
                  this.clist2[i]['url1'] = url_data[k]['url']
                }
                if (url_data[k]['type_id'] == 'P02') {
                  this.clist2[i]['url2'] = url_data[k]['url']
                }
                if (url_data[k]['type_id'] == 'P03') {
                  this.clist2[i]['url3'] = url_data[k]['url']
                }
                if (url_data[k]['type_id'] == 'P04') {
                  this.clist2[i]['url4'] = url_data[k]['url']
                }
              }
            }
          }
        }
      },
      async setPicdetail2() {
        console.log('===setPicdetail2')
        let list = this.clist2
        let list_Pic2 = this.list_Pic2
        let pic_data = [] //圖片清單

        for (var i = 0; i < list.length; i++) {
          for (var j = 0; j < list_Pic2.length; j++) {
            if (list[i]['p_id'] == list_Pic2[j]['p_id']) {
              pic_data = list_Pic2[j]['pic_data']

              for (var k = 0; k < pic_data.length; k++) {
                if (pic_data[k]['type_id'] == 'P41') {
                  this.clist2[i]['pic'] = pic_data[k]['url']
                  this.clist2[i]['picw'] = pic_data[k]['width']
                  this.clist2[i]['pich'] = pic_data[k]['height']
                }
              }
            }
          }
        }
      },

      setFanString(str) {
        if (str == '' || str == null || str == undefined) {
          return 'nan'
        } else {
          str = str.toString()
          str = str.replace('\n', ' / ')
          return str
        }
      },

      setString(str) {
        if (str == '' || str == null || str == undefined) {
          return 'nan'
        } else {
          str = str.toString()
          str = str.replace('\n', ' ')
          return str
        }
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
