//w---iframe的宽度
//h---iframe的高度
//scale_count---缩放参考值
//zoom_x---放大缩小按钮操作市，做为中心点X
//zoom_y---放大缩小按钮操作市，做为中心点Y
//ele_x,ele_y---当前查看站点的偏移量

var w = 700, h= 400,scale_count,zoom_x,zoom_y,ele_x,ele_y,size_scope = 14,scale_count = 4,count=2;
$(function(){
	$('#kintetsu_map').load( function(){
		var roadline = $(this).contents().find('map');
		var plane_area = roadline.children('area');
		plane_area.on({
			click : function(){
				var href = $(this).attr('href');
				var target_url = href.substring(1);        //目标页面的地址
				//loadNewUrl ---加载路线图的回调事件
				loadCode( $('#kintetsu_map').contents().find('#roadline_site'),target_url,loadNewUrl );
			}
		})
	})
})
//加载主要站点数据方法		
function loadCode ( target_id,target_url,callback){
	var arg2 = typeof arguments[2];
	//加载主要站点页面代码。
	//清空并添加白色背景颜色的div
	target_id.html('').append('<div id="main_site_box" class="main-site-box"></div>');
	target_id.find('#main_site_box').load( 'html/'+target_url+'.html', function(){
		//判断第3个参数是否为function类型
	 	if( arg2 == 'function' ){
	 		callback( $(this).find('area'),target_url );
	 	}else {
	 		return false;
	 	}
	});
}
//加载路线页面代码方法，并相应拖拽，滚轮缩放和按钮缩放功能
function loadNewUrl( area,target_url ){
	//路线站点按钮点击事件
	area.on({
		click : function(){
			var road_href = $(this).attr('href').split('_');
			var road_url = road_href[0].substring(1);
			var road_num = '#'+road_href[1];
			//console.log(road_url+'//'+road_num);
			//切换路线图
			//新建一个父DIV
			$('#kintetsu_map').contents().find('#road').html('').append('<div id="tar_translate_ele" class="tar-translate-ele"></div>');
			$('#kintetsu_map').contents().find('#tar_translate_ele').load( 'html/map_'+road_url+'.html', function(){
				if( $(this).find('area[href='+road_num+']').length > 0  ){
					var coords = $(this).find('area[href='+road_num+']').attr('coords').split(',');
				}else{
					alert('找不到href='+road_num+'的站点，点确认返回初始页面.');
					location.reload();
				}
				
				//元素热区中心点
			    ele_x = [ (+coords[2])+ (+coords[0]) ] / 2;
				ele_y = [ (+coords[3])+ (+coords[1]) ] / 2;
				//放大缩小按钮操作时当前点击的区域站点偏移量做为中心点参考计算
				zoom_x = ele_x;
				zoom_y = ele_y;
				//点击站点跳转到站点，并保持当前站点位于窗口的中心区域
				var tar_translate_ele = $(this);
				var tar_img = tar_translate_ele.find('img'); 	
				//路线图图片加载成功后的相关事件方法
				loadRoadFun ( tar_translate_ele,tar_img );
			})
		}
	})
}
function loadRoadFun ( tar_translate_ele,tar_img ){
	//显示路线放大缩小和返回按钮
	$('#road_contral').css({'display':'block'})
	//路线图加载
	tar_img.load(function(){
		
		ele_x = ele_x-( w/2 );
		ele_y = ele_y-( h/2 );
		//点击主要站点刷新到乳腺图当前的站点
		tar_translate_ele.css({'left':(-ele_x)+'px','top':(-ele_y)+'px'});
		//执行拖拽路线图
		dragRoad (tar_translate_ele,tar_img);
		//缩放拖拽路线图
	 	zoomRoad (tar_translate_ele);
	 	/*缩小按钮缩小路线图*/	       		
		$('#minus_but').on({
	       	click: function(event){
	        	addMinusSvg( $(this),tar_translate_ele,event );
	  		}
	   	})
	  
	    /*放大按钮放大路线图*/
		$('#add_but').on({
	       	click: function(event){
				addMinusSvg( $(this) ,tar_translate_ele,event);
	  		}
	   	})
		//点击站点发送href
		var hasMove=false; 
		$(this).siblings('map').children('area').on({
			mousedown:function(){
	        	hasMove=false;
	    	},
	    	mouseup : function (){
	    		//根据是否发生移动状态来模拟click事件和拖拽后释放鼠标事件
		        if(hasMove){
		            console.log("鼠标移动了，不执行路线跳转操作。");
		        }else{
		           //跳转
				   window.parent.location.href='https://www.kintetsu-bus.co.jp/route/index.html'+$(this).attr('href');
		        }
		        hasMove=false;  //还原标识，以便下一次使用
	    	},
	    	mousemove: function(){
	    		hasMove=true;   //元素移动事件中跟新标识为true，表示有发生移动
	    	}
		})
	})
}

//拖拽路线图方法
function dragRoad (tar_translate_ele,tar_img){
	var _move = false,_x, _y;
	//拖动元素
	tar_translate_ele.mousedown(function(event) {
		_move = true;
        _x = event.pageX - parseInt( $(this).css('left') );//图片距左上角距离
        _y = event.pageY - parseInt( $(this).css('top') );
        defalut_sx = event.offsetX;
		defalut_sy = event.offsetY;
        return false;
    });
    tar_translate_ele.mousemove(function(event) {
        if (_move) {
            var x = event.pageX - _x;
            var y = event.pageY - _y;
            //禁止拖拽出范围
            //左
            if( x > 0 ){
            	x=0;
            } 
            //上
            if( y > 0 ){
            	y=0;
            } 
            //[(10-scale_count)/10]缩放后的宽高---
            //右
			if(x < w - tar_img.width()*[(size_scope-scale_count)/10]){
            	x = w - tar_img.width()*[(size_scope-scale_count)/10];
        	}
            //下
        	if( y < h - tar_img.height()*[(size_scope-scale_count)/10] ){
                y = h - tar_img.height()*[(size_scope-scale_count)/10];
        	}
        	//
        	zoom_x = event.offsetX;
        	zoom_y = event.offsetY;
        	
            $(this).css({'left':x+'px','top':y+'px'});
        }else{
        	
        }
    }).mouseup( function() {
        _move = false;
    });
}
//缩放拖拽路线图方法
function zoomRoad (tar_translate_ele){
	//放大缩小
	tar_translate_ele.on({
		mousewheel : function(event, delta){
			//获取鼠标当前坐标想(x,y)
        	var x = event.pageX;
            var y = event.pageY;
            
            //判断滚动方向
			var dir = delta > 0 ? 'Up' : 'Down';
			var vel = Math.abs(delta);
			
			//鼠标向上滚动放大
        	if(dir == "Up"){
        		compareScaleCountNo ('positive');
        	}
        	//鼠标向下滚动缩小
        	if(dir == "Down"){
        		compareScaleCountNo ('negative');
        	}
        	var size = [(size_scope-scale_count)*vel]/10;
            //计算图片与鼠标坐标的相对位置
    		var trans_x = event.offsetX*size-x;
			var trans_y = event.offsetY*size-y;
			//
			$(this).css({'transform':'scale('+size+')'});
			$(this).css({'transform-origin':'0 0'});
  			$(this).css({'left':-trans_x+'px'});
  			$(this).css({'top':-trans_y+'px'});	
		}
	})
}
//	放大缩小按钮通用方法				
function addMinusSvg(m,tar_translate_ele,event){
	
	if( m.attr('id') == 'add_but'){
		compareScaleCountNo ('positive');
	}
	if( m.attr('id') == 'minus_but' ){
		compareScaleCountNo ('negative');
	}
	//计算缩放倍数
	var size = [(size_scope-scale_count)]/10; 
	//计算SVG与鼠标坐标的相对位置
	var trans_x =  -zoom_x*size+( w/2 );
	var trans_y =  -zoom_y*size+( h/2 );
	//
	tar_translate_ele.css({'transform':'scale('+ size +')'});
	tar_translate_ele.css({'left':trans_x+'px'});
	tar_translate_ele.css({'top':trans_y+'px'});
	tar_translate_ele.data('scale',size);
	tar_translate_ele.css({'transform-origin':'0 0'});
}					
//放大缩小比较方法---针对按钮的状态切换			       
function compareScaleCountNo (number) {
	if(number == 'positive'){
		if( scale_count > count &&  scale_count < size_scope ){
			scale_count -= count;
			$('#minus_but a').removeClass('bg-gray');
			$('#add_but a').removeClass('bg-gray');
		}else if ( scale_count == count ) {
			scale_count = 0;
			$('#add_but a').addClass('bg-gray');
			$('#minus_but a').removeClass('bg-gray');
		}
		return false;
	}
	if(number == 'negative'){
		if(  scale_count < size_scope-count ){
			scale_count+=count;
			$('#minus_but a').removeClass('bg-gray');
			$('#add_but a').removeClass('bg-gray');
		}else {
			scale_count=size_scope-count;
			$('#minus_but a').addClass('bg-gray');
			$('#add_but a').removeClass('bg-gray');
		}
		return false;
	}	
}
    				   
		        
		        	
		        	
				