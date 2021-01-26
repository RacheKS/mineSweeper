// fuction Mine:建表生成雷区的矩阵
// Mine.prototype.randomNum=function ():随机生成地雷
// Mine.prototype.init=function ():生成地雷的坐标
// Mine.prototype.createDom=function ()：创建雷区
// Mine.prototype.getAround=function (square)：定位雷区周边的八个方块，以显示地雷数
// Mine.prototype.updateNum=function ()：更新地雷周围的方块数组，雷周围的八个方块中展示出有附近的雷数
// Mine.prototype.play=function (ev,obj){//ev:事件对象，//obj：传给哪个地方：鼠标点击事件
// Mine.prototype.gameOver=function (clickTd):游戏判输

function Mine(tr,td,mineNum){
    this.tr=tr;//行
    this.td=td;//列
    this.mineNum=mineNum;//雷数量
    this.squares=[];//单元格
    this.tds=[];//单元格dom
    this.surplusMine=mineNum;//剩余雷数量
    this.allRight=false;//判断红旗和雷的数量是否相等，判赢
    this.parent=document.querySelector('.gameBox');
};

Mine.prototype.randomNum=function (){//生成随机数
    var square=new Array(this.tr*this.td);//生成空数组
    for(var i=0;i<square.length;i++){
        square[i]=i;
    }
    square.sort(function (){return 0.5-Math.random()});//随机排序，拿到随机数，取前x个，x为地雷数
    return square.slice(0,this.mineNum);
};

//生成雷区行列、坐标
Mine.prototype.init=function (){//创建一个数组
    this.surplusMine=this.mineNum;
    var rn=this.randomNum();//雷的位置
    var n=0;//找到矩阵中方块的索引
    for(var i=0;i<this.tr;i++){
        this.squares[i]=[];
        for(var j=0;j<this.td;j++){
            n++;
            //坐标和行列相反
            if(rn.indexOf(n)!=-1){
                //条件成立，说明找到了地雷
                this.squares[i][j]={type:'mine',x:j,y:i};//坐标与行列值相反
            }else {
                this.squares[i][j]={type:'number',x:j,y:i,value:0};
            }
        }
    }
    //console.log(this.squares)
    this.updateNum();
    this.createDom();
    //地雷计数器
    this.mineNumDom=document.querySelector('.mineNum');
    this.mineNumDom.innerHTML=this.surplusMine;
};

//创建雷区
Mine.prototype.createDom=function (){//创建表格矩阵
    var that=this;
    var table=document.createElement('table');

    for(var i=0;i<this.tr;i++){
        var domTr=document.createElement('tr');
        this.tds[i]=[];

        for(var j=0;j<this.td;j++) {
            var domTd = document.createElement('td');
            //domTd.innerHTML=0;
            domTd.pos=[i,j];//把方块的行列存到方块内，由此值取到数组中对应的数值
            domTd.onmousedown=function (){
                that.play(event,this);//that：实例对象，this：点击的td
            };

            this.tds[i][j] = domTd;
            // if(this.squares[i][j].type=='mine'){//显示雷
            //     domTd.className='mine'
            // }
            // if(this.squares[i][j].type=='number'){//显示雷周边的数字
            //     domTd.innerHTML=this.squares[i][j].value;
            // }
            domTr.appendChild(domTd);
        }
        table.appendChild(domTr);
    }
    this.parent.innerHTML='';//将雷区重新置空，解决多次点击创建多个个雷区的bug
    this.parent.appendChild(table);
};

//找雷周围的8个方块，以此获得数字提示信息
Mine.prototype.getAround=function (square){
    var x=square.x;
    var y=square.y;
    var result=[];//把找到的方块坐标返回
    /*
        x-1,y-1     x,y-1    x+1,y-1
        x-1,y       x,y      x+1.y+1
        x-1,y+1     x,y+1    x+1,y+1
     */
    for(var i=x-1;i<=x+1;i++){
        for(var j=y-1;j<=y+1;j++){
            if(
                i<0||//方块左侧超区
                j<0||//方块上部超区
                i>this.td-1||//方块右侧超区
                j>this.tr-1||//方块下部超区
                (i==x&&j==y)||//循环到当前方块本身
                this.squares[j][i].type=='mine'//相邻方块中有雷

            ){
                continue;
            }
            result.push([j,i]);//返回坐标，由此取得数组中的数据
        }
    }
    return result;
};

//更新所有数字
Mine.prototype.updateNum=function (){
    for (var i=0;i<this.tr;i++){
        for(var j=0;j<this.td;j++){
            //只更新雷周围的数字
            if(this.squares[i][j].type=='number'){
                continue;
            }
            var num=this.getAround(this.squares[i][j]);//获取每个雷周围的数字,找到非空无雷方块的数量
            //console.log(num);
            for(var k=0;k<num.length;k++){
                // num[k]==[0,1]
                // num[k][0]==0
                // num[k][1]==1
                this.squares[num[k][0]][num[k][1]].value+=1;
            }
        }
    }
    //console.log(this.squares);
};

//鼠标点击事件
Mine.prototype.play=function (ev,obj){//ev:事件对象，//obj：传给哪个地方
    var that=this;
    if(ev.which==1 && obj.className!='flag'/*标旗后不允许左键点击事件*/){//左键点击事件
        //console.log(obj);
        var curSquare=this.squares[obj.pos[0]][obj.pos[1]];
        var cl=['zero','one','two','three','four','six','seven','eight'];
        //console.log(curSquare);
        if(curSquare.type=='number'){
            //点击到空方块
            //console.log('空方块')
            obj.innerHTML=curSquare.value;
            obj.className=cl[curSquare.value];
            if(curSquare.value==0){
                //点到0数字，直接弹开
                //递归
                //1.显示自己
                //2.查找四周的方块
                //a.显示周围的方块（如果值不为零，停止查找）
                //b.如果为0，则继续查找
                //显示自己
                //查找周围的方块
                //显示自己
                //查找周围的方块
                function getAllZero(square){
                    var around=that.getAround(square);//查找到周围的方块
                    for(var i=0;i<around.length;i++){
                        var x=around[i][0];
                        var y=around[i][1];
                        that.tds[x][y].className=cl[that.squares[x][y].value];

                        if (that.squares[x][y].value==0){
                            //如果以某个方块为中心找到的下一个方块依旧是0，那么需要接着调用函数进行递归操作
                            if(!that.tds[x][y].check){
                                //给对应的td添加一个属性，这个属性觉得这个方块是否被查询过，如果查找过则为true，下次查找跳过此方块
                                that.tds[x][y].check=true;
                                getAllZero(that.squares[x][y]);
                            }

                        }else {
                            //如果不为0，则显示数字
                            that.tds[x][y].innerHTML=that.squares[x][y].value;
                        }

                    }
                }
                getAllZero(curSquare);//调用自己完成递归
            }
        }else{
            //踩到雷
            //console.log('踩雷了')
            this.gameOver(obj);

        }
    }

    //右键点击事件
    if(ev.which==3){
        //已经打开的方块，不能右击
        if(obj.className&&obj.className!='flag'){
            return;
        }

        obj.className=obj.className=='flag'?'':'flag';//三元运算符判断，切换class
        if(this.squares[obj.pos[0]][obj.pos[1]].type=='mine'){
            this.allRight=true;
        }else {
            this.allRight=false;
        }

        if(obj.className=='flag'){//解决取消标旗后计数器无法加回地雷数量的问题
            this.mineNumDom.innerHTML=--this.surplusMine;
        }else {
            this.mineNumDom.innerHTML=++this.surplusMine;
        }//此处仍遗留bug：标旗后不允许左键点击事件(已解决)

        if(this.surplusMine==0){
            //剩余雷的数量为0，判赢或输
            if(this.allRight){
                alert("win");
            }else {
                alert("lose")
                this.gameOver();

            }
        }
    }
};

//游戏失败
Mine.prototype.gameOver=function (clickTd){
    //1.显示所有地雷
    for(var i=0;i<this.tr;i++){
        for(var j=0;j<this.td;j++){
            if(this.squares[i][j].type=='mine'){
                this.tds[i][j].className='mine';
            }
            //2.冻结所有点击事件
            this.tds[i][j].onmousedown=null;
        }
    }
    //3.改变踩到的雷的样式
    if(clickTd){
        clickTd.style.backgroundColor='#f00';
    }

};

//切换游戏难度
var btns=document.querySelectorAll('.level button');
var mine=null;//存储生成的实例
var ln=0;//当前选中状态
var arr=[[9,9,10],[16,16,40],[16,30,99]];//游戏难度
for(let i=0;i<btns.length-1;i++){//闭包，for循环推荐使用let
    btns[i].onclick=function (){
        btns[ln].className='';
        this.className='active';
        mine=new Mine(arr[i][0],arr[i][1],arr[i][2]);
        mine.init();
        ln=i;
    }

}
//计时器
var time = document.getElementById('time'); //计时器
var timer = setInterval(function () {
    let seconds = (parseFloat(time.innerHTML) + 0.1).toFixed(1); //保留一位小数
    time.innerHTML = seconds;




}, 100)
//启动界面默认初始化难度为容易
btns[0].onclick();
//刷新界面，重新开始游戏
btns[3].onclick=function (){
    mine.init();
    clearTimeout(timer);


}//遗留bug：重新开始游戏时地雷计数器无法初始化（已解决）
//var mine=new Mine(9,9,5);
//mine.init();
//console.log(mine.getAround(mine.squares[0][0]));
