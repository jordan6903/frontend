<template>
  <el-dialog :title="title" :visible.sync="dialogFormVisible" width="800px" @close="close">
    <el-form ref="form" label-width="100px" :model="form" :rules="rules">
      <!-- 新增 -->
      <template v-if="!form_lock">
        <!-- 公司company -->
        <el-form-item label="公司搜尋">
          <el-col :span="16">
            <el-input v-model.trim="csearchword" autocomplete="off" />
          </el-col>
          &nbsp;
          <el-button icon="el-icon-search" type="primary" @click="companyQuery">查詢</el-button>
          <el-button icon="el-icon-plus" type="danger" @click="showCompanyInput">新增公司</el-button>
        </el-form-item>
        <el-form-item label="公司代碼">
          <el-select v-model="form.c_id" filterable placeholder="請選擇公司" @change="selectCompany">
            <el-option v-for="type in search_company" :key="type.c_id" :label="type.c_id + ' - ' + type.name" :value="type.c_id" />
          </el-select>
          &nbsp;
          <el-tag v-if="search_company && search_company.length === 0" type="info">未匯入公司</el-tag>
          <el-tag v-else>已匯入公司</el-tag>
        </el-form-item>
        <el-form-item v-show="newCompany_show" class="newElement" label="新增公司" prop="newCompany">
          <el-col :span="16">
            <el-input v-model.trim="newCompany.c_id" autocomplete="off" maxlength="10" placeholder="代號" />
          </el-col>
          &nbsp;
          <span style="color: red">最後代號: {{ maxCid }}</span>
          <br />
          <el-col :span="16">
            <el-input v-model.trim="newCompany.name" autocomplete="off" maxlength="200" placeholder="公司名稱" />
          </el-col>
          <br />
          <el-col :span="24">
            <el-select v-model="newCompany.c_type" placeholder="請選擇類型">
              <el-option
                v-for="type in company_type"
                :key="type.c_type"
                :label="type.c_type + ' ' + type.c_type_name"
                :value="type.c_type"
              />
            </el-select>
            &nbsp;
            <el-button type="primary" @click="saveNewCompany">新公司存檔</el-button>
          </el-col>
          <br />
        </el-form-item>
        <!-- 公司company -->

        <!-- 遊戲product -->
        <el-form-item label="遊戲搜尋">
          <el-col :span="16">
            <el-input v-model.trim="psearchword" autocomplete="off" />
          </el-col>
          &nbsp;
          <el-button icon="el-icon-search" type="primary" @click="productQuery">查詢</el-button>
          <el-button icon="el-icon-plus" type="danger" @click="showProductInput">新增遊戲</el-button>
        </el-form-item>
        <el-form-item label="遊戲代碼" prop="p_id">
          <el-select v-model="form.p_id" filterable placeholder="請選擇遊戲" @change="getMaxTbatch">
            <el-option v-for="type in search_product" :key="type.p_id" :label="type.p_id + ' - ' + type.name" :value="type.p_id" />
          </el-select>
          &nbsp;
          <el-tag v-if="search_product && search_product.length === 0" type="info">未匯入遊戲</el-tag>
          <el-tag v-else>已匯入遊戲</el-tag>
        </el-form-item>
        <el-form-item v-show="newProduct_show" class="newElement" label="新增遊戲" prop="newProduct">
          <el-select v-model="search_type" placeholder="請選擇商業類型" @change="getMaxPid">
            <el-option label="A 公司" value="A" />
            <el-option label="B 同人" value="B" />
          </el-select>
          <el-col :span="16">
            <el-input v-model.trim="newProduct.p_id" autocomplete="off" maxlength="10" placeholder="代號" />
          </el-col>
          &nbsp;
          <span style="color: red">最後代號: {{ maxPid }}</span>
          <br />
          <el-col :span="16">
            <el-input v-model.trim="newProduct.name" autocomplete="off" maxlength="200" placeholder="遊戲名稱" />
          </el-col>
          <br />
          <el-col :span="16">
            <el-input v-model.trim="newProduct.c_Name" autocomplete="off" maxlength="200" placeholder="遊戲中文名稱" />
          </el-col>
          <br />
          <el-col :span="16">
            <el-input v-model.trim="release.sale_Date" autocomplete="off" maxlength="8" placeholder="發售日" />
          </el-col>
          &nbsp;
          <el-button type="primary" @click="saveNewProduct">新遊戲存檔</el-button>
        </el-form-item>
        <!-- 遊戲product -->
      </template>
      <!-- 新增 -->

      <template v-else>
        <el-form-item label="公司代碼" prop="c_id">
          <el-input v-model.trim="form.c_id" autocomplete="off" :disabled="form_lock" maxlength="10" />
        </el-form-item>

        <el-form-item label="遊戲代碼" prop="p_id">
          <el-input v-model.trim="form.p_id" autocomplete="off" :disabled="form_lock" maxlength="10" />
        </el-form-item>

        <el-form-item label="遊戲名稱">
          <el-input v-model.trim="form.p_Name" autocomplete="off" :disabled="form_lock" />
        </el-form-item>
      </template>

      <!-- 批次batch -->
      <el-form-item label="批次" prop="t_batch">
        <el-col :span="16">
          <el-input v-model.number="form.t_batch" autocomplete="off" :disabled="form_lock2" maxlength="3" type="number" />
        </el-col>
        &nbsp;
        <span style="color: red">建議輸入: {{ maxTbatch + 1 }}</span>
      </el-form-item>
      <!-- 批次batch -->

      <el-form-item label="漢化進度" prop="type_id">
        <el-select v-model="form.type_id" placeholder="請選擇分類">
          <el-option v-for="type in form_type" :key="type.type_id" :label="type.type_id + ' ' + type.name" :value="type.type_id" />
        </el-select>
      </el-form-item>

      <el-form-item label="漢化組" prop="batch">
        <el-select v-model="batchSelect" filterable multiple placeholder="請選擇漢化組" @change="setBatch">
          <el-option v-for="type in form_info" :key="type.t_id" :label="type.t_id + ' ' + type.name" :value="type.t_id" />
        </el-select>
        &nbsp;
        <el-button icon="el-icon-plus" type="primary" @click="showTInput">新增漢化組</el-button>
      </el-form-item>

      <el-form-item v-show="newT_show" label="新增漢化組" prop="newCompany">
        <el-col :span="16">
          <el-input v-model.trim="newT.t_id" autocomplete="off" maxlength="6" placeholder="代號" />
        </el-col>
        &nbsp;
        <span style="color: red">建議輸入: {{ maxTid }}</span>
        <el-col :span="16">
          <el-input v-model.trim="newT.name" autocomplete="off" maxlength="100" placeholder="漢化組名" />
        </el-col>
        <el-col :span="16">
          <el-button type="primary" @click="saveNewT">新漢化組存檔</el-button>
        </el-col>
      </el-form-item>

      <el-form-item label="備註" prop="remark">
        <el-input v-model.trim="form.remark" autocomplete="off" maxlength="200" />
      </el-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button @click="close">取 消</el-button>
      <el-button type="primary" @click="save">確 定</el-button>
    </div>
  </el-dialog>
</template>

<script>
  import { doEdit } from '@/api/table'

  export default {
    name: 'TableEdit',
    data() {
      return {
        url: 'http://localhost:5252/api/translation_team_info',
        url2: 'http://localhost:5252/api/company_type',
        url_type: {
          url4: 'http://localhost:5252/api/website_type',
          url6: 'http://localhost:5252/api/product_type_info',
          url7: 'http://localhost:5252/api/product_relation_info',
          url9: 'http://localhost:5252/api/staff_type',
          url10: 'http://localhost:5252/api/staff_info',
          url11: 'http://localhost:5252/api/voice_type',
          url12: 'http://localhost:5252/api/currency',
          url13: 'http://localhost:5252/api/device',
          url14: 'http://localhost:5252/api/rating',
        },
        url_other: {
          url1: 'http://localhost:5252/api/product/getnewpid',
          url2: 'http://localhost:5252/api/company/getnewcid',
          url3: 'http://localhost:5252/api/product_release_day/getbypid',
          url4: 'http://localhost:5252/api/product_website',
          url5: 'http://localhost:5252/api/product_pic',
          url6: 'http://localhost:5252/api/product_type/getbypid',
          url7: 'http://localhost:5252/api/product_relation/getbypid',
          url8: 'http://localhost:5252/api/product_score',
          url9: 'http://localhost:5252/api/staff/getbypid',
          url10: 'http://localhost:5252/api/staff_info/getmaxstaffid',
        },

        insert_new: false,
        newT_show: false,
        params: '',
        return_msg: '',
        return_success: '',
        return_msg2: '',
        return_success2: '',
        psearchword: '',
        search_product: [],
        csearchword: '',
        search_company: [],
        maxTbatch: 0,
        maxTid: '',
        maxId: 0,
        maxCid: '',
        maxPid: '',
        search_type: '',

        newCompany_show: false,
        newProduct_show: false,

        newCompany: {
          c_id: '',
          name: '',
          c_type: '',
        },
        newProduct: {
          p_id: '',
          c_id: '',
          name: '',
          c_Name: '',
          content: '',
          content_style: '',
          play_time: '',
          remark: '',
        },
        release: {
          p_id: '',
          name: '',
          sale_Date: '',
          presale_Date: '',
          official_First: true, //初回標記
          price: 0,
          voice_id: 0,
          currency_id: 'XXX',
          content: '',
          device_id: 'XXXXX',
          rating_id: 0,
        },
        company_type: [],

        form: {
          c_id: '',
          c_Name: '',
          p_id: '',
          p_Name: '',
          t_batch: 0,
          type_id: 10,
          remark: '',
        },
        batch: [
          // {
          //   tT_id: 0,
          //   p_id: '',
          //   t_batch: 0,
          //   t_id: ''
          // },
        ],
        batchSelect: [],
        form_type: [],
        form_info: [],
        form_lock: false,
        form_lock2: false,
        other: [],
        newT: {
          t_id: '',
          name: '',
          content: '',
        },
        rules: {
          p_id: [{ required: true, trigger: 'blur', message: '請選擇遊戲' }],
          t_batch: [{ required: true, trigger: 'blur', message: '請輸入批次' }],
          type_id: [{ required: true, trigger: 'blur', message: '請選擇漢化進度' }],
          //batch: [{ required: true, trigger: 'blur', message: '請選擇漢化組' }],
        },
        title: '',
        dialogFormVisible: false,
      }
    },
    created() {},
    methods: {
      async showEdit(row, list_type) {
        console.log('===showEdit')
        console.log(row)
        console.log(list_type)
        if (!row) {
          this.title = '新增'
          this.form_lock = false
          this.form_lock2 = false
          this.other = []
          this.batchSelect = []
          this.batch = []

          //取得最新的id
          await axios
            .get('http://localhost:5252/api/translation_team/getnewid')
            .then((response) => (this.maxId = response.data))
            .catch(function (error) {
              console.log(error)
            })
        } else {
          this.title = '編輯'
          this.form = Object.assign({}, row)
          this.form_lock = true
          this.form_lock2 = true

          await axios
            .get('http://localhost:5252/api/translation_team/singlebyid/' + `${row.id}`)
            .then((response) => (this.other = response.data[0]))
            .catch(function (error) {
              console.log(error)
            })

          console.log(this.other)

          this.form.c_id = this.other.c_id
          this.form.c_Name = this.other.c_Name
          this.form.p_id = this.other.p_id
          this.form.p_Name = this.other.p_Name

          this.batch = []
          this.batch = row.tT_info
          this.batchSelect = []
          for (var i = 0; i < this.batch.length; i++) {
            console.log(this.batch[i].t_id)
            this.batchSelect.push(this.batch[i].t_id)
          }
          console.log(this.batch)
        }
        this.dialogFormVisible = true

        this.form_type = list_type.type
        this.form_info = list_type.info

        let ls_url2 = `${this.url2}?UseYN=Y`

        //分類
        await axios
          .get(ls_url2)
          .then((response) => (this.company_type = response.data))
          .catch(function (error) {
            console.log(error)
          })
      },
      async showCompanyInput() {
        let ls_url = `${this.url_other.url2}`

        if (this.newCompany_show) {
          this.newCompany_show = false
        } else {
          //分類
          await axios
            .get(ls_url)
            .then((response) => (this.maxCid = response.data))
            .catch(function (error) {
              console.log(error)
            })

          this.newCompany_show = true
        }
      },
      async saveNewCompany() {
        console.log('===saveNewCompany')
        if (this.newCompany.c_id == '' || this.newCompany.c_id == null || this.newCompany.c_id == undefined) {
          alert('請輸入公司id')
          return false
        }
        if (this.newCompany.name == '' || this.newCompany.name == null || this.newCompany.name == undefined) {
          alert('請輸入公司name')
          return false
        }
        if (this.newCompany.c_type == '' || this.newCompany.c_type == null || this.newCompany.c_type == undefined) {
          alert('請選擇公司type')
          return false
        }

        let ls_url = 'http://localhost:5252/api/company'
        this.params = this.newCompany

        console.log(this.newCompany)
        console.log(this.params)

        await axios
          .post(ls_url, this.params)
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

        //成功就重整公司下拉選單
        if (this.return_success == 'Y') {
          this.csearchword = this.newCompany.c_id
          await this.companyQuery()
          this.form.c_id = this.newCompany.c_id

          this.newCompany.c_id = ''
          this.newCompany.name = ''
          this.newCompany.c_type = ''
          this.newCompany_show = false
        }
      },
      async getMaxPid() {
        let ls_url = `${this.url_other.url1}?`
        ls_url += `searchword=${this.search_type}`

        //分類
        await axios
          .get(ls_url)
          .then((response) => (this.maxPid = response.data))
          .catch(function (error) {
            console.log(error)
          })
      },
      async showProductInput() {
        let ls_url = `${this.url_other.url1}?`
        ls_url += `searchword=${this.search_type}`

        if (this.newProduct_show) {
          this.newProduct_show = false
        } else {
          this.newProduct_show = true
        }
      },
      async saveNewProduct() {
        console.log('===saveNewProduct')
        if (this.form.c_id == '' || this.form.c_id == null || this.form.c_id == undefined) {
          alert('請選擇公司')
          return false
        }
        if (this.newProduct.p_id == '' || this.newProduct.p_id == null || this.newProduct.p_id == undefined) {
          alert('請輸入遊戲id')
          return false
        }
        if (this.newProduct.name == '' || this.newProduct.name == null || this.newProduct.name == undefined) {
          alert('請輸入遊戲name')
          return false
        }
        if (this.release.sale_Date == '' || this.release.sale_Date == null || this.release.sale_Date == undefined) {
          alert('請輸入發售日')
          return false
        }

        let ls_url = 'http://localhost:5252/api/product'
        let ls_url2 = 'http://localhost:5252/api/product_release_day'
        this.newProduct.c_id = this.form.c_id
        this.params = this.newProduct

        console.log(this.newProduct)
        console.log(this.params)

        await axios
          .post(ls_url, this.params)
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

        this.timeOutID = setTimeout(() => {
          this.listLoading = false
        }, 500)

        //成功就重整公司下拉選單
        if (this.return_success == 'Y') {
          this.release.p_id = this.newProduct.p_id

          await axios
            .post(ls_url2, this.release)
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

          this.psearchword = this.newProduct.p_id
          await this.productQuery()
          this.form.p_id = this.newProduct.p_id

          this.search_type = ''
          this.newProduct.c_id = ''
          this.newProduct.p_id = ''
          this.newProduct.name = ''
          this.newProduct.c_Name = ''
          this.release.p_id = ''
          this.release.sale_Date = ''
          this.maxPid = ''
          this.newProduct_show = false
        }
      },
      async showAdd(row, list_type) {
        console.log('===showAdd')
        console.log(row)
        console.log(list_type)

        this.title = '新增'
        this.form_lock = true
        this.form_lock2 = false
        this.other = []
        this.batchSelect = []

        this.form.c_id = row.c_id
        this.form.c_Name = row.c_Name
        this.form.p_id = row.p_id
        this.form.p_Name = row.p_Name

        this.batch = []

        this.dialogFormVisible = true

        this.form_type = list_type.type
        this.form_info = list_type.info

        console.log('===showAdd 1')
        //取得最新的id
        await axios
          .get('http://localhost:5252/api/translation_team/getnewid')
          .then((response) => (this.maxId = response.data))
          .catch(function (error) {
            console.log(error)
          })
        console.log('===showAdd 2')
        console.log(`===showAdd ${this.maxId}`)

        await this.getMaxTbatch()
      },
      async showTInput() {
        if (this.newT_show) {
          this.newT_show = false
        } else {
          this.newT_show = true
        }

        let ls_url = 'http://localhost:5252/api/translation_team_info/getmaxtid'
        await axios
          .get(ls_url)
          .then((response) => (this.maxTid = response.data))
          .catch(function (error) {
            console.log(error)
          })

        let ls_tmp = this.maxTid
        ls_tmp = ls_tmp.substring(1, ls_tmp.length)
        let li_tmp = parseInt(ls_tmp) + 1
        let ls_tmp2 = `00000${li_tmp.toString()}`
        ls_tmp2 = ls_tmp2.slice(-5)
        this.maxTid = `T${ls_tmp2.toString()}`
      },
      close() {
        console.log('===close')
        //this.$refs['form'].resetFields()
        this.form = this.$options.data().form
        this.dialogFormVisible = false
        this.$emit('fetch-data')
      },
      toUpperCase(event) {
        this.form.id = event.toUpperCase()
      },
      async productQuery() {
        let ls_url = 'http://localhost:5252/api/product'
        ls_url += `?searchword=${this.psearchword}`
        await axios
          .get(ls_url)
          .then((response) => (this.search_product = response.data))
          .catch(function (error) {
            console.log(error)
          })
      },
      async companyQuery() {
        let ls_url = 'http://localhost:5252/api/company'
        ls_url += `?searchword=${this.csearchword}`
        await axios
          .get(ls_url)
          .then((response) => (this.search_company = response.data))
          .catch(function (error) {
            console.log(error)
          })
      },
      async selectCompany() {
        let ls_url = 'http://localhost:5252/api/product/GetByCompany'
        ls_url += `/${this.form.c_id}`
        await axios
          .get(ls_url)
          .then((response) => (this.search_product = response.data))
          .catch(function (error) {
            console.log(error)
          })
      },
      async getMaxTbatch() {
        let ls_url = 'http://localhost:5252/api/translation_team/getmaxtbatch'
        ls_url += `/${this.form.p_id}`

        if (this.form.p_id == '') {
          this.maxTbatch = 0
        } else {
          await axios
            .get(ls_url)
            .then((response) => (this.maxTbatch = response.data))
            .catch(function (error) {
              console.log(error)
            })
        }
      },
      async saveNewT() {
        console.log('===saveNewT')
        if (this.newT.t_id == '' || this.newT.t_id == null || this.newT.t_id == undefined) {
          alert('請輸入漢化組id')
          return false
        }
        if (this.newT.name == '' || this.newT.name == null || this.newT.name == undefined) {
          alert('請輸入漢化組name')
          return false
        }

        let ls_url = 'http://localhost:5252/api/translation_team_info'
        this.params = this.newT

        console.log(this.newT)
        console.log(this.params)

        await axios
          .post(ls_url, this.params)
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

        //成功就重整公司下拉選單
        if (this.return_success == 'Y') {
          this.form_info = []

          await axios
            .get('http://localhost:5252/api/translation_team_info')
            .then((response) => (this.form_info = response.data))
            .catch(function (error) {
              // 请求失败处理
              console.log(error)
            })

          this.newT.t_id = ''
          this.newT.name = ''
          this.newT_show = false
        }
      },
      async setBatch() {
        console.log('===setBatch')
        let ls_batchSelect = this.batchSelect
        let ls_batch = JSON.parse(JSON.stringify(this.batch))
        let ls_finalbatch,
          ls_tmpid,
          ls_tmpnote = []

        let batchValues = ls_batch.map((item) => item.t_id)

        let difference = ls_batchSelect.filter((item) => !batchValues.includes(item)) //要新增的t_id

        console.log(difference)

        if (this.form.id > 0) {
          ls_tmpid = this.form.id //給予主檔id
        } else {
          ls_tmpid = this.maxId + 1 //給予新建的主檔id
        }

        if (difference.length > 0) {
          for (var i = 0; i < difference.length; i++) {
            ls_finalbatch = { id: 0, tT_id: ls_tmpid, p_id: '', t_batch: 0, t_id: difference[i] }
            this.batch.push(ls_finalbatch) //加入batch列
          }
        }
      },
      save() {
        console.log('===save')
        this.$refs['form'].validate(async (valid) => {
          if (valid) {
            console.log(this.form)

            //主檔
            if (!this.form_lock2) {
              console.log('新增')
              this.title = '新增'
              this.url = 'http://localhost:5252/api/translation_team'
              this.params = this.form

              console.log(this.form)
              console.log(this.params)

              await axios
                .post(this.url, this.params)
                .then((response) => (this.return_msg = response.data.message))
                .catch(function (error) {
                  // 请求失败处理
                  console.log(error)
                })
            } else {
              console.log('編輯')
              this.title = '編輯'
              this.url = `http://localhost:5252/api/translation_team/${this.form.id}`
              this.params = this.form

              console.log(this.form)
              console.log(this.params)

              await axios
                .put(this.url, this.params)
                .then((response) => (this.return_msg = response.data.message))
                .catch(function (error) {
                  // 请求失败处理
                  console.log(error)
                })
            }

            //拆解
            let msg_array = this.return_msg.split('#')
            this.return_success = msg_array[0]
            this.return_msg = msg_array[1]

            this.$baseMessage(this.return_msg, 'success')

            this.timeOutID = setTimeout(() => {
              this.listLoading = false
            }, 500)

            console.log(`maxId: ${this.maxId}`)

            //取得最新的id
            await axios
              .get('http://localhost:5252/api/translation_team/getnewid')
              .then((response) => (this.maxId = response.data))
              .catch(function (error) {
                console.log(error)
              })

            console.log(`maxId: ${this.maxId}`)

            //批次檔
            this.url = 'http://localhost:5252/api/translation_team_batch'
            this.params = this.batch
            let ls_url, msg_array2

            console.log(this.batch)

            if (this.return_success == 'Y') {
              console.log('1')
              console.log(this.params)

              for (var i = 0; i < this.params.length; i++) {
                console.log('2')

                console.log(this.params[i])
                console.log(this.params[i]['id'])

                //檢查看是否有batch id
                //已有id
                if (this.params[i]['id'] > 0) {
                  console.log('2.1')
                  ls_url = `${this.url}/${this.params[i]['id']}`

                  await axios
                    .put(ls_url, this.params[i])
                    .then((response) => (this.return_msg2 = response.data.message))
                    .catch(function (error) {
                      // 请求失败处理
                      console.log(error)
                    })
                }
                //沒有id
                else if (this.params[i]['id'] == 0) {
                  console.log('2.2')
                  console.log(this.form.id)
                  console.log(this.maxId)
                  ls_url = this.url

                  if (this.form.id > 0) {
                    this.params[i]['tT_id'] = this.form.id //給予主檔id
                  } else {
                    this.params[i]['tT_id'] = this.maxId //給予新建的主檔id
                  }

                  console.log(this.params[i]['tT_id'])

                  await axios
                    .post(ls_url, this.params[i])
                    .then((response) => (this.return_msg2 = response.data.message))
                    .catch(function (error) {
                      // 请求失败处理
                      console.log(error)
                    })
                }

                //拆解
                msg_array2 = this.return_msg2.split('#')
                if (msg_array[0] == 'N') {
                  //失敗就整個中斷
                  i = this.params.length
                  this.$baseMessage(msg_array[1], 'success')
                  this.return_success2 = 'N'
                } else {
                  this.return_success2 = 'Y'
                }
              }
            }

            console.log('3')

            //成功就關閉視窗
            if (this.return_success == 'Y' && this.return_success2 == 'Y') {
              this.dialogFormVisible = false
              this.$emit('fetch-data')
              this.form = this.$options.data().form

              this.$emit('trigger-handleQuery')
            }
          } else {
            return false
          }
        })
      },
    },
  }
</script>

<style>
  .newElement {
    background: #e4e7ed;
  }
</style>
