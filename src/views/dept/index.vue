<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getDeptList, addDept, updateDept, deleteDept } from '@/api/dept'

const deptList = ref([])
const dialogVisible = ref(false)
const isEdit = ref(false)
const form = ref({
  id: null,
  name: ''
})
const loading = ref(false)
const tableLoading = ref(false)
const formRef = ref(null)

// 获取部门列表
const loadDeptList = async () => {
  tableLoading.value = true
  try {
    deptList.value = await getDeptList()
  } catch (error) {
    console.error('获取部门列表失败:', error)
  } finally {
    tableLoading.value = false
  }
}

// 打开新增部门弹窗
const openAdd = () => {
  isEdit.value = false
  form.value = { id: null, name: '' }
  dialogVisible.value = true
  // 重置表单校验的状态
  formRef.value?.resetFields()
}

// 打开编辑部门弹窗
const openEdit = (row) => {
  isEdit.value = true
  form.value = { ...row }
  dialogVisible.value = true
  // 重置表单校验的状态
  formRef.value?.resetFields()
}

// 添加表单校验规则
const rules = {
  name: [
    { required: true, message: '请输入部门名称', trigger: 'blur' },
    { min: 2, max: 10, message: '部门名称长度必须在2-10个字符之间', trigger: 'blur' }
  ]
}

// 保存部门（新增或编辑）
const handleSave = async () => {
  if (!formRef.value) return
  
  try {
    await formRef.value.validate()
    loading.value = true
    
    if (isEdit.value) {
      await updateDept(form.value)
      ElMessage.success('修改成功')
    } else {
      await addDept(form.value)
      ElMessage.success('新增成功')
    }
    dialogVisible.value = false
    loadDeptList()
  } catch (error) {
    if (error.message) {
      ElMessage.error(error.message)
    } else {
      console.error('保存失败:', error)
    }
  } finally {
    loading.value = false
  }
}

// 编辑部门
const handleEdit = async (row) => {
  isEdit.value = true
  form.value = { ...row }
  dialogVisible.value = true
  // 重置表单校验的状态
  formRef.value?.resetFields()
}

// 删除部门
const handleDelete = (row) => {
  ElMessageBox.confirm(`确定要删除【${row.name}】吗？`, '提示', {
    type: 'warning'
  }).then(async () => {
    try {
      await deleteDept(row.id)
      ElMessage.success('删除成功')
      loadDeptList()
    } catch (error) {
      console.error('删除失败:', error)
    }
  })
}

// 页面加载时获取列表
onMounted(() => {
  loadDeptList()
})
</script>


<template>
  <div class="dept-container">
    <el-button type="primary" @click="openAdd" style="margin-bottom: 18px;">新增部门</el-button>
    <el-table 
      v-loading="tableLoading"
      :data="deptList" 
      border 
      style="width: 100%;"
    >
      <el-table-column label="序号" type="index" width="80" align="center" />
      <el-table-column prop="name" label="部门名称" align="center" />
      <el-table-column
        label="最后操作时间"
        align="center"
        :formatter="row => row.updateTime ? row.updateTime.replace('T', ' ').substring(0, 19) : ''"
      />
      <el-table-column label="操作" align="center" width="200">
        <template #default="{ row }">
          <el-button type="primary" size="small" @click="handleEdit(row)" style="font-size: 16px;">修改</el-button>
          <el-button type="danger" size="small" @click="handleDelete(row)" style="font-size: 16px;">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog 
      :title="isEdit ? '编辑部门' : '新增部门'" 
      v-model="dialogVisible" 
      width="350px"
      :close-on-click-modal="false"
    >
      <el-form ref="formRef" :model="form" :rules="rules" @submit.prevent>
        <el-form-item label="部门名称" prop="name" required>
          <el-input v-model="form.name" placeholder="请输入部门名称" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false" :disabled="loading">取消</el-button>
        <el-button type="primary" @click="handleSave" :loading="loading">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.dept-container {
  padding: 24px;
  background: #fff;
  border-radius: 8px;
  min-height: 400px;
}
:deep(.el-table) {
  font-size: 20px;
}
:deep(.el-table .el-button) {
  font-size: 14px;
}
</style>

