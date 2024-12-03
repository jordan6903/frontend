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

      <el-form-item label="名稱" prop="name">
        <el-input v-model.trim="form.name" autocomplete="off" maxlength="200" />
      </el-form-item>

      <el-form-item label="發售日" prop="sale_Date">
        <el-input v-model.trim="form.sale_Date" autocomplete="off" maxlength="8" />
      </el-form-item>
      <el-form-item label="開放預售" prop="presale_Date">
        <el-input v-model.trim="form.presale_Date" autocomplete="off" maxlength="8" />
      </el-form-item>
      <el-form-item label="價格" prop="price">
        <el-input v-model.number="form.price" autocomplete="off" maxlength="10" type="number" />
      </el-form-item>

      <el-form-item label="語音" prop="voice_id">
        <el-select v-model="form.voice_id" placeholder="請選擇分類">
          <el-option v-for="type in form_voice" :key="type.voice_id" :label="type.voice_id + ' ' + type.name" :value="type.voice_id" />
        </el-select>
      </el-form-item>
      <el-form-item label="貨幣" prop="currency_id">
        <el-select v-model="form.currency_id" placeholder="請選擇分類">
          <el-option
            v-for="type in form_currency"
            :key="type.currency_id"
            :label="type.currency_id + ' ' + type.shortName"
            :value="type.currency_id"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="機種" prop="device_id">
        <el-select v-model="form.device_id" placeholder="請選擇分類">
          <el-option
            v-for="type in form_device"
            :key="type.device_id"
            :label="type.device_id + ' ' + type.shortName"
            :value="type.device_id"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="分級" prop="rating_id">
        <el-select v-model="form.rating_id" placeholder="請選擇分類">
          <el-option v-for="type in form_rating" :key="type.rating_id" :label="type.rating_id + ' ' + type.name" :value="type.rating_id" />
        </el-select>
      </el-form-item>

      <el-form-item label="敘述" prop="content">
        <el-input v-model.trim="form.content" autocomplete="off" maxlength="200" />
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
          name: '',
          sale_Date: '',
          presale_Date: '',
          price: 0,
          voice_id: 0,
          currency_id: 'XXX',
          content: '',
          device_id: 'XXXXX',
          rating_id: 0,
        },
        form_voice: [],
        form_currency: [],
        form_device: [],
        form_rating: [],
        form_lock: false,
        rules: {
          p_id: [{ required: true, trigger: 'blur', message: '請輸入代號' }],
          sale_Date: [{ required: true, trigger: 'blur', message: '請輸入發售日' }],
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

        this.form_voice = list_type.voice_type
        this.form_currency = list_type.currency_type
        this.form_device = list_type.device_type
        this.form_rating = list_type.rating_type
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
              this.url = 'http://localhost:5252/api/product_release_day'
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
              this.url = `http://localhost:5252/api/product_release_day/${this.form.id}`
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
