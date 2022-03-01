<template>
	<div class="s_container">
		<h3><a href="https://en.wikipedia.org/wiki/5G" target="_blank">loading……</a></h3>
		<div class='search_area'>
			<!-- <el-button style="margin-top: 15px;" @click="query">图数据切换，动态更新</el-button> -->
			<el-autocomplete style="width: 500px;" class="inline-input" v-model="input" :fetch-suggestions="querySearch"
				placeholder="请输入内容" :trigger-on-focus="true" @select="handleSelect" @clear="input_clear" clearable>
				<el-button slot="append" type="success" icon="el-icon-search" @click="query">搜索</el-button>
			</el-autocomplete>
			<el-button type="primary" style="margin-left:1000px;position: absolute;">
				<a href="http://10.100.46.14:18888/index.php/%E9%A6%96%E9%A1%B5" target="_blank"
					style="color:#ffffff;">内网知识百科</a>
			</el-button>
		</div>
		<div class='main'>
			<div class='graph' id='graph'>
				<keep-alive>
					<svg id="svg_left"></svg>
				</keep-alive>
			</div>
			<!-- <div class='labels'>
				<keep-alive>
					<svg id="svg_right"></svg>
				</keep-alive>
			</div> -->
			<div class='labels'>
				<ol>
					<li>
						<div class='label_font'><a href="" target="_blank">加载中……</a></div>
						<div class='abstract'>
							<p><img src=""></p>
							<div class="clearfix"></div>
						</div>
					</li>
					<li>
						<div class='label_font'><a href="" target="_blank">加载中……</a></div>
						<div class='abstract'>
							<p><img src=""></p>
							<div class="clearfix"></div>
						</div>

					</li>
					<li>
						<div class='label_font'><a href="" target="_blank">加载中……</a></div>
						<div class='abstract'>
							<p><img src=""></p>
							<div class="clearfix"></div>
						</div>
					</li>
					<li>
						<div class='label_font'><a href="" target="_blank">加载中……</a></div>
						<div class='abstract'>
							<p><img src=""></p>
							<div class="clearfix"></div>
						</div>

					</li>
					<li>
						<div class='label_font'><a href="" target="_blank">加载中……</a></div>
						<div class='abstract'>
							<p><img src=""></p>
							<div class="clearfix"></div>
						</div>
					</li>
					<li>
						<div class='label_font'><a href="" target="_blank">加载中……</a></div>
						<div class='abstract'>
							<p><img src=""></p>
							<div class="clearfix"></div>
						</div>
					</li>
				</ol>
			</div>
		</div>
	</div>
</template>

<script>
	import * as d3 from 'd3'
	export default {
		name: 'search',
		props: {

		},
		data() {
			return {
				input: "",
				input_results: [],
				data: require('../../data/test1.json'),
				label: require('../../data/population.json'),
				colors: ['#BA55D3', '#55cccc', '#d0d066', '#ff8c8e', '#32a7b1', '#59aa40', '#1E90FF', '#59aa40', '#ff8c8e',
					'#ca635f', '#a5a5a5'
				],
				labels: ["表因", "根因", "一级原因", "null", "一线动作", "体验"]
			}
		},
		watch: {
			// 当请求到新的数据时，重新渲染
			data(newData, oldData) {
				console.log(newData, oldData)
				// 移除svg和元素注册事件，防止内存泄漏
				d3.select("#svg_left").selectAll("g").remove()
				this.create_graph()
				// d3.select("#svg_right").selectAll("g").remove()
				// this.create_label(this.label, {
				// 	name: d => d.name,
				// 	value: d => 1000,
				// 	width: 500,
				// 	height: 500
				// })
			}
		},
		methods: {
			loadAll() {
				// console.dir(this.input)
				var res = this.getallnodes(1000).then((result) => {
					this.input_results = result
					// console.log("结果")
					// console.log(this.input_results)
				})

			},
			query() {
				console.log("查询")
				var res_length = 0
				this.GetNeo4jData(1000, this.input).then((length) => {
					res_length = length
					console.log("sada")
					console.log(res_length)
					if (res_length >= 1) {
						const h = this.$createElement;
						this.$message({
							message: h('p', null, [
								h('span', null, '查询成功,节点个数为 :  '),
								h('i', {
									style: 'color: teal'
								}, res_length)
							]),
							center: true,
							type: 'success'
						});
					} else {
						const h = this.$createElement;
						this.$message({
							message: h('p', null, [
								h('span', {
									style: 'color:teal'
								}, '未找到该节点，或该节点无关联边 :  '),
								h('i', {
									style: 'color: red'
								}, "请检查关键字")
							]),
							center: true,
							type: 'error'
						});
					}
				})
				this.wiki_api(this.input)
			},
			async getallnodes(limit_items) {
				const db = { // 数据库连接配置：
					// url: 'bolt://127.0.0.1:7687/', // 这里必须是bolt的地址 不能是localhost的地址
					url: 'bolt://123.56.133.187:7687/', //请注意，在浏览器打开时候前缀必须为http，不能为https，原因暂时未知
					user: 'neo4j', // 		数据库用户名(默认neo4j，修改成自己的)
					password: 'neo4jneo4j' // 		数据库密码（默认ne4oj，修改成自己的）
				}
				const start = new Date()
				const neo4j = require('neo4j-driver')
				const driver = neo4j.driver(db.url, neo4j.auth.basic(db.user, db.password))
				const session = driver.session()
				const label_result = await session.run(
					'CALL db.labels() '
				);
				var label_number = label_result.records.length
				var label = []

				for (let i = 0; i < label_number; i++) {
					label.push(label_result.records[i]._fields[0])
				}


				var node_result = []
				for (let i = 0; i < label.length; i++) {
					var tmp = await session.run(
						'MATCH (p:' + label[i] + ') RETURN p ' +
						'LIMIT $limit_items ', {
							limit_items: neo4j.int(limit_items)
						}
					);
					for (let j = 0; j < tmp.records.length; j++) {
						let t = {}
						t["value"] = tmp.records[j]._fields[0].properties.name
						node_result.push(t)
					}
				}
				return node_result
			},

			querySearch(queryString, cb) {
				var res = this.input_results
				var results = queryString ? res.filter(this.createFilter(queryString)) : res
				// 调用 callback 返回建议列表的数据
				cb(results)
			},
			createFilter(queryString) {
				return (res) => {
					return (res.value.toLowerCase().indexOf(queryString.toLowerCase()) !== -1)
				}
			},
			handleSelect(item) {
				console.log(item)
			},
			input_clear() {
				this.$message({
					message: '清空输入框',
					center: true,
				});
			},
			addMarkers() {
				// 定义箭头的标识
				var svgDom = d3.select("#svg_left")
				var defs = svgDom.append("defs")
				const posMarker = defs.append("marker")
					.attr("id", "posMarker")
					.attr("orient", "auto")
					.attr("stroke-width", 2)
					.attr("markerUnits", "strokeWidth")
					.attr("markerUnits", "strokeWidth")
					.attr("viewBox", "0 -5 400 400")
					.attr("refX", 190)
					.attr("refY", 30)
					.attr("markerWidth", 20)
					.attr("markerHeight", 20)
					.append("path")
					//.attr("d", "M 0 -5 L 10 0 L 0 5")
					.attr("d", "M 0 0 L 30 30 L 0 60 ")
					.attr('fill', '#b4b5a9')
					.attr("stroke-opacity", 1);
				// const posActMarker = defs.append("marker")   //这是当鼠标移动到节点上的时候
				//   .attr("id", "posActMarker")
				//   .attr("orient", "auto")
				//   .attr("stroke-width", 2)
				//   .attr("markerUnits", "strokeWidth")
				//   .attr("markerUnits", "userSpaceOnUse")
				//   .attr("viewBox", "0 -5 10 10")
				//   .attr("refX", 31)
				//   .attr("refY", 0)
				//   .attr("markerWidth", 12)
				//   .attr("markerHeight", 12)
				//   .append("path")
				//  .attr("d","M 0 5 L 8 0 L 0 -5")
				//   .attr('fill', '#ffd918')
				//   .attr("stroke-opacity", 0.6);
				// const negMarker = defs.append("marker")
				//   .attr("id","negMarker")
				//   .attr("orient","auto")
				//   .attr("stroke-width",2)
				//   .attr("markerUnits", "strokeWidth")
				//   .attr("markerUnits", "userSpaceOnUse")
				//   .attr("viewBox", "0 -5 10 10")
				//   .attr("refX", -25)
				//   .attr("refY", 0)
				//   .attr("markerWidth", 12)
				//   .attr("markerHeight", 12)
				//   .append("path")
				//   .attr("d", "M 10 -5 L 0 0 L 10 5")
				//   .attr('fill', '#999')
				//   .attr("stroke-opacity", 0.6);
			},
			create_label(data, {
				name = ([x]) => x, // given d in data, returns the (ordinal) label
				value = ([, y]) => y, // given d in data, returns the (quantitative) value
				title, // given d in data, returns the title text
				width = 640, // outer width, in pixels
				height = 400, // outer height, in pixels
				innerRadius = Math.min(width, height) / 3, // inner radius of pie, in pixels (non-zero for donut)
				// innerRadius = 0, // inner radius of pie, in pixels (non-zero for donut)
				outerRadius = Math.min(width, height) / 2, // outer radius of pie, in pixels
				labelRadius = (innerRadius + outerRadius) / 2, // center radius of labels
				format = ",", // a format specifier for values (in the label)
				names, // array of names (the domain of the color scale)
				colors, // array of colors for names
				stroke = innerRadius > 0 ? "none" : "white", // stroke separating widths
				strokeWidth = 1, // width of stroke separating wedges
				strokeLinejoin = "round", // line join of stroke separating wedges
				padAngle = stroke === "none" ? 1 / outerRadius : 0, // angular separation between wedges
			} = {}) {
				// Compute values.
				const N = d3.map(data, name);
				const V = d3.map(data, value);
				const I = d3.range(N.length).filter(i => !isNaN(V[i]));

				// Unique the names.
				if (names === undefined) names = N;
				names = new d3.InternSet(names);

				// Chose a default color scheme based on cardinality.
				if (colors === undefined) colors = d3.schemeSpectral[names.size];
				if (colors === undefined) colors = d3.quantize(t => d3.interpolateSpectral(t * 0.8 + 0.1), names.size);

				// Construct scales.
				const color = d3.scaleOrdinal(names, colors);

				// Compute titles.
				if (title === undefined) {
					const formatValue = d3.format(format);
					title = i => `${N[i]}\n${formatValue(V[i])}`;
				} else {
					const O = d3.map(data, d => d);
					const T = title;
					title = i => T(O[i], i, data);
				}

				// Construct arcs.
				const arcs = d3.pie().padAngle(padAngle).sort(null).value(i => V[i])(I);
				const arc = d3.arc().innerRadius(innerRadius).outerRadius(outerRadius);
				const arcLabel = d3.arc().innerRadius(labelRadius).outerRadius(labelRadius);

				const svg = d3.select("#svg_right")
					.attr("viewBox", [-340, -150, 660, 330])
				// .attr("style", "max-width: 100%; height: auto; height: intrinsic;");
				// 
				svg.append("g")
					.attr("stroke", stroke)
					.attr("stroke-width", strokeWidth)
					.attr("stroke-linejoin", strokeLinejoin)
					.selectAll("path")
					.data(arcs)
					.join("path")
					.attr("fill", d => {
						d.color = color(N[d.data])
						return color(N[d.data])
					})
					.attr("d", arc)
					.append("title")
					.text(d => title(d.data));
				// console.log(arcs)
				svg.append("g")
					.attr("font-family", "sans-serif")
					.attr("font-size", 12)
					.attr("fill", "#000000")
					.attr("text-anchor", "middle")
					.selectAll("text")
					.data(arcs)
					.join("text")
					.attr("transform", d => `translate(${arcLabel.centroid(d)})`)
					.selectAll("tspan")
					.data(d => {
						const lines = `${title(d.data)}`.split(/\n/);
						// console.log(lines.slice(0, 1))
						// return (d.endAngle - d.startAngle) > 0.25 ? lines : lines.slice(0, 1);
						return lines.slice(0, 1)

					})

					.join("tspan")
					.attr("x", 0)
					.attr("y", (_, i) => `${i * 1.1}em`)
					.attr("font-weight", (_, i) => i ? null : "bold")
					.text(function(d, i) {
						var res = d
						if (d.length >= 7) {
							res = d.substring(0, 7) + "..."
						}
						return res
					});

				// console.log(data.column)

				svg.append("g")
					.selectAll("g")
					.data(data)
					.join("g")
					.attr("transform", (d, i) => `translate(-55,${i * 30-140})`)
					.call(g => g.append("rect")
						.attr("width", 18)
						.attr("height", 18)
						.attr("fill", function(d, i) {
							// console.log(color(N[d.data]))
							if (i > 9) {
								return 'none'
							} else {
								return color(N[i])
							}
						}))
					.call(g => g.append("text")
						.attr("x", 24)
						.attr("y", 9)
						.attr("dy", "0.35em")
						.text(function(d, i) {
							if (i == 9) {
								return "........."
							}
							if (i > 9) {
								return ""
							} else {
								if (d.name.length >= 7) {
									d.name = d.name.substring(0, 7) + "..."
								}
								return d.name
							}

						})
						.attr("fill", () => '#fff') //字体颜色
						.attr("font-size", "14px")
						.attr("font-weight", "bolder")
					)

				return Object.assign(svg.node(), {
					scales: {
						color
					}
				});
			},
			create_graph() {
				var _this = this
				var forceCollide = d3.forceCollide()
					.radius(d => {
						return 70
					})
					.iterations(0.15)
					.strength(0.75)
				var data_origin = this.data
				var data = data_origin
				const root = d3.hierarchy(data);
				const links = root.links();
				const nodes = root.descendants();
				const simulation = d3.forceSimulation(nodes)
					.force("link", d3.forceLink(links).id(d => d.id).distance(200).strength(0.8))
					.force("charge", d3.forceManyBody(-100).strength(-50))
					.force("x", d3.forceX())
					.force("y", d3.forceY())
					.force("collision", forceCollide);

				this.addMarkers()
				const svg = d3
					.select("#svg_left")
					.attr("viewBox", [-350, -150, 700, 350])

				const link = svg.append("g")
					.selectAll("line")
					.data(links)
					.join("line")
					.attr("stroke", "#999")
					.attr("stroke-width", "5px")
					.attr("stroke-opacity", 0.6)
					.join("path") //join是第五版d3的新方法 =enter.append("").attr("","").exit.remove()
					.attr("marker-end", "url(#posMarker)");

				const g_node = svg
					.append("g")
					.selectAll("g.eachnode")
					.data(nodes)
				const g_link = svg
					.append("g")
					.selectAll("g.eachnode")
					.data(links)

				const each_node = g_node
					.enter()
					.append("g")
					.attr("class", "eachnode")
				const each_link = g_link
					.enter()
					.append("g")
					.attr("class", "eachlink")

				const node = each_node
					.append("circle")
					// .attr("fill", d => d.children ? "#59aa40" : "#32a7b1")
					.attr("fill", function(d) {
						if (d.children) {
							return "#32a7b1";
						} else {
							// console.log(d.data.relation_name)
							var labels = _this.labels
							var colors = _this.colors
							for (let i = 0; i < labels.length; i++) {
								if (d.data.relation_name == labels[i]) {
									return colors[i];
								}
							}
							return colors[7]
						}
					})
					.attr("stroke", d => d.children ? null : "#fff")
					.attr("stroke-width", "3px")
					.attr("r", 40)
					.call(this.drag(simulation));


				const text = each_node
					.append("text")
					.attr("font-size", () => 14) //字体大小
					.attr("fill", () => '#fff') //字体颜色 
					.attr("font-weight", "bold")
					.attr('name', d => d.data.name) //显示的内容 
					.attr("text-anchor", "middle") //居中显示
					.attr("x", function(d) {
						return textBreaking(d3.select(this), d.data.name)
					})
					.call(this.drag(simulation));

				const linksName = each_link
					.append("text")
					.attr('text-anchor', 'middle')
					.attr('fill', '#ebebeb')
					.attr("font-size", () => 12)
					.attr('font-weight', 'bold')
					.text(d => {
						var string = d.target.data.relation_name
						if (string.length > 8) {
							string = string.substring(0, 8) + "..."
						}
						return string
					})


				node.append("title") //鼠标移动上去会显示的title
					.text(d => d.data.name)
					.attr("fill", () => '#fff') //字体颜色
					.attr("font-weight", "normal")
					.attr("text-anchor", "middle") //居中显示 

				simulation.on("tick", () => {
					link
						.attr("x1", d => d.source.x)
						.attr("y1", d => d.source.y)
						.attr("x2", d => d.target.x)
						.attr("y2", d => d.target.y);

					node
						.attr("cx", d => d.x)
						.attr("cy", d => d.y);
					text.attr('transform', function(d) {
						return 'translate(' + d.x + ',' + (d.y + 5) + ')'
					})
					linksName
						.attr('transform', d => {
							let x = Math.min(d.source.x, d.target.x) + Math.abs(d.source.x - d.target.x) / 2
							let y = Math.min(d.source.y, d.target.y) + Math.abs(d.source.y - d.target.y) / 2 -
								1
							// tanA = a / b
							// A = arctan(tanA)
							let tanA = Math.abs(d.source.y - d.target.y) / Math.abs(d.source.x - d.target.x)
							let angle = Math.atan(tanA) / Math.PI * 180
							// let angle = Math.atan2(1,1)/Math.PI*180
							// console.log(angle)
							// 第一、二象限额外处理
							if (d.source.x > d.target.x) {
								// 第二象限
								if (d.source.y <= d.target.y) {
									angle = -angle
								}
								// else {  // 第三象限
								//   angle = angle
								// }
							} else if (d.source.y > d.target.y) {
								// 第一象限
								angle = -angle
							}
							return 'translate(' + x + ',' + (y - 10) + ')' + 'rotate(' + angle + ')'
						})
				});

				function textBreaking(d3text, text) {
					// console.log("text")
					// console.log(text)
					const len = text.length
					if (len <= 4) {
						d3text.append('tspan')
							.attr('x', 0)
							.attr('y', 2)
							.text(text)
					} else {
						const topText = text.substring(0, 3) //第一行显示3个字
						const midText = text.substring(3, 7) //第二行显示4个字
						let botText = text.substring(7, len) //第三行显示最多4个字
						let topY = -16
						let midY = 0
						let botY = 16
						if (len <= 7) {
							topY += 10
							midY += 10
						} else if (len > 10) {
							botText = text.substring(7, 9) + '...' // 三行最多10字 超过了显示省略号
						}

						d3text.text('')
						d3text.append('tspan')
							.attr('x', 0)
							.attr('y', topY)
							.text(function() {
								return topText
							})
						d3text.append('tspan')
							.attr('x', 0)
							.attr('y', midY)
							.text(function() {
								return midText
							})
						d3text.append('tspan')
							.attr('x', 0)
							.attr('y', botY)
							.text(function() {
								return botText
							})
					}
				}
			},
			drag(simulation) {

				function dragstarted(event, d) {
					if (!event.active) simulation.alphaTarget(0.3).restart();
					d.fx = d.x;
					d.fy = d.y;
				}

				function dragged(event, d) {
					d.fx = event.x;
					d.fy = event.y;
				}

				function dragended(event, d) {
					if (!event.active) simulation.alphaTarget(0);
					d.fx = null;
					d.fy = null;
				}

				return d3.drag()
					.on("start", dragstarted)
					.on("drag", dragged)
					.on("end", dragended);
			},
			async GetNeo4jData(limit_items, keywords) {
				// 当前的问题是 从数据库直接读取数据后，获得的是records类型的数据
				// 需要转变为json类型的数据才方便处理 否则无法正常使用
				// 当前的解决办法是 直接手动从neo4j中导出为json类型数据 并且保存到data文件夹下面
				const db = { // 数据库连接配置：
					// url: 'bolt://127.0.0.1:7687/', // 这里必须是bolt的地址 不能是localhost的地址
					url: 'bolt://123.56.133.187:7687/', //请注意，在浏览器打开时候前缀必须为http，不能为https，原因暂时未知
					user: 'neo4j', // 		数据库用户名(默认neo4j，修改成自己的)
					password: 'neo4jneo4j' // 		数据库密码（默认ne4oj，修改成自己的）
				}
				const start = new Date()
				const neo4j = require('neo4j-driver')
				const driver = neo4j.driver(db.url, neo4j.auth.basic(db.user, db.password))
				const session = driver.session()

				// const result = await session.run(
				// 	'MATCH p = ()-[]->() ' +
				// 'RETURN p ' +'LIMIT $limit_items ', {
				// 	limit_items: neo4j.int(limit_items)
				// }
				// );
				const result = await session.run(
					'match p=(n{name:' + "'" + keywords + "'" + '})-[]-()return p ' +
					'LIMIT $limit_items ', {
						limit_items: neo4j.int(limit_items)
					}
				);

				var number = result.records.length
				console.log('结果数据共计的条数为' + number.toString())
				console.log(result)
				var res = {}
				var children = []
				res["name"] = keywords
				for (var i = 0; i < number; i++) {
					var tmp = {}
					tmp["name"] = result.records[i].get('p').segments[0].end.properties.name
					tmp["relation_type"] = result.records[i].get('p').segments[0].relationship.type
					tmp["relation_name"] = result.records[i].get('p').segments[0].relationship.properties.name
					children.push(tmp)
				}
				res["children"] = children
				console.log(res)
				this.label = children
				this.data = res
				return number
			},
			zhTransform(str, type) {
				let zh_cn_str =
					'皑蔼碍爱翱袄奥坝罢摆败颁办绊帮绑镑谤剥饱宝报鲍辈贝钡狈备惫绷笔毕毙闭边编贬变辩辫鳖瘪濒滨宾摈饼拨钵铂驳卜补参蚕残惭惨灿苍舱仓沧厕侧册测层诧搀掺蝉馋谗缠铲产阐颤场尝长偿肠厂畅钞车彻尘陈衬撑称惩诚骋痴迟驰耻齿炽冲虫宠畴踌筹绸丑橱厨锄雏础储触处传疮闯创锤纯绰辞词赐聪葱囱从丛凑窜错达带贷担单郸掸胆惮诞弹当挡党荡档捣岛祷导盗灯邓敌涤递缔点垫电淀钓调迭谍叠钉顶锭订东动栋冻斗犊独读赌镀锻断缎兑队对吨顿钝夺鹅额讹恶饿儿尔饵贰发罚阀珐矾钒烦范贩饭访纺飞废费纷坟奋愤粪丰枫锋风疯冯缝讽凤肤辐抚辅赋复负讣妇缚该钙盖干赶秆赣冈刚钢纲岗皋镐搁鸽阁铬个给龚宫巩贡钩沟构购够蛊顾剐关观馆惯贯广规硅归龟闺轨诡柜贵刽辊滚锅国过骇韩汉阂鹤贺横轰鸿红后壶护沪户哗华画划话怀坏欢环还缓换唤痪焕涣黄谎挥辉毁贿秽会烩汇讳诲绘荤浑伙获货祸击机积饥讥鸡绩缉极辑级挤几蓟剂济计记际继纪夹荚颊贾钾价驾歼监坚笺间艰缄茧检碱硷拣捡简俭减荐槛鉴践贱见键舰剑饯渐溅涧浆蒋桨奖讲酱胶浇骄娇搅铰矫侥脚饺缴绞轿较秸阶节茎惊经颈静镜径痉竞净纠厩旧驹举据锯惧剧鹃绢杰洁结诫届紧锦仅谨进晋烬尽劲荆觉决诀绝钧军骏开凯颗壳课垦恳抠库裤夸块侩宽矿旷况亏岿窥馈溃扩阔蜡腊莱来赖蓝栏拦篮阑兰澜谰揽览懒缆烂滥捞劳涝乐镭垒类泪篱离里鲤礼丽厉励砾历沥隶俩联莲连镰怜涟帘敛脸链恋炼练粮凉两辆谅疗辽镣猎临邻鳞凛赁龄铃凌灵岭领馏刘龙聋咙笼垄拢陇楼娄搂篓芦卢颅庐炉掳卤虏鲁赂禄录陆驴吕铝侣屡缕虑滤绿峦挛孪滦乱抡轮伦仑沦纶论萝罗逻锣箩骡骆络妈玛码蚂马骂吗买麦卖迈脉瞒馒蛮满谩猫锚铆贸么霉没镁门闷们锰梦谜弥觅绵缅庙灭悯闽鸣铭谬谋亩钠纳难挠脑恼闹馁腻撵捻酿鸟聂啮镊镍柠狞宁拧泞钮纽脓浓农疟诺欧鸥殴呕沤盘庞国爱赔喷鹏骗飘频贫苹凭评泼颇扑铺朴谱脐齐骑岂启气弃讫牵扦钎铅迁签谦钱钳潜浅谴堑枪呛墙蔷强抢锹桥乔侨翘窍窃钦亲轻氢倾顷请庆琼穷趋区躯驱龋颧权劝却鹊让饶扰绕热韧认纫荣绒软锐闰润洒萨鳃赛伞丧骚扫涩杀纱筛晒闪陕赡缮伤赏烧绍赊摄慑设绅审婶肾渗声绳胜圣师狮湿诗尸时蚀实识驶势释饰视试寿兽枢输书赎属术树竖数帅双谁税顺说硕烁丝饲耸怂颂讼诵擞苏诉肃虽绥岁孙损笋缩琐锁獭挞抬摊贪瘫滩坛谭谈叹汤烫涛绦腾誊锑题体屉条贴铁厅听烃铜统头图涂团颓蜕脱鸵驮驼椭洼袜弯湾顽万网韦违围为潍维苇伟伪纬谓卫温闻纹稳问瓮挝蜗涡窝呜钨乌诬无芜吴坞雾务误锡牺袭习铣戏细虾辖峡侠狭厦锨鲜纤咸贤衔闲显险现献县馅羡宪线厢镶乡详响项萧销晓啸蝎协挟携胁谐写泻谢锌衅兴汹锈绣虚嘘须许绪续轩悬选癣绚学勋询寻驯训讯逊压鸦鸭哑亚讶阉烟盐严颜阎艳厌砚彦谚验鸯杨扬疡阳痒养样瑶摇尧遥窑谣药爷页业叶医铱颐遗仪彝蚁艺亿忆义诣议谊译异绎荫阴银饮樱婴鹰应缨莹萤营荧蝇颖哟拥佣痈踊咏涌优忧邮铀犹游诱舆鱼渔娱与屿语吁御狱誉预驭鸳渊辕园员圆缘远愿约跃钥岳粤悦阅云郧匀陨运蕴酝晕韵杂灾载攒暂赞赃脏凿枣灶责择则泽贼赠扎札轧铡闸诈斋债毡盏斩辗崭栈战绽张涨帐账胀赵蛰辙锗这贞针侦诊镇阵挣睁狰帧郑证织职执纸挚掷帜质钟终种肿众诌轴皱昼骤猪诸诛烛瞩嘱贮铸筑驻专砖转赚桩庄装妆壮状锥赘坠缀谆浊兹资渍踪综总纵邹诅组钻致钟么为只凶准启板里雳余链泄';
				let zh_tw_str =
					'皚藹礙愛翺襖奧壩罷擺敗頒辦絆幫綁鎊謗剝飽寶報鮑輩貝鋇狽備憊繃筆畢斃閉邊編貶變辯辮鼈癟瀕濱賓擯餅撥缽鉑駁蔔補參蠶殘慚慘燦蒼艙倉滄廁側冊測層詫攙摻蟬饞讒纏鏟産闡顫場嘗長償腸廠暢鈔車徹塵陳襯撐稱懲誠騁癡遲馳恥齒熾沖蟲寵疇躊籌綢醜櫥廚鋤雛礎儲觸處傳瘡闖創錘純綽辭詞賜聰蔥囪從叢湊竄錯達帶貸擔單鄲撣膽憚誕彈當擋黨蕩檔搗島禱導盜燈鄧敵滌遞締點墊電澱釣調叠諜疊釘頂錠訂東動棟凍鬥犢獨讀賭鍍鍛斷緞兌隊對噸頓鈍奪鵝額訛惡餓兒爾餌貳發罰閥琺礬釩煩範販飯訪紡飛廢費紛墳奮憤糞豐楓鋒風瘋馮縫諷鳳膚輻撫輔賦複負訃婦縛該鈣蓋幹趕稈贛岡剛鋼綱崗臯鎬擱鴿閣鉻個給龔宮鞏貢鈎溝構購夠蠱顧剮關觀館慣貫廣規矽歸龜閨軌詭櫃貴劊輥滾鍋國過駭韓漢閡鶴賀橫轟鴻紅後壺護滬戶嘩華畫劃話懷壞歡環還緩換喚瘓煥渙黃謊揮輝毀賄穢會燴彙諱誨繪葷渾夥獲貨禍擊機積饑譏雞績緝極輯級擠幾薊劑濟計記際繼紀夾莢頰賈鉀價駕殲監堅箋間艱緘繭檢堿鹼揀撿簡儉減薦檻鑒踐賤見鍵艦劍餞漸濺澗漿蔣槳獎講醬膠澆驕嬌攪鉸矯僥腳餃繳絞轎較稭階節莖驚經頸靜鏡徑痙競淨糾廄舊駒舉據鋸懼劇鵑絹傑潔結誡屆緊錦僅謹進晉燼盡勁荊覺決訣絕鈞軍駿開凱顆殼課墾懇摳庫褲誇塊儈寬礦曠況虧巋窺饋潰擴闊蠟臘萊來賴藍欄攔籃闌蘭瀾讕攬覽懶纜爛濫撈勞澇樂鐳壘類淚籬離裏鯉禮麗厲勵礫曆瀝隸倆聯蓮連鐮憐漣簾斂臉鏈戀煉練糧涼兩輛諒療遼鐐獵臨鄰鱗凜賃齡鈴淩靈嶺領餾劉龍聾嚨籠壟攏隴樓婁摟簍蘆盧顱廬爐擄鹵虜魯賂祿錄陸驢呂鋁侶屢縷慮濾綠巒攣孿灤亂掄輪倫侖淪綸論蘿羅邏鑼籮騾駱絡媽瑪碼螞馬罵嗎買麥賣邁脈瞞饅蠻滿謾貓錨鉚貿麽黴沒鎂門悶們錳夢謎彌覓綿緬廟滅憫閩鳴銘謬謀畝鈉納難撓腦惱鬧餒膩攆撚釀鳥聶齧鑷鎳檸獰甯擰濘鈕紐膿濃農瘧諾歐鷗毆嘔漚盤龐國愛賠噴鵬騙飄頻貧蘋憑評潑頗撲鋪樸譜臍齊騎豈啓氣棄訖牽扡釺鉛遷簽謙錢鉗潛淺譴塹槍嗆牆薔強搶鍬橋喬僑翹竅竊欽親輕氫傾頃請慶瓊窮趨區軀驅齲顴權勸卻鵲讓饒擾繞熱韌認紉榮絨軟銳閏潤灑薩鰓賽傘喪騷掃澀殺紗篩曬閃陝贍繕傷賞燒紹賒攝懾設紳審嬸腎滲聲繩勝聖師獅濕詩屍時蝕實識駛勢釋飾視試壽獸樞輸書贖屬術樹豎數帥雙誰稅順說碩爍絲飼聳慫頌訟誦擻蘇訴肅雖綏歲孫損筍縮瑣鎖獺撻擡攤貪癱灘壇譚談歎湯燙濤縧騰謄銻題體屜條貼鐵廳聽烴銅統頭圖塗團頹蛻脫鴕馱駝橢窪襪彎灣頑萬網韋違圍爲濰維葦偉僞緯謂衛溫聞紋穩問甕撾蝸渦窩嗚鎢烏誣無蕪吳塢霧務誤錫犧襲習銑戲細蝦轄峽俠狹廈鍁鮮纖鹹賢銜閑顯險現獻縣餡羨憲線廂鑲鄉詳響項蕭銷曉嘯蠍協挾攜脅諧寫瀉謝鋅釁興洶鏽繡虛噓須許緒續軒懸選癬絢學勳詢尋馴訓訊遜壓鴉鴨啞亞訝閹煙鹽嚴顔閻豔厭硯彥諺驗鴦楊揚瘍陽癢養樣瑤搖堯遙窯謠藥爺頁業葉醫銥頤遺儀彜蟻藝億憶義詣議誼譯異繹蔭陰銀飲櫻嬰鷹應纓瑩螢營熒蠅穎喲擁傭癰踴詠湧優憂郵鈾猶遊誘輿魚漁娛與嶼語籲禦獄譽預馭鴛淵轅園員圓緣遠願約躍鑰嶽粵悅閱雲鄖勻隕運蘊醞暈韻雜災載攢暫贊贓髒鑿棗竈責擇則澤賊贈紮劄軋鍘閘詐齋債氈盞斬輾嶄棧戰綻張漲帳賬脹趙蟄轍鍺這貞針偵診鎮陣掙睜猙幀鄭證織職執紙摯擲幟質鍾終種腫衆謅軸皺晝驟豬諸誅燭矚囑貯鑄築駐專磚轉賺樁莊裝妝壯狀錐贅墜綴諄濁茲資漬蹤綜總縱鄒詛組鑽緻鐘麼為隻兇準啟闆裡靂餘鍊洩';
				// 转换后返回的字符串
				let result_str = '';
				// 需要对每一个文字进行判断和转换
			 for (let i = 0; i < str.length; i++) {
					// 返回指定位置的字符
					let chat = str.charAt(i);
					// 找到对应中文字符的位置（区分结果类型）
					if (type == 'simplified') {
						// 从繁体字符串里面找对应文字的位置
						let str_index = zh_tw_str.indexOf(chat);
						// 将字符拼接起来，如果没在对应的字符串中找到，说明该文字是通用的或者不是繁体文字，否则替换对应的文字
						result_str += str_index < 0 ? chat : zh_cn_str.charAt(str_index);
					} else if (type == 'traditional') {
						// 从简体字符串里面找对应文字的位置
						let str_index = zh_cn_str.indexOf(chat);
						// 将字符拼接起来，如果没在对应的字符串中找到，说明该文字是通用的或者不是简体文字，否则替换对应的文字
						result_str += str_index < 0 ? chat : zh_tw_str.charAt(str_index);
					}
				}
				return result_str;
			},
			wiki_api(search_param) {
				var that = this
				var url = "https://en.wikipedia.org/w/api.php";
				var zh_url =
					"https://zh.wikipedia.org/w/api.php?format=json&action=query&generator=search&gsrnamespace=0&gsrlimit=10&prop=pageimages|extracts&pilimit=max&exintro&explaintext&exsentences=1&exlimit=max&origin=*&gsrsearch=";
				//https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=5G&utf8=1&format=json

				var params = {
					action: "query",
					list: "search",
					srsearch: "Nelson Mandela",
					format: "json"
				};

				var test = "http://en.wikipedia.org/wiki/" + encodeURIComponent("5G")
				console.log(test)

				// Object.keys(params).forEach(function(key) {
				// 	url += "&" + key + "=" + params[key];
				// });
				// var url_params = {
				// 	format: "json",
				// 	action: "query",
				// 	generator:"search",
				// 	gsrnamespace:"0",
				// 	gsrlimit:"10",
				// 	prop:"pageimages|extracts",
				// 	pilimit:"max",
				// 	// exintro : "",
				// 	// explaintext : "",
				// 	exsentences : "10",
				// 	exlimit : "max",
				// 	gsrsearch:"fuck"
				// }
				zh_url = zh_url + search_param
				console.log(zh_url)
				fetch(zh_url)
					.then(function(response) {
						// console.log(response.json())
						return response.json().then(function(json) {
							var each_result = []
							var ids = [];
							for (var pageid in json.query.pages) {
								ids.push(pageid);
							}
							var query_result = json.query.pages
							for (let i = 0; i < ids.length; i++) {
								var tmp = json.query.pages[ids[i]]
								var title = json.query.pages[ids[i]].title
								var url = "http://zh.wikipedia.org/wiki/" + encodeURIComponent(tmp.title);
								var img_url = ""
								var listcontent = "";
								var extract = json.query.pages[ids[i]].extract
								if (tmp.thumbnail) {
									img_url = tmp.thumbnail.source
									listcontent = "<img src='" + img_url + "'>";
								}
								tmp["url"] = url
								tmp["img_url"] = img_url
								each_result.push(tmp)
								// console.log(document.getElementById(i))
								var list = $(".labels ol li ").eq(i);
								console.log(extract.length)
								if (extract.length > 100) {
									extract = extract.substring(0, 150) + "......"
								}
								title = that.zhTransform(title, "simplified")
								extract = that.zhTransform(extract, "simplified")
								list.find('a').text(title).attr('href', url);
								list.find('p').html(listcontent);
								list.find('.clearfix').text(extract);
							}
							console.log(each_result)
						})
					})
					.then(function(response) {
						if (response.query.search[0].title === "Nelson Mandela") {
							console.log("Your search page 'Nelson Mandela' exists on English Wikipedia");
						}
					})
				// .catch(function(error) {
				// 	const h = that.$createElement;
				// 		that.$message({
				// 			message: h('p', null, [
				// 				h('span', {
				// 					style: 'color:teal'
				// 				}, '无法链接到wiki百科，查询无响应 :  '),
				// 				h('i', {
				// 					style: 'color: red'
				// 				}, "请检查VPN是否开启")
				// 			]),
				// 			center: true,
				// 			type: 'error'
				// 		});
				// 		console.log(error);
				// 	});

			},

		},

		mounted() {
			this.loadAll()
			this.create_graph()
			this.wiki_api("5G通信")
			// this.create_label(this.label, {
			// 	name: d => d.name,
			// 	value: d => 1000,
			// 	width: 500,
			// 	height: 500
			// })
			// this.wiki_api()
		}
	}
</script>

<style>
	ol {
		list-style: none;
	}

	.s_container {
		display: flex;
		flex-direction: column;
		background-color: #034C6A;
		height: 100%;
		width: 100%;

	}

	.search_area {
		/* border: 3px solid red; */
		width: 100%;
		height: 10%;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.main {
		flex: 1;
		/* border: 5px solid red; */
		display: flex;
		flex-direction: row;
		overflow: hidden;

	}

	.graph {
		/* border:2px solid red; */
		display: flex;
		align-items: center;
		justify-content: center;
		/* overflow: hidden; */
		background-color: #034C6A;
		height: 100%;
		width: 50%;
	}

	.labels {
		background-color: #034C6A;
		flex: 1;
		display: flex;
		align-items: center;
		/* justify-content: center; */
		padding-left: 50px;
		/* border: 5px dashed grey; */
		/* padding: 0px; */
	}

	.abstract {
		display: flex;
		flex-direction: row;
		/* border:3px solid green; */
		border-bottom: 1px solid rgb(223, 215, 215, 0.3);
		margin-bottom: 15px;
	}

	.clearfix {
		/* border:3px solid red; */
		padding-left: 5px;
		padding-right: 10px;
		width: 100%;

	}

	/* 	.labels ol li a {
		color: #ffffff;
		text-decoration: underline;
	} */
	.labels ol li a:link {
		color: #b8b8b8;
	}

	.labels ol li a:visited {
		color: #cd35ff;
	}

	.clearfix {
		color: #ffffff;
		font-size: 15px;
	}


	.label_font {
		color: #ffffff;
		font-size: 20px;
		font-weight: bold;
	}

	#svg_left {
		width: 100%;
		height: 100%;
		border: 1px dashed grey;
	}

	#svg_right {
		width: 100%;
		height: 100%;
	}
</style>
