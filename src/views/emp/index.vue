<script setup>
import { ref, onMounted, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getEmpList, addEmp, batchDeleteEmp, updateEmp, getEmpDetail } from '@/api/emp'
import { getDeptList } from '@/api/dept'
import { uploadImage } from '@/api/upload'

// 数据相关
const empList = ref([])
const total = ref(0)
const loading = ref(false)
const multipleSelection = ref([])

// 一定要与后端接口保持一致
const searchForm = ref({
  name: '',
  gender: '',
  beginDate: '',
  endDate: '',
})

// 分页相关
const pageQuery = ref({
  page: 1,
  pageSize: 10
})

// 日期范围选择器
const dateRange = ref([])

// 添加对 dateRange 的侦听器
watch(dateRange, (newVal) => {
  if (newVal && newVal.length === 2) {
    searchForm.value.beginDate = newVal[0]
    searchForm.value.endDate = newVal[1]
  } else {
    searchForm.value.beginDate = ''
    searchForm.value.endDate = ''
  }
  pageQuery.value.page = 1 // 重置页码
  loadEmpList()
}, { deep: true })

// 添加搜索表单的侦听器
watch(
  () => ({
    name: searchForm.value.name,
    gender: searchForm.value.gender
  }),
  () => {
    pageQuery.value.page = 1 // 重置页码
    loadEmpList()
  },
  { deep: true }
)

// 弹窗相关
const dialogVisible = ref(false)
const empForm = ref({
  username: '',
  name: '',
  gender: 1,
  image: '',
  imageUrl: '', // 添加用于预览的临时URL
  imageFile: null, // 添加用于存储文件对象
  job: '',
  entryDate: '',
  deptId: '',
  salary: '',
  phone: '',
  exprList: []
})

// 编辑状态标识
const isEdit = ref(false)

// 添加日期格式验证函数
const validateDateFormat = (date) => {
  if (!date) return true
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/
  return dateRegex.test(date)
}

// 获取员工列表数据
const loadEmpList = async () => {
  loading.value = true
  try {
    const params = {
      name: searchForm.value.name || undefined,
      gender: searchForm.value.gender || undefined,
      beginDate: searchForm.value.beginDate || undefined,
      endDate: searchForm.value.endDate || undefined,
      page: pageQuery.value.page,
      pageSize: pageQuery.value.pageSize
    }
    
    const { total: totalCount, rows } = await getEmpList(params)
    empList.value = rows
    total.value = totalCount
  } catch (error) {
    console.error('获取员工列表失败:', error)
    ElMessage.error('获取员工列表失败，请稍后重试')
  } finally {
    loading.value = false
  }
}

// 日期变化处理函数
const handleDateChange = (val) => {
  // 如果有值
  if (val) {
    // 将开始日期和结束日期赋值给searchForm
    searchForm.value.beginDate = val[0]
    searchForm.value.endDate = val[1]
  } else {
    // 如果没有值，将开始日期和结束日期置空
    searchForm.value.beginDate = ''
    searchForm.value.endDate = ''
  }
  // 加载员工列表
  loadEmpList()
}

// 重置搜索条件
const resetSearch = () => {
  searchForm.value = {
    name: '',
    gender: '',
    beginDate: '',
    endDate: ''
  }
  dateRange.value = [] // 确保清空日期范围
  pageQuery.value.page = 1
  loadEmpList()
}

// 处理表格选择变化
const handleSelectionChange = (val) => {
  multipleSelection.value = val
}

// 批量删除
const handleBatchDelete = () => {
  if (multipleSelection.value.length === 0) {
    ElMessage.warning('请选择要删除的员工')
    return
  }
  
  ElMessageBox.confirm('确定要删除选中的员工吗？', '提示', {
    type: 'warning'
  }).then(async () => {
    try {
      const ids = multipleSelection.value.map(item => item.id)
      await batchDeleteEmp(ids)
      ElMessage.success('删除成功')
      loadEmpList()
    } catch (error) {
      ElMessage.error('删除失败，请稍后重试')
    }
  })
}

// 处理单个删除
const handleDelete = (row) => {
  ElMessageBox.confirm(`确定要删除【${row.name}】吗？`, '提示', {
    type: 'warning'
  }).then(async () => {
    try {
      await batchDeleteEmp([row.id])
      ElMessage.success('删除成功')
      loadEmpList()
    } catch (error) {
      ElMessage.error('删除失败，请稍后重试')
    }
  })
}

// 处理编辑
const handleEdit = async (row) => {
  isEdit.value = true
  dialogVisible.value = true
  loading.value = true
  try {
    // 通过id获取员工详情
    const detail = await getEmpDetail(row.id)
    // 回显表单
    empForm.value = {
      id: detail.id,
      username: detail.username,
      name: detail.name,
      gender: detail.gender,
      image: detail.image,
      imageUrl: '', // 预览用
      imageFile: null,
      job: detail.job,
      entryDate: detail.entryDate ? detail.entryDate.split(' ')[0] : '',
      deptId: detail.deptId,
      salary: detail.salary,
      phone: detail.phone
    }
    // 回显工作经历
    exprList.value = detail.exprList ? JSON.parse(JSON.stringify(detail.exprList)) : []
    // 重置表单校验
    if (empFormRef.value) empFormRef.value.resetFields()
  } catch (e) {
    ElMessage.error('获取员工详情失败')
  } finally {
    loading.value = false
  }
}

// 监听分页变化
const handlePageChange = () => {
  loadEmpList()
}

// 页面加载时获取数据
onMounted(() => {
  loadEmpList()
  loadDeptList() // 添加这行
})

// 修改 rules 的定义
const rules = ref({
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur' }
  ],
  name: [
    { required: true, message: '请输入姓名', trigger: 'blur' },
    { min: 2, max: 10, message: '长度在 2 到 10 个字符', trigger: 'blur' }
  ],
  phone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' }
  ],
  salary: [
    { required: true, message: '请输入薪资', trigger: 'blur' },
    { type: 'number', message: '薪资必须为数字', trigger: 'blur' }
  ],
  entryDate: [
    { required: true, message: '请选择入职日期', trigger: 'change' }
  ],
  deptId: [
    { required: true, message: '请选择部门', trigger: 'change' }
  ]
})

// 工作经历表单
const exprList = ref([])

// 添加工作经历
const addExpr = () => {
  exprList.value.push({
    company: '',
    job: '',
    begin: '',
    end: ''
  })
}

// 删除工作经历
const removeExpr = (index) => {
  exprList.value.splice(index, 1)
}

// 提交表单
const empFormRef = ref(null)
// 修改提交方法，支持编辑
const handleSubmit = async () => {
  if (!empFormRef.value) return

  try {
    await empFormRef.value.validate()

    // 如果有新选择的图片，先上传图片
    if (empForm.value.imageFile) {
      const formData = new FormData()
      formData.append('file', empForm.value.imageFile)
      const imageUrl = await uploadImage(formData)
      empForm.value.image = imageUrl
    }

    const params = {
      ...empForm.value,
      exprList: exprList.value
    }
    delete params.imageUrl
    delete params.imageFile

    if (isEdit.value) {
      // 这里需要传递完整的员工数据给后端
      await updateEmp(params)
      ElMessage.success('修改成功')
    } else {
      await addEmp(params)
      ElMessage.success('添加成功')
    }
    dialogVisible.value = false
    loadEmpList()
  } catch (error) {
    ElMessage.error(isEdit.value ? '修改失败' : '添加失败')
  }
}

// 添加员工
const handleAdd = () => {
  isEdit.value = false
  // 重置表单数据
  empForm.value = {
    username: '',
    name: '',
    gender: 1,
    image: '',
    imageUrl: '', // 添加用于预览的临时URL
    imageFile: null, // 添加用于存储文件对象
    job: '',
    entryDate: '',
    deptId: '',
    salary: '',
    phone: ''
  }
  
  // 重置工作经历
  exprList.value = []
  
  // 重置表单验证状态
  if (empFormRef.value) {
    empFormRef.value.resetFields()
  }
  
  // 打开对话框
  dialogVisible.value = true
}

// 添加部门列表的响应式数据
const deptList = ref([])

// 添加获取部门列表的方法
const loadDeptList = async () => {
  try {
    deptList.value = await getDeptList()
  } catch (error) {
    console.error('获取部门列表失败:', error)
    ElMessage.error('获取部门列表失败')
  }
}

// 修改图片上传相关方法
const handleFileChange = async (file) => {
  try {
    // 直接上传图片获取URL
    const formData = new FormData()
    formData.append('file', file.raw)
    const imageUrl = await uploadImage(formData)
    
    // 将返回的URL直接赋值给表单
    empForm.value.image = imageUrl
    ElMessage.success('头像上传成功')
  } catch (error) {
    console.error('上传失败:', error)
    ElMessage.error('上传失败，请重试')
  }
}

// 职位列表数据
const jobs = ref([
  { name: '班主任', value: 1 },
  { name: '讲师', value: 2 },
  { name: '学工主管', value: 3 },
  { name: '教研主管', value: 4 },
  { name: '咨询师', value: 5 },
  { name: '其他', value: 6 }
])
</script>

<template>
  <div class="emp-container">
    <!-- 搜索表单 -->
    <el-form :inline="true" :model="searchForm" class="search-form">
      <el-form-item label="姓名">
        <el-input 
          v-model="searchForm.name" 
          placeholder="请输入姓名" 
          clearable
        />
      </el-form-item>
      <el-form-item label="性别">
        <el-select 
          v-model="searchForm.gender" 
          placeholder="请选择性别"
          clearable
          style="width: 120px"
        >
          <el-option label="男" :value="1" />
          <el-option label="女" :value="2" />
        </el-select>
      </el-form-item>
      <el-form-item label="入职日期">
        <el-date-picker
          v-model="dateRange"
          type="daterange"
          value-format="YYYY-MM-DD"
          :clearable="true"
          :editable="false"
          unlink-panels
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          @change="handleDateChange"
        />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="loadEmpList" :loading="loading">查询</el-button>
        <el-button @click="resetSearch">重置</el-button>
      </el-form-item>
    </el-form>

    <!-- 工具栏 -->
    <div class="toolbar">
      <el-button type="primary" @click="handleAdd">新增员工</el-button>
      <el-button type="danger" @click="handleBatchDelete">批量删除</el-button>
    </div>

    <!-- 表格 -->
    <el-table
      v-loading="loading"
      :data="empList"
      @selection-change="handleSelectionChange"
      border
    >
      <el-table-column type="selection" width="55" />
      <el-table-column label="序号" type="index" width="60" align="center" />
      <el-table-column prop="name" label="姓名" width="120" align="center" />
      <el-table-column prop="gender" label="性别" width="80" align="center">
        <template #default="{ row }">
          {{ row.gender === 1 ? '男' : '女' }}
        </template>
      </el-table-column>
      <el-table-column prop="image" label="头像" width="100" align="center">
        <template #default="{ row }">
          <el-image
            :src="row.image"
            :preview-src-list="[row.image]"
            preview-teleported
            fit="cover"
            style="width: 50px; height: 50px; border-radius: 50%"
          />
        </template>
      </el-table-column>
      <el-table-column prop="deptName" label="所属部门" align="center" />
      <el-table-column prop="job" label="职位" align="center">
        <template #default="{ row }">
          {{ jobs.find(item => item.value === row.job)?.name || '未知' }}
        </template>
      </el-table-column>
      <el-table-column prop="entryDate" label="入职日期" align="center" :formatter="(row) => row.entryDate?.split(' ')[0]" />
      <el-table-column
        label="最后操作时间"
        align="center"
        :formatter="(row) => row.updateTime?.replace('T', ' ').substring(0, 19)"
      />
      <el-table-column label="操作" align="center" width="220">
        <template #default="{ row }">
          <el-button type="primary" size="small" @click="handleEdit(row)">修改</el-button>
          <el-button type="danger" size="small" @click="handleDelete(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <div class="pagination">
      <el-pagination
        v-model:current-page="pageQuery.page"
        v-model:page-size="pageQuery.pageSize"
        :total="total"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handlePageChange"
        @current-change="handlePageChange"
      />
    </div>

    <!-- 添加员工弹窗 -->
    <el-dialog 
      v-model="dialogVisible" 
      :title="isEdit ? '修改员工信息' : '新增员工'" 
      width="600px"
      :before-close="() => dialogVisible = false"
    >
      <el-form :model="empForm" ref="empFormRef" :rules="rules" label-width="100px">
        <!-- 图片上传 -->
        <el-form-item label="头像" prop="image">
          <el-upload
            class="avatar-uploader"
            :auto-upload="false"
            accept=".jpg,.jpeg,.png"
            :show-file-list="false"
            :before-upload="beforeAvatarUpload"
            :on-change="handleFileChange"
          >
            <img
              v-if="empForm.image"
              :src="empForm.image"
              class="avatar"
              alt="头像"
            />
            <el-icon v-else class="avatar-uploader-icon">
              <Plus />
            </el-icon>
          </el-upload>
        </el-form-item>
        <el-form-item label="用户名" prop="username">
          <el-input v-model="empForm.username" placeholder="请输入用户名" />
        </el-form-item>
        <el-form-item label="姓名" prop="name">
          <el-input v-model="empForm.name" placeholder="请输入姓名" />
        </el-form-item>
        <el-form-item label="性别" prop="gender">
          <el-radio-group v-model="empForm.gender">
            <el-radio :label="1">男</el-radio>
            <el-radio :label="2">女</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="手机号" prop="phone">
          <el-input v-model="empForm.phone" placeholder="请输入手机号" />
        </el-form-item>
        <el-form-item label="薪资" prop="salary">
          <el-input-number v-model="empForm.salary" placeholder="请输入薪资" />
        </el-form-item>
        <el-form-item label="入职日期" prop="entryDate">
          <el-date-picker
            v-model="empForm.entryDate"
            type="date"
            value-format="YYYY-MM-DD"
            placeholder="请选择入职日期"
            :clearable="true"
            :editable="false"
          />
        </el-form-item>
        <el-form-item label="部门" prop="deptId">
          <el-select v-model="empForm.deptId" placeholder="请选择部门" clearable>
            <el-option
              v-for="dept in deptList"
              :key="dept.id"
              :label="dept.name"
              :value="dept.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="职位" prop="job">
          <el-select v-model="empForm.job" placeholder="请选择职位" clearable>
            <el-option
              v-for="job in jobs"
              :key="job.value"
              :label="job.name"
              :value="job.value"
            />
          </el-select>
        </el-form-item>
        <!-- 工作经历 -->
        <el-form-item label="工作经历">
          <div v-for="(item, index) in exprList" :key="index" class="expr-item">
            <el-input
              v-model="item.company"
              placeholder="请输入公司名称"
              style="margin-bottom: 10px"
              clearable
            />
            <el-input
              v-model="item.job"
              placeholder="请输入职位"
              style="margin-bottom: 10px"
              clearable
            />
            <el-date-picker
              v-model="item.begin"
              type="date"
              value-format="YYYY-MM-DD"
              placeholder="请选择开始日期"
              :clearable="true"
              :editable="false"
              style="margin-bottom: 10px"
            />
            <el-date-picker
              v-model="item.end"
              type="date"
              value-format="YYYY-MM-DD"
              placeholder="请选择结束日期"
              :clearable="true"
              :editable="false"
              style="margin-bottom: 10px"
            />
            <el-button type="danger" @click="removeExpr(index)" size="mini">删除</el-button>
          </div>
          <el-button type="primary" @click="addExpr" size="mini">添加工作经历</el-button>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSubmit" :loading="loading">提交</el-button>
          <el-button @click="dialogVisible = false">取消</el-button>
        </el-form-item>
      </el-form>
    </el-dialog>
  </div>
</template>

<style scoped>
.emp-container {
  padding: 24px;
  background: #fff;
  border-radius: 8px;
  min-height: 400px;
}

.search-form {
  margin-bottom: 18px;
}

.toolbar {
  margin-bottom: 18px;
}

.pagination {
  margin-top: 18px;
  display: flex;
  justify-content: flex-end;
}

.edit-btn {
  color: #3578d1 !important;
  font-weight: bold;
  /* 你可以根据需要添加更多样式 */
}
.edit-btn:hover {
  color: #247dd6 !important;
  text-decoration: underline;
}

/* 对话框样式优化 */
:deep(.el-dialog) {
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

:deep(.el-dialog__header) {
  background-color: #f0f8ff;
  margin: 0;
  padding: 20px;
  border-bottom: 1px solid #e6f3ff;
  border-radius: 8px 8px 0 0;
}

:deep(.el-dialog__title) {
  color: #1989fa;
  font-weight: 600;
}

:deep(.el-dialog__body) {
  padding: 30px 20px;
}

:deep(.el-form-item__label) {
  color: #606266;
}

:deep(.el-input__wrapper) {
  box-shadow: 0 0 0 1px #dcdfe6 inset;
}

:deep(.el-input__wrapper:hover) {
  box-shadow: 0 0 0 1px #1989fa inset;
}

:deep(.el-button--primary) {
  background-color: #1989fa;
}

:deep(.el-button--primary:hover) {
  background-color: #409eff;
}

/* 工作经历卡片样式 */
.expr-item {
  background-color: #f8fbff;
  padding: 20px;
  border-radius: 6px;
  border: 1px solid #e6f3ff;
  margin-bottom: 20px;
  position: relative;
}

/* 删除按钮样式 */
.expr-item .el-button--danger {
  position: absolute;
  right: 10px;
  top: 10px;
}

/* 添加工作经历按钮样式 */
:deep(.el-button--primary.is-plain) {
  color: #1989fa;
  border-color: #1989fa;
  background-color: #f0f8ff;
}

:deep(.el-button--primary.is-plain:hover) {
  color: #fff;
  background-color: #1989fa;
}

/* 日期选择器样式 */
:deep(.el-date-editor.el-input) {
  width: 100%;
}

/* 表单项间距 */
:deep(.el-form-item) {
  margin-bottom: 22px;
}

/* 上传组件样式优化 */
.avatar-uploader {
  :deep(.el-upload) {
    border: 2px dashed #e6f3ff;
    border-radius: 6px;
    background-color: #f8fbff;
    width: 3px;  
    height: 3px; 
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;
    overflow: hidden;
  }

  :deep(.el-upload:hover) {
    border-color: #1989fa;
    background-color: #f0f8ff;
  }
}

.avatar-uploader-icon {
  font-size: 18px; /* 改小图标 */
  color: #1989fa;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}

.avatar {
  width: 100%;
  height: 100%;
  display: block;
  object-fit: cover;
}

/* 底部按钮样式 */
:deep(.el-dialog__footer) {
  padding: 20px;
  border-top: 1px solid #e6f3ff;
  background-color: #f8fbff;
}
</style>