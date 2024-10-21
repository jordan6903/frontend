/**
 * @author https://github.com/zxwk1998/vue-admin-better （不想保留author可删除）
 * @description router全局配置，如有必要可分文件抽离，其中asyncRoutes只有在intelligence模式下才会用到，vip文档中已提供路由的基础图标与小清新图标的配置方案，请仔细阅读
 */

import Vue from 'vue'
import VueRouter from 'vue-router'
import Layout from '@/layouts'
import EmptyLayout from '@/layouts/EmptyLayout'
import { publicPath, routerMode } from '@/config'

Vue.use(VueRouter)
export const constantRoutes = [
  {
    path: '/login',
    component: () => import('@/views/login/index'),
    hidden: true,
  },
  {
    path: '/register',
    component: () => import('@/views/register/index'),
    hidden: true,
  },
  {
    path: '/401',
    name: '401',
    component: () => import('@/views/401'),
    hidden: true,
  },
  {
    path: '/404',
    name: '404',
    component: () => import('@/views/404'),
    hidden: true,
  },
]

export const asyncRoutes = [
  {
    path: '/',
    component: Layout,
    redirect: '/index',
    children: [
      {
        path: 'index',
        name: 'Index',
        component: () => import('@/views/index/index'),
        meta: {
          title: '首頁',
          icon: 'home',
          affix: true,
        },
      },
    ],
  },
  {
    path: '/basicProfile',
    component: Layout,
    redirect: 'noRedirect',
    name: 'BasicProfile',
    alwaysShow: true,
    meta: { title: '其他基本設定檔', icon: 'box-open' },
    children: [
      {
        path: 'currency',
        name: 'Currency',
        component: () => import('@/views/basicProfile/currency/index'),
        meta: {
          title: '貨幣設定檔 Currency',
          icon: 'chalkboard',
          permissions: ['admin'],
        },
      },
      {
        path: 'device',
        name: 'Device',
        component: () => import('@/views/basicProfile/device/index'),
        meta: {
          title: '平台機種設計檔 Device',
          icon: 'chalkboard',
          permissions: ['admin'],
        },
      },
      {
        path: 'voice',
        name: 'Voice',
        component: () => import('@/views/basicProfile/voice/index'),
        meta: {
          title: '語音類型設計檔 Voice_type',
          icon: 'chalkboard',
          permissions: ['admin'],
        },
      },
      {
        path: 'rating',
        component: EmptyLayout,
        redirect: 'noRedirect',
        name: 'rating',
        alwaysShow: true,
        meta: {
          title: '分級設定檔 Rating',
          permissions: ['admin'],
        },
        children: [
          {
            path: 'rating',
            name: 'Rating',
            component: () => import('@/views/basicProfile/rating/index'),
            meta: {
              title: '分級設定檔 Rating',
              icon: 'chalkboard',
              permissions: ['admin'],
            },
          },
          {
            path: 'ratingType',
            name: 'RatingType',
            component: () => import('@/views/basicProfile/ratingType/index'),
            meta: {
              title: '分級分類設定檔 Rating_type',
              icon: 'chalkboard',
              permissions: ['admin'],
            },
          },
        ],
      },
    ],
  },
  {
    path: '/companyProfile',
    component: Layout,
    redirect: 'noRedirect',
    name: 'CompanyProfile',
    alwaysShow: true,
    meta: { title: '公司', icon: 'box-open' },
    children: [
      {
        path: 'company',
        name: 'Company',
        component: () => import('@/views/companyProfile/company/index'),
        meta: {
          title: '公司 Company',
          icon: 'chalkboard',
          permissions: ['admin'],
        },
      },
      {
        path: 'companyRelation',
        name: 'CompanyRelation',
        component: () => import('@/views/companyProfile/companyRelation/index'),
        meta: {
          title: '公司間關聯 Company_relation',
          icon: 'chalkboard',
          permissions: ['admin'],
        },
      },
      {
        path: 'companyRelationInfo',
        name: 'CompanyRelationInfo',
        component: () => import('@/views/companyProfile/companyRelationInfo/index'),
        meta: {
          title: '公司間關聯設計檔 Company_relation_info',
          icon: 'chalkboard',
          permissions: ['admin'],
        },
      },
      {
        path: 'companyType',
        name: 'CompanyType',
        component: () => import('@/views/companyProfile/companyType/index'),
        meta: {
          title: '公司類型設定檔 Company_type',
          icon: 'chalkboard',
          permissions: ['admin'],
        },
      },
    ],
  },
  {
    path: '/productProfile',
    component: Layout,
    redirect: 'noRedirect',
    name: 'ProductProfile',
    alwaysShow: true,
    meta: { title: '遊戲', icon: 'box-open' },
    children: [
      {
        path: 'product',
        name: 'Product',
        component: () => import('@/views/productProfile/product/index'),
        meta: {
          title: '遊戲 Product',
          icon: 'chalkboard',
          permissions: ['admin'],
        },
      },
      {
        path: 'productReleaseDay',
        name: 'ProductReleaseDay',
        component: () => import('@/views/productProfile/productReleaseDay/index'),
        meta: {
          title: '遊戲發售日 Product_Release_day',
          icon: 'chalkboard',
          permissions: ['admin'],
        },
      },
      {
        path: 'productType',
        name: 'ProductType',
        component: () => import('@/views/productProfile/productType/index'),
        meta: {
          title: '作品屬性/標籤 Product_type',
          icon: 'chalkboard',
          permissions: ['admin'],
        },
      },
      {
        path: 'productRelation',
        name: 'ProductRelation',
        component: () => import('@/views/productProfile/productRelation/index'),
        meta: {
          title: '遊戲間關聯 Product_relation',
          icon: 'chalkboard',
          permissions: ['admin'],
        },
      },
      {
        path: 'productScore',
        name: 'ProductScore',
        component: () => import('@/views/productProfile/productScore/index'),
        meta: {
          title: '遊戲評分 Product_score',
          icon: 'chalkboard',
          permissions: ['admin'],
        },
      },
      {
        path: 'staff',
        component: EmptyLayout,
        redirect: 'noRedirect',
        name: 'Staff',
        alwaysShow: true,
        meta: {
          title: '製作人員相關',
          permissions: ['admin'],
        },
        children: [
          {
            path: 'staff',
            name: 'Staff',
            component: () => import('@/views/basicProfile/staff/staff/index'),
            meta: {
              title: '製作人員 Staff',
              icon: 'chalkboard',
              permissions: ['admin'],
            },
          },
          {
            path: 'staffInfo',
            name: 'StaffInfo',
            component: () => import('@/views/basicProfile/staff/staffInfo/index'),
            meta: {
              title: '製作人員資訊 Staff_info',
              icon: 'chalkboard',
              permissions: ['admin'],
            },
          },
          {
            path: 'staffType',
            name: 'StaffType',
            component: () => import('@/views/basicProfile/staff/staffType/index'),
            meta: {
              title: '工作類型設計檔 Staff_type',
              icon: 'chalkboard',
              permissions: ['admin'],
            },
          },
        ],
      },
      {
        path: 'productScoreType',
        name: 'ProductScoreType',
        component: () => import('@/views/productProfile/productScoreType/index'),
        meta: {
          title: '遊戲評分類型設定檔 Product_score_type',
          icon: 'chalkboard',
          permissions: ['admin'],
        },
      },
      {
        path: 'productRelationInfo',
        name: 'ProductRelationInfo',
        component: () => import('@/views/productProfile/productRelationInfo/index'),
        meta: {
          title: '遊戲間關聯設計檔 Product_relation_info',
          icon: 'chalkboard',
          permissions: ['admin'],
        },
      },
      {
        path: 'productTypeClass',
        name: 'ProductTypeClass',
        component: () => import('@/views/productProfile/productTypeClass/index'),
        meta: {
          title: '屬性標籤之分類設計檔 Product_type_class',
          icon: 'chalkboard',
          permissions: ['admin'],
        },
      },
      {
        path: 'productTypeInfo',
        name: 'ProductTypeInfo',
        component: () => import('@/views/productProfile/productTypeInfo/index'),
        meta: {
          title: '屬性標籤設計檔 Product_type_info',
          icon: 'chalkboard',
          permissions: ['admin'],
        },
      },
    ],
  },
  {
    path: '/websiteProfile',
    component: Layout,
    redirect: 'noRedirect',
    name: 'WebsiteProfile',
    alwaysShow: true,
    meta: { title: '外連網址與圖片', icon: 'box-open' },
    children: [
      {
        path: 'websiteType',
        name: 'WebsiteType',
        component: () => import('@/views/websiteProfile/websiteType/index'),
        meta: {
          title: '網址種類設定檔 Website_Type',
          icon: 'chalkboard',
          permissions: ['admin'],
        },
      },
      {
        path: 'productWebsite',
        name: 'ProductWebsite',
        component: () => import('@/views/websiteProfile/productWebsite/index'),
        meta: {
          title: '遊戲網址連結 Product_Website',
          icon: 'chalkboard',
          permissions: ['admin'],
        },
      },
      {
        path: 'productPic',
        name: 'ProductPic',
        component: () => import('@/views/websiteProfile/productPic/index'),
        meta: {
          title: '遊戲圖片連結 Product_Pic',
          icon: 'chalkboard',
          permissions: ['admin'],
        },
      },
      {
        path: 'companyWebsite',
        name: 'CompanyWebsite',
        component: () => import('@/views/websiteProfile/companyWebsite/index'),
        meta: {
          title: '公司網址連結 Company_Website',
          icon: 'chalkboard',
          permissions: ['admin'],
        },
      },
      {
        path: 'companyPic',
        name: 'CompanyPic',
        component: () => import('@/views/websiteProfile/companyPic/index'),
        meta: {
          title: '公司圖片連結 Company_Pic',
          icon: 'chalkboard',
          permissions: ['admin'],
        },
      },
    ],
  },
  {
    path: '/translationProfile',
    component: Layout,
    redirect: 'noRedirect',
    name: 'TranslationProfile',
    alwaysShow: true,
    meta: { title: '漢化', icon: 'box-open' },
    children: [
      {
        path: 'translationTeam',
        name: 'TranslationTeam',
        component: () => import('@/views/translationProfile/translationTeam/index'),
        meta: {
          title: '漢化組 Translation_team',
          icon: 'chalkboard',
          permissions: ['admin'],
        },
      },
      {
        path: 'translationTeamInfo',
        name: 'TranslationTeamInfo',
        component: () => import('@/views/translationProfile/translationTeamInfo/index'),
        meta: {
          title: '漢化組資料 Translation_team_info',
          icon: 'chalkboard',
          permissions: ['admin'],
        },
      },
      {
        path: 'translationTeamType',
        name: 'TranslationTeamType',
        component: () => import('@/views/translationProfile/translationTeamType/index'),
        meta: {
          title: '漢化類型設定檔 Translation_team_type',
          icon: 'chalkboard',
          permissions: ['admin'],
        },
      },
    ],
  },
  {
    path: '/view',
    component: Layout,
    redirect: 'noRedirect',
    name: 'view',
    alwaysShow: true,
    meta: { title: '輸出', icon: 'box-open' },
    children: [
      {
        path: 'export1',
        name: 'Export1',
        component: () => import('@/views/view/export1/index'),
        meta: {
          title: '輸出資料 export',
          icon: 'chalkboard',
          permissions: ['admin'],
        },
      },
      {
        path: 'export2',
        name: 'Export2',
        component: () => import('@/views/view/export2/index'),
        meta: {
          title: '輸出資料2 export2',
          icon: 'chalkboard',
          permissions: ['admin'],
        },
      },
      {
        path: 'export3',
        name: 'Export3',
        component: () => import('@/views/view/export3/index'),
        meta: {
          title: '輸出資料3 export3',
          icon: 'chalkboard',
          permissions: ['admin'],
        },
      },
    ],
  },
  {
    path: '/export_set',
    component: Layout,
    redirect: 'noRedirect',
    name: 'export_set',
    alwaysShow: true,
    meta: { title: '輸出', icon: 'box-open' },
    children: [
      {
        path: 'batch',
        name: 'Batch',
        component: () => import('@/views/export_set/batch/index'),
        meta: {
          title: '輸出批次 batch',
          icon: 'chalkboard',
          permissions: ['admin'],
        },
      },
      {
        path: 'view',
        name: 'View',
        component: () => import('@/views/export_set/view/index'),
        meta: {
          title: '輸出 view',
          icon: 'chalkboard',
          permissions: ['admin'],
        },
      },
    ],
  },
  {
    path: '/vab',
    component: Layout,
    redirect: 'noRedirect',
    name: 'Vab',
    //alwaysShow: true,
    meta: { title: '组件', icon: 'box-open' },
    children: [
      {
        path: 'permissions',
        name: 'Permission',
        component: () => import('@/views/vab/permissions/index'),
        meta: {
          title: '角色权限',
          permissions: ['admin', 'editor'],
        },
      },
      {
        path: 'icon',
        component: EmptyLayout,
        redirect: 'noRedirect',
        name: 'Icon',
        meta: {
          title: '图标',
          permissions: ['admin'],
        },
        children: [
          {
            path: 'awesomeIcon',
            name: 'AwesomeIcon',
            component: () => import('@/views/vab/icon/index'),
            meta: { title: '常规图标' },
          },
          {
            path: 'colorfulIcon',
            name: 'ColorfulIcon',
            component: () => import('@/views/vab/icon/colorfulIcon'),
            meta: { title: '多彩图标' },
          },
        ],
      },
      {
        path: 'table',
        component: () => import('@/views/vab/table/index'),
        name: 'Table',
        meta: {
          title: '表格',
          permissions: ['admin'],
        },
      },

      {
        path: 'webSocket',
        name: 'WebSocket',
        component: () => import('@/views/vab/webSocket/index'),
        meta: { title: 'webSocket', permissions: ['admin'] },
      },
      {
        path: 'form',
        name: 'Form',
        component: () => import('@/views/vab/form/index'),
        meta: { title: '表单', permissions: ['admin'] },
      },
      {
        path: 'element',
        name: 'Element',
        component: () => import('@/views/vab/element/index'),
        meta: { title: '常用组件', permissions: ['admin'] },
      },
      {
        path: 'tree',
        name: 'Tree',
        component: () => import('@/views/vab/tree/index'),
        meta: { title: '树', permissions: ['admin'] },
      },
      {
        path: 'menu1',
        component: () => import('@/views/vab/nested/menu1/index'),
        name: 'Menu1',
        alwaysShow: true,
        meta: {
          title: '嵌套路由 1',
          permissions: ['admin'],
        },
        children: [
          {
            path: 'menu1-1',
            name: 'Menu1-1',
            alwaysShow: true,
            meta: { title: '嵌套路由 1-1' },
            component: () => import('@/views/vab/nested/menu1/menu1-1/index'),

            children: [
              {
                path: 'menu1-1-1',
                name: 'Menu1-1-1',
                meta: { title: '嵌套路由 1-1-1' },
                component: () => import('@/views/vab/nested/menu1/menu1-1/menu1-1-1/index'),
              },
            ],
          },
        ],
      },
      {
        path: 'loading',
        name: 'Loading',
        component: () => import('@/views/vab/loading/index'),
        meta: { title: 'loading', permissions: ['admin'] },
      },
      {
        path: 'backToTop',
        name: 'BackToTop',
        component: () => import('@/views/vab/backToTop/index'),
        meta: { title: '返回顶部', permissions: ['admin'] },
      },
      {
        path: 'lodash',
        name: 'Lodash',
        component: () => import('@/views/vab/lodash/index'),
        meta: { title: 'lodash', permissions: ['admin'] },
      },

      {
        path: 'upload',
        name: 'Upload',
        component: () => import('@/views/vab/upload/index'),
        meta: { title: '上传', permissions: ['admin'] },
      },
      {
        path: 'log',
        name: 'Log',
        component: () => import('@/views/vab/errorLog/index'),
        meta: { title: '错误日志模拟', permissions: ['admin'] },
      },
      {
        path: 'https://github.com/zxwk1998/vue-admin-better/',
        name: 'ExternalLink',
        meta: {
          title: '外链',
          target: '_blank',
          permissions: ['admin', 'editor'],
          badge: 'New',
        },
      },
      {
        path: 'more',
        name: 'More',
        component: () => import('@/views/vab/more/index'),
        meta: { title: '关于', permissions: ['admin'] },
      },
    ],
  },
  {
    path: '/personnelManagement',
    component: Layout,
    redirect: 'noRedirect',
    name: 'PersonnelManagement',
    meta: { title: '配置', icon: 'users-cog', permissions: ['admin'] },
    children: [
      {
        path: 'userManagement',
        name: 'UserManagement',
        component: () => import('@/views/personnelManagement/userManagement/index'),
        meta: { title: '用户管理' },
      },
      {
        path: 'roleManagement',
        name: 'RoleManagement',
        component: () => import('@/views/personnelManagement/roleManagement/index'),
        meta: { title: '角色管理' },
      },
      {
        path: 'menuManagement',
        name: 'MenuManagement',
        component: () => import('@/views/personnelManagement/menuManagement/index'),
        meta: { title: '菜单管理', badge: 'New' },
      },
    ],
  },
  {
    path: '/mall',
    component: Layout,
    redirect: 'noRedirect',
    name: 'Mall',
    meta: {
      title: '商城',
      icon: 'shopping-cart',
      permissions: ['admin'],
    },

    children: [
      {
        path: 'pay',
        name: 'Pay',
        component: () => import('@/views/mall/pay/index'),
        meta: {
          title: '支付',
          noKeepAlive: true,
        },
        children: null,
      },
      {
        path: 'goodsList',
        name: 'GoodsList',
        component: () => import('@/views/mall/goodsList/index'),
        meta: {
          title: '商品列表',
        },
      },
    ],
  },
  {
    path: '/error',
    component: EmptyLayout,
    redirect: 'noRedirect',
    name: 'Error',
    meta: { title: '错误页', icon: 'bug' },
    children: [
      {
        path: '401',
        name: 'Error401',
        component: () => import('@/views/401'),
        meta: { title: '401' },
      },
      {
        path: '404',
        name: 'Error404',
        component: () => import('@/views/404'),
        meta: { title: '404' },
      },
    ],
  },
  {
    path: '*',
    redirect: '/404',
    hidden: true,
  },
]

const router = new VueRouter({
  base: publicPath,
  mode: routerMode,
  scrollBehavior: () => ({
    y: 0,
  }),
  routes: constantRoutes,
})

export function resetRouter() {
  location.reload()
}

export default router
