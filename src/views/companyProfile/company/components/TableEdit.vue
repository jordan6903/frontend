<template>
  <el-dialog :title="title" :visible.sync="dialogFormVisible" width="800px" @close="close">
    <el-collapse v-model="collapseActive" @change="collapseChange">
      <!-- 基本資料Product -->
      <el-collapse-item name="1" title="一、基本資料">
        <el-form ref="form" label-width="80px" :model="form" :rules="rules">
          <el-form-item label="代碼" prop="c_id">
            <el-input v-model.trim="form.c_id" autocomplete="off" :disabled="form_lock" maxlength="10" />
          </el-form-item>
          <el-form-item label="分類" prop="c_type">
            <el-select v-model="form.c_type" placeholder="請選擇分類">
              <el-option v-for="type in form_type" :key="type.c_type" :label="type.c_type + ' ' + type.c_type_name" :value="type.c_type" />
            </el-select>
          </el-form-item>
          <el-form-item label="名稱" prop="name">
            <el-input v-model.trim="form.name" autocomplete="off" maxlength="200" />
          </el-form-item>
          <el-form-item label="原文" prop="name_origin">
            <el-input v-model.trim="form.name_origin" autocomplete="off" maxlength="200" />
          </el-form-item>
          <el-form-item label="簡稱" prop="name_short">
            <el-input v-model.trim="form.name_short" autocomplete="off" maxlength="50" />
          </el-form-item>
          <el-form-item label="介紹" prop="intro">
            <el-input v-model="form.intro" autocomplete="off" maxlength="4000" type="textarea" />
          </el-form-item>
          <el-form-item label="備註" prop="remark">
            <el-input v-model.trim="form.remark" autocomplete="off" maxlength="200" />
          </el-form-item>
          <el-form-item label="開啟日" prop="sdate">
            <el-input v-model.trim="form.sdate" autocomplete="off" maxlength="8" />
          </el-form-item>
          <el-form-item label="結束日" prop="edate">
            <el-input v-model.trim="form.edate" autocomplete="off" maxlength="8" />
          </el-form-item>
          <el-form-item label="更新時間">{{ form.upd_date }}</el-form-item>
          <el-form-item label="建立時間">{{ form.create_dt }}</el-form-item>
        </el-form>
      </el-collapse-item>

      <!-- 其他資料: 網址Website -->
      <el-collapse-item :disabled="collapseDisabled" name="2" title="二、其他資料">
        <el-form ref="website" label-width="80px" :style="{ background: newWebsite_show ? '#E8FFF5' : '' }">
          <el-form-item v-if="form_lock" label="網址">
            <el-tooltip v-for="data in data_Website" :key="data.id" placement="top">
              <div slot="content">
                <a @click="modifyWebsite(data)">編輯</a>
                |
                <a @click="deleteWebsite(data.id)">刪除</a>
              </div>
              <el-link :href="data.url" target="_blank" type="primary">
                {{ data.name != '' ? data.name : data.type_Name }}&nbsp;&nbsp;&nbsp;
              </el-link>
            </el-tooltip>

            <el-button :icon="newWebsite_show ? 'el-icon-minus' : 'el-icon-plus'" type="danger" @click="showWebsiteInput">
              新增網址
            </el-button>
          </el-form-item>
          <el-form-item v-show="newWebsite_show" :label="modifyWebsite_yn ? '編輯網址' : '新增網址'">
            <el-form-item label="屬性" required>
              <el-col :span="16">
                <el-select v-model="form_website.type_id" filterable placeholder="請選擇屬性(必填)">
                  <el-option
                    v-for="data in type_Website"
                    :key="data.type_id"
                    :label="data.type_id + ' ' + data.name"
                    :value="data.type_id"
                  />
                </el-select>
              </el-col>
            </el-form-item>
            <el-form-item label="名稱">
              <el-col :span="16">
                <el-input v-model.trim="form_website.name" autocomplete="off" maxlength="30" placeholder="名稱" />
              </el-col>
            </el-form-item>
            <el-form-item label="網址" required>
              <el-col :span="16">
                <el-input v-model.trim="form_website.url" autocomplete="off" maxlength="4000" placeholder="網址(必填)" />
              </el-col>
            </el-form-item>
            <el-form-item label="備註">
              <el-col :span="16">
                <el-input v-model.trim="form_website.remark" autocomplete="off" maxlength="50" placeholder="備註" />
              </el-col>
            </el-form-item>
            <el-form-item label="啟用">
              <el-switch v-model="form_website.use_yn" />
            </el-form-item>
            &nbsp;
            <el-button type="primary" @click="saveNewWebsite">新網址存檔</el-button>
          </el-form-item>
        </el-form>
      </el-collapse-item>

      <!-- 圖片Pic -->
      <el-collapse-item :disabled="collapseDisabled" name="3" title="三、圖片">
        <el-button
          :icon="newPic_show ? 'el-icon-minus' : 'el-icon-plus'"
          style="margin-left: 20px; margin-bottom: 20px"
          type="danger"
          @click="showPicInput"
        >
          新增圖片
        </el-button>

        <!-- 新增圖片 -->
        <el-form ref="Relation" label-width="80px" :style="{ background: newPic_show ? '#E8FFF5' : '' }">
          <el-form-item
            v-show="newPic_show"
            :label="newPic_show ? '編輯關聯' : '新增關聯'"
            :style="{ background: newPic_show ? '#FFF3EE' : '' }"
          >
            <el-form-item label="圖片分類" required>
              <el-select v-model="form_pic.type_id" placeholder="請選擇分類">
                <el-option v-for="type in type_Website" :key="type.type_id" :label="type.type_id + ' ' + type.name" :value="type.type_id" />
              </el-select>
            </el-form-item>

            <el-form-item label="名稱">
              <el-input v-model.trim="form_pic.name" autocomplete="off" maxlength="30" />
            </el-form-item>

            <el-form-item label="網址" required>
              <el-input v-model.trim="form_pic.url" autocomplete="off" maxlength="4000" />
            </el-form-item>

            <el-form-item label="寬" required>
              <el-input v-model.number="form_pic.width" autocomplete="off" maxlength="5" type="number" />
            </el-form-item>

            <el-form-item label="高" required>
              <el-input v-model.number="form_pic.height" autocomplete="off" maxlength="5" type="number" />
            </el-form-item>

            <el-form-item label="備註">
              <el-input v-model.trim="form_pic.remark" autocomplete="off" maxlength="50" />
            </el-form-item>

            <el-form-item label="啟用">
              <el-switch v-model="form_pic.use_yn" />
            </el-form-item>

            <el-form-item label="排序" prop="sort">
              <el-input v-model.number="form.sort" autocomplete="off" maxlength="3" type="number" />
            </el-form-item>

            &nbsp;
            <el-button type="primary" @click="saveNewPic">新圖片存檔</el-button>
          </el-form-item>
        </el-form>
        <!-- 新增圖片 -->

        <div class="demo-image">
          <div v-for="data in data_Pic" :key="data.id" class="block">
            <span class="demonstration">{{ data.name ? data.name : data.type_Name }}</span>
            <span class="demonstration">
              <a @click="modifyPic(data)">編輯</a>
              |
              <a @click="deletePic(data.id)">刪除</a>
            </span>
            <el-image :preview-src-list="srcList" :src="data.url" style="width: 100px; height: 100px" />
          </div>
        </div>
      </el-collapse-item>

      <!-- 關聯公司Relation -->
      <el-collapse-item :disabled="collapseDisabled" name="4" title="四、關聯公司">
        <el-button
          :icon="newRelation_show ? 'el-icon-minus' : 'el-icon-plus'"
          style="margin-left: 20px; margin-bottom: 20px"
          type="danger"
          @click="showRelationInput"
        >
          新增關聯公司
        </el-button>
        <!-- 新增關聯公司 -->
        <el-form ref="Relation" label-width="80px" :style="{ background: newRelation_show ? '#E8FFF5' : '' }">
          <el-form-item
            v-show="newRelation_show"
            :label="newRelation_show ? '編輯關聯' : '新增關聯'"
            :style="{ background: newRelation_show ? '#FFF3EE' : '' }"
          >
            <el-form-item label="公司搜尋">
              <el-col :span="16">
                <el-input v-model.trim="searchword" autocomplete="off" />
              </el-col>
              &nbsp;
              <el-button icon="el-icon-search" type="primary" @click="companyQuery">查詢</el-button>
            </el-form-item>
            <el-form-item label="公司代碼" required>
              <el-select v-model="form_relation.c_id_to" placeholder="請選擇公司">
                <el-option v-for="type in search_company" :key="type.c_id" :label="type.c_id + ' - ' + type.name" :value="type.c_id" />
              </el-select>
              &nbsp;
              <el-tag v-if="search_company && search_company.length === 0" type="info">未匯入公司</el-tag>
              <el-tag v-else>已匯入公司</el-tag>
            </el-form-item>

            <el-form-item label="關聯分類" required>
              <el-select v-model="form_relation.relation_id" placeholder="請選擇分類">
                <el-option
                  v-for="type in type_Relation"
                  :key="type.relation_id"
                  :label="type.relation_id + ' ' + type.name"
                  :value="type.relation_id"
                />
              </el-select>
            </el-form-item>

            <el-form-item label="敘述">
              <el-input v-model.trim="form_relation.content" autocomplete="off" maxlength="100" />
            </el-form-item>

            <el-form-item label="新增連結">
              <el-switch v-model="newRelation_link" title="新增兩筆公司之間的關聯連結" />
            </el-form-item>

            <el-form-item v-show="newRelation_link" label="關聯分類" required>
              <el-select v-model="form_relation_to.relation_id" placeholder="請選擇分類">
                <el-option
                  v-for="type in type_Relation"
                  :key="type.relation_id"
                  :label="type.relation_id + ' ' + type.name"
                  :value="type.relation_id"
                />
              </el-select>
            </el-form-item>

            <el-form-item v-show="newRelation_link" label="敘述">
              <el-input v-model.trim="form_relation_to.content" autocomplete="off" maxlength="100" />
            </el-form-item>

            &nbsp;
            <el-button type="primary" @click="saveNewRelation">新關聯存檔</el-button>
          </el-form-item>
        </el-form>
        <!-- 新增關聯公司 -->
        <el-table :border="true" :data="data_Relation">
          <el-table-column label="公司名稱" prop="c_Name_to" show-overflow-tooltip sortable width="200" />
          <el-table-column label="關聯" prop="relation_Name" show-overflow-tooltip width="95" />
          <el-table-column label="敘述" prop="content" show-overflow-tooltip />
          <el-table-column label="操作" show-overflow-tooltip width="180px">
            <template #default="{ row }">
              <el-button type="text" @click="modifyRelation(row)">編輯</el-button>
              <el-button type="text" @click="deleteRelation(row.id)">刪除</el-button>
            </template>
          </el-table-column>
        </el-table>
        <!-- 關聯公司 -->
      </el-collapse-item>
    </el-collapse>

    <div slot="footer" class="dialog-footer">
      <el-button @click="close">取 消</el-button>
      <el-button type="primary" @click="save">確 定</el-button>
    </div>
  </el-dialog>
</template>

<script>
  import { doEdit } from '@/api/table'
  import axios from '@/utils/request2'

  export default {
    name: 'TableEdit',
    data() {
      return {
        url: 'http://localhost:5252/api/company_website',
        url2: 'http://localhost:5252/api/website_type',
        url3: 'http://localhost:5252/api/company_pic',
        url4: 'http://localhost:5252/api/company_relation',
        url_type: {
          url4: 'http://localhost:5252/api/website_type',
          url6: 'http://localhost:5252/api/company_type_info',
          url7: 'http://localhost:5252/api/company_relation_info',
          url11: 'http://localhost:5252/api/voice_type',
          url12: 'http://localhost:5252/api/currency',
          url13: 'http://localhost:5252/api/device',
          url14: 'http://localhost:5252/api/rating',
        },
        // url_other: {
        //   url1: 'http://localhost:5252/api/product/getnewpid',
        //   url2: 'http://localhost:5252/api/company/getnewcid',
        //   url3: 'http://localhost:5252/api/product_release_day/getbypid',
        //   url4: 'http://localhost:5252/api/product_website',
        //   url5: 'http://localhost:5252/api/product_pic',
        //   url6: 'http://localhost:5252/api/product_type/getbypid',
        //   url7: 'http://localhost:5252/api/company_relation/getbycid',
        // },
        params: '',
        return_msg: '',
        return_success: '',
        searchword: '',

        //===摺疊控制===//
        collapseActive: ['1'],
        collapseOld: ['1'],

        type_Website: [], //網址類型
        type_Relation: [], //關聯類型

        data_Website: [],
        data_Pic: [],
        data_Relation: [],

        search_company: [],

        srcList: [],

        newRelation_link: true,
        newWebsite_show: false,
        newPic_show: false,
        newRelation_show: false,
        modifyWebsite_yn: false,
        modifyPic_yn: false,
        modifyRelation_yn: false,

        form: {
          c_id: '',
          c_type: '',
          name: '',
          name_origin: '',
          name_short: '',
          intro: '',
          remark: '',
          sdate: '',
          edate: '',
        },

        form_website: {
          c_id: '',
          type_id: '',
          name: '',
          url: '',
          remark: '',
          use_yn: true,
          sort: 0,
        },
        form_pic: {
          c_id: '',
          type_id: '',
          name: '',
          rrl: '',
          width: 0,
          height: 0,
          remark: '',
          use_yn: true,
          sort: 0,
        },
        form_relation: {
          c_id: '',
          c_Name: '',
          c_id_to: '',
          c_Name_to: '',
          relation_id: 0,
          content: '',
        },
        form_relation_to: {
          c_id: '',
          c_Name: '',
          c_id_to: '',
          c_Name_to: '',
          relation_id: 0,
          content: '',
        },

        //清空複製用
        form_pure: {
          c_id: '',
          c_type: '',
          name: '',
          name_origin: '',
          name_short: '',
          intro: '',
          remark: '',
          sdate: '',
          edate: '',
        },
        form_website_pure: {
          c_id: '',
          type_id: '',
          name: '',
          url: '',
          remark: '',
          use_yn: true,
          sort: 0,
        },
        form_pic_pure: {
          c_id: '',
          type_id: '',
          name: '',
          rrl: '',
          width: 0,
          height: 0,
          remark: '',
          use_yn: true,
          sort: 0,
        },
        form_relation_pure: {
          c_id: '',
          c_Name: '',
          c_id_to: '',
          c_Name_to: '',
          relation_id: 0,
          content: '',
        },
        form_relation_to_pure: {
          c_id: '',
          c_Name: '',
          c_id_to: '',
          c_Name_to: '',
          relation_id: 0,
          content: '',
        },

        form_type: [],
        form_lock: false,
        rules: {
          c_id: [{ required: true, trigger: 'blur', message: '請輸入代號' }],
          c_type: [{ required: true, trigger: 'blur', message: '請選擇分類' }],
          name: [{ required: true, trigger: 'blur', message: '請輸入名稱' }],
        },
        title: '',
        dialogFormVisible: false,
      }
    },
    computed: {
      collapseDisabled() {
        return this.form.id == null ? true : false
      },
    },
    created() {},
    methods: {
      async showEdit(row, list_type) {
        console.log('===showEdit')
        console.log(row)
        console.log(list_type)
        if (!row) {
          this.title = '新增'
          this.form = this.form_pure //清空
          this.form_lock = false
        } else {
          this.title = '編輯'
          this.form = Object.assign({}, row)
          this.form_lock = true
        }
        this.form_type = list_type
        this.dialogFormVisible = true
      },
      close() {
        console.log('===close')

        //清空所有資料
        this.collapseActive = ['1']
        this.collapseOld = ['1']

        this.dialogFormVisible = false
      },
      toUpperCase(event) {
        this.form.c_id = event.toUpperCase()
      },
      collapseChange(val) {
        //翻頁才讀取資料
        console.log(val)

        let old = this.collapseOld
        let active = val

        let difference = active.filter((item) => !old.includes(item))

        for (var i = 0; i < difference.length; i++) {
          if (difference[i] == '2') {
            this.getWebsite() //網址
          }
          if (difference[i] == '3') {
            this.getPic() //圖片
          }
          if (difference[i] == '4') {
            this.getRelation() //關聯公司
          }
        }

        this.collapseOld = val
      },
      async getWebsite() {
        console.log('getWebsite')
        let ls_url = `${this.url}`
        ls_url += `/${this.form.c_id}`

        //分類
        await axios
          .get(ls_url)
          .then((response) => (this.data_Website = response.data))
          .catch(function (error) {
            console.log(error)
          })
      },
      async getPic() {
        let ls_url = `${this.url3}`
        ls_url += `/${this.form.c_id}`

        //分類
        await axios
          .get(ls_url)
          .then((response) => (this.data_Pic = response.data))
          .catch(function (error) {
            console.log(error)
          })

        this.srcList = this.data_Pic.map((item) => item.url) //圖庫
      },
      async getRelation() {
        let ls_url = `${this.url4}/getbycid`
        ls_url += `?id=${this.form.c_id}`

        //分類
        await axios
          .get(ls_url)
          .then((response) => (this.data_Relation = response.data))
          .catch(function (error) {
            console.log(error)
          })

        let ls_url1 = `${this.url_type.url7}`

        //分類type
        await axios
          .get(ls_url1)
          .then((response) => (this.type_Relation = response.data))
          .catch(function (error) {
            console.log(error)
          })
      },
      async companyQuery() {
        let ls_url = 'http://localhost:5252/api/company'
        ls_url += `?searchword=${this.searchword}`
        await axios
          .get(ls_url)
          .then((response) => (this.search_company = response.data))
          .catch(function (error) {
            console.log(error)
          })
      },
      async showWebsiteInput() {
        let ls_url = `${this.url2}?UseYN=Y`

        this.modifyWebsite_yn = false

        if (this.newWebsite_show) {
          this.newWebsite_show = false
        } else {
          //分類
          await axios
            .get(ls_url)
            .then((response) => (this.type_Website = response.data))
            .catch(function (error) {
              console.log(error)
            })

          this.newWebsite_show = true
        }
      },
      async showPicInput() {
        this.form_pic = this.form_pic_pure //清空
        this.modifyPic_yn = false

        let ls_url = `${this.url2}?UseYN=Y`

        if (this.newPic_show) {
          this.newPic_show = false
        } else {
          //分類
          await axios
            .get(ls_url)
            .then((response) => (this.type_Website = response.data))
            .catch(function (error) {
              console.log(error)
            })

          this.newPic_show = true
        }
      },
      async showRelationInput() {
        this.form_relation = this.form_relation_pure //清空
        this.modifyRelation_yn = false

        if (this.newRelation_show) {
          this.newRelation_show = false
        } else {
          this.newRelation_show = true
        }
      },
      async saveNewWebsite() {
        console.log('===saveNewWebsite')
        if (this.form_website.type_id == '' || this.form_website.type_id == null || this.form_website.type_id == undefined) {
          alert('請選擇網址分類')
          return false
        }
        if (this.form_website.url == '' || this.form_website.url == null || this.form_website.url == undefined) {
          alert('請輸入網址')
          return false
        }

        let ls_url = 'http://localhost:5252/api/company_website'
        this.params = this.form_website

        this.form_website.c_id = this.form.c_id

        console.log(this.params)

        if (this.form_website.id == '' || this.form_website.id == null || this.form_website.id == undefined) {
          //新增
          await axios
            .post(ls_url, this.params)
            .then((response) => (this.return_msg = response.data.message))
            .catch(function (error) {
              // 请求失败处理
              console.log(error)
            })
        } else {
          //編輯
          ls_url += `/${this.form_website.id}`
          await axios
            .put(ls_url, this.params)
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

        //成功就重整
        if (this.return_success == 'Y') {
          this.form_website = this.form_website_pure //清空
          this.newWebsite_show = false
          this.getWebsite()
        }
      },
      async saveNewPic() {
        console.log('===saveNewPic')
        if (this.form_pic.type_id == '' || this.form_pic.type_id == null || this.form_pic.type_id == undefined) {
          alert('請選擇圖片類型')
          return false
        }
        if (this.form_pic.url == '' || this.form_pic.url == null || this.form_pic.url == undefined) {
          alert('請輸入網址')
          return false
        }
        if (this.form_pic.width === '' || this.form_pic.width === null || this.form_pic.width === undefined) {
          alert('請輸入寬')
          return false
        }
        if (this.form_pic.height === '' || this.form_pic.height === null || this.form_pic.height === undefined) {
          alert('請輸入高')
          return false
        }

        let ls_url = 'http://localhost:5252/api/company_pic'
        this.params = this.form_pic

        this.form_pic.c_id = this.form.c_id

        console.log(this.params)

        if (this.form_pic.id == '' || this.form_pic.id == null || this.form_pic.id == undefined) {
          //新增
          await axios
            .post(ls_url, this.params)
            .then((response) => (this.return_msg = response.data.message))
            .catch(function (error) {
              // 请求失败处理
              console.log(error)
            })
        } else {
          //編輯
          ls_url += `/${this.form_pic.id}`
          await axios
            .put(ls_url, this.params)
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

        //成功就重整
        if (this.return_success == 'Y') {
          this.form_pic = this.form_pic_pure //清空
          this.newPic_show = false
          this.getPic()
        }
      },
      async saveNewRelationTo() {
        console.log('===saveNewRelationTo')
        if (
          this.form_relation_to.relation_id == '' ||
          this.form_relation_to.relation_id == null ||
          this.form_relation_to.relation_id == undefined
        ) {
          alert('請選擇公司2關聯類型')
          return false
        }

        let ls_url = 'http://localhost:5252/api/company_relation'
        this.params = this.form_relation_to

        this.form_relation_to.c_id = this.form_relation.c_id_to
        this.form_relation_to.c_id_to = this.form.c_id

        console.log(this.params)

        //新增
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

        //成功就重整
        if (this.return_success == 'Y') {
          this.form_relation_to = this.form_relation_to_pure //清空
        }
      },
      async saveNewRelation() {
        console.log('===saveNewRelation')
        if (this.form_relation.c_id_to == '' || this.form_relation.c_id_to == null || this.form_relation.c_id_to == undefined) {
          alert('請輸入關聯公司代碼')
          return false
        }
        if (this.form_relation.relation_id == '' || this.form_relation.relation_id == null || this.form_relation.relation_id == undefined) {
          alert('請選擇關聯類型')
          return false
        }

        let ls_url = 'http://localhost:5252/api/company_relation'
        this.params = this.form_relation

        this.form_relation.c_id = this.form.c_id

        console.log(this.params)

        if (this.form_relation.id == '' || this.form_relation.id == null || this.form_relation.id == undefined) {
          //新增
          await axios
            .post(ls_url, this.params)
            .then((response) => (this.return_msg = response.data.message))
            .catch(function (error) {
              // 请求失败处理
              console.log(error)
            })
        } else {
          //編輯
          ls_url += `/${this.form_relation.id}`
          await axios
            .put(ls_url, this.params)
            .then((response) => (this.return_msg = response.data.message))
            .catch(function (error) {
              // 请求失败处理
              console.log(error)
            })
        }

        if (this.newRelation_link) {
          this.saveNewRelationTo() //公司2存檔
        }

        //拆解
        let msg_array = this.return_msg.split('#')
        this.return_success = msg_array[0]
        this.return_msg = msg_array[1]

        this.$baseMessage(this.return_msg, 'success')

        //成功就重整
        if (this.return_success == 'Y') {
          this.form_relation = this.form_relation_pure //清空
          this.newRelation_show = false
          this.getRelation()
        }
      },
      async modifyWebsite(data) {
        console.log('===modifyWebsite')
        console.log(data)
        if (data == '' || data == null || data == undefined) {
          alert('查無data')
          return false
        }
        this.modifyWebsite_yn = true

        this.form_website = data

        let ls_url = `${this.url2}?UseYN=Y`

        //分類
        await axios
          .get(ls_url)
          .then((response) => (this.type_Website = response.data))
          .catch(function (error) {
            console.log(error)
          })

        this.newWebsite_show = true
      },
      async modifyPic(data) {
        console.log('===modifyPic')
        console.log(data)
        if (data == '' || data == null || data == undefined) {
          alert('查無data')
          return false
        }
        this.modifyPic_yn = true

        this.form_pic = data

        let ls_url = `${this.url2}?UseYN=Y`

        if (this.newPic_show) {
          this.newPic_show = false
        } else {
          //分類
          await axios
            .get(ls_url)
            .then((response) => (this.type_Website = response.data))
            .catch(function (error) {
              console.log(error)
            })

          this.newPic_show = true
        }
      },
      async modifyRelation(data) {
        console.log('===modifyRelation')
        console.log(data)
        if (data == '' || data == null || data == undefined) {
          alert('查無data')
          return false
        }
        this.modifyRelation_yn = true

        this.$baseAlert('注意: 編輯只會更動此一資料, 如之前有一次新增兩筆資料, 則需做兩次編輯。')

        this.searchword = data.p_Name_to
        this.companyQuery()

        this.form_relation = data

        if (this.newRelation_show) {
          this.newRelation_show = false
        } else {
          this.newRelation_show = true
        }
      },
      async deleteWebsite(id) {
        console.log('===deleteWebsite')
        if (id == '' || id == null || id == undefined) {
          alert('查無id')
          return false
        }

        let ls_url = `http://localhost:5252/api/company_website/${id}`

        this.$baseConfirm(
          '確定要刪除?',
          null,
          async () => {
            await axios
              .delete(ls_url)
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

            //成功就重整
            if (this.return_success == 'Y') {
              this.getWebsite()
            }
          },
          () => {
            //do nothing
          }
        )
      },
      async deletePic(id) {
        console.log('===deletePic')
        if (id == '' || id == null || id == undefined) {
          alert('查無id')
          return false
        }

        let ls_url = `http://localhost:5252/api/company_pic/${id}`

        await axios
          .delete(ls_url)
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

        //成功就重整
        if (this.return_success == 'Y') {
          this.getPic()
        }
      },
      async deleteRelation(id) {
        console.log('===deleteRelation')
        if (id == '' || id == null || id == undefined) {
          alert('查無id')
          return false
        }

        this.$baseAlert('注意: 刪除只會刪除此一資料, 如之前有一次新增兩筆資料, 則需做兩次刪除。')

        let ls_url = `http://localhost:5252/api/company_relation/${id}`

        await axios
          .delete(ls_url)
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

        //成功就重整
        if (this.return_success == 'Y') {
          this.getRelation()
        }
      },
      save() {
        console.log('===save')
        this.$refs['form'].validate(async (valid) => {
          if (valid) {
            if (!this.form_lock) {
              console.log('新增')
              this.title = '新增'
              this.url = 'http://localhost:5252/api/company'
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
              this.url = `http://localhost:5252/api/company/${this.form.c_id}`
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

            //成功就關閉視窗
            if (this.return_success == 'Y') {
              this.dialogFormVisible = false
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

<style scoped>
  .demo-image .block {
    padding: 10px 0;
    text-align: center;
    border-right: solid 1px var(--el-border-color);
    display: inline-block;
    width: 20%;
    box-sizing: border-box;
    vertical-align: top;
  }
  .demo-image .block:last-child {
    border-right: none;
  }
  .demo-image .demonstration {
    display: block;
    color: var(--el-text-color-secondary);
    font-size: 14px;
    margin-bottom: 10px;
  }
</style>
