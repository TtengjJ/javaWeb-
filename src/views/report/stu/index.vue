<script setup>  
import { ref, onMounted } from 'vue'
import * as echarts from 'echarts'
import { getStudentDegreeData, getStudentCountData } from '@/api/stu'

const clazzChartRef = ref(null)
const degreeChartRef = ref(null)

const renderClazzChart = (clazzList, dataList) => {
  const chart = echarts.init(clazzChartRef.value)
  chart.setOption({
    tooltip: { trigger: 'axis' },
    xAxis: {
      type: 'category',
      data: clazzList,
      axisLabel: { interval: 0, rotate: 30 }
    },
    yAxis: { type: 'value' },
    series: [
      {
        name: '人数',
        type: 'bar',
        data: dataList,
        itemStyle: { color: '#67C23A' }
      }
    ]
  })
}

const renderDegreeChart = (data) => {
  const chart = echarts.init(degreeChartRef.value)
  chart.setOption({
    tooltip: { trigger: 'item' },
    legend: { top: 'bottom' },
    series: [
      {
        name: '学历分布',
        type: 'pie',
        radius: '60%',
        data,
        label: { formatter: '{b}: {c} ({d}%)' }
      }
    ]
  })
}

onMounted(async () => {
  // 班级人数柱状图
  const clazzRes = await getStudentCountData()
  renderClazzChart(clazzRes.clazzList || [], clazzRes.dataList || [])

  // 学历分布饼状图
  const degreeData = await getStudentDegreeData()
  renderDegreeChart(degreeData || [])
})
</script>

<template>
  <div class="report-row">
    <div class="chart-block">
      <div class="chart-title">班级人数统计</div>
      <div ref="clazzChartRef" class="chart-box"></div>
    </div>
    <div class="chart-block">
      <div class="chart-title">学员学历分布</div>
      <div ref="degreeChartRef" class="chart-box"></div>
    </div>
  </div>
</template>

<style scoped>
.report-row {
  display: flex;
  gap: 24px;
  justify-content: center;
  align-items: flex-start;
  padding: 40px 0;
}
.chart-block {
  flex: 1 1 0;
  min-width: 550px;
  max-width: 700px;
  background: #fff;
  border-radius: 8px;
  margin: 0;
  box-shadow: 0 2px 8px #f0f1f2;
  padding: 24px 24px 12px 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.chart-title {
  font-weight: bold;
  margin-bottom: 16px;
  font-size: 18px;
}
.chart-box {
  width: 100%;
  height: 600px;
}
</style>