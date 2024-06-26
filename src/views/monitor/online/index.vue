<template>
  <div>
    <el-form ref="queryRef" :model="queryParams" :inline="true">
      <el-form-item label="登录地址" prop="ipaddr">
        <el-input v-model="queryParams.ipaddr" placeholder="请输入登录地址" clearable style="width: 200px" @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="用户账号" prop="userName">
        <el-input v-model="queryParams.userName" placeholder="请输入用户账号" clearable style="width: 200px" @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-table border v-loading="loading" :data="list.slice((queryParams.pageNum - 1) * queryParams.pageSize, queryParams.pageNum * queryParams.pageSize)">
      <el-table-column label="序号" width="55" type="index" align="center">
        <template #default="scope">
          <span>{{ (queryParams.pageNum - 1) * queryParams.pageSize + scope.$index + 1 }}</span>
        </template>
      </el-table-column>
      <el-table-column label="会话编号" align="center" prop="tokenId" show-overflow-tooltip />
      <el-table-column label="登录名称" align="center" prop="userName" show-overflow-tooltip />
      <el-table-column label="所属部门" align="center" prop="deptName" show-overflow-tooltip />
      <el-table-column label="主机" align="center" prop="ipaddr" show-overflow-tooltip />
      <el-table-column label="登录地点" align="center" prop="loginLocation" show-overflow-tooltip />
      <el-table-column label="操作系统" align="center" prop="os" show-overflow-tooltip />
      <el-table-column label="浏览器" align="center" prop="browser" show-overflow-tooltip />
      <el-table-column label="登录时间" align="center" prop="loginTime" width="180" />
      <el-table-column label="操作" align="center" :min-width="140">
        <template #default="{ row }">
          <el-button link v-hasPermi="['monitor:online:forceLogout']" type="primary" icon="Delete" @click="handleForceLogout(row)">强退</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total > 0" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" :total="total" />
  </div>
</template>

<script setup name="Online" lang="ts">
import { forceLogout, list as initData } from '@/api/monitor/online'

const { proxy } = getCurrentInstance() as ComponentInternalInstance

const list = ref<any[]>([])
const loading = ref(true)
const total = ref(0)

const queryParams = ref<any>({ pageNum: 1, pageSize: 10 })

/** 查询登录日志列表 */
async function getList() {
  loading.value = true
  const res: any = await initData(queryParams.value)
  list.value = res.rows
  total.value = res.total
  loading.value = false
}
/** 搜索按钮操作 */
function handleQuery() {
  queryParams.value.pageNum = 1
  getList()
}
/** 重置按钮操作 */
function resetQuery() {
  proxy.resetForm('queryRef')
  handleQuery()
}
/** 强退按钮操作 */
async function handleForceLogout(row: any) {
  await proxy.$modal.confirm('是否确认强退名称为"' + row.userName + '"的用户?')
  await forceLogout(row.tokenId)
  getList()
  proxy.$modal.msgSuccess('删除成功')
}

getList()
</script>
