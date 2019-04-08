//将utils定义为window对象下的一个属性，属性值为对象
window.utils = {};

//在utils对象上定义捕获坐标的方法
window.utils.captureMouse = function(element){
    //定义一个名为mouse的对象
    var mouse = {x:0,y:0};
   
    //为元素绑定mousemove事件
    element.addEventListener('mousemove',function(event){
        var x,y;
   
        //获取鼠标位于当前屏幕的位置， 并作兼容处理
        if(event.pageX||event.pageY){
            x = event.pageX;
            y = event.pageY;
        } else {
            x = event.clientX + document.body.scrollLeft +document.documentElement.scrollLeft;
            y = event.clientY + document.body.scrollTop +document.documentElement.scrollTop;
        }
        // 将当前的坐标值减去元素的偏移位置，即为鼠标位于当前canvas的位置
        x -= element.offsetLeft;
        y -= element.offsetTop;

        mouse.x = x;
        mouse.y = y;
    }, false);
    // 返回值为mouse对象
    return mouse;
}
