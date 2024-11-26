<template>
  <el-dialog :title="title" :visible.sync="dialogFormVisible" width="500px" @close="close">
    <el-form ref="form" label-width="80px" :model="form" :rules="rules">
      <el-form-item label="代碼">
        <el-input v-model.number="esc_id" autocomplete="off" :disabled="true" maxlength="6" type="number" />
      </el-form-item>
      <el-form-item label="代碼" prop="esps_Id">
        <el-input v-model.number="form.esps_Id" autocomplete="off" :disabled="true" maxlength="6" type="number" />
      </el-form-item>
      <el-form-item label="html內容" prop="add_word">
        <el-input v-model="form.add_word" autocomplete="off" maxlength="4000" type="textarea" />
      </el-form-item>
      <el-form-item label="啟用" prop="add_word_Use_yn">
        <el-switch v-model="form.add_word_Use_yn" />
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
        url: 'http://localhost:5252/api/export_set_product_series',
        esc_id: 0,
        esps_id: 0,
        params: '',
        return_msg: '',
        return_success: '',
        form: {
          esps_Id: '',
          add_word: '',
          add_word_Use_yn: true,
        },
        form_type: [],
        form_lock: false,
        rules: {
          esps_Id: [{ required: true, trigger: 'blur', message: '請輸入代號' }],
        },
        title: '',
        dialogFormVisible: false,
      }
    },
    created() {},
    methods: {
      async showEdit(row) {
        console.log('===showEdit')
        console.log(row)
        if (!row) {
          this.title = '新增'
          this.form_lock = false
          this.$baseMessage('查無esps_id', 'success')
        } else {
          this.title = '編輯html'
          this.form = Object.assign({}, row)
          this.form_lock = true
          this.dialogFormVisible = true

          this.esc_id = row.esC_id
          this.esps_id = row.id

          let ls_url = `${this.url}/getbyid/${this.esps_id}`

          //主資料
          await axios
            .get(ls_url)
            .then((response) => (this.form = response.data[0]))
            .catch(function (error) {
              console.log(error)
            })
        }
      },
      close() {
        console.log('===close')
        //this.$refs['form'].resetFields()
        this.form = this.$options.data().form
        this.dialogFormVisible = false
        this.$emit('fetch-data')
      },
      save() {
        console.log('===save')
        this.$refs['form'].validate(async (valid) => {
          if (valid) {
            console.log('編輯')
            this.title = '編輯'
            let ls_url = `${this.url}/putaddword/${this.esps_id}`
            this.params = this.form

            console.log(this.form)
            console.log(this.params)

            await axios
              .put(ls_url, this.params)
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

            //成功就關閉視窗
            if (this.return_success == 'Y') {
              //this.$refs['form'].resetFields()
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
