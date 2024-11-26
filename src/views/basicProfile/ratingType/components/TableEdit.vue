<template>
  <el-dialog :title="title" :visible.sync="dialogFormVisible" width="500px" @close="close">
    <el-form ref="form" label-width="80px" :model="form" :rules="rules">
      <el-form-item label="ID" prop="rating_type">
        <el-input v-model.number="form.rating_type" autocomplete="off" :disabled="form_lock" maxlength="3" type="number" />
      </el-form-item>
      <el-form-item label="名稱" prop="name">
        <el-input v-model.trim="form.name" autocomplete="off" maxlength="100" />
      </el-form-item>
      <el-form-item label="簡稱" prop="shortName">
        <el-input v-model.trim="form.shortName" autocomplete="off" maxlength="100" />
      </el-form-item>
      <el-form-item label="敘述" prop="content">
        <el-input v-model.trim="form.content" autocomplete="off" maxlength="20" />
      </el-form-item>
      <el-form-item label="啟用" prop="use_yn">
        <el-switch v-model="form.use_yn" />
      </el-form-item>
      <el-form-item label="排序" prop="sort">
        <el-input v-model.number="form.sort" autocomplete="off" maxlength="3" type="number" />
      </el-form-item>
      <el-form-item label="更新時間">{{ form.upd_date }}</el-form-item>
      <el-form-item label="建立時間">{{ form.create_dt }}</el-form-item>
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
          rating_type: '',
          name: '',
          shortName: '',
          content: '',
          use_yn: true,
          sort: 0,
        },
        form_lock: false,
        rules: {
          rating_type: [{ required: true, trigger: 'blur', message: '請輸入代號' }],
          name: [{ required: true, trigger: 'blur', message: '請輸入名稱' }],
          shortName: [{ required: true, trigger: 'blur', message: '請輸入簡稱' }],
        },
        title: '',
        dialogFormVisible: false,
      }
    },
    created() {},
    methods: {
      showEdit(row) {
        console.log('===showEdit')
        console.log(row)
        if (!row) {
          this.title = '新增'
          this.form_lock = false
        } else {
          this.title = '編輯'
          this.form = Object.assign({}, row)
          this.form_lock = true
        }
        this.dialogFormVisible = true
      },
      close() {
        console.log('===close')
        this.dialogFormVisible = false
      },
      toUpperCase(event) {
        this.form.rating_type = event.toUpperCase()
      },
      save() {
        console.log('===save')
        this.$refs['form'].validate(async (valid) => {
          if (valid) {
            if (!this.form_lock) {
              console.log('新增')
              this.title = '新增'
              this.url = 'http://localhost:5252/api/rating_type'
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
              this.url = `http://localhost:5252/api/rating_type/${this.form.rating_type}`
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
