<script setup>
import { ref, watch, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getClazzList, addClazz, updateClazz, deleteClazz, getClazzById } from '@/api/clazzs'

// 学科映射表
const subjectMap = {
  1: 'Java',
  2: '前端',
  3: '大数据',
  4: 'Python',
  5: 'Go',
  6: '嵌入式'
}

// 查询参数
const query = ref({
  name: '',
  beginDate: '',
  endDate: ''
})
const dateRange = ref([]) // 新增

watch(dateRange, (val) => {
  if (val && val.length === 2) {
    query.value.beginDate = val[0]
    query.value.endDate = val[1]
  } else {
    query.value.beginDate = ''
    query.value.endDate = ''
  }
  pageQuery.value.page = 1
  fetchData()
}, { deep: true })

const pageQuery = ref({
  page: 1,
  pageSize: 10
})

// 数据
const tableData = ref([])
const total = ref(0)
const loading = ref(false)

// 查询方法
const fetchData = async () => {
  loading.value = true
  try {
    // 拆分结课时间范围，参数名与接口文一致
    const params = {
      name: query.value.name,
      beginDate: query.value.beginDate || undefined,
      endDate: query.value.endDate || undefined,
      ...pageQuery.value
    }

    // 删除空字符串参数，避免传递给后端
    if (!params.beginDate) delete params.beginDate
    if (!params.endDate) delete params.endDate

    const data = await getClazzList(params)
    if (data && data.rows) {
      tableData.value = data.rows.map(item => ({
        ...item,
        begin: item.beginDate,
        end: item.endDate
      }))
      total.value = data.total
    } else {
      ElMessage.error('获取数据失败')
    }
  } catch (e) {
    ElMessage.error('请求失败')
  }
  loading.value = false
}

// 查询
const handleSearch = () => {
  pageQuery.value.page = 1
  fetchData()
}

// 重置
const handleReset = () => {
  query.value = { name: '', beginDate: '', endDate: '' }
  dateRange.value = []
  pageQuery.value.page = 1
  fetchData()
}

// 监听查询条件变化自动刷新
watch(query, () => {
  pageQuery.value.page = 1
  fetchData()
}, { deep: true })

// 只监听 name 字段变化自动查询
watch(
  () => query.value.name,
  () => {
    pageQuery.value.page = 1
    fetchData()
  }
)

// 分页
const handlePageChange = (page) => {
  pageQuery.value.page = page
  fetchData()
}
const handleSizeChange = (size) => {
  pageQuery.value.pageSize = size
  pageQuery.value.page = 1
  fetchData()
}

// 弹窗控制与表单
const dialogVisible = ref(false)
const isEdit = ref(false)
const form = ref({
  id: null,
  name: '',
  room: '',
  begin: '',
  end: '',
  masterId: null,
  subject: 1
})
const formRef = ref()

// 打开新增弹窗
const handleAdd = () => {
  isEdit.value = false
  form.value = { id: null, name: '', room: '', begin: '', end: '', masterId: null, subject: 1 }
  dialogVisible.value = true
}

// 打开编辑弹窗（获取最新数据）
const handleEdit = async (row) => {
  isEdit.value = true
  try {
    const res = await getClazzById(row.id)
    form.value = {
      id: res.id,
      name: res.name,
      room: res.room,
      begin: res.beginDate,
      end: res.endDate,
      masterId: res.masterId,
      subject: res.subject
    }
    dialogVisible.value = true
  } catch (e) {
    ElMessage.error('获取班级信息失败')
  }
}

// 提交表单
const handleSubmit = async () => {
  try {
    const submitData = {
      ...form.value,
      beginDate: form.value.begin,
      endDate: form.value.end
    }
    if (isEdit.value) {
      await updateClazz(submitData)
      ElMessage.success('修改成功')
    } else {
      await addClazz(submitData)
      ElMessage.success('新增成功')
    }
    dialogVisible.value = false
    fetchData()
  } catch (e) {}
}

// 删除
const handleDelete = (row) => {
  ElMessageBox.confirm(`确定要删除【${row.name}】吗？`, '提示', {
    type: 'warning'
  }).then(async () => {
    try {
      await deleteClazz(row.id)
      ElMessage.success('删除成功')
      fetchData()
    } catch (e) {}
  })
}

const indexMethod = (index) => {
  return (pageQuery.value.page - 1) * pageQuery.value.pageSize + index + 1
}

onMounted(fetchData)
</script>

<template>
  <div class="clazz-container">
    <!-- 操作按钮 -->
    <el-button type="primary" @click="handleAdd" style="margin-bottom: 20px">新增班级</el-button>

    <el-form :inline="true" size="medium" @submit.prevent class="clazz-form">
      <el-form-item label="班级名称">
        <el-input v-model="query.name" placeholder="请输入班级名称" clearable style="width: 240px" />
      </el-form-item>
      <el-form-item label="结课时间">
        <el-date-picker
          v-model="dateRange"
          type="daterange"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          style="width: 340px"
          value-format="YYYY-MM-DD"
          clearable
        />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="handleSearch">查询</el-button>
        <el-button @click="handleReset">重置</el-button>
      </el-form-item>
    </el-form>

    <el-table :data="tableData" v-loading="loading" style="margin-top: 24px; font-size: 16px;">
      <el-table-column type="index" label="序号" width="80" :index="indexMethod" />
      <el-table-column prop="id" label="ID" width="80" />
      <el-table-column prop="name" label="班级名称" width="180" />
      <el-table-column prop="room" label="教室" width="120" />
      <el-table-column prop="begin" label="开班时间" width="140" />
      <el-table-column prop="end" label="结课时间" width="140" />
      <el-table-column label="学科" width="120">
        <template #default="scope">
          {{ subjectMap[scope.row.subject] || scope.row.subject }}
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="220">
        <template #default="{ row }">
          <el-button type="primary" size="small" @click="handleEdit(row)">修改</el-button>
          <el-button type="danger" size="small" @click="handleDelete(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-pagination
      v-model:current-page="pageQuery.page"
      v-model:page-size="pageQuery.pageSize"
      :total="total"
      :page-sizes="[10, 20, 50, 100]"
      layout="total, sizes, prev, pager, next, jumper"
      @size-change="handleSizeChange"
      @current-change="handlePageChange"
      class="clazz-pagination"
    />

    <!-- 新增/编辑弹窗 -->
    <el-dialog v-model="dialogVisible" :title="isEdit ? '编辑班级' : '新增班级'" width="520px">
      <el-form :model="form" ref="formRef" label-width="100px" size="medium">
        <el-form-item label="班级名称" prop="name">
          <el-input v-model="form.name" />
        </el-form-item>
        <el-form-item label="教室" prop="room">
          <el-input v-model="form.room" />
        </el-form-item>
        <el-form-item label="开班时间" prop="begin">
          <el-date-picker v-model="form.begin" type="date" style="width: 100%" value-format="YYYY-MM-DD" />
        </el-form-item>
        <el-form-item label="结课时间" prop="end">
          <el-date-picker v-model="form.end" type="date" style="width: 100%" value-format="YYYY-MM-DD" />
        </el-form-item>
        <el-form-item label="班主任ID" prop="masterId">
          <el-input v-model="form.masterId" />
        </el-form-item>
        <el-form-item label="学科" prop="subject">
          <el-select v-model="form.subject" placeholder="请选择学科">
            <el-option label="Java" :value="1" />
            <el-option label="前端" :value="2" />
            <el-option label="大数据" :value="3" />
            <el-option label="Python" :value="4" />
            <el-option label="Go" :value="5" />
            <el-option label="嵌入式" :value="6" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.clazz-container {
  padding: 40px 48px 32px 48px;
  background: #fff;
  border-radius: 12px;
  min-height: 600px;
}

.clazz-form {
  margin-bottom: 28px;
  font-size: 16px;
}

.clazz-pagination {
  margin-top: 32px;
  font-size: 16px;
  display: flex;
  justify-content: flex-end;
}
</style>