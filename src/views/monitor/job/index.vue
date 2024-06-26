<template>
  <div>
    <el-form v-show="showSearch" ref="queryRef" :model="queryParams" :inline="true">
      <el-form-item label="任务名称" prop="jobName">
        <el-input v-model="queryParams.jobName" placeholder="请输入任务名称" clearable style="width: 200px" @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="任务组名" prop="jobGroup">
        <el-select v-model="queryParams.jobGroup" placeholder="请选择任务组名" clearable style="width: 200px">
          <el-option v-for="dict in sys_job_group" :key="dict.value" :label="dict.label" :value="dict.value" />
        </el-select>
      </el-form-item>
      <el-form-item label="任务状态" prop="status">
        <el-select v-model="queryParams.status" placeholder="请选择任务状态" clearable style="width: 200px">
          <el-option v-for="dict in sys_job_status" :key="dict.value" :label="dict.label" :value="dict.value" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <div class="mb-2 flex justify-between">
      <el-button v-hasPermi="['monitor:job:add']" type="primary" plain icon="Plus" @click="handleAdd">新增</el-button>
      <el-button v-hasPermi="['monitor:job:edit']" type="success" plain icon="Edit" :disabled="single" @click="handleUpdate">修改</el-button>
      <el-button v-hasPermi="['monitor:job:remove']" type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete">删除</el-button>
      <el-button v-hasPermi="['monitor:job:export']" type="warning" plain icon="Download" @click="handleExport">导出</el-button>
      <el-button v-hasPermi="['monitor:job:query']" type="info" plain icon="Operation" @click="handleJobLog">日志</el-button>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </div>

    <el-table border v-loading="loading" :data="list" @selectionChange="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="任务名称" align="center" prop="jobName" show-overflow-tooltip />
      <el-table-column label="任务组名" align="center" prop="jobGroup">
        <template #default="{ row }">
          <dict-tag :options="sys_job_group" :value="row.jobGroup" />
        </template>
      </el-table-column>
      <el-table-column label="调用目标字符串" align="center" prop="invokeTarget" show-overflow-tooltip />
      <el-table-column label="cron执行表达式" align="center" prop="cronExpression" show-overflow-tooltip />
      <el-table-column label="状态" align="center">
        <template #default="{ row }">
          <el-switch v-model="row.status" active-value="0" inactive-value="1" @change="handleStatusChange(row)"></el-switch>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="140">
        <template #default="{ row }">
          <el-tooltip content="修改" placement="top">
            <el-button link v-hasPermi="['monitor:job:edit']" type="primary" icon="Edit" @click="handleUpdate(row)"></el-button>
          </el-tooltip>
          <el-tooltip content="删除" placement="top">
            <el-button link v-hasPermi="['monitor:job:remove']" type="primary" icon="Delete" @click="handleDelete(row)"></el-button>
          </el-tooltip>
          <el-tooltip content="执行一次" placement="top">
            <el-button link v-hasPermi="['monitor:job:changeStatus']" type="primary" icon="CaretRight" @click="handleRun(row)"></el-button>
          </el-tooltip>
          <el-tooltip content="任务详细" placement="top">
            <el-button link v-hasPermi="['monitor:job:query']" type="primary" icon="View" @click="handleView(row)"></el-button>
          </el-tooltip>
          <el-tooltip content="调度日志" placement="top">
            <el-button link v-hasPermi="['monitor:job:query']" type="primary" icon="Operation" @click="handleJobLog(row)"></el-button>
          </el-tooltip>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total > 0" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" :total="total" @pagination="getList" />

    <!-- 添加或修改定时任务对话框 -->
    <el-dialog v-model="open" :title="title" width="600px" append-to-body draggable>
      <el-form ref="jobRef" :model="form" :rules="rules" label-width="120px">
        <el-row>
          <el-col :span="12">
            <el-form-item label="任务名称" prop="jobName">
              <el-input v-model="form.jobName" placeholder="请输入任务名称" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="任务分组" prop="jobGroup">
              <el-select v-model="form.jobGroup" placeholder="请选择">
                <el-option v-for="dict in sys_job_group" :key="dict.value" :label="dict.label" :value="dict.value"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item prop="invokeTarget">
              <template #label>
                <span>
                  调用方法
                  <el-tooltip placement="top">
                    <template #content>
                      <div>
                        Bean调用示例：ryTask.ryParams('ry')
                        <br />Class类调用示例：com.xxx.quartz.task.RyTask.ryParams('ry') <br />参数说明：支持字符串，布尔类型，长整型，浮点型，整型
                      </div>
                    </template>
                    <el-icon><question-filled /></el-icon>
                  </el-tooltip>
                </span>
              </template>
              <el-input v-model="form.invokeTarget" placeholder="请输入调用目标字符串" />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="cron表达式" prop="cronExpression">
              <el-input v-model="form.cronExpression" placeholder="请输入cron执行表达式">
                <template #append>
                  <el-button type="primary" @click="handleShowCron">
                    生成表达式
                    <i class="el-icon-time el-icon--right"></i>
                  </el-button>
                </template>
              </el-input>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="执行策略" prop="misfirePolicy">
              <el-radio-group v-model="form.misfirePolicy">
                <el-radio-button label="1">立即执行</el-radio-button>
                <el-radio-button label="2">执行一次</el-radio-button>
                <el-radio-button label="3">放弃执行</el-radio-button>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="是否并发" prop="concurrent">
              <el-radio-group v-model="form.concurrent">
                <el-radio-button label="0">允许</el-radio-button>
                <el-radio-button label="1">禁止</el-radio-button>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="状态">
              <el-radio-group v-model="form.status">
                <el-radio v-for="dict in sys_job_status" :key="dict.value" :label="dict.value">{{ dict.label }}</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <template #footer>
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </template>
    </el-dialog>
    <el-dialog v-model="openCron" title="Cron表达式生成器" append-to-body destroy-on-close draggable>
      <crontab ref="crontabRef" :expression="expression" @hide="openCron = false" @fill="crontabFill"></crontab>
    </el-dialog>
    <!-- 任务日志详细 -->
    <el-dialog v-model="openView" title="任务详细" width="700px" append-to-body draggable>
      <el-form :model="form" label-width="120px">
        <el-row>
          <el-col :span="12">
            <el-form-item label="任务编号：">{{ form.jobId }}</el-form-item>
            <el-form-item label="任务名称：">{{ form.jobName }}</el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="任务分组：">{{ jobGroupFormat(form) }}</el-form-item>
            <el-form-item label="创建时间：">{{ form.createTime }}</el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="cron表达式：">{{ form.cronExpression }}</el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="下次执行时间：">{{ form.nextValidTime }}</el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="调用目标方法：">{{ form.invokeTarget }}</el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="任务状态：">
              <div v-if="form.status == 0">正常</div>
              <div v-else-if="form.status == 1">失败</div>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="是否并发：">
              <div v-if="form.concurrent == 0">允许</div>
              <div v-else-if="form.concurrent == 1">禁止</div>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="执行策略：">
              <div v-if="form.misfirePolicy == 0">默认策略</div>
              <div v-else-if="form.misfirePolicy == 1">立即执行</div>
              <div v-else-if="form.misfirePolicy == 2">执行一次</div>
              <div v-else-if="form.misfirePolicy == 3">放弃执行</div>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <template #footer>
        <el-button @click="openView = false">关 闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="Job" lang="ts">
import { listJob, getJob, delJob, addJob, updateJob, runJob, changeJobStatus } from '@/api/monitor/job'
import Crontab from '@/components/Crontab/index.vue'
const router = useRouter()
const { proxy } = getCurrentInstance() as ComponentInternalInstance
const { sys_job_group, sys_job_status } = proxy.useDict('sys_job_group', 'sys_job_status')

const jobRef = ref()
const list = ref<any[]>([])
const open = ref(false)
const loading = ref(true)
const showSearch = ref(true)
const ids = ref<number[]>([])
const single = ref(true)
const multiple = ref(true)
const total = ref(0)
const title = ref('')
const openView = ref(false)
const openCron = ref(false)
const expression = ref('')

const form = ref<any>({})
const queryParams = ref<any>({ pageNum: 1, pageSize: 10 })
const rules = ref<any>({
  jobName: [{ required: true, message: '任务名称不能为空', trigger: 'change' }],
  invokeTarget: [{ required: true, message: '调用目标字符串不能为空', trigger: 'change' }],
  cronExpression: [{ required: true, message: 'cron执行表达式不能为空', trigger: 'change' }]
})

/** 查询定时任务列表 */
async function getList() {
  loading.value = true
  const res: any = await listJob(queryParams.value)
  list.value = res.rows
  total.value = res.total
  loading.value = false
}
/** 任务组名字典翻译 */
function jobGroupFormat(row: any) {
  return proxy.selectDictLabel(sys_job_group.value, row.jobGroup)
}
/** 取消按钮 */
function cancel() {
  open.value = false
  reset()
}
/** 表单重置 */
function reset() {
  form.value = {
    misfirePolicy: 1,
    concurrent: 1,
    status: '0'
  }
  proxy.resetForm('jobRef')
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
// 多选框选中数据
function handleSelectionChange(selection: any[]) {
  ids.value = selection.map(item => item.jobId)
  single.value = selection.length !== 1
  multiple.value = !selection.length
}
// 任务状态修改
async function handleStatusChange(row: any) {
  try {
    let text = row.status === '0' ? '启用' : '停用'
    await proxy.$modal.confirm('确认要"' + text + '""' + row.jobName + '"任务吗?')
    await changeJobStatus(row.jobId, row.status)
    proxy.$modal.msgSuccess(text + '成功')
  } catch (e: any) {
    row.status = row.status === '0' ? '1' : '0'
  }
}
/* 立即执行一次 */
async function handleRun(row: any) {
  await proxy.$modal.confirm('确认要立即执行一次"' + row.jobName + '"任务吗?')
  await runJob(row.jobId, row.jobGroup)
  proxy.$modal.msgSuccess('执行成功')
}
/** 任务详细信息 */
function handleView(row: any) {
  getJob(row.jobId).then(response => {
    form.value = response.data
    openView.value = true
  })
}
/** cron表达式按钮操作 */
function handleShowCron() {
  expression.value = form.value.cronExpression
  openCron.value = true
}
/** 确定后回传值 */
function crontabFill(value: any) {
  form.value.cronExpression = value
}
/** 任务日志列表查询 */
function handleJobLog(row: any) {
  const jobId = row.jobId || 0
  router.push('/monitor/job-log/index/' + jobId)
}
/** 新增按钮操作 */
function handleAdd() {
  reset()
  open.value = true
  title.value = '新增'
}
/** 修改按钮操作 */
async function handleUpdate(row: any) {
  reset()
  const jobId = row.jobId || ids.value
  const res = await getJob(jobId)
  form.value = res.data
  open.value = true
  title.value = '修改'
}
/** 提交按钮 */
async function submitForm() {
  const valid = await jobRef.value.validate()
  if (!valid) return
  if (form.value.jobId !== undefined) {
    await updateJob(form.value)
    proxy.$modal.msgSuccess('修改成功')
  } else {
    await addJob(form.value)
    proxy.$modal.msgSuccess('新增成功')
  }
  open.value = false
  getList()
}
/** 删除按钮操作 */
async function handleDelete(row: any) {
  const jobIds = row.jobId || ids.value
  await proxy.$modal.confirm('是否确认删除定时任务编号为"' + jobIds + '"的数据项?')
  await delJob(jobIds)
  getList()
  proxy.$modal.msgSuccess('删除成功')
}
/** 导出按钮操作 */
function handleExport() {
  proxy.download('monitor/job/export', queryParams.value, `job_${new Date().getTime()}.xlsx`)
}

getList()
</script>
