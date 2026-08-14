<template>
    <div>
        <div class="container">
            <TableCustom :columns="columns" :tableData="menuData" row-key="id" :expand-row-keys="expandedRowKeys" :row-class-name="getRowClassName" :has-pagination="false" :viewFunc="handleView" :delFunc="handleDelete" :editFunc="handleEdit">
                <template #toolbarBtn>
                    <el-button type="warning" :icon="CirclePlusFilled" @click="handleCreate">新增</el-button>
                </template>
                <template #icon="{ rows }">
                    <i v-if="isLxIcon(rows.icon)" :class="normalizeLxIcon(rows.icon)"></i>
                    <el-icon v-else-if="rows.icon">
                        <component :is="rows.icon"></component>
                    </el-icon>
                </template>
            </TableCustom>
        </div>
        <el-dialog :title="isEdit ? '编辑' : '新增'" v-model="visible" width="700px" destroy-on-close :close-on-click-modal="false" @close="closeDialog">
            <TableEdit :form-data="rowData" :options="options" :edit="isEdit" :update="updateData">
                <template #icon="{ form }">
                    <div class="icon-picker">
                        <div class="icon-picker-select-wrap" :class="{ 'has-icon': !!form.icon }">
                            <span class="icon-picker-selected" v-if="form.icon">
                                <i v-if="isLxIcon(form.icon)" :class="normalizeLxIcon(form.icon)"></i>
                                <el-icon v-else>
                                    <component :is="form.icon"></component>
                                </el-icon>
                            </span>
                            <el-select
                                v-model="form.icon"
                                placeholder="请选择图标"
                                clearable
                                filterable
                                remote
                                :remote-method="handleIconSearch"
                                :reserve-keyword="false"
                                class="icon-picker-select"
                            >
                                <el-option label="无图标" value="" />
                                <el-option-group label="Element 图标">
                                    <el-option
                                        v-for="item in filteredElementIconOptions"
                                        :key="item.name"
                                        :label="item.name"
                                        :value="item.name"
                                    >
                                        <template #default>
                                            <div class="icon-option">
                                                <el-icon>
                                                    <component :is="item.component"></component>
                                                </el-icon>
                                                <span>{{ item.name }}</span>
                                            </div>
                                        </template>
                                    </el-option>
                                </el-option-group>
                                <el-option-group label="LX 自定义图标">
                                    <el-option
                                        v-for="name in filteredLxIconOptions"
                                        :key="name"
                                        :label="`el-icon-lx-${name}`"
                                        :value="`el-icon-lx-${name}`"
                                    >
                                        <template #default>
                                            <div class="icon-option">
                                                <i :class="`el-icon-lx-${name}`"></i>
                                                <span>{{ `el-icon-lx-${name}` }}</span>
                                            </div>
                                        </template>
                                    </el-option>
                                </el-option-group>
                            </el-select>
                        </div>
                    </div>
                </template>
                <template #pid="{ form }">
                    <el-cascader v-model="form.pid" :options="cascaderOptions" :props="{ checkStrictly: true, emitPath: false }" clearable />
                </template>
            </TableEdit>
        </el-dialog>
        <el-dialog title="查看详情" v-model="visible1" width="700px" destroy-on-close>
            <TableDetail :data="viewData">
                <template #icon="{ rows }">
                    <i v-if="isLxIcon(rows.icon)" :class="normalizeLxIcon(rows.icon)"></i>
                    <el-icon v-else-if="rows.icon">
                        <component :is="rows.icon"></component>
                    </el-icon>
                </template>
            </TableDetail>
        </el-dialog>
    </div>
</template>

<script setup lang="ts" name="system-menu">
import { computed, onMounted, ref } from 'vue';
import { ElMessage } from 'element-plus';
import {
    Brush,
    Calendar,
    CirclePlusFilled,
    DataAnalysis,
    DataLine,
    Document,
    DocumentAdd,
    Files,
    Goods,
    Guide,
    HomeFilled,
    Menu,
    Monitor,
    Odometer,
    OfficeBuilding,
    Operation,
    PieChart,
    Setting,
    ShoppingCart,
    Star,
    Tools,
    User,
    Bell,
    Message,
} from '@element-plus/icons-vue';
import { createMenu, deleteMenu, fetchMenuData, updateMenu } from '@/api';
import type { Menus } from '@/types/menu';
import TableCustom from '@/components/table-custom.vue';
import TableDetail from '@/components/table-detail.vue';
import TableEdit from '@/components/table-edit.vue';
import type { FormOption } from '@/types/form-option';
import { buildMenuTree, mapMenuItem } from '@/utils';

const columns = ref([
    { prop: 'title', label: '菜单名称', align: 'left' },
    { prop: 'icon', label: '图标' },
    { prop: 'index', label: '路由路径' },
    { prop: 'permiss', label: '权限标识' },
    { prop: 'sortOrder', label: '排序' },
    { prop: 'operator', label: '操作', width: 250 },
]);

const elementIconOptions = [
    { name: 'HomeFilled', component: HomeFilled },
    { name: 'Odometer', component: Odometer },
    { name: 'User', component: User },
    { name: 'Menu', component: Menu },
    { name: 'Setting', component: Setting },
    { name: 'Tools', component: Tools },
    { name: 'Calendar', component: Calendar },
    { name: 'Document', component: Document },
    { name: 'DocumentAdd', component: DocumentAdd },
    { name: 'Files', component: Files },
    { name: 'PieChart', component: PieChart },
    { name: 'DataLine', component: DataLine },
    { name: 'DataAnalysis', component: DataAnalysis },
    { name: 'Monitor', component: Monitor },
    { name: 'Bell', component: Bell },
    { name: 'Message', component: Message },
    { name: 'Operation', component: Operation },
    { name: 'Guide', component: Guide },
    { name: 'Brush', component: Brush },
    { name: 'Star', component: Star },
    { name: 'ShoppingCart', component: ShoppingCart },
    { name: 'Goods', component: Goods },
    { name: 'OfficeBuilding', component: OfficeBuilding },
];

const lxIconOptions = [
    'home',
    'news',
    'newsfill',
    'notice',
    'notification',
    'service',
    'settings',
    'calendar',
    'group',
    'friend',
    'profile',
    'addressbook',
    'goods',
    'shop',
    'cart',
    'message',
    'comment',
    'search',
    'filter',
    'rank',
    'warn',
    'like',
    'favor',
    'vipcard',
    'scan',
    'qrcode',
    'refresh',
    'file',
    'link',
    'copy',
    'share',
    'edit',
];

const iconSelectOptions = [
    { label: '无图标', value: '' },
    ...elementIconOptions.map((name) => ({ label: `Element - ${name}`, value: name })),
    ...lxIconOptions.map((name) => ({ label: `LX - el-icon-lx-${name}`, value: `el-icon-lx-${name}` })),
];

const menuData = ref<Menus[]>([]);
const flatMenuData = ref<Menus[]>([]);
const iconKeyword = ref('');

const getOptions = (data: Menus[]) => {
    return data.map((item) => {
        const option: { label: string; value: string; children?: ReturnType<typeof getOptions> } = {
            label: item.title,
            value: item.id,
        };
        if (item.children?.length) {
            option.children = getOptions(item.children);
        }
        return option;
    });
};

const cascaderOptions = computed(() => getOptions(menuData.value));

const filteredElementIconOptions = computed(() => {
    const keyword = iconKeyword.value.trim().toLowerCase();
    if (!keyword) {
        return elementIconOptions;
    }
    return elementIconOptions.filter((item) => item.name.toLowerCase().includes(keyword));
});

const filteredLxIconOptions = computed(() => {
    const keyword = iconKeyword.value.trim().toLowerCase();
    if (!keyword) {
        return lxIconOptions;
    }
    return lxIconOptions.filter((item) => item.toLowerCase().includes(keyword));
});

const handleIconSearch = (keyword: string) => {
    iconKeyword.value = keyword;
};

const isLxIcon = (icon?: string) => {
    return Boolean(icon && (icon.startsWith('el-icon-lx-') || /^[a-z0-9_-]+$/.test(icon)));
};

const normalizeLxIcon = (icon?: string) => {
    if (!icon) {
        return '';
    }
    return icon.startsWith('el-icon-lx-') ? icon : `el-icon-lx-${icon}`;
};

const options = computed<FormOption>(() => ({
    labelWidth: '100px',
    span: 12,
    list: [
        ...(isEdit.value ? [{ type: 'input', label: '菜单ID', prop: 'id', required: true, disabled: true }] : []),
        { type: 'input', label: '菜单名称', prop: 'title', required: true },
        { type: 'input', label: '路由路径', prop: 'index', required: true },
        { type: 'select', label: '图标', prop: 'icon', placeholder: '请选择图标', opts: iconSelectOptions },
        { type: 'input', label: '权限标识', prop: 'permiss', disabled: true, placeholder: '默认使用菜单ID' },
        { type: 'number', label: '排序', prop: 'sortOrder', required: true },
        { type: 'switch', label: '状态', prop: 'status', activeText: '启用', inactiveText: '禁用' },
        { type: 'parent', label: '父菜单', prop: 'pid' },
    ]
}));

const visible = ref(false);
const isEdit = ref(false);
const rowData = ref<Partial<Menus>>({});
const expandedRowKeys = ref<string[]>([]);
const highlightedMenuId = ref<string>('');
let highlightTimer: ReturnType<typeof setTimeout> | null = null;

const visible1 = ref(false);
const viewData = ref({
    row: {},
    list: [] as { prop: string; label: string }[],
});

const getMenuList = async () => {
    const res = await fetchMenuData();
    flatMenuData.value = res.list.map(mapMenuItem);
    menuData.value = buildMenuTree(flatMenuData.value);
};

const notifyMenuUpdated = () => {
    window.dispatchEvent(new Event('menus-updated'));
};

const generateNextMenuId = () => {
    const numericIds = flatMenuData.value
        .map((item) => Number(item.id))
        .filter((id) => Number.isFinite(id));
    if (!numericIds.length) {
        return '1';
    }
    return String(Math.max(...numericIds) + 1);
};

const createDefaultRow = (): Partial<Menus> => ({
    id: generateNextMenuId(),
    pid: undefined,
    title: '',
    index: '',
    icon: '',
    permiss: generateNextMenuId(),
    sortOrder: flatMenuData.value.length,
    status: true,
});

const handleCreate = () => {
    rowData.value = createDefaultRow();
    isEdit.value = false;
    visible.value = true;
};

const handleEdit = (row: Menus) => {
    rowData.value = { ...row };
    isEdit.value = true;
    visible.value = true;
};

const updateData = async (formData: Menus) => {
    const isCreate = !isEdit.value;
    const parentId = formData.pid;
    const payload = {
        id: formData.id,
        pid: formData.pid,
        title: formData.title,
        index: formData.index,
        icon: formData.icon,
        permiss: formData.permiss || formData.id,
        sortOrder: Number(formData.sortOrder || 0),
        status: formData.status ?? true,
    };
    if (isEdit.value && rowData.value.id) {
        await updateMenu(rowData.value.id, payload);
        ElMessage.success('更新成功');
    } else {
        await createMenu(payload);
        ElMessage.success('创建成功');
    }
    closeDialog();
    await getMenuList();
    notifyMenuUpdated();

    if (isCreate) {
        if (parentId) {
            expandedRowKeys.value = Array.from(new Set([...expandedRowKeys.value, parentId]));
        }
        highlightedMenuId.value = payload.id;
        if (highlightTimer) {
            clearTimeout(highlightTimer);
        }
        highlightTimer = setTimeout(() => {
            highlightedMenuId.value = '';
        }, 3000);
    }
};

const getRowClassName = ({ row }: { row: Menus }) => {
    if (row.id === highlightedMenuId.value) {
        return 'menu-row--new';
    }
    return '';
};

const closeDialog = () => {
    visible.value = false;
    isEdit.value = false;
    rowData.value = {};
    iconKeyword.value = '';
};

const handleView = (row: Menus) => {
    viewData.value.row = { ...row };
    viewData.value.list = [
        { prop: 'id', label: '菜单ID' },
        { prop: 'pid', label: '父菜单ID' },
        { prop: 'title', label: '菜单名称' },
        { prop: 'index', label: '路由路径' },
        { prop: 'permiss', label: '权限标识' },
        { prop: 'icon', label: '图标' },
        { prop: 'sortOrder', label: '排序' },
    ];
    visible1.value = true;
};

const handleDelete = async (row: Menus) => {
    const deleteId = String(row.id);
    flatMenuData.value = flatMenuData.value.filter((item) => item.id !== deleteId);
    menuData.value = buildMenuTree(flatMenuData.value);
    await deleteMenu(deleteId);
    ElMessage.success('删除成功');
    await getMenuList();
    notifyMenuUpdated();
};

onMounted(async () => {
    await getMenuList();
});
</script>

<style scoped>
:deep(.menu-row--new td) {
    background: #fff7e6;
}

:deep([class^='el-icon-lx-']),
:deep([class*=' el-icon-lx-']) {
    font-size: 16px;
}

.icon-picker {
    display: flex;
    flex-direction: column;
    align-items: stretch;
    gap: 10px;
    width: 100%;
}

.icon-picker-select-wrap {
    position: relative;
    width: 100%;
}

.icon-picker-selected {
    position: absolute;
    left: 12px;
    top: 50%;
    z-index: 2;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 18px;
    height: 18px;
    transform: translateY(-50%);
    color: var(--el-text-color-regular);
    pointer-events: none;
}

.icon-picker-select {
    width: 100%;
}

.icon-option {
    display: inline-flex;
    align-items: center;
    gap: 8px;
}

.icon-option .el-icon,
.icon-option i {
    font-size: 16px;
}

.icon-picker-select-wrap.has-icon :deep(.el-input__wrapper) {
    padding-left: 38px;
}

.icon-picker-select-wrap.has-icon :deep(.el-input__inner) {
    padding-left: 0;
}

.icon-picker-select-wrap.has-icon :deep(.el-select__wrapper) {
    padding-left: 38px;
}
</style>