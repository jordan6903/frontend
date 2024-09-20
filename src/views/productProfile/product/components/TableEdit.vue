<template>
  <el-dialog :title="title" :visible.sync="dialogFormVisible" width="500px" @close="close">
    <el-form ref="form" label-width="80px" :model="form" :rules="rules">
      <el-form-item label="代碼" prop="p_id">
        <el-input v-model.trim="form.p_id" autocomplete="off" :disabled="form_lock" maxlength="10" />
      </el-form-item>
      <el-form-item label="公司" prop="c_id">
        <el-select v-model="form.c_id" filterable placeholder="請選擇公司">
          <el-option v-for="type in form_type" :key="type.c_id" :label="type.c_id + ' ' + type.name" :value="type.c_id" />
        </el-select>
        &nbsp;
        <el-button icon="el-icon-plus" type="primary" @click="showCompanyInput">新增公司</el-button>
      </el-form-item>
      <el-form-item v-show="newCompany_show" label="新增公司" prop="newCompany">
        <el-input v-model.trim="newCompany.c_id" autocomplete="off" maxlength="10" placeholder="代號" />
        <el-input v-model.trim="newCompany.name" autocomplete="off" maxlength="200" placeholder="公司名稱" />
        <el-select v-model="newCompany.c_type" placeholder="請選擇類型">
          <el-option v-for="type in company_type" :key="type.c_type" :label="type.c_type + ' ' + type.c_type_name" :value="type.c_type" />
        </el-select>
        <el-button type="primary" @click="saveNewCompany">新公司存檔</el-button>
      </el-form-item>
      <el-form-item label="遊戲名稱" prop="name">
        <el-input v-model.trim="form.name" autocomplete="off" maxlength="200" />
      </el-form-item>
      <el-form-item label="中文名稱" prop="c_Name">
        <el-input v-model.trim="form.c_Name" autocomplete="off" maxlength="200" />
      </el-form-item>
      <el-form-item label="介紹" prop="content">
        <el-input v-model="form.content" autocomplete="off" maxlength="300" type="textarea" />
      </el-form-item>
      <el-form-item label="類型" prop="content_style">
        <el-input v-model.trim="form.content_style" autocomplete="off" maxlength="100" />
      </el-form-item>
      <el-form-item label="遊玩時數" prop="play_time">
        <el-input v-model.trim="form.play_time" autocomplete="off" maxlength="50" />
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
        url: 'http://localhost:5252/api/company_type',
        params: '',
        return_msg: '',
        return_success: '',
        newCompany_show: false,
        newCompany: {
          c_id: '',
          name: '',
          c_type: '',
        },
        company_type: [],
        form: {
          p_id: '',
          c_id: '',
          name: '',
          c_Name: '',
          content: '',
          content_style: '',
          play_time: '',
          remark: '',
        },
        form_type: [],
        form_lock: false,
        rules: {
          p_id: [{ required: true, trigger: 'blur', message: '請輸入代號' }],
          c_id: [{ required: true, trigger: 'blur', message: '請選擇公司' }],
          name: [{ required: true, trigger: 'blur', message: '請輸入遊戲名稱' }],
        },
        title: '',
        dialogFormVisible: false,
      }
    },
    created() {},
    methods: {
      showEdit(row, list_type) {
        console.log('===showEdit')
        console.log(row)
        console.log(list_type)
        if (!row) {
          this.title = '新增'
          this.form_lock = false
        } else {
          this.title = '編輯'
          this.form = Object.assign({}, row)
          this.form_lock = true
        }
        this.form_type = list_type
        this.dialogFormVisible = true

        this.getCompanyType()
      },
      async getCompanyType() {
        console.log('getCompanyType')

        let ls_url = `${this.url}?UseYN=Y`

        //分類
        await axios
          .get(ls_url)
          .then((response) => (this.company_type = response.data))
          .catch(function (error) {
            console.log(error)
          })
      },
      showCompanyInput() {
        if (this.newCompany_show) {
          this.newCompany_show = false
        } else {
          this.newCompany_show = true
        }
      },
      close() {
        console.log('===close')
        this.$refs['form'].resetFields()
        this.form = this.$options.data().form
        this.dialogFormVisible = false
        this.$emit('fetch-data')
      },
      toUpperCase(event) {
        this.form.p_id = event.toUpperCase()
      },
      save() {
        console.log('===save')
        this.$refs['form'].validate(async (valid) => {
          if (valid) {
            if (!this.form_lock) {
              console.log('新增')
              this.title = '新增'
              this.url = 'http://localhost:5252/api/product'
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
              this.url = `http://localhost:5252/api/product/${this.form.p_id}`
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
              this.$refs['form'].resetFields()
              this.dialogFormVisible = false
              this.$emit('fetch-data')
              this.form = this.$options.data().form
            }
          } else {
            return false
          }
        })
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
          this.form_type = []

          await axios
            .get('http://localhost:5252/api/company')
            .then((response) => (this.form_type = response.data))
            .catch(function (error) {
              // 请求失败处理
              console.log(error)
            })

          this.form.c_id = this.newCompany.c_id

          this.newCompany.c_id = ''
          this.newCompany.name = ''
          this.newCompany.c_type = ''
          this.newCompany_show = false
        }
      },
    },
  }
</script>
