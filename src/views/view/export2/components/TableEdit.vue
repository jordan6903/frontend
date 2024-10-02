<template>
  <el-dialog :title="title" :visible.sync="dialogFormVisible" width="500px" @close="close">
    <el-form ref="form" label-width="80px" :model="form" :rules="rules">
      <template v-if="!form_lock">
        <el-form-item label="遊戲搜尋">
          <el-col :span="16">
            <el-input v-model.trim="searchword" autocomplete="off" />
          </el-col>
          &nbsp;
          <el-button icon="el-icon-search" type="primary" @click="productQuery">查詢</el-button>
        </el-form-item>
        <el-form-item label="遊戲代碼" prop="p_id">
          <el-select v-model="form.p_id" placeholder="請選擇遊戲">
            <el-option v-for="type in search_product" :key="type.p_id" :label="type.p_id + ' - ' + type.name" :value="type.p_id" />
          </el-select>
          &nbsp;
          <el-tag v-if="search_product && search_product.length === 0" type="info">未匯入遊戲</el-tag>
          <el-tag v-else>已匯入遊戲</el-tag>
        </el-form-item>
      </template>

      <template v-else>
        <el-form-item label="遊戲代碼" prop="p_id">
          <el-input v-model.trim="form.p_id" autocomplete="off" :disabled="form_lock" maxlength="10" />
        </el-form-item>

        <el-form-item label="遊戲名稱">
          <el-input v-model.trim="form.p_Name" autocomplete="off" :disabled="form_lock" />
        </el-form-item>
      </template>

      <template v-if="!form_lock">
        <el-form-item label="人員搜尋">
          <el-col :span="16">
            <el-input v-model.trim="searchword2" autocomplete="off" />
          </el-col>
          &nbsp;
          <el-button icon="el-icon-search" type="primary" @click="staffQuery">查詢</el-button>
        </el-form-item>
        <el-form-item label="人員代碼" prop="staff_id">
          <el-select v-model="form.staff_id" placeholder="請選擇人員">
            <el-option
              v-for="type in search_staff"
              :key="type.staff_id"
              :label="type.staff_id + ' - ' + type.name"
              :value="type.staff_id"
            />
          </el-select>
          &nbsp;
          <el-tag v-if="search_staff && search_staff.length === 0" type="info">未匯入人員</el-tag>
          <el-tag v-else>已匯入人員</el-tag>
          &nbsp;
          <el-button icon="el-icon-plus" type="primary" @click="showStaffInput">新增人員</el-button>
        </el-form-item>

        <el-form-item v-show="newStaff_show" label="新增人員" prop="newStaff">
          <el-input v-model.trim="newStaff.staff_id" autocomplete="off" maxlength="10" placeholder="代號" />
          <el-input v-model.trim="newStaff.name" autocomplete="off" maxlength="100" placeholder="人名" />
          <el-button type="primary" @click="saveNewStaff">新人員存檔</el-button>
        </el-form-item>
      </template>

      <template v-else>
        <el-form-item label="人員代碼" prop="staff_id">
          <el-input v-model.trim="form.staff_id" autocomplete="off" :disabled="form_lock" maxlength="10" />
        </el-form-item>

        <el-form-item label="人員名稱">
          <el-input v-model.trim="form.staff_Name" autocomplete="off" :disabled="form_lock" />
        </el-form-item>
      </template>

      <el-form-item label="工作類型" prop="staff_typeid">
        <el-select v-model="form.staff_typeid" placeholder="請選擇分類">
          <el-option
            v-for="type in form_type"
            :key="type.staff_typeid"
            :label="type.staff_typeid + ' ' + type.name"
            :value="type.staff_typeid"
          />
        </el-select>
      </el-form-item>

      <el-form-item label="備註" prop="remark">
        <el-input v-model.trim="form.remark" autocomplete="off" maxlength="50" />
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
        url: '',
        newStaff_show: false,
        params: '',
        return_msg: '',
        return_success: '',
        searchword: '',
        search_product: [],
        searchword2: '',
        search_staff: [],
        form: {
          p_id: '',
          staff_id: '',
          staff_typeid: 0,
          remark: '',
        },
        form_type: [],
        form_info: [],
        form_lock: false,
        newStaff: {
          staff_id: '',
          name: '',
          content: '',
        },
        rules: {
          p_id: [{ required: true, trigger: 'blur', message: '請輸入代號' }],
          staff_id: [{ required: true, trigger: 'blur', message: '請選擇人員' }],
          staff_typeid: [{ required: true, trigger: 'blur', message: '請選擇工作類型' }],
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
        this.dialogFormVisible = true

        this.form_type = list_type.type
        this.form_info = list_type.info
      },
      showStaffInput() {
        if (this.newStaff_show) {
          this.newStaff_show = false
        } else {
          this.newStaff_show = true
        }
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
        ls_url += `?searchword=${this.searchword}`
        await axios
          .get(ls_url)
          .then((response) => (this.search_product = response.data))
          .catch(function (error) {
            console.log(error)
          })
      },
      async staffQuery() {
        let ls_url = 'http://localhost:5252/api/staff_info'
        ls_url += `?searchword=${this.searchword2}`
        await axios
          .get(ls_url)
          .then((response) => (this.search_staff = response.data))
          .catch(function (error) {
            console.log(error)
          })
      },
      async saveNewStaff() {
        console.log('===saveNewStaff')
        if (this.newStaff.staff_id == '' || this.newStaff.staff_id == null || this.newStaff.staff_id == undefined) {
          alert('請輸入人員id')
          return false
        }
        if (this.newStaff.name == '' || this.newStaff.name == null || this.newStaff.name == undefined) {
          alert('請輸入人員name')
          return false
        }

        let ls_url = 'http://localhost:5252/api/staff_info'
        this.params = this.newStaff

        console.log(this.newStaff)
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
            .get('http://localhost:5252/api/staff_info')
            .then((response) => (this.form_info = response.data))
            .catch(function (error) {
              // 请求失败处理
              console.log(error)
            })

          this.newStaff.staff_id = ''
          this.newStaff.name = ''
          this.newStaff_show = false
        }
      },
      save() {
        console.log('===save')
        this.$refs['form'].validate(async (valid) => {
          if (valid) {
            if (!this.form_lock) {
              console.log('新增')
              this.title = '新增'
              this.url = 'http://localhost:5252/api/staff'
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
              this.url = `http://localhost:5252/api/staff/${this.form.id}`
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
              //this.$refs['form'].resetFields()
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
