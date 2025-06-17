<script setup>
import { ref, onMounted, watch, nextTick } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getStuList, deleteStu, getStuDetail, updateStu, violationStu, addStu } from '@/api/stu'
import { getClazzList } from '@/api/clazzs' // 新增：获取班级列表

// 查询表单
const searchForm = ref({
  name: '',
  degree: '',
  clazzId: ''
})

// 班级下拉数据
const clazzOptions = ref([])
const loadClazzOptions = async () => {
  try {
    const res = await getClazzList({ page: 1, pageSize: 1000 })
    clazzOptions.value = res.rows || []
  } catch (e) {
    clazzOptions.value = []
  }
}

// 分页
const pageQuery = ref({
  page: 1,
  pageSize: 10
})

const total = ref(0)
const loading = ref(false)
const stuList = ref([])

// 弹窗相关
const dialogVisible = ref(false)
const dialogType = ref('edit') // 'edit' | 'violation' | 'add'
const stuForm = ref({
  id: null,
  name: '',
  no: '',
  gender: 1,
  phone: '',
  degree: 1,
  idCard: '',
  isCollege: 0,
  address: '',
  graduationDate: '',
  violationCount: 0,
  violationScore: 0,
  clazzId: null
})
const violationScore = ref(0)
const stuFormRef = ref(null)

// 学历选项
const degreeOptions = [
  { label: '初中', value: 1 },
  { label: '高中', value: 2 },
  { label: '大专', value: 3 },
  { label: '本科', value: 4 },
  { label: '硕士', value: 5 },
  { label: '博士', value: 6 }
]

// 定义班级表单校验规则
const rules = {
  name: [
    { required: true, message: '请输入班级名称', trigger: 'blur' },
    { min: 2, max: 20, message: '班级名称长度2-20位', trigger: 'blur' }
  ],
  room: [
    { required: true, message: '请输入教室', trigger: 'blur' }
  ],
  begin: [
    { required: true, message: '请选择开班时间', trigger: 'change' }
  ],
  end: [
    { required: true, message: '请选择结课时间', trigger: 'change' }
  ],
  masterId: [
    { required: true, message: '请选择班主任', trigger: 'change' }
  ],
  subject: [
    { required: true, message: '请选择学科', trigger: 'change' }
  ],
  phone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '手机号格式不正确', trigger: 'blur' }
  ]
}

// 监听搜索条件变化自动查询
watch(
  () => ({ ...searchForm.value }),
  () => {
    pageQuery.value.page = 1
    loadStuList()
  },
  { deep: true }
)

// 查询学员列表
const loadStuList = async () => {
  loading.value = true
  try {
    const params = {
      ...searchForm.value,
      page: pageQuery.value.page,
      pageSize: pageQuery.value.pageSize
    }
    const { total: totalCount, rows } = await getStuList(params)
    stuList.value = rows
    total.value = totalCount
  } catch (e) {
    ElMessage.error('获取学员列表失败')
  } finally {
    loading.value = false
  }
}

const resetSearch = () => {
  searchForm.value = { name: '', degree: '', clazzId: '' }
  pageQuery.value.page = 1
  loadStuList()
}

const handlePageChange = () => {
  loadStuList()
}

// 删除
const handleDelete = (row) => {
  ElMessageBox.confirm(`确定要删除学员【${row.name}】吗？`, '提示', {
    type: 'warning'
  }).then(async () => {
    await deleteStu(row.id)
    ElMessage.success('删除成功')
    loadStuList()
  })
}

// 修改
const handleEdit = async (row) => {
  dialogType.value = 'edit'
  const detail = await getStuDetail(row.id)
  Object.assign(stuForm.value, detail)
  dialogVisible.value = true
  nextTick(() => {
    stuFormRef.value 
  })
}

// 违纪
const handleViolation = async (row) => {
  dialogType.value = 'violation'
  const detail = await getStuDetail(row.id)
  Object.assign(stuForm.value, detail)
  violationScore.value = 0
  dialogVisible.value = true
}

// 新增
const handleAdd = () => {
  dialogType.value = 'add'
  stuForm.value = {
    id: null,
    name: '',
    no: '',
    gender: 1,
    phone: '',
    degree: 1,
    idCard: '',
    isCollege: 0,
    address: '',
    graduationDate: '',
    violationCount: 0,
    violationScore: 0,
    clazzId: null
  }
  dialogVisible.value = true
  nextTick(() => {
    stuFormRef.value && stuFormRef.value.resetFields()
  })
}

// 提交修改/新增
const handleSubmit = async () => {
  stuFormRef.value.validate(async (valid) => {
    if (!valid) return
    if (dialogType.value === 'add') {
      await addStu(stuForm.value)
      ElMessage.success('添加成功')
    } else {
      await updateStu(stuForm.value)
      ElMessage.success('修改成功')
    }
    dialogVisible.value = false
    loadStuList()
  })
}

// 提交违纪
const handleViolationSubmit = async () => {
  if (!violationScore.value || violationScore.value <= 0) {
    ElMessage.warning('请输入要扣除的分数')
    return
  }
  await violationStu(stuForm.value.id, violationScore.value)
  ElMessage.success('违纪处理成功')
  dialogVisible.value = false
  loadStuList()
}

onMounted(() => {
  loadClazzOptions()
  loadStuList()
})
</script>

<template>
  <div class="stu-container">
    <el-button type="primary" @click="handleAdd" style="margin-bottom: 20px">添加学员</el-button>
    <el-form :inline="true" :model="searchForm" class="search-form">
      <el-form-item label="姓名">
        <el-input v-model="searchForm.name" placeholder="请输入姓名" clearable />
      </el-form-item>
      <el-form-item label="学历">
        <el-select v-model="searchForm.degree" placeholder="请选择学历" clearable style="width: 120px">
          <el-option v-for="item in degreeOptions" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
      </el-form-item>
      <el-form-item label="班级">
        <el-select v-model="searchForm.clazzId" placeholder="请选择班级" clearable style="width: 180px">
          <el-option v-for="item in clazzOptions" :key="item.id" :label="item.name" :value="item.id" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="loadStuList" :loading="loading">查询</el-button>
        <el-button @click="resetSearch">重置</el-button>
      </el-form-item>
    </el-form>

    <el-table :data="stuList" v-loading="loading" border>
      <el-table-column label="序号" type="index" width="60" align="center" />
      <el-table-column prop="name" label="姓名" align="center" />
      <el-table-column prop="no" label="学号" align="center" />
      <el-table-column prop="gender" label="性别" align="center">
        <template #default="{ row }">
          {{ row.gender === 1 ? '男' : row.gender === 2 ? '女' : '' }}
        </template>
      </el-table-column>
      <el-table-column prop="phone" label="手机号" align="center" />
      <el-table-column prop="degree" label="学历" align="center">
        <template #default="{ row }">
          {{ degreeOptions.find(d => d.value === row.degree)?.label || '' }}
        </template>
      </el-table-column>
      <el-table-column prop="clazzName" label="班级" align="center" />
      <el-table-column prop="graduationDate" label="毕业时间" align="center" />
      <el-table-column prop="violationCount" label="违纪次数" align="center" />
      <el-table-column prop="violationScore" label="违纪扣分" align="center" />
      <el-table-column prop="updateTime" label="更新时间" align="center" />
      <el-table-column label="操作" align="center" width="220">
        <template #default="{ row }">
          <el-button type="warning" size="small" @click="handleViolation(row)">违纪</el-button>
          <el-button type="primary" size="small" @click="handleEdit(row)">修改</el-button>
          <el-button type="danger" size="small" @click="handleDelete(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

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

    <!-- 新增/修改/违纪对话框 -->
    <el-dialog v-model="dialogVisible" :title="dialogType === 'edit' ? '修改学员' : dialogType === 'add' ? '添加学员' : '违纪处理'" width="500px">
      <el-form
        v-if="dialogType === 'edit' || dialogType === 'add'"
        ref="stuFormRef"
        :model="stuForm"
        :rules="rules"
        label-width="90px"
      >
        <el-form-item label="姓名" prop="name">
          <el-input v-model="stuForm.name" />
        </el-form-item>
        <el-form-item label="学号" prop="no">
          <el-input v-model="stuForm.no" />
        </el-form-item>
        <el-form-item label="性别" prop="gender">
          <el-select v-model="stuForm.gender" style="width: 120px">
            <el-option label="男" :value="1" />
            <el-option label="女" :value="2" />
          </el-select>
        </el-form-item>
        <el-form-item label="手机号" prop="phone">
          <el-input v-model="stuForm.phone" />
        </el-form-item>
        <el-form-item label="学历" prop="degree">
          <el-select v-model="stuForm.degree" style="width: 120px">
            <el-option v-for="item in degreeOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="班级" prop="clazzId">
          <el-select v-model="stuForm.clazzId" placeholder="请选择班级" style="width: 180px">
            <el-option v-for="item in clazzOptions" :key="item.id" :label="item.name" :value="item.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="身份证号" prop="idCard">
          <el-input v-model="stuForm.idCard" />
        </el-form-item>
        <el-form-item label="是否院校生">
          <el-select v-model="stuForm.isCollege" style="width: 120px">
            <el-option label="是" :value="1" />
            <el-option label="否" :value="0" />
          </el-select>
        </el-form-item>
        <el-form-item label="联系地址">
          <el-input v-model="stuForm.address" />
        </el-form-item>
        <el-form-item label="毕业时间">
          <el-date-picker v-model="stuForm.graduationDate" type="date" value-format="YYYY-MM-DD" style="width: 100%;" />
        </el-form-item>
        <el-form-item label="违纪次数">
          <el-input v-model="stuForm.violationCount" type="number" />
        </el-form-item>
        <el-form-item label="违纪扣分">
          <el-input v-model="stuForm.violationScore" type="number" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSubmit">保存</el-button>
          <el-button @click="dialogVisible = false">取消</el-button>
        </el-form-item>
      </el-form>
      <el-form v-else label-width="90px">
        <el-form-item label="姓名">
          <el-input v-model="stuForm.name" disabled />
        </el-form-item>
        <el-form-item label="学号">
          <el-input v-model="stuForm.no" disabled />
        </el-form-item>
        <el-form-item label="当前违纪扣分">
          <el-input v-model="stuForm.violationScore" disabled />
        </el-form-item>
        <el-form-item label="本次扣分">
          <el-input v-model="violationScore" type="number" min="1" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleViolationSubmit">确定</el-button>
          <el-button @click="dialogVisible = false">取消</el-button>
        </el-form-item>
      </el-form>
    </el-dialog>
  </div>
</template>

<style scoped>
.stu-container {
  padding: 24px;
  background: #fff;
  border-radius: 8px;
  min-height: 400px;
}
.search-form {
  margin-bottom: 18px;
}
.pagination {
  margin-top: 18px;
  display: flex;
  justify-content: flex-end;
}
</style>