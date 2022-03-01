<template>
  <div class="gContainer">
    <!-- <d3graph /> -->
    <!-- <gSearch @getData="update" /> -->
    <graph
      :data="data"
      :names="names"
      :labels="labels"
      :linkTypes="linkTypes"
    />
  </div>
</template>
<script>
// import gSearch from '@/components/gSearch.vue'
// import d3graph from '@/components/d3graph.vue'
import graph from '@/components/Graph.vue'
export default {
  name:'View2d',
  components: {
    // gSearch,
    graph
  },
  data () {
    return {
      // d3jsonParser()处理 json 后返回的结果
      data: {
        nodes: [],
        links: []
      },
      names: ['故障类型', '待定', '待定', '待定'],
      // labels: ['Enterprise', 'Type', 'Region', 'Country'],
	  // labels: ['entity_root', 'entity_guzhangbuwei', 'entity_guanliandongzuo',  'entity_youhuapeizhi', 'entity_guzhangyuanyin', 'entity_juticuoshi','entity_tiaozhengcuoshi','entity_jianchadongzuo'],
	  labels:['entity_1','entity_2','entity_3','entity_4','entity_5','entity_6','entity_7','entity_8','entity_9','entity_10'],
      // linkTypes: ['', 'type', 'locate', 'export']
	  linkTypes: ['relation', 'type', 'locate', 'export']
	}
  },
  methods: {
    // 视图更新
    update (json) {
      console.log('update')
      // console.log("json数据是")
      // console.log(json)
	  this.GetNeo4jData(100000)
	  // this.d3jsonParser(json)
	  // var neo4j_data = new Array()
	  // neo4j_data = this.GetNeo4jData(100000)
	  // console.log(neo4j_data)
      //this.d3jsonParser(json)
    },
	async GetNeo4jData(limit_items){
		// 当前的问题是 从数据库直接读取数据后，获得的是records类型的数据
		// 需要转变为json类型的数据才方便处理 否则无法正常使用
		// 当前的解决办法是 直接手动从neo4j中导出为json类型数据 并且保存到data文件夹下面
		const db =  { // 数据库连接配置：
			// url: 'bolt://127.0.0.1:7687/', // 这里必须是bolt的地址 不能是localhost的地址
			url:'bolt://123.56.133.187:7687/',  //请注意，在浏览器打开时候前缀必须为http，不能为https，原因暂时未知
			user: 'neo4j', // 		数据库用户名(默认neo4j，修改成自己的)
			password: 'neo4jneo4j' // 		数据库密码（默认ne4oj，修改成自己的）
		}
		const start = new Date()
		const neo4j = require('neo4j-driver')
		const driver = neo4j.driver(db.url, neo4j.auth.basic(db.user, db.password))
		const session = driver.session()
		// const result = await session.run(
		// 	'MATCH p = (n:entity)-[r:relation]->() ' +
		// 	'RETURN p ' +'LIMIT $limit_items ', {
		// 		limit_items: neo4j.int(limit_items)
		// 	}
		// );
		const result = await session.run(
			'MATCH p = ()-[]->() ' +
			'RETURN p ' +'LIMIT $limit_items ', {
				limit_items: neo4j.int(limit_items)
			}
		);
		
		
		var number  = result.records.length 
		console.log('结果数据共计的条数为' + number.toString())
		var i = 0
		var json_array = new Array()
		for( i = 0 ;i <number ; i++){
			var each_json = {}
			each_json = {}
			var json_p = {}
			var json_start = {}
			json_start["identity"] = result.records[i].get('p').start.identity.low
			json_start["labels"] = result.records[i].get('p').start.labels
			json_start["properties"] = result.records[i].get('p').start.properties
			json_p["start"] = json_start
			
			var json_end = {}
			json_end["identity"] = result.records[i].get('p').end.identity.low
			json_end["labels"] = result.records[i].get('p').end.labels
			json_end["properties"] = result.records[i].get('p').end.properties
			json_p["end"] = json_end
			
			var json_segments = new Array()
			var json_sg = {}
			var json_relationship = {}
			json_relationship["identity"] = result.records[i].get('p').segments[0].relationship.identity.low
			json_relationship["start"] = result.records[i].get('p').segments[0].relationship.start.low
			json_relationship["end"] = result.records[i].get('p').segments[0].relationship.end.low
			json_relationship["type"] = result.records[i].get('p').segments[0].relationship.type
			json_relationship["properties"] = result.records[i].get('p').segments[0].relationship.properties
			json_sg["start"] = json_start
			json_sg["relationship"] = json_relationship
			json_sg["end"] = json_end
			json_segments.push(json_sg)
			json_p["segments"] = json_segments
			
			var json_length = result.records[i].get('p').length.toFixed(1)
			json_p["length"] = json_length
			each_json["p"] = json_p
			json_array.push(each_json)
		}	
		this.d3jsonParser(json_array)
		// var blob = new Blob([content], {type: "text/plain;charset=utf-8"});
		// var FileSaver = require('file-saver');
		// FileSaver.saveAs(blob, "save.json");


	},
    /*eslint-disable*/
    // 解析json数据，主要负责数据的去重、标准化
    d3jsonParser (json) {
      const nodes =[]
      const links = [] // 存放节点和关系
      const nodeSet = [] // 存放去重后nodes的id
      // 使用vue直接通过require获取本地json，不再需要使用d3.json获取数据
      // d3.json('./../data/records.json', function (error, data) {
      //   if (error) throw error
      //   graph = data
      //   console.log(graph[0].p)
      // })
      for (let item of json) {
        for (let segment of item.p.segments) {
          // 重新更改data格式
          if (nodeSet.indexOf(segment.start.identity) == -1) {
            nodeSet.push(segment.start.identity)
            nodes.push({
              id: segment.start.identity,
              label: segment.start.labels[0],
              properties: segment.start.properties
            })
          }
          if (nodeSet.indexOf(segment.end.identity) == -1) {
            nodeSet.push(segment.end.identity)
            nodes.push({
              id: segment.end.identity,
              label: segment.end.labels[0],
              properties: segment.end.properties
            })
          }
          links.push({
            source: segment.relationship.start,
            target: segment.relationship.end,
            type: segment.relationship.type,
            properties: segment.relationship.properties          })
        }
      }
      this.data = { nodes, links }
    }
  },
  mounted(){
	  this.update()
  }
}
</script>

<style lang="scss" scoped>
.gContainer {
  // position: relative;
  // border: 10px #000 solid;
  // background-color: #43ac80;
  // display: flex;
  // flex-direction: column;
  // align-items: center;
  // justify-content: center;
  // overflow: hidden;
}
</style>
