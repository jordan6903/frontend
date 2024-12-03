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
        <div class="div_float2">
          <div class="div_title">
            <span>存入遊戲</span>
            <div>
              <el-tag class="tagbtn" effect="dark" @click="notify_title">修改標頭</el-tag>
              <el-tag class="tagbtn" @click="set_drag">{{ draggable ? '關閉拖曳' : '開啟拖曳' }}</el-tag>
              <el-tag class="tagbtn" @click="show_detail2">顯示細節</el-tag>
              <el-tag class="tagbtn" @click="show_series_btn">子分類</el-tag>
              <el-tag class="tagbtn" @click="fetchData">重整</el-tag>
              <el-tag class="tagbtn" @click="show_sort_btn">排序</el-tag>
            </div>
          </div>
          <div v-show="detail_btn_show" class="div_search_left">
            <el-tag class="tagbtn" effect="dark" @click="show_doujin2">同人</el-tag>
            <el-tag class="tagbtn" effect="dark" @click="show_TT2">漢化</el-tag>
            <el-tag class="tagbtn" effect="dark" @click="show_company2">公司</el-tag>
            <el-tag class="tagbtn" effect="dark" @click="show_saleDate2">發售日</el-tag>
          </div>
          <div v-show="series_btn_show" class="div_search_left">
            <el-tag class="tagbtn" effect="dark" @click="notify_series('add')">新增</el-tag>
            <el-tag class="tagbtn" effect="dark" @click="notify_series('update')">改名</el-tag>
            <el-tag class="tagbtn" effect="dark" @click="delete_series">刪除</el-tag>
          </div>
          <div v-show="sort_btn_show" class="div_search_left">
            <el-tag class="tagbtn" @click="list_sort">一般排序</el-tag>
            <el-tag class="tagbtn" @click="list_sort2">公司>時間排序</el-tag>
          </div>
          <div class="div_item_group2">
            <div v-for="(series, sindex) in slist" :key="series.esps_Id" class="div_item2">
              <div
                class="div_item_left"
                :draggable="draggable"
                @dragend="dragEnd"
                @dragover="allowDrop"
                @dragstart="dragStart($event, sindex, 'Series')"
                @drop="SeriesDrop($event, sindex)"
              >
                <input
                  v-show="series_btn_show || series_btn_show2"
                  v-model="left_select_series"
                  class="checkbox"
                  name="list"
                  type="radio"
                  :value="series.esps_Id"
                  @change="setSeriesName"
                />
                <label :for="series.esps_Id">{{ series.sort }} - {{ series.name }}</label>
              </div>

              <div
                v-for="(product, pindex) in series.product_data"
                v-show="esc_show"
                :key="product.esp_id"
                class="div_product_data"
                :draggable="draggable"
                @dragend="dragEnd"
                @dragover="allowDrop"
                @dragstart="dragStart($event, pindex, 'Product', sindex)"
                @drop="ProductDrop($event, pindex, 'Product', sindex)"
              >
                <input v-model="left_select_product" class="checkbox" name="list" type="checkbox" :value="product.esp_id" />
                <label :for="product.esp_Id" :title="product.p_Name">
                  <span v-if="product.eso_chk" style="color: red">(其他已有)&nbsp;</span>
                  <span v-if="saleDate_show2" style="color: darkred">{{ filteredDate(product.sale_Date) }}&nbsp;</span>
                  <span v-if="company_show2" style="color: #2448ff">{{ product.c_Name }}&nbsp;</span>
                  <div v-if="TT_show2" class="TT_div">
                    <el-tag
                      v-for="(tt, index) in product.tT_type"
                      :key="`${product.id}-${tt.type_id}-${index}`"
                      :type="filteredTTtype(tt.type_id)"
                    >
                      {{ tt.type_Name }}
                    </el-tag>
                  </div>
                  <div v-if="doujin_show2" class="TT_div">
                    <el-tag :type="filteredDoujintype(product.p_id.substring(0, 1))">
                      {{ product.p_id.substring(0, 1) == 'B' ? '同人' : '商業' }}
                    </el-tag>
                  </div>
                  {{ product.sort }} - {{ product.p_Name }}
                </label>
              </div>
            </div>

            <div v-show="series_notify_show" class="div_item2 div_item_left">
              <input v-model="series_input_name" type="text" />
              <el-tag v-show="series_notify_type == 'add'" class="tagbtn" type="danger" @click="insert_series">新增</el-tag>
              <el-tag v-show="series_notify_type == 'update'" class="tagbtn" type="danger" @click="update_series">更新</el-tag>
            </div>
          </div>
        </div>

        <div class="div_middle">
          <div class="div_arrow">
            <div class="arrow">
              <button class="el-button el-button--primary" type="button" @click="insert_product">
                <span><i class="el-icon-arrow-left"></i></span>
              </button>
            </div>
            <div class="arrow">
              <button class="el-button el-button--primary" type="button" @click="delete_product">
                <span><i class="el-icon-arrow-right"></i></span>
              </button>
            </div>
          </div>
        </div>

        <div class="div_float2">
          <div class="div_title">
            <span>選擇遊戲</span>
            <div>
              <el-tag class="tagbtn" @click="show_update">{{ update_show ? '顯示全部' : '只列出更新' }}</el-tag>
              <el-tooltip placement="top">
                <div slot="content">
                  <a @click="show_allProduct_other">隱藏其他已有標籤</a>
                </div>
                <el-tag class="tagbtn" @click="show_allProduct">其他列表</el-tag>
              </el-tooltip>

              <el-tooltip placement="top">
                <div slot="content">
                  <a @click="doujin_show_modify('')">顯示全部</a>
                  |
                  <a @click="doujin_show_modify('A')">只顯示商業作</a>
                  |
                  <a @click="doujin_show_modify('B')">只顯示同人作</a>
                </div>
                <el-tag class="tagbtn" @click="show_doujin">同人</el-tag>
              </el-tooltip>
              <el-tooltip placement="top">
                <div slot="content">
                  <a @click="TT_show_modify(0)">顯示全部</a>
                  |
                  <a @click="TT_show_modify(1)">只顯示已漢化</a>
                </div>
                <el-tag class="tagbtn" @click="show_TT">漢化</el-tag>
              </el-tooltip>

              <el-tag class="tagbtn" @click="show_detail">細節</el-tag>
              <el-tag class="tagbtn" @click="selectAll">全選</el-tag>
              <el-tag class="tagbtn" @click="selectClear">清空</el-tag>
            </div>
          </div>
          <div class="div_search">
            <input v-model="right_search" autocomplete="off" class="input_search" placeholder="請輸入代號或遊戲名稱" type="text" />
            <span class="input_search_icon"><i class="el-input__icon el-icon-search"></i></span>
          </div>
          <div class="div_item_group2">
            <div v-for="product in filterItem" :key="product.p_id" class="div_item_right">
              <input v-model="right_select" class="checkbox" name="list" type="checkbox" :value="product.p_id" />
              <label :for="product.p_id" :title="product.name">
                <span v-if="product.eso_chk" style="color: red">(其他已有)</span>
                <span v-if="detail_show" style="color: darkred">{{ filteredDate(product.sale_date) }}&nbsp;</span>
                <span v-if="detail_show" style="color: #2448ff">{{ product.company_name }}&nbsp;</span>
                <div v-if="TT_show" class="TT_div">
                  <el-tag
                    v-for="(tt, index) in product.tT_type"
                    :key="`${product.id}-${tt.type_id}-${index}`"
                    :type="filteredTTtype(tt.type_id)"
                  >
                    {{ tt.type_Name }}
                  </el-tag>
                </div>
                <div v-if="doujin_show" class="TT_div">
                  <el-tag :type="filteredDoujintype(product.p_id.substring(0, 1))">
                    {{ product.p_id.substring(0, 1) == 'B' ? '同人' : '商業' }}
                  </el-tag>
                </div>
                {{ product.name }}
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  </el-dialog>
</template>

<script>
  import { doEdit } from '@/api/table'
  import axios from '@/utils/request2'

  export default {
    name: 'ProductEdit',
    data() {
      return {
        export_batch: 0,
        esc_id: 0,
        url: 'http://localhost:5252/api/export_set_company',
        url2: 'http://localhost:5252/api/export_set_product_series',
        url3: 'http://localhost:5252/api/product/getbycompanytt',
        url4: 'http://localhost:5252/api/export_set_product',
        url5: 'http://localhost:5252/api/export_set_other',
        url6: 'http://localhost:5252/api/product/getforother',
        url7: 'http://localhost:5252/api/export_set_other_product',

        esc: {}, //Export_set_Company資料
        esp: [], //Export_set_Product資料
        esop: [], //Export_set_Other_Product資料
        esp_all: [],
        esop_all: [], //Export_set_Product資料(全部)

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

        //顯示與其他設定
        series_notify_show: false,
        series_notify_type: '',
        series_input_name: '',
        series_btn_show: false,
        detail_btn_show: false,
        sort_btn_show: false,
        esc_show: true,
        titleInput_show: false,
        allProduct_show: false,
        allProduct_other_show: false,
        draggable: true,
        update_show: false,

        company_show: false,
        company_show2: false,
        saleDate_show: false,
        saleDate_show2: false,
        detail_show: false,
        detail_show2: false,
        TT_show: false,
        TT_show2: false,
        TT_show_modify_type: 0,
        doujin_show: false,
        doujin_show2: false,
        doujin_show_modify_type: '',

        lastupdate: '', //最後一次標記的更新日期
        insert_row: 0, //中間插入sort

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
    computed: {
      filterItem() {
        let DataArry = this.item
        if (this.allProduct_show) DataArry = this.item_all

        DataArry = DataArry.filter(
          (item) =>
            (item.name.toLowerCase().includes(this.right_search.toLowerCase()) ||
              item.p_id.toLowerCase().includes(this.right_search.toLowerCase()) ||
              item.c_id.toLowerCase().includes(this.right_search.toLowerCase()) ||
              item.company_name.toLowerCase().includes(this.right_search.toLowerCase())) &&
            (this.allProduct_other_show ? item.eso_chk === false : true) &&
            (this.TT_show_modify_type == 0
              ? 1 == 1
              : item.tT_type.some((tt) => tt.type_id === 1 || tt.type_id === 3 || tt.type_id === 6 || tt.type_id === 8)) &&
            (this.doujin_show_modify_type == '' ||
              (this.doujin_show_modify_type == 'A' && item.p_id.substring(0, 1) == 'A') ||
              (this.doujin_show_modify_type == 'B' && item.p_id.substring(0, 1) == 'B')) &&
            //顯示最近更新
            (this.update_show == false ||
              (this.update_show == true && item.tT_type.some((tt) => tt.upd_date && new Date(tt.upd_date) > new Date(this.lastupdate))))
        )
        return DataArry
      },
      series_btn_show2() {
        return this.right_select.length > 0 ? true : false
      },
      insert_row_show() {
        return this.left_select_product.length > 0 ? true : false
      },
    },
    created() {
      console.log('created')
    },
    methods: {
      showEdit(id, batch) {
        console.log('===showEdit')
        console.log(id)
        console.log(batch)
        this.title = '遊戲排序'
        this.esc_id = id
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

      filteredTTtype(id) {
        if (id == 3) {
          //官方中文化
          return ''
        } else if (id == 1) {
          //漢化完成
          return 'success'
        } else if (id == 6) {
          //部分漢化
          return 'warning'
        } else if (id == 8) {
          //雲翻漢化
          return 'danger'
        } else {
          //其他
          return 'info'
        }
      },

      filteredDoujintype(type) {
        if (type == 'A') {
          //商業
          return ''
        } else if (type == 'B') {
          //同人
          return 'danger'
        } else {
          //其他
          return 'info'
        }
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
        let lb_chk = false,
          lb_all_chk = false
        this.item = []
        this.item_all = []
        this.plist = []
        let ls_tmparray = []

        //標頭
        if (this.esc.title != null && this.esc.title != undefined && this.esc.title != '') {
          this.title = `遊戲排序 - ${this.esc.c_Name} (${this.esc.title})`
        } else {
          this.title = `遊戲排序 - ${this.esc.c_Name}`
        }

        //右邊公司旗下選單 篩選
        for (let i = 0; i < this.product.length; i++) {
          for (let j = 0; j < this.esp.length; j++) {
            if (this.product[i]['p_id'] == this.esp[j]['p_id']) {
              lb_chk = true //標記有重複
            }
          }

          //若其他列表已有, 則標記起來
          for (let j = 0; j < this.esop_all.length; j++) {
            if (this.product[i]['p_id'] == this.esop_all[j]['p_id']) {
              this.product[i]['eso_chk'] = true
            }
          }

          if (!lb_chk) this.item.push(this.product[i]) //只放入沒重複的
          lb_chk = false //重置
        }

        //右邊全部選單 篩選
        for (let i = 0; i < this.product_all.length; i++) {
          for (let j = 0; j < this.esp_all.length; j++) {
            if (this.product_all[i]['p_id'] == this.esp_all[j]['p_id']) {
              lb_all_chk = true //標記有重複
            }
          }

          //若其他列表已有, 則標記起來
          for (let j = 0; j < this.esop_all.length; j++) {
            if (this.product_all[i]['p_id'] == this.esop_all[j]['p_id']) {
              this.product_all[i]['eso_chk'] = true
            }
          }

          if (!lb_all_chk) this.item_all.push(this.product_all[i]) //只放入沒重複的
          lb_all_chk = false //重置
        }

        //若其他列表已有, 則標記起來
        for (let i = 0; i < this.esp.length; i++) {
          for (let j = 0; j < this.esop_all.length; j++) {
            if (this.esp[i]['p_id'] == this.esop_all[j]['p_id']) {
              this.esp[i]['eso_chk'] = true
            }
          }
        }

        //左邊選單 把esp塞進去
        for (let i = 0; i < this.slist.length; i++) {
          for (let j = 0; j < this.esp.length; j++) {
            if (this.slist[i]['esps_Id'] == this.esp[j]['esps_id']) {
              ls_tmparray.push(this.esp[j])
            }
          }
          this.slist[i]['product_data'] = ls_tmparray
          ls_tmparray = []
        }
      },

      //讀取api
      async fetchData() {
        console.log('fetchData')

        let esc_id = this.esc_id

        let ls_url = `${this.url}/getbyid/${esc_id}`
        let ls_url2 = `${this.url2}/${esc_id}`

        console.log(ls_url)
        console.log(ls_url2)

        //ESC資料
        await axios
          .get(ls_url)
          .then((response) => (this.esc = response.data[0]))
          .catch(function (error) {
            console.log(error)
          })

        //子分類資料
        await axios
          .get(ls_url2)
          .then((response) => (this.slist = response.data))
          .catch(function (error) {
            console.log(error)
          })

        let ls_url3 = `${this.url3}/${this.esc.c_id}`
        console.log(ls_url3)

        //公司旗下的遊戲列表
        await axios
          .get(ls_url3)
          .then((response) => (this.product = response.data))
          .catch(function (error) {
            console.log(error)
          })

        let ls_url4 = `${this.url4}?id=${esc_id}`
        console.log(ls_url4)

        //公司旗下的ESP資料
        await axios
          .get(ls_url4)
          .then((response) => (this.esp = response.data))
          .catch(function (error) {
            console.log(error)
          })

        let ls_url5 = `${this.url5}/viewp/${this.export_batch}`
        console.log(ls_url5)

        //ESOP資料
        await axios
          .get(ls_url5)
          .then((response) => (this.esop = response.data))
          .catch(function (error) {
            console.log(error)
          })

        let ls_url6 = `${this.url6}`
        console.log(ls_url6)

        //抓出所有跟漢化相關的遊戲
        await axios
          .get(ls_url6)
          .then((response) => (this.product_all = response.data))
          .catch(function (error) {
            console.log(error)
          })

        let ls_url7 = `${this.url4}/getbybatch?id=${this.export_batch}`
        console.log(ls_url7)

        //所有的ESP資料
        await axios
          .get(ls_url7)
          .then((response) => (this.esp_all = response.data))
          .catch(function (error) {
            console.log(error)
          })

        let ls_url8 = `${this.url7}/getbybatch?id=${this.export_batch}`
        console.log(ls_url8)

        //ESOP資料(全部的其他遊戲)
        await axios
          .get(ls_url8)
          .then((response) => (this.esop_all = response.data))
          .catch(function (error) {
            console.log(error)
          })

        //取出最後一次標點的日期
        await axios
          .get('http://localhost:5252/api/export_set_date/getlast')
          .then((response) => (this.lastupdate = response.data))
          .catch(function (error) {
            // 请求失败处理
            console.log(error)
          })

        this.generateData()
        //this.setPdata();

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
      show_update() {
        console.log('show_update')
        if (this.update_show) {
          this.update_show = false
        } else {
          this.update_show = true
        }
      },
      show_detail() {
        console.log('show_detail')
        if (this.detail_show) {
          this.detail_show = false
        } else {
          this.detail_show = true
        }
      },
      show_detail2() {
        console.log('show_detail2')
        if (this.detail_btn_show) {
          this.detail_btn_show = false
          this.search_btn_show = true
        } else {
          this.detail_btn_show = true
          this.search_btn_show = false
        }
        this.sort_btn_show = false
        this.series_btn_show = false
        this.esc_show = true
      },
      show_TT() {
        console.log('show_TT')
        if (this.TT_show) {
          this.TT_show = false
        } else {
          this.TT_show = true
        }
      },
      show_TT2() {
        console.log('show_TT2')
        if (this.TT_show2) {
          this.TT_show2 = false
        } else {
          this.TT_show2 = true
        }
      },
      show_saleDate2() {
        console.log('show_saleDate2')
        if (this.saleDate_show2) {
          this.saleDate_show2 = false
        } else {
          this.saleDate_show2 = true
        }
      },
      show_company2() {
        console.log('show_company2')
        if (this.company_show2) {
          this.company_show2 = false
        } else {
          this.company_show2 = true
        }
      },

      TT_show_modify(type) {
        console.log(`TT_show_modify type: ${type}`)
        this.TT_show_modify_type = type
      },
      show_doujin() {
        console.log('show_doujin')
        if (this.doujin_show) {
          this.doujin_show = false
        } else {
          this.doujin_show = true
        }
      },
      show_doujin2() {
        console.log('show_doujin2')
        if (this.doujin_show2) {
          this.doujin_show2 = false
        } else {
          this.doujin_show2 = true
        }
      },
      doujin_show_modify(type) {
        console.log(`doujin_show_modify type: ${type}`)
        this.doujin_show_modify_type = type
      },
      selectAll() {
        this.right_select = []
        for (let i = 0; i < this.filterItem.length; i++) {
          this.right_select.push(this.filterItem[i]['p_id'])
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
        this.sort_btn_show = false
        this.detail_btn_show = false
      },

      set_drag() {
        console.log('set_drag')
        if (this.draggable) {
          this.draggable = false
        } else {
          this.draggable = true
        }
      },

      show_sort_btn() {
        if (this.sort_btn_show) {
          this.sort_btn_show = false
          this.search_btn_show = true
        } else {
          this.sort_btn_show = true
          this.search_btn_show = false
        }
        this.detail_btn_show = false
        this.series_btn_show = false
        this.esc_show = true
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

      //重新排序()
      list_sort2() {
        console.log('list_sort2')
        console.log(this.slist)

        for (let i = 0; i < this.slist.length; i++) {
          let esos_id = this.slist[i]['esps_Id']
          this.slist[i].sort = i + 1

          let data = this.slist[i]['product_data']

          if (data.length > 0) {
            //排序: 公司優先、發售日次要
            data.sort((a, b) => {
              if (a.c_Name < b.c_Name) return -1
              if (a.c_Name > b.c_Name) return 1
              return a.sale_Date - b.sale_Date // c_Name 相同時，根據sale_Date排序
            })

            for (let j = 0; j < data.length; j++) {
              data[j].sort = j + 1
              data[j]['esos_id'] = esos_id
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

  .div_float2 {
    height: 600px;
    width: 500px;
    background: whitesmoke;
    border-radius: 8px;
    border: 1px #c0c4cc solid;
  }

  .div_middle {
    height: 500px;
    width: 100px;
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    align-content: center;
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

  .tt_type {
    background: grey;
  }

  .TT_div {
    display: inline;
  }
</style>
