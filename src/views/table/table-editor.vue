<template>
	<div class="container">
		<TableCustom :columns="columns" :tableData="tableData" :hasToolbar="false" :hasPagination="false">
			<template #name="{ rows }">
				<el-input v-if="rows.editing" v-model="rows.name"></el-input>
				<span v-else>{{ rows.name }}</span>
			</template>
			<template #password="{ rows }">
				<el-input v-if="rows.editing" v-model="rows.password"></el-input>
				<span v-else>{{ rows.password }}</span>
			</template>
			<template #email="{ rows }">
				<el-input v-if="rows.editing" v-model="rows.email"></el-input>
				<span v-else>{{ rows.email }}</span>
			</template>
			<template #role="{ rows }">
				<el-select v-if="rows.editing" v-model="rows.roleId">
					<el-option v-for="item in roleOptions" :key="item.value" :label="item.label" :value="item.value"></el-option>
				</el-select>
				<span v-else>{{ rows.role }}</span>
			</template>
			<template #operator="{ rows, index }">
				<template v-if="!rows.editing">
					<el-button type="primary" size="small" :icon="Edit" @click="handleEdit(rows)">
						编辑
					</el-button>
					<el-button type="danger" size="small" :icon="Delete" @click="handleDelete(rows)">
						删除
					</el-button>
				</template>
				<template v-else>
					<el-button type="success" size="small" :icon="Select" @click="saveRow(rows)">
						保存
					</el-button>
					<el-button type="default" size="small" :icon="CloseBold" @click="handleCancel(rows, index)">
						取消
					</el-button>
				</template>
			</template>
		</TableCustom>
	</div>
</template>

<script setup lang="ts" name="table-editor">
import { computed, ref } from 'vue';
import { ElMessage } from 'element-plus';
import { Delete, Edit, CloseBold, Select } from '@element-plus/icons-vue';
import TableCustom from '@/components/table-custom.vue';
import { deleteUser, fetchRoleData, fetchUserData, updateUser } from '@/api/index';
import { User } from '@/types/user';
import { Role } from '@/types/role';

let columns = ref([
	{ type: 'index', label: '序号', width: 55, align: 'center' },
	{ prop: 'name', label: '用户名' },
	{ prop: 'password', label: '密码' },
	{ prop: 'email', label: '邮箱' },
	{ prop: 'role', label: '角色' },
	{ prop: 'operator', label: '操作', width: 180 },
])

const roleList = ref<Role[]>([]);
const roleOptions = computed(() => {
	return roleList.value.map((item) => ({
		label: item.name,
		value: item.id,
	}));
});

const resolveRoleId = (roleName: string) => {
	return roleList.value.find((item) => item.name === roleName)?.id || 0;
};

const tableData = ref<User[]>([]);
const getData = async () => {
	const [roleRes, userRes] = await Promise.all([
		fetchRoleData(),
		fetchUserData({ page: 1, size: 100 }),
	]);
	roleList.value = roleRes.list;
	tableData.value = userRes.list.map((item) => ({
		...item,
		roleId: resolveRoleId(item.role),
		password: '',
		editing: false,
	}));
};
getData();

const rowData = ref<Partial<User>>({})

const handleEdit = (row: User) => {
	rowData.value = { ...row };
	row.editing = true;
};

const handleCancel = (row: User, index: number) => {
	row.editing = false;
	tableData.value[index] = { ...rowData.value } as User;
};

const saveRow = async (row: User) => {
	await updateUser(row.id, {
		email: row.email,
		phone: row.phone,
		roleId: row.roleId,
		status: row.status,
		password: row.password || undefined,
	});
	row.role = roleList.value.find((item) => item.id === row.roleId)?.name || row.role;
	row.password = '';
	row.editing = false;
	ElMessage.success('保存成功');
	await getData();
};

const handleDelete = async (row: User) => {
	await deleteUser(row.id);
	ElMessage.success('删除成功');
	await getData();
};
</script>

<style scoped></style>
