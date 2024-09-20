<template>
  <el-dialog :title="title" :visible.sync="dialogFormVisible" width="500px" @close="close">
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
        params: '',
        return_msg: '',
        return_success: '',
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
          this.form_type = list_type
        }
        this.dialogFormVisible = true
      },
      close() {
        console.log('===close')
        this.$refs['form'].resetFields()
        this.form = this.$options.data().form
        this.dialogFormVisible = false
        this.$emit('fetch-data')
      },
      toUpperCase(event) {
        this.form.c_id = event.toUpperCase()
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
    },
  }
</script>
