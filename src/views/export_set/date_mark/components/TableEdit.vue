<template>
  <el-dialog :title="title" :visible.sync="dialogFormVisible" width="500px" @close="close">
    <el-form ref="form" label-width="80px" :model="form" :rules="rules">
      <el-form-item label="名稱" prop="name">
        <el-input v-model.trim="form.name" autocomplete="off" maxlength="100" />
      </el-form-item>
      <el-form-item label="敘述" prop="date_mark">
        <el-date-picker v-model="form.date_mark" placeholder="選擇日期" type="date" @change="handleDateChange" />
      </el-form-item>
      <el-form-item label="啟用" prop="use_yn">
        <el-switch v-model="form.use_yn" />
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
          name: '',
          date_mark: '',
          use_yn: true,
        },
        form_type: [],
        form_lock: false,
        rules: {
          date_mark: [{ required: true, trigger: 'blur', message: '請選擇日期' }],
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
      handleDateChange(value) {
        console.log('handleDateChange')
        if (value) {
          //時間選擇器受時區偏移影響(台灣GMT+0800), 所以存入前需加上8小時
          //順帶一提, API的DateTime.Now指令不受時區偏移影響(當地什麼時間就存入什麼)
          const selectedDate = new Date(value)
          selectedDate.setHours(selectedDate.getHours() + 8)
          this.form.date_mark = selectedDate.toISOString() //ISO 字串格式，符合資料庫格式
        }
      },
      save() {
        console.log('===save')
        this.$refs['form'].validate(async (valid) => {
          if (valid) {
            if (!this.form_lock) {
              console.log('新增')
              this.title = '新增'
              this.url = 'http://localhost:5252/api/export_set_date'
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
              this.url = `http://localhost:5252/api/export_set_date/${this.form.id}`
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
