<template>
  <el-dialog :title="title" :visible.sync="dialogFormVisible" width="800px" @close="close">
    <div class="div_out">
      <div class="div_top">
        <el-select v-model="batch" placeholder="請選擇批次" @change="fetchData">
          <el-option
            v-for="batch in list_batch"
            :key="batch.export_batch"
            :label="batch.export_batch + ' ' + batch.content"
            :value="batch.export_batch"
          />
        </el-select>

        <span style="margin-left: 20px; margin-right: 20px">覆蓋到</span>

        <el-select v-model="batch2" placeholder="請選擇批次">
          <el-option
            v-for="batch in list_batch"
            :key="batch.export_batch"
            :label="batch.export_batch + ' ' + batch.content"
            :value="batch.export_batch"
          />
        </el-select>

        <span style="margin-left: 20px; margin-right: 5px">刪除原資料</span>
        <el-switch v-model="delete_ornot" />

        <el-button native-type="submit" style="margin-left: 20px" type="primary" @click="save">存檔</el-button>
      </div>
      <div class="div_mid">
        <div class="div_title">
          <span>存入其他</span>
          <div>
            <el-tag class="tagbtn" @click="selectAll">全選</el-tag>
            <el-tag class="tagbtn" @click="selectClear">清除</el-tag>
          </div>
        </div>
        <div class="div_search">
          <input v-model="search" autocomplete="off" class="input_search" :disabled="true" placeholder="請輸入代號或公司名稱" type="text" />
          <span class="input_search_icon"><i class="el-input__icon el-icon-search"></i></span>
        </div>
        <ul class="ul_item_group_drag">
          <li v-for="company in list" :key="company.id" class="li_item">
            <input v-model="select_item" class="checkbox" name="list" type="checkbox" :value="company.id" />
            <label :for="company.id">
              {{ company.sort }} - {{ company.name }} ( 子分類 {{ company.snumber }}，遊戲 {{ company.pnumber }} )
            </label>
          </li>
        </ul>
      </div>
    </div>
  </el-dialog>
</template>

<script>
  import { doEdit } from '@/api/table'

  export default {
    name: 'ExportCopyOther',
    data() {
      return {
        batch: '',
        batch2: '',
        url: 'http://localhost:5252/api/export_set_other',
        url2: 'http://localhost:5252/api/export_set_other_series',
        url3: 'http://localhost:5252/api/export_set_other_product',
        url_batch: 'http://localhost:5252/api/export_set_batch',

        //選單
        list_batch: [],
        list: [], //其他
        slist: [], //子分類
        plist: [], //遊戲
        select_item: [],
        search: '',

        //insert資料
        insert_other: [],
        insert_series: [],
        insert_product: [],

        delete_ornot: false,

        params: '',
        return_msg: '',
        return_data: '',
        return_success: '',

        title: '',
        dialogFormVisible: false,
      }
    },
    computed: {},
    created() {
      console.log('created')
    },
    methods: {
      showEdit() {
        console.log('===showEdit')
        this.title = '批次其他資料覆蓋'
        this.dialogFormVisible = true

        this.company = []
        this.item = []
        this.getBatch()
      },

      async getBatch() {
        console.log('getBatch')
        let ls_url = `${this.url_batch}?UseYN=Y`

        //batch下拉選單
        await axios
          .get(ls_url)
          .then((response) => (this.list_batch = response.data))
          .catch(function (error) {
            console.log(error)
          })
      },

      //準備選單data
      async generateData() {
        console.log('generateData')
        let ls_tmparray = []

        //先把遊戲放進子分類
        for (let i = 0; i < this.slist.length; i++) {
          for (let j = 0; j < this.plist.length; j++) {
            if (this.slist[i]['esos_Id'] == this.plist[j]['esos_id']) {
              ls_tmparray.push(this.plist[j])
            }
          }

          this.$set(this.slist[i], 'product_data', ls_tmparray)
          //this.slist[i]['product_data'] = ls_tmparray;
          ls_tmparray = []
        }

        for (let i = 0; i < this.list.length; i++) {
          for (let j = 0; j < this.slist.length; j++) {
            if (this.list[i]['id'] == this.slist[j]['eso_id']) {
              ls_tmparray.push(this.slist[j])
            }
          }

          let pnumber = 0
          for (let k = 0; k < ls_tmparray.length; k++) {
            pnumber += ls_tmparray[k]['product_data'].length
          }

          this.$set(this.list[i], 'pnumber', pnumber)
          this.$set(this.list[i], 'snumber', ls_tmparray.length)
          this.$set(this.list[i], 'series_data', ls_tmparray)
          //this.list[i]['pnumber'] = pnumber;
          //this.list[i]['snumber'] = ls_tmparray.length;
          //this.list[i]['series_data'] = ls_tmparray;
          ls_tmparray = []
        }
      },

      async fetchData() {
        console.log('fetchData')

        let ls_batch = this.batch

        let ls_url = `${this.url}?id=${ls_batch}&UseYN=Y`
        let ls_url2 = `${this.url2}/getall`
        let ls_url3 = `${this.url3}/getbybatch?id=${ls_batch}`

        //其他
        await axios
          .get(ls_url)
          .then((response) => (this.list = response.data))
          .catch(function (error) {
            console.log(error)
          })

        //子分類
        await axios
          .get(ls_url2)
          .then((response) => (this.slist = response.data))
          .catch(function (error) {
            console.log(error)
          })

        //遊戲
        await axios
          .get(ls_url3)
          .then((response) => (this.plist = response.data))
          .catch(function (error) {
            console.log(error)
          })

        this.generateData()

        this.timeOutID = setTimeout(() => {
          this.listLoading = false
        }, 500)
      },
      clear() {
        console.log('clear')
        this.company = []
        this.item = []
        this.right_select = []
        this.select_item = []

        this.form = this.form_clear
        this.form2 = this.form_clear2
        this.insert_form = []
        this.update_form = []
      },
      close() {
        console.log('===close')
        this.$emit('trigger-handleQuery')
      },
      selectAll() {
        console.log('selectAll')
        this.select_item = []
        for (let i = 0; i < this.list.length; i++) {
          this.select_item.push(this.list[i]['id'])
        }
      },
      selectClear() {
        console.log('selectClear')
        this.select_item = []
      },

      async save() {
        console.log('save')

        if (
          this.batch === undefined ||
          this.batch === null ||
          this.batch === '' ||
          this.batch2 === undefined ||
          this.batch2 === null ||
          this.batch2 === ''
        ) {
          alert('請先選擇批次')
          return false
        }

        if (this.list.length == 0) {
          alert('請先選一個有資料的批次再行匯入')
          return false
        }

        if (this.select_item.length == 0) {
          alert('請先勾選公司再存檔')
          return false
        }

        if (this.batch == this.batch2) {
          alert('左右批次不可一樣')
          return false
        }

        //是否刪除原有資料
        if (this.delete_ornot == true) {
          await this.delete_company()
        }

        this.insert_other = []
        this.insert_series = []
        this.insert_product = []

        //整理要insert的資料
        //other
        for (let i = 0; i < this.select_item.length; i++) {
          for (let j = 0; j < this.list.length; j++) {
            if (this.select_item[i] == this.list[j]['id']) {
              this.insert_other.push({
                export_batch: this.batch2,
                name: this.list[j]['name'],
                use_yn: this.list[j]['use_yn'],
                sort: this.list[j]['sort'],
              })

              break
            }
          }
        }

        console.log(this.insert_other)

        let ls_url = `${this.url}/several`

        await axios
          .post(ls_url, this.insert_other)
          .then((response) => (this.return_data = response.data))
          .catch(function (error) {
            // 请求失败处理
            console.log(error)
          })

        //拆解
        let msg_array = this.return_data.message.split('#')
        this.return_success = msg_array[0]
        this.return_msg = msg_array[1]

        this.$baseMessage(this.return_msg, 'success')

        //失敗就中斷
        if (this.return_success == 'N') {
          return false
        }

        let ls_companyid = this.return_data.ids //回傳的eso_id
        let ls_companyname = this.return_data.name //回傳的name

        console.log(ls_companyid)
        console.log(ls_companyname)

        let ls_url2 = `${this.url2}`

        //series跟product
        for (let i = 0; i < ls_companyname.length; i++) {
          for (let j = 0; j < this.list.length; j++) {
            if (ls_companyname[i] == this.list[j]['name']) {
              let series_data = this.list[j]['series_data']

              for (let k = 0; k < series_data.length; k++) {
                let newarray = {
                  ESO_id: ls_companyid[i],
                  Name: series_data[k]['name'],
                  Use_yn: series_data[k]['use_yn'],
                  Sort: series_data[k]['sort'],
                }

                await axios
                  .post(ls_url2, newarray)
                  .then((response) => (this.return_data = response.data))
                  .catch(function (error) {
                    // 请求失败处理
                    console.log(error)
                  })

                //拆解
                let msg_array = this.return_data.message.split('#')
                this.return_success = msg_array[0]
                this.return_msg = msg_array[1]

                this.$baseMessage(this.return_msg, 'success')

                //成功就重新讀取
                if (this.return_success == 'N') {
                  return false
                } else {
                  //product
                  this.insert_product = []
                  let ls_seriesid = this.return_data.id //回傳的esos_id
                  let product_data = series_data[k]['product_data']

                  for (let l = 0; l < product_data.length; l++) {
                    this.insert_product.push({
                      esos_id: ls_seriesid,
                      p_id: product_data[l]['p_id'],
                      use_yn: product_data[l]['use_yn'],
                      sort: product_data[l]['sort'],
                    })
                  }

                  console.log(this.insert_product)

                  let ls_url3 = `${this.url3}/several`

                  await axios
                    .post(ls_url3, this.insert_product)
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
                  if (this.return_success == 'N') {
                    return false
                  }
                }
              }

              break //第二層中止
            }
          }
        }
      },

      async delete_company() {
        console.log('delete_company')

        let ls_url = `${this.url}/deletebybatch/${this.batch2}`

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
      },
    },
  }
</script>

<style>
  li {
    list-style: none;
  }

  .div_out {
    display: flex;
    flex-direction: column;
  }

  .div_top {
    margin-bottom: 30px;
  }

  .div_mid {
    height: 500px;
    width: 700px;
    background: whitesmoke;
    border-radius: 8px;
    border: 1px #c0c4cc solid;
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

  .div_search {
    height: 20px;
    padding: 8px;
    display: flex;
    align-items: center;
    position: relative;
  }

  .ul_item_group,
  .ul_item_group_drag {
    overflow: auto;
    height: 420px;
    padding: 5px;
    margin: 0px;
  }

  .li_item {
    padding-top: 5px;
    padding-left: 10px;
    padding-bottom: 5px;
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
</style>
