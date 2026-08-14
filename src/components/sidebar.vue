<template>
    <div class="sidebar">
        <el-menu
            class="sidebar-el-menu"
            :default-active="onRoutes"
            :collapse="sidebar.collapse"
            :background-color="sidebar.bgColor"
            :text-color="sidebar.textColor"
            router
        >
            <template v-for="item in menus" :key="item.id">
                <template v-if="item.children?.length">
                    <el-sub-menu v-if="canAccessMenu(item)" :index="item.index">
                        <template #title>
                            <i v-if="isLxIcon(item.icon)" :class="normalizeLxIcon(item.icon)"></i>
                            <el-icon v-else-if="item.icon">
                                <component :is="item.icon"></component>
                            </el-icon>
                            <span>{{ item.title }}</span>
                        </template>
                        <template v-for="subItem in item.children" :key="subItem.id">
                            <el-sub-menu
                                v-if="subItem.children?.length && canAccessMenu(subItem)"
                                :index="subItem.index"
                            >
                                <template #title>{{ subItem.title }}</template>
                                <template v-for="(threeItem, i) in subItem.children" :key="i">
                                    <el-menu-item
                                        v-if="canAccessMenu(threeItem)"
                                        :index="threeItem.index"
                                    >
                                        {{ threeItem.title }}
                                    </el-menu-item>
                                </template>
                            </el-sub-menu>
                            <el-menu-item v-else-if="canAccessMenu(subItem)" :index="subItem.index">
                                {{ subItem.title }}
                            </el-menu-item>
                        </template>
                    </el-sub-menu>
                </template>
                <template v-else>
                    <el-menu-item v-if="canAccessMenu(item)" :index="item.index" :key="item.index">
                        <i v-if="isLxIcon(item.icon)" :class="normalizeLxIcon(item.icon)"></i>
                        <el-icon v-else-if="item.icon">
                            <component :is="item.icon"></component>
                        </el-icon>
                        <template #title>{{ item.title }}</template>
                    </el-menu-item>
                </template>
            </template>
        </el-menu>
    </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
import { useSidebarStore } from '../store/sidebar';
import { useRoute } from 'vue-router';
import { fetchMenuData } from '@/api';
import { buildMenuTree, mapMenuItem } from '@/utils';
import type { Menus } from '@/types/menu';
import { usePermissStore } from '@/store/permiss';

const route = useRoute();
const onRoutes = computed(() => {
    return route.path;
});

const sidebar = useSidebarStore();
const permissStore = usePermissStore();
const menus = ref<Menus[]>([]);

const canAccess = (id: string) => {
    return permissStore.key.includes(String(id));
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

const canAccessMenu = (menu: Menus): boolean => {
    if (canAccess(menu.id)) {
        return true;
    }
    if (!menu.children?.length) {
        return false;
    }
    return menu.children.some((child) => canAccessMenu(child));
};

const loadMenus = async () => {
    try {
        const res = await fetchMenuData();
        const remoteMenus = buildMenuTree(
            res.list
                .map(mapMenuItem)
                .filter((item) => item.status !== false)
        );
        menus.value = remoteMenus;
    } catch {
        // Keep current menu state on transient request failure.
    }
};

const handleMenuUpdated = () => {
    loadMenus();
};

onMounted(() => {
    loadMenus();
    window.addEventListener('menus-updated', handleMenuUpdated);
});

onBeforeUnmount(() => {
    window.removeEventListener('menus-updated', handleMenuUpdated);
});
</script>

<style scoped>
.sidebar {
    display: block;
    position: absolute;
    left: 0;
    top: 70px;
    bottom: 0;
    overflow-y: scroll;
}

.sidebar::-webkit-scrollbar {
    width: 0;
}

.sidebar-el-menu:not(.el-menu--collapse) {
    width: 250px;
}

.sidebar-el-menu {
    min-height: 100%;
}

.sidebar :deep([class^='el-icon-lx-']),
.sidebar :deep([class*=' el-icon-lx-']) {
    display: inline-block;
    width: 24px;
    margin-right: 6px;
    text-align: center;
    font-size: 16px;
}
</style>
