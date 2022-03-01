<template>
  <div class = "container">
<!-- 	<div style="margin-top: 20px;width: 500px;">
	    <el-autocomplete
	      style="width: 500px"
	      class="inline-input"
	      v-model="input"
	      :fetch-suggestions="querySearch"
	      placeholder="请输入内容"
	      :trigger-on-focus="true"
	      @select="handleSelect"
		  @clear = "input_clear"
	      clearable>
	      <el-button
	        slot="append"
	        type="success"
	        icon="el-icon-search"
	        @click="query"
	      >搜索</el-button>
	    </el-autocomplete>
	</div> -->
	<keep-alive>
		<svg style="border:1px dashed grey"
		  id="svg"
		  width="1400"
		  height="760"
		></svg>
	</keep-alive>
	<div class="node_info hidden">
	    <p>
	        <strong class="name"></strong>
	    </p>
	</div>
  </div>
</template>

<script>
import * as d3 from 'd3'
import install from '@/plugins/d3-context-menu'
install(d3) // 为d3注册右键菜单插件
export default {
  name: 'graph',
  props: {
    data: {
      type: Object,
      default: function () {
        return {
          nodes: [],
          links: []
        }
      }
    },
    /* eslint-disable */
    // 自定义图例（数组保证一一对应）
    // names		图例名称变量制作图标
    // labels		节点的标签名称（与records.json中保证相同）
    names: {
      type: Array
    },
    labels: Array,
    linkTypes: Array
  },
  data () {
    return {
      svgDom: null, // svg的DOM元素 => d3.select('#svg1')
      keywords: '',
      nodeState: 0,
      // 文本状态，表示是否显示文本信息（0：显示/1：不显示）
      textState: 0,
      // d3render()最终展示到页面上的数据（节点隐藏功能）
      nodes: [],
      links: [],
      /* eslint-disable */
      // 自定义图例及颜色（数组保证一一对应）
      // colors		图例颜色（9个颜色）
      // states   图例状态（on：显示 / off：不显示）
      colors: ['#BA55D3','#55cccc', '#aaaaff', '#4e88af', '#d0d066','#59aa40', '#1E90FF', '#ff8c8e','#32a7b1','#ca635f','#a5a5a5'],
      states: [],
      selectNodeData: {}, // 选中节点的详细信息展示
      isNodeClicked: false, // 是否点击（选中）节点
      temp: {}, // 临时存储编辑时的节点信息
      dialogFormVisible: false,
      isEdit: true,
	  input: '',
	  mode: '1',
	  input_results:[],
	  on_click:false,
    }
  },

  watch: {
    // 当请求到新的数据时，重新渲染
    data (newData, oldData) {
      console.log(newData, oldData)
      // 移除svg和元素注册事件，防止内存泄漏
      this.svgDom.on('.', null)
      this.svgDom.selectAll('*').on('.', null)
      this.d3init()
    }
  },
  created () {
    // this.states = Array(this.names.length).fill('on')
  },
  mounted () {
	this.input_results = this.loadAll()
    this.d3init()
	
  },
  beforeDestroy () {
    // 移除svg和元素注册事件，防止内存泄漏
    this.svgDom.on('.', null)
    this.svgDom.selectAll('*').on('.', null)
  },
  methods: {
	  loadAll () {
	    return [
	    { value: 'not supported 5QI value', address: 'null' }
	    ]
	  },
	  query () {
		var query_name = this.input
		console.log("输入的内容是:"+query_name)
		var query_nodes = this.nodes
		for (let item of query_nodes) {
			console.log(item)
		  if (item.properties.name == query_name) {
		    console.log("找到了该节点")
			this.isNodeClicked = true
			this.changeGraphStyle(query_name)
			const h = this.$createElement;
			    this.$message({
			        message: h('p', null, [
			            h('span', null, '已查询到该节点 :  '),
			            h('i', { style: 'color: teal' }, query_name)
			        ]),
					center: true,
					type: 'success'
			     });
			 return 
		  }
		}
		const h = this.$createElement;
		this.$message({
		    message: h('p', null, [
		        h('span', {style:'color:red'}, '该节点未找到或不存在该节点 :  '),
		        h('i', { style: 'color: red' }, query_name)
		    ]),
			center: true,
			type: 'error'
		 });
	  },
	  querySearch (queryString, cb) {
	    var res = this.input_results
	    var results = queryString ? res.filter(this.createFilter(queryString)) : res
	    // 调用 callback 返回建议列表的数据
	    cb(results)
	  },
	  createFilter (queryString) {
	    return (res) => {
	      return (res.value.toLowerCase().indexOf(queryString.toLowerCase()) !== -1)
	    }
	  },
	  handleSelect (item) {
	    console.log(item)
	  },
	  input_clear(){
		  this.$message({
		    message:'清空输入框',
		  	center: true,
		   });
	  },
    // d3初始化，包括数据解析、数据渲染
    d3init () {
      this.links = this.data.links
      this.nodes = this.data.nodes
	  console.log(this.nodes)
	  console.log(this.links)
      this.svgDom = d3.select('#svg')  // 获取svg的DOM元素
      // this.d3jsonParser(this.graph)
      this.d3render()
      // 数据状态初始化
      this.stateInit()
    },
    // 数据状态初始化
    stateInit () {
      this.nodeState = 0
      this.textState = 0
      // console.log(this.names)
      this.states = Array(this.names.length).fill('on')
    },
    d3render () {
      var _this = this // 临时获取Vue实例，避免与d3的this指针冲突
      // 渲染前清空svg内的元素
      _this.svgDom.selectAll('*').remove()
      // svg.selectAll('g').remove()
      var svg = _this.svgDom
        .on('click', () => { 
          // console.log(this.isNodeClicked)
          this.isNodeClicked = false
          // 移除所有样式
          this.clearGraphStyle()
          // 如果此时有搜索关键字，则鼠标离开时保留原搜索选中的节点
          if(this.keywords !== '') {
            this.searchKeyWords()
          }
        })
        // 给画布绑定zoom事件（缩放、平移）
        .call(d3.zoom().on('zoom', event => {
          // console.log(event)
          var scale = event.transform.k,
              translate = [event.transform.x, event.transform.y]
          svg.attr('transform', 'translate(' + translate[0] + ', ' + translate[1] + ') scale(' + scale + ')');
        }))
        .append('g')
        .attr('width', '100%')
        .attr('height', '100%')
		
		d3.select("#svg").attr("viewBox", [-850, -120, 1800, 900])
        //这里是初始化了一块画布 
		
      this.addMarkers()
	  
      // 定义碰撞检测模型
      var forceCollide = d3.forceCollide()
        .radius(d => { return 50 })
        .iterations(0.1)
        .strength(0.75)
	  //此处开始执行对力的模拟
	  //center表示向心力，link为弹簧力，charge为电荷作用力，collision为碰撞检测（防止生成的图形节点重合在一起）
      //利用d3.forceSimulation()定义关系图 包括设置边link、排斥电荷charge、关系图中心点 
	  //d3.forceSimulation([nodes]) 使用指定的 nodes 创建一个新的没有任何 forces(力模型) 的仿真。//如果没有指定 nodes 则默认为空数组。仿真会自动 starts(启动)
	  //simulation.force(name[, force]) 添加“link”的力模型 
	  //d3.forceLink([links]) 根据指定的 links 以及默认参数创建一个弹簧力模型。如果没有指定 links 则默认为空数组 link.id([id])将节点的 id 访问器设置为指定的函数并返回弹簧模型
	  //d3.forceManyBody() 创建一个使用默认参数的电荷力模型 manyBody.strength([strength]) 正值则表示节点之间相互吸引，负值表示节点之间相互排斥 此处显然为排斥关系
      //d3.forceCenter([x, y])使用指定的 x- 和 y- 坐标创建一个新的向心力模型。如果 x 和 y 没有指定则默认为 ⟨0,0⟩.这里为画布的正中心
	  //svg.node()返回一个包含 svg 总元素节点的对象 通常用于显示的展示svg图
	  //返回选择集中第一个非空元素。如果选择集为空则返回 null
	  var simulation = d3.forceSimulation(this.nodes)    												 
        .force("link", d3.forceLink().id(d => d.id))     
        .force("charge", d3.forceManyBody().strength(-200))  //charge link center是构建一个力图的框架 
        .force("x", d3.forceX())
        .force("y", d3.forceY())
		// .force("center", d3.forceCenter(width / 2, height / 2)
        // .force("center", d3.forceCenter(svg.node().parentElement.clientWidth / 2, svg.node().parentElement.clientHeight / 2))
		// .force("collision", forceCollide)
      // D3映射数据至HTML中
      // g用于绘制所有边,selectALL选中所有的line,并绑定数据data(graph.links),enter().append("line")添加元素
      // 数据驱动文档,设置边的粗细
	  // console.log("simulation")
	  // console.log(simulation)
	  //对边的设置，stroke-width为边的宽度 
      var link = svg.append("g")
        .attr("class", "links")
        .selectAll("line")
        .data(this.links).enter()
        .append("line")
        .attr("stroke-width", function(d) {
          // 每次访问links的一项数据
          return 3+"px" //所有线宽度均为2
        })		      //暂无用处 留作接口 
        .join("path") //join是第五版d3的新方法 =enter.append("").attr("","").exit.remove()
        .attr("marker-end", "url(#posMarker)")
			
      var linksName = svg.append("g")
        .attr("class", "linkTexts")
        .selectAll("text")
        .data(this.links)
        .join("text")
        .attr('text-anchor','middle')
        .attr('fill', '#444444')
        .attr('font-size', '10px')
        .attr('font-weight', 'bold')
		.text(d => d.properties.name)

      // 添加所有的点
      // selectAll("circle")选中所有的圆并绑定数据,圆的直径为d.size
      // 再定义圆的填充色,同样数据驱动样式,圆没有描边,圆的名字为d.id
      // call()函数：拖动函数,当拖动开始绑定dragstarted函数，拖动进行和拖动结束也绑定函数
	  //r为圆测直径
      var node = svg.append("g")
        .attr("class", "nodes")
        .selectAll("circle")
        .data(this.nodes).enter()
        .append("circle").attr("r", function(d) {
          // 每次访问nodes的一项数据
          // console.log(d)
          let size = 16
          switch(d.label){
            case _this.labels[0]: break;
            case _this.labels[1]: size = 14; break;
            case _this.labels[2]: size = 13; break;
            default: size = 13; break;
          }
          return size * 2
        })
        .attr("fill", d => {
          for (let i = 0;i < this.labels.length;i++) {
            if (d.label === this.labels[i]) return this.colors[i]
          }
        })
        .attr("stroke", "none")
        .attr("name", d => d.properties.name)
        .attr("id", d => d.id)
        .call(this.drag(simulation))
        .on("click", nodeClick)
        .on('mouseenter', function (event,d) {
			console.log(_this.isNodeClicked)
          if(_this.isNodeClicked == false){
			  const node = d3.select(this)
			  let name = node.attr("name")
			  let id = node.attr("id")
			  let color = node.attr('fill')
			  console.log(name, id, color)
			  //设置#info h4样式的颜色为该节点的颜色，文本为该节点name
			  _this.$set(_this.selectNodeData, 'id', id)
			  _this.$set(_this.selectNodeData, 'name', name)
			  _this.$set(_this.selectNodeData, 'color', color)
			  // console.log(_this.selectNodeData)
			  
			  //遍历查找id对应的属性
			  for (let item of _this.nodes) {
			    if (item.id == id) {
			      // for(var key in item.properties)
			      _this.$set(_this.selectNodeData, 'properties', item.properties)
			    }
			  }
			  // 遍历节点，并调整图的样式
			  _this.changeGraphStyle(name)
			  // _this.show_NodeInfo(event,d)
		  }
        })
        .on('mouseleave', event => {
          console.log("当前是否有节点被选中？："+this.isNodeClicked.toString())
          if (!this.isNodeClicked) {
            this.clearGraphStyle()
            // 如果此时有搜索关键字，则鼠标离开时保留原搜索选中的节点
            if(this.keywords !== '') {
              this.searchKeyWords()
            }
          }
		  // this.hide_NodeInfo(event)
        })
        .on('contextmenu', d3.contextMenu(this.menu))    
      // 显示所有的文本
      // 设置大小、填充颜色、名字、text()设置文本
      // 使用 attr("text-anchor", "middle")设置文本居中
      var text = svg.append("g")
        .attr("class", "texts")
        .selectAll("text")
        .data(this.nodes)
        .enter()
        .append("text").attr("font-size", () => 10)    //字体大小
        //.attr("fill", () => '#fff')         		   //字体颜色 
		.attr("font-weight","normal")
        .attr('name', d => d.properties.name)		   //显示的内容 
        .attr("text-anchor", "middle")				   //居中显示 
        .attr('x', function (d) {
          return textBreaking(d3.select(this), d.properties.name)
		  // return textBreaking(d3.select(this), d.properties.name)
        })
        .call(this.drag(simulation))
        .on("click", nodeClick)
        .on('mouseenter', function (event,d) {
			if(_this.isNodeClicked == false){
				const text = d3.select(this)
				let name = text.attr("name")
				_this.$set(_this.selectNodeData, 'name', name)
				
				// 根据文本名称获取节点的id
				for (let item of _this.nodes) {
				  if (item.properties.name == name) {
				    // 设置节点id和标签属性
				    _this.$set(_this.selectNodeData, 'id', item.id)
				    _this.$set(_this.selectNodeData, 'properties', item.properties)
				    // 根据节点类型label获取节点颜色
				    let index = 0
				    switch (item.label) {
				      case _this.labels[0]: break;
				      case _this.labels[1]: index = 1;break;
				      case _this.labels[2]: index = 2;break;
				      default: index = 3;break;
				    }
				    _this.$set(_this.selectNodeData, 'color', _this.colors[index])
				  }
				}
				_this.changeGraphStyle(name)
				// _this.show_NodeInfo(event,d)
			}
         
        })
        .on('mouseleave', (event) => {
          if(!this.isNodeClicked) {
            this.clearGraphStyle()
            // 如果此时有搜索关键字，则鼠标离开时保留原搜索选中的节点
            if(this.keywords !== '') {
              this.searchKeyWords()
            }
          }
		  // this.hide_NodeInfo(event)
        })
        .on('contextmenu', d3.contextMenu(this.menu))
        // .call(d3.drag()
        //   .on("start", dragstarted)
        //   .on("drag", dragged)
        //   .on("end", dragended)
        // )

      // 圆增加title
      // node.append("title").text(d => d.properties.name)
      node.append("title").text(d => d.properties.name)
      // simulation中ticked数据初始化并生成图形
      simulation.on("tick", ticked)
        
      simulation.force("link")
        .links(this.links)
        .distance(d => { // 每一边的长度
          let distance = 60
          // switch(d.source.label) {
          //   case _this.labels[0]: distance += 30;break;
          //   case _this.labels[1]: distance += 25;break;
          //   case _this.labels[2]: distance += 22;break;
          //   default: distance += 20;break; 
          // }
          // switch(d.target.label) {
          //   case _this.labels[0]: distance += 30;break;
          //   case _this.labels[1]: distance += 25;break;
          //   case _this.labels[2]: distance += 22;break;
          //   default: distance += 20;break; 
          // }
          return distance * 2
        })
      
      /****************************************** 
       * 内部功能函数
       * 包括：ticked、文本分隔、节点和文本的点击事件
       */
      // ticked()函数确定link线的起始点x、y坐标 node确定中心点 文本通过translate平移变化
      function ticked() {
        link
          .attr("x1", d => d.source.x)
          .attr("y1", d => d.source.y)
          .attr("x2", d => d.target.x)
          .attr("y2", d => d.target.y)
    
        linksName
          .attr('transform', d => {
            let x = Math.min(d.source.x, d.target.x) + Math.abs(d.source.x - d.target.x) / 2
            let y = Math.min(d.source.y, d.target.y) + Math.abs(d.source.y - d.target.y) / 2 - 1
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
            return 'translate(' + x + ',' + y + ')' + 'rotate(' + angle + ')'
          })

        node
          .attr("cx", d => d.x)
          .attr("cy", d => d.y)
    
        text.attr('transform', function(d) {
          let size = 15
          switch(d.label){
            case _this.labels[0]: break;
            case _this.labels[1]: size = 14;break;
            case _this.labels[2]: size = 13;break;
            default: size = 12;break;
          }
          size -= 5
          return 'translate(' + (d.x - size / 2 + 3) + ',' + (d.y + size / 2) + ')'
        })
      }
      
      /**
       * 文本分隔（根据字数在当前选择器中分隔三行，超过10字省略）
       * @method textBreaking
       * @param {d3text} 文本对应的DOM对象
       * @param {text} 节点名称的文本值
       * @return {void}
       */
      function textBreaking(d3text, text) {
		// console.log("text")
		// console.log(text)
        const len = text.length
        if (len <= 3) {
          d3text.append('tspan')
            .attr('x', 0)
            .attr('y', 2)
            .text(text)
        } 
		else {
          const topText = text.substring(0, 3)    //第一行显示3个字
          const midText = text.substring(3, 7)	  //第二行显示4个字
          let botText = text.substring(7, len)	  //第三行显示最多4个字
          let topY = -16
          let midY = 0
          let botY = 16
          if (len <= 7) {
            topY += 10
            midY += 10
          } else if (len > 10){
            botText = text.substring(7, 9) + '...' // 三行最多10字 超过了显示省略号
          }
  
          d3text.text('')
          d3text.append('tspan')
            .attr('x', 0)
            .attr('y', topY)
            .text(function () {
              return topText
            })
          d3text.append('tspan')
            .attr('x', 0)
            .attr('y', midY)
            .text(function () {
              return midText
            })
          d3text.append('tspan')
            .attr('x', 0)
            .attr('y', botY)
            .text(function () {
              return botText
            })
        }
      }
      // 分别定义节点和文本的点击事件
      // 优化：由于点击前必定触发mouseenter事件，所以不用再去查找节点id
      //      直接根据this.selectNodeData拿到节点信息
      // 优化后：只需定义一个点击事件即可
      function nodeClick(event, d) {
        event.cancelBubble = true
        event.stopPropagation() // 阻止事件冒泡
        
        const name = _this.selectNodeData.name
        _this.isNodeClicked = true
        _this.changeGraphStyle(name)

        return false
      }
    },
	show_NodeInfo(event,d){
		d3.select('.node_info').transition().duration(300).style('opacity', 1).style('display', 'block')
		// console.log("event")
		// console.log(event)     
		var yPosition = event.layerY +50;  //获取鼠标位置  y坐标
		var xPosition = event.layerX +200;  //获取鼠标位置	 x坐标
		// 将浮层位置设置为鼠标位置
		var node_info = d3.select(".node_info").style("left", xPosition + "px").style("top", yPosition + "px");
		node_info.select(".name").html('用户名：'+d.properties.name+'<br>'+'ID：'+d.id+'<br>'+'value：'+"null");
		      // 移除浮层hidden样式，展示浮层
		node_info.classed("hidden", false);
	},
	hide_NodeInfo(event){
		d3.select('.node_info').style('opacity', 0).style('display', 'none')
	},
    // 根据当前节点名称来更改图样式
    changeGraphStyle (name) {
      // console.log(this.isNodeClicked)
      // 选择#svg1 .nodes中所有的circle，再增加个class
      this.svgDom.select('.nodes').selectAll('circle').attr('class', d => {
        // 节点属性name是否等于name，返回fixed（激活选中样式）
        if(d.properties.name == name) {
          return 'fixed'
        }
        // 当前节点返回空，否则其他节点循环判断是否被隐藏起来(CSS设置隐藏)
        else {
          // links链接的起始节点进行判断,如果其id等于name则显示这类节点
          // 注意: graph = data
          for (var i = 0; i < this.links.length; i++) {
            // 如果links的起点等于name，并且终点等于正在处理的则显示
            if (this.links[i]['source'].properties.name == name && this.links[i]['target'].id == d.id) {
                return 'active'
            }
            if (this.links[i]['target'].properties.name == name && this.links[i]['source'].id == d.id) {
                return 'active'
            }
          }
          return this.isNodeClicked ? 'inactive' : ''
        }
      })
      // 处理相邻的文字是否隐藏
      this.svgDom.select('.texts').selectAll('text')
        .attr('class', d => {
          // 节点属性name是否等于name，返回fixed（激活选中样式）
          if(d.properties.name == name) {
            return ''
          }
          // 当前节点返回空，否则其他节点循环判断是否被隐藏起来(CSS设置隐藏)
          else {
            // links链接的起始节点进行判断,如果其id等于name则显示这类节点
            // 注意: graph = data
            for (var i = 0; i < this.links.length; i++) {
              // 如果links的起点等于name，并且终点等于正在处理的则显示
              if (this.links[i]['source'].properties.name == name && this.links[i]['target'].id == d.id) {
                  return ''
              }
              if (this.links[i]['target'].properties.name == name && this.links[i]['source'].id == d.id) {
                  return ''
              }
            }
            return this.isNodeClicked ? 'inactive' : ''
          }
        })
      // 处理相邻的边line是否隐藏 注意 || 
      this.svgDom.select(".links").selectAll('line')
        .attr('class', d => {
          if (d.source.properties.name == name || d.target.properties.name == name) {
              return 'active'
          } else {
              return this.isNodeClicked ? 'inactive' : ''
          }
        })
        .attr('marker-end', d => {
          if (d.source.properties.name == name || d.target.properties.name == name) {
            return 'url(#posActMarker)'
          } else {
            return 'url(#posMarker)'
          }
        })
      // 处理相邻的边上文字是否隐藏 注意 || 
      this.svgDom.select(".linkTexts").selectAll('text')
        .attr('class', d => {
          if (d.source.properties.name == name || d.target.properties.name == name) {
              return 'active'
          } else {
              return this.isNodeClicked ? 'inactive' : ''
          }
        })
    },
    clearGraphStyle () {
      // 移除所有样式
      this.svgDom.select('.nodes').selectAll('circle').attr('class', '')
      this.svgDom.select(".texts").selectAll('text').attr('class', '')
      this.svgDom.select('.links').selectAll('line').attr('class', '').attr('marker-end', 'url(#posMarker)')
      this.svgDom.select(".linkTexts").selectAll('text').attr('class', '')
      // d3.select(this).attr('class', '')
    },
    drag(simulation) {
      function dragsubject(event) {
        return simulation.find(event.x, event.y);
      }

      function dragstarted(event) {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        event.subject.fx = event.subject.x;
        event.subject.fy = event.subject.y;
      }
      
      function dragged(event) {
        event.subject.fx = event.x;
        event.subject.fy = event.y;
      }
      
      function dragended(event) {
        if (!event.active) simulation.alphaTarget(0);
        //注释以下代码，使拖动结束后固定节点
        event.subject.fx = null;
        event.subject.fy = null;
      }
      
      return d3.drag()
        .subject(dragsubject)
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended)
    },
    // 绘制关系箭头(是箭头前面那个尖尖角)
    addMarkers() {
      // 定义箭头的标识
      var defs = this.svgDom.append("defs")
      const posMarker = defs.append("marker")
        .attr("id", "posMarker")
        .attr("orient", "auto")
        .attr("stroke-width", 2)
        .attr("markerUnits", "strokeWidth")
        .attr("markerUnits", "userSpaceOnUse")
        .attr("viewBox", "0 -5 10 10")
        .attr("refX", 31)
        .attr("refY", 0)
        .attr("markerWidth", 12)
        .attr("markerHeight", 12)
        .append("path")
        //.attr("d", "M 0 -5 L 10 0 L 0 5")
		.attr("d","M 3 5 L 8 0 L 3 -5")
        .attr('fill', '#ffffff')
        .attr("stroke-opacity", 0.6);
      const posActMarker = defs.append("marker")   //这是当鼠标移动到节点上的时候
        .attr("id", "posActMarker")
        .attr("orient", "auto")
        .attr("stroke-width", 2)
        .attr("markerUnits", "strokeWidth")
        .attr("markerUnits", "userSpaceOnUse")
        .attr("viewBox", "0 -5 10 10")
        .attr("refX", 31)
        .attr("refY", 0)
        .attr("markerWidth", 12)
        .attr("markerHeight", 12)
        .append("path")
       .attr("d","M 0 5 L 8 0 L 0 -5")
        .attr('fill', '#ffd918')
        .attr("stroke-opacity", 0.6);
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
    }
  }
}
</script>
<style type="text/css">
	.container {
	  position: relative;
	  border: 10px #000 solid;
	  background-color: #fcf9f8;
	  display: flex;
	  flex-direction: column;
	  align-items: center;
	  justify-content: center;
	  overflow: hidden;
	}
</style>

<style lang="scss">
@import '@/plugins/d3-context-menu';
$opacity: 0.15;  /* 显示的不透明度 */
$activeColor: #1E90FF;  /* 激活的颜色 */
svg {
  margin: 20px 0px;
  // border: 1px #000 solid;
}
/*设置节点及边的样式*/
.links line {
  stroke: #b6c5cdb2; // #bbb
  stroke-opacity: 1;
  &.inactive {
    /* display: none !important; */
    opacity: $opacity;
  }
  &.active {
    stroke: #333333;
    stroke-width: 5px;
  }
  &.hide {
    display: none !important;
  }
}
.nodes circle {
   stroke: #dcdcdc;
   stroke-width: 3px;
   //opacity: 1;
  // box-shadow: 4px 4px 15px #181bff;;
  &.fixed {
    // fill: rgb(102, 81, 81);
    stroke: #93d3b0;  // #888;
    stroke-width: 14px;
    stroke-opacity: $opacity + 0.3;
    border: 10px #000 solid;
  }
  &.inactive {
    /* display: none !important; */
    opacity: $opacity;
  }
  &.active {
    stroke: #ffffff;
    stroke-width: 4px;
  }
  &:hover {
    cursor: pointer;
  }
  &.hide {
    display: none !important;
  }
}
.texts text {
  fill: rgb(255, 255, 255);
  cursor: pointer;
  text-decoration: none;
  user-select: none;
  
  &:hover {
    cursor: pointer;
  }
  &.inactive {
    /* display: none !important; */
    opacity: $opacity;
  }
}
.linkTexts text {
  //fill: rgb(0, 0, 0);
  //stroke: #fef7ffb2; // #bbb
  //stroke-opacity: 1;
  &.active {
    // stroke: #ffffff;
	fill:#ffffff;
  }
  &.inactive {
    /* display: none !important; */
    opacity: $opacity;
  }
}
// #positiveMarker path {
//   fill: #fff;
// }
</style>
<style lang="scss" scoped>
@media only screen and (max-width: 1125px){
  #info, #mode {
    display: none !important;
  }
}
.font-sky {
  font-size: 18px;
  color: #034c6a !important;
}
#indicator {
  position: absolute;
  // left: 50px;
  // bottom: 30px;
  left: 3vw;
  bottom: 2vw;
  text-align: left;
  color: #f2f2f2;
  font-size: 14px;
  font-weight: bold;
  & > div {
    margin-bottom: 4px;
  }
  span {
    display: inline-block;
    width: 32px;
    height: 16px;
    position: relative;
    top: 2px;
    margin-right: 8px;
  }
}
/*mode选项样式*/
#mode {
  position: absolute;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;
  top: 200px;
  left: 40px;
  .gState span {
    display: inline-block;
    border: 1px solid #fff;
    color: #fff;
    padding: 6px 10px;
    border-radius: 4px;
    font-size: 14px;
    transition: color, background-color .3s;
    -o-transition: color, background-color .3s;
    -ms-transition: color, background-color .3s;
    -moz-transition: color, background-color .3s;
    -webkit-transition: color, background-color .3s;
    ~ .active, ~ :hover {
      background-color: #fff;
      color: #333;
      cursor: pointer;
    }
  }
  .gState span.active, .gState span:hover {
    background-color: #fff;
    color: #333;
    cursor: pointer;
  }
}
/*悬浮节点的info样式*/
#info {
  position: absolute;
  bottom: 40px;
  right: 30px;
  width: 270px;
  .node-card {
    border: 1px solid #9faecf;
    background-color: #00aeff6b;
    color: #fff;
    text-align: left;
    // transition: background-color;
    // transition-delay: .3s;
    // transition-timing-function: ease;
    .el-card__header {
      border-bottom: 1px solid #50596d;
    }
  }
}
</style>
<style>
    .node_info {
        position: absolute;
        width: 200px;
        height: auto;
        padding: 10px;
        box-sizing: border-box;
        background-color: white;
        border-radius: 5px;
        box-shadow: 2px 2px 5px rgba(0, 0, 0, 0.4);
 
    }
 
    .node_info.hidden {
        display: none;
    }
    .node_info p {
        margin: 0;
        font-size: 14px;
        line-height: 20px;
        word-wrap: break-word;
    }

</style>
