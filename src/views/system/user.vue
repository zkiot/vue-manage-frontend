<template>
    <div>
        <TableSearch :query="query" :options="searchOpt" :search="handleSearch" />
        <div class="container">
            <TableCustom
                :columns="columns"
                :tableData="tableData"
                :total="page.total"
                :viewFunc="handleView"
                :delFunc="handleDelete"
                :page-change="changePage"
                :editFunc="handleEdit"
            >
                <template #toolbarBtn>
                    <el-button type="warning" :icon="CirclePlusFilled" @click="handleCreate">新增</el-button>
                </template>
            </TableCustom>
        </div>
        <el-dialog :title="isEdit ? '编辑' : '新增'" v-model="visible" width="700px" destroy-on-close :close-on-click-modal="false" @close="closeDialog">
            <TableEdit :form-data="rowData" :options="options" :edit="isEdit" :update="updateData" />
        </el-dialog>
        <el-dialog title="查看详情" v-model="visible1" width="700px" destroy-on-close>
            <TableDetail :data="viewData">
                <template #status="{ rows }">
                    <el-tag type="success" v-if="rows.status">启用</el-tag>
                    <el-tag type="danger" v-else>禁用</el-tag>
                </template>
            </TableDetail>
        </el-dialog>
    </div>
</template>

<script setup lang="ts" name="system-user">
import { computed, onMounted, reactive, ref } from 'vue';
import { ElMessage } from 'element-plus';
import { CirclePlusFilled } from '@element-plus/icons-vue';
import { createUser, deleteUser, fetchRoleData, fetchUserData, updateUser } from '@/api';
import type { User } from '@/types/user';
import type { Role } from '@/types/role';
import TableCustom from '@/components/table-custom.vue';
import TableDetail from '@/components/table-detail.vue';
import TableEdit from '@/components/table-edit.vue';
import TableSearch from '@/components/table-search.vue';
import type { FormOption, FormOptionList } from '@/types/form-option';

const query = reactive({
    name: '',
});

const searchOpt = ref<FormOptionList[]>([
    { type: 'input', label: '用户名：', prop: 'name' }
]);

const columns = ref([
    { type: 'index', label: '序号', width: 55, align: 'center' },
    { prop: 'name', label: '用户名' },
    { prop: 'phone', label: '手机号' },
    { prop: 'role', label: '角色' },
    { prop: 'operator', label: '操作', width: 250 },
]);

const page = reactive({
    index: 1,
    size: 10,
    total: 0,
});

const roleList = ref<Role[]>([]);
const tableData = ref<User[]>([]);

const roleOptions = computed(() => {
    return roleList.value.filter((item) => item.status).map((item) => ({
        label: item.name,
        value: item.id,
    }));
});

const options = computed<FormOption>(() => ({
    labelWidth: '100px',
    span: 12,
    list: isEdit.value
        ? [
            { type: 'input', label: '用户名', prop: 'name', required: true, disabled: true },
            { type: 'input', label: '手机号', prop: 'phone' },
            { type: 'input', label: '密码', prop: 'password', placeholder: '不修改请留空' },
            { type: 'input', label: '邮箱', prop: 'email', required: true },
            { type: 'select', label: '角色', prop: 'roleId', required: true, opts: roleOptions.value },
            { type: 'switch', label: '状态', prop: 'status', activeText: '启用', inactiveText: '禁用' },
        ]
        : [
            { type: 'input', label: '用户名', prop: 'name', required: true },
            { type: 'input', label: '手机号', prop: 'phone' },
            { type: 'input', label: '密码', prop: 'password', required: true },
            { type: 'input', label: '邮箱', prop: 'email', required: true },
            { type: 'select', label: '角色', prop: 'roleId', required: true, opts: roleOptions.value },
            { type: 'switch', label: '状态', prop: 'status', activeText: '启用', inactiveText: '禁用' },
        ]
}));

const visible = ref(false);
const isEdit = ref(false);
const rowData = ref<Partial<User>>({});

const visible1 = ref(false);
const viewData = ref({
    row: {},
    list: [] as { prop: string; label: string }[],
});

const resolveRoleId = (roleName: string) => {
    return roleList.value.find((item) => item.name === roleName)?.id || roleOptions.value[0]?.value || 0;
};

const createDefaultRow = (): Partial<User> => ({
    name: '',
    password: '',
    email: '',
    phone: '',
    roleId: roleOptions.value[0]?.value || 0,
    role: roleOptions.value[0]?.label || '',
    date: '',
    status: true,
});

const getRoleData = async () => {
    const res = await fetchRoleData();
    roleList.value = res.list;
};

const getData = async () => {
    if (!roleList.value.length) {
        await getRoleData();
    }
    const res = await fetchUserData({
        name: query.name || undefined,
        page: page.index,
        size: page.size,
    });
    tableData.value = res.list.map((item) => ({
        ...item,
        roleId: resolveRoleId(item.role),
        password: '',
    }));
    page.total = res.pageTotal;
};

const handleSearch = () => {
    changePage(1);
};

const changePage = (val: number) => {
    page.index = val;
    getData();
};

const handleCreate = () => {
    rowData.value = createDefaultRow();
    isEdit.value = false;
    visible.value = true;
};

const handleEdit = (row: User) => {
    rowData.value = { ...row, password: '' };
    isEdit.value = true;
    visible.value = true;
};

const updateData = async (formData: User) => {
    const role = roleList.value.find((item) => item.id === Number(formData.roleId));
    if (isEdit.value && rowData.value.id) {
        await updateUser(rowData.value.id, {
            email: formData.email,
            phone: formData.phone,
            roleId: Number(formData.roleId),
            status: formData.status,
            password: formData.password || undefined,
        });
        ElMessage.success('更新成功');
    } else {
        await createUser({
            name: formData.name,
            password: formData.password || '',
            email: formData.email,
            phone: formData.phone,
            roleId: Number(formData.roleId),
        });
        ElMessage.success('创建成功');
    }
    rowData.value.role = role?.name || formData.role;
    closeDialog();
    await getData();
};

const closeDialog = () => {
    visible.value = false;
    isEdit.value = false;
    rowData.value = {};
};

const handleView = (row: User) => {
    viewData.value.row = { ...row };
    viewData.value.list = [
        { prop: 'id', label: '用户ID' },
        { prop: 'name', label: '用户名' },
        { prop: 'email', label: '邮箱' },
        { prop: 'phone', label: '电话' },
        { prop: 'role', label: '角色' },
        { prop: 'status', label: '状态' },
        { prop: 'date', label: '注册日期' },
    ];
    visible1.value = true;
};

const handleDelete = async (row: User) => {
    await deleteUser(row.id);
    ElMessage.success('删除成功');
    await getData();
};

onMounted(async () => {
    await getRoleData();
    await getData();
});
</script>

<style scoped></style>