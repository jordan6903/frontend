<template>
  <el-dialog :title="title" :visible.sync="dialogFormVisible" width="500px" @close="close">
    <el-form ref="form" label-width="80px" :model="form" :rules="rules">
      <el-form-item label="代碼" prop="rating_id">
        <el-input v-model.number="form.rating_id" autocomplete="off" :disabled="form_lock" maxlength="3" type="number" />
      </el-form-item>
      <el-form-item label="分類" prop="rating_type">
        <el-select v-model="form.rating_type" placeholder="請選擇分類">
          <el-option
            v-for="type in form_type"
            :key="type.rating_type"
            :label="type.rating_type + ' ' + type.name"
            :value="type.rating_type"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="名稱" prop="name">
        <el-input v-model.trim="form.name" autocomplete="off" maxlength="100" />
      </el-form-item>
      <el-form-item label="簡稱" prop="shortName">
        <el-input v-model.trim="form.shortName" autocomplete="off" maxlength="100" />
      </el-form-item>
      <el-form-item label="日文" prop="name_JP">
        <el-input v-model.trim="form.name_JP" autocomplete="off" maxlength="100" />
      </el-form-item>
      <el-form-item label="英文" prop="name_EN">
        <el-input v-model.trim="form.name_EN" autocomplete="off" maxlength="100" />
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
          rating_id: '',
          rating_type: '',
          name: '',
          shortName: '',
          name_JP: '',
          name_EN: '',
          content: '',
          use_yn: true,
          sort: 0,
        },
        form_type: [],
        form_lock: false,
        rules: {
          rating_id: [{ required: true, trigger: 'blur', message: '請輸入代號' }],
          rating_type: [{ required: true, trigger: 'blur', message: '請選擇分類' }],
          name: [{ required: true, trigger: 'blur', message: '請輸入名稱' }],
          shortName: [{ required: true, trigger: 'blur', message: '請輸入簡稱' }],
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
        this.form.rating_id = event.toUpperCase()
      },
      save() {
        console.log('===save')
        this.$refs['form'].validate(async (valid) => {
          if (valid) {
            if (!this.form_lock) {
              console.log('新增')
              this.title = '新增'
              this.url = 'http://localhost:5252/api/rating'
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
              this.url = `http://localhost:5252/api/rating/${this.form.rating_id}`
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
