<template>
  <el-dialog :title="title" :visible.sync="dialogFormVisible" width="600px" @close="close">
    <el-form ref="form" label-width="80px">
      <el-form-item label="代碼" prop="p_id">
        <el-input v-model.trim="form.p_id" autocomplete="off" :disabled="form_lock" maxlength="10" />
      </el-form-item>

      <el-form-item label="網址">
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

        <el-button :icon="newWebsite_show ? 'el-icon-minus' : 'el-icon-plus'" type="danger" @click="showWebsiteInput">新增網址</el-button>
      </el-form-item>

      <el-form-item v-show="newWebsite_show" :label="modifyWebsite_yn ? '編輯網址' : '新增網址'">
        <el-form-item label="屬性" required>
          <el-col :span="16">
            <el-select v-model="form_website.type_id" filterable placeholder="請選擇屬性(必填)">
              <el-option
                v-for="data in type_WebsiteFilter"
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
  </el-dialog>
</template>

<script>
  import { doEdit } from '@/api/table'
  import axios from '@/utils/request2'

  export default {
    name: 'TableEdit',
    data() {
      return {
        url: 'http://localhost:5252/api/product_website',
        url2: 'http://localhost:5252/api/website_type',
        params: '',
        return_msg: '',
        return_success: '',

        data_Website: [],
        type_Website: [],

        newWebsite_show: false,
        modifyWebsite_yn: false,

        form: {},
        form_website: {
          p_id: '',
          type_id: '',
          name: '',
          url: '',
          remark: '',
          use_yn: true,
          sort: 0,
        },
        form_website_pure: {
          p_id: '',
          type_id: '',
          name: '',
          url: '',
          remark: '',
          use_yn: true,
          sort: 0,
        },
        form_lock: false,
        rules: {
          voice_id: [{ required: true, trigger: 'blur', message: '請輸入代號' }],
          name: [{ required: true, trigger: 'blur', message: '請輸入名稱' }],
          content: [{ required: true, trigger: 'blur', message: '請輸入簡稱' }],
        },
        title: '',
        dialogFormVisible: false,
      }
    },
    computed: {
      type_WebsiteFilter() {
        let DataArry = this.type_Website.filter(
          (item) => item.type_id.substring(0, 1) == 'P' && parseInt(item.type_id.substring(1, 3)) <= 40
        )
        return DataArry
      },
    },
    created() {},
    methods: {
      async showEdit(row) {
        console.log('===showEdit')
        console.log(row)
        if (!row) {
          this.title = '新增'
          this.form_lock = false
          this.dialogFormVisible = false
        } else {
          this.title = '編輯'
          this.form = Object.assign({}, row)
          this.form_lock = true
          this.dialogFormVisible = true

          this.getWebsite()
        }
      },
      close() {
        console.log('===close')
        this.dialogFormVisible = false
      },
      toUpperCase(event) {
        this.form.voice_id = event.toUpperCase()
      },
      async getWebsite() {
        let ls_url = `${this.url}`
        ls_url += `/${this.form.p_id}`

        //分類
        await axios
          .get(ls_url)
          .then((response) => (this.data_Website = response.data))
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

        let ls_url = 'http://localhost:5252/api/product_website'
        this.params = this.form_website

        this.form_website.p_id = this.form.p_id

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
          this.form_website = JSON.parse(JSON.stringify(this.form_website_pure)) //清空
          this.newWebsite_show = false
          this.getWebsite()
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
      async deleteWebsite(id) {
        console.log('===deleteWebsite')
        if (id == '' || id == null || id == undefined) {
          alert('查無id')
          return false
        }

        let ls_url = `http://localhost:5252/api/product_website/${id}`

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
    },
  }
</script>
