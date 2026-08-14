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
                <template #status="{ rows }">
                    <el-tag type="success" v-if="rows.status">启用</el-tag>
                    <el-tag type="danger" v-else>禁用</el-tag>
                </template>
                <template #permissions="{ rows }">
                    <el-button type="primary" size="small" plain @click="handlePermission(rows)">管理</el-button>
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
        <el-dialog title="权限管理" v-model="visible2" width="500px" destroy-on-close>
            <RolePermission :permiss-options="permissOptions" :menu-data="menuTreeData" @submit="savePermissions" />
        </el-dialog>
    </div>
</template>

<script setup lang="ts" name="system-role">
import { computed, onMounted, reactive, ref } from 'vue';
import { ElMessage } from 'element-plus';
import { CirclePlusFilled } from '@element-plus/icons-vue';
import { createRole, deleteRole, fetchMenuData, fetchRoleData, updateRole, updateRolePermissions } from '@/api';
import type { Role } from '@/types/role';
import type { Menus } from '@/types/menu';
import TableCustom from '@/components/table-custom.vue';
import TableDetail from '@/components/table-detail.vue';
import TableEdit from '@/components/table-edit.vue';
import TableSearch from '@/components/table-search.vue';
import RolePermission from './role-permission.vue';
import type { FormOption, FormOptionList } from '@/types/form-option';
import { buildMenuTree, mapMenuItem, storageKeys } from '@/utils';
import { usePermissStore } from '@/store/permiss';

const query = reactive({
    name: '',
});

const searchOpt = ref<FormOptionList[]>([
    { type: 'input', label: '角色名称：', prop: 'name' }
]);

const columns = ref([
    { type: 'index', label: '序号', width: 55, align: 'center' },
    { prop: 'name', label: '角色名称' },
    { prop: 'key', label: '角色标识' },
    { prop: 'status', label: '状态' },
    { prop: 'permissions', label: '权限管理' },
    { prop: 'operator', label: '操作', width: 250 },
]);

const page = reactive({
    index: 1,
    size: 10,
    total: 0,
});

const sourceData = ref<Role[]>([]);
const tableData = ref<Role[]>([]);
const menuTreeData = ref<Menus[]>([]);
const permissStore = usePermissStore();

const options = computed<FormOption>(() => ({
    labelWidth: '100px',
    span: 24,
    list: [
        { type: 'input', label: '角色名称', prop: 'name', required: true },
        { type: 'input', label: '角色标识', prop: 'key', required: true },
        { type: 'switch', label: '状态', prop: 'status', activeText: '启用', inactiveText: '禁用' },
    ]
}));

const visible = ref(false);
const isEdit = ref(false);
const rowData = ref<Partial<Role>>({});

const visible1 = ref(false);
const viewData = ref({
    row: {},
    list: [] as { prop: string; label: string }[],
});

const visible2 = ref(false);
const permissOptions = ref<{ id?: number; permiss: string[] }>({ permiss: [] });

const applyTableData = () => {
    const filtered = sourceData.value.filter((item) => {
        return !query.name || item.name.includes(query.name);
    });
    page.total = filtered.length;
    const start = (page.index - 1) * page.size;
    tableData.value = filtered.slice(start, start + page.size);
};

const getData = async () => {
    const res = await fetchRoleData();
    sourceData.value = res.list;
    applyTableData();
};

const getMenuList = async () => {
    const res = await fetchMenuData();
    menuTreeData.value = buildMenuTree(res.list.map(mapMenuItem));
};

const handleSearch = () => {
    changePage(1);
};

const changePage = (val: number) => {
    page.index = val;
    applyTableData();
};

const handleCreate = () => {
    rowData.value = {
        name: '',
        key: '',
        status: true,
    };
    isEdit.value = false;
    visible.value = true;
};

const handleEdit = (row: Role) => {
    rowData.value = { ...row };
    isEdit.value = true;
    visible.value = true;
};

const updateData = async (formData: Role) => {
    if (isEdit.value && rowData.value.id) {
        await updateRole(rowData.value.id, {
            name: formData.name,
            key: formData.key,
            status: formData.status,
        });
        ElMessage.success('更新成功');
    } else {
        await createRole({
            name: formData.name,
            key: formData.key,
            status: formData.status,
        });
        ElMessage.success('创建成功');
    }
    closeDialog();
    await getData();
};

const closeDialog = () => {
    visible.value = false;
    isEdit.value = false;
    rowData.value = {};
};

const handleView = (row: Role) => {
    viewData.value.row = { ...row };
    viewData.value.list = [
        { prop: 'id', label: '角色ID' },
        { prop: 'name', label: '角色名称' },
        { prop: 'key', label: '角色标识' },
        { prop: 'status', label: '角色状态' },
    ];
    visible1.value = true;
};

const handleDelete = async (row: Role) => {
    await deleteRole(row.id);
    ElMessage.success('删除成功');
    await getData();
};

const handlePermission = (row: Role) => {
    permissOptions.value = {
        id: row.id,
        permiss: row.permiss,
    };
    visible2.value = true;
};

const savePermissions = async (permiss: string[]) => {
    if (!permissOptions.value.id) {
        return;
    }
    await updateRolePermissions(permissOptions.value.id, { permiss });
    const currentRoleKey = localStorage.getItem(storageKeys.roleKey);
    const editedRole = sourceData.value.find((item) => item.id === permissOptions.value.id);
    if (editedRole && editedRole.key === currentRoleKey) {
        permissStore.handleSet(permiss.map((item) => String(item)));
        window.dispatchEvent(new Event('menus-updated'));
    }
    ElMessage.success('权限保存成功');
    visible2.value = false;
    await getData();
};

onMounted(async () => {
    await Promise.all([getData(), getMenuList()]);
});
</script>

<style scoped></style>