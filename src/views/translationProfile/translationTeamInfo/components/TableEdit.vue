<template>
  <el-dialog :title="title" :visible.sync="dialogFormVisible" width="500px" @close="close">
    <el-form ref="form" label-width="80px" :model="form" :rules="rules">
      <el-form-item label="代號" prop="t_id">
        <el-col :span="16">
          <el-input v-model.trim="form.t_id" autocomplete="off" :disabled="form_lock" maxlength="6" @input="toUpperCase($event)" />
        </el-col>
        &nbsp;
        <span v-if="!form_lock" style="color: red">建議輸入: {{ maxTid }}</span>
      </el-form-item>
      <el-form-item label="名稱" prop="name">
        <el-input v-model.trim="form.name" autocomplete="off" maxlength="100" />
      </el-form-item>
      <el-form-item label="敘述" prop="content">
        <el-input v-model.trim="form.content" autocomplete="off" maxlength="20" />
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
        return_msg: [],
        maxTid: '',
        form: {
          t_id: '',
          name: '',
          content: '',
        },
        form_lock: false,
        rules: {
          t_id: [{ required: true, trigger: 'blur', message: '請輸入代號' }],
          name: [{ required: true, trigger: 'blur', message: '請輸入名稱' }],
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
          this.maxTid = `T${li_tmp.toString()}`
        } else {
          this.title = '編輯'
          this.form = Object.assign({}, row)
          this.form_lock = true
        }
        this.dialogFormVisible = true
      },
      close() {
        console.log('===close')
        //this.$refs['form'].resetFields()
        this.form = this.$options.data().form
        this.dialogFormVisible = false
        this.$emit('fetch-data')
      },
      toUpperCase(event) {
        this.form.t_id = event.toUpperCase()
      },
      save() {
        console.log('===save')
        this.$refs['form'].validate(async (valid) => {
          if (valid) {
            if (!this.form_lock) {
              console.log('新增')
              this.title = '新增'
              this.url = 'http://localhost:5252/api/translation_team_info'
              this.params = this.form

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
              this.url = `http://localhost:5252/api/translation_team_info/${this.form.t_id}`
              this.params = this.form

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
