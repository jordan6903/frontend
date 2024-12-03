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

      <el-form-item label="分類" prop="type_id">
        <el-select v-model="form.type_id" :disabled="form_lock" placeholder="請選擇分類">
          <el-option v-for="type in form_type" :key="type.type_id" :label="type.type_id + ' ' + type.name" :value="type.type_id" />
        </el-select>
      </el-form-item>

      <el-form-item label="分數" prop="score">
        <el-input v-model.number="form.score" autocomplete="off" maxlength="3" type="number" />
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
  import axios from '@/utils/request2'

  export default {
    name: 'TableEdit',
    data() {
      return {
        url: '',
        params: '',
        return_msg: '',
        return_success: '',
        searchword: '',
        search_product: [],
        form: {
          p_id: '',
          type_id: '',
          score: 0,
        },
        form_type: [],
        form_lock: false,
        rules: {
          p_id: [{ required: true, trigger: 'blur', message: '請輸入代號' }],
          type_id: [{ required: true, trigger: 'blur', message: '請選擇分類' }],
          score: [{ required: true, trigger: 'blur', message: '請輸入名稱' }],
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
      save() {
        console.log('===save')
        this.$refs['form'].validate(async (valid) => {
          if (valid) {
            if (!this.form_lock) {
              console.log('新增')
              this.title = '新增'
              this.url = 'http://localhost:5252/api/product_score'
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
              this.url = `http://localhost:5252/api/product_score/${this.form.id}`
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
