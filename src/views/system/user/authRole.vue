<template>
  <div>
    <h4 class="form-header h4">基本信息</h4>
    <el-form :model="form" label-width="80px">
      <el-row>
        <el-col :span="8" :offset="2">
          <el-form-item label="用户昵称" prop="nickName">
            <el-input v-model="form.nickName" disabled />
          </el-form-item>
        </el-col>
        <el-col :span="8" :offset="2">
          <el-form-item label="登录账号" prop="userName">
            <el-input v-model="form.userName" disabled />
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>

    <h4 class="form-header h4">角色信息</h4>
    <el-table
      border
      ref="roleRef"
      v-loading="loading"
      :row-key="getRowKey"
      :data="roles.slice((pageNum - 1) * pageSize, pageNum * pageSize)"
      @rowClick="clickRow"
      @selectionChange="handleSelectionChange"
    >
      <el-table-column align="center" label="序号" width="55" type="index">
        <template #default="scope">
          <span>{{ (pageNum - 1) * pageSize + scope.$index + 1 }}</span>
        </template>
      </el-table-column>
      <el-table-column type="selection" :reserve-selection="true" width="55"></el-table-column>
      <el-table-column align="center" show-overflow-tooltip label="角色编号" prop="roleId" />
      <el-table-column align="center" show-overflow-tooltip label="角色名称" prop="roleName" />
      <el-table-column align="center" show-overflow-tooltip label="权限字符" prop="roleKey" />
      <el-table-column align="center" show-overflow-tooltip label="创建时间" prop="createTime" width="180" />
    </el-table>

    <pagination v-show="total > 0" v-model:page="pageNum" v-model:limit="pageSize" :total="total" />

    <el-form label-width="100px">
      <div style="text-align: center; margin-left: -120px; margin-top: 30px">
        <el-button type="primary" @click="submitForm()">提交</el-button>
        <el-button @click="close()">返回</el-button>
      </div>
    </el-form>
  </div>
</template>

<script setup name="AuthRole" lang="ts">
import { getAuthRole, updateAuthRole } from '@/api/system/user'

const route = useRoute()
const { proxy } = getCurrentInstance() as ComponentInternalInstance
const roleRef = ref()

const loading = ref(true)
const total = ref(0)
const pageNum = ref(1)
const pageSize = ref(10)
const roleIds = ref<any[]>([])
const roles = ref<any[]>([])
const form = ref<any>({})

/** 单击选中行数据 */
function clickRow(row: any) {
  roleRef.value.toggleRowSelection(row)
}
/** 多选框选中数据 */
function handleSelectionChange(selection: any[]) {
  roleIds.value = selection.map(item => item.roleId)
}
/** 保存选中的数据编号 */
function getRowKey(row: any) {
  return row.roleId
}
/** 关闭按钮 */
function close() {
  const obj = { path: '/system/user' }
  proxy.$tab.closeOpenPage(obj)
}
/** 提交按钮 */
async function submitForm() {
  const userId = form.value.userId
  const rIds = roleIds.value.join(',')
  await updateAuthRole({ userId: userId, roleIds: rIds })
  proxy.$modal.msgSuccess('授权成功')
  close()
}

;(async () => {
  const userId = route.params && route.params.userId
  if (userId) {
    loading.value = true
    const response: any = await getAuthRole(userId)
    form.value = response.user
    roles.value = response.roles
    total.value = roles.value.length
    nextTick(() => {
      roles.value.forEach(row => {
        if (row.flag) {
          roleRef.value.toggleRowSelection(row)
        }
      })
    })
    loading.value = false
  }
})()
</script>
