<!-- eslint-disable vue/no-mutating-props -->
<template>
  <el-form ref="basicInfoForm" :model="info" :rules="rules" label-width="150px">
    <el-row>
      <el-col :span="12">
        <el-form-item label="表名称" prop="tableName">
          <el-input v-model="info.tableName" placeholder="请输入仓库名称" />
        </el-form-item>
      </el-col>
      <el-col :span="12">
        <el-form-item label="表描述" prop="tableComment">
          <el-input v-model="info.tableComment" placeholder="请输入" />
        </el-form-item>
      </el-col>
      <el-col :span="12">
        <el-form-item label="实体类名称" prop="className">
          <el-input v-model="info.className" placeholder="请输入" />
        </el-form-item>
      </el-col>
      <el-col :span="12">
        <el-form-item label="作者" prop="functionAuthor">
          <el-input v-model="info.functionAuthor" placeholder="请输入" />
        </el-form-item>
      </el-col>
      <el-col :span="24">
        <el-form-item label="备注" prop="remark">
          <el-input v-model="info.remark" type="textarea" show-word-limit maxlength="200" :rows="3"></el-input>
        </el-form-item>
      </el-col>
    </el-row>
  </el-form>
</template>

<script setup lang="ts">
defineProps({
  info: {
    type: Object,
    default: null
  }
})
const basicInfoForm = ref<FormInstance>()
defineExpose({
  basicInfoForm
})

// 表单校验
const rules = ref({
  tableName: [{ required: true, message: '请输入表名称', trigger: 'change' }],
  tableComment: [{ required: true, message: '请输入表描述', trigger: 'change' }],
  className: [{ required: true, message: '请输入实体类名称', trigger: 'change' }],
  functionAuthor: [{ required: true, message: '请输入作者', trigger: 'change' }]
})
</script>
