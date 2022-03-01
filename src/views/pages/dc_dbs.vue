<template>
	<div id='svgContainer' ref='svgContainer' style="">
		<div class="treeDiagram" ref='treeDiagram' id="treeDiagram"></div>
	</div>
</template>
<script>
	import * as d3 from 'd3'
	export default {
		data() {
			return {
				tree: null,
				root: {},
				svg: null,
				margin: {
					top: 90,
					bottom: 0,
					left: 10,
					right: 0
				},
				// rect_colors:["#f58f98","#c79329","#fcaf17","#6f60aa","#b2d235","#94d6da","#faa755","#826858","#78cdd1","#7fb80e"],
				rect_colors: ['#c79329', '#BA55D3', '#55cccc', '#aaaaff', '#4e88af', '#ca635f', '#FFC0CB', '#1E90FF',
					'#7FFFD4', '#FFFF00'
				],
				rect_colors2: ['#c79329', '#409EFF', '#67C23A', "#E6A23C", "#F56C6C", "#909399", "#19CAAD", "#9b59b6",
					"#e67622", "#f39312", "#bdc3c7"
				],
				stroke_color: ['#e1e1e1', '#e2e2e2', '#e4e4e4', '#e6e6e6', '#e8e8e8', '#f0f0f0', '#f2f2f2', '#f4f4f4',
					'#f6f6f6', '#f8f8f8', '#fbfbfb'
				],
				id: 0,
				dataset: {
					name: "VoLTE故障",
					children: [
						{
							name: "设备故障",
							children: [{
									name: "设备1故障",
									children: [{
											name: "故障维修",
											children: [{
													name: "故障解决",
													children: [{
															name: "重启系统"
														},
														{
															name: "重启系统"
														},
														{
															name: "重启系统"
														},
														{
															name: "重启系统"
														}
													]
												},
												{
													name: "故障解决"
												},
												{
													name: "故障解决"
												},
												{
													name: "故障解决"
												}
											]
										},
										{
											name: "故障维修"
										},
										{
											name: "故障维修"
										},
										{
											name: "故障维修"
										}
									]
								},
								{
									name: "设备2故障",
									children: [{
											name: "故障维修"
										},
										{
											name: "故障维修"
										},
										{
											name: "故障维修"
										},
										{
											name: "故障维修"
										}
									]
								},
								{
									name: "设备3故障",
									children: [{
											name: "故障维修"
										},
										{
											name: "故障维修"
										},
										{
											name: "故障维修"
										},
										{
											name: "故障维修"
										}
									]
								},
								{
									name: "设备4故障",
									children: [{
											name: "故障维修"
										},
										{
											name: "故障维修"
										},
										{
											name: "故障维修"
										},
										{
											name: "故障维修"
										}
									]
								}
							]
						},
						{
							name: "连接故障",
							children: [{
									name: "错误码401"
								},
								{
									name: "错误码402"
								},
								{
									name: "错误码403"
								},
								{
									name: "错误码404"
								}
							]
						},
						{
							name: "会话故障",
							children: [{
									name: "会话错误1"
								},
								{
									name: "会话错误2"
								},
								{
									name: "会话错误3"
								}
							]
						},
						{
							name: "其他错误",
							children: [{
									name: "错误1"
								},
								{
									name: "错误2"
								},
								{
									name: "错误3"
								},
								{
									name: "错误4"
								}
							]
						}
					]
				}
			}
		},
		methods: {
			treeDiagram() {
				var that = this
				var width = that.$refs.treeDiagram.clientWidth;
				var height = that.$refs.treeDiagram.clientHeight;
				console.log("当前画布高度为" + height.toString() + "px")
				console.log("当前画布宽度为" + width.toString() + "px")
				var margin = that.margin
				var container = d3
					.select("#treeDiagram")
					.append("svg")
					.attr("width", width + "px")
					.attr("height", height + "px")
					.call(d3.zoom().on('zoom', event => {
						// console.log(event)
						var scale = event.transform.k,
							translate = [event.transform.x, event.transform.y]
						svg.attr('transform', 'translate(' + translate[0] + ', ' + translate[1] + ') scale(' +
							scale + ')');
					}))
				var svg = container
					.append("g")
					.attr("transform", "translate(" + margin.top + "," + margin.left + ")")

				that.svg = svg
				// 创建一个层级布局

				// 创建一个树状图
				var tree = d3
					.tree()
					.size([height - 50, width - 200])
					.separation(function(a, b) {
						return (a.parent == b.parent ? 1 : 2) / a.depth;
					});
				that.tree = tree

				var root = d3
					.hierarchy(that.dataset)
					.sum(function(d) {
						return d.value;
					});
				// root.x0 = 500
				// root.y0 = 500
				root.x0 = 0;
				root.y0 = 0;
				that.root = root


				function collapse(d) {
					// console.log("当前是")
					// console.log(d)
					if (d.children) {
						d._children = d.children;
						d._children.forEach(collapse);
						d.children = null;
					}
				};
				root.children.forEach(collapse)
				// collapse(root)
				// console.log("根节点是：->")
				// console.log(root)
				that.update(root)

			},

			update(source) {
				var that = this
				var treeData = that.tree(that.root);
				var nodes = treeData.descendants();
				var links = treeData.links();
				var id = that.id
				console.log(nodes)

				var duration = 1000
				var tra = d3
					.transition()
					.duration(duration)
				// console.log(nodes)
				// console.log(links)
				var margin = that.margin
				//代码里最大的坑，这里的命名号 必须保存在本页面生命周期的data里面，
				//否则每次更新都从0开始计数，无法正常展开和关闭，这个bug改了整整两天
				nodes.forEach(function(d) {
					d.y = d.depth * 180; // 树的x,y倒置了，所以这里Y其实是横向的
					// console.log(d );  // 获取到 展示的所有 中国浙江等
				});
				var node = that.svg
					.selectAll("g.node")
					.data(nodes, function(d) {
						// console.log("add node id")
						return d.id || (d.id = ++id); //为没有id的节点添加上ID
					})
				that.id = id

				var newnode = node
					.enter()
					.append("g")
					.attr("class", "node")
					.attr("transform", function(d) {
						console.log("node_init")
						
						var cx = source.x0
						var cy = source.y0
						return "translate(" + cy + "," + cx + ")";
					})
					.on("click", function(event, d) {
						that.click(event, d)
					})
					.on("mouseenter", function(event) {
						var rect_mouseenter = d3.select(this).select("rect")
						var text_mouseenter = d3.select(this).select("text")
						rect_mouseenter.attr("stroke", "#e8f6e8")
							.attr("stroke-width", "12px")
							.attr("fill", "#80848f")
							.attr("stroke-opacity", "0.4")
						// text_mouseenter.attr("fill","#ffffff")
					})
					.on("mouseleave", function(event) {
						var rect_mouseleave = d3.select(this).select("rect")
						var text_mouseleave = d3.select(this).select("text")
						rect_mouseleave.attr("stroke", "#f0de0e")
							.attr("stroke-width", "4px")
							.attr("fill", "#c79329")
							.attr("stroke-opacity", "1")
					});
					// .call(that.drag());
					console.log("asdsad")
					console.log(newnode)



				newnode.append("rect")
					.attr("class", "rect")
					.attr('width', function(d) {
						var width = 80;
						if (d.depth == 0) {
							width = 80;
						}
						return width
					})
					.attr("cursor", "pointer")
					.attr('height', function(d) {
						if (d.depth == 0) {
							return 40
						}
						return 40 - d.depth * 5
					})

					.attr('y', function(d) {
						// return d.depth == 0 || d.depth == 1 ? '-20' : '-8';
						return -20 + d.depth * 3 //这是为了迎合矩阵的变化而变化 
					})
					.attr('x', function(d) {
						// return d.depth == 0 || d.depth == 1 ? '-30' : '0';
						return 0
					})
					.attr('ry', 8) //定义圆角的弧度 
					.attr('rx', 8)
					.attr('fill', function(d) {
						return '#c79329'
						// return that.rect_colors2[d.depth];
					})
					.attr('stroke', function(d) {
						return "#f0de0e"
						// return that.stroke_color[d.depth]
					})
					.attr('stroke-width', "4px")

				//绘制节点
				newnode.append("circle")
					.attr("r", function(d) {
						if (d.depth == 0) {
							return 0
						} else {
							return 50
						}
					})
					.attr("cx", -7)
					.attr("cy", 0)
					.attr("fill", "#ffffff")
					// .attr("stroke", "red")
					.attr("stroke-width", 1)
					.on("mouseover", function(d) { //交互
						// d3.select(this)
						// 	.attr("stroke", "skyblue")
						// 	.attr("stroke-width", 2)
					})
					.on("mouseout", function() {
						// d3.select(this)
						// 	.attr("stroke", "#000")
						// 	.attr("stroke-width", 1)
					})
				//绘制文字
				newnode.append("text")
					.attr("x", function(d) {
						return 40;
					})
					.attr("cursor", "pointer")
					.attr("fill", '#ffffff')
					.attr("y", function(d) {
						return 5 + d.depth * 0.3
					})
					.attr('text-anchor', 'middle')
					.attr("font-weight", "bold")
					.attr("font-size", function(d) {
						var size = 13 - d.depth * 0.5
						return size.toString() + "px"
						// return 13
					})
					// .attr("stroke","blue")
					.text(function(d) {
						return d.data.name;
					})
				// .on("mouseover", function(d) { //交互
				// 	// d3.select(this)
				// 	// 	.attr("fill", "red")
				// })
				// .on("mouseout", function() {
				// 	// d3.select(this)
				// 	// 	.attr("fill", "#000")
				// })
				// (2-5) 原有节点更新到新位置
				//超级大坑 草 超级大坑 

				var tra_node = d3
					.transition()
					.duration(duration)

				var nodeupdate = that.svg
					.selectAll("g.node")
					.transition(tra_node)
					.attr("transform", function(d) {
						console.log("node_expand")
						// ds.push(d.children ? 1 : 0)
						// list.push(d.data.name)
						return "translate(" + d.y + "," + d.x + ")";
					});

				nodeupdate
					.select("circle")
					.attr("r", function(d) {
						if (d.depth == 0) {
							return 0
						} else {
							return 5
						}
					})
					// .attr("fill-opacity",1)
					.attr("fill", function(d) {

						if (!d._children) {
							return "#d8d8d8"
						} else {
							return "red"
						}
					})
					.attr("stroke", function(d) {
						if (!d._children) {
							return "#ffffff"
						} else {
							return "#ff9100"
						}
					})
					.attr("stroke-width", 3);


				nodeupdate
					.select("text")
					.style("fill-opacity", 1);

				// (2-6) 折叠节点的子节点收缩回来
				var nodeexit = node
					.exit()
					.transition(tra_node)
					.attr("transform", function(d) {
						// console.log("node_back")
						return "translate(" + source.y + "," + source.x + ")";
					})
					.remove();
				nodeexit
					.select("circle")
					.attr("r", 1e-6)
					.select("text")
					.style("fill-opacity", 1e-6);

				var linkhorizontal = d3.linkHorizontal()
					.x(function(d) {
						return d.y //横向
						//return d.x //纵向
					})
					.y(function(d) {
						return d.x //横向
						//return d.y //纵向
					});

				var link = that.svg
					.selectAll("path.link")
					.data(links, function(d) {
						return d.target.id;
					});

				var list = []

				//注意这里应该用insert不应该用append，否则连线将会遮挡节点的图案和颜色
				link.enter()
					.insert("path", "g")
					.attr("class", "link")
					// .transition(tra)    //这里的transition不能加，否则覆盖掉下面的动画效果 
					.attr('d', function(d) {
						console.log("link_init")
						list.push(source)
						list.push(source.y0)
						var o = {
							x: source.x0,
							y: source.y0
						};
						return linkhorizontal({
							source: o,
							target: o
						});
					})
					.attr("fill", "none")
					.attr("stroke", "#e6e6e6")
					.attr("stroke-width", 2);

				var tra_links = d3
					.transition()
					.duration(duration)
				that.svg
					.selectAll("path.link").transition(tra_links)
					.attr("d", function(d) {
						console.log("link_expand")
						var start = {
							x: d.source.x,
							y: d.source.y
						};
						var end = {
							x: d.target.x,
							y: d.target.y
						};
						return linkhorizontal({
							source: start,
							target: end
						});
					});


				link.exit().transition(tra_links)
					.attr("d", function(d) {
						console.log("link_back")
						var position = {
							x: source.x,
							y: source.y
						};
						return linkhorizontal({
							source: position,
							target: position
						});
					})
					.remove();
				nodes.forEach(function(d) {
					// console.log("记录当前各个节点位置")
					d.x0 = d.x;
					d.y0 = d.y;
				});
				// console.log(nodes)
			},

			//这他妈真的是超级大坑！我查了两个半小时资料 
			//在最开始上面的，on属性，绑定了click事件为该函数，传值为d，但是d3.V-7对这个函数接口改版了！！！！草
			//该函数默认传递两个参数，event和d，必须分别显示的写出这两个参数，如果只传一个参数则d永远指向的是event，而不是
			//之前绑定的node节点集合

			click(event, d) {
				if ((!d.children) && (!d._children)) {
					return
				}
				if (d.children) {
					d._children = d.children;
					d.children = null;
				} else {
					d.children = d._children;
					d._children = null;
				}
				// this.svg.selectAll("g").remove()
				//this.root = d
				// console.log("开始更新")
				// console.log(d)
				this.update(d); // 重新渲染
			},
			drag(event, d) {
				function dragstarted(event, d) {
					console.log("dragstart")
					console.log(d)
				}

				function dragged(event, d) {
					var drag_rect = d3.select(this)
					drag_rect.attr("transform", function(d) {
						return "translate(" + event.x + "," + event.y + ")";
					})

					d.x = event.x
					d.y = event.y
					// console.log((d.x).toString()+","+(d.y).toString())
					console.log("dragged")
				}

				function dragended(event, d) {
				  console.log(d)
					// if (!event.active) simulation.alphaTarget(0);
					//注释以下代码，使拖动结束后固定节点
					// event.subject.fx = null;
					// event.subject.fy = null;
					console.log("dragend")
				}

				return d3.drag()
					.on("start", dragstarted)
					.on("drag", dragged)
					.on("end", dragended)
			},
		},
		mounted() {
			// console.log("sadasdas")
			this.treeDiagram()

		},
		created() {

		}

	}
</script>
<style>
	#svgContainer {
		width: 100%;
		height: 100%;
		/* border:5px solid red; */
		/* background:-webkit-radial-gradient(center,closest-corner,#517fa4,#243949); */
		/* background-color:#1E90FF; */
		/* background: 
		radial-gradient(rgba(255,255,255,0) 0, rgba(255,255,255,.15) 30%, rgba(255,255,255,.3) 32%, rgba(255,255,255,0) 33%) 0 0,
		radial-gradient(rgba(255,255,255,0) 0, rgba(255,255,255,.1) 11%, rgba(255,255,255,.3) 13%, rgba(255,255,255,0) 14%) 0 0,
		radial-gradient(rgba(255,255,255,0) 0, rgba(255,255,255,.2) 17%, rgba(255,255,255,.43) 19%, rgba(255,255,255,0) 20%) 0 110px,
		radial-gradient(rgba(255,255,255,0) 0, rgba(255,255,255,.2) 11%, rgba(255,255,255,.4) 13%, rgba(255,255,255,0) 14%) -130px -170px,
		radial-gradient(rgba(255,255,255,0) 0, rgba(255,255,255,.2) 11%, rgba(255,255,255,.4) 13%, rgba(255,255,255,0) 14%) 130px 370px,
		radial-gradient(rgba(255,255,255,0) 0, rgba(255,255,255,.1) 11%, rgba(255,255,255,.2) 13%, rgba(255,255,255,0) 14%) 0 0,
		linear-gradient(45deg, #343702 0%, #184500 20%, #187546 30%, #006782 40%, #0b1284 50%, #760ea1 60%, #83096e 70%, #840b2a 80%, #b13e12 90%, #e27412 100%);
		background-size: 470px 470px, 970px 970px, 410px 410px, 610px 610px, 530px 530px, 730px 730px, 100% 100%;
		background-color: #840b2a; */
		background-color: #101728;
		background-image:
			radial-gradient(white, rgba(255, 255, 255, .2) 2px, transparent 40px),
			radial-gradient(white, rgba(255, 255, 255, .15) 1px, transparent 30px),
			radial-gradient(white, rgba(255, 255, 255, .1) 2px, transparent 40px),
			radial-gradient(rgba(255, 255, 255, .4), rgba(255, 255, 255, .1) 2px, transparent 30px);
		background-size: 550px 550px, 350px 350px, 250px 250px, 150px 150px;
		background-position: 0 0, 40px 60px, 130px 270px, 70px 100px;


	}

	.button {
		float: right;
		margin-right: 20px;
		font-size: 14px;
		cursor: pointer;
		padding: 2px 8px;
		border: 1px solid #ccc;
		background: yellowgreen;
		border-radius: 4px;
	}

	.treeDiagram {
		/* width: 1500px; */
		/* height: 1000px; */
		width: 100%;
		height: 100%;
		border: 3px solid green;
	}
</style>
