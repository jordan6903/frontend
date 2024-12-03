<template>
  <el-dialog :title="title" :visible.sync="dialogFormVisible" width="800px" @close="close">
    <el-collapse v-model="collapseActive" @change="collapseChange">
      <!-- 基本資料Product -->
      <el-collapse-item name="1" title="一、基本資料">
        <el-form ref="form" label-width="100px" :model="form" :rules="rules">
          <!-- 公司company -->
          <el-form-item label="公司" prop="c_id">
            <el-select v-model="form.c_id" filterable placeholder="請選擇公司">
              <el-option v-for="type in form_type" :key="type.c_id" :label="type.c_id + ' ' + type.name" :value="type.c_id" />
            </el-select>
            &nbsp;
            <el-button icon="el-icon-plus" type="primary" @click="showCompanyInput">新增公司</el-button>
          </el-form-item>
          <el-form-item v-show="newCompany_show" label="新增公司" prop="newCompany">
            <el-col :span="16">
              <el-input v-model.trim="newCompany.c_id" autocomplete="off" maxlength="10" placeholder="代號" />
            </el-col>
            &nbsp;
            <span style="color: red">最後代號: {{ maxCid }}</span>
            <br />
            <el-col :span="16">
              <el-input v-model.trim="newCompany.name" autocomplete="off" maxlength="200" placeholder="公司名稱" />
            </el-col>
            <br />
            <el-col :span="24">
              <el-select v-model="newCompany.c_type" placeholder="請選擇類型">
                <el-option
                  v-for="type in company_type"
                  :key="type.c_type"
                  :label="type.c_type + ' ' + type.c_type_name"
                  :value="type.c_type"
                />
              </el-select>
              &nbsp;
              <el-button type="primary" @click="saveNewCompany">新公司存檔</el-button>
            </el-col>
            <br />
          </el-form-item>
          <!-- 公司company -->

          <!-- 遊戲product -->
          <el-form-item label="商業類型">
            <el-select v-model="search_type" placeholder="請選擇商業類型" @change="getMaxPid">
              <el-option label="A 公司" value="A" />
              <el-option label="B 同人" value="B" />
            </el-select>
          </el-form-item>
          <el-form-item label="代碼" prop="p_id">
            <el-col :span="16">
              <el-input v-model.trim="form.p_id" autocomplete="off" :disabled="form_lock" maxlength="10" />
            </el-col>
            &nbsp;
            <span style="color: red">最後代號: {{ maxPid }}</span>
          </el-form-item>
          <el-form-item label="遊戲名稱" prop="name">
            <el-input v-model.trim="form.name" autocomplete="off" maxlength="200" />
          </el-form-item>
          <el-form-item label="中文名稱" prop="c_Name">
            <el-input v-model.trim="form.c_Name" autocomplete="off" maxlength="200" />
          </el-form-item>
          <el-form-item v-if="!form_lock" label="初回發售日">
            <el-input v-model.trim="form_other.release.sale_Date" autocomplete="off" @input="formatDate" />
          </el-form-item>
          <el-form-item label="介紹" prop="content">
            <el-input v-model="form.content" autocomplete="off" maxlength="300" type="textarea" />
          </el-form-item>
          <el-form-item label="類型" prop="content_style">
            <el-input v-model.trim="form.content_style" autocomplete="off" maxlength="100" />
          </el-form-item>
          <el-form-item label="遊玩時數" prop="play_time">
            <el-input v-model.trim="form.play_time" autocomplete="off" maxlength="50" />
          </el-form-item>
          <el-form-item label="備註" prop="remark">
            <el-input v-model.trim="form.remark" autocomplete="off" maxlength="200" />
          </el-form-item>
          <!-- 遊戲product -->
        </el-form>
      </el-collapse-item>

      <!-- 其他資料: 製作人員Staff、屬性Type、網址Website -->
      <el-collapse-item :disabled="collapseDisabled" name="2" title="二、其他資料">
        <!-- 製作人員staff -->
        <el-form ref="staff" label-width="80px" :style="{ background: newStaff_show ? '#ECECFF' : '' }">
          <el-form-item label="製作人員">
            <el-form-item v-for="data in filteredStaff" :key="data.staff_typeid" :label="data.name" style="height: 20px">
              <el-tooltip v-for="data2 in filteredStaffData(data.staff_typeid)" :key="data2.id" placement="top">
                <div slot="content">
                  <a @click="modifyStaff(data2)">編輯</a>
                  |
                  <a @click="deleteStaff(data2.id)">刪除</a>
                </div>
                <el-tag style="cursor: pointer">{{ data2.staff_Name }}</el-tag>
              </el-tooltip>
            </el-form-item>
            <!--
          <el-form-item v-for="data in type_Staff" :key="data.staff_typeid" :label="data.name" style="height: 20px;"
                        v-if="hasStaff(data.staff_typeid)">
            <el-tooltip v-for="data2 in data_Staff" :key="data2.id" placement="top"
                        v-if="data2.staff_typeid == data.staff_typeid">
              <div slot="content"><a @click="modifyStaff(data2)">編輯</a> | <a @click="deleteStaff(data2.id)">刪除</a></div>
              <el-tag style="cursor: pointer;">{{ data2.staff_Name }}</el-tag>
            </el-tooltip>
          </el-form-item>
          -->

            <el-button :icon="newStaff_show ? 'el-icon-minus' : 'el-icon-plus'" type="danger" @click="showStaffInput">新增人員</el-button>
          </el-form-item>

          <el-form-item v-show="newStaff_show" :label="modifyStaff_yn ? '編輯人員' : '新增人員'">
            <el-form-item label="類型" required>
              <el-col :span="16">
                <el-select v-model="form_other.staff.staff_typeid" filterable placeholder="請選擇類型(必填)">
                  <el-option
                    v-for="data in type_Staff"
                    :key="data.staff_typeid"
                    :label="data.staff_typeid + ' ' + data.name"
                    :value="data.staff_typeid"
                  />
                </el-select>
              </el-col>
            </el-form-item>

            <el-form-item label="人員" required>
              <el-select v-model="form_other.staff.staff_id" filterable placeholder="請選擇人員(必填)">
                <el-option
                  v-for="data in type_Staff_info"
                  :key="data.staff_id"
                  :label="data.staff_id + ' - ' + data.name"
                  :value="data.staff_id"
                />
              </el-select>
              &nbsp;
              <el-button :icon="newStaffInfo_show ? 'el-icon-minus' : 'el-icon-plus'" type="primary" @click="showStaffInfoInput">
                新增人員設定檔
              </el-button>
            </el-form-item>

            <!-- 新增人員設定檔 -->
            <el-form-item
              v-show="newStaffInfo_show"
              :label="modifyStaffInfo_yn ? '編輯人員設定檔' : '新增人員設定檔'"
              :style="{ background: newStaffInfo_show ? '#FFF3EE' : '' }"
            >
              <el-form-item label="代號" required>
                <el-col :span="16">
                  <el-input v-model.trim="form_other.staff_info.staff_id" autocomplete="off" maxlength="10" placeholder="代號" />
                </el-col>
                &nbsp;
                <span style="color: red">最後代號: {{ maxStaffid }}</span>
              </el-form-item>
              <el-form-item label="人名" required>
                <el-col :span="16">
                  <el-input v-model.trim="form_other.staff_info.name" autocomplete="off" maxlength="100" placeholder="人名" />
                </el-col>
              </el-form-item>
              &nbsp;
              <el-button type="primary" @click="saveNewStaffInfo">新人員設定檔存檔</el-button>
            </el-form-item>
            <!-- 新增人員設定檔 -->

            <el-form-item label="備註">
              <el-col :span="16">
                <el-input v-model.trim="form_other.staff.remark" autocomplete="off" maxlength="50" placeholder="備註" />
              </el-col>
            </el-form-item>

            &nbsp;
            <el-button type="primary" @click="saveNewStaff">新人員存檔</el-button>
          </el-form-item>
        </el-form>
        <!-- 製作人員staff -->

        <!-- 屬性type -->
        <el-form ref="type" label-width="80px" :style="{ background: newType_show ? '#D2E9FF' : '' }">
          <el-form-item label="屬性/標籤">
            <el-tag v-for="data in data_Type" :key="data.id" style="cursor: pointer" title="點擊刪除" @click="deleteType(data.id)">
              {{ data.p_type_Name }}
            </el-tag>
            &nbsp;
            <el-button :icon="newType_show ? 'el-icon-minus' : 'el-icon-plus'" type="danger" @click="showTypeInput">新增屬性</el-button>
          </el-form-item>
          <el-form-item v-show="newType_show" label="新增屬性">
            <el-select v-model="form_other.type" filterable placeholder="請選擇屬性">
              <el-option
                v-for="data in type_Type"
                :key="data.p_type_id"
                :label="data.p_type_id + ' ' + data.fullName"
                :value="data.p_type_id"
              />
            </el-select>
            &nbsp;
            <el-button type="primary" @click="saveNewType">新屬性存檔</el-button>
          </el-form-item>
        </el-form>
        <!-- 屬性type -->

        <!-- 網址website -->
        <el-form ref="website" label-width="80px" :style="{ background: newWebsite_show ? '#E8FFF5' : '' }">
          <el-form-item label="網址">
            <el-tooltip v-for="data in data_Website" :key="data.id" placement="top">
              <div slot="content">
                <a @click="modifyWebsite(data)">編輯</a>
                |
                <a @click="deleteWebsite(data.id)">刪除</a>
              </div>
              <el-link :href="data.url" target="_blank" type="primary">
                {{ data.name != '' ? data.name : data.type_Name }}&nbsp;&nbsp;&nbsp;
              </el-link>
            </el-tooltip>

            <el-button :icon="newWebsite_show ? 'el-icon-minus' : 'el-icon-plus'" type="danger" @click="showWebsiteInput">
              新增網址
            </el-button>
          </el-form-item>

          <el-form-item v-show="newWebsite_show" :label="modifyWebsite_yn ? '編輯網址' : '新增網址'">
            <el-form-item label="屬性" required>
              <el-col :span="16">
                <el-select v-model="form_other.website.type_id" filterable placeholder="請選擇屬性(必填)">
                  <el-option
                    v-for="data in type_Website"
                    :key="data.type_id"
                    :label="data.type_id + ' ' + data.name"
                    :value="data.type_id"
                  />
                </el-select>
              </el-col>
            </el-form-item>
            <el-form-item label="名稱">
              <el-col :span="16">
                <el-input v-model.trim="form_other.website.name" autocomplete="off" maxlength="30" placeholder="名稱" />
              </el-col>
            </el-form-item>
            <el-form-item label="網址" required>
              <el-col :span="16">
                <el-input v-model.trim="form_other.website.url" autocomplete="off" maxlength="4000" placeholder="網址(必填)" />
              </el-col>
            </el-form-item>
            <el-form-item label="備註">
              <el-col :span="16">
                <el-input v-model.trim="form_other.website.remark" autocomplete="off" maxlength="50" placeholder="備註" />
              </el-col>
            </el-form-item>
            <el-form-item label="啟用">
              <el-switch v-model="form_other.website.use_yn" />
            </el-form-item>
            &nbsp;
            <el-button type="primary" @click="saveNewWebsite">新網址存檔</el-button>
          </el-form-item>
        </el-form>
        <!-- 網址website -->
      </el-collapse-item>

      <!-- 圖片Pic -->
      <el-collapse-item :disabled="collapseDisabled" name="3" title="三、圖片">
        <el-button
          :icon="newPic_show ? 'el-icon-minus' : 'el-icon-plus'"
          style="margin-left: 20px; margin-bottom: 20px"
          type="danger"
          @click="showPicInput"
        >
          新增圖片
        </el-button>

        <!-- 新增圖片 -->
        <el-form ref="Relation" label-width="80px" :style="{ background: newPic_show ? '#E8FFF5' : '' }">
          <el-form-item
            v-show="newPic_show"
            :label="newPic_show ? '編輯關聯' : '新增關聯'"
            :style="{ background: newPic_show ? '#FFF3EE' : '' }"
          >
            <el-form-item label="圖片分類" required>
              <el-select v-model="form_other.pic.type_id" placeholder="請選擇分類">
                <el-option v-for="type in type_Website" :key="type.type_id" :label="type.type_id + ' ' + type.name" :value="type.type_id" />
              </el-select>
            </el-form-item>

            <el-form-item label="名稱">
              <el-input v-model.trim="form_other.pic.name" autocomplete="off" maxlength="30" />
            </el-form-item>

            <el-form-item label="網址" required>
              <el-input v-model.trim="form_other.pic.url" autocomplete="off" maxlength="4000" />
            </el-form-item>

            <el-form-item label="寬" required>
              <el-input v-model.number="form_other.pic.width" autocomplete="off" maxlength="5" type="number" />
            </el-form-item>

            <el-form-item label="高" required>
              <el-input v-model.number="form_other.pic.height" autocomplete="off" maxlength="5" type="number" />
            </el-form-item>

            <el-form-item label="備註">
              <el-input v-model.trim="form_other.pic.remark" autocomplete="off" maxlength="50" />
            </el-form-item>

            <el-form-item label="啟用">
              <el-switch v-model="form_other.pic.use_yn" />
            </el-form-item>

            <el-form-item label="排序" prop="sort">
              <el-input v-model.number="form.sort" autocomplete="off" maxlength="3" type="number" />
            </el-form-item>

            &nbsp;
            <el-button type="primary" @click="saveNewPic">新圖片存檔</el-button>
          </el-form-item>
        </el-form>
        <!-- 新增圖片 -->

        <div class="demo-image">
          <div v-for="data in data_Pic" :key="data.id" class="block">
            <span class="demonstration">{{ data.name ? data.name : data.type_Name }}</span>
            <span class="demonstration">
              <a @click="modifyPic(data)">編輯</a>
              |
              <a @click="deletePic(data.id)">刪除</a>
            </span>
            <el-image :preview-src-list="srcList" :src="data.url" style="width: 100px; height: 100px" />
          </div>
        </div>
      </el-collapse-item>

      <!-- 發售紀錄Release -->
      <el-collapse-item :disabled="collapseDisabled" name="4" title="四、發售紀錄">
        <el-button
          :icon="newRelease_show ? 'el-icon-minus' : 'el-icon-plus'"
          style="margin-left: 20px; margin-bottom: 20px"
          type="danger"
          @click="showReleaseInput"
        >
          新增發售日
        </el-button>
        <!-- 新增發售日 -->
        <el-form ref="Release" label-width="80px" :style="{ background: newRelease_show ? '#E8FFF5' : '' }">
          <el-form-item
            v-show="newRelease_show"
            :label="modifyRelease_yn ? '編輯發售日' : '新增發售日'"
            :style="{ background: newRelease_show ? '#FFF3EE' : '' }"
          >
            <el-form-item label="名稱">
              <el-input v-model.trim="form_other.release.name" autocomplete="off" maxlength="200" />
            </el-form-item>
            <el-form-item label="發售日" required>
              <el-input v-model.trim="form_other.release.sale_Date" autocomplete="off" @input="formatDate" />
            </el-form-item>
            <el-form-item label="開放預售">
              <el-input v-model.trim="form_other.release.presale_Date" autocomplete="off" @input="formatDate2" />
            </el-form-item>
            <el-form-item label="初回標記" required>
              <el-switch v-model="form_other.release.official_First" />
            </el-form-item>
            <el-form-item label="價格" required>
              <el-input v-model.number="form_other.release.price" autocomplete="off" maxlength="10" type="number" />
            </el-form-item>
            <el-form-item label="語音" required>
              <el-select v-model="form_other.release.voice_id" placeholder="請選擇分類">
                <el-option
                  v-for="type in type_voice"
                  :key="type.voice_id"
                  :label="type.voice_id + ' ' + type.name"
                  :value="type.voice_id"
                />
              </el-select>
            </el-form-item>
            <el-form-item label="貨幣" required>
              <el-select v-model="form_other.release.currency_id" placeholder="請選擇分類">
                <el-option
                  v-for="type in type_currency"
                  :key="type.currency_id"
                  :label="type.currency_id + ' ' + type.shortName"
                  :value="type.currency_id"
                />
              </el-select>
            </el-form-item>
            <el-form-item label="機種" required>
              <el-select v-model="form_other.release.device_id" placeholder="請選擇分類">
                <el-option
                  v-for="type in type_device"
                  :key="type.device_id"
                  :label="type.device_id + ' ' + type.shortName"
                  :value="type.device_id"
                />
              </el-select>
            </el-form-item>
            <el-form-item label="分級" required>
              <el-select v-model="form_other.release.rating_id" placeholder="請選擇分類">
                <el-option
                  v-for="type in type_rating"
                  :key="type.rating_id"
                  :label="type.rating_id + ' ' + type.name"
                  :value="type.rating_id"
                />
              </el-select>
            </el-form-item>
            <el-form-item label="敘述">
              <el-input v-model.trim="form_other.release.content" autocomplete="off" maxlength="200" />
            </el-form-item>
            &nbsp;
            <el-button type="primary" @click="saveNewRelease">新發售日存檔</el-button>
          </el-form-item>
        </el-form>
        <!-- 新增發售日 -->
        <el-timeline>
          <el-timeline-item v-for="data in data_Release" :key="data.id" placement="top" :timestamp="filteredDate(data.sale_Date)">
            <el-card>
              <h2>{{ data.name }}</h2>
              <p>開放預售日: {{ data.presale_Date }}</p>
              <p>敘述: {{ data.content }}</p>
              操作:
              <el-button type="text" @click="modifyRelease(data)">編輯</el-button>
              <el-button type="text" @click="deleteRelease(data.id)">刪除</el-button>
              <br />
              <el-tag v-if="data.official_First" title="初回標記" type="danger">系列初回</el-tag>
              <el-tag title="語音">{{ data.voice_Name }}</el-tag>
              <el-tag title="機種">{{ data.device_Name }}</el-tag>
              <el-tag title="分級">{{ data.rating_Name }}</el-tag>
              <el-tag title="價格">{{ data.price }} ( {{ data.currency_Name }} )</el-tag>
            </el-card>
          </el-timeline-item>
        </el-timeline>
      </el-collapse-item>

      <!-- 關聯遊戲Relation -->
      <el-collapse-item :disabled="collapseDisabled" name="5" title="五、關聯遊戲">
        <el-button
          :icon="newRelation_show ? 'el-icon-minus' : 'el-icon-plus'"
          style="margin-left: 20px; margin-bottom: 20px"
          type="danger"
          @click="showRelationInput"
        >
          新增關聯遊戲
        </el-button>
        <!-- 新增關聯遊戲 -->
        <el-form ref="Relation" label-width="80px" :style="{ background: newRelation_show ? '#E8FFF5' : '' }">
          <el-form-item
            v-show="newRelation_show"
            :label="newRelation_show ? '編輯關聯' : '新增關聯'"
            :style="{ background: newRelation_show ? '#FFF3EE' : '' }"
          >
            <el-form-item label="遊戲搜尋">
              <el-col :span="16">
                <el-input v-model.trim="searchword" autocomplete="off" />
              </el-col>
              &nbsp;
              <el-button icon="el-icon-search" type="primary" @click="productQuery">查詢</el-button>
            </el-form-item>
            <el-form-item label="遊戲代碼" required>
              <el-select v-model="form_other.relation.p_id_to" placeholder="請選擇遊戲">
                <el-option v-for="type in search_product" :key="type.p_id" :label="type.p_id + ' - ' + type.name" :value="type.p_id" />
              </el-select>
              &nbsp;
              <el-tag v-if="search_product && search_product.length === 0" type="info">未匯入遊戲</el-tag>
              <el-tag v-else>已匯入遊戲</el-tag>
            </el-form-item>

            <el-form-item label="關聯分類" required>
              <el-select v-model="form_other.relation.relation_id" placeholder="請選擇分類">
                <el-option
                  v-for="type in type_Relation"
                  :key="type.relation_id"
                  :label="type.relation_id + ' ' + type.name"
                  :value="type.relation_id"
                />
              </el-select>
            </el-form-item>

            <el-form-item label="敘述">
              <el-input v-model.trim="form_other.relation.content" autocomplete="off" maxlength="100" />
            </el-form-item>

            <el-form-item label="新增連結">
              <el-switch v-model="newRelation_link" title="新增兩筆遊戲之間的關聯連結" />
            </el-form-item>

            <el-form-item v-show="newRelation_link" label="關聯分類" required>
              <el-select v-model="form_other.relation_to.relation_id" placeholder="請選擇分類">
                <el-option
                  v-for="type in type_Relation"
                  :key="type.relation_id"
                  :label="type.relation_id + ' ' + type.name"
                  :value="type.relation_id"
                />
              </el-select>
            </el-form-item>

            <el-form-item v-show="newRelation_link" label="敘述">
              <el-input v-model.trim="form_other.relation_to.content" autocomplete="off" maxlength="100" />
            </el-form-item>

            &nbsp;
            <el-button type="primary" @click="saveNewRelation">新關聯存檔</el-button>
          </el-form-item>
        </el-form>
        <!-- 新增關聯遊戲 -->
        <el-table :border="true" :data="data_Relation">
          <el-table-column label="遊戲名稱" prop="p_Name_to" show-overflow-tooltip sortable width="200" />
          <el-table-column label="關聯" prop="relation_Name" show-overflow-tooltip width="95" />
          <el-table-column label="敘述" prop="content" show-overflow-tooltip />
          <el-table-column label="操作" show-overflow-tooltip width="180px">
            <template #default="{ row }">
              <el-button type="text" @click="modifyRelation(row)">編輯</el-button>
              <el-button type="text" @click="deleteRelation(row.id)">刪除</el-button>
            </template>
          </el-table-column>
        </el-table>
        <!-- 關聯遊戲 -->
      </el-collapse-item>
    </el-collapse>

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
        url: 'http://localhost:5252/api/company_type',
        url_type: {
          url4: 'http://localhost:5252/api/website_type',
          url6: 'http://localhost:5252/api/product_type_info',
          url7: 'http://localhost:5252/api/product_relation_info',
          url9: 'http://localhost:5252/api/staff_type',
          url10: 'http://localhost:5252/api/staff_info',
          url11: 'http://localhost:5252/api/voice_type',
          url12: 'http://localhost:5252/api/currency',
          url13: 'http://localhost:5252/api/device',
          url14: 'http://localhost:5252/api/rating',
        },
        url_other: {
          url1: 'http://localhost:5252/api/product/getnewpid',
          url2: 'http://localhost:5252/api/company/getnewcid',
          url3: 'http://localhost:5252/api/product_release_day/getbypid',
          url4: 'http://localhost:5252/api/product_website',
          url5: 'http://localhost:5252/api/product_pic',
          url6: 'http://localhost:5252/api/product_type/getbypid',
          url7: 'http://localhost:5252/api/product_relation/getbypid',
          url8: 'http://localhost:5252/api/product_score',
          url9: 'http://localhost:5252/api/staff/getbypid',
          url10: 'http://localhost:5252/api/staff_info/getmaxstaffid',
        },
        params: '',
        return_msg: '',
        return_success: '',

        //===摺疊控制===//
        collapseActive: ['1'],
        collapseOld: ['1'],

        //===新增代碼===//
        search_type: '',
        maxPid: '',
        maxCid: '',
        maxStaffid: '',
        searchword: '',
        search_product: [],
        newRelation_link: true,
        newCompany_show: false,
        newPic_show: false,
        newRelease_show: false,
        newRelation_show: false,
        newStaff_show: false,
        newStaffInfo_show: false,
        newType_show: false,
        newWebsite_show: false,
        modifyPic_yn: false,
        modifyRelease_yn: false,
        modifyRelation_yn: false,
        modifyWebsite_yn: false,
        modifyStaff_yn: false,
        modifyStaffInfo_yn: false,
        newCompany: {
          c_id: '',
          name: '',
          c_type: '',
        },
        company_type: [],

        srcList: [],

        //基本資料-存檔
        form: {
          p_id: '',
          c_id: '',
          name: '',
          c_Name: '',
          content: '',
          content_style: '',
          play_time: '',
          remark: '',
        },
        //其他資料-存檔
        form_other: {
          release: {
            p_id: '',
            name: '',
            sale_Date: '',
            presale_Date: '',
            official_First: false,
            price: 0,
            voice_id: 0,
            currency_id: 'XXX',
            content: '',
            device_id: 'XXXXX',
            rating_id: 0,
          },
          website: {
            p_id: '',
            type_id: '',
            name: '',
            url: '',
            remark: '',
            use_yn: true,
            sort: 0,
          },
          pic: {
            p_id: '',
            type_id: '',
            name: '',
            rrl: '',
            width: 0,
            height: 0,
            remark: '',
            use_yn: true,
            sort: 0,
          },
          type: '',
          relation: {
            p_id: '',
            p_Name: '',
            p_id_to: '',
            p_Name_to: '',
            relation_id: 0,
            content: '',
          },
          relation_to: {
            p_id: '',
            p_Name: '',
            p_id_to: '',
            p_Name_to: '',
            relation_id: 0,
            content: '',
          },
          score: '',
          staff: {
            p_id: '',
            staff_id: '',
            staff_typeid: '',
            remark: '',
          },
          staff_info: {
            staff_id: '',
            name: '',
            content: '',
          },
        },
        //基本資料-複製用
        pure_form: {
          p_id: '',
          c_id: '',
          name: '',
          c_Name: '',
          content: '',
          content_style: '',
          play_time: '',
          remark: '',
        },
        //其他資料-複製用
        pure_other: {
          release: {
            p_id: '',
            name: '',
            sale_Date: '',
            presale_Date: '',
            official_First: false,
            price: 0,
            voice_id: 0,
            currency_id: 'XXX',
            content: '',
            device_id: 'XXXXX',
            rating_id: 0,
          },
          website: {
            p_id: '',
            type_id: '',
            name: '',
            url: '',
            remark: '',
            use_yn: true,
            sort: 0,
          },
          pic: {
            p_id: '',
            type_id: '',
            name: '',
            rrl: '',
            width: 0,
            height: 0,
            remark: '',
            use_yn: true,
            sort: 0,
          },
          type: '',
          relation: {
            p_id: '',
            p_Name: '',
            p_id_to: '',
            p_Name_to: '',
            relation_id: 0,
            content: '',
          },
          relation_to: {
            p_id: '',
            p_Name: '',
            p_id_to: '',
            p_Name_to: '',
            relation_id: 0,
            content: '',
          },
          score: '',
          staff: {
            p_id: '',
            staff_id: '',
            staff_typeid: '',
            remark: '',
          },
          staff_info: {
            staff_id: '',
            name: '',
            content: '',
          },
        },
        form_type: [],

        //設定檔
        type_voice: [],
        type_currency: [],
        type_device: [],
        type_rating: [],
        type_Website: [],
        type_Type: [],
        type_Staff: [],
        type_Staff_info: [],
        type_Relation: [],

        //遊戲其他資料
        data_Release: [],
        data_Website: [],
        data_Pic: [],
        data_Type: [],
        data_Relation: [],
        data_Score: [],
        data_Staff: [],

        form_lock: false,

        //必填規則
        rules: {
          p_id: [{ required: true, trigger: 'blur', message: '請輸入代號' }],
          c_id: [{ required: true, trigger: 'blur', message: '請選擇公司' }],
          name: [{ required: true, trigger: 'blur', message: '請輸入遊戲名稱' }],
        },
        title: '',
        dialogFormVisible: false,
      }
    },
    computed: {
      filteredStaff() {
        // 先過濾掉沒有相應 staff 類型的 type_Staff
        return this.type_Staff.filter((type) => this.data_Staff.some((data) => data.staff_typeid === type.staff_typeid))
      },
      collapseDisabled() {
        return this.form.id == null ? true : false
      },
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

          //this.getRelease() //發售日
          //this.getWebsite() //網址
          //this.getPic() //圖片
          //this.getType() //屬性標籤
          //this.getRelation() //關聯遊戲
          //this.getScore() //評分
          //this.getStaff() //製作人員
        }
        this.maxPid = ''
        this.search_type = []
        this.form_type = list_type
        this.dialogFormVisible = true

        this.getCompanyType() //公司資料
      },
      collapseChange(val) {
        //翻頁才讀取資料
        console.log(val)

        let old = this.collapseOld
        let active = val

        let difference = active.filter((item) => !old.includes(item))

        for (var i = 0; i < difference.length; i++) {
          if (difference[i] == '2') {
            this.getStaff() //製作人員
            this.getType() //屬性標籤
            this.getWebsite() //網址
          }
          if (difference[i] == '3') {
            this.getWebsite() //網址
            this.getPic() //圖片
          }
          if (difference[i] == '4') {
            this.getRelease() //發售日
          }
          if (difference[i] == '5') {
            this.getRelation() //關聯遊戲
          }
          if (difference[i] == '5') {
            this.getScore() //評分
          }
        }

        this.collapseOld = val
      },
      filteredDate(date) {
        // 轉成日期形式
        date = `${date.substring(0, 4)}-${date.substring(4, 6)}-${date.substring(6, 8)}`
        return date
      },
      filteredStaffData(staffTypeId) {
        // 根據 staffTypeId 過濾 data_Staff
        return this.data_Staff.filter((data) => data.staff_typeid === staffTypeId)
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
      async getStaff() {
        let ls_url = `${this.url_other.url9}`
        ls_url += `?id=${this.form.p_id}`

        //分類
        await axios
          .get(ls_url)
          .then((response) => (this.data_Staff = response.data))
          .catch(function (error) {
            console.log(error)
          })

        ls_url = `${this.url_type.url9}?UseYN=Y`

        //分類
        await axios
          .get(ls_url)
          .then((response) => (this.type_Staff = response.data))
          .catch(function (error) {
            console.log(error)
          })

        ls_url = `${this.url_type.url10}`

        //分類
        await axios
          .get(ls_url)
          .then((response) => (this.type_Staff_info = response.data))
          .catch(function (error) {
            console.log(error)
          })
      },
      async getScore() {
        let ls_url = `${this.url_other.url8}`
        ls_url += `/${this.form.p_id}`

        //分類
        await axios
          .get(ls_url)
          .then((response) => (this.data_Score = response.data))
          .catch(function (error) {
            console.log(error)
          })
      },
      async getRelation() {
        let ls_url = `${this.url_other.url7}`
        ls_url += `?id=${this.form.p_id}`

        //分類
        await axios
          .get(ls_url)
          .then((response) => (this.data_Relation = response.data))
          .catch(function (error) {
            console.log(error)
          })

        let ls_url1 = `${this.url_type.url7}`

        //分類type
        await axios
          .get(ls_url1)
          .then((response) => (this.type_Relation = response.data))
          .catch(function (error) {
            console.log(error)
          })
      },
      async getType() {
        let ls_url = `${this.url_other.url6}`
        ls_url += `?id=${this.form.p_id}`

        //分類
        await axios
          .get(ls_url)
          .then((response) => (this.data_Type = response.data))
          .catch(function (error) {
            console.log(error)
          })
      },
      async getPic() {
        let ls_url = `${this.url_other.url5}`
        ls_url += `/${this.form.p_id}`

        //分類
        await axios
          .get(ls_url)
          .then((response) => (this.data_Pic = response.data))
          .catch(function (error) {
            console.log(error)
          })

        this.srcList = this.data_Pic.map((item) => item.url) //圖庫
      },
      async getWebsite() {
        let ls_url = `${this.url_other.url4}`
        ls_url += `/${this.form.p_id}`

        //分類
        await axios
          .get(ls_url)
          .then((response) => (this.data_Website = response.data))
          .catch(function (error) {
            console.log(error)
          })
      },
      async getRelease() {
        let ls_url = `${this.url_other.url3}?`
        ls_url += `id=${this.form.p_id}`

        //分類
        await axios
          .get(ls_url)
          .then((response) => (this.data_Release = response.data))
          .catch(function (error) {
            console.log(error)
          })

        let ls_url2 = `${this.url_type.url11}?UseYN=Y`
        let ls_url3 = `${this.url_type.url12}?UseYN=Y`
        let ls_url4 = `${this.url_type.url13}?UseYN=Y`
        let ls_url5 = `${this.url_type.url14}?UseYN=Y`

        //分類voice
        await axios
          .get(ls_url2)
          .then((response) => (this.type_voice = response.data))
          .catch(function (error) {
            console.log(error)
          })

        //分類currency
        await axios
          .get(ls_url3)
          .then((response) => (this.type_currency = response.data))
          .catch(function (error) {
            console.log(error)
          })

        //分類device
        await axios
          .get(ls_url4)
          .then((response) => (this.type_device = response.data))
          .catch(function (error) {
            console.log(error)
          })

        //分類rating
        await axios
          .get(ls_url5)
          .then((response) => (this.type_rating = response.data))
          .catch(function (error) {
            console.log(error)
          })
      },
      async getMaxPid() {
        let ls_url = `${this.url_other.url1}?`
        ls_url += `searchword=${this.search_type}`

        //分類
        await axios
          .get(ls_url)
          .then((response) => (this.maxPid = response.data))
          .catch(function (error) {
            console.log(error)
          })
      },
      async getMaxStaffId() {
        let ls_url = `${this.url_other.url10}`

        //分類
        await axios
          .get(ls_url)
          .then((response) => (this.maxStaffid = response.data))
          .catch(function (error) {
            console.log(error)
          })
      },
      async getCompanyType() {
        console.log('===getCompanyType')

        let ls_url = `${this.url}?UseYN=Y`

        //分類
        await axios
          .get(ls_url)
          .then((response) => (this.company_type = response.data))
          .catch(function (error) {
            console.log(error)
          })
      },
      async showPicInput() {
        this.form_other.pic = this.pure_other.pic //清空
        this.modifyPic_yn = false

        let ls_url = `${this.url_type.url4}?UseYN=Y`

        if (this.newPic_show) {
          this.newPic_show = false
        } else {
          //分類
          await axios
            .get(ls_url)
            .then((response) => (this.type_Website = response.data))
            .catch(function (error) {
              console.log(error)
            })

          this.newPic_show = true
        }
      },
      async showRelationInput() {
        this.form_other.relation = this.pure_other.relation //清空
        this.modifyRelation_yn = false

        if (this.newRelation_show) {
          this.newRelation_show = false
        } else {
          this.newRelation_show = true
        }
      },
      async showReleaseInput() {
        this.form_other.release = this.pure_other.release //清空
        this.modifyRelease_yn = false

        if (this.newRelease_show) {
          this.newRelease_show = false
        } else {
          this.newRelease_show = true
        }
      },
      async showStaffInfoInput() {
        this.form_other.staff_info = this.pure_other.staff_info //清空

        if (this.newStaffInfo_show) {
          this.newStaffInfo_show = false
        } else {
          this.getMaxStaffId()
          this.newStaffInfo_show = true
        }
      },
      async showStaffInput() {
        console.log('===showStaffInput')
        this.form_other.staff = this.pure_other.staff //清空
        this.modifyStaff_yn = false

        if (this.newStaff_show) {
          this.newStaff_show = false
        } else {
          let ls_url = `${this.url_type.url10}?UseYN=Y`

          //分類
          await axios
            .get(ls_url)
            .then((response) => (this.type_Staff_info = response.data))
            .catch(function (error) {
              console.log(error)
            })

          this.newStaff_show = true
        }
      },
      async showWebsiteInput() {
        let ls_url = `${this.url_type.url4}?UseYN=Y`

        this.form_other.website = this.pure_other.website //清空
        this.modifyWebsite_yn = false

        if (this.newWebsite_show) {
          this.newWebsite_show = false
        } else {
          //分類
          await axios
            .get(ls_url)
            .then((response) => (this.type_Website = response.data))
            .catch(function (error) {
              console.log(error)
            })

          this.newWebsite_show = true
        }
      },
      async showTypeInput() {
        let ls_url = `${this.url_type.url6}?UseYN=Y`

        if (this.newType_show) {
          this.newType_show = false
        } else {
          //分類
          await axios
            .get(ls_url)
            .then((response) => (this.type_Type = response.data))
            .catch(function (error) {
              console.log(error)
            })

          this.newType_show = true
        }
      },
      async showCompanyInput() {
        let ls_url = `${this.url_other.url2}`

        if (this.newCompany_show) {
          this.newCompany_show = false
        } else {
          //分類
          await axios
            .get(ls_url)
            .then((response) => (this.maxCid = response.data))
            .catch(function (error) {
              console.log(error)
            })

          this.newCompany_show = true
        }
      },
      hasStaff(staff_typeid) {
        // 檢查是否有該 staff_typeid 對應的 staff
        return this.data_Staff.some((data2) => data2.staff_typeid === staff_typeid)
      },
      close() {
        console.log('===close')
        //this.$refs['form'].resetFields()
        this.form = this.$options.data().form
        this.dialogFormVisible = false
        this.$emit('fetch-data')

        //清空所有資料
        this.collapseActive = ['1']
        this.collapseOld = ['1']

        this.form = this.pure_form
        this.form_other = this.pure_other

        this.data_Release = []
        this.data_Website = []
        this.data_Pic = []
        this.data_Type = []
        this.data_Relation = []
        this.data_Score = []
        this.data_Staff = []
      },
      toUpperCase(event) {
        this.form.p_id = event.toUpperCase()
      },
      formatDate() {
        //去掉除數字以外的字串
        this.form_other.release.sale_Date = this.form_other.release.sale_Date.replace(/[^0-9]/g, '')

        //字串長度大於8就縮短成8
        if (this.form_other.release.sale_Date.length > 8) {
          this.form_other.release.sale_Date = this.form_other.release.sale_Date.substring(0, 8)
        }
      },
      formatDate2() {
        //去掉除數字以外的字串
        this.form_other.release.presale_Date = this.form_other.release.presale_Date.replace(/[^0-9]/g, '')

        //字串長度大於8就縮短成8
        if (this.form_other.release.presale_Date.length > 8) {
          this.form_other.release.presale_Date = this.form_other.release.presale_Date.substring(0, 8)
        }
      },
      async modifyPic(data) {
        console.log('===modifyPic')
        console.log(data)
        if (data == '' || data == null || data == undefined) {
          alert('查無data')
          return false
        }
        this.modifyPic_yn = true

        this.form_other.pic = data

        let ls_url = `${this.url_type.url4}?UseYN=Y`

        if (this.newPic_show) {
          this.newPic_show = false
        } else {
          //分類
          await axios
            .get(ls_url)
            .then((response) => (this.type_Website = response.data))
            .catch(function (error) {
              console.log(error)
            })

          this.newPic_show = true
        }
      },
      async modifyRelation(data) {
        console.log('===modifyRelation')
        console.log(data)
        if (data == '' || data == null || data == undefined) {
          alert('查無data')
          return false
        }
        this.modifyRelation_yn = true

        this.$baseAlert('注意: 編輯只會更動此一資料, 如之前有一次新增兩筆資料, 則需做兩次編輯。')

        this.searchword = data.p_Name_to
        this.productQuery()

        this.form_other.relation = data

        if (this.newRelation_show) {
          this.newRelation_show = false
        } else {
          this.newRelation_show = true
        }
      },
      async modifyRelease(data) {
        console.log('===modifyRelease')
        console.log(data)
        if (data == '' || data == null || data == undefined) {
          alert('查無data')
          return false
        }
        this.modifyRelease_yn = true

        this.form_other.release = data

        if (this.newRelease_show) {
          this.newRelease_show = false
        } else {
          this.newRelease_show = true
        }
      },
      async modifyStaff(data) {
        console.log('===modifyStaff')
        console.log(data)
        if (data == '' || data == null || data == undefined) {
          alert('查無data')
          return false
        }
        this.modifyStaff_yn = true

        this.form_other.staff = data

        if (this.newStaff_show) {
          this.newStaff_show = false
        } else {
          this.newStaff_show = true
        }
      },
      async modifyWebsite(data) {
        console.log('===modifyWebsite')
        console.log(data)
        if (data == '' || data == null || data == undefined) {
          alert('查無data')
          return false
        }
        this.modifyWebsite_yn = true

        this.form_other.website = data

        let ls_url = `${this.url_type.url4}?UseYN=Y`

        if (this.newWebsite_show) {
          this.newWebsite_show = false
        } else {
          //分類
          await axios
            .get(ls_url)
            .then((response) => (this.type_Website = response.data))
            .catch(function (error) {
              console.log(error)
            })

          this.newWebsite_show = true
        }
      },
      async deletePic(id) {
        console.log('===deletePic')
        if (id == '' || id == null || id == undefined) {
          alert('查無id')
          return false
        }

        let ls_url = `http://localhost:5252/api/product_pic/${id}`

        await axios
          .delete(ls_url)
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

        //成功就重整
        if (this.return_success == 'Y') {
          this.getPic()
        }
      },
      async deleteRelation(id) {
        console.log('===deleteRelation')
        if (id == '' || id == null || id == undefined) {
          alert('查無id')
          return false
        }

        this.$baseAlert('注意: 刪除只會刪除此一資料, 如之前有一次新增兩筆資料, 則需做兩次刪除。')

        let ls_url = `http://localhost:5252/api/product_relation/${id}`

        await axios
          .delete(ls_url)
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

        //成功就重整
        if (this.return_success == 'Y') {
          this.getRelation()
        }
      },
      async deleteRelease(id) {
        console.log('===deleteRelease')
        if (id == '' || id == null || id == undefined) {
          alert('查無id')
          return false
        }

        this.$baseConfirm(
          '確定要刪除?',
          null,
          () => {
            this.deleteRelease_submit(id)
          },
          () => {
            return false
          }
        )
      },
      async deleteRelease_submit(id) {
        console.log('deleteRelease_submit')
        if (id == '' || id == null || id == undefined) {
          alert('查無id')
          return false
        }

        let ls_url = `http://localhost:5252/api/product_release_day/${id}`

        await axios
          .delete(ls_url)
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

        //成功就重整
        if (this.return_success == 'Y') {
          this.getRelease()
        }
      },
      async deleteStaff(id) {
        console.log('===deleteStaff')
        if (id == '' || id == null || id == undefined) {
          alert('查無id')
          return false
        }

        let ls_url = `http://localhost:5252/api/staff/${id}`

        await axios
          .delete(ls_url)
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

        //成功就重整
        if (this.return_success == 'Y') {
          this.getStaff()
        }
      },
      async deleteWebsite(id) {
        console.log('===deleteWebsite')
        if (id == '' || id == null || id == undefined) {
          alert('查無id')
          return false
        }

        let ls_url = `http://localhost:5252/api/product_website/${id}`

        await axios
          .delete(ls_url)
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

        //成功就重整
        if (this.return_success == 'Y') {
          this.getWebsite()
        }
      },
      async deleteType(id) {
        console.log('===deleteType')
        if (id == '' || id == null || id == undefined) {
          alert('查無id')
          return false
        }

        let ls_url = `http://localhost:5252/api/product_type/${id}`

        await axios
          .delete(ls_url)
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

        //成功就重整
        if (this.return_success == 'Y') {
          this.getType()
        }
      },
      async saveNewPic() {
        console.log('===saveNewPic')
        if (this.form_other.pic.type_id == '' || this.form_other.pic.type_id == null || this.form_other.pic.type_id == undefined) {
          alert('請選擇圖片類型')
          return false
        }
        if (this.form_other.pic.url == '' || this.form_other.pic.url == null || this.form_other.pic.url == undefined) {
          alert('請輸入網址')
          return false
        }
        if (this.form_other.pic.width === '' || this.form_other.pic.width === null || this.form_other.pic.width === undefined) {
          alert('請輸入寬')
          return false
        }
        if (this.form_other.pic.height === '' || this.form_other.pic.height === null || this.form_other.pic.height === undefined) {
          alert('請輸入高')
          return false
        }

        let ls_url = 'http://localhost:5252/api/product_pic'
        this.params = this.form_other.pic

        this.form_other.pic.p_id = this.form.p_id

        console.log(this.params)

        if (this.form_other.pic.id == '' || this.form_other.pic.id == null || this.form_other.pic.id == undefined) {
          //新增
          await axios
            .post(ls_url, this.params)
            .then((response) => (this.return_msg = response.data.message))
            .catch(function (error) {
              // 请求失败处理
              console.log(error)
            })
        } else {
          //編輯
          ls_url += `/${this.form_other.pic.id}`
          await axios
            .put(ls_url, this.params)
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

        //成功就重整
        if (this.return_success == 'Y') {
          this.form_other.pic = this.pure_other.pic //清空
          this.newPic_show = false
          this.getPic()
        }
      },
      async saveNewRelationTo() {
        console.log('===saveNewRelationTo')
        if (
          this.form_other.relation_to.relation_id == '' ||
          this.form_other.relation_to.relation_id == null ||
          this.form_other.relation_to.relation_id == undefined
        ) {
          alert('請選擇遊戲2關聯類型')
          return false
        }

        let ls_url = 'http://localhost:5252/api/product_relation'
        this.params = this.form_other.relation_to

        this.form_other.relation_to.p_id = this.form_other.relation.p_id_to
        this.form_other.relation_to.p_id_to = this.form.p_id

        console.log(this.params)

        //新增
        await axios
          .post(ls_url, this.params)
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

        //成功就重整
        if (this.return_success == 'Y') {
          this.form_other.relation_to = this.pure_other.relation_to //清空
        }
      },
      async saveNewRelation() {
        console.log('===saveNewRelation')
        if (
          this.form_other.relation.p_id_to == '' ||
          this.form_other.relation.p_id_to == null ||
          this.form_other.relation.p_id_to == undefined
        ) {
          alert('請輸入關聯遊戲代碼')
          return false
        }
        if (
          this.form_other.relation.relation_id == '' ||
          this.form_other.relation.relation_id == null ||
          this.form_other.relation.relation_id == undefined
        ) {
          alert('請選擇關聯類型')
          return false
        }

        let ls_url = 'http://localhost:5252/api/product_relation'
        this.params = this.form_other.relation

        this.form_other.relation.p_id = this.form.p_id

        console.log(this.params)

        if (this.form_other.relation.id == '' || this.form_other.relation.id == null || this.form_other.relation.id == undefined) {
          //新增
          await axios
            .post(ls_url, this.params)
            .then((response) => (this.return_msg = response.data.message))
            .catch(function (error) {
              // 请求失败处理
              console.log(error)
            })
        } else {
          //編輯
          ls_url += `/${this.form_other.relation.id}`
          await axios
            .put(ls_url, this.params)
            .then((response) => (this.return_msg = response.data.message))
            .catch(function (error) {
              // 请求失败处理
              console.log(error)
            })
        }

        if (this.newRelation_link) {
          this.saveNewRelationTo() //遊戲2存檔
        }

        //拆解
        let msg_array = this.return_msg.split('#')
        this.return_success = msg_array[0]
        this.return_msg = msg_array[1]

        this.$baseMessage(this.return_msg, 'success')

        //成功就重整
        if (this.return_success == 'Y') {
          this.form_other.relation = this.pure_other.relation //清空
          this.newRelation_show = false
          this.getRelation()
        }
      },
      async saveNewRelease() {
        console.log('===saveNewRelease')
        if (
          this.form_other.release.sale_Date === '' ||
          this.form_other.release.sale_Date === null ||
          this.form_other.release.sale_Date === undefined
        ) {
          alert('請輸入發售日')
          return false
        }
        if (this.form_other.release.price === '' || this.form_other.release.price === null || this.form_other.release.price === undefined) {
          alert('請輸入售價')
          return false
        }
        if (
          this.form_other.release.voice_id === '' ||
          this.form_other.release.voice_id === null ||
          this.form_other.release.voice_id === undefined
        ) {
          alert('請選擇語音類型')
          return false
        }
        if (
          this.form_other.release.currency_id === '' ||
          this.form_other.release.currency_id === null ||
          this.form_other.release.currency_id === undefined
        ) {
          alert('請選擇貨幣類型')
          return false
        }
        if (
          this.form_other.release.device_id === '' ||
          this.form_other.release.device_id === null ||
          this.form_other.release.device_id === undefined
        ) {
          alert('請選擇機種類型')
          return false
        }
        if (
          this.form_other.release.rating_id === '' ||
          this.form_other.release.rating_id === null ||
          this.form_other.release.rating_id === undefined
        ) {
          alert('請選擇分級')
          return false
        }

        let ls_url = 'http://localhost:5252/api/product_release_day'
        this.params = this.form_other.release

        this.form_other.release.p_id = this.form.p_id

        console.log(this.params)

        if (this.form_other.release.id == '' || this.form_other.release.id == null || this.form_other.release.id == undefined) {
          //新增
          await axios
            .post(ls_url, this.params)
            .then((response) => (this.return_msg = response.data.message))
            .catch(function (error) {
              // 请求失败处理
              console.log(error)
            })
        } else {
          //編輯
          ls_url += `/${this.form_other.release.id}`
          await axios
            .put(ls_url, this.params)
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

        //成功就重整
        if (this.return_success == 'Y') {
          this.form_other.release = this.pure_other.release //清空
          this.newRelease_show = false
          this.getRelease()
        }
      },
      async saveNewStaffInfo() {
        console.log('===saveNewStaffInfo')
        if (
          this.form_other.staff_info.staff_id == '' ||
          this.form_other.staff_info.staff_id == null ||
          this.form_other.staff_info.staff_id == undefined
        ) {
          alert('請輸入人員代碼')
          return false
        }
        if (
          this.form_other.staff_info.name == '' ||
          this.form_other.staff_info.name == null ||
          this.form_other.staff_info.name == undefined
        ) {
          alert('請輸入人員名稱')
          return false
        }

        let ls_url = 'http://localhost:5252/api/staff_info'
        this.params = this.form_other.staff_info

        console.log(this.params)

        await axios
          .post(ls_url, this.params)
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

        //成功就重整
        if (this.return_success == 'Y') {
          this.form_other.staff_info = this.pure_other.staff_info //清空
          this.newStaffInfo_show = false
          this.getStaff()
        }
      },
      async saveNewStaff() {
        console.log('===saveNewStaff')
        if (
          this.form_other.staff.staff_typeid == '' ||
          this.form_other.staff.staff_typeid == null ||
          this.form_other.staff.staff_typeid == undefined
        ) {
          alert('請選擇類型')
          return false
        }
        if (this.form_other.staff.staff_id == '' || this.form_other.staff.staff_id == null || this.form_other.staff.staff_id == undefined) {
          alert('請選擇人員')
          return false
        }

        let ls_url = 'http://localhost:5252/api/staff'
        this.params = this.form_other.staff

        this.form_other.staff.p_id = this.form.p_id

        console.log(this.params)

        if (this.form_other.staff.id == '' || this.form_other.staff.id == null || this.form_other.staff.id == undefined) {
          //新增
          await axios
            .post(ls_url, this.params)
            .then((response) => (this.return_msg = response.data.message))
            .catch(function (error) {
              // 请求失败处理
              console.log(error)
            })
        } else {
          //編輯
          ls_url += `/${this.form_other.staff.id}`
          await axios
            .put(ls_url, this.params)
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

        //成功就重整
        if (this.return_success == 'Y') {
          this.form_other.staff = this.pure_other.staff //清空
          this.newStaff_show = false
          this.getStaff()
        }
      },
      async saveNewWebsite() {
        console.log('===saveNewWebsite')
        if (
          this.form_other.website.type_id == '' ||
          this.form_other.website.type_id == null ||
          this.form_other.website.type_id == undefined
        ) {
          alert('請選擇網址分類')
          return false
        }
        if (this.form_other.website.url == '' || this.form_other.website.url == null || this.form_other.website.url == undefined) {
          alert('請輸入網址')
          return false
        }

        let ls_url = 'http://localhost:5252/api/product_website'
        this.params = this.form_other.website

        this.form_other.website.p_id = this.form.p_id

        console.log(this.params)

        if (this.form_other.website.id == '' || this.form_other.website.id == null || this.form_other.website.id == undefined) {
          //新增
          await axios
            .post(ls_url, this.params)
            .then((response) => (this.return_msg = response.data.message))
            .catch(function (error) {
              // 请求失败处理
              console.log(error)
            })
        } else {
          //編輯
          ls_url += `/${this.form_other.website.id}`
          await axios
            .put(ls_url, this.params)
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

        //成功就重整
        if (this.return_success == 'Y') {
          this.form_other.website = this.pure_other.website //清空
          this.newWebsite_show = false
          this.getWebsite()
        }
      },
      async saveNewType() {
        console.log('===saveNewType')
        if (this.form_other.type == '' || this.form_other.type == null || this.form_other.type == undefined) {
          alert('請選擇屬性')
          return false
        }

        let ls_url = 'http://localhost:5252/api/product_type'
        this.params = {
          P_id: this.form.p_id,
          P_type_id: this.form_other.type,
          Remark: '',
        }

        console.log(this.params)

        await axios
          .post(ls_url, this.params)
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

        //成功就重整
        if (this.return_success == 'Y') {
          this.form_other.type = ''
          this.newType_show = false
          this.getType()
        }
      },
      async saveNewCompany() {
        console.log('===saveNewCompany')
        if (this.newCompany.c_id == '' || this.newCompany.c_id == null || this.newCompany.c_id == undefined) {
          alert('請輸入公司id')
          return false
        }
        if (this.newCompany.name == '' || this.newCompany.name == null || this.newCompany.name == undefined) {
          alert('請輸入公司name')
          return false
        }
        if (this.newCompany.c_type == '' || this.newCompany.c_type == null || this.newCompany.c_type == undefined) {
          alert('請選擇公司type')
          return false
        }

        let ls_url = 'http://localhost:5252/api/company'
        this.params = this.newCompany

        console.log(this.newCompany)
        console.log(this.params)

        await axios
          .post(ls_url, this.params)
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

        //成功就重整公司下拉選單
        if (this.return_success == 'Y') {
          this.form_type = []

          await axios
            .get('http://localhost:5252/api/company')
            .then((response) => (this.form_type = response.data))
            .catch(function (error) {
              // 请求失败处理
              console.log(error)
            })

          this.form.c_id = this.newCompany.c_id

          this.newCompany.c_id = ''
          this.newCompany.name = ''
          this.newCompany.c_type = ''
          this.newCompany_show = false
        }
      },
      save() {
        console.log('===save')
        this.$refs['form'].validate(async (valid) => {
          if (valid) {
            if (!this.form_lock) {
              console.log('新增')
              this.title = '新增'
              this.url = 'http://localhost:5252/api/product'
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

              //拆解
              let msg_array = this.return_msg.split('#')
              this.return_success = msg_array[0]
              this.return_msg = msg_array[1]

              this.$baseMessage(this.return_msg, 'success')

              if (this.return_success == 'Y') {
                if (
                  this.form_other.release.sale_Date === '' ||
                  this.form_other.release.sale_Date === null ||
                  this.form_other.release.sale_Date === undefined
                ) {
                  //do nothing
                } else {
                  let ls_url = 'http://localhost:5252/api/product_release_day'

                  this.form_other.release.p_id = this.form.p_id
                  this.form_other.release.official_First = true

                  console.log(this.form_other.release)

                  await axios
                    .post(ls_url, this.form_other.release)
                    .then((response) => (this.return_msg = response.data.message))
                    .catch(function (error) {
                      // 请求失败处理
                      console.log(error)
                    })

                  this.form_other.release = this.pure_other.release
                }
              }
            } else {
              console.log('編輯')
              this.title = '編輯'
              this.url = `http://localhost:5252/api/product/${this.form.p_id}`
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

<style scoped>
  .demo-image .block {
    padding: 10px 0;
    text-align: center;
    border-right: solid 1px var(--el-border-color);
    display: inline-block;
    width: 20%;
    box-sizing: border-box;
    vertical-align: top;
  }
  .demo-image .block:last-child {
    border-right: none;
  }
  .demo-image .demonstration {
    display: block;
    color: var(--el-text-color-secondary);
    font-size: 14px;
    margin-bottom: 10px;
  }
</style>
