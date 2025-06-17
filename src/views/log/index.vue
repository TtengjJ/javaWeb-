<script setup>  
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { getLogList } from '@/api/log'

const logList = ref([])
const total = ref(0)
const loading = ref(false)
const pageQuery = ref({
  page: 1,
  pageSize: 10
})

const loadLogs = async () => {
  loading.value = true
  try {
    const res = await getLogList({
      page: pageQuery.value.page,
      pageSize: pageQuery.value.pageSize
    })
    logList.value = res.rows
    total.value = res.total
  } catch (e) {
    ElMessage.error('日志加载失败')
  } finally {
    loading.value = false
  }
}

const handlePageChange = () => {
  loadLogs()
}

onMounted(() => {
  loadLogs()
})
</script>

<template>
  <div class="log-container">
    <el-card>
      <div class="log-title">日志信息</div>
      <el-table :data="logList" v-loading="loading" border>
        <el-table-column prop="id" label="ID" width="80" align="center" />
        <el-table-column prop="operateEmpName" label="操作人" width="100" align="center" />
        <el-table-column prop="operateTime" label="操作时间" width="180" align="center" />
        <el-table-column prop="className" label="类名" min-width="180" show-overflow-tooltip />
        <el-table-column prop="methodName" label="方法名" width="120" align="center" />
        <el-table-column prop="methodParams" label="方法参数" min-width="200" show-overflow-tooltip />
        <el-table-column prop="returnValue" label="返回值" min-width="200" show-overflow-tooltip />
        <el-table-column prop="costTime" label="耗时(ms)" width="100" align="center" />
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
    </el-card>
  </div>
</template>

<style scoped>
.log-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 32px 0;
}
.log-title {
  font-size: 40px;
  font-weight: bold;
  margin-bottom: 18px;
}
.pagination {
  margin-top: 38px;
  display: flex;
  justify-content: flex-end;
}
</style>