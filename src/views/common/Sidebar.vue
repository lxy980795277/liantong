<template>
	<div class="sidebar">
		<el-menu class="sidebar-el-menu" :default-active="onRoutes" :collapse="collapse" background-color="#324157"
			text-color="#bfcbd9" active-text-color="#20a0ff" unique-opened router>
			<template v-for="(item,i) in items">
				<template v-if="item.subs">
					<el-submenu class='el_menu' :index="item.index" :key="item.index">
						<template slot="title">
							<i :class="item.icon"></i><span slot="title">{{ item.title }}</span>
						</template>
						<template v-for="subItem in item.subs">
							<el-submenu v-if="subItem.subs" :index="subItem.index" :key="subItem.index">
								<template slot="title">{{ subItem.title }}</template>
								<el-menu-item v-for="(threeItem,i) in subItem.subs" :key="i" :index="threeItem.index">
									{{ threeItem.title }}
								</el-menu-item>
							</el-submenu>
							<el-menu-item v-else :index="subItem.index" :key="subItem.index">
								{{ subItem.title }}
							</el-menu-item>
						</template>
					</el-submenu>
				</template>
				<template v-else>
					<el-menu-item class='el_menu' :index="item.index" :key="item.index">
						<div v-if="i!=3"  >
							<i :class="item.icon"></i>
							<span slot="title">
								{{ item.title }}
							</span>
						</div>
						<div v-if="i==3"  @click = "show_wiki()">
							<i :class="item.icon"></i>
							<span slot="title">
								{{ item.title }}
							</span>
						</div>

						<!-- <img :src='item.img_src'  class = 'img_class'/><span slot="title">{{ item.title }}</span> -->
					</el-menu-item>
				</template>
			</template>
		</el-menu>
	</div>
</template>

<script>
	import bus from '../common/bus';
	export default {
		data() {
			return {
				collapse: false,
				items: [
					//               {
					//                   icon: 'el-icon-office-building',
					//                   index: 'homepage',
					//                   title: '首页',
					// img_src:'../../../static/icon/fruit/1.png',
					//               },
					{
						icon: 'el-icon-s-grid',
						index: 'View2d',
						title: '知识图谱',
						img_src: '../../../static/icon/fruit/1.png',
					},
					{
						icon: 'el-icon-s-data',
						index: 'search',
						title: '图谱检索',
						img_src: '../../../static/icon/fruit/1.png',
					},
					{
						icon: 'el-icon-s-data',
						index: 'ask',
						title: '智能问答',
						img_src: '../../../static/icon/fruit/1.png',
					},
					{
						icon: 'el-icon-bangzhu',
						index: 'wiki',
						title: '知识百科',
						img_src: '../../../static/icon/fruit/1.png',
					},
				]
			}
		},
		methods:{
			show_wiki(){
				window.open("http://10.100.46.14:18888/index.php/%E9%A6%96%E9%A1%B5","_blank"); 
				console.log("wiki百科已打开")
			}
		},
		computed: {
			onRoutes() {
				return this.$route.path.replace('/', '');
			}
		},
		created() {
			 
			// 通过 Event Bus 进行组件间通信，来折叠侧边栏
			bus.$on('collapse', msg => {
				this.collapse = msg;
			})
		}
	}
</script>

<style scoped>
	.sidebar {
		display: block;
		position: absolute;
		left: 0;
		top: 70px;
		bottom: 0;
		overflow-y: scroll;
		/* border:3px solid gold; */

	}

	.sidebar::-webkit-scrollbar {
		width: 0;
	}

	.sidebar-el-menu:not(.el-menu--collapse) {
		width: 130px;
		/* border:3px solid red; */
	}

	.sidebar>ul {
		height: 100%;
	}

	.el_menu {
		border-bottom: 1px solid #565656;
	}

	.img_class {
		height: 30px;
		width: 30px;
	}
</style>
