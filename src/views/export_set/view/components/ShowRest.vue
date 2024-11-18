<template>
  <el-dialog :title="title" :visible.sync="dialogFormVisible" width="1200px" @close="close">
    <div class="div_out_out">
      <div v-show="titleInput_show" class="div_title_input">
        <el-col :span="1" style="height: 32px; display: flex; align-items: center; justify-content: center">
          <span style="font-size: 16px">標頭</span>
        </el-col>
        <el-col :span="16">
          <el-input v-model.number="esc.title" autocomplete="off" maxlength="100" type="text" />
        </el-col>
        <el-col :span="2" style="margin-left: 10px">
          <el-button type="primary" @click="notify_title_submit">存檔</el-button>
        </el-col>
      </div>

      <div class="div_out">
        <div class="div_middle2">
          <span>漢化相關遊戲總數: {{ count.product_all }}</span>
          <span>已編排總數: {{ count.esp_all + count.esop_all }}</span>
          <span>編排率: {{ (((count.esp_all + count.esop_all) * 100) / count.product_all).toFixed(2) }}%</span>
          <br />
          <span>官方中文化: {{ count.complete1 }}</span>
          <span>漢化完成: {{ count.complete2 }}</span>
          <span>部分漢化: {{ count.partcomplete }}</span>
          <span>雲翻漢化: {{ count.machine }}</span>
          <span>其他: {{ count.other }}</span>
        </div>

        <div class="div_float3">
          <div class="div_title">
            <span>漏掉的遊戲</span>
            <div>
              <el-tag class="tagbtn" @click="list_sort">排序</el-tag>
            </div>
          </div>
          <div v-show="series_btn_show" class="div_search_left">
            <el-tag class="tagbtn" effect="dark" @click="notify_series('add')">新增</el-tag>
            <el-tag class="tagbtn" effect="dark" @click="notify_series('update')">改名</el-tag>
            <el-tag class="tagbtn" effect="dark" @click="delete_series">刪除</el-tag>
          </div>
          <div class="div_item_group2">
            <div v-if="rest_product.length == 0" style="display: flex; justify-content: center"><span>查無遊戲</span></div>
            <div v-for="item in rest_product" :key="item.id" class="div_item2">
              <span tyle="color: #2448ff">{{ item.c_Name }}&nbsp;</span>
              {{ item.name }}
            </div>
          </div>
        </div>

        <div class="div_float3">
          <div class="div_title">
            <span>重複的遊戲</span>
            <div>
              <el-tag class="tagbtn" @click="selectClear">清空勾選</el-tag>
            </div>
          </div>
          <div class="div_search"></div>
          <div class="div_item_group2">
            <div class="div_item2">
              <div class="div_item_left">ESP自我比對</div>
              <div v-for="item in repeat_product.esp" :key="item" class="div_product_data">{{ item }}</div>
            </div>
            <div class="div_item2">
              <div class="div_item_left">ESOP自我比對</div>
              <div v-for="item in repeat_product.esop" :key="item" class="div_product_data">{{ item }}</div>
            </div>
            <div class="div_item2">
              <div class="div_item_left">交互比對</div>
              <div v-for="item in repeat_product.vs" :key="item.p_Name" class="div_product_data">{{ item.p_Name }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </el-dialog>
</template>

<script>
  import { doEdit } from '@/api/table'

  export default {
    name: 'ShowRest',
    data() {
      return {
        export_batch: 0,
        esc_id: 0,
        url: 'http://localhost:5252/api/product/getforother',
        url2: 'http://localhost:5252/api/export_set_product',
        url3: 'http://localhost:5252/api/export_set_other_product',

        esc: {}, //Export_set_Company資料
        esp: [], //Export_set_Product資料
        esop: [], //Export_set_Other_Product資料
        esp_all: [], //Export_set_Product資料
        esop_all: [], //Export_set_Product資料(全部)

        esp_all_TT: [],
        esop_all_TT: [],

        rest_product: [], //漏掉的遊戲
        repeat_product: {
          esp: [],
          esop: [],
          vs: [], //交叉比對
        }, //重複的遊戲

        //右側選單
        product: [], //公司旗下遊戲 原始資料(不動)
        product_all: [], //所有遊戲 原始資料(不動)
        item: [], //公司旗下遊戲 存取資料(更動)
        item_all: [], //所有遊戲 存取資料(更動)
        right_select: [],
        right_search: '',

        //左側選單
        slist: [], //子分類
        left_select_series: '', //選擇子分類
        left_select_product: [], //選擇遊戲

        //
        count: {
          product_all: 0,
          esp_all: 0,
          esop_all: 0,
          complete1: 0,
          complete2: 0,
          partcomplete: 0,
          machine: 0,
          other: 0,
        },

        //顯示與其他設定
        series_notify_show: false,
        series_notify_type: '',
        series_input_name: '',
        series_btn_show: false,
        esc_show: true,
        titleInput_show: false,
        allProduct_show: false,
        allProduct_other_show: false,

        detail_show: false,
        detail_show2: false,

        //中間插入sort
        insert_row: 0,

        params: '',
        return_msg: '',
        return_data: '',
        return_success: '',
        return_newseriesid: 0,

        //存檔用
        insert_form: [],
        update_form: [],

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
        this.title = '遊戲排序'
        this.export_batch = batch
        this.dialogFormVisible = true

        this.product = []
        this.item = []
        this.fetchData()
      },

      filteredDate(date) {
        // 轉成日期形式
        date = `${date.substring(0, 4)}-${date.substring(4, 6)}-${date.substring(6, 8)}`
        return date
      },

      async setSeriesName() {
        console.log('setSeriesName')
        let ls_tmpname = ''
        setTimeout(() => {}, 500)
        console.log(this.left_select_series)

        for (let i = 0; i < this.slist.length; i++) {
          if (this.left_select_series == this.slist[i]['esps_Id']) {
            ls_tmpname = this.slist[i]['name']
            break
          }
        }

        if (this.series_notify_show == true) {
          this.series_input_name = ls_tmpname
        }
      },

      //整理data
      async generateData() {
        console.log('generateData')

        this.rest_product = JSON.parse(JSON.stringify(this.product_all)) //深拷貝

        console.log(this.rest_product)
        console.log(this.esp_all)
        console.log(this.esop_all)

        //漏掉的遊戲
        for (let i = this.rest_product.length - 1; i >= 0; i--) {
          for (let j = 0; j < this.esp_all.length; j++) {
            if (this.rest_product[i]['p_id'] == this.esp_all[j]['p_id']) {
              this.rest_product.splice(i, 1)
              break
            }
          }
        }

        for (let i = this.rest_product.length - 1; i >= 0; i--) {
          for (let j = 0; j < this.esop_all.length; j++) {
            if (this.rest_product[i]['p_id'] == this.esop_all[j]['p_id']) {
              this.rest_product.splice(i, 1)
              break
            }
          }
        }

        let data1 = JSON.parse(JSON.stringify(this.esp_all))
        let data2 = JSON.parse(JSON.stringify(this.esop_all))

        //重複的遊戲
        const pidCount1 = {},
          pidCount2 = {}
        const duplicates1 = [],
          duplicates2 = []

        //esp自我檢查
        data1.forEach((item) => {
          const p_id = item.p_id
          pidCount1[p_id] = (pidCount1[p_id] || 0) + 1
        })

        data1.forEach((item) => {
          if (pidCount1[item.p_id] > 1) {
            duplicates1.push(item.p_Name)
          }
        })

        //esop自我檢查
        data2.forEach((item) => {
          const p_id = item.p_id
          pidCount2[p_id] = (pidCount2[p_id] || 0) + 1
        })

        data2.forEach((item) => {
          if (pidCount2[item.p_id] > 1) {
            duplicates2.push(item.p_Name)
          }
        })

        //esp跟esop交互檢查
        const pidInData2 = new Set(data2.map((item) => item.p_id))
        const duplicates = data1.filter((item) => pidInData2.has(item.p_id))

        this.repeat_product.esp = duplicates1
        this.repeat_product.esop = duplicates2
        this.repeat_product.vs = duplicates

        console.log(this.repeat_product.esp)
        console.log(this.repeat_product.esop)
        console.log(this.repeat_product.vs)
      },

      async generateDataTT() {
        console.log('generateDataTT')

        this.esp_all_TT = JSON.parse(JSON.stringify(this.esp_all)) //深拷貝
        this.esop_all_TT = JSON.parse(JSON.stringify(this.esop_all)) //深拷貝

        //官方中文化
        let data0_1 = this.esp_all_TT.filter((item) => item.tT_type.some((tt) => tt.type_id === 3))
        let data0_2 = this.esop_all_TT.filter((item) => item.tT_type.some((tt) => tt.type_id === 3))
        this.count.complete1 = data0_1.length + data0_2.length
        console.log('官方中文化')
        console.log(data0_1)
        console.log(data0_2)

        //漢化完成
        let data1_1 = this.esp_all_TT.filter((item) => item.tT_type.some((tt) => tt.type_id === 1 && tt.type_id !== 3))
        let data1_2 = this.esop_all_TT.filter((item) => item.tT_type.some((tt) => tt.type_id === 1 && tt.type_id !== 3))
        this.count.complete2 = data1_1.length + data1_2.length
        console.log('漢化完成')
        console.log(data1_1)
        console.log(data1_2)

        //部分漢化
        let data2_1 = this.esp_all_TT.filter((item) => item.tT_type.some((tt) => tt.type_id === 6 && tt.type_id !== 1 && tt.type_id !== 3))
        let data2_2 = this.esop_all_TT.filter((item) => item.tT_type.some((tt) => tt.type_id === 6 && tt.type_id !== 1 && tt.type_id !== 3))
        this.count.partcomplete = data2_1.length + data2_2.length
        console.log('部分漢化')
        console.log(data2_1)
        console.log(data2_2)

        //雲翻漢化
        let data3_1 = this.esp_all_TT.filter((item) =>
          item.tT_type.some((tt) => tt.type_id === 8 && tt.type_id !== 1 && tt.type_id !== 3 && tt.type_id !== 6)
        )
        let data3_2 = this.esop_all_TT.filter((item) =>
          item.tT_type.some((tt) => tt.type_id === 8 && tt.type_id !== 1 && tt.type_id !== 3 && tt.type_id !== 6)
        )
        this.count.machine = data3_1.length + data3_2.length
        console.log('雲翻漢化')
        console.log(data3_1)
        console.log(data3_2)

        //剩餘的其他資料
        let data4_1 = this.esp_all_TT.filter((item) =>
          item.tT_type.some((tt) => tt.type_id !== 1 && tt.type_id !== 3 && tt.type_id !== 6 && tt.type_id !== 8)
        )
        let data4_2 = this.esop_all_TT.filter((item) =>
          item.tT_type.some((tt) => tt.type_id !== 1 && tt.type_id !== 3 && tt.type_id !== 6 && tt.type_id !== 8)
        )
        console.log('剩餘的其他資料')
        console.log(data4_1)
        console.log(data4_2)
        this.count.other = data4_1.length + data4_2.length
      },

      //讀取api
      async fetchData() {
        console.log('fetchData')

        let ls_url = `${this.url}`
        let ls_url2 = `${this.url2}/getbybatch?id=${this.export_batch}`
        let ls_url3 = `${this.url3}/getbybatch?id=${this.export_batch}`

        //抓出所有跟漢化相關的遊戲
        await axios
          .get(ls_url)
          .then((response) => (this.product_all = response.data))
          .catch(function (error) {
            console.log(error)
          })

        //所有的ESP資料
        await axios
          .get(ls_url2)
          .then((response) => (this.esp_all = response.data))
          .catch(function (error) {
            console.log(error)
          })

        //所有的ESOP資料
        await axios
          .get(ls_url3)
          .then((response) => (this.esop_all = response.data))
          .catch(function (error) {
            console.log(error)
          })

        this.count.product_all = this.product_all.length
        this.count.esp_all = this.esp_all.length
        this.count.esop_all = this.esop_all.length

        this.generateData()
        this.generateDataTT()

        this.timeOutID = setTimeout(() => {
          this.listLoading = false
        }, 500)
      },
      clear() {
        console.log('clear')
        this.product = []
        this.item = []
        this.right_select = []
        this.left_select_series = []
        this.left_select_product = []

        this.insert_form = []
        this.update_form = []
        this.series_input_name = ''
        this.series_notify_show = false
        this.series_notify_type = ''
        //this.series_btn_show = false;
        this.left_select_series = ''
        this.esc_show = true
      },
      close() {
        console.log('===close')
        this.$emit('trigger-handleQuery')
      },
      show_detail() {
        console.log('show_company')
        if (this.detail_show) {
          this.detail_show = false
        } else {
          this.detail_show = true
        }
      },
      show_detail2() {
        console.log('show_detail2')
        if (this.detail_show2) {
          this.detail_show2 = false
        } else {
          this.detail_show2 = true
        }
      },
      selectAll() {
        this.right_select = []
        for (let i = 0; i < this.item.length; i++) {
          this.right_select.push(this.item[i]['p_id'])
        }
      },
      selectClear() {
        this.right_select = []
      },

      select_right() {
        console.log(this.right_select.length)
        if (this.right_select.length > 0) {
          this.series_btn_show = true
          this.esc_show = false
        } else {
          this.series_btn_show = false
          this.esc_show = true
        }
      },

      show_series_btn() {
        if (this.series_btn_show) {
          this.series_btn_show = false
          this.esc_show = true
        } else {
          this.series_btn_show = true
          this.esc_show = false
        }
      },

      show_allProduct() {
        console.log('show_allProduct')
        this.right_select = [] //清空選項
        if (this.allProduct_show) {
          this.allProduct_show = false
        } else {
          this.allProduct_show = true
        }
      },

      show_allProduct_other() {
        console.log('show_allProduct_other')
        if (this.allProduct_other_show) {
          this.allProduct_other_show = false
        } else {
          this.allProduct_other_show = true
        }
      },

      notify_series(type) {
        if (this.series_notify_show) {
          this.series_notify_show = false
        } else {
          this.series_notify_show = true
        }
        this.series_notify_type = type
      },

      notify_title() {
        if (this.titleInput_show) {
          this.titleInput_show = false
        } else {
          this.titleInput_show = true
        }
      },

      async notify_title_submit() {
        console.log('notify_title_submit')

        let ls_url = `${this.url}/${this.esc_id}`

        await axios
          .put(ls_url, this.esc)
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

        this.fetchData()
      },

      //重新排序
      list_sort() {
        console.log('list_sort')
        for (let i = 0; i < this.slist.length; i++) {
          let esps_id = this.slist[i]['esps_Id']
          this.slist[i].sort = i + 1

          if (this.slist[i]['product_data'].length > 0) {
            for (let j = 0; j < this.slist[i]['product_data'].length; j++) {
              this.slist[i]['product_data'][j].sort = j + 1
              this.slist[i]['product_data'][j]['esps_id'] = esps_id
            }
          }
        }
        this.save()

        setTimeout(() => {
          this.fetchData()
        }, 500)
      },

      //純排序不存檔
      list_sort_sub() {
        console.log('list_sort_sub')
        for (let i = 0; i < this.slist.length; i++) {
          this.slist[i].sort = i + 1
        }
      },

      //針對選擇的陣列做排序
      select_sort(index) {
        console.log('reset_select')
        if (index == 0) {
          alert(`查無子分類index: ${index}`)
          return
        }

        let array1 = this.left_select_product
        let array2 = []
        for (let i = 0; i < this.slist[index]['product_data'].length; i++) {
          for (var j = 0; j < this.left_select_product.length; j++) {
            if (this.left_select_product[j] == this.slist[index]['product_data'][i]['esp_id']) {
              array2.push(this.slist[index]['product_data'][i])
            }
          }
        }

        array2.sort((a, b) => a.sort - b.sort) //根據 sort 進行排序
        array1 = array2.map((item) => item.esp_id)

        this.left_select_product = array1
      },

      //騰出空間, 從start開始空出arg的空間
      list_make_space(start, arg) {
        console.log('list_make_space')
        for (let i = start - 1; i < this.slist.length; i++) {
          this.slist[i].sort = parseInt(i) + 1 + parseInt(arg)
        }
        this.save()
        this.fetchData()
      },

      //左側選單 根據輸入值移到指定位置
      list_sort_to() {
        console.log('list_sort_to')
        let li_arg = this.left_select_product.length //移動的總列數

        if (li_arg == 0) {
          alert('請選擇項目')
        } else if (this.insert_row == 0) {
          alert('請選擇插入值')
        } else {
          console.log('start')
          let li_select_index = 0
          let lb_break = false

          for (let i = 0; i < this.slist.length; i++) {
            for (let j = 0; j < this.slist[i]['product_data'].length; j++) {
              if (this.slist[i]['product_data'][j]['esc_id'] == this.left_select_product[0]) {
                li_select_index = i
                lb_break = true
                break
              }
            }
            if (lb_break) {
              break
            }
          }

          this.select_sort(li_select_index) //先做排序

          let li_insert_row = this.insert_row - 1

          console.log(this.left_select_series)

          let ls_tmplist = [] //暫存陣列
          let li_firstsort //勾選的第一個的index
          let li_lastsort //勾選的最後一個的index

          //抓出範圍index
          for (let i = this.slist.length - 1; i > -1; i--) {
            //順便記錄
            if (this.slist[i]['id'] == this.left_select_series[0]) {
              li_firstsort = i
            }

            if (this.slist[i]['id'] == this.left_select_series[this.left_select_series.length - 1]) {
              li_lastsort = i
            }
          }

          console.log(`li_firstsort: ${li_firstsort}`)
          console.log(`li_lastsort: ${li_lastsort}`)
          console.log(this.slist)

          //輸入值在指定範圍內
          if (li_insert_row >= li_firstsort && li_insert_row <= li_lastsort) {
            alert('插入值在選定範圍內, 請重新輸入')
          }
          //往上移
          else if (li_insert_row < li_firstsort) {
            //從後面開始抓, 先插入前面再刪掉後面
            for (let i = this.slist.length - 1; i > -1; i--) {
              for (let j = li_arg - 1; j > -1; j--) {
                if (this.slist[i]['id'] == this.left_select_series[j]) {
                  this.slist.splice(li_insert_row, 0, this.slist[i])
                  this.slist.splice(i + 1, 1) //刪除該元素
                }
              }
            }
          }
          //往下移
          else if (li_insert_row > li_lastsort) {
            //從前面開始抓, 先插入後面再刪掉前面
            for (let i = 0; i < this.list.length; i++) {
              for (let j = 0; j < li_arg; j++) {
                if (this.slist[i]['id'] == this.left_select_series[j]) {
                  this.slist.splice(li_insert_row, 0, this.slist[i])
                  this.slist.splice(i, 1) //刪除該元素
                }
              }
            }
          }
          this.list_sort()
          //this.save();
          //this.fetchData();
        }
      },

      //新增子分類
      async insert_series() {
        console.log('insert_series')

        let newarray = {
          ESC_id: this.esc_id,
          Name: this.series_input_name,
          Use_yn: true,
          Sort: this.slist.length + 1,
        }

        console.log(newarray)

        await axios
          .post(this.url2, newarray)
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
          setTimeout(() => {
            this.fetchData()
          }, 500)
        }
      },
      //更新子分類
      async update_series() {
        console.log('update_series')

        if (this.left_select_series == '') {
          alert('請先選擇子分類')
          return
        }

        let li_sort = 0,
          esps_id = 0
        let ls_url2 = `${this.url2}/${this.left_select_series}`

        for (let i = 0; i < this.slist.length; i++) {
          if (this.left_select_series == this.slist[i]['esps_Id']) {
            li_sort = this.slist[i]['sort']
            break
          }
        }

        let newarray = {
          ESC_id: this.esc_id,
          Name: this.series_input_name,
          Use_yn: true,
          Sort: li_sort,
        }

        console.log(newarray)

        await axios
          .put(ls_url2, newarray)
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
          setTimeout(() => {
            this.fetchData()
          }, 500)
        }
      },
      //刪除子分類
      async delete_series() {
        console.log('delete_series')

        if (this.left_select_series == '') {
          alert('請先選擇子分類')
          return
        }

        for (let i = 0; i < this.slist.length; i++) {
          if (this.slist[i]['esps_Id'] == this.left_select_series) {
            if (this.slist[i]['product_data'].length > 0) {
              this.$baseConfirm(
                '尚有遊戲在子分類裡, 是否要繼續?',
                null,
                () => {
                  console.log('是')
                  this.delete_series_submit()
                },
                () => {
                  console.log('否')
                  return false
                }
              )
            }
          }
        }
      },

      async delete_series_submit() {
        console.log('delete_series_submit')
        let ls_url2 = `${this.url2}/${this.left_select_series}`

        await axios
          .delete(ls_url2)
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
          setTimeout(() => {
            this.fetchData()
          }, 500)
        }
      },

      async save() {
        console.log('save')

        if (this.slist.length == 0) {
          alert('請先加入子分類再存檔')
        } else {
          console.log(this.slist)

          let ls_url = `${this.url2}/several`
          let ls_url4 = `${this.url4}/several`
          let newarray = []

          for (let i = 0; i < this.slist.length; i++) {
            this.update_form.push({
              esps_Id: this.slist[i]['esps_Id'],
              sort: this.slist[i]['sort'],
            })

            if (this.slist[i]['product_data'].length > 0) {
              for (let j = 0; j < this.slist[i]['product_data'].length; j++) {
                newarray.push({
                  esps_id: this.slist[i]['product_data'][j]['esps_id'],
                  esp_id: this.slist[i]['product_data'][j]['esp_id'],
                  sort: this.slist[i]['product_data'][j]['sort'],
                })
              }

              console.log(newarray)

              await axios
                .put(ls_url4, newarray)
                .then((response) => (this.return_msg = response.data.message))
                .catch(function (error) {
                  // 请求失败处理
                  console.log(error)
                })
            }
          }

          console.log(this.update_form)

          await axios
            .put(ls_url, this.update_form)
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

      async insert_product() {
        console.log('insert_product')

        if (this.right_select.length == 0) {
          alert('請先勾選右方遊戲')
          return false
        }

        if (this.slist.length > 0 && this.left_select_series.length == 0) {
          alert('請先選擇子分類')
          return false
        }

        if (this.slist.length == 0) {
          console.log('自動新增一筆空白子分類')

          let newarray = {
            ESC_id: this.esc_id,
            Name: '',
            Use_yn: true,
            Sort: 1,
          }

          console.log(newarray)

          await axios
            .post(this.url2, newarray)
            .then((response) => (this.return_data = response.data))
            .catch(function (error) {
              // 请求失败处理
              console.log(error)
            })

          this.left_select_series = this.return_data.id
        }

        let newarray = []
        let li_row = 0

        for (let i = 0; i < this.slist.length; i++) {
          if (this.slist[i]['esps_Id'] == this.left_select_series) {
            li_row = this.slist[i]['product_data'].length + 1
          }
        }

        let item

        if (!this.allProduct_show) {
          item = this.item
        } else {
          item = this.item_all
        }

        for (let i = 0; i < item.length; i++) {
          for (let j = 0; j < this.right_select.length; j++) {
            if (item[i]['p_id'] == this.right_select[j]) {
              newarray.push({
                esps_id: this.left_select_series,
                p_id: item[i]['p_id'],
                use_yn: true,
                sort: li_row,
              })
              li_row++
            }
          }
        }

        console.log(newarray)

        let ls_url4 = `${this.url4}/several`

        console.log(ls_url4)

        await axios
          .post(ls_url4, newarray)
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
          setTimeout(() => {
            this.fetchData()
          }, 500)
        }
      },

      async delete_product() {
        console.log('delete_product')

        if (this.left_select_product.length == 0) {
          alert('請選擇項目')
        } else {
          console.log(this.left_select_product)
          let msg_array,
            lb_chk = false

          for (let i = 0; i < this.left_select_product.length; i++) {
            let ls_url = this.url4
            ls_url += `/${this.left_select_product[i]}`
            console.log(ls_url)

            await axios
              .delete(ls_url)
              .then((response) => (this.return_msg = response.data.message))
              .catch(function (error) {
                // 请求失败处理
                console.log(error)
              })

            msg_array = this.return_msg.split('#')
            this.return_success = msg_array[0]
            this.return_msg = msg_array[1]

            if (this.return_success == 'Y') {
              lb_chk = true
            } else {
              this.$baseMessage(this.return_msg, 'success')
              break
            }
          }
          this.clear()
          this.fetchData()
        }
      },

      //拖曳相關--str---↓↓--
      allowDrop(e) {
        //取消默認行為
        e.preventDefault()
      },
      dragStart(e, index, type, seriesIndex = null) {
        //拖曳開始
        e.dataTransfer.setData('Text', JSON.stringify({ index, type, seriesIndex }))
      },
      SeriesDrop(e, listIndex) {
        //"子分類"放置
        this.allowDrop(e)
        const data = JSON.parse(e.dataTransfer.getData('Text'))
        const { index, type, seriesIndex } = data

        if (type === 'Series') {
          //子分類與子分類換
          let arr = this.slist.concat([])
          let temp = arr.splice(index, 1)
          arr.splice(listIndex, 0, temp[0])
          this.slist = arr
          this.updateSort() // 更新排序
        } else if (type === 'Product') {
          //小節與章節換
          const sourceSeries = this.slist[seriesIndex]
          const movedResource = sourceSeries.product_data.splice(index, 1)[0]
          const targetSeries = this.slist[listIndex]
          targetSeries.product_data.splice(0, 0, movedResource)
          this.updateSort()
        }
      },
      ProductDrop(e, targetIndex, targetType, targetseriesIndex = null) {
        //"小節"放置
        this.allowDrop(e)
        const data = JSON.parse(e.dataTransfer.getData('Text'))
        const { index, type, seriesIndex } = data
        if (type === 'Product') {
          // 處理小節拖曳
          const sourceSeries = this.slist[seriesIndex]
          const movedResource = sourceSeries.product_data.splice(index, 1)[0]
          const targetSeries = this.slist[targetseriesIndex]
          targetSeries.product_data.splice(targetIndex, 0, movedResource)
        }
        this.updateSort() // 更新排序
      },
      updateSort() {
        // 更新排序
        this.slist.forEach((Series, seriesIndex) => {
          Series.sort = seriesIndex + 1
          Series.product_data.forEach((resource, resourceIndex) => {
            resource.sort = resourceIndex + 1
          })
        })
        this.list_sort()
      },
      dragEnd() {
        //放置結束
        console.log('dragEnd')
      },
      //拖曳相關--end---↑↑--
    },
  }
</script>

<style>
  .div_out {
    display: flex;
    flex-direction: row;
  }

  .div_out_out {
    display: flex;
    flex-direction: column;
  }

  .div_title_input {
    margin-bottom: 30px;
  }

  .div_float3 {
    height: 600px;
    width: 400px;
    background: whitesmoke;
    border-radius: 8px;
    border: 1px #c0c4cc solid;
  }

  .div_middle2 {
    height: 500px;
    width: 300px;
    font-size: 20px;
    display: flex;
    flex-direction: column;
    flex-wrap: nowrap;
    justify-content: flex-start;
  }

  .div_arrow {
    margin-bottom: 20px;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .div_title {
    font-size: 16px;
    color: white;
    background: grey;
    padding: 8px;
    border-radius: 4px 4px 0px 0px;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .div_search_left {
    height: 20px;
    padding: 8px;
    display: flex;
    align-items: center;
    position: relative;
    justify-content: flex-end;
  }

  .div_search {
    height: 20px;
    padding: 8px;
    display: flex;
    align-items: center;
    position: relative;
  }

  .div_item_left {
    background: #00ff0024;
    padding: 5px 0px 5px 10px;
  }

  .div_item_group2 {
    overflow: auto;
    height: 520px;
  }

  .div_item2 {
    /*
  padding-top: 5px;
  padding-bottom: 5px;
  */
  }

  .div_item_right {
    white-space: nowrap;
    padding-top: 5px;
    padding-left: 10px;
    padding-bottom: 5px;
  }

  .arrow {
    margin: 2px;
  }

  .checkbox {
    margin-right: 8px;
  }

  .input_search {
    width: 100%;
    border-radius: 4px;
    border: 1px grey solid;
    padding-left: 20px;
  }

  .input_search_icon {
    position: absolute;
    left: 6px;
    top: -2px;
    color: #c0c4cc;
  }

  .tagbtn {
    cursor: pointer;
  }

  .div_product_data {
    white-space: nowrap;
    overflow: hidden;
    background: white;
    padding: 5px 0px 5px 10px;
  }
</style>
