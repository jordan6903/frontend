<template>
  <el-dialog :title="title" :visible.sync="dialogFormVisible" width="1200px" @close="close">
    <div class="div_out">
      <div class="div_float">
        <div class="div_title">
          <span>存入公司</span>
          <div>
            <el-tag class="tagbtn" @click="show_nouse">剔除名單</el-tag>
            <el-tag class="tagbtn" @click="fetchData">重整</el-tag>
            <el-tag class="tagbtn" @click="list_sort">排序</el-tag>
          </div>
        </div>
        <div class="div_search">
          <input v-model="left_search" autocomplete="off" class="input_search" placeholder="請輸入代號或公司名稱" type="text" />
          <span class="input_search_icon"><i class="el-input__icon el-icon-search"></i></span>
        </div>
        <ul v-show="!nouse_show" class="ul_item_group_drag">
          <li
            v-for="(company, index) in filterList"
            :key="company.id"
            class="li_item"
            draggable="true"
            @dragend="dragEnd"
            @dragover="overDrop($event)"
            @dragstart="dragStart($event, index)"
            @drop="drop($event, index)"
          >
            <input v-model="left_select" class="checkbox" name="list" type="checkbox" :value="company.id" />
            <label :for="company.id">{{ company.sort }} - {{ company.c_Name }}</label>
          </li>
        </ul>
        <ul v-show="nouse_show" class="ul_item_group_drag">
          <li
            v-for="(company, index) in filterList_nouse"
            :key="company.id"
            class="li_item"
            draggable="true"
            @dragend="dragEnd"
            @dragover="overDrop($event)"
            @dragstart="dragStart($event, index)"
            @drop="drop($event, index)"
          >
            <input v-model="left_select_nouse" class="checkbox" name="list" type="checkbox" :value="company.id" />
            <label :for="company.id">{{ company.sort }} - {{ company.c_Name }}</label>
          </li>
        </ul>
      </div>

      <div class="div_middle">
        <div class="div_arrow">
          <div class="arrow">
            <button class="el-button el-button--primary" type="button" @click="insert_company">
              <span><i class="el-icon-arrow-left"></i></span>
            </button>
          </div>
          <div class="arrow">
            <button class="el-button el-button--primary" type="button" @click="delete_company">
              <span><i class="el-icon-arrow-right"></i></span>
            </button>
          </div>
        </div>

        <div v-show="insert_row_show" class="arrow">
          <button class="el-button el-button--primary" type="button" @click="list_sort_to">
            <span>插入</span>
          </button>
        </div>

        <div v-show="insert_row_show">
          <el-input v-model.trim="insert_row" autocomplete="off" maxlength="5" oninput="value=value.replace(/[^0-9]/g,'')" type="number" />
        </div>

        <div class="div_arrow">
          <div v-show="!nouse_show" class="arrow">
            <button class="el-button el-button--primary" type="button" @click="set_nouse">
              <span>剔除</span>
            </button>
          </div>
          <div v-show="nouse_show" class="arrow">
            <button class="el-button el-button--primary" type="button" @click="set_yesuse">
              <span>還原</span>
            </button>
          </div>
        </div>
      </div>

      <div class="div_float">
        <div class="div_title">
          <span>選擇公司</span>
        </div>
        <div class="div_search">
          <input v-model="right_search" autocomplete="off" class="input_search" placeholder="請輸入代號或公司名稱" type="text" />
          <span class="input_search_icon"><i class="el-input__icon el-icon-search"></i></span>
        </div>
        <ul class="ul_item_group">
          <li v-for="company in filterItem" :key="company.id" class="li_item">
            <input v-model="right_select" class="checkbox" name="list" type="checkbox" :value="company.c_id" />
            <label :for="company.c_id">{{ company.name }}</label>
          </li>
        </ul>
      </div>
    </div>

    <!--
    <div slot="footer" class="dialog-footer">
      <el-button @click="close">取 消</el-button>
      <el-button type="primary" @click="save">確 定</el-button>
    </div>
    -->
  </el-dialog>
</template>

<script>
  import { doEdit } from '@/api/table'

  export default {
    name: 'CompanyEdit',
    data() {
      return {
        export_batch: 0,
        url: 'http://localhost:5252/api/export_set_company',
        url2: 'http://localhost:5252/api/company',
        url3: 'http://localhost:5252/api/export_set_company/several',

        //右側選單
        company: [], //公司 原始資料(不動)
        item: [], //公司 存取資料(更動)
        right_select: [],
        right_search: '',

        //左側選單
        list: [],
        list_nouse: [], //剔除選單
        left_select: [],
        left_select_nouse: [],
        left_search: '',
        nouse_show: false,

        //中間插入sort
        insert_row: 0,

        drag_startindex: 0,

        params: '',
        return_msg: '',
        return_success: '',

        //複製用
        form: {
          export_batch: 0,
          c_id: '',
          use_yn: false,
          sort: 0,
        },
        form2: {
          id: 0,
          sort: 0,
        },
        insert_form: [], //存檔用
        update_form: [],

        //清空用
        form_clear: {
          export_batch: 0,
          c_id: '',
          use_yn: false,
          sort: 0,
        },
        form_clear2: {
          id: 0,
          sort: 0,
        },
        form_type: [],
        rules: {
          export_batch: [{ required: true, trigger: 'blur', message: '請輸入代號' }],
          content: [{ required: true, trigger: 'blur', message: '請輸入敘述' }],
        },
        title: '',
        dialogFormVisible: false,
      }
    },
    computed: {
      filterList() {
        let DataArry = this.list.filter(
          (item) =>
            item.c_Name.toLowerCase().includes(this.left_search.toLowerCase()) ||
            item.c_id.toLowerCase().includes(this.left_search.toLowerCase())
        )
        return DataArry
      },
      filterList_nouse() {
        let DataArry = this.list_nouse.filter(
          (item) =>
            item.c_Name.toLowerCase().includes(this.left_search.toLowerCase()) ||
            item.c_id.toLowerCase().includes(this.left_search.toLowerCase())
        )
        return DataArry
      },
      filterItem() {
        let DataArry = this.item.filter(
          (item) =>
            item.name.toLowerCase().includes(this.right_search.toLowerCase()) ||
            item.c_id.toLowerCase().includes(this.right_search.toLowerCase())
        )
        return DataArry
      },
      insert_row_show() {
        return this.right_select.length > 0 || this.left_select.length > 0 ? true : false
      },
    },
    created() {
      console.log('created')
    },
    methods: {
      showEdit(batch) {
        console.log('===showEdit')
        console.log(batch)
        this.title = '公司排序'
        this.export_batch = batch
        this.dialogFormVisible = true

        this.company = []
        this.item = []
        this.fetchData()
      },

      //準備選單data
      async generateData() {
        console.log('generateData')
        let lb_chk = false
        this.item = []

        for (let i = 0; i < this.company.length; i++) {
          for (let j = 0; j < this.list.length; j++) {
            if (this.company[i]['c_id'] == this.list[j]['c_id']) {
              lb_chk = true //標記有重複
            }
          }

          for (let j = 0; j < this.list_nouse.length; j++) {
            if (this.company[i]['c_id'] == this.list_nouse[j]['c_id']) {
              lb_chk = true //標記有重複
            }
          }

          if (!lb_chk) this.item.push(this.company[i]) //只放入沒重複的
          lb_chk = false //重置
        }
      },
      async fetchData() {
        console.log('fetchData')

        let ls_batch = this.export_batch

        let ls_url = `${this.url}/${ls_batch}?UseYN=Y`
        let ls_url2 = `${this.url2}`
        let ls_url3 = `${this.url}/${ls_batch}?UseYN=N`

        //主資料
        await axios
          .get(ls_url)
          .then((response) => (this.list = response.data))
          .catch(function (error) {
            console.log(error)
          })

        //公司
        await axios
          .get(ls_url2)
          .then((response) => (this.company = response.data))
          .catch(function (error) {
            console.log(error)
          })

        //剔除選單
        await axios
          .get(ls_url3)
          .then((response) => (this.list_nouse = response.data))
          .catch(function (error) {
            console.log(error)
          })

        this.generateData()
        //this.setPdata();
        //this.enableDragSort('ul_item_group_drag');

        this.timeOutID = setTimeout(() => {
          this.listLoading = false
        }, 500)
      },
      async item_select(index) {
        console.log(`item_select index:${index}`)
      },
      clear() {
        console.log('clear')
        this.company = []
        this.item = []
        this.right_select = []
        this.left_select = []

        this.form = this.form_clear
        this.form2 = this.form_clear2
        this.insert_form = []
        this.update_form = []
      },
      close() {
        console.log('===close')
        //this.$refs['form'].resetFields()
        //this.form = this.$options.data().form
        //this.dialogFormVisible = false
        //this.$emit('fetch-data')
        this.$emit('trigger-handleQuery')
      },

      //重新排序
      list_sort() {
        console.log('list_sort')
        for (let i = 0; i < this.list.length; i++) {
          this.list[i].sort = i + 1
        }
        this.save()

        setTimeout(() => {
          this.fetchData()
        }, 500)
      },

      //純排序不存檔
      list_sort_sub() {
        console.log('list_sort_sub')
        for (let i = 0; i < this.list.length; i++) {
          this.list[i].sort = i + 1
        }
      },

      //針對選擇的陣列做排序
      select_sort() {
        console.log('reset_select')

        let array1 = this.left_select
        let array2 = []
        for (let i = 0; i < this.list.length; i++) {
          for (var j = 0; j < this.left_select.length; j++) {
            if (this.left_select[j] == this.list[i]['id']) {
              array2.push(this.list[i])
            }
          }
        }

        array2.sort((a, b) => a.sort - b.sort) //根據 sort 進行排序
        array1 = array2.map((item) => item.id)

        this.left_select = array1
      },

      //騰出空間, 從start開始空出arg的空間
      list_make_space(start, arg) {
        console.log('list_make_space')
        for (let i = start - 1; i < this.list.length; i++) {
          this.list[i].sort = parseInt(i) + 1 + parseInt(arg)
        }
        this.save()
        this.fetchData()
      },

      //左側選單 根據輸入值移到指定位置
      list_sort_to() {
        console.log('list_sort_to')
        let li_arg = this.left_select.length //移動的總列數

        if (li_arg == 0) {
          alert('請選擇項目')
        } else if (this.insert_row == 0) {
          alert('請選擇插入值')
        } else {
          console.log('start')
          this.select_sort() //先做排序

          let li_insert_row = this.insert_row - 1

          console.log(this.left_select)

          let ls_tmplist = [] //暫存陣列
          let li_firstsort //勾選的第一個的index
          let li_lastsort //勾選的最後一個的index

          //抓出範圍index
          for (let i = this.list.length - 1; i > -1; i--) {
            //順便記錄
            if (this.list[i]['id'] == this.left_select[0]) {
              li_firstsort = i
            }

            if (this.list[i]['id'] == this.left_select[this.left_select.length - 1]) {
              li_lastsort = i
            }
          }

          console.log(`li_firstsort: ${li_firstsort}`)
          console.log(`li_lastsort: ${li_lastsort}`)
          console.log(this.list)

          //輸入值在指定範圍內
          if (li_insert_row >= li_firstsort && li_insert_row <= li_lastsort) {
            alert('插入值在選定範圍內, 請重新輸入')
          }
          //往上移
          else if (li_insert_row < li_firstsort) {
            //從後面開始抓, 先插入前面再刪掉後面
            for (let i = this.list.length - 1; i > -1; i--) {
              for (let j = li_arg - 1; j > -1; j--) {
                if (this.list[i]['id'] == this.left_select[j]) {
                  this.list.splice(li_insert_row, 0, this.list[i])
                  this.list.splice(i + 1, 1) //刪除該元素
                }
              }
            }
          }
          //往下移
          else if (li_insert_row > li_lastsort) {
            //從前面開始抓, 先插入後面再刪掉前面
            for (let i = 0; i < this.list.length; i++) {
              for (let j = 0; j < li_arg; j++) {
                if (this.list[i]['id'] == this.left_select[j]) {
                  this.list.splice(li_insert_row + 1, 0, this.list[i])
                  this.list.splice(i, 1) //刪除該元素
                }
              }
            }
          }
          this.list_sort()
          //this.save();
          //this.fetchData();
        }
      },

      show_nouse() {
        console.log('show_nouse')
        if (this.nouse_show) {
          this.nouse_show = false
        } else {
          this.nouse_show = true
        }
      },

      async set_nouse() {
        console.log('set_nouse')

        if (this.right_select.length == 0 && this.left_select.length == 0) {
          alert('請選擇項目')
        } else {
          console.log(this.right_select)
          console.log(this.left_select)

          //先處理右邊
          for (let i = 0; i < this.right_select.length; i++) {
            this.insert_form.push({
              export_batch: this.export_batch,
              c_id: this.right_select[i],
              use_yn: false,
              sort: 0,
            })
          }

          console.log(this.insert_form)

          await axios
            .post(this.url3, this.insert_form)
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

          //再來弄左邊
          for (let i = 0; i < this.left_select.length; i++) {
            for (let j = 0; j < this.list.length; j++) {
              if (this.left_select[i] == this.list[j]['id']) {
                this.update_form.push({
                  id: this.list[j]['id'],
                  use_yn: false,
                  sort: this.list[j]['sort'],
                })
                break
              }
            }
          }

          console.log(this.update_form)

          await axios
            .put(this.url3, this.update_form)
            .then((response) => (this.return_msg = response.data.message))
            .catch(function (error) {
              // 请求失败处理
              console.log(error)
            })

          //拆解
          msg_array = this.return_msg.split('#')
          this.return_success = msg_array[0]
          this.return_msg = msg_array[1]

          this.$baseMessage(this.return_msg, 'success')

          //成功就重新讀取
          if (this.return_success == 'Y') {
            this.clear()
            setTimeout(() => {
              this.fetchData()
            }, 500)
          }
        }
      },

      async set_yesuse() {
        console.log('set_nouse')

        if (this.left_select_nouse.length == 0) {
          alert('剔除選單請選擇項目')
        } else {
          for (let i = 0; i < this.left_select_nouse.length; i++) {
            for (let j = 0; j < this.list_nouse.length; j++) {
              if (this.left_select_nouse[i] == this.list_nouse[j]['id']) {
                this.update_form.push({
                  id: this.list_nouse[j]['id'],
                  use_yn: true,
                  sort: this.list_nouse[j]['sort'],
                })
                break
              }
            }
          }

          console.log(this.update_form)

          await axios
            .put(this.url3, this.update_form)
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

          //成功就重新讀取
          if (this.return_success == 'Y') {
            this.clear()
            setTimeout(() => {
              this.fetchData()
            }, 500)
          }
        }
      },

      //新增公司
      async insert_company() {
        console.log('insert_company')

        if (this.right_select.length == 0) {
          alert('請選擇項目')
        } else {
          console.log(this.right_select)

          let li_sort_start
          if (this.insert_row == 0) {
            li_sort_start = this.list.length + 1
          } else {
            this.list_make_space(this.insert_row, this.right_select.length) //先騰出空間
            li_sort_start = this.insert_row
          }

          for (let i = 0; i < this.right_select.length; i++) {
            this.insert_form.push({
              export_batch: this.export_batch,
              c_id: this.right_select[i],
              use_yn: true,
              sort: li_sort_start,
            })
            li_sort_start++
          }

          console.log(this.insert_form)

          await axios
            .post(this.url3, this.insert_form)
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

          //成功就重新讀取
          if (this.return_success == 'Y') {
            this.clear()
            setTimeout(() => {
              this.fetchData()
            }, 500)
          }
        }
      },

      //刪除公司
      async delete_company() {
        console.log('delete_company')

        if (this.left_select.length == 0 && this.left_select_nouse.length == 0) {
          alert('請選擇項目')
        } else {
          console.log(this.left_select)
          console.log(this.left_select_nouse)
          let msg_array,
            lb_chk = false

          for (let i = 0; i < this.left_select.length; i++) {
            let ls_url = this.url
            ls_url += `/${this.left_select[i]}`
            console.log(ls_url)

            await axios
              .delete(ls_url)
              .then((response) => (this.return_msg = response.data.message))
              .catch(function (error) {
                // 请求失败处理
                console.log(error)
              })

            msg_array = this.return_msg.split('#')
            this.return_success = msg_array[0]
            this.return_msg = msg_array[1]

            if (this.return_success == 'Y') {
              lb_chk = true
            } else {
              this.$baseMessage(this.return_msg, 'success')
              break
            }
          }

          for (let i = 0; i < this.left_select_nouse.length; i++) {
            let ls_url = this.url
            ls_url += `/${this.left_select_nouse[i]}`
            console.log(ls_url)

            await axios
              .delete(ls_url)
              .then((response) => (this.return_msg = response.data.message))
              .catch(function (error) {
                // 请求失败处理
                console.log(error)
              })

            msg_array = this.return_msg.split('#')
            this.return_success = msg_array[0]
            this.return_msg = msg_array[1]

            if (this.return_success == 'Y') {
              lb_chk = true
            } else {
              this.$baseMessage(this.return_msg, 'success')
              break
            }
          }

          this.clear()
          this.fetchData()
        }
      },

      async save() {
        console.log('save')

        if (this.list.length == 0) {
          alert('請先加入公司再存檔')
        } else {
          console.log(this.list)

          for (let i = 0; i < this.list.length; i++) {
            this.update_form.push({
              id: this.list[i]['id'],
              use_yn: true,
              sort: this.list[i]['sort'],
            })
          }

          console.log(this.update_form)

          await axios
            .put(this.url3, this.update_form)
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

          //成功就重新讀取
          if (this.return_success == 'Y') {
            this.clear()
            //this.fetchData();
            //this.dialogFormVisible = false;
          }
        }
      },

      //拖曳相關--str---↓↓--
      overDrop(e, index) {
        e.preventDefault() //取消默認行為
      },
      // leaveDrop(e, index) {
      //   console.log("leaveDrop");
      // },
      // enterDrop(e, index) {
      //   console.log("enterDrop");
      // },
      dragStart(e, index) {
        //拖曳開始
        this.drag_startindex = index
        e.dataTransfer.setData('Text', index)
      },
      drop(e, index) {
        //放置
        this.overDrop(e)
        let arr = this.list.concat([]),
          dragIndex = e.dataTransfer.getData('Text')
        let temp = arr.splice(dragIndex, 1)
        arr.splice(index, 0, temp[0])
        this.list = arr

        // e.target.classList.remove('drag-sort-active');

        this.list_sort()
      },
      dragEnd() {
        //放置結束
        console.log('dragEnd')
      },
      //拖曳相關--end---↑↑--

      // handleDrag(e,index) {
      //   console.log("handleDrag index="+index);
      //   e.preventDefault() //取消默認行為
      //   const selectedItem = e.target,
      //         list = selectedItem.parentNode,
      //         x = event.clientX,
      //         y = event.clientY;

      //   this.drag_startindex = index;
      //   e.dataTransfer.setData('Text', index);

      //   selectedItem.classList.add('drag-sort-active');
      //   let swapItem = document.elementFromPoint(x, y) === null ? selectedItem : document.elementFromPoint(x, y);

      //   if (list === swapItem.parentNode) {
      //     swapItem = swapItem !== selectedItem.nextSibling ? swapItem : swapItem.nextSibling;
      //     list.insertBefore(selectedItem, swapItem);
      //   }
      // },
      // handleDrop(e,index) {
      //   console.log("handleDrop index="+index);
      //   e.target.classList.remove('drag-sort-active');
      //   let arr = this.list.concat([]),
      //     dragIndex = e.dataTransfer.getData('Text')
      //   let temp = arr.splice(dragIndex, 1)
      //   arr.splice(index, 0, temp[0])
      //   this.list = arr

      //   this.list_sort()
      // }
    },
  }
</script>

<style>
  li {
    list-style: none;
  }

  .div_out {
    display: flex;
    flex-direction: row;
    justify-content: space-around;
  }

  .div_float {
    height: 600px;
    width: 500px;
    background: whitesmoke;
    border-radius: 8px;
    border: 1px #c0c4cc solid;
  }

  .div_middle {
    height: 500px;
    width: 100px;
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    align-content: center;
  }

  .div_arrow {
    margin-bottom: 20px;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .div_title {
    font-size: 16px;
    color: white;
    background: grey;
    padding: 8px;
    border-radius: 4px 4px 0px 0px;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .div_search {
    height: 20px;
    padding: 8px;
    display: flex;
    align-items: center;
    position: relative;
  }

  .ul_item_group,
  .ul_item_group_drag {
    overflow: auto;
    height: 520px;
    padding: 5px;
    margin: 0px;
  }

  .li_item {
    padding-top: 5px;
    padding-left: 10px;
    padding-bottom: 5px;
  }

  .arrow {
    margin: 2px;
  }

  .checkbox {
    margin-right: 8px;
  }

  .input_search {
    width: 100%;
    border-radius: 4px;
    border: 1px grey solid;
    padding-left: 20px;
  }

  .input_search_icon {
    position: absolute;
    left: 6px;
    top: -2px;
    color: #c0c4cc;
  }

  .tagbtn {
    cursor: pointer;
  }

  .drop_tmpdiv {
    width: 278px;
    height: 20px;
    border: 1px #909399 dashed;
    border-radius: 4px;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .drop_list {
    width: 290px;
    height: 20px;
    display: flex;
    align-items: center;
  }

  li.drag-sort-active {
    background: transparent;
    color: transparent;
    border: 1px solid #4ca1af;
  }
</style>
