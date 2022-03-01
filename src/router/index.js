import Vue from 'vue'
import VueRouter from 'vue-router'
// import Home from '../views/Home.vue'
import View2d from '../views/pages/2dView.vue'
import Home from '../views/common/Home.vue'
import dc_dbs from '../views/pages/dc_dbs.vue'
import search from '../views/pages/search.vue'
import homepage from '../views/pages/homepage.vue'
import ask from '../views/pages/ask.vue'
import wiki from '../views/pages/wiki.vue'

Vue.use(VueRouter)

const routes = [
	{
		path: '/',
		name: 'Home',
		component: Home,
		meta: {
			title: '首页'
		},
		children: [{
				path: '/View2d',
				name: 'View2d',
				component: View2d,
				meta: {
					title: '知识图谱'
				}
			},
			{
				path: '/dc_dbs',
				name: 'dc_dbs',
				component: dc_dbs,
				meta: {
					title: '文档数据库'
				}
			},
			{
				path: '/search',
				name: 'search',
				component: search,
				meta: {
					title: '图谱检索'
				}

			},
			{
				path: '/ask',
				name: 'ask',
				component: ask,
				meta: {
					title: '智能问答'
				}

			},
			{
				path: '/wiki',
				name: 'wiki',
				component: wiki,
				meta: {
					title: '智能问答'
				}
			
			},


		]
	},
]

const router = new VueRouter({
	// mode: 'history',
	routes
})

export default router
