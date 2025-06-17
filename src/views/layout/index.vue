<script setup>
import { EditPen, SwitchButton } from '@element-plus/icons-vue'
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElDialog, ElForm, ElFormItem, ElInput, ElButton } from 'element-plus'


// 获取当前登录成员信息（假设登录后将用户信息存储在localStorage）
const user = ref(JSON.parse(localStorage.getItem('user') || '{}'))

// 修改密码弹窗相关
const showPwdDialog = ref(false)
const pwdForm = ref({
  oldPassword: '',
  newPassword: ''
})
const pwdFormRef = ref(null)
const pwdLoading = ref(false)

const router = useRouter()

// 显示登录成员名
const userName = user.value.name || user.value.username || '未登录'

// 退出登录
const handleLogout = () => {
  localStorage.removeItem('token')
  localStorage.removeItem('user')
  ElMessage.success('已退出登录')
  router.push('/login')
}

// 打开修改密码弹窗
const openPwdDialog = () => {
  pwdForm.value.oldPassword = ''
  pwdForm.value.newPassword = ''
  showPwdDialog.value = true
}


</script>

<template>
  <!-- container -->
  <div class="common-layout">
    <el-container>
      <el-header>
        <span class="title">Tutu 智能学习系统</span>
        <span class="right tool">
          <span class="user-info">
            <el-avatar class="user-avatar" size="small" src="https://api.dicebear.com/7.x/miniavs/svg?seed=1" />
            <span class="user-name">{{ userName }}</span>
          </span>
          <a href="#" class="header-link" @click.prevent="openPwdDialog">
            <el-icon class="icon">
              <EditPen />
            </el-icon>
            修改密码
          </a>
          <a href="#" class="header-link" @click.prevent="handleLogout">
            <el-icon class="icon">
              <SwitchButton />
            </el-icon>
            退出登录
          </a>
        </span>
      </el-header>

      <el-container>
        <!-- 左侧菜单 -->
        <el-aside width="200px">
          <!-- 左侧菜单栏 -->
          <el-menu router>
            <!-- 首页菜单 -->
            <el-menu-item index="/index">
              <el-icon>
                <Promotion />
              </el-icon> 首页
            </el-menu-item>
            

            <!-- 班级管理菜单 -->
            <el-sub-menu index="/manage">
              <template #title>
                <el-icon>
                  <Menu />
                </el-icon> 班级学员管理
              </template>
              <el-menu-item index="/clazz">
                <el-icon>
                  <HomeFilled />
                </el-icon>班级管理
              </el-menu-item>
              <el-menu-item index="/stu">
                <el-icon>
                  <UserFilled />
                </el-icon>学员管理
              </el-menu-item>
            </el-sub-menu>

            <!-- 系统信息管理 -->
            <el-sub-menu index="/system">
              <template #title>
                <el-icon>
                  <Tools />
                </el-icon>系统信息管理
              </template>
              <el-menu-item index="/dept">
                <el-icon>
                  <HelpFilled />
                </el-icon>部门管理
              </el-menu-item>
              <el-menu-item index="/emp">
                <el-icon>
                  <Avatar />
                </el-icon>员工管理
              </el-menu-item>
            </el-sub-menu>

            <!-- 数据统计管理 -->
            <el-sub-menu index="/report">
              <template #title>
                <el-icon>
                  <Histogram />
                </el-icon>数据统计管理
              </template>
              <el-menu-item index="/empReport">
                <el-icon>
                  <InfoFilled />
                </el-icon>员工信息统计
              </el-menu-item>
              <el-menu-item index="/stuReport">
                <el-icon>
                  <Share />
                </el-icon>学员信息统计
              </el-menu-item>
              <el-menu-item index="/log">
                <el-icon>
                  <Document />
                </el-icon>日志信息统计
              </el-menu-item>
            </el-sub-menu>
          </el-menu>
        </el-aside>

        <el-main>
          <!-- 主内容区 -->
          <!-- 子路由视图 -->
          <router-view></router-view>
        </el-main>
      </el-container>
    </el-container>

    <!-- 修改密码弹窗 -->
    <el-dialog v-model="showPwdDialog" title="修改密码" width="400px" :close-on-click-modal="false">
      <el-form :model="pwdForm" ref="pwdFormRef" label-width="80px">
        <el-form-item label="原密码" prop="oldPassword">
          <el-input v-model="pwdForm.oldPassword" type="password" autocomplete="off" />
        </el-form-item>
        <el-form-item label="新密码" prop="newPassword">
          <el-input v-model="pwdForm.newPassword" type="password" autocomplete="off" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showPwdDialog = false">取消</el-button>
        <el-button type="primary" :loading="pwdLoading" @click="handlePwdSubmit">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>



        
<style scoped>
.title {
  font-size: 22px;
  font-weight: bold;
  color: #409EFF;
  letter-spacing: 2px;
  line-height: 60px;
}

.right.tool {
  float: right;
  display: flex;
  align-items: center;
  gap: 18px;
  height: 60px;
}

.header-link {
  color: #606266;
  text-decoration: none;
  display: flex;
  align-items: center;
  font-size: 15px;
  padding: 0 8px;
  border-radius: 4px;
  transition: background 0.2s;
}

.header-link:hover {
  background: #f2f6fc;
  color: #409EFF;
}

.icon {
  margin-right: 4px;
  font-size: 18px;
}

.user-info {
  display: flex;
  align-items: center;
  margin-right: 18px;
}

.user-avatar {
  margin-right: 6px;
}

.user-name {
  font-size: 15px;
  color: #333;
  font-weight: 500;
}
</style>