<template>
  <div class="app-container">
    <div class="filter-container">
      <el-form :inline="true" :model="queryCondition"  size="mini">
        <el-form-item label="字典类别">
          <el-input v-model="queryCondition.codeType" placeholder="字典类别"></el-input>
        </el-form-item>
        <el-form-item>
          <el-button-group>
            <el-button type="primary" icon="el-icon-refresh" @click="getDictList"></el-button>
            <el-button type="primary" icon="search" @click="query">查询</el-button>
            <el-button type="success" @click.native="add">新增</el-button>
            <el-button type="danger"  @click.native="deleteSelected">批量删除</el-button>
          </el-button-group>
        </el-form-item>
      </el-form>
    </div>
    <div class="table-container">
      <el-table ref="table" v-loading.body="listLoading" :data="dictList" border class="full"
                @selection-change="onSelectionChange" @sort-change='onSortChange' @row-click="onClickRow">
        <el-table-column type="selection" width="55" fixed="left"></el-table-column>
        <el-table-column align="center" label="字典类别" prop="codeType" sortable="custom"></el-table-column>
        <el-table-column align="center" label="字典项" prop="codeName" ></el-table-column>
        <el-table-column align="center" label="值" prop="codeValue"></el-table-column>
        <el-table-column align="center" label="是否生效" prop="enabled" >
          <template slot-scope="scope">
            {{scope.row.enabled?'是':'否'}}
          </template>
        </el-table-column>
        <el-table-column align="center" label="创建时间" prop="createTime" sortable="custom"></el-table-column>
        <el-table-column align="center" label="更新时间" prop="updateTime" sortable="custom"></el-table-column>
        <el-table-column align="center" label="管理" width="160" fixed="right">
          <template slot-scope="scope">
            <el-button-group>
              <el-button type="primary" icon="edit"
                         @click="update(scope.row.id)">修改</el-button>
              <el-button type="danger" icon="delete"
                         @click="remove(scope.row.id)">删除</el-button>
            </el-button-group>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <div class="pagination-container">
      <el-pagination
        @size-change="onSizeChange"
        @current-change="onCurrentChange"
        background
        :current-page="pageNum"
        :page-size="pageSize"
        :total="total"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper">
      </el-pagination>
    </div>

    <el-dialog :title='dialogTitleMap[dialogStatus]' :visible.sync='dialogFormVisible'>
      <el-form :model="editForm" :rules="editFormRules" ref="editForm" label-width="100px">
        <el-form-item label="字典类型" prop="codeType">
          <el-input v-model="editForm.codeType" placeholder="请输入字典类型"></el-input>
        </el-form-item>
        <el-form-item label="字典项" prop="codeType">
          <el-input v-model="editForm.codeName" placeholder="请输入字典项"></el-input>
        </el-form-item>
        <el-form-item label="值" prop="codeValue">
          <el-input v-model="editForm.codeValue" placeholder="请输入值"></el-input>
        </el-form-item>
        <el-form-item label="排序" prop="orderNumber">
          <el-input-number v-model="editForm.orderNumber" :min="1" :max="999"></el-input-number>
        </el-form-item>
        <el-form-item label="是否生效" prop="enabled">
          <el-radio v-model="editForm.enabled" :label="true">生效</el-radio>
          <el-radio v-model="editForm.enabled" :label="false">不生效</el-radio>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">取 消</el-button>
        <el-button v-if="dialogStatus=='create'" type="primary" @click="formSave">确 定</el-button>
        <el-button v-else type="primary" @click="formSave">修 改</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import api from '@/api/dict'

export default {
  name: 'Dict',
  data() {
    return {
      dictList: [],
      listLoading: false,
      pageNum: 1,
      pageSize: 10,
      total: 0,
      order: '',
      isAsc: false,
      multipleSelection: [],
      queryCondition: {
        codeType : '',
      },

      dialogFormVisible: false, // 表单是否显示
      dialogStatus: '',
      dialogTitleMap: {
        update: '编辑',
        create: '创建'
      },
      editForm: {
        codeType: '',
        codeName: '',
        codeValue: '',
        orderNumber: 1,
        enabled: false,
      },
      editFormRules: {
        codeType: [{ required: true, message: '请输入字典类别', trigger: 'blur' }],
        codeName: [{ required: true, message: '请输入字典项', trigger: 'blur' }],
        codeValue: [{ required: true, message: '请输入值', trigger: 'blur' }],
        orderNumber: [{ required: true, message: '请输入排序', trigger: 'blur'},{type: 'number', min: 1, max: 999}]
      },
    }
  },
  methods: {
    getDictList(){
      this.listLoading = true;
      api.fetchDictList({
        queryCondition: this.queryCondition,
        page: this.pageNum,
        size: this.pageSize,
        order: this.order,
        isAsc: this.isAsc
      }).then(res=>{
        this.listLoading = false;
        this.dictList = res.list;
        this.total = res.total;
      })
    },
    query(){
      this.pageNum = 1;
      this.getDictList()
    },
    add(){
      this.formReset()
      this.dialogStatus = 'create'
      this.dialogFormVisible = true
    },
    update(id){
      this.formReset()
      let row = this.dictList.find(elem => elem.id === id)
      this.editForm = row
      this.dialogStatus = 'update'
      this.dialogFormVisible = true
    },
    remove(id){
      this.$confirm('确定删除此记录?', '提示', {
        confirmButtonText: '确定',
        showCancelButton: false,
        type: 'warning'
      }).then(() => {
        api.removeDict([id]).then(res=>{
          this.getDictList();
          this.$message.success("删除成功");
        })
      })
    },
    deleteSelected(){
      this.$confirm('确定删除所选记录?', '提示', {
        confirmButtonText: '确定',
        showCancelButton: false,
        type: 'warning'
      }).then(() => {
        api.removeDict(this.multipleSelection.map(m=>m.id)).then(res=>{
          this.getDictList();
          this.$message.success("删除成功");
        })
      })
    },
    //改变分页大小
    onSizeChange(val) {
      this.pageSize = val;
      this.onCurrentChange(1)
    },
    //跳转页数
    onCurrentChange(val) {
      this.pageNum = val;
      this.getDictList();
    },
    onSelectionChange(val){
      this.multipleSelection = val;
    },
    onSortChange(column){
      console.log(column)
      this.order = column.prop
      this.isAsc = column.order.startsWith("asc")
      this.query()
    },
    onClickRow(row, column, event){
      this.$refs.table.toggleRowSelection(row);
    },
    formReset(){
      this.editForm = {
        codeType: '',
        codeName: '',
        codeValue: '',
        orderNumber: 1,
        enabled: false,
      }
    },
    formSave(){
      const refs = this.$refs
      refs.editForm.validate(r => {
        if (!r) return r
        api.saveDict(this.editForm).then(res => {
          if (!res) {
            this.$notify({ title: '失败', message: '保存失败', type: 'error', duration: 2000 })
          } else {
            this.dialogFormVisible = false
            this.getDictList()
            this.$notify({ title: '成功', message: '保存成功', type: 'success', duration: 2000 })
          }
        })
        return r
      })
    }
  },
  created: async function(){
    this.getDictList()
  }
}
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
  .full {
    width: 100%;
  }
  .pagination-container {
    float: right;
    margin-top: 10px;
  }

</style>
