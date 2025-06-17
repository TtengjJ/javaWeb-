<template>
  <div class="report-row">
    <div class="chart-block">
      <div class="chart-title">员工职位人数统计</div>
      <div ref="jobChartRef" class="chart-box"></div>
    </div>
    <div class="chart-block">
      <div class="chart-title">员工性别分布</div>
      <div ref="genderChartRef" class="chart-box"></div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import * as echarts from 'echarts'
import { getEmpGenderData, getEmpJobData } from '@/api/emp'

const genderChartRef = ref(null)
const jobChartRef = ref(null)

const renderGenderChart = (data) => {
  const chart = echarts.init(genderChartRef.value)
  chart.setOption({
    tooltip: { trigger: 'item' },
    legend: { top: 'bottom' },
    series: [
      {
        name: '性别分布',
        type: 'pie',
        radius: '60%',
        data,
        label: { formatter: '{b}: {c} ({d}%)' }
      }
    ]
  })
}

const renderJobChart = (jobList, dataList) => {
  const chart = echarts.init(jobChartRef.value)
  chart.setOption({
    tooltip: { trigger: 'axis' },
    xAxis: {
      type: 'category',
      data: jobList,
      axisLabel: { interval: 0, rotate: 30 }
    },
    yAxis: { type: 'value' },
    series: [
      {
        name: '人数',
        type: 'bar',
        data: dataList,
        itemStyle: { color: '#409EFF' }
      }
    ]
  })
}

onMounted(async () => {
  // 性别饼图
  const genderData = await getEmpGenderData()
  renderGenderChart(genderData || [])

  // 职位柱状图
  const jobRes = await getEmpJobData()
  renderJobChart(jobRes.jobList || [], jobRes.dataList || [])
})
</script>

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