<template>
  <el-dialog :title="title" :visible.sync="dialogFormVisible" width="500px" @close="close">
    <el-form ref="form" label-width="80px" :model="form" :rules="rules">
      <el-form-item label="ID" prop="device_id">
        <el-input v-model.trim="form.device_id" autocomplete="off" :disabled="form_lock" maxlength="5" @input="toUpperCase($event)" />
      </el-form-item>
      <el-form-item label="名稱" prop="fullName">
        <el-input v-model.trim="form.fullName" autocomplete="off" maxlength="100" />
      </el-form-item>
      <el-form-item label="簡稱" prop="shortName">
        <el-input v-model.trim="form.shortName" autocomplete="off" maxlength="20" />
      </el-form-item>
      <el-form-item label="敘述" prop="content">
        <el-input v-model.trim="form.content" type="textarea" />
      </el-form-item>
      <el-form-item label="啟用" prop="use_yn">
        <el-switch v-model="form.use_yn" />
      </el-form-item>
      <el-form-item label="排序" prop="sort">
        <el-input v-model.number="form.sort" autocomplete="off" maxlength="3" type="number" />
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
        form: {
          device_id: '',
          fullName: '',
          shortName: '',
          content: '',
          use_yn: true,
          sort: 0,
        },
        form_lock: false,
        rules: {
          device_id: [{ required: true, trigger: 'blur', message: '請輸入ID' }],
          fullName: [{ required: true, trigger: 'blur', message: '請輸入名稱' }],
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
        this.$refs['form'].resetFields()
        this.form = this.$options.data().form
        this.dialogFormVisible = false
        this.$emit('fetch-data')
      },
      toUpperCase(event) {
        this.form.device_id = event.toUpperCase()
      },
      save() {
        console.log('===save')
        this.$refs['form'].validate(async (valid) => {
          if (valid) {
            if (!this.form_lock) {
              console.log('新增')
              this.title = '新增'
              this.url = 'http://localhost:5252/api/devices'
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
              this.url = `http://localhost:5252/api/devices/${this.form.device_id}`
              this.params = this.form

              await axios
                .put(this.url, this.params)
                .then((response) => (this.return_msg = response.data.message))
                .catch(function (error) {
                  // 请求失败处理
                  console.log(error)
                })
            }

            this.$baseMessage(this.return_msg, 'success')
            this.$refs['form'].resetFields()
            this.dialogFormVisible = false
            this.$emit('fetch-data')
            this.form = this.$options.data().form
            this.$refs['form'].fetchData()
          } else {
            return false
          }
        })
      },
    },
  }
</script>
