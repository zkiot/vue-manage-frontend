<template>
    <div>
        <el-tree
            class="mgb10"
            ref="tree"
            :data="data"
            node-key="id"
            default-expand-all
            show-checkbox
            :default-checked-keys="checkedKeys"
        />
        <el-button type="primary" @click="onSubmit">保存权限</el-button>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { ElTree } from 'element-plus';
import type { Menus } from '@/types/menu';

const props = defineProps({
    permissOptions: {
        type: Object,
        required: true,
    },
    menuData: {
        type: Array as () => Menus[],
        required: true,
    },
});

const emit = defineEmits<{
    (e: 'submit', value: string[]): void;
}>();

const menuObj = ref<Record<string, string[]>>({});

const getTreeData = (data: Menus[]) => {
    return data.map((item) => {
        const obj: any = {
            id: item.id,
            label: item.title,
        };
        if (item.children?.length) {
            menuObj.value[item.id] = item.children.map((sub) => sub.id);
            obj.children = getTreeData(item.children);
        }
        return obj;
    });
};
const data = getTreeData(props.menuData);
const checkData = (permissionIds: string[]) => {
    return permissionIds.filter((item) => {
        const childIds = menuObj.value[item];
        return !childIds || childIds.every((id) => permissionIds.includes(id));
    });
};
// 获取当前权限
const checkedKeys = ref<string[]>(checkData(props.permissOptions.permiss));

// 保存权限
const tree = ref<InstanceType<typeof ElTree>>();
const onSubmit = () => {
    const keys = tree.value!.getCheckedKeys(false).map((item) => String(item));
    emit('submit', keys);
};
</script>

<style scoped></style>
